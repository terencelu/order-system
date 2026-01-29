let chart1 = null; let chart2 = null;
function initAnalysis() {
    const allData = [...orders, ...archives];
    const totalRev = allData.reduce((s, o) => s + parseInt(o.total), 0);
    document.getElementById('total-revenue').innerText = `$${totalRev}`;
    const flavorMap = {};
    let totalQty = 0;
    allData.forEach(o => {
        o.content.split(',').forEach(p => {
            const [rawName, qtyStr] = p.split('x');
            const name = rawName.trim();
            const qty = parseInt(qtyStr) || 0;
            if(name) { flavorMap[name] = (flavorMap[name] || 0) + qty; totalQty += qty; }
        });
    });
    const sorted = Object.entries(flavorMap).sort((a,b) => b[1]-a[1]);
    const tbody = document.querySelector('#flavor-table tbody');
    tbody.innerHTML = sorted.map(([name, qty]) => {
        const perc = totalQty > 0 ? ((qty/totalQty)*100).toFixed(1) : 0;
        return `<tr><td>${name}</td><td>${qty}</td><td>${perc}%</td></tr>`;
    }).join('');
    const ctx1 = document.getElementById('flavorChart').getContext('2d');
    if(chart1) chart1.destroy();
    chart1 = new Chart(ctx1, {
        type: 'pie',
        data: { labels: sorted.map(i => i[0]), datasets: [{ data: sorted.map(i => i[1]), backgroundColor: ['#4361ee','#2ec4b6','#f39c12','#ef233c','#7209b7'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    const timeData = new Array(24).fill(0);
    allData.forEach(o => {
        let h = parseInt(o.time.split(':')[0]);
        if(o.time.includes('下午') && h < 12) h += 12;
        if(o.time.includes('上午') && h === 12) h = 0;
        timeData[h]++;
    });
    const ctx2 = document.getElementById('timeChart').getContext('2d');
    if(chart2) chart2.destroy();
    chart2 = new Chart(ctx2, {
        type: 'bar',
        data: { labels: Array.from({length:24}, (_,i)=>`${i}時`), datasets: [{ label:'訂單量', data: timeData, backgroundColor: 'rgba(67, 97, 238, 0.5)' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}