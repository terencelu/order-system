let fastCart = [];
function initFast() {
    const grid = document.getElementById('fast-menu-grid');
    let html = menu.map((m, i) => `
        <div class="card" onclick="addFast(${i})" style="text-align:center; cursor:pointer; font-weight:bold; border-bottom:4px solid var(--blue);">
            ${m.name}<br>$${m.price}
        </div>`).join("");

    if (isDevMode) {
        html += `
        <div class="card" onclick="alert('快速模式新增')" style="text-align:center; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px dashed #ccc; background:none; font-size:2rem; color:#999;">
            +
        </div>`;
    }

    grid.innerHTML = html;
    renderFastCart();
}
function addFast(idx) {
    const item = menu[idx];
    const exist = fastCart.find(c => c.name === item.name);
    if(exist) exist.qty++; else fastCart.push({...item, qty:1});
    renderFastCart();
}
function renderFastCart() {
    let total = 0;
    document.getElementById('fast-cart-list').innerHTML = fastCart.map(c => {
        total += c.price * c.qty;
        return `<div style="display:flex; justify-content:space-between; padding:5px 0;"><span>${c.name} x ${c.qty}</span><span>$${c.price*c.qty}</span></div>`;
    }).join("");
    document.getElementById('fast-total').innerText = total;
}
function clearFastCart() { fastCart = []; renderFastCart(); }
function checkoutFast() {
    if (!fastCart.length) return;
    
    // 參考 normal.js 的邏輯，在名稱中加入當前的 sn，之後再將 sn 自增 1
    orders.unshift({
        name: "快速-" + (sn++), 
        phone: "",
        content: fastCart.map(c => `${c.name}x${c.qty}`).join(","),
        total: document.getElementById('fast-total').innerText,
        status: "製作中",
        time: getCurrentDateTime() 
    });

    fastCart = [];
    saveAll();     // 儲存狀態至 localStorage
    initFast();    // 重新初始化快速模式介面
    
    // 若有需要，可以像 normal.js 一樣顯示當前流水號（選用）
    // document.getElementById('cur-sn').innerText = sn; 
}