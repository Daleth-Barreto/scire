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

# Solo el humano lleva correo (el real, tuyo). Los agentes NO llevan correo.
$emails = @{
    "human"        = "alandaleth.hb@gmail.com"
    "researcher"   = ""
    "experimenter" = ""
    "analyzer"     = ""
    "reviewer"     = ""
}

$isReview = $Identity -eq "human"

$gitName = $names[$Identity]
$gitEmail = $emails[$Identity]

# Los agentes no llevan correo: user.email= vacío (literal), el humano lleva el real.
if ($isReview) {
    $emailArg = "-c", "user.email=$gitEmail"
} else {
    $emailArg = "-c", "user.email="
}

Write-Host "Daleth. Committing as $gitName (signed by $Identity)" -ForegroundColor Cyan
Write-Host "Signing key: $keyPath" -ForegroundColor DarkGray

$env:GIT_SSH_COMMAND = "ssh -i `"$keyPath`" -o IdentitiesOnly=yes"

git config user.signingkey "$keyPath"
git config gpg.format ssh
git config commit.gpgsign true
git config tag.gpgsign true

if ($isReview -and $Message -notmatch "^review:") {
    $Message = "review: $Message"
}

if (-not $isReview) {
    Write-Host "Nota: los commits de agentes no llevan correo (identidad sin email)." -ForegroundColor DarkYellow
}

$identity = @("git", "-c", "user.name=$gitName") + $emailArg

if ($ExtraArgs) {
    & $identity commit -S -m $Message @ExtraArgs
} else {
    & $identity commit -S -m $Message
}
$result = $LASTEXITCODE
if ($result -eq 0) {
    Write-Host "Commit signed by $Identity OK."
}
exit $result