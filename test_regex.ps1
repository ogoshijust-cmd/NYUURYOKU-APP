$html = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8
$matched1 = $html -match "function renderMasterItems\(\)\s*\{"
$matched2 = $html -match "const div = el\('div',\s*'flex justify-between items-center bg-white border px-3 py-1\.5 rounded-lg gap-2 shadow-sm cursor-move touch-manipulation'\);"
$matched3 = $html -match "(?s)box\.className\s*=\s*'grid grid-cols-3 gap-2';.*?box\.appendChild\(decideBtn\);"
$matched4 = $html -match "sheetWrapper\.appendChild\(table\);"
Write-Output "Matched1: $matched1, Matched2: $matched2, Matched3: $matched3, Matched4: $matched4"
