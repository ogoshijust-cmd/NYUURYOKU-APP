$html = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8

$renderRegex = 'function renderMasterItems\(\)\s*\{'
$renderRepl = "function getUsedBuzai() { let used = []; document.querySelectorAll('#tableBody tr').forEach(tr => { const td = tr.children[0]; if(td) { const mainText = td.querySelector('.main-text'); if(mainText && mainText.textContent.trim()) used.push(mainText.textContent.trim()); } }); return used; }`n        function renderMasterItems() { const usedBuzai = getUsedBuzai();"
$html = $html -replace $renderRegex, $renderRepl

$subcatRegex = "const div = el\('div',\s*'flex justify-between items-center bg-white border px-3 py-1\.5 rounded-lg gap-2 shadow-sm cursor-move touch-manipulation'\);"
$subcatRepl = "let bgClass = (activeCat === 'buzai' && typeof usedBuzai !== 'undefined' && usedBuzai.includes(item)) ? 'bg-gray-200 text-gray-400' : 'bg-white text-gray-800'; const div = el('div', ``flex justify-between items-center `${bgClass} border px-3 py-1.5 rounded-lg gap-2 shadow-sm cursor-move touch-manipulation``);"
$html = $html -replace $subcatRegex, $subcatRepl

$divRegex = "const div = el\('div',\s*'flex justify-between items-center bg-white border px-3 py-1\.5 rounded-lg gap-3 shadow-sm cursor-move touch-manipulation'\);"
$divRepl = "let bgClass = (activeCat === 'buzai' && typeof usedBuzai !== 'undefined' && usedBuzai.includes(item)) ? 'bg-gray-200 text-gray-400' : 'bg-white text-gray-800'; const div = el('div', ``flex justify-between items-center `${bgClass} border px-3 py-1.5 rounded-lg gap-3 shadow-sm cursor-move touch-manipulation``);"
$html = $html -replace $divRegex, $divRepl

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

$pdfRegex = 'sheetWrapper\.appendChild\(table\);'
$pdfRepl = "if (s.lc < 5) {
    let diff = 5 - s.lc;
    Array.from(table.rows).forEach((row, rowIndex) => {
        if (rowIndex === 0) {
            row.cells[0].colSpan += diff * 6;
        } else if (rowIndex === 1) {
            for(let k = 0; k < diff; k++) {
                let th = document.createElement('th');
                th.style.setProperty('border', 'none', 'important');
                th.style.minWidth = '50px';
                th.colSpan = 6;
                row.appendChild(th);
            }
        } else {
            for(let k = 0; k < diff * 6; k++) {
                let td = document.createElement('td');
                td.style.setProperty('border', 'none', 'important');
                td.style.minWidth = '10px';
                row.appendChild(td);
            }
        }
    });
}
sheetWrapper.appendChild(table);"
$html = $html -replace $pdfRegex, $pdfRepl

Set-Content -Path .\nyuuryoku.html -Value $html -Encoding UTF8
