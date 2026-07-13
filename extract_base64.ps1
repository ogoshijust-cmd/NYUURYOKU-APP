$raw = Get-Content .\search_master.txt -Raw
$matches = [regex]::Matches($raw, 'data:image/[^;]+;base64,[A-Za-z0-9+/=\s]+')
Write-Output "Found $($matches.Count) base64 strings!"
