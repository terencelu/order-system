let menu = JSON.parse(localStorage.getItem('myMenu')) || [
    { id: Date.now(), name: "經典藍莓", price: 100 },
    { id: Date.now(), name: "蘋果肉桂", price: 100 },
    { id: Date.now(), name: "濃醇可可", price: 100 },
    { id: Date.now(), name: "奧利濃黑", price: 100 },
    { id: Date.now(), name: "焦糖海鹽", price: 100 },
    { id: Date.now(), name: "開心堅果", price: 100 },
];
let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
let isDev = false;
let curItemIdx = null;

// 初始化名稱
const nameInput = document.getElementById('customer-name-input');
let curName = localStorage.getItem('curName') || "新客人";
let prefix = localStorage.getItem('prefix') || "客人";
let sn = parseInt(localStorage.getItem('sn')) || 1;
nameInput.value = curName;

function toggleMode() {
    isDev = !isDev;
    document.getElementById('mode-status').innerText = isDev ? "👤 使用者模式" : "⚙️ 開發者模式";
    document.getElementById('user-name-ui').style.display = isDev ? 'none' : 'block';
    document.getElementById('dev-name-ui').style.display = isDev ? 'block' : 'none';
    document.getElementById('dev-menu-ui').style.display = isDev ? 'block' : 'none';
    document.getElementById('cookie-btn').style.display = isDev ? 'block' : 'none';
    
    if(isDev) {
        document.getElementById('default-prefix-input').value = prefix;
        document.getElementById('serial-num-input').value = sn;
    }
    renderMenu();
    renderOrders();
}

function manualUpdateName() {
    curName = nameInput.value;
    localStorage.setItem('curName', curName);
}

function saveSerialSettings() {
    prefix = document.getElementById('default-prefix-input').value || "客人";
    sn = parseInt(document.getElementById('serial-num-input').value) || 1;
    localStorage.setItem('prefix', prefix);
    localStorage.setItem('sn', sn);
    curName = prefix + sn;
    nameInput.value = curName;
    localStorage.setItem('curName', curName);
    alert("名稱規則已儲存");
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = menu.map((m, i) => `
        <div class="menu-item" onclick="handleItemClick(${i})">
            <b>${m.name}</b>$${m.price}
            ${isDev ? '<div style="font-size:10px; color:var(--warning); margin-top:5px">✏️編輯</div>' : ''}
        </div>`).join("");
}

function handleItemClick(i) {
    curItemIdx = i;
    if(isDev) {
        document.getElementById('edit-name').value = menu[i].name;
        document.getElementById('edit-price').value = menu[i].price;
        document.getElementById('edit-modal').style.display = 'block';
    } else {
        document.getElementById('modal-item-name').innerText = menu[i].name;
        document.getElementById('modal-qty').value = 1;
        document.getElementById('order-modal').style.display = 'block';
    }
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    if(!cart.length) return alert("請先點餐");
    
    const order = {
        name: curName,
        content: cart.map(c => `${c.name}x${c.qty}`).join(", "),
        total: document.getElementById('total-price').innerText,
        status: "製作中",
        id: Date.now()
    };
    
    orders.unshift(order);
    localStorage.setItem('myOrders', JSON.stringify(orders));
    
    // 跳號邏輯
    sn++;
    localStorage.setItem('sn', sn);
    curName = prefix + sn;
    nameInput.value = curName;
    localStorage.setItem('curName', curName);
    
    clearCart();
    renderOrders();
}

function renderOrders() {
    const list = document.getElementById('history-list');
    document.getElementById('history-count').innerText = orders.length;
    list.innerHTML = orders.map((o, i) => `
        <div class="history-item ${o.status}" onclick="handleOrderAction(${i})">
            <div style="display:flex; justify-content:space-between; font-weight:bold">
                <span>${o.name}</span> <span>$${o.total}</span>
            </div>
            <div style="font-size:13px; color:#666; margin:5px 0">${o.content}</div>
            <div style="font-size:11px; font-weight:bold; color:${o.status==='製作中'?'var(--warning)':'var(--success)'}">${o.status}</div>
            ${isDev ? '<div style="text-align:right; color:var(--danger); font-size:11px">點擊刪除</div>' : ''}
        </div>`).join("");
}

function handleOrderAction(i) {
    if(isDev) {
        if(confirm("確定刪除此筆紀錄？")) {
            orders.splice(i, 1);
            localStorage.setItem('myOrders', JSON.stringify(orders));
            renderOrders();
        }
    } else {
        orders[i].status = (orders[i].status === "製作中") ? "製作完成" : "製作中";
        localStorage.setItem('myOrders', JSON.stringify(orders));
        renderOrders();
    }
}

function addMenuItem() {
    const n = document.getElementById('new-item-name').value;
    const p = document.getElementById('new-item-price').value;
    if(n && p) {
        menu.push({ id: Date.now(), name: n, price: p });
        localStorage.setItem('myMenu', JSON.stringify(menu));
        document.getElementById('new-item-name').value = "";
        document.getElementById('new-item-price').value = "";
        renderMenu();
    }
}

function deleteMenu() {
    if(confirm("確定刪除此口味？")) {
        menu.splice(curItemIdx, 1);
        localStorage.setItem('myMenu', JSON.stringify(menu));
        renderMenu();
        closeModal();
    }
}

function saveMenuEdit() {
    menu[curItemIdx].name = document.getElementById('edit-name').value;
    menu[curItemIdx].price = document.getElementById('edit-price').value;
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderMenu();
    closeModal();
}

// 通用功能
function closeModal() { 
    document.getElementById('order-modal').style.display = 'none'; 
    document.getElementById('edit-modal').style.display = 'none'; 
}
function changeQty(v) { 
    const input = document.getElementById('modal-qty');
    input.value = Math.max(1, parseInt(input.value) + v);
}
function confirmAddToCart() {
    const q = parseInt(document.getElementById('modal-qty').value);
    const item = menu[curItemIdx];
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    cart.push({ name: item.name, qty: q, price: item.price });
    localStorage.setItem('myCart', JSON.stringify(cart));
    renderCart(); closeModal();
}
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    let t = 0;
    document.getElementById('cart-list').innerHTML = cart.map(c => {
        t += c.price * c.qty;
        return `<li><span>${c.name} x ${c.qty}</span><span>$${c.price * c.qty}</span></li>`;
    }).join("");
    document.getElementById('total-price').innerText = t;
}
function clearCart() { localStorage.removeItem('myCart'); renderCart(); }
function showLocalStorage() { if(confirm("重置所有資料？")) { localStorage.clear(); location.reload(); } }
window.onclick = function(e) { if (e.target.className === 'modal') closeModal(); }

renderMenu(); renderCart(); renderOrders();