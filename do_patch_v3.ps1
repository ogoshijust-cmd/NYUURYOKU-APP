$html = Get-Content -Path .\nyuuryoku_backup.html -Raw -Encoding UTF8

# 1. Grey out in setupInputMasterBtns
# Define getAllUsedBuzai globally before setupInputMasterBtns
$btnRegex = "function setupInputMasterBtns\(type\)\s*\{"
$btnRepl = "function getAllUsedBuzai() { let used = []; if(typeof sheets !== 'undefined') { sheets.forEach(s => { if(s.rows) { s.rows.forEach(r => { if(r[0] && r[0].t && r[0].t.trim() !== '') used.push(r[0].t.trim()); }); } }); } return used; }`n        function setupInputMasterBtns(type) {"
$html = $html -replace $btnRegex, $btnRepl

$btnLoopRegex = "items\.forEach\(item => \{\s*const btn = el\('button', 'bg-white border border-gray-300 rounded-lg p-3 font-bold active:bg-blue-200 text-base shadow-sm hover:bg-gray-50', \{text: item\}\);"
$btnLoopRepl = "items.forEach(item => {
    let bgClass = 'bg-white text-gray-800 hover:bg-gray-50';
    if (type === 'buzai' && typeof getAllUsedBuzai === 'function' && getAllUsedBuzai().includes(item)) {
        bgClass = 'bg-gray-200 text-gray-400 hover:bg-gray-300';
    }
    const btn = el('button', bgClass + ' border border-gray-300 rounded-lg p-3 font-bold active:bg-blue-200 text-base shadow-sm', {text: item});"
$html = $html -replace $btnLoopRegex, $btnLoopRepl

$btnLoop2Regex = "masterList\.forEach\(item => \{\s*const btn = el\('button', 'bg-gray-100 border rounded-xl p-4 font-bold active:bg-blue-200 text-lg hover:bg-gray-200', \{text: item\}\);"
$btnLoop2Repl = "masterList.forEach(item => {
    let bgClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    if (type === 'buzai' && typeof getAllUsedBuzai === 'function' && getAllUsedBuzai().includes(item)) {
        bgClass = 'bg-gray-200 text-gray-400 hover:bg-gray-300';
    }
    const btn = el('button', bgClass + ' border rounded-xl p-4 font-bold active:bg-blue-200 text-lg', {text: item});"
$html = $html -replace $btnLoop2Regex, $btnLoop2Repl

# 2. Calculator
$calcRegex = "(?s)box\.className = 'grid grid-cols-3 gap-2';.*?(?:box\.appendChild\(decideBtn\);|applyCustomInput\(\);\s*\};\s*box\.appendChild\(decideBtn\);)"
$calcRepl = "box.className = 'grid grid-cols-4 gap-2';
const keys = ['7','8','9','÷', '4','5','6','×', '1','2','3','-', '0','.','=','+'];
keys.forEach(k => {
    const btn = el('button', 'bg-gray-100 border rounded-xl p-4 font-bold active:bg-blue-200 text-2xl shadow-sm', {text: k});
    btn.type = 'button';
    btn.onclick = () => {
        const input = $('customInput');
        if (k === '=') {
            try {
                let expr = String(input.value).replace(/×/g, '*').replace(/÷/g, '/');
                input.value = Function('return (' + expr + ')')();
            } catch(e) {}
        } else if (k === '×' || k === '÷' || k === '-' || k === '+') {
            input.value += k;
        } else {
            input.value += k;
        }
    };
    box.appendChild(btn);
});
const decideBtn = el('button', 'col-span-4 bg-blue-600 text-white border rounded-xl p-3 font-bold active:bg-blue-700 text-xl shadow-sm mt-1', {text: '決定'});
decideBtn.type = 'button';
decideBtn.onclick = () => { $('customInput').blur(); applyCustomInput(); };
box.appendChild(decideBtn);"
$html = $html -replace $calcRegex, $calcRepl

# 3. PDF dummy columns
$pdfRegex = 'sheetWrapper\.appendChild\(table\);'
$pdfRepl = "if (s.lc < 5) {
    let diff = 5 - s.lc;
    Array.from(table.rows).forEach((row, rowIndex) => {
        if (rowIndex === 0) {
            for(let k = 0; k < diff; k++) {
                let th = document.createElement('th');
                th.style.visibility = 'hidden';
                th.style.minWidth = '50px';
                th.colSpan = 6;
                row.appendChild(th);
            }
        } else if (rowIndex === 1) {
            for(let k = 0; k < diff * 6; k++) {
                let th = document.createElement('th');
                th.style.visibility = 'hidden';
                th.style.minWidth = '10px';
                row.appendChild(th);
            }
        } else {
            for(let k = 0; k < diff * 6; k++) {
                let td = document.createElement('td');
                td.style.visibility = 'hidden';
                td.style.minWidth = '10px';
                row.appendChild(td);
            }
        }
    });
}
sheetWrapper.appendChild(table);"
$html = $html -replace $pdfRegex, $pdfRepl

Set-Content -Path .\nyuuryoku.html -Value $html -Encoding UTF8
