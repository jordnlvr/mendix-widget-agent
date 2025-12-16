<#
.SYNOPSIS
    Generate a Mendix widget from a JSON configuration file
    
.DESCRIPTION
    Reads a widget config JSON and generates a complete, building widget
    with all specified properties, events, and structure.
    
.PARAMETER ConfigPath
    Path to widget configuration JSON file
    
.PARAMETER OutputPath
    Directory where widget folder will be created
    
.PARAMETER SkipBuild
    Skip npm install and build (for debugging)

.EXAMPLE
    .\Generate-WidgetFromConfig.ps1 -ConfigPath "widget-configs\example-simple.json"
    
.EXAMPLE
    .\Generate-WidgetFromConfig.ps1 -ConfigPath "widget-configs\my-widget.json" -OutputPath "C:\Widgets"
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$ConfigPath,
    
  [Parameter(Mandatory = $false)]
  [string]$OutputPath = "D:\kelly.seale\CodeBase\PluggableWidgets",
    
  [Parameter(Mandatory = $false)]
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateDir = Join-Path $ScriptDir "templates\widget-template"
$ProjectPath = "D:/kelly.seale/CodeBase/SmartHub-main_ForTesting/"

# ════════════════════════════════════════════════════════════════════════════════
# 📖 LOAD AND VALIDATE CONFIG
# ════════════════════════════════════════════════════════════════════════════════

if (-not [System.IO.Path]::IsPathRooted($ConfigPath)) {
  $ConfigPath = Join-Path $ScriptDir $ConfigPath
}

if (-not (Test-Path $ConfigPath)) {
  Write-Host "❌ Config file not found: $ConfigPath" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔧 MENDIX WIDGET GENERATOR (Config-Driven)                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

# Support both flat and nested config formats
# Flat: { name, description, category, ... }
# Nested: { widget: { name, description, category, ... }, properties: [...] }
if ($config.widget) {
  # Nested format - flatten it
  $widgetConfig = $config.widget
  $propsConfig = $config.properties
  $eventsConfig = $config.events
}
else {
  # Flat format
  $widgetConfig = $config
  $propsConfig = $config.properties
  $eventsConfig = $config.events
}

# Validate required fields
if (-not $widgetConfig.name -or -not $widgetConfig.description -or -not $widgetConfig.category) {
  Write-Host "❌ Config must have: name, description, category" -ForegroundColor Red
  exit 1
}

# Apply defaults
$WidgetName = $widgetConfig.name
$widgetNameLower = $WidgetName.ToLower()
$DisplayName = if ($widgetConfig.displayName) { $widgetConfig.displayName } else { $WidgetName }
$Description = $widgetConfig.description
$Category = $widgetConfig.category
$Company = if ($widgetConfig.company) { $widgetConfig.company } else { "blueprintmx" }
$Author = if ($widgetConfig.author) { $widgetConfig.author } else { "Kelly Seale" }
$NeedsEntityContext = if ($null -ne $widgetConfig.needsEntityContext) { $widgetConfig.needsEntityContext.ToString().ToLower() } else { "false" }
$OfflineCapable = if ($null -ne $widgetConfig.offlineCapable) { $widgetConfig.offlineCapable.ToString().ToLower() } else { "true" }
$Version = "1.0.0"
$Year = (Get-Date).Year

$WidgetDir = Join-Path $OutputPath $widgetNameLower

Write-Host "📦 Widget:      $WidgetName ($DisplayName)" -ForegroundColor White
Write-Host "📁 Output:      $WidgetDir" -ForegroundColor White
Write-Host "🏢 Company:     $Company" -ForegroundColor White
Write-Host "📂 Category:    $Category" -ForegroundColor White
Write-Host "📋 Properties:  $($propsConfig.Count)" -ForegroundColor White
Write-Host "🎯 Events:      $($eventsConfig.Count)" -ForegroundColor White
Write-Host ""

# ════════════════════════════════════════════════════════════════════════════════
# 🔨 GENERATE WIDGET XML
# ════════════════════════════════════════════════════════════════════════════════

function Generate-PropertyXml {
  param($prop)
    
  $xml = ""
  $required = if ($prop.required -eq $false) { 'required="false"' } else { "" }
  $defaultVal = if ($prop.defaultValue) { "defaultValue=`"$($prop.defaultValue)`"" } else { "" }
    
  switch ($prop.type) {
    "string" {
      $xml = @"
                <property key="$($prop.key)" type="string" $required>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "boolean" {
      $defVal = if ($null -ne $prop.defaultValue) { $prop.defaultValue.ToString().ToLower() } else { "false" }
      $xml = @"
                <property key="$($prop.key)" type="boolean" defaultValue="$defVal">
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "integer" {
      $defVal = if ($prop.defaultValue) { $prop.defaultValue } else { "0" }
      $xml = @"
                <property key="$($prop.key)" type="integer" defaultValue="$defVal">
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "decimal" {
      $defVal = if ($prop.defaultValue) { $prop.defaultValue } else { "0" }
      $xml = @"
                <property key="$($prop.key)" type="decimal" defaultValue="$defVal">
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "textTemplate" {
      $xml = @"
                <property key="$($prop.key)" type="textTemplate" $required>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "enumeration" {
      $optionsXml = ""
      # Support both formats:
      # 1. options: [{ key: "x", caption: "X" }, ...]
      # 2. enumValues: ["x", "y", "z"]
      $enumOptions = if ($prop.options) { 
        $prop.options 
      }
      elseif ($prop.enumValues) {
        $prop.enumValues | ForEach-Object { 
          @{ key = $_; caption = (Get-Culture).TextInfo.ToTitleCase($_) }
        }
      }
      else { 
        @() 
      }
      
      foreach ($opt in $enumOptions) {
        $optKey = if ($opt.key) { $opt.key } else { $opt }
        $optCaption = if ($opt.caption) { $opt.caption } else { (Get-Culture).TextInfo.ToTitleCase($optKey) }
        $optionsXml += "                        <enumerationValue key=`"$optKey`">$optCaption</enumerationValue>`n"
      }
      
      $defVal = if ($prop.defaultValue) { 
        $prop.defaultValue 
      }
      elseif ($enumOptions.Count -gt 0) { 
        if ($enumOptions[0].key) { $enumOptions[0].key } else { $enumOptions[0] }
      }
      else { 
        "default" 
      }
      $xml = @"
                <property key="$($prop.key)" type="enumeration" defaultValue="$defVal">
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                    <enumerationValues>
$optionsXml                    </enumerationValues>
                </property>
"@
    }
    "expression" {
      $returnType = if ($prop.returnType) { $prop.returnType } else { "String" }
      $dataSource = if ($prop.dataSource) { "dataSource=`"$($prop.dataSource)`"" } else { "" }
      $xml = @"
                <property key="$($prop.key)" type="expression" $required $dataSource>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                    <returnType type="$returnType" />
                </property>
"@
    }
    "action" {
      $dataSource = if ($prop.dataSource) { "dataSource=`"$($prop.dataSource)`"" } else { "" }
      $xml = @"
                <property key="$($prop.key)" type="action" required="false" $dataSource>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "attribute" {
      $dataSource = if ($prop.dataSource) { "dataSource=`"$($prop.dataSource)`"" } else { "" }
      $attrTypesXml = ""
      if ($prop.attributeTypes) {
        foreach ($at in $prop.attributeTypes) {
          $attrTypesXml += "                        <attributeType name=`"$at`" />`n"
        }
      }
      else {
        $attrTypesXml = "                        <attributeType name=`"String`" />`n"
      }
      $xml = @"
                <property key="$($prop.key)" type="attribute" $required $dataSource>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                    <attributeTypes>
$attrTypesXml                    </attributeTypes>
                </property>
"@
    }
    "datasource" {
      $xml = @"
                <property key="$($prop.key)" type="datasource" isList="true" $required>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "widgets" {
      $dataSource = if ($prop.dataSource) { "dataSource=`"$($prop.dataSource)`"" } else { "" }
      $xml = @"
                <property key="$($prop.key)" type="widgets" $required $dataSource>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "icon" {
      $xml = @"
                <property key="$($prop.key)" type="icon" $required>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    "image" {
      $xml = @"
                <property key="$($prop.key)" type="image" $required>
                    <caption>$($prop.caption)</caption>
                    <description>$($prop.description)</description>
                </property>
"@
    }
    default {
      Write-Host "⚠️  Unknown property type: $($prop.type) for $($prop.key)" -ForegroundColor Yellow
    }
  }
    
  return $xml
}

function Generate-EventXml {
  param($event)
    
  $dataSource = if ($event.dataSource) { "dataSource=`"$($event.dataSource)`"" } else { "" }
  return @"
                <property key="$($event.key)" type="action" required="false" $dataSource>
                    <caption>$($event.caption)</caption>
                    <description>$($event.description)</description>
                </property>
"@
}

# Build properties XML
$propertiesXml = ""
foreach ($prop in $propsConfig) {
  $propertiesXml += (Generate-PropertyXml $prop) + "`n"
}

# Build events XML
$eventsXml = ""
foreach ($evt in $eventsConfig) {
  $eventsXml += (Generate-EventXml $evt) + "`n"
}

# Build system properties XML
$systemPropsXml = ""
$systemProps = if ($config.systemProperties) { $config.systemProperties } else { @("Name", "Visibility") }
foreach ($sp in $systemProps) {
  $systemPropsXml += "                <systemProperty key=`"$sp`" />`n"
}

# Generate full widget XML
$widgetXml = @"
<?xml version="1.0" encoding="utf-8" ?>
<widget id="com.$($Company.ToLower()).widget.custom.$widgetNameLower.$WidgetName" pluginWidget="true" needsEntityContext="$NeedsEntityContext" offlineCapable="$OfflineCapable" xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../node_modules/mendix/custom_widget.xsd">
    <name>$DisplayName</name>
    <description>$Description</description>
    <studioProCategory>$Category</studioProCategory>
    <studioCategory>$Category</studioCategory>
    <properties>
        <propertyGroup caption="General">
            <propertyGroup caption="General">
$propertiesXml
$eventsXml            </propertyGroup>
            <propertyGroup caption="Common">
$systemPropsXml            </propertyGroup>
        </propertyGroup>
    </properties>
</widget>
"@

# ════════════════════════════════════════════════════════════════════════════════
# 🔨 GENERATE TYPESCRIPT TYPES
# ════════════════════════════════════════════════════════════════════════════════

function Get-TsType {
  param($prop)
    
  switch ($prop.type) {
    "string" { return "string" }
    "boolean" { return "boolean" }
    "integer" { return "number" }
    "decimal" { return "Big" }
    "textTemplate" { return "DynamicValue<string>" }
    "enumeration" { 
      $opts = ($prop.options | ForEach-Object { "`"$($_.key)`"" }) -join " | "
      return $opts
    }
    "expression" { 
      $rt = if ($prop.returnType) { $prop.returnType } else { "string" }
      switch ($rt) {
        "Boolean" { return "DynamicValue<boolean>" }
        "String" { return "DynamicValue<string>" }
        "Integer" { return "DynamicValue<Big>" }
        "Decimal" { return "DynamicValue<Big>" }
        default { return "DynamicValue<string>" }
      }
    }
    "action" { return "ActionValue | undefined" }
    "attribute" { return "EditableValue<string>" }
    "datasource" { return "ListValue" }
    "widgets" { return "ReactNode" }
    "icon" { return "DynamicValue<IconValue> | undefined" }
    "image" { return "DynamicValue<ImageValue> | undefined" }
    default { return "unknown" }
  }
}

# ════════════════════════════════════════════════════════════════════════════════
# 📁 CREATE WIDGET DIRECTORY STRUCTURE
# ════════════════════════════════════════════════════════════════════════════════

# Check if exists
if (Test-Path $WidgetDir) {
  Write-Host "⚠️  Widget directory exists: $WidgetDir" -ForegroundColor Yellow
  $confirm = Read-Host "Overwrite? (y/N)"
  if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled." -ForegroundColor Gray
    exit 0
  }
  Remove-Item -Path $WidgetDir -Recurse -Force
}

# Create directories
New-Item -ItemType Directory -Path $WidgetDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $WidgetDir "src") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $WidgetDir "src\components") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $WidgetDir "src\ui") -Force | Out-Null

Write-Host "✅ Created: $WidgetDir" -ForegroundColor Green

# ════════════════════════════════════════════════════════════════════════════════
# 📝 WRITE ALL FILES
# ════════════════════════════════════════════════════════════════════════════════

# 1. Widget XML
Set-Content -Path (Join-Path $WidgetDir "src\$WidgetName.xml") -Value $widgetXml -NoNewline
Write-Host "   ✓ $WidgetName.xml" -ForegroundColor DarkGray

# 2. Package.json
$packageJson = @"
{
    "name": "$widgetNameLower",
    "widgetName": "$WidgetName",
    "version": "$Version",
    "description": "$Description",
    "copyright": "© $Year $Company",
    "author": "$Author",
    "license": "Apache-2.0",
    "packagePath": "com.$($Company.ToLower()).widget.custom",
    "scripts": {
        "start": "cross-env MPKOUTPUT=$WidgetName.mpk pluggable-widgets-tools start:web",
        "dev": "cross-env MPKOUTPUT=$WidgetName.mpk pluggable-widgets-tools start:web",
        "build": "cross-env MPKOUTPUT=$WidgetName.mpk pluggable-widgets-tools build:web",
        "lint": "pluggable-widgets-tools lint",
        "lint:fix": "pluggable-widgets-tools lint:fix"
    },
    "devDependencies": {
        "@mendix/pluggable-widgets-tools": "~10.21.2",
        "@types/big.js": "^6.2.0",
        "cross-env": "^7.0.3"
    },
    "dependencies": {
        "classnames": "^2.3.2"
    },
    "config": {
        "projectPath": "$ProjectPath",
        "mendixHost": "http://localhost:8080"
    },
    "overrides": {
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "@types/react": "~18.2.0",
        "@types/react-dom": "~18.2.0"
    }
}
"@
Set-Content -Path (Join-Path $WidgetDir "package.json") -Value $packageJson -NoNewline
Write-Host "   ✓ package.json" -ForegroundColor DarkGray

# 3. tsconfig.json (FULL - don't extend base, it conflicts with react-jsx)
$tsconfig = @"
{
    "include": ["./src", "./typings"],
    "compilerOptions": {
        "baseUrl": "./",
        "noEmitOnError": true,
        "sourceMap": true,
        "module": "esnext",
        "target": "es6",
        "lib": ["esnext", "dom"],
        "types": ["jest", "node"],
        "moduleResolution": "node",
        "declaration": false,
        "noLib": false,
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": true,
        "strict": true,
        "strictFunctionTypes": false,
        "skipLibCheck": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "jsx": "react-jsx",
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "useUnknownInCatchVariables": false,
        "exactOptionalPropertyTypes": false
    }
}
"@
Set-Content -Path (Join-Path $WidgetDir "tsconfig.json") -Value $tsconfig -NoNewline
Write-Host "   ✓ tsconfig.json" -ForegroundColor DarkGray

# 4. Main component (minimal - no unused imports)
$mainTsx = 'import { ReactNode } from "react";
import { ' + $WidgetName + 'ContainerProps } from "../typings/' + $WidgetName + 'Props";
import "./ui/' + $WidgetName + '.css";

export function ' + $WidgetName + '(props: ' + $WidgetName + 'ContainerProps): ReactNode {
    const { name, class: className } = props;

    const rootClass = `widget-${name} ${className || ""}`.trim();

    return (
        <div className={rootClass}>
            <span>' + $DisplayName + ' Widget</span>
        </div>
    );
}'
Set-Content -Path (Join-Path $WidgetDir "src\$WidgetName.tsx") -Value $mainTsx -NoNewline
Write-Host "   ✓ $WidgetName.tsx" -ForegroundColor DarkGray

# 5. Editor Preview (use _props to avoid unused param error)
$previewTsx = 'import { ReactElement } from "react";
import { ' + $WidgetName + 'PreviewProps } from "../typings/' + $WidgetName + 'Props";

export function preview(_props: ' + $WidgetName + 'PreviewProps): ReactElement {
    return <div className="widget-' + $widgetNameLower + '-preview">' + $DisplayName + '</div>;
}

export function getPreviewCss(): string {
    return `
.widget-' + $widgetNameLower + '-preview {
    padding: 8px 12px;
    background: #f5f5f5;
    border: 1px dashed #ccc;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
}
`;
}'
Set-Content -Path (Join-Path $WidgetDir "src\$WidgetName.editorPreview.tsx") -Value $previewTsx -NoNewline
Write-Host "   ✓ $WidgetName.editorPreview.tsx" -ForegroundColor DarkGray

# 6. CSS
$css = @"
/* $WidgetName Widget Styles */

.widget-${widgetNameLower} {
    /* Base styles */
}
"@
Set-Content -Path (Join-Path $WidgetDir "src\ui\$WidgetName.css") -Value $css -NoNewline
Write-Host "   ✓ $WidgetName.css" -ForegroundColor DarkGray

# 7. Package.xml
$packageXml = @"
<?xml version="1.0" encoding="utf-8" ?>
<package xmlns="http://www.mendix.com/package/1.0/">
    <clientModule name="$WidgetName" version="$Version" xmlns="http://www.mendix.com/clientModule/1.0/">
        <widgetFiles>
            <widgetFile path="$WidgetName.xml" />
        </widgetFiles>
    </clientModule>
</package>
"@
Set-Content -Path (Join-Path $WidgetDir "src\package.xml") -Value $packageXml -NoNewline
Write-Host "   ✓ package.xml" -ForegroundColor DarkGray

# 8. Copy icons from template
$iconSrc = Join-Path $TemplateDir "src\WidgetName.icon.png"
$iconDarkSrc = Join-Path $TemplateDir "src\WidgetName.icon.dark.png"
if (Test-Path $iconSrc) {
  Copy-Item $iconSrc (Join-Path $WidgetDir "src\$WidgetName.icon.png")
  Write-Host "   ✓ $WidgetName.icon.png" -ForegroundColor DarkGray
}
if (Test-Path $iconDarkSrc) {
  Copy-Item $iconDarkSrc (Join-Path $WidgetDir "src\$WidgetName.icon.dark.png")
  Write-Host "   ✓ $WidgetName.icon.dark.png" -ForegroundColor DarkGray
}

# 9. README
$readme = @"
# $DisplayName

$Description

## Generated

Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm") using Mendix Widget Generator

## Development

\`\`\`bash
npm install
npm run dev    # Start development with hot reload
npm run build  # Build for production
\`\`\`

## Properties

| Property | Type | Description |
|----------|------|-------------|
$(foreach ($p in $propsConfig) { "| $($p.key) | $($p.type) | $($p.description) |`n" })

## Events

$(foreach ($e in $eventsConfig) { "- **$($e.key)**: $($e.description)`n" })
"@
Set-Content -Path (Join-Path $WidgetDir "README.md") -Value $readme -NoNewline
Write-Host "   ✓ README.md" -ForegroundColor DarkGray

# 10. .gitignore
$gitignore = @"
node_modules/
dist/
typings/
*.mpk
*.log
.DS_Store
"@
Set-Content -Path (Join-Path $WidgetDir ".gitignore") -Value $gitignore -NoNewline
Write-Host "   ✓ .gitignore" -ForegroundColor DarkGray

# ════════════════════════════════════════════════════════════════════════════════
# 🔨 BUILD (unless skipped)
# ════════════════════════════════════════════════════════════════════════════════

if (-not $SkipBuild) {
  Write-Host ""
  Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
  Write-Host "║  🔨 BUILDING WIDGET                                               ║" -ForegroundColor Cyan
  Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
  Write-Host ""
    
  Push-Location $WidgetDir
    
  try {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    $npmInstallResult = npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
      Write-Host $npmInstallResult -ForegroundColor Red
      throw "npm install failed"
    }
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
        
    Write-Host ""
    Write-Host "🔧 Building widget..." -ForegroundColor Yellow
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
      $buildOutput | Select-Object -Last 30 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
      throw "npm run build failed"
    }
    Write-Host "   ✅ Build successful" -ForegroundColor Green
        
    $mpkPath = Join-Path $WidgetDir "dist\$Version\$WidgetName.mpk"
    if (Test-Path $mpkPath) {
      $mpkSize = (Get-Item $mpkPath).Length
      Write-Host "   ✅ MPK created: $WidgetName.mpk ($([math]::Round($mpkSize/1KB, 1)) KB)" -ForegroundColor Green
            
      # Auto-deploy
      $deployPath = Join-Path $ProjectPath.TrimEnd('/') "widgets"
      if (Test-Path $deployPath) {
        Write-Host ""
        Write-Host "🚀 Deploying..." -ForegroundColor Yellow
        Copy-Item $mpkPath $deployPath -Force
        Write-Host "   ✅ Deployed to: $deployPath" -ForegroundColor Green
      }
    }
        
    Pop-Location
        
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ WIDGET GENERATED, BUILT, AND DEPLOYED!                        ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 NEXT: Open Studio Pro and press F4!" -ForegroundColor Cyan
    Write-Host ""
        
  }
  catch {
    Pop-Location
        
    $failedPath = "${WidgetDir}_FAILED_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    if (Test-Path $WidgetDir) {
      Rename-Item -Path $WidgetDir -NewName (Split-Path $failedPath -Leaf) -Force
      Write-Host "📁 Failed widget preserved at: $failedPath" -ForegroundColor DarkGray
    }
        
    Write-Host ""
    Write-Host "❌ BUILD FAILED: $_" -ForegroundColor Red
    exit 1
  }
}
else {
  Write-Host ""
  Write-Host "⏭️  Skipping build (use without -SkipBuild to auto-build)" -ForegroundColor Yellow
  Write-Host "   cd $WidgetDir" -ForegroundColor White
  Write-Host "   npm install && npm run build" -ForegroundColor White
}
