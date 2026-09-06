param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("human", "researcher", "experimenter", "analyzer", "reviewer")]
    [string]$Identity,

    [Parameter(Mandatory=$false)]
    [string]$Message,

    [Parameter(Mandatory=$false)]
    [string[]]$ExtraArgs
)

# SSH key paths
$keyDir = "$env:USERPROFILE\.ssh"
$keys = @{
    "human"        = "$keyDir\scire_human"
    "researcher"   = "$keyDir\scire_agent_researcher"
    "experimenter" = "$keyDir\scire_agent_experimenter"
    "analyzer"     = "$keyDir\scire_agent_analyzer"
    "reviewer"     = "$keyDir\scire_agent_reviewer"
}

$keyPath = $keys[$Identity]
if (-not (Test-Path "$keyPath.pub")) {
    Write-Error "No signing key found at $keyPath. Run ssh-keygen first."
    exit 1
}

$names = @{
    "human"        = "Daleth-Barreto"
    "researcher"   = "scire-researcher"
    "experimenter" = "scire-experimenter"
    "analyzer"     = "scire-analyzer"
    "reviewer"     = "scire-reviewer"
}
$emails = @{
    "human"        = "alandaleth.hb@gmail.com"
    "researcher"   = "researcher@scire.local"
    "experimenter" = "experimenter@scire.local"
    "analyzer"     = "analyzer@scire.local"
    "reviewer"     = "reviewer@scire.local"
}

$isReview = $Identity -eq "human"
if ($isReview -and $Message -notmatch "^review:") {
    $Message = "review: $Message"
}

Write-Host "Daleth. Committing as $($names[$Identity]) (signed by $Identity)" -ForegroundColor Cyan
Write-Host "Signing key: $keyPath" -ForegroundColor DarkGray

$env:GIT_SSH_COMMAND = "ssh -i `"$keyPath`" -o IdentitiesOnly=yes"

git config user.name "$($names[$Identity])"
git config user.email "$($emails[$Identity])"
git config user.signingkey "$keyPath"
git config gpg.format ssh
git config commit.gpgsign true
git config tag.gpgsign true

if ($ExtraArgs) {
    git commit -S -m $Message @ExtraArgs
} else {
    git commit -S -m $Message
}
$result = $LASTEXITCODE
if ($result -eq 0) {
    Write-Host "Commit signed by $Identity OK. Trailer: Signed-off-by: $($names[$Identity]) <$($emails[$Identity])>"
}
exit $result