$html = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8

$html = $html -replace 'padding: 2px !important;', 'padding: 1px !important;'
$html = $html -replace 'font-size: 9pt !important;', 'font-size: 7.5pt !important;'
$html = $html -replace 'padding: 0 2px !important;', 'padding: 0 1px !important;'

Set-Content -Path .\nyuuryoku.html -Value $html -Encoding UTF8
