param([string]$ReadbackPath)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$files = @(Get-ChildItem -LiteralPath $root -File -Filter '*Backstory.md')
if ($files.Count -ne 1) { throw 'Expected one delivery narrative.' }
$content = Get-Content -Raw -Encoding UTF8 -LiteralPath $files[0].FullName
$fields = @{
    'App Name' = 30
    'Subtitle' = 30
    'Promotional Text' = 170
    'Description' = 4000
    'Keywords' = 100
}
foreach ($field in $fields.Keys) {
    $pattern = '(?s)### ' + [regex]::Escape($field) + '\s+```text\s*\r?\n(.*?)\r?\n```'
    $match = [regex]::Match($content, $pattern)
    if (-not $match.Success) { throw "Missing App Store field: $field" }
    $value = $match.Groups[1].Value
    $length = $value.Length
    if ($field -eq 'Keywords') { $length = [Text.Encoding]::UTF8.GetByteCount($value) }
    if ($length -gt $fields[$field]) { throw "$field exceeds its limit: $length" }
    Write-Output "$field validated ($length/$($fields[$field]))"
}
$html = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root 'index.html')
if ($html -notmatch 'const photoCatalog = \{' -or $html -notmatch 'renderMyAI' -or $html -notmatch 'function renderDM') {
    throw 'The attached HTML must contain the latest photo feed, AI chat, and direct chats.'
}
if ($content -match '__[A-Z_]+__') { throw 'Unresolved delivery placeholder.' }
Write-Output 'Delivery content and standalone HTML validated.'
if ($ReadbackPath) {
    $remote = Get-Content -Raw -Encoding UTF8 -LiteralPath $ReadbackPath
    if ([regex]::Matches($remote, '<image\s+token=').Count -ne 3) { throw 'Expected three uploaded previews.' }
    if ($remote -notmatch '<file\s+token="[^"]+"\s+name="index\.html"') { throw 'Missing HTML attachment.' }
    foreach ($heading in @('## 一、先打开 Demo 看一遍', '## 二、App Store 产品介绍文案', '## 三、我为什么这样设计')) {
        if (-not $remote.Contains($heading)) { throw "Missing remote section: $heading" }
    }
    foreach ($field in $fields.Keys) {
        $source = [regex]::Match($content, '(?s)### ' + [regex]::Escape($field) + '\s+```text\s*\r?\n(.*?)\r?\n```').Groups[1].Value
        $published = [regex]::Match($remote, '(?s)### ' + [regex]::Escape($field) + '\s+```plaintext\s*\r?\n(.*?)\r?\n```').Groups[1].Value
        if (($source -replace '\r\n', "`n").Trim() -cne ($published -replace '\r\n', "`n").Trim()) { throw "Published field differs: $field" }
    }
    Write-Output 'Feishu readback validated: three sections, HTML attachment, three previews, and all App Store fields.'
}
