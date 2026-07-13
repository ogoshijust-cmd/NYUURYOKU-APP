$noBase = Get-Content .\nyuuryoku_no_base64.html -Encoding UTF8
$line17 = (Get-Content .\search_master.txt | Where-Object { $_ -match "^  nyuuryoku\.html:17:" }).Substring(20)

$noBase[16] = $line17

Set-Content .\nyuuryoku.html -Value $noBase -Encoding UTF8
