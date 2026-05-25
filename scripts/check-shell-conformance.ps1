param(
    [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

$requiredMarkers = @(
    'class="skip-to-content"',
    'id="header-placeholder"',
    'id="footer-placeholder"'
)

$orderedScripts = @(
    'js/links.js',
    'js/page-shell.js',
    'js/site-utils.js',
    'js/scripts.js',
    'js/analytics.js',
    'js/footer.js'
)

$excludeFiles = @(
    'footer.html'
)

$htmlFiles = Get-ChildItem -Path $Root -Filter *.html -File |
    Where-Object {
        if ($excludeFiles -contains $_.Name) { return $false }
        if ($_.Name -like 'google*.html') { return $false }
        $content = Get-Content -Path $_.FullName -Raw
        return $content -match 'id="main-content"'
    } |
    Sort-Object Name
if (-not $htmlFiles) {
    Write-Host 'No HTML files found.'
    exit 1
}

$violations = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw

    foreach ($marker in $requiredMarkers) {
        if ($content -notmatch [regex]::Escape($marker)) {
            $violations += [pscustomobject]@{
                File = $file.Name
                Type = 'Missing marker'
                Detail = $marker
            }
        }
    }

    # Head shell should exist in all pages.
    if ($content -notmatch [regex]::Escape('js/head-shell.js')) {
        $violations += [pscustomobject]@{
            File = $file.Name
            Type = 'Missing head shell include'
            Detail = 'js/head-shell.js'
        }
    }

    # Check ordered script sequence positions.
    $positions = @{}
    foreach ($script in $orderedScripts) {
        $needle = "src=`"$script`""
        $idx = $content.IndexOf($needle, [System.StringComparison]::OrdinalIgnoreCase)
        if ($idx -lt 0) {
            $violations += [pscustomobject]@{
                File = $file.Name
                Type = 'Missing script include'
                Detail = $script
            }
        }
        $positions[$script] = $idx
    }

    for ($i = 0; $i -lt ($orderedScripts.Count - 1); $i++) {
        $current = $orderedScripts[$i]
        $next = $orderedScripts[$i + 1]

        if ($positions[$current] -ge 0 -and $positions[$next] -ge 0 -and $positions[$current] -gt $positions[$next]) {
            $violations += [pscustomobject]@{
                File = $file.Name
                Type = 'Script order'
                Detail = "$current should appear before $next"
            }
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host "Shell conformance failed with $($violations.Count) issue(s):" -ForegroundColor Red
    $violations | Format-Table -AutoSize
    exit 1
}

Write-Host "Shell conformance OK for $($htmlFiles.Count) page(s)." -ForegroundColor Green
exit 0
