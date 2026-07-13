$html = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8
$match = [regex]::Match($html, "box\.className = 'grid grid-cols-3 gap-2';.*?(?:box\.appendChild\(decideBtn\);|applyCustomInput\(\);\s*\};\s*box\.appendChild\(decideBtn\);)")
if ($match.Success) { Write-Output $match.Value } else { Write-Output "Not found" }
