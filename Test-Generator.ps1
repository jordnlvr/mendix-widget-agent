<#
.SYNOPSIS
    End-to-End Test Suite for Widget Generator
    Tests multiple widget types to verify reliability
    
.DESCRIPTION
    Creates 5+ different widget configurations and attempts to
    generate, build, and deploy each one. Reports success/failure.
    
.EXAMPLE
    .\Test-Generator.ps1
    
.EXAMPLE
    .\Test-Generator.ps1 -KeepWidgets  # Don't clean up after
#>

param(
    [switch]$KeepWidgets
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧪 WIDGET GENERATOR TEST SUITE                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test widget configurations
$TestWidgets = @(
    @{
        name = "TestSimple"
        config = @{
            widget = @{
                name = "TestSimple"
                displayName = "Test Simple Widget"
                description = "Basic string and boolean test"
                category = "Display"
                company = "test"
            }
            properties = @(
                @{ key = "label"; type = "string"; caption = "Label"; description = "The label"; required = $true }
                @{ key = "enabled"; type = "boolean"; caption = "Enabled"; description = "Enable widget"; defaultValue = $true }
            )
            events = @()
        }
    },
    @{
        name = "TestEnum"
        config = @{
            widget = @{
                name = "TestEnum"
                displayName = "Test Enum Widget"
                description = "Enumeration property test"
                category = "Display"
                company = "test"
            }
            properties = @(
                @{ 
                    key = "status"; type = "enumeration"; caption = "Status"; description = "Status type"
                    enumValues = @("info", "warning", "error", "success")
                    defaultValue = "info"
                }
            )
            events = @(
                @{ key = "onClick"; type = "action"; caption = "On click"; description = "Click handler" }
            )
        }
    },
    @{
        name = "TestExpression"
        config = @{
            widget = @{
                name = "TestExpression"
                displayName = "Test Expression Widget"
                description = "Expression and textTemplate test"
                category = "Display"
                company = "test"
            }
            properties = @(
                @{ key = "message"; type = "textTemplate"; caption = "Message"; description = "Text template"; required = $true }
                @{ key = "visible"; type = "expression"; caption = "Visible"; description = "Visibility expression"; returnType = "boolean" }
            )
            events = @()
        }
    },
    @{
        name = "TestAttribute"
        config = @{
            widget = @{
                name = "TestAttribute"
                displayName = "Test Attribute Widget"
                description = "Attribute binding test"
                category = "Input controls"
                company = "test"
            }
            properties = @(
                @{ 
                    key = "value"; type = "attribute"; caption = "Value"; description = "Bound attribute"
                    attributeTypes = @("String", "Integer")
                    required = $true
                }
                @{ key = "placeholder"; type = "string"; caption = "Placeholder"; description = "Placeholder text"; defaultValue = "Enter value..." }
            )
            events = @(
                @{ key = "onChange"; type = "action"; caption = "On change"; description = "Change handler" }
            )
        }
    },
    @{
        name = "TestDatasource"
        config = @{
            widget = @{
                name = "TestDatasource"
                displayName = "Test Datasource Widget"
                description = "Datasource and widgets container test"
                category = "Data controls"
                company = "test"
            }
            properties = @(
                @{ key = "dataSource"; type = "datasource"; caption = "Data source"; description = "List data"; isList = $true; required = $true }
                @{ key = "content"; type = "widgets"; caption = "Content"; description = "Item template"; dataSource = "dataSource" }
                @{ key = "emptyMessage"; type = "string"; caption = "Empty message"; description = "Shown when empty"; defaultValue = "No items" }
            )
            events = @(
                @{ key = "onSelect"; type = "action"; caption = "On select"; description = "Selection handler" }
            )
        }
    }
)

$results = @()
$configDir = Join-Path $ScriptDir "widget-configs\test"
$widgetDir = "D:\kelly.seale\CodeBase\PluggableWidgets"

# Ensure config directory exists
if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Path $configDir -Force | Out-Null }

foreach ($test in $TestWidgets) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "🧪 Testing: $($test.name)" -ForegroundColor Yellow
    
    # Clean up any existing widget folder
    $widgetPath = Join-Path $widgetDir $test.name.ToLower()
    if (Test-Path $widgetPath) {
        Remove-Item $widgetPath -Recurse -Force
    }
    
    # Save config
    $configPath = Join-Path $configDir "$($test.name.ToLower())-config.json"
    $test.config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
    
    # Run generator
    $startTime = Get-Date
    try {
        $output = & "$ScriptDir\Generate-WidgetFromConfig.ps1" -ConfigPath $configPath 2>&1
        $success = $LASTEXITCODE -eq 0 -or ($output -match "DEPLOYED")
        
        # Check for MPK
        $mpkPath = Join-Path $widgetPath "dist\*\*.mpk"
        $hasMpk = (Get-ChildItem $mpkPath -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0
        
        if ($success -and $hasMpk) {
            $duration = ((Get-Date) - $startTime).TotalSeconds
            Write-Host "   ✅ PASSED ($([math]::Round($duration, 1))s)" -ForegroundColor Green
            $results += @{ name = $test.name; status = "PASS"; duration = $duration; error = $null }
        } else {
            Write-Host "   ❌ FAILED - No MPK generated" -ForegroundColor Red
            $results += @{ name = $test.name; status = "FAIL"; duration = 0; error = "No MPK" }
        }
    }
    catch {
        Write-Host "   ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $results += @{ name = $test.name; status = "FAIL"; duration = 0; error = $_.Exception.Message }
    }
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor $(if ($results.status -contains "FAIL") { "Red" } else { "Green" })
Write-Host "║  📊 TEST RESULTS                                                  ║" -ForegroundColor $(if ($results.status -contains "FAIL") { "Red" } else { "Green" })
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor $(if ($results.status -contains "FAIL") { "Red" } else { "Green" })
Write-Host ""

$passed = ($results | Where-Object { $_.status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.status -eq "FAIL" }).Count

foreach ($r in $results) {
    $icon = if ($r.status -eq "PASS") { "✅" } else { "❌" }
    $timeStr = if ($r.duration -gt 0) { "($([math]::Round($r.duration, 1))s)" } else { "" }
    $errorStr = if ($r.error) { "- $($r.error)" } else { "" }
    Write-Host "   $icon $($r.name.PadRight(20)) $timeStr $errorStr" -ForegroundColor $(if ($r.status -eq "PASS") { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "   Passed: $passed / $($results.Count)" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
if ($failed -gt 0) {
    Write-Host "   Failed: $failed" -ForegroundColor Red
}

# Calculate grade
$grade = switch ($passed / $results.Count) {
    { $_ -ge 1.0 } { "A+" }
    { $_ -ge 0.9 } { "A" }
    { $_ -ge 0.8 } { "B" }
    { $_ -ge 0.7 } { "C" }
    { $_ -ge 0.6 } { "D" }
    default { "F" }
}

Write-Host ""
Write-Host "   GRADE: $grade" -ForegroundColor $(if ($grade -match "A") { "Green" } elseif ($grade -match "B") { "Yellow" } else { "Red" })

# Cleanup
if (-not $KeepWidgets) {
    Write-Host ""
    Write-Host "🧹 Cleaning up test widgets..." -ForegroundColor DarkGray
    foreach ($test in $TestWidgets) {
        $widgetPath = Join-Path $widgetDir $test.name.ToLower()
        if (Test-Path $widgetPath) {
            Remove-Item $widgetPath -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    # Remove test configs
    if (Test-Path $configDir) {
        Remove-Item $configDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   ✅ Cleaned up" -ForegroundColor DarkGray
}

Write-Host ""

# Exit with failure code if any failed
if ($failed -gt 0) { exit 1 }
