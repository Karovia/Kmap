param(
  [string]$Repo = 'Karovia/Kmap',
  [string]$IssuesFile = 'scripts/github-issues.json'
)

$ErrorActionPreference = 'Stop'

function Assert-GitHubAuth {
  gh auth status | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw 'GitHub CLI authentication is invalid. Run `gh auth login` first.'
  }
}

function Get-ExistingIssueTitles {
  $raw = gh issue list -R $Repo --limit 200 --json title
  if ($LASTEXITCODE -ne 0) {
    throw 'Failed to query existing issues from GitHub.'
  }

  if ([string]::IsNullOrWhiteSpace($raw)) {
    return @()
  }

  $items = $raw | ConvertFrom-Json
  return @($items | ForEach-Object { $_.title })
}

if (-not (Test-Path $IssuesFile)) {
  throw "Issues file not found: $IssuesFile"
}

Assert-GitHubAuth

$issuesJson = Get-Content -Raw -Encoding utf8 $IssuesFile
$issues = $issuesJson | ConvertFrom-Json
$existingTitles = Get-ExistingIssueTitles

foreach ($issue in $issues) {
  if ($existingTitles -contains $issue.title) {
    Write-Host "Skip existing issue: $($issue.title)"
    continue
  }

  gh issue create -R $Repo --title $issue.title --body $issue.body | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create issue: $($issue.title)"
  }
  Write-Host "Created issue: $($issue.title)"
}
