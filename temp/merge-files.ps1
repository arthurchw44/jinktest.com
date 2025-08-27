# 1) Build output path: C:\Users\<User>\Desktop\temp\code_react_yyyymmdd.txt
$today = Get-Date -Format 'yyyyMMdd'  # yyyymmdd
$desktop = [Environment]::GetFolderPath('Desktop')
$outDir = Join-Path $desktop 'temp'
$outFile = Join-Path $outDir ("code_react_{0}.txt" -f $today)

# 2) Ensure output directory exists
if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

# 3) Remove previous file for today if present
Remove-Item -Path $outFile -ErrorAction SilentlyContinue

# 4) Merge: list path, then append content of each file
#    Adjust -Include to target specific extensions if desired, e.g., -Include *.ts,*.tsx,*.js,*.json
Get-ChildItem -Recurse -File -Include *.* | ForEach-Object {
  Add-Content -Path $outFile -Value "`n$($_.FullName)`n"
  Get-Content -LiteralPath $_.FullName | Add-Content -Path $outFile
}


#==========================

Remove-Item -ErrorAction SilentlyContinue merged.txt;

Get-ChildItem -Recurse -Include *.* | ForEach-Object {
    Add-Content merged.txt "`n$($_.FullName)`n"
    Get-Content $_ | Add-Content merged.txt
}

#=======

#PS C:\Users\User\Desktop\JinkAPIServer> cd src                      
#PS C:\Users\User\Desktop\JinkAPIServer\src> ..\script-ps\merge-files.ps1