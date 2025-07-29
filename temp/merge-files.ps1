Get-ChildItem -Recurse -Include *.* | ForEach-Object {
    Add-Content merged.txt "`n$($_.FullName)`n"
    Get-Content $_ | Add-Content merged.txt
}


#PS C:\Users\User\Desktop\JinkAPIServer> cd src                      
#PS C:\Users\User\Desktop\JinkAPIServer\src> ..\script-ps\merge-files.ps1