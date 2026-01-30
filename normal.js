let normalCart = [];
let selItem = null;

function initNormal() {
    const grid = document.getElementById('normal-menu-grid');
    // 先渲染原本的菜單
    let html = menu.map((m, i) => `
        <div class="card" style="text-align:center; position:relative; border-bottom:4px solid var(--blue);">
            <div onclick="openQtyModal(${i})" style="cursor:pointer; font-weight:bold;">
                ${m.name}<br>$${m.price}
            </div>
            <button onclick="editItem(${i})" style="margin-top:8px; font-size:12px; border:none; background:#f0f0f0; border-radius:4px; cursor:pointer; padding:2px 8px;">✏️ 編輯</button>
        </div>`).join("");

    // 如果是開發者模式，在最後面加上 [+] 按鈕
    if (isDevMode) {
        html += `
            <div class="card" onclick="alert('新增')" style="
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; border: 2px dashed #ccc; background: none;
                font-size: 24px; font-weight: bold; color: #999;">
                +
            </div>`;
    }
    grid.innerHTML = html;
    document.getElementById('cur-sn').innerText = sn;
    renderNormalCart(); syncPreview();
}

function editItem(idx) {
    const newName = prompt("修改口味名稱", menu[idx].name);
    const newPrice = prompt("修改價格", menu[idx].price);
    if (newName && newPrice) {
        menu[idx].name = newName;
        menu[idx].price = parseInt(newPrice);
        saveAll(); initNormal();
    }
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
    const name = document.getElementById('cust-name').value || ("客人" + sn);
    const phone = document.getElementById('cust-phone').value;
    document.getElementById('preview-name').innerText = "顧客：" + name + (phone ? ` (${phone})` : "");
}

function checkoutNormal() {
    if(!normalCart.length) return;
    orders.unshift({
        name: document.getElementById('cust-name').value || ("客人" + sn++),
        phone: document.getElementById('cust-phone').value || "",
        content: normalCart.map(c => `${c.name}x${c.qty}`).join(","),
        total: document.getElementById('normal-total').innerText,
        status: "製作中",
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    });
    normalCart = []; 
    document.getElementById('cust-name').value = "";
    document.getElementById('cust-phone').value = "";
    saveAll(); initNormal();
}

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