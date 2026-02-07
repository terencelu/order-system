let fastCart = [];
let savedMenu = localStorage.getItem('custom_menu');
if (savedMenu) {
    menu = JSON.parse(savedMenu);
}

function saveMenu() {
    localStorage.setItem('custom_menu', JSON.stringify(menu));
}

function initFast() {
    const titleInput = document.getElementById('fast-title-input');
    
    if (titleInput) {
        // 更新顯示文字
        titleInput.value = `快速-${sn}`;
        
        // 根據開發模式判斷是否可編輯
        if (isDevMode) {
            titleInput.readOnly = false; // 移除唯讀
            titleInput.classList.add('editable'); // 加上美化樣式
            
            // 監聽修改，讓使用者手動改名時也能同步 (選用)
            titleInput.onchange = (e) => {
                console.log("標題被修改為:", e.target.value);
            };
        } else {
            titleInput.readOnly = true;
            titleInput.classList.remove('editable');
        }
    }

    // const cart = document.getElementsByClassName('fast-cart-box');
    // cart.style.backgroundColor = isDevMode ? "#686868" : "#fff";

    const grid = document.getElementById('fast-menu-grid');
    let html = menu.map((m, i) => `
        <div class="flavor" onclick="addFast(${i})" style="border-bottom:6px solid var(--blue);">
            ${m.name}<br>$${m.price}
        </div>`).join("");

    if (isDevMode) {
        html += `
        <div class="flavor" onclick="addNewItemFast()" style="display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc; background: none; color: #999;">
            +
        </div>`;
    }
    //     menu.forEach((m, i) => {
    //     const div = document.createElement('div');
    //     div.className = 'flavor';
    //     div.style.borderBottom = '6px solid var(--blue)';
    //     div.innerHTML = `${m.name}<br>$${m.price}`;
        
    //     // 綁定長按與短按處理
    //     bindLongPress(div, () => addFast(i), () => deleteItemFast(i));
        
    //     grid.appendChild(div);
    // });

    // if (isDevMode) {
    //     const addBtn = document.createElement('div');
    //     addBtn.className = 'flavor';
    //     addBtn.style.cssText = 'display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc; background: none; color: #999; font-size: 2rem;';
    //     addBtn.innerText = '+';
    //     addBtn.onclick = addNewItemFast; // 新增按鈕不需要長按
    //     grid.appendChild(addBtn);
    // }

    grid.innerHTML = html;
    renderFastCart();
}

function addFast(idx) {
    if(isDevMode){
        editItemFast(idx);
    }
    else{
        const item = menu[idx];
        const exist = fastCart.find(c => c.name === item.name);
        if(exist) exist.qty++; else fastCart.push({...item, qty:1});
        renderFastCart();
    }
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
// function checkoutFast() {
//     if (!fastCart.length) return;
    
//     // 獲取目前輸入框裡面的名稱 (如果是編輯過的，就會用編輯後的名稱)
//     const currentName = document.getElementById('fast-title-input').value;

//     orders.unshift({
//         name: currentName, 
//         phone: "",
//         content: fastCart.map(c => `${c.name} x ${c.qty}`).join(", "),
//         total: document.getElementById('fast-total').innerText,
//         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
//         status: "製作中"
//     });

//     sn++; 
//     // 結帳後自動更新成下一號
//     document.getElementById('fast-title-input').value = `快速-${sn}`;

//     clearFastCart();
//     saveOrders();
//     alert("訂單已送出");
// }

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

function addNewItemFast() {
    const name = prompt("請輸入新口味名稱：", "新口味");
    if (!name) return;

    const price = prompt(`請輸入 ${name} 的價錢：`, "50");
    if (price === null) return;

    const newItem = {
        name: name,
        price: parseInt(price) || 0
    };

    menu.push(newItem);
    
    saveMenu();
    initFast(); 
}
function editItemFast(idx) {
    // --- 開發模式：編輯現有口味 ---
    const item = menu[idx];
    
    // 取得新名稱，預設值帶入原本的名稱
    const newName = prompt("請輸入新口味名稱：", item.name);
    if (!newName) return; // 如果按下取消或沒輸入則返回

    // 取得新價錢，預設值帶入原本的價錢
    const newPrice = prompt(`請輸入 ${newName} 的價錢：`, item.price);
    if (newPrice === null) return; // 如果按下取消則返回

    // 更新該索引的菜單內容
    menu[idx] = {
        name: newName,
        price: parseInt(newPrice) || 0
    };

    // 儲存到本地空間並重新渲染介面
    saveMenu();
    initFast();
}
