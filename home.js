let menu = JSON.parse(localStorage.getItem('myMenu')) || [
    { name: "經典藍莓", price: 100 }, { name: "蘋果肉桂", price: 100 },
    { name: "濃醇可可", price: 100 }, { name: "奧利濃黑", price: 100 },
    { name: "焦糖海鹽", price: 100 }, { name: "開心堅果", price: 100 }
];
let orders = JSON.parse(localStorage.getItem('myOrders')) || [];
let archives = JSON.parse(localStorage.getItem('myArchives')) || [];
let sn = parseInt(localStorage.getItem('sn')) || 1;
let isArchiveExpanded = false;

let longPressTimer;
let selectedOrderIdx = null;
let currentMode = ''; // 用於紀錄當前模式

let isDevMode = false;

let adminPressTimer;
let isAdminRawMode = false; // 紀錄當前是否為 Raw 模式

let archivePressTimer;
let archiveIdxToDelete = null; // 紀錄準備要刪除哪一條

function showHomeButtons() {
    document.getElementById('home-actions').style.display = 'flex';
}

function enterMode(mode, event) {
    currentMode = mode; // 儲存當前進入的模式
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

// 通用的日期時間格式化函數
function getCurrentDateTime() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${month}/${date} ${time}`;
}

function renderOrders() {
    const list = document.getElementById('order-history-list');
    // const reverseOrders = orders.reverse();
    // list.innerHTML = reverseOrders.map((o, i) => `
    list.innerHTML = orders.map((o, i) => `
        <div class="order-card ${o.status}" 
             onmousedown="startPress(${i})" 
             onmouseup="endPress(${i})" 
             ontouchstart="startPress(${i})" 
             ontouchend="endPress(${i})"
             onclick="handleOrderClick(${i})">
            <b>${o.name}</b> 
            ${o.phone ? `<small style="display:block; color:#666;">📞 ${o.phone}</small>` : ''}
            <span style="float:right;">$${o.total}</span>
            <div style="margin:5px 0;">${o.content}</div>
            <small>${o.time}</small>
            <div class="watermark">${o.status}</div>
        </div>`).join("");
    renderArchives();
}

function handleOrderClick(i) {
    // 只有在不是長按觸發的情況下才切換狀態
    if (!selectedOrderIdx !== null) {
        toggleStatus(i);
    }
}

function startPress(i) {
    longPressTimer = setTimeout(() => {
        if (currentMode === 'fast') {
            selectedOrderIdx = i;
            document.getElementById('order-action-modal').style.display = 'flex';
        }
    }, 800); // 設定長按 800 毫秒觸發
}

function endPress() {
    clearTimeout(longPressTimer);
}

function closeActionModal() {
    document.getElementById('order-action-modal').style.display = 'none';
    selectedOrderIdx = null;
}

function deleteOrder() {
    if (selectedOrderIdx !== null) {
        if (confirm("確定要刪除這筆訂單嗎？")) {
            orders.splice(selectedOrderIdx, 1);
            saveAll();
            closeActionModal();
        }
    }
}

function toggleStatus(i) {
    orders[i].status = (orders[i].status === "製作中") ? "製作完成" : "製作中";
    saveAll();
}

function archiveOrders() {
    const completed = orders.filter(o => o.status === "製作完成");
    if (completed.length === 0) return alert("沒有已完成訂單");
    archives = [...completed, ...archives];
    orders = orders.filter(o => o.status !== "製作完成");
    saveAll();
}

function renderArchives() {
    const list = document.getElementById('archive-list');
    list.innerHTML = archives.map(o => `
        <div class="order-card 歷史" style="opacity: 0.7; cursor: default;">
            <b>${o.name}</b> 
            ${o.phone ? `<small style="display:block; color:#666;">📞 ${o.phone}</small>` : ''}
            <span style="float:right;">$${o.total}</span>
            <div style="margin:5px 0;">${o.content}</div>
            <small>${o.time}</small>
            <div class="watermark" style="font-size: 25px;">歷史</div>
        </div>`).join("");
}

function toggleArchiveCollapse() {
    isArchiveExpanded = !isArchiveExpanded;
    const list = document.getElementById('archive-list');
    const arrow = document.getElementById('archive-arrow');
    if (isArchiveExpanded) {
        list.classList.remove('collapsed-preview');
        list.classList.add('expanded');
        arrow.innerText = "▲";
    } else {
        list.classList.add('collapsed-preview');
        list.classList.remove('expanded');
        arrow.innerText = "▼";
    }
}

function saveAll() {
    localStorage.setItem('myOrders', JSON.stringify(orders));
    localStorage.setItem('myArchives', JSON.stringify(archives));
    localStorage.setItem('sn', sn);
    localStorage.setItem('myMenu', JSON.stringify(menu));
    renderOrders();
}

function toggleDevMode() {
    isDevMode = !isDevMode;
    // 背景轉黑
    document.body.style.backgroundColor = isDevMode ? "#1a1a1a" : "var(--bg)";

    if (currentMode === 'fast') {
        if (typeof initFast === 'function') {
            initFast(); 
        }
    } else if (currentMode === 'normal') {
        if (typeof initNormal === 'function') {
            initNormal();
        }
    }
    renderArchives();
}

function startAdminPress() {
    clearTimeout(adminPressTimer);
    adminPressTimer = setTimeout(() => {
        if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
        enterAdminData();
    }, 1500); 
}

function clearAdminPress() {
    clearTimeout(adminPressTimer);
}

function enterAdminData() {
    isAdminRawMode = false; // 每次打開預設顯示歷史紀錄
    updateAdminModalUI();
    document.getElementById('admin-data-modal').style.display = 'flex';
}

function toggleRawData() {
    isAdminRawMode = !isAdminRawMode;
    updateAdminModalUI();
}

function closeAdminData() {
    document.getElementById('admin-data-modal').style.display = 'none';
}

function updateAdminModalUI() {
    const listContainer = document.getElementById('local-storage-list');
    const title = document.getElementById('admin-modal-title');
    const rawBtn = document.getElementById('raw-btn');
    const dangerBtn = document.getElementById('danger-action-btn'); 
    
    let html = "";

if (!isAdminRawMode) {
        // --- 模式 1: Archives 模式 ---
        title.innerText = "歷史數據管理";
        rawBtn.innerText = "Raw";
        dangerBtn.innerText = "清除所有歷史訂單";

        // 1. 解析資料
        const archiveArray = JSON.parse(localStorage.getItem('myArchives') || "[]");
        
        if (archiveArray.length === 0) {
            html = `<div style="text-align:center; color:#999; padding:20px;">尚無歷史數據</div>`;
        } else {
            html = `<div style="color: #e63946; font-size: 12px; margin-bottom:10px;">提示：長按下方紀錄可進行刪除</div>`;
            
            // 2. 將 JSON 轉換為按鈕/卡片元件
            html += archiveArray.map((item, idx) => `
                <div class="archive-item-card" 
                     onmousedown="startArchivePress(${idx})" 
                     onmouseup="clearArchivePress()" 
                     onmouseleave="clearArchivePress()"
                     ontouchstart="startArchivePress(${idx})" 
                     ontouchend="clearArchivePress()"
                     oncontextmenu="event.preventDefault();"
                     style="background:#fff; border:1px solid #ddd; border-radius:10px; padding:12px; margin-bottom:10px; cursor:pointer; user-select:none;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                        <span>${item.name || '無名'}</span>
                        <span style="color:var(--blue);">$${item.total || 0}</span>
                    </div>
                    <div style="font-size:12px; color:#666; margin-top:4px;">${item.content || ''}</div>
                    <div style="font-size:10px; color:#999; margin-top:4px;">${item.time || ''}</div>
                </div>
            `).join("");
        }
    } else {
        // --- 模式 2: Raw 模式 ---
        title.innerText = "全系統原始數據";
        rawBtn.innerText = "返回";
        dangerBtn.innerText = "刪除全系統原始數據";

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            html += `
                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--blue);">[ ${key} ]</strong>
                    <pre style="white-space: pre-wrap; word-break: break-all; background: #fff; padding: 8px; border-radius: 5px; border: 1px solid #eee;">${value}</pre>
                </div>`;
        }
    }
    listContainer.innerHTML = html;
}

function handleDangerAction() {
    if (isAdminRawMode) {
        // 模式：Raw -> 回復初始設定 (清空整個 LocalStorage)
        if (confirm("警告！這將會刪除所有菜單、訂單、流水號並回復初始狀態。確定要重置嗎？")) {
            localStorage.clear();
            alert("系統已完全重置，頁面即將重新整理。");
            location.reload(); // 重新整理頁面以載入預設菜單
        }
    } else {
        // 模式：一般 -> 只刪除 myArchives
        if (confirm("確定要刪除「所有」歷史紀錄嗎？此動作不可逆！")) {
            localStorage.removeItem('myArchives');
            archives = []; // 更新全域變數
            alert("已清空所有歷史紀錄");
            updateAdminModalUI();
            if(typeof renderArchives === "function") renderArchives();
        }
    }
}

// --- 長按刪除邏輯 ---
function startArchivePress(idx) {
    archiveIdxToDelete = idx;
    clearTimeout(archivePressTimer);
    archivePressTimer = setTimeout(() => {
        if (window.navigator.vibrate) window.navigator.vibrate(100);
        document.getElementById('delete-confirm-modal').style.display = 'flex';
    }, 800); // 長按 0.8 秒觸發
}
function clearArchivePress() {
    clearTimeout(archivePressTimer);
}
function closeDeleteModal() {
    document.getElementById('delete-confirm-modal').style.display = 'none';
    archiveIdxToDelete = null;
}
function executeDeleteArchive() {
    if (archiveIdxToDelete !== null) {
        let archiveArray = JSON.parse(localStorage.getItem('myArchives') || "[]");
        archiveArray.splice(archiveIdxToDelete, 1); // 刪除該筆
        localStorage.setItem('myArchives', JSON.stringify(archiveArray));
        
        // 更新全域變數並同步畫面
        archives = archiveArray; 
        updateAdminModalUI(); // 重新渲染列表
        if(typeof renderArchives === "function") renderArchives(); // 同步更新前台畫面
        
        closeDeleteModal();
    }
}
