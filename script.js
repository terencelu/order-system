const menu = [
    { id: 1, name: "經典牛肉堡", price: 150 },
    { id: 2, name: "酥脆炸雞翅", price: 120 },
    { id: 3, name: "冰美式咖啡", price: 60 }
];

// 初始化渲染菜單
const menuDiv = document.getElementById('menu-items');
menu.forEach(item => {
    menuDiv.innerHTML += `
        <div class="menu-item">
            <span>${item.name} - $${item.price}</span>
            <button class="btn-add" onclick="addToCart(${item.id})">加入</button>
        </div>
    `;
});

// 加入購物車
function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const product = menu.find(p => p.id === id);
    cart.push(product);
    localStorage.setItem('myCart', JSON.stringify(cart));
    renderCart();
}

// 渲染購物車內容
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    const cartList = document.getElementById('cart-list');
    const totalSpan = document.getElementById('total-price');
    
    cartList.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        cartList.innerHTML += `<li>${item.name} - $${item.price}</li>`;
        total += item.price;
    });
    totalSpan.innerText = total;
}

// 清空購物車
function clearCart() {
    localStorage.removeItem('myCart');
    renderCart();
}

// 送出訂單 (示範彈窗)
function checkout() {
    const cart = JSON.parse(localStorage.getItem('myCart') || "[]");
    if (cart.length === 0) return alert("購物車是空的喔！");
    
    let orderText = "您的訂單如下：\n";
    cart.forEach(item => orderText += `- ${item.name}\n`);
    alert(orderText + "\n訂單已暫存，這是一個靜態示範！");
}

// 網頁開啟時自動讀取一次
renderCart();
