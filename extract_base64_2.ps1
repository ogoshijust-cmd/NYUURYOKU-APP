$raw = Get-Content .\search_master.txt -Raw
$matches = [regex]::Matches($raw, 'data:image/[^;]+;base64,[A-Za-z0-9+/=\s]+')
foreach ($m in $matches) {
    Write-Output "Length: $($m.Length)"
}
