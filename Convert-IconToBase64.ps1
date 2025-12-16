<#
.SYNOPSIS
    Convert a PNG image to base64 for Mendix widget icon
    
.DESCRIPTION
    Takes a PNG file and outputs the base64-encoded string
    suitable for use in a Mendix widget XML <icon> element.
    
.PARAMETER PngPath
    Path to the PNG image file (recommended: 256x256 or smaller)
    
.PARAMETER OutputFile
    Optional file to write the base64 string to
    
.EXAMPLE
    .\Convert-IconToBase64.ps1 -PngPath ".\my-icon.png"
    
.EXAMPLE
    .\Convert-IconToBase64.ps1 -PngPath ".\icon.png" -OutputFile ".\icon-base64.txt"
    
.NOTES
    Recommended icon size: 64x64 or 128x128 pixels
    Format: PNG with transparency
#>

param(
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path $_ })]
  [string]$PngPath,
    
  [Parameter(Mandatory = $false)]
  [string]$OutputFile
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🎨 PNG to Base64 Converter for Mendix Widget Icons" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Validate it's a PNG
$extension = [System.IO.Path]::GetExtension($PngPath).ToLower()
if ($extension -ne ".png") {
  Write-Host "⚠️  Warning: File is not a PNG. Mendix icons should be PNG format." -ForegroundColor Yellow
}

# Get file info
$file = Get-Item $PngPath
Write-Host "📁 File: $($file.Name)" -ForegroundColor White
Write-Host "📏 Size: $([math]::Round($file.Length / 1KB, 2)) KB" -ForegroundColor White

# Read and convert
Write-Host ""
Write-Host "Converting..." -ForegroundColor Gray

$bytes = [System.IO.File]::ReadAllBytes($PngPath)
$base64 = [Convert]::ToBase64String($bytes)

Write-Host "✅ Conversion complete!" -ForegroundColor Green
Write-Host "📊 Base64 length: $($base64.Length) characters" -ForegroundColor White

# Output
if ($OutputFile) {
  Set-Content -Path $OutputFile -Value $base64
  Write-Host ""
  Write-Host "💾 Saved to: $OutputFile" -ForegroundColor Green
}
else {
  Write-Host ""
  Write-Host "📋 Base64 string (copy to <icon> element in widget XML):" -ForegroundColor Yellow
  Write-Host ""
  Write-Host $base64 -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Usage in widget XML:" -ForegroundColor Cyan
Write-Host @"
<icon>
$base64
</icon>
"@ -ForegroundColor DarkGray

# Copy to clipboard if possible
try {
  Set-Clipboard -Value $base64
  Write-Host ""
  Write-Host "📋 Copied to clipboard!" -ForegroundColor Green
}
catch {
  # Clipboard not available
}

Write-Host ""
