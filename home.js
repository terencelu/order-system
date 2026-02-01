let menu = JSON.parse(localStorage.getItem('myMenu')) || [
    { name: "經典藍莓", price: 100 }, { name: "蘋果肉桂", price: 100 },
    { name: "濃醇可可", price: 100 }, { name: "奧利濃黑", price: 100 },
    { name: "焦糖海鹽", price: 100 }, { name: "開心堅果", price: 100 }
];
let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
let archives = JSON.parse(localStorage.getItem('myArchives')) || [];
let sn = parseInt(localStorage.getItem('sn')) || 1;
let isArchiveExpanded = false;

let longPressTimer;
let selectedOrderIdx = null;
let currentMode = ''; // 用於紀錄當前模式

let isDevMode = false;

function showHomeButtons() {
    document.getElementById('home-actions').style.display = 'flex';
}

function enterMode(mode, event) {
    currentMode = mode; // 儲存當前進入的模式
    if(event) event.stopPropagation();
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    document.querySelectorAll('.mode-container').forEach(el => el.style.display = 'none');
    document.getElementById(`container-${mode}`).style.display = 'block';

    if(mode === 'fast') initFast();
    if(mode === 'normal') initNormal();
    if(mode === 'analysis') initAnalysis();
    document.getElementById('common-history').style.display = (mode === 'analysis') ? 'none' : 'block';
    renderOrders();
}

function renderOrders() {
    const list = document.getElementById('order-history-list');
    list.innerHTML = orders.map((o, i) => `
        <div class="order-card ${o.status}" 
             onmousedown="startPress(${i})" 
             onmouseup="endPress(${i})" 
             ontouchstart="startPress(${i})" 
             ontouchend="endPress(${i})"
             onclick="handleOrderClick(${i})">
            <b>${o.name}</b> 
            ${o.phone ? `<small style="display:block; color:#666;">📞 ${o.phone}</small>` : ''}
            <span style="float:right;">$${o.total}</span>
            <div style="margin:5px 0;">${o.content}</div>
            <small>${o.time}</small>
            <div class="watermark">${o.status}</div>
        </div>`).join("");
    renderArchives();
}

function handleOrderClick(i) {
    // 只有在不是長按觸發的情況下才切換狀態
    if (!selectedOrderIdx !== null) {
        toggleStatus(i);
    }
}

function startPress(i) {
    longPressTimer = setTimeout(() => {
        if (currentMode === 'fast') {
            selectedOrderIdx = i;
            document.getElementById('order-action-modal').style.display = 'flex';
        }
    }, 800); // 設定長按 800 毫秒觸發
}

function endPress() {
    clearTimeout(longPressTimer);
}

function closeActionModal() {
    document.getElementById('order-action-modal').style.display = 'none';
    selectedOrderIdx = null;
}

function deleteOrder() {
    if (selectedOrderIdx !== null) {
        if (confirm("確定要刪除這筆訂單嗎？")) {
            orders.splice(selectedOrderIdx, 1);
            saveAll();
            closeActionModal();
        }
    }
}

function toggleStatus(i) {
    orders[i].status = (orders[i].status === "製作中") ? "製作完成" : "製作中";
    saveAll();
}

function archiveOrders() {
    const completed = orders.filter(o => o.status === "製作完成");
    if (completed.length === 0) return alert("沒有已完成訂單");
    archives = [...completed, ...archives];
    orders = orders.filter(o => o.status !== "製作完成");
    saveAll();
}

function renderArchives() {
    const list = document.getElementById('archive-list');
    list.innerHTML = archives.map(o => `
        <div class="order-card 歷史" style="opacity: 0.7; cursor: default;">
            <b>${o.name}</b> 
            ${o.phone ? `<small style="display:block; color:#666;">📞 ${o.phone}</small>` : ''}
            <span style="float:right;">$${o.total}</span>
            <div style="margin:5px 0;">${o.content}</div>
            <small>${o.time}</small>
            <div class="watermark" style="font-size: 25px;">歷史</div>
        </div>`).join("");
}

function toggleArchiveCollapse() {
    isArchiveExpanded = !isArchiveExpanded;
    const list = document.getElementById('archive-list');
    const arrow = document.getElementById('archive-arrow');
    if (isArchiveExpanded) {
        list.classList.remove('collapsed-preview');
        list.classList.add('expanded');
        arrow.innerText = "▲";
    } else {
        list.classList.add('collapsed-preview');
        list.classList.remove('expanded');
        arrow.innerText = "▼";
    }
}

function saveAll() {
    localStorage.setItem('myOrders', JSON.stringify(orders));
    localStorage.setItem('myArchives', JSON.stringify(archives));
    localStorage.setItem('sn', sn);
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderOrders();
}

function toggleDevMode() {
    isDevMode = !isDevMode;
    // 背景轉黑
    document.body.style.backgroundColor = isDevMode ? "#1a1a1a" : "var(--bg)";
    document.getElementById('dev-mode-btn').innerText = isDevMode ? "🌙 關閉開發者模式" : "🛠️ 開發者功能";

    // 重新渲染三個部分的內容
    if(typeof initNormal === 'function') initNormal();
    if(typeof initFast === 'function') initFast();
    renderArchives();
}