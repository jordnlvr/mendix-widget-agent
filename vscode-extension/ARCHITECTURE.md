# 🏗️ Architecture

> Technical architecture of the Mendix Widget Agent VS Code extension (v2.0)

## Overview

The Mendix Widget Agent is a VS Code extension that provides **Language Model Tools** for AI-driven widget creation through natural language. It works with **any AI model** in VS Code's Agent Mode (Claude, GPT-4, Copilot, etc.).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VS CODE EXTENSION HOST                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    LANGUAGE MODEL TOOLS LAYER                           │ │
│  │                                                                         │ │
│  │  Tools available to ANY model in Agent Mode:                            │ │
│  │  ├── mendix-widget_create_widget   → Natural language widget creation  │ │
│  │  ├── mendix-widget_fix_errors      → Analyze and fix errors            │ │
│  │  ├── mendix-widget_research        → Beast Mode exhaustive research    │ │
│  │  ├── mendix-widget_list_templates  → Show available templates          │ │
│  │  ├── mendix-widget_deploy          → Deploy to Mendix project          │ │
│  │  ├── mendix-widget_show_patterns   → Show learned patterns (nucleus)   │ │
│  │  └── mendix-widget_status          → Agent status and configuration    │ │
│  │                                                                         │ │
│  │  User can reference tools with #mendix-create, #mendix-fix, etc.       │ │
│  │                                                                         │ │
│  └───────────────────────────────┬─────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ↓                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        TOOL EXECUTION LAYER                            │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │  │
│  │  │ Create Widget    │  │ Beast Mode       │  │ Dynamic          │    │  │
│  │  │ Tool             │  │ Research         │  │ Patterns         │    │  │
│  │  │                  │  │                  │  │ (Self-Learning)  │    │  │
│  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘    │  │
│  │           │                     │                     │              │  │
│  │           └─────────────────────┼─────────────────────┘              │  │
│  │                                 │                                     │  │
│  └─────────────────────────────────┼─────────────────────────────────────┘  │
│                                    │                                         │
│                                    ↓                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      VALIDATION LAYER                                   │ │
│  │                                                                         │ │
│  │  MendixPathValidator                                                    │ │
│  │  ├── validateMendixProject()  → Find .mpr, extract metadata            │ │
│  │  ├── checkWidgetConflict()    → Check for existing widgets             │ │
│  │  ├── ensureWidgetsFolder()    → Create widgets/ if needed              │ │
│  │  └── generateUniqueName()     → Handle naming conflicts                │ │
│  │                                                                         │ │
│  └───────────────────────────────┬─────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      GENERATION LAYER                                   │ │
│  │                                                                         │ │
│  │  WidgetGeneratorBridge                                                  │ │
│  │  ├── Node.js CLI (preferred)  → cli/generator.js                       │ │
│  │  ├── PowerShell (fallback)    → Generate-WidgetFromConfig.ps1          │ │
│  │  └── Inline (emergency)       → Built-in generation                    │ │
│  │                                                                         │ │
│  └───────────────────────────────┬─────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      BUILD LOOP LAYER                                   │ │
│  │                                                                         │ │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐            │ │
│  │  │ Generate │ → │  Build   │ → │  Test    │ → │ Deploy   │            │ │
│  │  └──────────┘   └──────────┘   └────┬─────┘   └──────────┘            │ │
│  │       ↑                             │                                  │ │
│  │       │                             ↓                                  │ │
│  │       │                        ┌──────────┐                            │ │
│  │       │◄─── Pattern Fix ◄───── │  Error?  │                            │ │
│  │       │◄─── AI Fix ◄────────── │          │                            │ │
│  │       │                        └──────────┘                            │ │
│  │                                                                         │ │
│  └───────────────────────────────┬─────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      RESEARCH LAYER                                     │ │
│  │                                                                         │ │
│  │  BeastModeResearch (6-Tier Protocol)                                    │ │
│  │  ├── Tier 1: Official Docs    → docs.mendix.com, API refs              │ │
│  │  ├── Tier 2: GitHub Code      → mendix/widgets-resources 🏆            │ │
│  │  ├── Tier 3: npm Packages     → @mendix/* dependents                   │ │
│  │  ├── Tier 4: Community        → Forums, Stack Overflow                 │ │
│  │  ├── Tier 5: Archives         → Wayback Machine                        │ │
│  │  └── Tier 6: Multimedia       → YouTube, Mendix Academy                │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why Language Model Tools (v2.0)?

In v1.x, the extension used a Chat Participant (`@mendix-widget`). This only worked with GitHub Copilot in "Ask Mode".

**The Problem**: In "Agent Mode" with other models (Claude, GPT-4), the Chat Participant couldn't access a language model, causing "Language model unavailable" errors.

**The Solution**: Language Model Tools work with **any model** in Agent Mode. The AI model invokes tools based on the user's intent, and the tools execute the actual logic.

| Approach                    | Works With   | Activation                       |
| --------------------------- | ------------ | -------------------------------- |
| Chat Participant (v1.x)     | Copilot only | `@mendix-widget`                 |
| Language Model Tools (v2.0) | Any model    | Natural language or `#tool-name` |

## Components

### 1. Language Model Tools Layer (`mendixWidgetTools.ts`)

Seven tools registered via `vscode.lm.registerTool()`:

```typescript
export function registerAllTools(context: vscode.ExtensionContext): vscode.Disposable[] {
  return [
    vscode.lm.registerTool('mendix-widget_create_widget', new CreateWidgetTool()),
    vscode.lm.registerTool('mendix-widget_fix_errors', new FixWidgetTool()),
    vscode.lm.registerTool('mendix-widget_research', new ResearchTool()),
    vscode.lm.registerTool('mendix-widget_list_templates', new ListTemplatesTool()),
    vscode.lm.registerTool('mendix-widget_deploy', new DeployTool()),
    vscode.lm.registerTool('mendix-widget_show_patterns', new ShowPatternsTool()),
    vscode.lm.registerTool('mendix-widget_status', new StatusTool()),
  ];
}
```

Each tool implements `vscode.LanguageModelTool<T>`:

```typescript
class CreateWidgetTool implements vscode.LanguageModelTool<CreateWidgetInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<CreateWidgetInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    // Execute widget creation logic
    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(result)]);
  }
}
```

### 2. Validation Layer (`mendixPathValidator.ts`)

Intelligent Mendix project validation. Features:

- **MPR detection** - Finds .mpr files in directory trees
- **Project metadata** - Extracts name, version info
- **Widgets folder** - Knows widgets go in `/widgets`, not project root
- **Conflict detection** - Checks for existing widgets with same name
- **Helpful suggestions** - Provides guidance when paths are invalid

```typescript
export class MendixPathValidator {
  validateMendixProject(inputPath: string): Promise<PathValidationResult>;
  checkWidgetConflict(widgetsFolder: string, widgetName: string): Promise<WidgetConflictResult>;
  ensureWidgetsFolder(projectPath: string): Promise<string>;
  generateUniqueName(widgetsFolder: string, baseName: string): Promise<string>;
}
```

### 3. Generation Layer (`generatorBridge.ts`)

Connects to the widget generator engine. Strategies:

1. **Node.js CLI** (preferred) - Uses `cli/generator.js`
2. **PowerShell** (fallback) - Uses `Generate-WidgetFromConfig.ps1`
3. **Inline** (emergency) - Built-in TypeScript generation

```typescript
export class WidgetGeneratorBridge {
  getAvailableTemplates(): WidgetTemplate[];
  generate(config: WidgetConfig, options): Promise<GenerationResult>;
}
```

### 4. Build Loop Layer (`buildLoop.ts`)

Implements the Research → Build → Test → Fix loop:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUILD LOOP                                   │
│                                                                      │
│  Attempt 1:                                                          │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                   │
│  │  Generate  │ → │   Build    │ → │   Test     │ → ERROR!          │
│  └────────────┘   └────────────┘   └────────────┘                   │
│                                           │                          │
│                                           ↓                          │
│                   ┌─────────────────────────────────────────────┐   │
│                   │              ANALYZE ERROR                   │   │
│                   │                                              │   │
│                   │  1. Pattern matching (fast)                  │   │
│                   │     - Missing module → npm install           │   │
│                   │     - Missing React → add import             │   │
│                   │     - Missing script → fix package.json      │   │
│                   │                                              │   │
│                   │  2. AI analysis (if pattern fails)           │   │
│                   │     - Send error + code context to LLM       │   │
│                   │     - Get specific file edits                │   │
│                   │     - Apply fixes automatically              │   │
│                   │                                              │   │
│                   └─────────────────────────────────────────────┘   │
│                                           │                          │
│                                           ↓                          │
│  Attempt 2:                                                          │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                   │
│  │  (Fixed)   │ → │   Build    │ → │   Test     │ → SUCCESS!        │
│  └────────────┘   └────────────┘   └────────────┘                   │
│                                           │                          │
│                                           ↓                          │
│                                    ┌────────────┐                    │
│                                    │   Deploy   │                    │
│                                    └────────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5. Research Layer (`beastModeResearch.ts`)

Exhaustive research protocol. Never gives up!

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BEAST MODE RESEARCH PROTOCOL                      │
│                                                                      │
│  "The answer exists. I just haven't found it yet."                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ TIER 1: Official Documentation                                  ││
│  │ ├── docs.mendix.com                                             ││
│  │ ├── apidocs.rnd.mendix.com/modelsdk                             ││
│  │ ├── apidocs.rnd.mendix.com/platformsdk                          ││
│  │ └── docs.mendix.com/howto/extensibility                         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ TIER 2: GitHub Code (THE GOLD MINES!) 🏆                        ││
│  │ ├── github.com/mendix/widgets-resources                         ││
│  │ ├── github.com/mendix/sdk-demo                                  ││
│  │ ├── github.com/mendixlabs/*                                     ││
│  │ └── GitHub code search: mendixmodelsdk language:typescript      ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ TIER 3: npm Package Analysis                                    ││
│  │ ├── @mendix/pluggable-widgets-tools                             ││
│  │ ├── Packages depending on @mendix/*                             ││
│  │ └── Real-world implementations                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ TIER 4: Community Forums                                        ││
│  │ ├── community.mendix.com                                        ││
│  │ └── stackoverflow.com/questions/tagged/mendix                   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ TIER 5: Web Archives                                            ││
│  │ ├── web.archive.org/web/*/docs.mendix.com/*                     ││
│  │ └── archive.ph                                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ TIER 6: Video & Multimedia                                      ││
│  │ ├── YouTube: mendix pluggable widgets                           ││
│  │ ├── Mendix Academy courses                                      ││
│  │ └── Mendix World presentations                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ═══════════════════════════════════════════════════════════════════│
│                                                                      │
│  BEAST MODE NEVER QUITS. BEAST MODE FINDS THE ANSWER.               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Widget Creation Flow

```
User Input: "Create a rating widget with 5 stars"
                    │
                    ↓
┌───────────────────────────────────────────────────────────┐
│                   chatParticipant.ts                       │
│                                                            │
│  1. Parse natural language                                 │
│  2. Check for saved settings (work folder, Mendix path)   │
│  3. Send to LLM for analysis                              │
│                                                            │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────┐
│                   LLM Analysis                             │
│                                                            │
│  Input:                                                    │
│  "Create a rating widget with 5 stars"                    │
│                                                            │
│  Output:                                                   │
│  {                                                         │
│    "suggestedConfig": {                                    │
│      "name": "Rating",                                     │
│      "properties": [                                       │
│        { "key": "value", "type": "attribute" },           │
│        { "key": "maxStars", "type": "integer" }           │
│      ],                                                    │
│      "events": [                                           │
│        { "key": "onChange", "caption": "On Change" }      │
│      ]                                                     │
│    },                                                      │
│    "clarifyingQuestions": [                                │
│      "Should the rating be editable or read-only?"        │
│    ]                                                       │
│  }                                                         │
│                                                            │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────┐
│              Clarifying Questions                          │
│                                                            │
│  "Where should I create this widget?"                     │
│  "Do you have a Mendix project to deploy to?"             │
│  "Should the rating be editable or read-only?"            │
│                                                            │
└───────────────────────┬───────────────────────────────────┘
                        │
        User: "D:\MendixProjects\MyApp, editable"
                        │
                        ↓
┌───────────────────────────────────────────────────────────┐
│              mendixPathValidator.ts                        │
│                                                            │
│  Input: "D:\MendixProjects\MyApp"                         │
│                                                            │
│  Process:                                                  │
│  1. Check if path exists                    ✓              │
│  2. Find .mpr file                          ✓ MyApp.mpr   │
│  3. Extract project metadata                ✓ Mendix 11.x │
│  4. Locate widgets folder                   ✓ /widgets    │
│  5. Check for conflicts                     ✓ No rating   │
│                                                            │
│  Output:                                                   │
│  {                                                         │
│    "isValid": true,                                        │
│    "projectName": "MyApp",                                 │
│    "widgetsFolder": "D:\MendixProjects\MyApp\widgets"     │
│  }                                                         │
│                                                            │
└───────────────────────┬───────────────────────────────────┘
                        │
        User: "looks good" (confirmation)
                        │
                        ↓
┌───────────────────────────────────────────────────────────┐
│                   buildLoop.ts                             │
│                                                            │
│  ATTEMPT 1:                                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ generatorBridge.generate(config)                    │  │
│  │   → Creates widget files                            │  │
│  │   → Runs npm install                                │  │
│  │   → Runs npm run build                              │  │
│  └─────────────────────────────────────────────────────┘  │
│                        │                                   │
│                        ↓                                   │
│                   BUILD SUCCESS!                           │
│                        │                                   │
│                        ↓                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Deploy to D:\MendixProjects\MyApp\widgets           │  │
│  │   → Copy rating.mpk                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ↓
┌───────────────────────────────────────────────────────────┐
│                     SUCCESS!                               │
│                                                            │
│  ✅ Widget created: D:\widgets\rating                     │
│  ✅ MPK file: D:\widgets\rating\dist\rating.mpk           │
│  ✅ Deployed to: D:\MendixProjects\MyApp\widgets          │
│                                                            │
│  Press F4 in Studio Pro to refresh the toolbox!           │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

## Error Handling Strategy

### Pattern-Based Fixes (Fast)

```typescript
// Common patterns handled automatically:
{
    "Cannot find module 'X'": "npm install X",
    "React must be in scope": "Add import * as React",
    "Missing script: build": "Add build script to package.json",
    "Object is possibly null": "Add null checks"
}
```

### AI-Powered Fixes (Complex)

When pattern matching fails:

1. Send error + source code to LLM
2. LLM analyzes and suggests specific file edits
3. Apply edits automatically
4. Retry build

```json
{
  "analysis": "The widget is missing a required import for EditableValue",
  "fixes": [
    {
      "file": "src/Rating.tsx",
      "action": "replace",
      "search": "import { ReactElement",
      "replace": "import { ReactElement, EditableValue"
    }
  ]
}
```

## Security Considerations

- **No credentials stored** - Uses VS Code settings for paths
- **Local execution only** - No external API calls except LLM
- **File system isolation** - Only writes to user-specified directories
- **Token cancellation** - All operations respect cancellation

## Performance

| Operation         | Typical Time   |
| ----------------- | -------------- |
| Path validation   | < 100ms        |
| Widget generation | 2-5 seconds    |
| npm install       | 10-30 seconds  |
| npm run build     | 5-15 seconds   |
| Total (no errors) | 20-50 seconds  |
| With 1 auto-fix   | +15-30 seconds |

## Dependencies

```json
{
  "vscode": "^1.95.0",
  "fs-extra": "^11.2.0"
}
```

Minimal dependencies for maximum reliability.
