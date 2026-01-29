let normalCart = [];
let selItem = null;

function initNormal() {
    const grid = document.getElementById('normal-menu-grid');
    grid.innerHTML = menu.map((m, i) => `<div class="card" onclick="openQtyModal(${i})" style="text-align:center; cursor:pointer; font-weight:bold; border-bottom:4px solid var(--blue);">${m.name}<br>$${m.price}</div>`).join("");
    document.getElementById('cur-sn').innerText = sn;
    renderNormalCart(); syncPreview();
}

function openQtyModal(idx) {
    selItem = menu[idx];
    document.getElementById('target-item-name').innerText = selItem.name;
    document.getElementById('target-qty').value = 1;
    document.getElementById('qty-modal').style.display = 'flex';
}
function closeQtyModal() { document.getElementById('qty-modal').style.display = 'none'; }

function adjustQty(val) {
    let inp = document.getElementById('target-qty');
    let res = parseInt(inp.value) + val;
    if (res < 1) res = 1;
    inp.value = res;
}

function pressNum(v) {
    let inp = document.getElementById('target-qty');
    if(v === 'C') inp.value = 1; else inp.value = (inp.value == "1") ? v : inp.value + v;
}

function confirmNormalAdd() {
    normalCart.push({...selItem, qty: parseInt(document.getElementById('target-qty').value)});
    renderNormalCart(); closeQtyModal();
}

function renderNormalCart() {
    let total = 0;
    document.getElementById('normal-cart-list').innerHTML = normalCart.map(c => {
        total += c.price * c.qty;
        return `<div style="display:flex; justify-content:space-between; padding:5px 0;"><span>${c.name} x ${c.qty}</span><span>$${c.price*c.qty}</span></div>`;
    }).join("");
    document.getElementById('normal-total').innerText = total;
}

function syncPreview() {
    document.getElementById('preview-name').innerText = "顧客：" + (document.getElementById('cust-name').value || ("客人" + sn));
}

function checkoutNormal() {
    if(!normalCart.length) return;
    orders.unshift({
        name: document.getElementById('cust-name').value || ("客人" + sn++),
        content: normalCart.map(c => `${c.name}x${c.qty}`).join(","),
        total: document.getElementById('normal-total').innerText,
        status: "製作中",
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    });
    normalCart = []; document.getElementById('cust-name').value = "";
    saveAll(); initNormal();
}

// 開發者功能開關
function toggleDevSection() {
    const sec = document.getElementById('dev-section');
    sec.style.display = (sec.style.display === 'none') ? 'block' : 'none';
}

function addNewItem() {
    const name = document.getElementById('new-item-name').value.trim();
    const price = document.getElementById('new-item-price').value;
    if(!name || !price) return;
    menu.push({name, price: parseInt(price)});
    saveAll(); initNormal();
}

function resetSN() {
    const val = document.getElementById('set-sn').value;
    if(!val) return;
    sn = parseInt(val);
    saveAll(); initNormal();
}