// 1. 初始化菜單：優先從 LocalStorage 讀取，若無則使用預設值
let defaultMenu = [
    { id: Date.now(), name: "預設漢堡", price: 100 }
];
let menu = JSON.parse(localStorage.getItem('myMenu')) || defaultMenu;

// 2. 模式切換邏輯 (預設使用者模式)
let isDevMode = false;

function toggleMode() {
    isDevMode = !isDevMode;
    document.getElementById('dev-section').style.display = isDevMode ? 'block' : 'none';
    document.getElementById('mode-status').innerText = isDevMode ? "目前模式：開發者 (編輯菜單)" : "目前模式：使用者 (點餐)";
    renderMenu();
}

// 3. 渲染菜單 (根據模式顯示不同按鈕)
function renderMenu() {
    const menuDiv = document.getElementById('menu-items');
    menuDiv.innerHTML = "";
    
    menu.forEach((item, index) => {
        menuDiv.innerHTML += `
            <div class="menu-item">
                <span>${item.name} - $${item.price}</span>
                ${isDevMode ? 
                    `<button class="btn-clear" onclick="deleteMenuItem(${index})">刪除</button>` : 
                    `<button class="btn-add" onclick="addToCart(${item.id})">加入</button>`
                }
            </div>
        `;
    });
}

// 4. 開發者功能：新增品項
function addMenuItem() {
    const name = document.getElementById('new-item-name').value;
    const price = parseInt(document.getElementById('new-item-price').value);
    
    if (name && price) {
        menu.push({ id: Date.now(), name, price });
        saveMenu();
        document.getElementById('new-item-name').value = '';
        document.getElementById('new-item-price').value = '';
    } else {
        alert("請輸入完整的名稱與價格");
    }
}

// 5. 開發者功能：刪除品項
function deleteMenuItem(index) {
    menu.splice(index, 1);
    saveMenu();
}

function saveMenu() {
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderMenu();
}

// --- 以下為購物車邏輯 (維持不變或微調) ---
function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const product = menu.find(p => p.id === id);
    cart.push(product);
    localStorage.setItem('myCart', JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const cartList = document.getElementById('cart-list');
    const totalSpan = document.getElementById('total-price');
    cartList.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        cartList.innerHTML += `<li>${item.name} - $${item.price}</li>`;
        total += item.price;
    });
    totalSpan.innerText = total;
}

function clearCart() {
    localStorage.removeItem('myCart');
    renderCart();
}

// 初始化頁面
renderMenu();
renderCart();