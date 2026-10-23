# ============================================================================
# tools/export-site-for-llm.ps1
# Export Validum Site to a single Markdown file for LLM analysis.
# ============================================================================

param(
    [string]$Output = "llm-export-site.md"
)

$ErrorActionPreference = "Stop"

# 1. Project root
$root = (Get-Item -LiteralPath ".").FullName
$outPath = Join-Path $root $Output

# 2. Exclude lists
$excludeDirs = @(
    '.git', 'node_modules', 'dist', '.astro', '.idea', '.vscode', '.output'
)

$excludeFiles = @(
    'package-lock.json', 'llm-export-site.md', '.DS_Store'
)

$excludeExt = @(
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.map'
)

# 3. Collect files
Write-Host "Root: $root" -ForegroundColor Cyan
Write-Host "Output: $outPath" -ForegroundColor Cyan

$allFiles = Get-ChildItem -Path $root -Recurse -File -Force | Where-Object {
    $rel   = $_.FullName.Substring($root.Length).TrimStart('\', '/')
    $parts = $rel -split '[\\/]'

    foreach ($p in $parts) {
        if ($excludeDirs -contains $p) { return $false }
    }
    if ($excludeFiles -contains $_.Name) { return $false }

    $ext = $_.Extension.ToLower()
    if ($excludeExt -contains $ext) { return $false }

    return $true
} | Sort-Object FullName

# 4. Build Markdown
$sb = [System.Text.StringBuilder]::new()
function W { param([string]$s = '') [void]$sb.AppendLine($s) }

W '# Validum Site - Export for LLM'
W ''
W ("> **Date:** $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
W ("> **Root:** ``$root``")
W ("> **Files:** $($allFiles.Count)")
W ''

W '## File Tree'
W ''
W '```text'
foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($root.Length).TrimStart('\', '/')
    $relUnix = $rel -replace '\\', '/'
    W $relUnix
}
W '```'
W ''

W '## Files'
W ''

foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($root.Length).TrimStart('\', '/')
    $relUnix = $rel -replace '\\', '/'

    # Language detection for syntax highlighting
    $lang = 'text'
    switch ($f.Extension.ToLower()) {
        '.astro' { $lang = 'astro' }
        '.tsx'   { $lang = 'tsx' }
        '.ts'    { $lang = 'typescript' }
        '.css'   { $lang = 'css' }
        '.json'  { $lang = 'json' }
        '.mjs'   { $lang = 'javascript' }
        '.md'    { $lang = 'markdown' }
        '.yml'   { $lang = 'yaml' }
        '.yaml'  { $lang = 'yaml' }
    }

    W ("### ``$relUnix``")
    W ''
    W ('```' + $lang)
    try {
        $content = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
        if ($content.Length -gt 0) { W $content.TrimEnd() }
    } catch {
        W "[Read error: $($_.Exception.Message)]"
    }
    W '```'
    W ''
}

W '---'
W ("**End of export.** Files: $($allFiles.Count)")

# 5. Write output
[System.IO.File]::WriteAllText(
    $outPath,
    $sb.ToString(),
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "Done: $outPath" -ForegroundColor Green
Write-Host "  Files: $($allFiles.Count)" -ForegroundColor Green