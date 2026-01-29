let menu = JSON.parse(localStorage.getItem('myMenu')) || [
    { name: "經典藍莓", price: 100 }, { name: "蘋果肉桂", price: 100 },
    { name: "濃醇可可", price: 100 }, { name: "奧利濃黑", price: 100 },
    { name: "焦糖海鹽", price: 100 }, { name: "開心堅果", price: 100 }
];
let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
let sn = parseInt(localStorage.getItem('sn')) || 1;

function showHomeButtons() {
    document.getElementById('home-actions').style.display = 'flex';
}

function enterMode(mode, event) {
    if(event) event.stopPropagation();
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    document.querySelectorAll('.mode-container').forEach(el => el.style.display = 'none');
    document.getElementById(`container-${mode}`).style.display = 'block';

    if(mode === 'fast') initFast();
    if(mode === 'normal') initNormal();
    if(mode === 'analysis') initAnalysis();
    document.getElementById('common-history').style.display = (mode === 'analysis') ? 'none' : 'block';
    renderOrders();
}

function renderOrders() {
    const list = document.getElementById('order-history-list');
    list.innerHTML = orders.map((o, i) => `
        <div class="order-card ${o.status}" onclick="toggleStatus(${i})">
            <b>${o.name}</b> <span style="float:right;">$${o.total}</span>
            <div style="margin:5px 0;">${o.content}</div>
            <small>${o.time}</small>
            <div class="watermark">${o.status}</div>
        </div>`).join("");
}

function toggleStatus(i) {
    orders[i].status = (orders[i].status === "製作中") ? "製作完成" : "製作中";
    saveAll();
}

function saveAll() {
    localStorage.setItem('myOrders', JSON.stringify(orders));
    localStorage.setItem('sn', sn);
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderOrders();
}