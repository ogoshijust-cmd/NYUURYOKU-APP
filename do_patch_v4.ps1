$html = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8

# 1. Add syncActiveSheetToModel to setupInputMasterBtns
$html = $html -replace "function setupInputMasterBtns\(type\) \{", "function setupInputMasterBtns(type) { if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();"

# 2. Fix dummy columns in PDF (replace visibility: hidden with white borders)
# We will match the entire block added previously for PDF dummy columns and replace it.
$pdfOld = "th\.style\.visibility = 'hidden';"
$pdfNew = "th.style.cssText = 'border: 1px solid white !important; background-color: white !important; color: transparent !important;';"
$html = $html -replace $pdfOld, $pdfNew

$pdfOld2 = "td\.style\.visibility = 'hidden';"
$pdfNew2 = "td.style.cssText = 'border: 1px solid white !important; background-color: white !important; color: transparent !important;';"
$html = $html -replace $pdfOld2, $pdfNew2

Set-Content -Path .\nyuuryoku.html -Value $html -Encoding UTF8
