# update.ps1 — equivalente ao update.sh para quem prefere agendar via
# Task Scheduler chamando PowerShell diretamente, sem depender do Git Bash.
#
# Como agendar (Task Scheduler):
#   Ação: Iniciar um programa
#   Programa/script: powershell.exe
#   Argumentos:      -NoProfile -ExecutionPolicy Bypass -File "C:\caminho\do\projeto\update.ps1"
#   Disparador:       repetir a cada 30 minutos, indefinidamente

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

try {
    git rev-parse --is-inside-work-tree | Out-Null
} catch {
    Write-Host "[$Timestamp] ❌ Esta pasta não é um repositório git: $ScriptDir"
    exit 1
}

git add -A

$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "[$Timestamp] ℹ️  Nada para atualizar (sem alterações locais)."
    exit 0
}

git commit -m "auto update ($Timestamp)" | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[$Timestamp] ❌ Falha ao commitar as alterações."
    exit 1
}

$branch = git rev-parse --abbrev-ref HEAD
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "[$Timestamp] ✔️  Alterações enviadas para origin/$branch com sucesso."
} else {
    Write-Host "[$Timestamp] ❌ Falha ao enviar para o GitHub (verifique sua conexão/credenciais)."
    exit 1
}
