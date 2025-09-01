# 1) Build output path: C:\Users\<User>\Desktop\temp\code_react_yyyymmdd.txt
$today  = Get-Date -Format 'yyyyMMdd'  # yyyymmdd  
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
  # Use `n (LF) for explicit separators around file paths
  Add-Content -Path $outFile -Value "`n$($_.FullName)`n" -Encoding UTF8  # UTF-8 write [1][4]
  # Read file as UTF-8 (raw to avoid per-line encoding ambiguities) and append as UTF-8
  $content = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8    # UTF-8 read [1][2]
  Add-Content -Path $outFile -Value $content -Encoding UTF8              # UTF-8 write [1]
}

# ==========================

# Optional alt block kept for reference
Remove-Item -ErrorAction SilentlyContinue merged.txt  # no encoding needed here [1]
Get-ChildItem -Recurse -Include *.* | ForEach-Object {
  Add-Content merged.txt "`n$($_.FullName)`n" -Encoding UTF8             # UTF-8 write [1]
  $c = Get-Content $_ -Raw -Encoding UTF8                                 # UTF-8 read [1]
  Add-Content merged.txt $c -Encoding UTF8                                # UTF-8 write [1]
}

# ==========================
# Final normalization: convert any CRLF or lone CR to LF-only
# - Read entire file as a single string (-Raw) in UTF-8, replace \r\n -> \n, and lone \r -> \n
# - Write back as UTF-8 with -NoNewline so no trailing CRLF is appended
#   Result: the file contains only LF (0x0A) line endings, preserved Unicode
$txt = Get-Content -Raw -LiteralPath $outFile -Encoding UTF8              # UTF-8 read [1][2]
$txt = $txt -replace "`r`n", "`n" -replace "`r", "`n"                     # Normalize EOL [5]
Set-Content -LiteralPath $outFile -Value $txt -Encoding UTF8 -NoNewline   # UTF-8 write, no extra EOL [6][1]
