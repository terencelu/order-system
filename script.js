let menu = JSON.parse(localStorage.getItem('myMenu')) || [
    { id: Date.now(), name: "經典藍莓", price: 100 },
    { id: Date.now(), name: "蘋果肉桂", price: 100 },
    { id: Date.now(), name: "濃醇可可", price: 100 },
    { id: Date.now(), name: "奧利濃黑", price: 100 },
    { id: Date.now(), name: "焦糖海鹽", price: 100 },
    { id: Date.now(), name: "開心堅果", price: 100 },
];
let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
let isDevMode = false;
let currentItemIdx = null;
let currentOrderIdx = null;

let customerName = localStorage.getItem('customerName') || "新客人";
let defaultPrefix = localStorage.getItem('defaultPrefix') || "客人";
let serialNumber = parseInt(localStorage.getItem('serialNumber')) || 1;

const nameInputMain = document.getElementById('customer-name-input-main');
nameInputMain.value = customerName;

function toggleMode() {
    isDevMode = !isDevMode;
    document.getElementById('mode-status').innerText = isDevMode ? "開發模式" : "點餐模式";
    nameInputMain.disabled = isDevMode;
    document.getElementById('dev-section').style.display = isDevMode ? 'block' : 'none';
    document.getElementById('cookie-btn').style.display = isDevMode ? 'block' : 'none';
    if (isDevMode) {
        document.getElementById('default-prefix-input').value = defaultPrefix;
        document.getElementById('serial-num-input').value = serialNumber;
    }
    renderMenu();
}

function manualUpdateName() {
    customerName = nameInputMain.value;
    localStorage.setItem('customerName', customerName);
}

function saveSerialSettings() {
    defaultPrefix = document.getElementById('default-prefix-input').value || "客人";
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

function renderMenu() {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = menu.map((item, index) => `
        <div class="menu-item" onclick="handleItemClick(${index})">
            <b>${item.name}</b><br>$${item.price}
            ${isDevMode ? '<div style="font-size:12px;color:var(--warning)">✏️編輯</div>' : ''}
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

function confirmAddToCart() {
    const qty = parseInt(document.getElementById('modal-qty').value);
    const item = menu[currentItemIdx];
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const idx = cart.findIndex(c => c.name === item.name);
    if (idx > -1) cart[idx].qty += qty;
    else cart.push({ ...item, qty: qty });
    localStorage.setItem('myCart', JSON.stringify(cart));
    renderCart();
    closeModal();
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    let total = 0;
    document.getElementById('cart-list').innerHTML = cart.map(i => {
        total += i.price * i.qty;
        return `<li><span>${i.name} x ${i.qty}</span><span>$${i.price * i.qty}</span></li>`;
    }).join("");
    document.getElementById('total-price').innerText = total;
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    if (cart.length === 0) return alert("清單是空的");
    const newOrder = {
        name: customerName,
        content: cart.map(i => `${i.name}x${i.qty}`).join(", "),
        price: document.getElementById('total-price').innerText,
        status: "製作中", timestamp: Date.now()
    };
    orders.unshift(newOrder);
    localStorage.setItem('myOrders', JSON.stringify(orders));
    serialNumber++;
    localStorage.setItem('serialNumber', serialNumber);
    refreshCustomer();
    clearCart();
    renderOrders();
}

function renderOrders() {
    document.getElementById('history-list').innerHTML = orders.map((o, i) => `
        <div class="history-item ${o.status === '製作中' ? 'status-working' : 'status-done'}" onclick="openOrderStatus(${i})">
            <div><b>${o.name}</b> <small>$${o.price}</small><br><span style="font-size:13px">${o.content}</span></div>
            <span style="font-size:12px; font-weight:bold">${o.status}</span>
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
    orders[currentOrderIdx].status = (orders[currentOrderIdx].status === "製作中") ? "製作完成" : "製作中";
    localStorage.setItem('myOrders', JSON.stringify(orders));
    renderOrders(); closeStatusModal();
}

function saveOrderEdit() {
    orders[currentOrderIdx].name = document.getElementById('status-edit-name').value;
    orders[currentOrderIdx].content = document.getElementById('status-edit-content').value;
    orders[currentOrderIdx].price = document.getElementById('status-edit-price').value;
    localStorage.setItem('myOrders', JSON.stringify(orders));
    renderOrders(); closeStatusModal();
}

function deleteOrderRecord() {
    if(confirm("刪除此紀錄？")) { orders.splice(currentOrderIdx, 1); localStorage.setItem('myOrders', JSON.stringify(orders)); renderOrders(); closeStatusModal(); }
}

function addMenuItem() {
    const n = document.getElementById('new-item-name').value;
    const p = document.getElementById('new-item-price').value;
    if (n && p) { menu.push({ id: Date.now(), name: n, price: p }); localStorage.setItem('myMenu', JSON.stringify(menu)); renderMenu(); }
}

function confirmDeleteMenu() {
    if(confirm("刪除口味？")) { menu.splice(currentItemIdx, 1); localStorage.setItem('myMenu', JSON.stringify(menu)); renderMenu(); closeEditModal(); }
}

function saveMenuEdit() {
    menu[currentItemIdx].name = document.getElementById('edit-item-name').value;
    menu[currentItemIdx].price = document.getElementById('edit-item-price').value;
    localStorage.setItem('myMenu', JSON.stringify(menu)); renderMenu(); closeEditModal();
}

function showLocalStorage() {
    if(confirm(`目前有 ${menu.length} 個口味與 ${orders.length} 筆紀錄。\n是否重置整個系統？`)) { localStorage.clear(); location.reload(); }
}

function closeModal() { document.getElementById('order-modal').style.display = "none"; }
function closeEditModal() { document.getElementById('edit-item-modal').style.display = "none"; }
function closeStatusModal() { document.getElementById('order-status-modal').style.display = "none"; }
function changeQty(amt) { let input = document.getElementById('modal-qty'); input.value = Math.max(1, parseInt(input.value) + amt); }
function clearCart() { localStorage.removeItem('myCart'); renderCart(); }

renderMenu(); renderCart(); renderOrders();