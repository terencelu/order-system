let defaultMenu = [{ id: Date.now(), name: "原味", price: 50 }];
let menu = JSON.parse(localStorage.getItem('myMenu')) || defaultMenu;
let isDevMode = false;
let currentSelectItem = null;

// 客人名稱初始化 (預設值)
let customerName = localStorage.getItem('customerName') || "窩母雞抖壓@@";
document.getElementById('customer-name-btn').innerText = "客人名稱：" + customerName;

// --- 客人名稱功能 ---
function openCustomerModal() {
    document.getElementById('customer-name-input').value = (customerName === "窩母雞抖壓@@") ? "" : customerName;
    document.getElementById('customer-modal').style.display = "block";
}

function closeCustomerModal() {
    document.getElementById('customer-modal').style.display = "none";
}

function saveCustomerName() {
    const val = document.getElementById('customer-name-input').value.trim();
    customerName = val ? val : "窩母雞抖壓@@";
    localStorage.setItem('customerName', customerName);
    document.getElementById('customer-name-btn').innerText = "客人名稱：" + customerName;
    closeCustomerModal();
}

function deleteCustomerName() {
    customerName = "窩母雞抖壓@@";
    localStorage.removeItem('customerName');
    document.getElementById('customer-name-btn').innerText = "客人名稱：" + customerName;
    closeCustomerModal();
}

// --- 菜單渲染 ---
function toggleMode() {
    isDevMode = !isDevMode;
    
    // 1. 控制開發者面板顯示
    document.getElementById('dev-section').style.display = isDevMode ? 'block' : 'none';
    
    // 2. 控制右下角 Cookie 按鈕顯示 (關鍵改動)
    document.getElementById('cookie-btn').style.display = isDevMode ? 'block' : 'none';
    
    // 3. 更新上方按鈕狀態
    const btn = document.getElementById('mode-status');
    btn.innerText = isDevMode ? "開發模式" : "點餐模式";
    
    // 重新渲染菜單（確保刪除按鈕正確顯示）
    renderMenu();
}

function renderMenu() {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = "";
    menu.forEach((item, index) => {
        menuDiv.innerHTML += `
            <div class="menu-item" onclick="handleItemClick(${index})">
                <span>${item.name} - $${item.price}</span>
                ${isDevMode ? `<button class="btn-clear" style="padding:5px" onclick="event.stopPropagation(); deleteMenuItem(${index})">刪除</button>` : ''}
            </div>`;
    });
}

function handleItemClick(index) {
    if (isDevMode) return;
    currentSelectItem = menu[index];
    document.getElementById('modal-item-name').innerText = currentSelectItem.name;
    document.getElementById('modal-item-price').innerText = currentSelectItem.price;
    document.getElementById('modal-qty').value = 1;
    document.getElementById('order-modal').style.display = "block";
}

// --- 點餐邏輯 ---
function closeModal() { document.getElementById('order-modal').style.display = "none"; }
function changeQty(amt) {
    const input = document.getElementById('modal-qty');
    let v = parseInt(input.value) + amt;
    input.value = v < 1 ? 1 : v;
}

function confirmAddToCart() {
    const qty = parseInt(document.getElementById('modal-qty').value);
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const idx = cart.findIndex(i => i.id === currentSelectItem.id);
    if (idx > -1) cart[idx].qty += qty;
    else cart.push({ ...currentSelectItem, qty: qty });
    localStorage.setItem('myCart', JSON.stringify(cart));
    renderCart();
    closeModal();
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const list = document.getElementById('cart-list');
    let total = 0;
    list.innerHTML = "";
    cart.forEach(item => {
        list.innerHTML += `<li>${item.name} x ${item.qty} = $${item.price * item.qty}</li>`;
        total += item.price * item.qty;
    });
    document.getElementById('total-price').innerText = total;
}

// --- 管理功能 ---
function addMenuItem() {
    const n = document.getElementById('new-item-name').value;
    const p = parseInt(document.getElementById('new-item-price').value);
    if (n && p) {
        menu.push({ id: Date.now(), name: n, price: p });
        localStorage.setItem('myMenu', JSON.stringify(menu));
        renderMenu();
    }
}
function deleteMenuItem(i) {
    menu.splice(i, 1);
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderMenu();
}

function showLocalStorage() {
    const list = document.getElementById('cookie-data-list');
    const cartData = JSON.parse(localStorage.getItem('myCart') || "[]");
    let html = "<b>菜單資料：</b>";
    menu.forEach((item, i) => html += `<div class='cookie-item'>${item.name} <button onclick="deleteCookieItem('menu',${i})">X</button></div>`);
    html += "<br><b>購物車資料：</b>";
    cartData.forEach((item, i) => html += `<div class='cookie-item'>${item.name} x ${item.qty} <button onclick="deleteCookieItem('cart',${i})">X</button></div>`);
    list.innerHTML = html;
    document.getElementById('cookie-modal').style.display = "block";
}

function closeCookieModal() { document.getElementById('cookie-modal').style.display = "none"; }

function deleteCookieItem(type, i) {
    if (type === 'menu') {
        menu.splice(i, 1);
        localStorage.setItem('myMenu', JSON.stringify(menu));
        renderMenu();
    } else {
        let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
        cart.splice(i, 1);
        localStorage.setItem('myCart', JSON.stringify(cart));
        renderCart();
    }
    showLocalStorage();
}

function clearAllData() { if(confirm("確定清空所有數據？")) { localStorage.clear(); location.reload(); } }
function clearCart() { localStorage.removeItem('myCart'); renderCart(); }

function checkout() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    if (cart.length === 0) return alert("尚未點餐！");
    let msg = `【訂單紀錄】\n客人：${customerName}\n----------\n`;
    cart.forEach(item => msg += `${item.name} x ${item.qty} = $${item.price * item.qty}\n`);
    alert(msg + "\n總額：$" + document.getElementById('total-price').innerText);
}

renderMenu();
renderCart();