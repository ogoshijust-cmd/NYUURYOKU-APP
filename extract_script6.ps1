$html = Get-Content -Raw "nyuuryoku.html" -Encoding UTF8

$scripts = [regex]::Matches($html, '(?si)<script[^>]*>(.*?)</script>')
$totalScripts = $scripts.Count

$script6 = $scripts[5].Groups[1].Value
Set-Content -Path "script6.js" -Value $script6 -Encoding UTF8
Write-Host "Extracted script 6"
