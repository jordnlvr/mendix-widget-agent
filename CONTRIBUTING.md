# Contributing to Mendix Widget Generator

First off, thank you for considering contributing to Mendix Widget Generator! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details**:
  - OS version
  - PowerShell version (`$PSVersionTable.PSVersion`)
  - Node.js version (`node -v`)
  - Mendix Studio Pro version

### Suggesting Features

Feature requests are welcome! Please include:

- **Use case**: Why do you need this feature?
- **Proposed solution**: How should it work?
- **Alternatives considered**: What other solutions have you thought of?

### Adding New Property Types

If Mendix adds new property types, you can contribute support:

1. Add the XML template to `Generate-WidgetFromConfig.ps1` in the `Generate-PropertyXml` function
2. Add a VS Code snippet to `.vscode/mendix-widget.code-snippets`
3. Add documentation to `docs/PROPERTY-PATTERNS.md`
4. Add a test case to `Test-Generator.ps1`

### Adding Example Widgets

We welcome example widget configurations:

1. Create a JSON config in `widget-configs/`
2. Ensure it builds successfully with `.\Generate-WidgetFromConfig.ps1`
3. Document what the widget demonstrates

## Development Setup

### Prerequisites

- Windows 10/11 (PowerShell 5.1+ or PowerShell 7+)
- Node.js 18+
- Git

### Getting Started

```powershell
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mendix-widget-generator.git
cd mendix-widget-generator

# Run the test suite
.\Test-Generator.ps1 -KeepWidgets

# Try the interactive wizard
.\New-Widget.ps1
```

### Project Structure

```
├── New-Widget.ps1              # Interactive wizard
├── Generate-WidgetFromConfig.ps1  # Config-driven generator
├── Generate-Widget.ps1         # Simple template generator
├── Test-Generator.ps1          # Test suite
├── widget-config-schema.json   # JSON schema for configs
├── widget-configs/             # Example configurations
├── .vscode/                    # VS Code snippets
├── docs/                       # Documentation
└── templates/                  # Base templates
```

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feature/amazing-feature`
3. **Make your changes** with clear, atomic commits
4. **Run tests**: `.\Test-Generator.ps1`
5. **Update documentation** if needed
6. **Push** to your fork: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### PR Checklist

- [ ] Tests pass (`.\Test-Generator.ps1` shows 5/5)
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated
- [ ] No hardcoded paths (use parameters/config)

## Style Guidelines

### PowerShell

- Use `PascalCase` for functions and parameters
- Use `$camelCase` for local variables
- Include comment-based help for all functions
- Use proper error handling with `try/catch`

### JSON Configs

- Use 2-space indentation
- Include `description` for all properties
- Follow the schema in `widget-config-schema.json`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for icon property type
fix: resolve enum parsing with special characters
docs: update README with new examples
test: add test for object property type
```

## Recognition

Contributors will be recognized in:

- The CHANGELOG.md for their contributions
- The README.md contributors section

Thank you for making Mendix development better! 🚀
