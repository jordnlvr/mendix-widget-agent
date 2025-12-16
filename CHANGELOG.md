# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-15

### Added

- 🚀 **Initial Release**
- Interactive widget wizard (`New-Widget.ps1`)
- Config-driven generator (`Generate-WidgetFromConfig.ps1`)
- Template-based generator (`Generate-Widget.ps1`)
- Comprehensive test suite (`Test-Generator.ps1`)
- JSON schema for widget configs
- VS Code snippets for all property types

### Features

- **Auto-Build**: Automatically runs `npm install` and `npm run build`
- **Auto-Deploy**: Copies MPK to test project on successful build
- **Auto-Cleanup**: Preserves failed widgets with timestamp for debugging
- **15+ Property Types**: Full support for all Mendix property types
  - string, boolean, integer, decimal
  - enumeration (both array and object formats)
  - textTemplate, expression
  - action (events)
  - attribute, datasource, widgets
  - image, icon, association, object

### Tested Widget Types

All passing (5/5):

- ✅ Simple (string + boolean)
- ✅ Enumeration (dropdown with values)
- ✅ Expression (dynamic expressions)
- ✅ Attribute (entity attribute binding)
- ✅ Datasource (list with widgets container)

### Technical Details

- Built on `pluggable-widgets-tools ~10.21.2`
- React 18.2.0
- TypeScript with strict mode
- Compatible with Mendix Studio Pro 10+/11+

---

## [Unreleased]

### Planned

- [ ] npm package (`npx create-mendix-widget`)
- [ ] Cross-platform support (macOS/Linux)
- [ ] GitHub Actions CI/CD
- [ ] Widget gallery with more examples
- [ ] Visual Studio Code extension
