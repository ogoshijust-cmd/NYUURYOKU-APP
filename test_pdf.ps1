$html = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8
$match = [regex]::Match($html, "sheetWrapper\.appendChild\(table\);")
if ($match.Success) { Write-Output "Success" } else { Write-Output "Not found" }
