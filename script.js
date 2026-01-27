let menu = JSON.parse(localStorage.getItem('myMenu')) || [{ id: Date.now(), name: "原味", price: 50 }];
let orders = JSON.parse(localStorage.getItem('myOrders')) || []; // 訂單紀錄
let isDevMode = false;
let currentItemIdx = null; 
let currentOrderIdx = null; // 正在管理的訂單索引

// 初始化資料
let customerName = localStorage.getItem('customerName') || "新客人";
let defaultPrefix = localStorage.getItem('defaultPrefix') || "客人";
let serialNumber = parseInt(localStorage.getItem('serialNumber')) || 1;

const nameInputMain = document.getElementById('customer-name-input-main');
nameInputMain.value = customerName;

// --- 模式與基礎 ---
function toggleMode() {
    isDevMode = !isDevMode;
    document.getElementById('mode-status').innerText = isDevMode ? "開發模式" : "點餐模式";
    nameInputMain.disabled = isDevMode;
    document.getElementById('dev-serial-set').style.display = isDevMode ? 'flex' : 'none';
    document.getElementById('dev-add-item').style.display = isDevMode ? 'block' : 'none';
    renderMenu();
}

// --- 客人與流水號 ---
function manualUpdateName() {
    customerName = nameInputMain.value;
    localStorage.setItem('customerName', customerName);
}
function saveSerialSettings() {
    defaultPrefix = document.getElementById('default-prefix-input').value;
    serialNumber = parseInt(document.getElementById('serial-num-input').value) || 1;
    localStorage.setItem('defaultPrefix', defaultPrefix);
    localStorage.setItem('serialNumber', serialNumber);
    refreshCustomer();
}
function refreshCustomer() {
    customerName = defaultPrefix + serialNumber;
    nameInputMain.value = customerName;
    localStorage.setItem('customerName', customerName);
}

// --- 點餐功能 ---
function renderMenu() {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = menu.map((item, index) => `
        <div class="menu-item" onclick="handleItemClick(${index})">
            <span>${item.name} - $${item.price}</span>
            ${isDevMode ? '<span style="color:#ff9800">✏️</span>' : ''}
        </div>`).join("");
}
function handleItemClick(index) {
    currentItemIdx = index;
    if (isDevMode) {
        document.getElementById('edit-item-name').value = menu[index].name;
        document.getElementById('edit-item-price').value = menu[index].price;
        document.getElementById('edit-item-modal').style.display = "block";
    } else {
        document.getElementById('modal-item-name').innerText = menu[index].name;
        document.getElementById('modal-qty').value = 1;
        document.getElementById('order-modal').style.display = "block";
    }
}

// --- 購物車與結帳 ---
function confirmAddToCart() {
    const qty = parseInt(document.getElementById('modal-qty').value);
    const item = menu[currentItemIdx];
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const idx = cart.findIndex(c => c.name === item.name);
    if (idx > -1) cart[idx].qty += qty;
    else cart.push({ ...item, qty: qty });
    localStorage.setItem('myCart', JSON.stringify(cart));
    renderCart();
    document.getElementById('order-modal').style.display = "none";
}
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const list = document.getElementById('cart-list');
    let total = 0;
    list.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `<li>${item.name} x ${item.qty} = $${item.price * item.qty}</li>`;
    }).join("");
    document.getElementById('total-price').innerText = total;
}
function checkout() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    if (cart.length === 0) return alert("目前沒有內容");

    // 建立訂單紀錄
    const orderDetails = cart.map(i => `${i.name}x${i.qty}`).join(", ");
    const totalPrice = document.getElementById('total-price').innerText;
    
    const newOrder = {
        name: customerName,
        content: orderDetails,
        price: totalPrice,
        status: "製作中", // 預設狀態
        timestamp: Date.now()
    };

    orders.unshift(newOrder); // 新訂單在最上面
    localStorage.setItem('myOrders', JSON.stringify(orders));
    
    // 跳號與清空
    serialNumber++;
    localStorage.setItem('serialNumber', serialNumber);
    refreshCustomer();
    localStorage.removeItem('myCart');
    renderCart();
    renderOrders();
}

// --- 訂單紀錄管理 ---
function renderOrders() {
    const list = document.getElementById('history-list');
    list.innerHTML = orders.map((o, i) => `
        <div class="history-item ${o.status === '製作中' ? 'status-working' : 'status-done'}" onclick="openOrderStatus(${i})">
            <div>
                <b>${o.name}</b> <small>($${o.price})</small><br>
                <span>${o.content}</span>
            </div>
            <span class="status-badge">${o.status}</span>
        </div>`).join("");
}

function openOrderStatus(index) {
    currentOrderIdx = index;
    const o = orders[index];
    document.getElementById('status-edit-name').value = o.name;
    document.getElementById('status-edit-content').value = o.content;
    document.getElementById('status-edit-price').value = o.price;
    document.getElementById('btn-toggle-status').innerText = `切換為: ${o.status === '製作中' ? '製作完成' : '製作中'}`;
    document.getElementById('order-status-modal').style.display = "block";
}

function toggleOrderStatus() {
    const o = orders[currentOrderIdx];
    o.status = (o.status === "製作中") ? "製作完成" : "製作中";
    localStorage.setItem('myOrders', JSON.stringify(orders));
    renderOrders();
    closeStatusModal();
}

function saveOrderEdit() {
    const o = orders[currentOrderIdx];
    o.name = document.getElementById('status-edit-name').value;
    o.content = document.getElementById('status-edit-content').value;
    o.price = document.getElementById('status-edit-price').value;
    localStorage.setItem('myOrders', JSON.stringify(orders));
    renderOrders();
    closeStatusModal();
}

function deleteOrderRecord() {
    if(confirm("確定刪除此紀錄？")) {
        orders.splice(currentOrderIdx, 1);
        localStorage.setItem('myOrders', JSON.stringify(orders));
        renderOrders();
        closeStatusModal();
    }
}

function closeStatusModal() { document.getElementById('order-status-modal').style.display = "none"; }
function closeModal() { document.getElementById('order-modal').style.display = "none"; }
function changeQty(amt) {
    let input = document.getElementById('modal-qty');
    input.value = Math.max(1, parseInt(input.value) + amt);
}
function clearCart() { localStorage.removeItem('myCart'); renderCart(); }

// 菜單編輯與新增 (同前)
function closeEditModal() { document.getElementById('edit-item-modal').style.display = "none"; }
function saveMenuEdit() {
    menu[currentItemIdx].name = document.getElementById('edit-item-name').value;
    menu[currentItemIdx].price = document.getElementById('edit-item-price').value;
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderMenu(); closeEditModal();
}
function addMenuItem() {
    const n = document.getElementById('new-item-name').value;
    const p = document.getElementById('new-item-price').value;
    if (n && p) {
        menu.push({ id: Date.now(), name: n, price: p });
        localStorage.setItem('myMenu', JSON.stringify(menu));
        document.getElementById('new-item-name').value = "";
        document.getElementById('new-item-price').value = "";
        renderMenu();
    }
}

renderMenu();
renderCart();
renderOrders();
