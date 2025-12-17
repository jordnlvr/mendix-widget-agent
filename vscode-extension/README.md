# 🤖 Mendix Widget Agent - AI-Powered Widget Generator

<p align="center">
  <img src="resources/icon.png" alt="Mendix Widget Agent" width="128">
</p>

<p align="center">
  <strong>The #1 AI-powered Mendix Pluggable Widget generator for VS Code</strong><br>
  <em>Create production-ready custom widgets in minutes, not hours</em>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=BlueMatrix.mendix-widget-agent">
    <img src="https://img.shields.io/visual-studio-marketplace/v/BlueMatrix.mendix-widget-agent?label=VS%20Marketplace&logo=visualstudiocode&color=007ACC" alt="VS Marketplace Version">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=BlueMatrix.mendix-widget-agent">
    <img src="https://img.shields.io/visual-studio-marketplace/i/BlueMatrix.mendix-widget-agent?label=Installs&color=success" alt="Installs">
  </a>
  <img src="https://img.shields.io/badge/Mendix-10.x%20%7C%2011.x-0CABF7" alt="Mendix Compatible">
  <img src="https://img.shields.io/badge/AI-Claude%20%7C%20GPT--4%20%7C%20Copilot-brightgreen" alt="AI Models">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  </a>
</p>

---

## 🎯 Why This Extension?

| Other Extensions        | Mendix Widget Agent                           |
| ----------------------- | --------------------------------------------- |
| ❌ Just snippets        | ✅ **Full widget generation** with AI         |
| ❌ Manual configuration | ✅ **Smart interviewing** - answers saved     |
| ❌ Single AI model      | ✅ **Any AI model** - Claude, GPT-4, Copilot  |
| ❌ No error handling    | ✅ **Auto-fix loop** - researches & fixes     |
| ❌ No deployment        | ✅ **Auto-deploy** to your Mendix project     |
| ❌ Outdated patterns    | ✅ **Self-learning** - gets smarter over time |

**Stop writing boilerplate. Start describing what you need.**

---

## ⚡ Quick Demo

```
You: Create a custom Mendix widget
Agent: 🎨 What would you like to build?
You: A status badge showing red/yellow/green based on an enum
Agent: 📋 Got it! StatusBadge widget detected...
       🏢 Company identifier? (e.g., mycompany)
You: bluematrix
Agent: ✅ Building... deploying... DONE!
```

**Result:** A production-ready widget in your Mendix project's widgets folder. 🎉

---

## ✨ Features

### 🧠 Smart Interview System

The agent asks ALL required questions one-at-a-time:

- **Company** & **Author** - Saved for future widgets
- **Work folder** & **Mendix project** - Remembered
- **Toolbox category** - Display, Input, Data, Container, Visualization
- **Icon** - Use your SVG or get a default

### 🔄 React → Mendix Conversion

Have an existing React component? Convert it:

```
#mendix-convert my DateTimePicker component at ./src/components/DateTimePicker.tsx
```

### 🛡️ Error-Proof Generation

All proven patterns embedded:

- ✅ Correct `package.xml` (no moduleType errors!)
- ✅ Correct `package.json` (widgetName, packagePath, overrides)
- ✅ Correct `tsconfig.json` (extends pattern)
- ✅ React 18.2.0 compatibility
- ✅ Mendix 10.x and 11.x support

### 🔬 Beast Mode Research

Stuck? The agent searches **6 tiers** of sources:

1. Official Mendix docs & API references
2. GitHub (mendix/widgets-resources repository)
3. npm packages with @mendix/\* dependencies
4. Community forums & Stack Overflow
5. Web archives
6. Video tutorials & Mendix Academy

### 🔄 Auto-Fix Loop

Build failed? The agent:

1. Analyzes the error
2. Researches the fix
3. Applies the solution
4. Rebuilds automatically

### 📦 10+ Pre-built Templates

| Template        | Description                     |
| --------------- | ------------------------------- |
| `status-badge`  | Colored badge based on status   |
| `data-card`     | Card with title, content, image |
| `progress-bar`  | Animated progress indicator     |
| `rating`        | Star rating input               |
| `icon-button`   | Button with icon and label      |
| `countdown`     | Timer to target date            |
| `text-input`    | Enhanced input with validation  |
| `modal-trigger` | Button that opens modal         |
| `file-upload`   | Drag-and-drop upload            |
| `tabs`          | Tab navigation                  |

---

## 🚀 Quick Start

### 1. Install from Marketplace

Search **"Mendix Widget Agent"** in VS Code Extensions, or:

```bash
code --install-extension BlueMatrix.mendix-widget-agent
```

### 2. Open Agent Mode

1. Open the **Chat panel** (Ctrl+Shift+I or Cmd+Shift+I)
2. Click the **sparkle icon ✨** to switch to Agent Mode
3. Select any AI model (Claude, GPT-4, Copilot)

### 3. Create Your First Widget

Just type:

```
Create a Mendix widget
```

The agent handles everything else!

---

## 🔧 Available Tools

Use `#` references to invoke tools directly:

| Tool                | Description                    | Example                             |
| ------------------- | ------------------------------ | ----------------------------------- |
| `#mendix-create`    | Create widget from description | `#mendix-create a pie chart widget` |
| `#mendix-convert`   | Convert React/TSX to widget    | `#mendix-convert ./MyComponent.tsx` |
| `#mendix-fix`       | Fix build errors               | `#mendix-fix` + paste errors        |
| `#mendix-research`  | Research patterns              | `#mendix-research drag and drop`    |
| `#mendix-templates` | List templates                 | `#mendix-templates`                 |
| `#mendix-deploy`    | Deploy to project              | `#mendix-deploy to D:\MyApp`        |
| `#mendix-patterns`  | Show learned patterns          | `#mendix-patterns`                  |
| `#mendix-status`    | Agent status                   | `#mendix-status`                    |

---

## ⚙️ Configuration

Access via **Settings → Extensions → Mendix Widget Agent**

| Setting                                | Description            | Default |
| -------------------------------------- | ---------------------- | ------- |
| `mendixWidget.defaultCompany`          | Your company ID        | (empty) |
| `mendixWidget.defaultAuthor`           | Your name              | (empty) |
| `mendixWidget.defaultWorkFolder`       | Widget output folder   | (empty) |
| `mendixWidget.defaultMendixProject`    | Mendix project path    | (empty) |
| `mendixWidget.autoInstallDependencies` | Run npm install        | `true`  |
| `mendixWidget.autoBuild`               | Build after generation | `true`  |
| `mendixWidget.autoDeploy`              | Deploy to project      | `false` |
| `mendixWidget.beastModeEnabled`        | Exhaustive research    | `true`  |

**Pro tip:** Set `defaultCompany` and `defaultAuthor` once - never enter them again!

---

## 🆚 Comparison with Other Extensions

| Feature                 | This Extension            | Others     |
| ----------------------- | ------------------------- | ---------- |
| **AI-Powered**          | ✅ Yes                    | ❌ No      |
| **Any AI Model**        | ✅ Claude, GPT-4, Copilot | ❌ N/A     |
| **Smart Interviewing**  | ✅ Yes                    | ❌ No      |
| **React Conversion**    | ✅ Yes                    | ❌ No      |
| **Auto-Fix Errors**     | ✅ Yes                    | ❌ No      |
| **Self-Learning**       | ✅ Yes                    | ❌ No      |
| **Auto-Deploy**         | ✅ Yes                    | ❌ No      |
| **Beast Mode Research** | ✅ 6-tier search          | ❌ No      |
| **Templates**           | ✅ 10+                    | ⚠️ Limited |
| **Mendix 11.x**         | ✅ Yes                    | ⚠️ Maybe   |

---

## 📋 Requirements

- **VS Code** 1.95.0 or higher
- **Node.js** 18+ (for building widgets)
- **Mendix Studio Pro** 10.x or 11.x
- **An AI model** in VS Code (Copilot, Claude, GPT-4, etc.)

---

## 🔄 Auto-Update

This extension auto-updates through the VS Code Marketplace. You'll always have the latest features and fixes!

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/jordnlvr/mendix-widget-agent/issues)
- **Discussions:** [GitHub Discussions](https://github.com/jordnlvr/mendix-widget-agent/discussions)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Made with ❤️ by BlueMatrix for the Mendix community</strong><br>
  <em>Stop struggling with widget boilerplate. Let AI do the heavy lifting.</em>
</p>
