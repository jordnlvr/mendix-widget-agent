<#
.SYNOPSIS
    Interactive Widget Creation Wizard - A/A+ Grade Experience
    
.DESCRIPTION
    Step-by-step questionnaire for creating Mendix pluggable widgets.
    Eliminates the need to manually write JSON configs.
    Generates config, runs the generator, builds, and deploys.

.EXAMPLE
    .\New-Widget.ps1
    
.EXAMPLE
    .\New-Widget.ps1 -Quick -Name "MyWidget"  # Minimal prompts, defaults
#>

param(
  [switch]$Quick,
  [string]$Name
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Banner
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧙 MENDIX WIDGET WIZARD - Interactive Creator                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

#region Helper Functions
function Read-Choice {
  param(
    [string]$Prompt,
    [string[]]$Options,
    [int]$Default = 0
  )
    
  Write-Host "$Prompt" -ForegroundColor Yellow
  for ($i = 0; $i -lt $Options.Count; $i++) {
    $marker = if ($i -eq $Default) { "→" } else { " " }
    Write-Host "  $marker [$($i+1)] $($Options[$i])" -ForegroundColor $(if ($i -eq $Default) { "Green" } else { "White" })
  }
    
  $choice = Read-Host "Enter choice (1-$($Options.Count)) [Default: $($Default+1)]"
  if ([string]::IsNullOrEmpty($choice)) { return $Default }
  return ([int]$choice - 1)
}

function Read-YesNo {
  param([string]$Prompt, [bool]$Default = $true)
  $defaultText = if ($Default) { "Y/n" } else { "y/N" }
  $response = Read-Host "$Prompt [$defaultText]"
  if ([string]::IsNullOrEmpty($response)) { return $Default }
  return $response.ToLower().StartsWith("y")
}

function Read-Required {
  param([string]$Prompt, [string]$Default = "")
  $defaultText = if ($Default) { " [Default: $Default]" } else { "" }
  do {
    $value = Read-Host "$Prompt$defaultText"
    if ([string]::IsNullOrEmpty($value) -and $Default) { return $Default }
  } while ([string]::IsNullOrEmpty($value))
  return $value
}
#endregion

#region Categories
$Categories = @(
  "Display",
  "Input controls", 
  "Data controls",
  "Navigation",
  "File handling",
  "Utilities"
)
#endregion

#region Property Types Menu
$PropertyTypes = @(
  @{ name = "string"; desc = "Text input (e.g., label, placeholder)" },
  @{ name = "boolean"; desc = "True/false toggle" },
  @{ name = "integer"; desc = "Whole number" },
  @{ name = "decimal"; desc = "Decimal number" },
  @{ name = "enumeration"; desc = "Dropdown selection (define options)" },
  @{ name = "textTemplate"; desc = "Text with parameters from context" },
  @{ name = "expression"; desc = "Dynamic expression (returns value)" },
  @{ name = "action"; desc = "Event handler (on click, on change, etc.)" },
  @{ name = "attribute"; desc = "Entity attribute binding" },
  @{ name = "datasource"; desc = "List of objects (for repeating widgets)" },
  @{ name = "association"; desc = "Entity association reference" },
  @{ name = "image"; desc = "Static or dynamic image" },
  @{ name = "icon"; desc = "Icon from library" },
  @{ name = "widgets"; desc = "Container for child widgets" },
  @{ name = "object"; desc = "Group of nested properties" }
)
#endregion

# ===== STEP 1: Basic Info =====
Write-Host "📋 STEP 1: Basic Widget Information" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray

if ($Quick -and $Name) {
  $widgetName = $Name
}
else {
  $widgetName = Read-Required "Widget Name (PascalCase, e.g., StatusIndicator)"
}

# Validate PascalCase
if ($widgetName -notmatch "^[A-Z][a-zA-Z0-9]+$") {
  Write-Host "⚠️  Converting to PascalCase..." -ForegroundColor Yellow
  $widgetName = (Get-Culture).TextInfo.ToTitleCase($widgetName.ToLower()) -replace '\s', ''
}

$displayName = Read-Required "Display Name (shown in Studio Pro)" "$($widgetName -creplace '([A-Z])', ' $1'.Trim())"
$description = Read-Required "Description" "A custom $displayName widget"

Write-Host ""
Write-Host "📂 STEP 2: Widget Category" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray

$categoryIdx = Read-Choice "Select widget category:" $Categories 0
$category = $Categories[$categoryIdx]

# Company prefix
$company = Read-Required "Company prefix (for package naming)" "blueprintmx"

Write-Host ""
Write-Host "✅ Basic info captured:" -ForegroundColor Green
Write-Host "   Name: $widgetName | Display: $displayName | Category: $category" -ForegroundColor DarkGray

# ===== STEP 3: Properties =====
Write-Host ""
Write-Host "🎛️  STEP 3: Widget Properties" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "Properties define what data and settings your widget accepts." -ForegroundColor DarkGray
Write-Host ""

$properties = @()
$addMore = Read-YesNo "Add properties to your widget?" $true

while ($addMore) {
  Write-Host ""
  Write-Host "   Available property types:" -ForegroundColor Cyan
  for ($i = 0; $i -lt $PropertyTypes.Count; $i++) {
    $pt = $PropertyTypes[$i]
    Write-Host "   [$($i+1)] $($pt.name.PadRight(15)) - $($pt.desc)" -ForegroundColor White
  }
  Write-Host ""
    
  $typeChoice = Read-Host "Select property type (1-$($PropertyTypes.Count))"
  $propType = $PropertyTypes[[int]$typeChoice - 1]
    
  $propKey = Read-Required "   Property key (camelCase, e.g., statusType)"
  $propCaption = Read-Required "   Caption (shown in Studio Pro)" "$($propKey -creplace '([A-Z])', ' $1'.Trim())"
  $propDesc = Read-Required "   Description" "The $propCaption property"
  $propRequired = Read-YesNo "   Required?" $true
    
  $property = @{
    key         = $propKey
    type        = $propType.name
    caption     = $propCaption
    description = $propDesc
    required    = $propRequired
  }
    
  # Type-specific options
  switch ($propType.name) {
    "string" {
      $hasDefault = Read-YesNo "   Set default value?" $false
      if ($hasDefault) {
        $property.defaultValue = Read-Required "   Default value"
      }
    }
    "boolean" {
      $property.defaultValue = Read-YesNo "   Default value?" $true
    }
    "integer" {
      $hasDefault = Read-YesNo "   Set default value?" $true
      if ($hasDefault) {
        $property.defaultValue = [int](Read-Required "   Default value" "0")
      }
    }
    "enumeration" {
      Write-Host "   Define enum values (comma-separated, e.g., info,warning,error,success):" -ForegroundColor Yellow
      $enumValues = Read-Required "   Values"
      $property.enumValues = @($enumValues -split ',' | ForEach-Object { $_.Trim() })
      $property.defaultValue = $property.enumValues[0]
    }
    "textTemplate" {
      $hasDefault = Read-YesNo "   Set default value?" $false
      if ($hasDefault) {
        $property.defaultValue = Read-Required "   Default value"
      }
    }
    "expression" {
      $returnType = Read-Required "   Return type (string, boolean, integer, decimal, DateTime)" "string"
      $property.returnType = $returnType
    }
    "attribute" {
      Write-Host "   Attribute types (comma-separated, e.g., String,Integer,Boolean):" -ForegroundColor Yellow
      $attrTypes = Read-Required "   Allowed types" "String"
      $property.attributeTypes = @($attrTypes -split ',' | ForEach-Object { $_.Trim() })
    }
    "datasource" {
      Write-Host "   ℹ️  Datasource created. Add 'widgets' property for content." -ForegroundColor Cyan
      $property.isList = $true
    }
    "widgets" {
      Write-Host "   ℹ️  Widget container created. Usually paired with datasource." -ForegroundColor Cyan
    }
  }
    
  $properties += $property
  Write-Host "   ✅ Added: $propKey ($($propType.name))" -ForegroundColor Green
    
  $addMore = Read-YesNo "`n   Add another property?" $true
}

# ===== STEP 4: Events =====
Write-Host ""
Write-Host "🎯 STEP 4: Events (Actions)" -ForegroundColor Magenta
Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "Events allow users to configure what happens on interactions." -ForegroundColor DarkGray
Write-Host ""

$events = @()
$addEvents = Read-YesNo "Add event handlers (onClick, onChange, etc.)?" $true

while ($addEvents) {
  $eventKey = Read-Required "   Event key (e.g., onClick, onSelect, onLoad)"
  $eventCaption = Read-Required "   Caption" "$($eventKey -creplace '([A-Z])', ' $1'.Trim())"
    
  $events += @{
    key         = $eventKey
    type        = "action"
    caption     = $eventCaption
    description = "Triggered when $eventCaption"
    required    = $false
  }
    
  Write-Host "   ✅ Added event: $eventKey" -ForegroundColor Green
  $addEvents = Read-YesNo "`n   Add another event?" $false
}

# ===== Summary =====
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  📋 WIDGET CONFIGURATION SUMMARY                                  ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "   Widget: $widgetName ($displayName)" -ForegroundColor White
Write-Host "   Category: $category | Company: $company" -ForegroundColor White
Write-Host "   Properties: $($properties.Count)" -ForegroundColor White
foreach ($p in $properties) {
  Write-Host "      • $($p.key) ($($p.type))" -ForegroundColor DarkGray
}
Write-Host "   Events: $($events.Count)" -ForegroundColor White
foreach ($e in $events) {
  Write-Host "      • $($e.key)" -ForegroundColor DarkGray
}
Write-Host ""

# ===== Generate Config =====
$proceed = Read-YesNo "Generate widget?" $true
if (-not $proceed) {
  Write-Host "Cancelled." -ForegroundColor Yellow
  exit 0
}

# Build config object
$config = @{
  widget     = @{
    name        = $widgetName
    displayName = $displayName
    description = $description
    category    = $category
    company     = $company
  }
  properties = $properties
  events     = $events
}

# Save config
$configDir = Join-Path $ScriptDir "widget-configs"
if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Path $configDir | Out-Null }
$configPath = Join-Path $configDir "$($widgetName.ToLower())-config.json"
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

Write-Host ""
Write-Host "💾 Config saved: $configPath" -ForegroundColor Cyan

# Run generator
Write-Host ""
Write-Host "🚀 Running generator..." -ForegroundColor Yellow
& "$ScriptDir\Generate-WidgetFromConfig.ps1" -ConfigPath $configPath

Write-Host ""
Write-Host "🎉 Widget wizard complete!" -ForegroundColor Green
