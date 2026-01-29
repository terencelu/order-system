let fastCart = [];
function initFast() {
    const grid = document.getElementById('fast-menu-grid');
    grid.innerHTML = menu.map((m, i) => `<div class="card" onclick="addFast(${i})" style="text-align:center; cursor:pointer; font-weight:bold; border-bottom:4px solid var(--blue);">${m.name}<br>$${m.price}</div>`).join("");
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
    if(!fastCart.length) return;
    orders.unshift({
        name: "快速-" + sn++,
        content: fastCart.map(c => `${c.name}x${c.qty}`).join(","),
        total: document.getElementById('fast-total').innerText,
        status: "製作完成",
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    });
    fastCart = []; saveAll(); renderFastCart();
}