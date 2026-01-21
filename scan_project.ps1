Write-Host "SCANNING PROJECT STRUCTURE..."

Write-Host "`nFILES AT ROOT"
Get-ChildItem

Write-Host "`nCHECKING PACKAGE.JSON"
if (Test-Path package.json) {
    Get-Content package.json
} else {
    Write-Host "package.json MISSING"
}

Write-Host "`nCHECKING ENTRY HTML"
if (Test-Path index.html) {
    Get-Content index.html
} elseif (Test-Path public\index.html) {
    Get-Content public\index.html
} else {
    Write-Host "index.html NOT FOUND"
}

Write-Host "`nSEARCHING UI UIX FOLDER"
Get-ChildItem -Recurse | Where-Object { $_.Name -match "uix|ui|UIX|UI" }

Write-Host "`nSEARCHING IMPORTS THAT MAY BE BROKEN"
Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Select-String "UIX|uix|ui/|UI/"

Write-Host "`nCHECKING BUILD OUTPUT"
if (Test-Path dist) {
    Write-Host "FOUND dist FOLDER"
    Get-ChildItem dist
} elseif (Test-Path build) {
    Write-Host "FOUND build FOLDER"
    Get-ChildItem build
} else {
    Write-Host "NO BUILD OUTPUT FOUND"
}

Write-Host "`nSCAN COMPLETE"
