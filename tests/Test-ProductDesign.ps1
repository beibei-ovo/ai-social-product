$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$documents = @(Get-ChildItem -LiteralPath $projectRoot -File -Filter 'Backstory-*.md')
if ($documents.Count -ne 1) {
    throw "Expected one Backstory design document, found $($documents.Count)."
}

$document = (Get-Content -Raw -Encoding UTF8 -LiteralPath $documents[0].FullName) -replace '\r\n', "`n"
$requiredItems = @(
    '^# Backstory .+$'
    '^## 7\. App Store Description$'
    'What are you curious about\?'
    'Browse topics'
    'Follow circle'
    'Ask Maya'
    'Add to story'
    'My AI'
    'Review draft'
    '^> Every story has a .+$'
)
foreach ($item in $requiredItems) {
    if ($document -notmatch "(?m)$item") {
        throw "Missing design deliverable or screen copy: $item"
    }
}

$topics = @('Gaming', 'Life', 'Travel', 'Work', 'Hobbies', 'Relationships')
foreach ($topic in $topics) {
    if ($document -notmatch "(?m)^\| $topic \| [^|]+\| [^|]+\|$") {
        throw "Missing sample circle and story for topic: $topic"
    }
}

$requirements = [regex]::Matches($document, '(?m)^\| (R-\d{2}) [^\r\n]+')
$cases = [regex]::Matches($document, '(?m)^\| (AC-\d{2}) \| [^|]+\| [^|]+\|$')
if ($requirements.Count -lt 9 -or $cases.Count -lt 13) {
    throw 'Expected coverage for discovery, publishing, AI answers, and human follow-up.'
}

$requirementIds = @($requirements | ForEach-Object { $_.Groups[1].Value })
if (@($requirementIds | Sort-Object -Unique).Count -ne $requirementIds.Count) {
    throw 'Requirement IDs must be unique.'
}

$caseIds = @($cases | ForEach-Object { $_.Groups[1].Value })
if (@($caseIds | Sort-Object -Unique).Count -ne $caseIds.Count) {
    throw 'Acceptance case IDs must be unique.'
}

$referencedCases = foreach ($requirement in $requirements) {
    $references = [regex]::Matches($requirement.Value, 'AC-\d{2}')
    if ($references.Count -eq 0) {
        throw "$($requirement.Groups[1].Value) has no acceptance case."
    }
    foreach ($reference in $references) {
        if ($reference.Value -notin $caseIds) {
            throw "Undefined acceptance case: $($reference.Value)"
        }
        $reference.Value
    }
}

$unmappedCases = @($caseIds | Where-Object { $_ -notin $referencedCases })
if ($unmappedCases.Count -gt 0) {
    throw "Unmapped acceptance cases: $($unmappedCases -join ', ')"
}

Write-Output "Validated $($requirements.Count) requirements, $($cases.Count) acceptance cases, six sample topics, and App Store copy."
