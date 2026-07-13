$html = Get-Content -Raw "nyuuryoku.html" -Encoding UTF8

$scripts = [regex]::Matches($html, '(?si)<script[^>]*>(.*?)</script>')
$totalScripts = $scripts.Count
Write-Host "Found $totalScripts script tags."

$errorCount = 0
$scriptIndex = 1

foreach ($match in $scripts) {
    $script = $match.Groups[1].Value

    # Remove block comments
    $script = [regex]::Replace($script, '(?s)/\*.*?\*/', '')
    # Remove line comments
    $script = [regex]::Replace($script, '//.*', '')
    # Remove strings
    $script = [regex]::Replace($script, '(?s)".*?(?<!\\)"', '')
    $script = [regex]::Replace($script, "(?s)'.*?(?<!\\)'", '')
    $script = [regex]::Replace($script, '(?s)`.*?(?<!\\)`', '')

    $stack = New-Object System.Collections.Generic.Stack[char]
    $balanced = $true

    foreach ($char in $script.ToCharArray()) {
        if ($char -eq '{' -or $char -eq '[' -or $char -eq '(') {
            $stack.Push($char)
        }
        elseif ($char -eq '}') {
            if ($stack.Count -eq 0 -or $stack.Pop() -ne '{') { $balanced = $false; break }
        }
        elseif ($char -eq ']') {
            if ($stack.Count -eq 0 -or $stack.Pop() -ne '[') { $balanced = $false; break }
        }
        elseif ($char -eq ')') {
            if ($stack.Count -eq 0 -or $stack.Pop() -ne '(') { $balanced = $false; break }
        }
    }

    if (-not $balanced -or $stack.Count -gt 0) {
        Write-Host "Possible syntax error: Unbalanced brackets in script tag #$scriptIndex."
        $errorCount++
    }
    $scriptIndex++
}

if ($errorCount -eq 0) {
    Write-Host "PASS"
} else {
    Write-Host "FAIL: $errorCount script(s) have unbalanced brackets."
    exit 1
}
