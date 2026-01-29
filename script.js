let menu = JSON.parse(localStorage.getItem('myMenu')) || [
    { name: "經典藍莓", price: 100 }, { name: "蘋果肉桂", price: 100 },
    { name: "濃醇可可", price: 100 }, { name: "奧利濃黑", price: 100 },
    { name: "焦糖海鹽", price: 100 }, { name: "開心堅果", price: 100 }
];
let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
let sn = parseInt(localStorage.getItem('sn')) || 1;

let fastCart = [];
let normalCart = [];
let selectedItem = null;
let flavorChart = null;
let timeChart = null;

// --- 介面管理：核心修正 ---
function showHomeButtons() { 
    document.getElementById('home-actions').style.display = 'flex'; 
}

function enterMode(mode, event) {
    if(event) event.stopPropagation();
    
    // 1. 切換螢幕
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');

    // 2. 隱藏所有容器，只顯示目標
    document.querySelectorAll('.mode-container').forEach(el => el.style.display = 'none');
    document.getElementById(`container-${mode}`).style.display = 'block';

    // 3. 初始化各模式數據
    if(mode === 'fast') { renderFastMenu(); updateFastUI(); }
    if(mode === 'normal') { renderNormalMenu(); renderNormalCart(); syncPreview(); }
    if(mode === 'analysis') setTimeout(renderAnalysis, 200);
    
    renderAllHistory();
}

// --- 彈窗系統 ---
function openModal(zone) {
    document.getElementById('global-modal').style.display = 'flex';
    document.getElementById('modal-qty-zone').style.display = (zone === 'qty') ? 'block' : 'none';
    document.getElementById('modal-confirm-zone').style.display = (zone === 'confirm') ? 'block' : 'none';
}
function closeModal() { document.getElementById('global-modal').style.display = 'none'; }

// --- ⚡ 快速模式 ---
function renderFastMenu() {
    document.getElementById('fast-menu-grid').innerHTML = menu.map((m, i) => `
        <div onclick="addFast(${i})" class="card" style="cursor:pointer; text-align:center; font-weight:bold; border-bottom:6px solid var(--blue); margin:0;">
            ${m.name}<br>$${m.price}
        </div>`).join("");
}
function addFast(idx) {
    const item = menu[idx];
    const exist = fastCart.find(c => c.name === item.name);
    if(exist) exist.qty++; else fastCart.push({ name: item.name, price: item.price, qty: 1 });
    updateFastUI();
}
function updateFastUI() {
    let total = 0;
    document.getElementById('fast-cart-list').innerHTML = fastCart.map(c => {
        total += c.price * c.qty;
        return `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;"><b>${c.name} x ${c.qty}</b><span>$${c.price*c.qty}</span></div>`;
    }).join("");
    document.getElementById('fast-total-price').innerText = total;
}
function openFastConfirm(type) {
    openModal('confirm');
    const title = document.getElementById('fast-confirm-title');
    const btn = document.getElementById('fast-execute-btn');
    if(type === 'clear') {
        title.innerText = "確定清空目前點餐？";
        btn.style.background = "#ef233c"; btn.onclick = () => { fastCart = []; updateFastUI(); closeModal(); };
    } else {
        title.innerText = "確認快速出單？";
        btn.style.background = "#1b8d52"; btn.onclick = checkoutFast;
    }
}
function checkoutFast() {
    if(!fastCart.length) return;
    const now = new Date();
    orders.unshift({
        name: "快速-" + sn++,
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`,
        content: fastCart.map(c => `${c.name}x${c.qty}`).join(", "),
        total: document.getElementById('fast-total-price').innerText,
        status: "製作完成"
    });
    saveAndRefresh(); fastCart = []; updateFastUI(); closeModal();
}

// --- 🍕 一般模式 ---
function renderNormalMenu() {
    document.getElementById('normal-menu-grid').innerHTML = menu.map((m, i) => `
        <div onclick="prepNormal(${i})" class="card" style="cursor:pointer; text-align:center; font-weight:bold; border-bottom:6px solid var(--blue); margin:0;">
            ${m.name}<br>$${m.price}
        </div>`).join("");
}
function prepNormal(idx) {
    selectedItem = menu[idx];
    document.getElementById('target-item-name').innerText = selectedItem.name;
    document.getElementById('target-qty').value = 1;
    openModal('qty');
}
function pressNum(v) {
    const inp = document.getElementById('target-qty');
    if(v === 'C') inp.value = 1; else inp.value = (inp.value === "1") ? v : inp.value + v;
}
function confirmNormalAdd() {
    normalCart.push({ name: selectedItem.name, price: selectedItem.price, qty: parseInt(document.getElementById('target-qty').value) });
    renderNormalCart(); closeModal();
}
function renderNormalCart() {
    let total = 0;
    document.getElementById('normal-cart-list').innerHTML = normalCart.map(c => {
        total += c.price * c.qty;
        return `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed #ddd;"><span>${c.name} x ${c.qty}</span><span>$${c.price*c.qty}</span></div>`;
    }).join("");
    document.getElementById('normal-total-price').innerText = total;
}
function syncPreview() {
    document.getElementById('preview-name').innerText = "顧客：" + (document.getElementById('cust-name').value || ("顧客" + sn));
}
function checkoutNormal() {
    if(!normalCart.length) return;
    const now = new Date();
    orders.unshift({
        name: document.getElementById('cust-name').value || ("顧客" + sn++),
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`,
        content: normalCart.map(c => `${c.name}x${c.qty}`).join(", "),
        total: document.getElementById('normal-total-price').innerText,
        status: "製作中"
    });
    saveAndRefresh(); normalCart = []; document.getElementById('cust-name').value = "";
    renderNormalCart(); syncPreview();
}

// --- 歷史紀錄 ---
function renderAllHistory() {
    const html = orders.map((o, i) => `
        <div class="order-item-card ${o.status}" onclick="toggleStatus(${i})">
            <div style="display:flex; justify-content:space-between; font-weight:bold;"><span>${o.name}</span><span>$${o.total}</span></div>
            <div style="font-size:0.9rem; margin:8px 0;">${o.content}</div>
            <div style="text-align:right; font-size:0.8rem; color:#999;">${o.time} - ${o.status}</div>
        </div>`).join("");
    if(document.getElementById('fast-history-list')) document.getElementById('fast-history-list').innerHTML = html;
    if(document.getElementById('normal-history-list')) document.getElementById('normal-history-list').innerHTML = html;
}
function toggleStatus(i) {
    orders[i].status = (orders[i].status === "製作中") ? "製作完成" : "製作中";
    saveAndRefresh();
}
function saveAndRefresh() {
    localStorage.setItem('sn', sn);
    localStorage.setItem('myOrders', JSON.stringify(orders));
    renderAllHistory();
}

// --- 📊 分析圖表 ---
function renderAnalysis() {
    const total = orders.reduce((s, o) => s + parseInt(o.total || 0), 0);
    document.getElementById('total-revenue').innerText = `$${total}`;

    const fMap = {};
    orders.forEach(o => o.content.split(', ').forEach(s => { const [n, q] = s.split('x'); fMap[n] = (fMap[n] || 0) + parseInt(q); }));
    const sorted = Object.entries(fMap).sort((a,b)=>b[1]-a[1]);
    document.querySelector('#flavor-table tbody').innerHTML = sorted.map(([n, q]) => `<tr><td>${n}</td><td>${q}</td><td>${((q/sorted.reduce((a,b)=>a+b[1],0))*100).toFixed(1)}%</td></tr>`).join('');

    const fCtx = document.getElementById('flavorChart').getContext('2d');
    if(flavorChart) flavorChart.destroy();
    flavorChart = new Chart(fCtx, { type: 'doughnut', data: { labels: sorted.map(s=>s[0]), datasets: [{ data: sorted.map(s=>s[1]), backgroundColor: ['#4361ee', '#2ec4b6', '#f39c12', '#ef233c', '#7209b7'] }] }, options: { maintainAspectRatio: false } });

    const tData = Array(24).fill(0);
    orders.forEach(o => { const h = parseInt(o.time.split(':')[0]); if(!isNaN(h)) tData[h]++; });
    const tCtx = document.getElementById('timeChart').getContext('2d');
    if(timeChart) timeChart.destroy();
    timeChart = new Chart(tCtx, { type: 'bar', data: { labels: Array.from({length: 24}, (_, i) => `${i}時`), datasets: [{ label: '訂單數', data: tData, backgroundColor: 'rgba(67, 97, 238, 0.5)' }] }, options: { maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } });
}

function toggleDev() {
    const btn = document.getElementById('dev-toggle-btn');
    btn.classList.toggle('active');
    btn.innerText = btn.classList.contains('active') ? "⚙️ 開發者: ON" : "⚙️ 開發者: OFF";
}