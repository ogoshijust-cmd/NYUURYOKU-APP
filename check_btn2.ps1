$html = Get-Content -Path .\nyuuryoku_backup.html -Raw -Encoding UTF8
$match = [regex]::Match($html, "const btn = el\('button', 'bg-white border border-gray-300 rounded-lg p-3 font-bold active:bg-blue-200 text-base shadow-sm hover:bg-gray-50',\s*\{text: item\}\);")
if ($match.Success) { Write-Output "Found: $($match.Value)" } else { Write-Output "Not found" }
