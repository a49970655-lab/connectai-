# 디버그용 PowerShell 스크립트: 바탕화면 내 모든 파일과 시간 확인

$userShellFolders = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders"
$desktop = [System.Environment]::ExpandEnvironmentVariables($userShellFolders.Desktop)
Write-Host "Desktop path: $desktop"

if (Test-Path $desktop) {
    $files = Get-ChildItem -Path $desktop -File
    Write-Host "Files in Desktop: $($files.Count)"
    foreach ($f in $files) {
        Write-Host "File: $($f.Name) | LastWriteTime: $($f.LastWriteTime)"
    }
} else {
    Write-Warning "Desktop path not found."
}
