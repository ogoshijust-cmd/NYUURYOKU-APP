$html = Get-Content -Path .\nyuuryoku_backup.html -Raw -Encoding UTF8
$match = [regex]::Match($html, "const btn = el\('button', 'border px-3 py-2 rounded-lg text-sm shadow-sm hover:bg-blue-50 active:bg-blue-100 transition',\s*\{text: item\}\);")
if ($match.Success) { Write-Output "Found btn!" } else { Write-Output "Not found" }
