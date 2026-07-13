$html = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8

$t1 = $html.Contains("function renderMasterItems() {")
$t2 = $html.Contains("const div = el('div', 'flex justify-between items-center bg-white border px-3 py-1.5 rounded-lg gap-2 shadow-sm cursor-move touch-manipulation');")
$t3 = $html.Contains("const div = el('div', 'flex justify-between items-center bg-white border px-3 py-1.5 rounded-lg gap-3 shadow-sm cursor-move touch-manipulation');")

# for calc, we need to find the setupInputMasterBtns block.
$t4 = $html -match "box\.className\s*=\s*'grid grid-cols-3 gap-2';"

$t5 = $html.Contains("sheetWrapper.appendChild(table);")

Write-Output "t1:$t1 t2:$t2 t3:$t3 t4:$t4 t5:$t5"
