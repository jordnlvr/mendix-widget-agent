<#
.SYNOPSIS
    Generate a new Mendix pluggable widget from template
    
.DESCRIPTION
    Creates a complete widget project structure with all files
    populated from the template, replacing placeholders with
    actual widget-specific values.
    
.PARAMETER WidgetName
    PascalCase name for the widget (e.g., SmartButton, DataBadge)
    
.PARAMETER OutputPath
    Directory where widget folder will be created
    
.PARAMETER Company
    Company/package namespace (e.g., blueprintmx)
    
.PARAMETER Author
    Author name for package.json
    
.PARAMETER Category
    Mendix toolbox category: Display, Input, Structure, Data, Navigation
    
.PARAMETER Description
    Brief description of widget purpose
    
.EXAMPLE
    .\Generate-Widget.ps1 -WidgetName "SmartBadge" -Company "blueprintmx" -Category "Display"
    
.NOTES
    Template location: pluggable-widget-templates/templates/widget-template/
#>

param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[A-Z][a-zA-Z0-9]+$')]
  [string]$WidgetName,
    
  [Parameter(Mandatory = $false)]
  [string]$OutputPath = "D:\kelly.seale\CodeBase\PluggableWidgets",
    
  [Parameter(Mandatory = $false)]
  [string]$Company = "blueprintmx",
    
  [Parameter(Mandatory = $false)]
  [string]$Author = "Kelly Seale",
    
  [Parameter(Mandatory = $false)]
  [ValidateSet("Display", "Input", "Structure", "Data controls", "Menus & navigation")]
  [string]$Category = "Display",
    
  [Parameter(Mandatory = $false)]
  [string]$Description = "A custom Mendix pluggable widget"
)

# Configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateDir = Join-Path $ScriptDir "templates\widget-template"

# Derived values
$widgetNameLower = $WidgetName.ToLower()
$companyLower = $Company.ToLower()
$WidgetDir = Join-Path $OutputPath $widgetNameLower
$Version = "1.0.0"
$Year = (Get-Date).Year
$ProjectPath = "D:/kelly.seale/CodeBase/SmartHub-main_ForTesting/"

# Placeholder mappings
$Replacements = @{
  "{{WidgetName}}"         = $WidgetName
  "{{WidgetDisplayName}}"  = $WidgetName  # Same as WidgetName by default, can be customized
  "{{widgetNameLower}}"    = $widgetNameLower
  "{{company}}"            = $Company
  "{{companyLower}}"       = $companyLower
  "{{author}}"             = $Author
  "{{description}}"        = $Description
  "{{version}}"            = $Version
  "{{studioProCategory}}"  = $Category
  "{{year}}"               = $Year.ToString()
  "{{projectPath}}"        = $ProjectPath
  "{{defaultText}}"        = "Hello, $WidgetName"  # Default text for widget display
  "{{needsEntityContext}}" = "false"  # Default to not requiring entity context
}

# ════════════════════════════════════════════════════════════════════════════════
# 🛡️ PRE-FLIGHT CHECK: Verify template vars match $Replacements BEFORE generating
# This catches missing replacements early, preventing broken widgets
# ════════════════════════════════════════════════════════════════════════════════
$templateVarsInFiles = @{}
Get-ChildItem -Path $TemplateDir -Recurse -File -Exclude "*.png", "*.jpg", "*.gif" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
  if ($content) {
    [regex]::Matches($content, '\{\{[^}]+\}\}') | ForEach-Object {
      $templateVarsInFiles[$_.Value] = $true
    }
  }
}

$missingVars = @()
foreach ($var in $templateVarsInFiles.Keys) {
  if (-not $Replacements.ContainsKey($var)) {
    $missingVars += $var
  }
}

if ($missingVars.Count -gt 0) {
  Write-Host ""
  Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
  Write-Host "║  ❌ TEMPLATE ERROR - MISSING REPLACEMENT DEFINITIONS              ║" -ForegroundColor Red
  Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
  Write-Host ""
  Write-Host "The template files use these variables that are NOT in `$Replacements:" -ForegroundColor Yellow
  $missingVars | ForEach-Object { Write-Host "   ⚠️  $_" -ForegroundColor Red }
  Write-Host ""
  Write-Host "FIX: Add these to the `$Replacements hashtable in Generate-Widget.ps1" -ForegroundColor Yellow
  throw "Widget generation aborted - template/replacement mismatch"
}

# Banner
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🔧 MENDIX PLUGGABLE WIDGET GENERATOR              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Widget Name:    " -NoNewline -ForegroundColor Yellow
Write-Host $WidgetName -ForegroundColor White

Write-Host "📁 Output Path:    " -NoNewline -ForegroundColor Yellow
Write-Host $WidgetDir -ForegroundColor White

Write-Host "🏢 Company:        " -NoNewline -ForegroundColor Yellow
Write-Host $Company -ForegroundColor White

Write-Host "📂 Category:       " -NoNewline -ForegroundColor Yellow
Write-Host $Category -ForegroundColor White

Write-Host ""

# Check template exists
if (-not (Test-Path $TemplateDir)) {
  Write-Host "❌ Template directory not found: $TemplateDir" -ForegroundColor Red
  exit 1
}

# Check if widget already exists
if (Test-Path $WidgetDir) {
  Write-Host "⚠️  Widget directory already exists: $WidgetDir" -ForegroundColor Yellow
  $confirm = Read-Host "Overwrite? (y/N)"
  if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled." -ForegroundColor Gray
    exit 0
  }
  Remove-Item -Path $WidgetDir -Recurse -Force
}

# Create widget directory
New-Item -ItemType Directory -Path $WidgetDir -Force | Out-Null
Write-Host "✅ Created: $WidgetDir" -ForegroundColor Green

# Function to process a template file
function Process-TemplateFile {
  param(
    [string]$SourcePath,
    [string]$DestPath
  )
    
  # Read content
  $content = Get-Content -Path $SourcePath -Raw
    
  # Apply all replacements
  foreach ($key in $Replacements.Keys) {
    $content = $content -replace [regex]::Escape($key), $Replacements[$key]
  }
    
  # Ensure destination directory exists
  $destDir = Split-Path -Parent $DestPath
  if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
  }
    
  # Write content
  Set-Content -Path $DestPath -Value $content -NoNewline
}

# Copy and process all template files
Write-Host ""
Write-Host "📝 Processing template files..." -ForegroundColor Cyan

$templateFiles = Get-ChildItem -Path $TemplateDir -Recurse -File

foreach ($file in $templateFiles) {
  # Calculate relative path
  $relativePath = $file.FullName.Substring($TemplateDir.Length + 1)
    
  # Replace WidgetName in path
  $destRelativePath = $relativePath -replace "WidgetName", $WidgetName
  $destPath = Join-Path $WidgetDir $destRelativePath
  
  # Handle binary files (icons) differently - just copy, don't process
  if ($file.Extension -eq ".png" -or $file.Extension -eq ".jpg" -or $file.Extension -eq ".gif") {
    $destDir = Split-Path -Parent $destPath
    if (-not (Test-Path $destDir)) {
      New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    Write-Host "   ✓ $destRelativePath (icon)" -ForegroundColor DarkGray
  }
  else {
    # Process text file (apply template replacements)
    Process-TemplateFile -SourcePath $file.FullName -DestPath $destPath
    Write-Host "   ✓ $destRelativePath" -ForegroundColor DarkGray
  }
}

# Create .gitignore
$gitignore = @"
node_modules/
dist/
typings/
*.mpk
*.log
.DS_Store
"@
Set-Content -Path (Join-Path $WidgetDir ".gitignore") -Value $gitignore

# ════════════════════════════════════════════════════════════════════════════════
# 🛡️ VALIDATION: Scan all generated files for unreplaced template variables
# This prevents the bug where {{companyLower}} was not replaced, breaking Studio Pro
# ════════════════════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "🔍 Validating generated files..." -ForegroundColor Yellow

$validationFailed = $false
$unreplacedVars = @()

Get-ChildItem -Path $WidgetDir -Recurse -File -Exclude "*.png", "*.jpg", "*.gif" | ForEach-Object {
  $fileContent = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
  if ($fileContent -match '\{\{[^}]+\}\}') {
    $matches = [regex]::Matches($fileContent, '\{\{[^}]+\}\}')
    foreach ($match in $matches) {
      $validationFailed = $true
      $unreplacedVars += [PSCustomObject]@{
        File     = $_.Name
        Variable = $match.Value
      }
    }
  }
}

if ($validationFailed) {
  Write-Host ""
  Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
  Write-Host "║  ❌ GENERATION FAILED - UNREPLACED TEMPLATE VARIABLES FOUND       ║" -ForegroundColor Red
  Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
  Write-Host ""
  $unreplacedVars | ForEach-Object {
    Write-Host "   ⚠️  $($_.Variable) in $($_.File)" -ForegroundColor Red
  }
  Write-Host ""
  Write-Host "FIX: Add missing variables to `$Replacements hashtable in Generate-Widget.ps1" -ForegroundColor Yellow
  Write-Host ""
    
  # Clean up the broken widget folder
  Remove-Item -Path $WidgetDir -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "🧹 Cleaned up incomplete widget folder" -ForegroundColor DarkGray
    
  throw "Widget generation aborted due to unreplaced template variables"
}

Write-Host "   ✅ All template variables replaced correctly" -ForegroundColor Green

# ════════════════════════════════════════════════════════════════════════════════
# 🔨 AUTO-BUILD: Run npm install and build automatically
# ════════════════════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔨 BUILDING WIDGET                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Change to widget directory
Push-Location $WidgetDir

try {
  # npm install
  Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
  $npmInstallResult = npm install 2>&1
  $npmInstallExitCode = $LASTEXITCODE
    
  if ($npmInstallExitCode -ne 0) {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ❌ NPM INSTALL FAILED                                            ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host $npmInstallResult -ForegroundColor Red
    throw "npm install failed"
  }
  Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
    
  # npm run build
  Write-Host ""
  Write-Host "🔧 Building widget..." -ForegroundColor Yellow
  $buildOutput = npm run build 2>&1
  $buildExitCode = $LASTEXITCODE
    
  if ($buildExitCode -ne 0) {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ❌ BUILD FAILED                                                  ║" -ForegroundColor Red
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    # Show last 30 lines of build output for error context
    $buildOutput | Select-Object -Last 30 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    throw "npm run build failed"
  }
  Write-Host "   ✅ Build successful" -ForegroundColor Green
    
  # Check MPK was created
  $mpkPath = Join-Path $WidgetDir "dist\$Version\$WidgetName.mpk"
  if (-not (Test-Path $mpkPath)) {
    throw "MPK file not found at expected location: $mpkPath"
  }
  $mpkSize = (Get-Item $mpkPath).Length
  Write-Host "   ✅ MPK created: $WidgetName.mpk ($([math]::Round($mpkSize/1KB, 1)) KB)" -ForegroundColor Green
    
  # ════════════════════════════════════════════════════════════════════════════════
  # 🚀 AUTO-DEPLOY: Copy MPK to target Mendix project
  # ════════════════════════════════════════════════════════════════════════════════
  $deployPath = Join-Path $ProjectPath.TrimEnd('/') "widgets"
  if (Test-Path $deployPath) {
    Write-Host ""
    Write-Host "🚀 Deploying to Mendix project..." -ForegroundColor Yellow
    Copy-Item $mpkPath $deployPath -Force
    Write-Host "   ✅ Deployed to: $deployPath" -ForegroundColor Green
  }
  else {
    Write-Host ""
    Write-Host "⚠️  Skipping auto-deploy: $deployPath not found" -ForegroundColor Yellow
  }
    
  Pop-Location
    
  # ════════════════════════════════════════════════════════════════════════════════
  # ✅ SUCCESS SUMMARY
  # ════════════════════════════════════════════════════════════════════════════════
  Write-Host ""
  Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
  Write-Host "║  ✅ WIDGET GENERATED, BUILT, AND DEPLOYED SUCCESSFULLY!           ║" -ForegroundColor Green
  Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
  Write-Host ""
  Write-Host "📦 Widget:     $WidgetName" -ForegroundColor White
  Write-Host "📁 Location:   $WidgetDir" -ForegroundColor White
  Write-Host "📦 MPK:        $mpkPath" -ForegroundColor White
  Write-Host "🎯 Category:   $Category" -ForegroundColor White
  Write-Host ""
  Write-Host "🎯 NEXT: Open Studio Pro and press F4 to sync!" -ForegroundColor Cyan
  Write-Host ""
    
}
catch {
  Pop-Location
    
  # ════════════════════════════════════════════════════════════════════════════════
  # 🧹 AUTO-CLEANUP: Remove failed widget folder
  # ════════════════════════════════════════════════════════════════════════════════
  Write-Host ""
  Write-Host "🧹 Cleaning up failed widget..." -ForegroundColor Yellow
    
  # Keep the folder for debugging but rename it
  $failedPath = "${WidgetDir}_FAILED_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
  if (Test-Path $WidgetDir) {
    Rename-Item -Path $WidgetDir -NewName (Split-Path $failedPath -Leaf) -Force
    Write-Host "   📁 Failed widget preserved at: $failedPath" -ForegroundColor DarkGray
    Write-Host "   💡 Review the error above, fix the template, then delete this folder" -ForegroundColor DarkGray
  }
    
  Write-Host ""
  Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
  Write-Host "║  ❌ WIDGET GENERATION FAILED                                      ║" -ForegroundColor Red
  Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
  Write-Host ""
  Write-Host "Error: $_" -ForegroundColor Red
  Write-Host ""
    
  exit 1
}
