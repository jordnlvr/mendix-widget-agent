# Changelog

All notable changes to the Mendix Widget Agent extension will be documented in this file.

## [2.5.0] - 2024-12-24

### 🎄 React → Mendix Conversion Overhaul

Complete rewrite of the TSX conversion rules based on extensive real-world testing with Tailwind + OneSource themed widgets.

### Added

- **10 Critical Conversion Rules** embedded in `modelDescription` - AI models MUST follow these
- **OneSource Design Token Support** - Use CSS variables instead of hardcoded colors
- **Dark Mode Pattern** - `html.dark` selector support for OneSource-themed apps
- **Tailwind-in-SCSS Pattern** - Define ALL Tailwind utilities in widget SCSS (Mendix has no Tailwind)

### Critical Conversion Rules (Enforced)

1. **WRAP, don't rebuild** - Import original component, create thin Mendix wrapper
2. **Bundle lucide-react** - Tree-shaking keeps it small, icons must work
3. **Define ALL Tailwind classes in SCSS** - Mendix has NO Tailwind by default
4. **Use OneSource tokens** - `--brand-primary`, `--bg-color-secondary`, `--font-color-default`
5. **Dark mode via `html.dark`** - OneSource pattern, not body.dark
6. **Container div for SCSS scoping** - Wrapper must have container element
7. **Add createElement import** - Original component needs `import { createElement } from 'react'`
8. **tsconfig settings** - `noUnusedLocals: false`, `noUnusedParameters: false`
9. **RGB for alpha colors** - `rgb(var(--color-primary) / 0.3)` pattern
10. **Escape dark: prefixed classes** - `.dark\:bg-slate-800\/50` in SCSS

### OneSource Token Reference

| Purpose | Token |
|---------|-------|
| Surface BG | `--bg-color-secondary` |
| Border | `--border-color-default` |
| Text | `--font-color-default` |
| Text Muted | `--font-color-detail` |
| Brand Primary | `--brand-primary` |
| Brand Secondary | `--brand-secondary` |
| RGB for alpha | `rgb(var(--color-primary) / 0.3)` |

### Technical Details

- Tested with WrappedUserProfile widget using lucide-react icons
- Validated dark mode with OneSource v1 theme in Studio Pro 11.5
- All Tailwind utilities (flex, rounded, shadow, etc.) now defined in widget SCSS
- Container widgets get proper `.widget-wrapper` scoping

---

## [2.4.6] - 2025-12-17

### 🔄 Republish & Cleanup

Republish of v2.4.5 fixes (marketplace had propagation issues preventing v2.4.4 and v2.4.5 from appearing).

### Added

- **Archived old code** - CLI folder, PowerShell scripts, deprecated TypeScript files moved to archive
- **Fixed GitHub Actions** - Test workflow now compiles extension instead of referencing archived scripts

### Included from v2.4.5

All icon and drop zone fixes from v2.4.5 are included.

---

## [2.4.5] - 2025-12-17

### 🔧 Icon & Drop Zone Fixes - Major Overhaul

Complete rewrite of icon and drop zone generation based on analysis of official Mendix widget-resources repository (fieldset-web).

### Fixed

- **Icons Not Appearing in Studio Pro** - Root cause: Was embedding SVG as base64 in `<icon>` XML element

  - Solution: Now generates PNG files with official naming convention: `Widget.icon.png`, `Widget.tile.png`, `Widget.tile.dark.png`
  - Removed `<icon/>` element from widget XML - Mendix uses file naming convention, not embedded icons

- **Drop Zones Not Working** - Root cause: Missing `editorConfig.ts` file with `getPreview()` function

  - Solution: Now generates TypeScript `editorConfig.ts` with proper `DropZone` type from `@mendix/widget-plugin-platform/preview`
  - Container widgets get `DropZone` type properties for each `type="widgets"` property

- **Preview Component Pattern Wrong** - Was using complex IIFE pattern that didn't work

  - Solution: Now uses official pattern from fieldset-web: `const ContentRenderer = props.content.renderer; <ContentRenderer>...</ContentRenderer>`

- **Duplicate Properties** - Pattern detection was adding properties multiple times

  - Added `addPropertyIfNotExists()` helper - checks if property key already exists before adding
  - Added `addEventIfNotExists()` helper - same for events

- **False Positive Pattern Matching** - "drop zone" was triggering "drag" → file upload pattern
  - Upload pattern now uses word boundaries: `/\b(upload|attachment)\b/`
  - Excludes "drop zone" and "dropzone" from file pattern matching

### Changed

- **generateEditorConfig()** - Complete rewrite:

  - Container widgets: Generates TypeScript with `DropZone` type imports and proper structure
  - Non-container widgets: Generates simple JS with row layout preview

- **generatePreview()** - Complete rewrite:

  - Uses `props.content.renderer` pattern directly (official Mendix approach)
  - No more complex IIFE or custom JSX patterns

- **Pattern Detection** - All patterns updated to use helper functions:
  - Color, Tooltip, Date/Time, Progress, Card/Container, List/Grid, Rating, Modal, Search, Upload, Chart, Tab, Timer, Icon patterns
  - `toolboxCategory` assignments now use `if (!requirements.toolboxCategory)` to prevent overwriting

### Technical Details

- Analyzed official `mendix/widgets-resources` repository, specifically `fieldset-web` widget
- Key files studied: `Fieldset.xml`, `Fieldset.editorConfig.ts`, `Fieldset.editorPreview.tsx`, `Fieldset.tsx`
- Icon discovery: Official widgets use `.icon.png`, `.tile.png` file naming convention
- Drop zone discovery: `editorConfig.ts` with `getPreview()` returning `DropZone` type is required

---

## [2.4.4] - 2024-12-18

### 🎯 Interview Enforcement & Drop Zone Support

Improvements based on user testing to ensure AI follows the interview flow and container widgets work correctly.

### Fixed

- **AI Skipping Interview Questions** - Updated `modelDescription` with explicit rules:
  - AI MUST ask for company/author - cannot assume or use defaults without asking
  - Prevents AI from bypassing interview by providing default values
- **Drop Zones Not Working** - Rewrote `generatePreview()` function:
  - Container widgets with `type="widgets"` properties now get proper JSX renderer pattern
  - Uses `content.renderer` pattern: `<Renderer><div>Drop widgets here</div></Renderer>`
  - This enables actual drag-and-drop in Studio Pro's structure mode

### Added

- **Auto-Detect Icon Files** - New `detectIconFile()` helper:
  - Automatically scans workFolder for `.svg` or `.png` files
  - Prioritizes files with "icon" in the name
  - Prefers SVG over PNG when both exist
  - Eliminates need to specify icon path if file is in workFolder
- **Better Icon Question** - Updated interview to mention auto-detection tip

### Changed

- **Tool modelDescription** - Explicit instructions for AI behavior:
  - "(1) Do NOT assume or default company/author values"
  - "(2) If user provides an icon file path, USE that file"
  - "(3) Check the workFolder for any _.svg or _.png files"

### Technical

- `detectIconFile(directory)` - Returns first icon file found, prioritizing named icons
- `generatePreview()` - Now detects `type="widgets"` and generates JSX drop zones
- Stage 2.5 added to workflow - Auto-detect icon between answers and missing check

---

## [2.4.3] - 2024-12-17

### 📦 Critical Packaging & Icon Fixes

Major fixes based on real-world testing that eliminate ES6 module errors and icon display issues.

### Fixed

- **Package.xml Path Error** - Now uses folder path (`bluematrix/widgetname`) instead of file path (`Widget.js`)
  - This was causing "deployment failed during export" ES6 module errors
- **packagePath Format** - Changed from `com.bluematrix.widget` to simple `bluematrix` format
  - Now matches working widget structure and widget ID pattern
- **Toolbox Icon Too Small** - Now generates PNG files (64x64) instead of SVG
  - Creates `.icon.png`, `.tile.png`, `.tile.dark.png` for proper toolbox display
  - Mendix toolbox requires PNG format, not SVG!

### Changed

- **Icon Generation** - Embedded default 64x64 PNG icon (Mendix blue)
- **Package Structure** - Widget folder now matches ID: `{company}/{widgetname}`

### Technical

- `generatePackageXml()` - Now calculates folder path from company + widget name
- `generateDefaultIcon()` - Creates PNG files from base64, not SVG files
- Removed SVG-only icon generation that caused tiny icons

### Learned Patterns (for self-learning system)

- `<file path>` in package.xml MUST be folder path, not .js file
- Toolbox icons require PNG base64 in `<icon>` tag
- packagePath must match widget ID structure exactly

---

## [2.4.2] - 2024-12-17

### 🔧 Critical Bugfixes - Mendix 11.5 Compatibility

Major fixes for recurring widget build issues that were causing deployment failures.

### Fixed

- **Reserved Property Name** - Changed `class` to `styleClass` (Mendix reserves 'class' for system properties)
- **Wrong Build Tools Version** - Updated `@mendix/pluggable-widgets-tools` from 10.21.2 to **11.3.0** (required for Mendix 11.x)
- **ES6 Module Issues** - Version 11.3.0 properly generates `.mjs` files and `moduleType="ESModule"` for Mendix 11.5
- **Icon Question Skipped** - Fixed interview flow to properly ask about custom icons
- **Icon Default Handling** - Using "skip" or "default" now properly marks the choice instead of looping

### Changed

- **Notification Version** - Now correctly shows v2.4.x on install
- **New Extension Icon** - Updated marketplace icon (robotAgent1.png)
- **Better Console Logs** - Version numbers now consistent throughout

### Technical

- Updated all hardcoded version references from v2.2 to v2.4.x
- Icon path sentinel value changed from `undefined` to `'default'` for proper state tracking

---

## [2.4.1] - 2024-12-17

### 🧠 Enhanced Smart Interview System

Major improvements to the AI interview process - it's now MUCH smarter!

### Added

- **Widget Ideas Gallery** - Shows 20+ widget ideas organized by category when starting
- **Enhanced Pattern Detection** - Now recognizes 15+ widget patterns:
  - Status/Badge, Progress/Gauge, Rating/Stars
  - Card/Panel, Modal/Dialog, Tab/Accordion
  - List/Grid, Chart/Graph, Upload/File
  - Timer/Countdown, Search/Filter, Date/Time
  - Icon/Emoji, Image/Avatar, and more!
- **Smart Property Inference** - Automatically detects and adds relevant properties
- **Event Detection** - Infers onClick, onChange, onComplete events from description
- **New Property Types** - Added `widgets`, `datasource`, `icon` types
- **Default Styling** - All widgets get CSS class property for customization

### Changed

- **Better Suggestions** - Toolbox category now auto-suggested based on widget type
- **Richer Descriptions** - More detailed property descriptions for Studio Pro

---

## [2.4.0] - 2024-12-17

### 🚀 MARKETPLACE RELEASE - The #1 Mendix Widget Generator!

This is the first public VS Code Marketplace release under **BlueMatrix**.

### Added

- **VS Code Marketplace Publishing** - Auto-updates for everyone!
- **Premium README** - Comprehensive documentation with feature comparison
- **Marketplace Badges** - Install count, version, compatibility badges
- **Gallery Banner** - Professional Mendix-blue branding
- **Enhanced Keywords** - Better discoverability (mendix, widget, pluggable, etc.)

### Changed

- **Publisher**: Now officially **BlueMatrix**
- **Display Name**: "Mendix Widget Agent - AI-Powered Widget Generator"
- **Repository**: Moved to `BlueMatrix-Dev/mendix-widget-agent`
- **Description**: Marketplace-optimized, highlights key differentiators

---

## [2.3.1] - 2024-12-17

### Changed

- **Publisher Updated** - Extension now published under "BlueMatrix" instead of personal username
- **New Extension Icon** - Fresh agent icon for better visibility in VS Code
- **Author Field** - Now properly included in generated widget package.json

---

## [2.3.0] - 2024-12-17

### 🔧 COMPREHENSIVE FIX - All Patterns Embedded, All Errors Prevented!

This release fixes ALL the issues discovered during real-world testing. The agent now has complete knowledge embedded directly in the code.

### Fixed

- **Complete Interview Questions** - NOW ASKS ALL REQUIRED FIELDS:
  1. Company identifier (saved for future use)
  2. Author name (saved for future use)
  3. Work folder (saved for future use)
  4. Mendix project for deployment (saved for future use)
  5. Toolbox category (Display, Input, Data, Container, Visualization)
  6. Icon path (SVG recommended, or use default)
- **package.xml Generation** - NO MORE `moduleType` attribute error!

  - Fixed the "moduleType attribute is not declared" error
  - Correct XML structure that Mendix 11.5.0 accepts

- **package.json Generation** - ALL CRITICAL FIELDS NOW INCLUDED:

  - `widgetName` field (REQUIRED by Mendix build)
  - `packagePath` field for namespace
  - `MPKOUTPUT` env var in scripts
  - `overrides` for React 18.2.0 (prevents duplicate React errors)
  - Correct `@mendix/pluggable-widgets-tools: ^10.21.2`
  - `cross-env` dependency for Windows compatibility

- **tsconfig.json** - Uses `extends` pattern, not custom settings

  - Prevents "Cannot find module" errors
  - Inherits all settings from widget tools base

- **Widget ID Format** - Correct pattern: `company.widget.name.Name`

- **Folder Structure** - ALL required folders now created:

  - `src/`
  - `src/components/` (for display component)
  - `src/ui/` (for CSS)
  - `typings/` (for generated types)

- **Icon Handling**:

  - Toolbox: SVG file generated, user converts to PNG (64×64)
  - Structure Mode: Raw SVG in editorConfig.js (NOT base64!)
  - Default Mendix-blue widget icon provided

- **Component Generation**:
  - Named exports (NOT default exports)
  - Proper Mendix type imports (EditableValue, ActionValue, DynamicValue)
  - Separate display component (best practice)
  - useCallback for event handlers

### Added

- **PROVEN_PATTERNS Constant** - All critical patterns embedded in code:

  - Toolbox categories
  - package.json template
  - Widget ID format function
  - package.xml template
  - Icon rules and examples
  - Common errors with prevention tips

- **Saved Preferences** - Extension remembers:

  - `mendixWidget.defaultCompany`
  - `mendixWidget.defaultAuthor`
  - `mendixWidget.defaultWorkFolder`
  - `mendixWidget.defaultMendixProject`

- **generateDisplayComponent()** - Creates separate display component
- **generatePackageXml()** - Correct package.xml without moduleType
- **generateDefaultIcon()** - Creates default SVG icon files

### Common Errors Now Prevented

| Error                                  | Prevention                             |
| -------------------------------------- | -------------------------------------- |
| "moduleType attribute is not declared" | package.xml generation fixed           |
| "base64Binary icon is invalid"         | Raw SVG for preview, PNG for toolbox   |
| "Widget XML not found"                 | Correct file naming and package.xml    |
| React version mismatch                 | React 18.2.0 overrides in package.json |
| "Cannot find module"                   | tsconfig.json uses extends pattern     |

---

## [2.2.0] - 2024-12-17

### 🤖 SMART INTERVIEWING! Create & Convert Widgets Intelligently

This is a MAJOR enhancement that transforms the extension into a true **Mendix Custom Widget Agent** with intelligent conversations.

### Added

- **Smart Interview Flow for Widget Creation**

  - Starts with "Describe what you want to build"
  - Asks questions one-at-a-time, intelligently
  - Deduces properties and events from your description
  - Remembers work folder and Mendix project across sessions
  - Shows summary and confirmation before building

- **TSX/React Component Conversion** (`#mendix-convert`)

  - Convert existing React components to Mendix widgets
  - Analyzes component props and events automatically
  - Creates proper Mendix property mappings
  - Option to wrap (preserve original) or convert fully
  - Copies original component for reference

- **SVG-First Icon Approach**
  - Drop ONE SVG file → works for toolbox AND Structure Mode preview
  - Automatic SVG → PNG conversion guidance
  - Raw SVG injection into editorConfig.js

### Changed

- **Interview-based UX** - No more guessing at parameters!
- **Better Property Detection** - Analyzes descriptions for status, click, image, text, color, tooltip, date, progress patterns
- **Improved Tool Responses** - Rich markdown with tables, clear next steps
- **Renamed to "Mendix Custom Widget Agent"** - Reflects true capabilities

### Technical Details

**Two Main Flows:**

| Flow        | Tool              | Description                             |
| ----------- | ----------------- | --------------------------------------- |
| **Create**  | `#mendix-create`  | Build widget from scratch via interview |
| **Convert** | `#mendix-convert` | Transform TSX to Mendix widget          |

**Interview Questions Asked:**

1. What do you want to build? (natural language)
2. Where should I create it? (work folder)
3. Deploy to Mendix project? (optional)
4. Toolbox category?
5. Custom icon? (SVG recommended)
6. Confirm and build?

---

## [2.1.0] - 2024-12-17

### 🎨 Structure Mode Preview Icons & Toolbox Categories!

This release adds proper support for Structure Mode preview icons and toolbox category organization in Mendix Studio Pro.

### Added

- **editorConfig.js Generation** - Widgets now generate a `{WidgetName}.editorConfig.js` file with:
  - `getPreview()` function for Structure Mode icons
  - Default Mendix-blue widget icon (SVG)
  - Proper dark mode support
- **studioProCategory Support** - Widgets can now specify a toolbox category for better organization
- **category** property in widget config for toolbox grouping

### Fixed

- **Structure Mode Icons** - Generated widgets now display proper icons in Structure Mode preview instead of blank squares

### Technical Details

**Icon System Clarification (PROVEN WORKING):**

| Location          | Format Required                            | File Type         |
| ----------------- | ------------------------------------------ | ----------------- |
| Toolbox           | PNG 64×64                                  | `.tile.png`       |
| Structure Mode    | **Raw SVG string** (NOT base64!)           | `editorConfig.js` |
| Dark/Light Toggle | Compare `isDarkMode` param in `getPreview` | N/A               |

⚠️ **Critical**: Structure Mode preview requires RAW SVG XML strings in the `Image.document` property. Base64 PNG does NOT work and shows red error arrows.

---

## [2.0.0] - 2024-12-16

### 🎉 Major Release: Works with ANY Model!

This release fundamentally changes how the extension works to support **any AI model** in VS Code's Agent Mode, not just GitHub Copilot.

### Changed

- **Replaced Chat Participant with Language Model Tools** - The extension now uses VS Code's Language Model Tools API instead of Chat Participants
- **Works in Agent Mode** - Use with Claude, GPT-4, Copilot, or any model that supports tools
- **New tool invocation syntax** - Use `#mendix-create`, `#mendix-fix`, etc. or just describe what you need naturally
- **Model parameter now optional** - All internal functions gracefully handle cases where no model is available

### Added

- **7 Language Model Tools**:
  - `mendix-widget_create_widget` (`#mendix-create`) - Create widgets from natural language
  - `mendix-widget_fix_errors` (`#mendix-fix`) - Analyze and fix build errors
  - `mendix-widget_research` (`#mendix-research`) - Beast Mode 6-tier exhaustive research
  - `mendix-widget_list_templates` (`#mendix-templates`) - List available pre-built templates
  - `mendix-widget_deploy` (`#mendix-deploy`) - Deploy widget to Mendix project
  - `mendix-widget_show_patterns` (`#mendix-patterns`) - Show learned patterns from self-learning nucleus
  - `mendix-widget_status` (`#mendix-status`) - Show agent status and configuration

### Removed

- **Chat Participant** (`@mendix-widget`) - No longer supported. Use Agent Mode tools instead.
- **Slash commands** (`/create`, `/fix`, etc.) - Replaced by tool references (`#mendix-create`, etc.)

### Migration Guide

| v1.x (Old)                 | v2.0 (New)                       |
| -------------------------- | -------------------------------- |
| `@mendix-widget /create`   | Just ask or use `#mendix-create` |
| `@mendix-widget /fix`      | `#mendix-fix` or just ask        |
| `@mendix-widget /research` | `#mendix-research`               |
| Only works with Copilot    | Works with ANY model             |
| Ask Mode only              | Agent Mode (sparkle icon ✨)     |

### Why This Change?

Chat Participants only work with GitHub Copilot in "Ask Mode". When using other models like Claude or GPT-4 in "Agent Mode", the Chat Participant couldn't access a language model, causing "Language model unavailable" errors.

Language Model Tools solve this by working with **any model** that supports tool invocation.

---

## [1.3.0] - 2024-12-15

### Added

- Self-learning nucleus (dynamic patterns) that saves successful builds
- Beast Mode research with 6-tier exhaustive search
- Research → Build → Fix loop for automatic error recovery

### Changed

- Improved error analysis with pattern matching before AI fallback
- Better path validation for Mendix projects

---

## [1.2.0] - 2024-12-14

### Added

- Deploy command to copy widgets to Mendix projects
- 10+ pre-built widget templates
- Auto-install dependencies option

### Fixed

- Path validation for widgets folder detection
- Build script detection in package.json

---

## [1.1.0] - 2024-12-13

### Added

- `/fix` command for analyzing build errors
- `/research` command for pattern research
- Conversation state for multi-turn interactions

### Changed

- Improved natural language understanding for widget properties
- Better error messages with suggestions

---

## [1.0.0] - 2024-12-12

### Initial Release

- Natural language widget creation via `@mendix-widget` chat participant
- `/create` and `/template` commands
- Integration with widget generator CLI
- Smart Mendix path validation
- Auto-build with npm
