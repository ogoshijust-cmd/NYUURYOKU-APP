$html = Get-Content -Path .\nyuuryoku_backup.html -Raw -Encoding UTF8
$match = [regex]::Match($html, "items\.forEach\(item => \{\s*const btn = el\('button', 'bg-white border border-gray-300 rounded-lg p-3 font-bold active:bg-blue-200 text-base shadow-sm hover:bg-gray-50', \{text: item\}\);")
if ($match.Success) { Write-Output "Found the loop!" } else { Write-Output "Not found" }
