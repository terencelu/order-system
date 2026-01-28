let menu = JSON.parse(localStorage.getItem('myMenu')) || [
    { name: "經典藍莓", price: 100 }, { name: "蘋果肉桂", price: 100 },
    { name: "濃醇可可", price: 100 }, { name: "奧利濃黑", price: 100 },
    { name: "焦糖海鹽", price: 100 }, { name: "開心堅果", price: 100 }
];
let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
let sn = parseInt(localStorage.getItem('sn')) || 1;
let isDev = false;
let curItemIdx = null;

function showHomeButtons() { document.getElementById('home-actions').style.display = 'flex'; }
function enterMode(mode, event) {
    if(event) event.stopPropagation();
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    initUserInfo(); renderMenu(); renderCart(); renderOrders();
}

function toggleDev() {
    isDev = !isDev;
    const btn = document.getElementById('dev-toggle-btn');
    btn.innerText = isDev ? "⚙️ 開發者: ON" : "⚙️ 開發者: OFF";
    btn.style.backgroundColor = isDev ? "#ef233c" : "#fff";
    btn.style.color = isDev ? "#fff" : "#000";
    document.querySelectorAll('.dev-only').forEach(el => el.style.display = isDev ? 'block' : 'none');
}

function initUserInfo() {
    const name = localStorage.getItem('curName') || ("顧客" + sn);
    document.getElementById('customer-name-input').value = name;
    document.getElementById('order-customer-preview').innerText = "顧客：" + name;
}

function manualUpdateInfo() {
    const val = document.getElementById('customer-name-input').value;
    localStorage.setItem('curName', val);
    document.getElementById('order-customer-preview').innerText = "顧客：" + val;
}

function setQty(v) {
    const inp = document.getElementById('modal-qty');
    if (v === 'clear') { inp.value = 1; }
    else { inp.value = (inp.value === "1") ? v : inp.value + v; }
}

function renderMenu() {
    document.getElementById('menu-grid').innerHTML = menu.map((m,i)=>`
        <div onclick="handleItemAction(${i})" style="padding:20px 5px; background:#fff; border:1px solid #eee; border-radius:15px; text-align:center; cursor:pointer; font-weight:bold; border-bottom:5px solid var(--color-blue);">${m.name}<br>$${m.price}</div>`).join("");
}

function handleItemAction(i) {
    curItemIdx = i;
    document.getElementById('modal-item-name').innerText = menu[i].name;
    document.getElementById('modal-qty').value = 1;
    document.getElementById('order-modal').style.display = 'flex';
}

function confirmAddToCart() {
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    cart.push({ name: menu[curItemIdx].name, qty: parseInt(document.getElementById('modal-qty').value), price: menu[curItemIdx].price });
    localStorage.setItem('myCart', JSON.stringify(cart)); renderCart(); closeModal();
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    let t = 0;
    document.getElementById('cart-list').innerHTML = cart.map(c => {
        t += c.price * c.qty;
        return `<li style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed #ddd; font-size:18px;"><b>${c.name} x ${c.qty}</b><span>$${c.price * c.qty}</span></li>`
    }).join("");
    document.getElementById('total-price').innerText = t;
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    if(!cart.length) return alert("購物車空的喔！");
    const now = new Date();
    orders.unshift({ 
        name: localStorage.getItem('curName'), 
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`, 
        content: cart.map(c=>`${c.name}x${c.qty}`).join(", "), 
        total: document.getElementById('total-price').innerText, 
        status: "製作中" 
    });
    sn++; localStorage.setItem('sn', sn); localStorage.setItem('myOrders', JSON.stringify(orders));
    localStorage.removeItem('myCart'); localStorage.setItem('curName', "顧客" + sn);
    renderCart(); renderOrders(); initUserInfo();
}

function renderOrders() {
    document.getElementById('history-list').innerHTML = orders.map((o, i) => `
        <div class="order-card ${o.status}" onclick="toggleStatus(${i})">
            <div style="display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2;">
                <b style="font-size:24px;">${o.name}</b>
                <span style="font-size:22px; font-weight:900;">$${o.total}</span>
            </div>
            <div style="font-size:18px; font-weight:bold; margin:10px 0; position:relative; z-index:2;">${o.content}</div>
            <div class="watermark">${o.status}</div>
        </div>`).join("");
}

function toggleStatus(i) {
    orders[i].status = (orders[i].status === "製作中") ? "製作完成" : "製作中";
    localStorage.setItem('myOrders', JSON.stringify(orders)); renderOrders();
}

function addMenuItem() {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    if (!name || !price) return alert("請輸入口味與價格");
    menu.push({ name, price }); localStorage.setItem('myMenu', JSON.stringify(menu));
    renderMenu(); document.getElementById('new-item-name').value = ''; document.getElementById('new-item-price').value = '';
}

function resetSN() { if(confirm("確定重置流水號？")) { sn = 1; localStorage.setItem('sn', 1); localStorage.setItem('curName', "顧客1"); initUserInfo(); } }
function clearCart() { localStorage.removeItem('myCart'); renderCart(); }
function closeModal() { document.getElementById('order-modal').style.display = 'none'; }