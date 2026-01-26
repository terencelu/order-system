let defaultMenu = [{ id: Date.now(), name: "原味", price: 50 }];
let menu = JSON.parse(localStorage.getItem('myMenu')) || defaultMenu;
let isDevMode = false;
let currentSelectItem = null; // 暫存目前選中的產品資訊

// 1. 模式切換
function toggleMode() {
    isDevMode = !isDevMode;
    document.getElementById('dev-section').style.display = isDevMode ? 'block' : 'none';
    document.getElementById('mode-status').innerText = isDevMode ? "開發者" : "使用者";
    document.getElementById('mode-status').style = isDevMode ? "background: white; color: #666;" : "background: #666; color: white;";
    renderMenu();
}

// 2. 渲染菜單
function renderMenu() {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = "";
    menu.forEach((item, index) => {
        menuDiv.innerHTML += `
            <div class="menu-item" onclick="handleItemClick(${index})">
                <span>${item.name} - $${item.price}</span>
                ${isDevMode ? `<button class="btn-clear" onclick="event.stopPropagation(); deleteMenuItem(${index})">刪除</button>` : ''}
            </div>
        `;
    });
}

function handleItemClick(index) {
    if (isDevMode) return; // 開發者模式不跳彈窗
    openModal(menu[index]);
}

// 3. 彈窗邏輯
function openModal(item) {
    currentSelectItem = item;
    document.getElementById('modal-item-name').innerText = item.name;
    document.getElementById('modal-item-price').innerText = item.price;
    document.getElementById('modal-qty').value = 1;
    document.getElementById('order-modal').style.display = "block";
}

function closeModal() {
    document.getElementById('order-modal').style.display = "none";
}

function changeQty(amt) {
    const qtyInput = document.getElementById('modal-qty');
    let newQty = parseInt(qtyInput.value) + amt;
    if (newQty < 1) newQty = 1;
    qtyInput.value = newQty;
}

// 4. 購物車邏輯（支援數量合併）
function confirmAddToCart() {
    const qty = parseInt(document.getElementById('modal-qty').value);
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    
    // 檢查購物車內是否有相同 ID 的商品
    const existingIndex = cart.findIndex(item => item.id === currentSelectItem.id);
    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({ ...currentSelectItem, qty: qty });
    }
    
    localStorage.setItem('myCart', JSON.stringify(cart));
    renderCart();
    closeModal();
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const cartList = document.getElementById('cart-list');
    const totalSpan = document.getElementById('total-price');
    cartList.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        cartList.innerHTML += `<li>${item.name} x ${item.qty} - $${itemTotal}</li>`;
        total += itemTotal;
    });
    totalSpan.innerText = total;
}

// 5. 開發者面板功能
function addMenuItem() {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    if (name && price) {
        menu.push({ id: Date.now(), name, price });
        saveMenu();
        document.getElementById('new-item-name').value = '';
        document.getElementById('new-item-price').value = '';
    } else { alert("請輸入品項名稱與價格"); }
}

function deleteMenuItem(index) {
    menu.splice(index, 1);
    saveMenu();
}

function saveMenu() {
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderMenu();
}

function clearCart() {
    localStorage.removeItem('myCart');
    renderCart();
}

function checkout() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    if (cart.length === 0) return alert("購物車還空空的喔！");
    let msg = "訂單明細：\n";
    cart.forEach(item => msg += `${item.name} x ${item.qty} = $${item.price * item.qty}\n`);
    alert(msg + "\n總計：$" + document.getElementById('total-price').innerText);
}

// 初始化
renderMenu();
renderCart();