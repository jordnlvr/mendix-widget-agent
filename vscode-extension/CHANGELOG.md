# Changelog

All notable changes to the Mendix Widget Agent extension will be documented in this file.

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
