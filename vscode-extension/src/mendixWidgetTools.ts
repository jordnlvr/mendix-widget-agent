/**
 * Mendix Widget Tools
 *
 * Language Model Tools that work with ANY model in Agent Mode.
 * These replace the Chat Participant approach and are automatically
 * invoked when users ask about Mendix widgets.
 *
 * Key difference: Instead of @mendix-widget /create, users just ask
 * "Create a Mendix widget that shows status" and the tool gets invoked.
 */

import * as vscode from 'vscode';
import { BeastModeResearch } from './beastModeResearch';
import { BuildLoop } from './buildLoop';
import { DynamicPatterns } from './dynamicPatterns';
import { WidgetConfig, WidgetGeneratorBridge } from './generatorBridge';
import { KnowledgeSharing } from './knowledgeSharing';
import { MendixPathValidator } from './mendixPathValidator';
import { SelfUpdate, VERSION } from './selfUpdate';

// ============================================================================
// TOOL 1: CREATE WIDGET
// ============================================================================

interface ICreateWidgetParams {
  description: string;
  widgetName?: string;
  workFolder?: string;
  mendixProject?: string;
}

export class CreateWidgetTool implements vscode.LanguageModelTool<ICreateWidgetParams> {
  private context: vscode.ExtensionContext;
  private pathValidator: MendixPathValidator;
  private generatorBridge: WidgetGeneratorBridge;
  private buildLoop: BuildLoop;
  private dynamicPatterns: DynamicPatterns;

  constructor(
    context: vscode.ExtensionContext,
    pathValidator: MendixPathValidator,
    generatorBridge: WidgetGeneratorBridge,
    buildLoop: BuildLoop,
    dynamicPatterns: DynamicPatterns
  ) {
    this.context = context;
    this.pathValidator = pathValidator;
    this.generatorBridge = generatorBridge;
    this.buildLoop = buildLoop;
    this.dynamicPatterns = dynamicPatterns;
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<ICreateWidgetParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    const { description, widgetName } = options.input;

    return {
      invocationMessage: `Creating Mendix widget${widgetName ? `: ${widgetName}` : ''}...`,
      confirmationMessages: {
        title: 'Create Mendix Widget',
        message: new vscode.MarkdownString(
          `Create a Mendix pluggable widget from this description?\n\n` +
            `**Description:** ${description}\n\n` +
            (widgetName ? `**Widget Name:** ${widgetName}` : '')
        ),
      },
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<ICreateWidgetParams>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { description, widgetName, workFolder, mendixProject } = options.input;

    // Get configured paths if not provided
    const config = vscode.workspace.getConfiguration('mendixWidget');
    const effectiveWorkFolder = workFolder || config.get<string>('defaultWorkFolder');
    const effectiveMendixProject = mendixProject || config.get<string>('defaultMendixProject');

    // Validate we have a work folder
    if (!effectiveWorkFolder) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `❌ No work folder specified. Please provide a workFolder parameter or set one via the Mendix Widget: Set Work Folder command.`
        ),
      ]);
    }

    // Generate widget name from description if not provided
    const effectiveWidgetName = widgetName || this.generateWidgetName(description);

    // Build the widget configuration
    const widgetConfig: WidgetConfig = {
      name: effectiveWidgetName,
      displayName: this.humanize(effectiveWidgetName),
      description: description,
      category: 'Display',
      properties: [],
      events: [],
    };

    // Execute the build
    let output: string[] = [];
    const result = await this.buildLoop.execute(
      widgetConfig,
      {
        workFolder: effectiveWorkFolder,
        mendixProject: effectiveMendixProject,
        autoDeploy: !!effectiveMendixProject,
      },
      undefined, // No model needed for basic build
      (update) => output.push(update),
      token
    );

    if (result.success) {
      // Learn from success - use the widget template learning method
      this.dynamicPatterns.learnWidgetTemplate(
        widgetConfig.category || 'Display',
        description,
        '', // No template code for now
        widgetConfig.properties.map((p) => ({
          name: p.key,
          type: p.type,
          description: p.caption || '',
        }))
      );

      let response = `✅ Widget "${effectiveWidgetName}" created successfully!\n\n`;
      response += `📁 Location: ${result.outputPath}\n`;
      response += `📦 MPK File: ${result.mpkPath}\n`;

      if (result.deployedTo) {
        response += `🚀 Deployed to: ${result.deployedTo}\n`;
        response += `\nPress F4 in Studio Pro to refresh the toolbox.`;
      }

      return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    } else {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `❌ Build failed:\n${result.errors.join('\n')}\n\n` +
            `Use the fix_mendix_widget tool to analyze and fix these errors.`
        ),
      ]);
    }
  }

  private generateWidgetName(description: string): string {
    // Extract key words and create PascalCase name
    const words = description
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(
        (w) =>
          ![
            'a',
            'an',
            'the',
            'that',
            'which',
            'with',
            'for',
            'to',
            'create',
            'make',
            'build',
          ].includes(w)
      )
      .slice(0, 3);

    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Widget';
  }

  private humanize(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').trim();
  }
}

// ============================================================================
// TOOL 2: FIX WIDGET ERRORS
// ============================================================================

interface IFixWidgetParams {
  errorMessage: string;
  widgetPath?: string;
}

export class FixWidgetTool implements vscode.LanguageModelTool<IFixWidgetParams> {
  private beastMode: BeastModeResearch;
  private dynamicPatterns: DynamicPatterns;
  private buildLoop: BuildLoop;

  constructor(
    beastMode: BeastModeResearch,
    dynamicPatterns: DynamicPatterns,
    buildLoop: BuildLoop
  ) {
    this.beastMode = beastMode;
    this.dynamicPatterns = dynamicPatterns;
    this.buildLoop = buildLoop;
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IFixWidgetParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Analyzing Mendix widget build errors...',
      confirmationMessages: {
        title: 'Fix Widget Errors',
        message: new vscode.MarkdownString(
          `Analyze and suggest fixes for this error?\n\n\`\`\`\n${options.input.errorMessage.substring(
            0,
            200
          )}...\n\`\`\``
        ),
      },
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IFixWidgetParams>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { errorMessage } = options.input;

    // First, check dynamic patterns for known fixes
    const knownFixes = this.dynamicPatterns.getMatchingErrorFixes(errorMessage);

    let response = `## 🔧 Error Analysis\n\n`;
    response += `**Error:**\n\`\`\`\n${errorMessage}\n\`\`\`\n\n`;

    if (knownFixes.length > 0) {
      response += `### 💡 Known Fixes (from experience)\n\n`;
      for (const fix of knownFixes.slice(0, 3)) {
        const confidence = (fix.confidence * 100).toFixed(0);
        response += `- **${fix.fix.description}** (${confidence}% confidence)\n`;
        if (fix.fix.replace) {
          response += `  \`\`\`typescript\n  ${fix.fix.replace}\n  \`\`\`\n`;
        }
      }
      response += '\n';
    }

    // Research additional fixes
    response += `### 🔬 Research-Based Suggestions\n\n`;
    const research = await this.buildLoop.researchFixes([errorMessage], undefined);
    response += research;

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
  }
}

// ============================================================================
// TOOL 3: RESEARCH WIDGET PATTERNS
// ============================================================================

interface IResearchParams {
  topic: string;
}

export class ResearchWidgetTool implements vscode.LanguageModelTool<IResearchParams> {
  private beastMode: BeastModeResearch;

  constructor(beastMode: BeastModeResearch) {
    this.beastMode = beastMode;
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IResearchParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: `Researching Mendix widget patterns: ${options.input.topic}...`,
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IResearchParams>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { topic } = options.input;

    let output: string[] = [];
    const research = await this.beastMode.research(
      topic,
      undefined, // No model required
      (update) => output.push(update)
    );

    let response = `## 🔬 Beast Mode Research: "${topic}"\n\n`;
    response += research.summary + '\n\n';

    if (research.codeExamples.length > 0) {
      response += `### Code Examples\n\n`;
      for (const example of research.codeExamples.slice(0, 3)) {
        response += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n`;
        response += `*Source: ${example.source}*\n\n`;
      }
    }

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
  }
}

// ============================================================================
// TOOL 4: LIST TEMPLATES
// ============================================================================

interface IListTemplatesParams {
  category?: string;
}

export class ListTemplatesTool implements vscode.LanguageModelTool<IListTemplatesParams> {
  private generatorBridge: WidgetGeneratorBridge;

  constructor(generatorBridge: WidgetGeneratorBridge) {
    this.generatorBridge = generatorBridge;
  }

  async prepareInvocation(
    _options: vscode.LanguageModelToolInvocationPrepareOptions<IListTemplatesParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Listing available Mendix widget templates...',
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IListTemplatesParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const templates = this.generatorBridge.getAvailableTemplates();

    let response = `## 📦 Available Widget Templates\n\n`;

    for (const template of templates) {
      response += `### ${template.displayName}\n`;
      response += `- **ID:** ${template.id}\n`;
      response += `- **Description:** ${template.description}\n`;
      response += `- **Properties:** ${
        template.properties.map((p) => p.key).join(', ') || 'None'
      }\n`;
      response += `- **Events:** ${template.events.map((e) => e.key).join(', ') || 'None'}\n\n`;
    }

    response += `\nTo use a template, use the create_mendix_widget tool with a description that matches the template.`;

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
  }
}

// ============================================================================
// TOOL 5: DEPLOY WIDGET
// ============================================================================

interface IDeployWidgetParams {
  widgetPath: string;
  mendixProjectPath: string;
}

export class DeployWidgetTool implements vscode.LanguageModelTool<IDeployWidgetParams> {
  private pathValidator: MendixPathValidator;

  constructor(pathValidator: MendixPathValidator) {
    this.pathValidator = pathValidator;
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IDeployWidgetParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Deploying widget to Mendix project...',
      confirmationMessages: {
        title: 'Deploy Widget',
        message: new vscode.MarkdownString(
          `Deploy widget to Mendix project?\n\n` +
            `**Widget:** ${options.input.widgetPath}\n` +
            `**Project:** ${options.input.mendixProjectPath}`
        ),
      },
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IDeployWidgetParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { widgetPath, mendixProjectPath } = options.input;

    // Validate project
    const validation = await this.pathValidator.validateMendixProject(mendixProjectPath);

    if (!validation.isValid) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `❌ Invalid Mendix project: ${validation.error}\n\n${validation.suggestion || ''}`
        ),
      ]);
    }

    // TODO: Actually copy the widget
    // For now, return instructions
    let response = `## 🚀 Deployment Target Validated\n\n`;
    response += `✅ **Project:** ${validation.projectName}\n`;
    response += `📁 **Location:** ${validation.projectPath}\n`;
    response += `🔧 **Mendix Version:** ${validation.mendixVersion}\n`;
    response += `📦 **Widgets Folder:** ${validation.widgetsFolder}\n\n`;

    response += `To complete deployment:\n`;
    response += `1. Build the widget: \`npm run build\`\n`;
    response += `2. Copy the .mpk file to: ${validation.widgetsFolder}\n`;
    response += `3. Press F4 in Studio Pro to refresh\n`;

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
  }
}

// ============================================================================
// TOOL 6: SHOW PATTERNS (The Nucleus)
// ============================================================================

interface IShowPatternsParams {
  category?: 'errors' | 'practices' | 'apis' | 'all';
}

export class ShowPatternsTool implements vscode.LanguageModelTool<IShowPatternsParams> {
  private dynamicPatterns: DynamicPatterns;

  constructor(dynamicPatterns: DynamicPatterns) {
    this.dynamicPatterns = dynamicPatterns;
  }

  async prepareInvocation(
    _options: vscode.LanguageModelToolInvocationPrepareOptions<IShowPatternsParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Retrieving learned patterns from the nucleus...',
    };
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IShowPatternsParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const stats = this.dynamicPatterns.getStats();

    let response = `## 🔮 The Nucleus - Learned Patterns\n\n`;
    response += `These patterns improve over time as you build widgets.\n\n`;

    response += `| Category | Count |\n`;
    response += `|----------|-------|\n`;
    response += `| Error Fixes | ${stats.errorFixes} |\n`;
    response += `| Widget Templates | ${stats.templates} |\n`;
    response += `| SDK APIs | ${stats.sdkApis} |\n`;
    response += `| Best Practices | ${stats.bestPractices} |\n`;
    response += `| **Learned from Experience** | **${stats.learnedPatterns}** |\n\n`;

    // Show some error fixes
    const errorFixes = this.dynamicPatterns.getMatchingErrorFixes('');
    if (errorFixes.length > 0) {
      response += `### 🔧 Top Error Fixes\n\n`;
      for (const fix of errorFixes.slice(0, 3)) {
        response += `- **${fix.fix.description}** (${(fix.confidence * 100).toFixed(
          0
        )}% confidence)\n`;
      }
      response += '\n';
    }

    // Show best practices
    const practices = this.dynamicPatterns.getBestPractices();
    if (practices.length > 0) {
      response += `### 💡 Best Practices\n\n`;
      for (const practice of practices.slice(0, 3)) {
        response += `- **${practice.title}:** ${practice.description}\n`;
      }
    }

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
  }
}

// ============================================================================
// TOOL 7: GET STATUS
// ============================================================================

interface IStatusParams {}

export class GetStatusTool implements vscode.LanguageModelTool<IStatusParams> {
  private knowledgeSharing: KnowledgeSharing;
  private dynamicPatterns: DynamicPatterns;
  private selfUpdate: SelfUpdate;

  constructor(
    knowledgeSharing: KnowledgeSharing,
    dynamicPatterns: DynamicPatterns,
    selfUpdate: SelfUpdate
  ) {
    this.knowledgeSharing = knowledgeSharing;
    this.dynamicPatterns = dynamicPatterns;
    this.selfUpdate = selfUpdate;
  }

  async prepareInvocation(
    _options: vscode.LanguageModelToolInvocationPrepareOptions<IStatusParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.PreparedToolInvocation> {
    return {
      invocationMessage: 'Getting Mendix Widget Agent status...',
    };
  }

  async invoke(
    _options: vscode.LanguageModelToolInvocationOptions<IStatusParams>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const stats = this.dynamicPatterns.getStats();
    const kbStatus = this.knowledgeSharing.getStatus();
    const updateInfo = await this.selfUpdate.checkForUpdates();

    const config = vscode.workspace.getConfiguration('mendixWidget');

    let response = `## 📊 Mendix Widget Agent Status\n\n`;

    response += `### Version\n`;
    response += `- **Installed:** ${VERSION}\n`;
    if (updateInfo.updateAvailable) {
      response += `- ⚠️ **Update Available:** ${updateInfo.latestVersion}\n`;
    } else {
      response += `- ✅ Up to date\n`;
    }
    response += '\n';

    response += `### Configuration\n`;
    response += `- **Work Folder:** ${config.get('defaultWorkFolder') || 'Not set'}\n`;
    response += `- **Mendix Project:** ${config.get('defaultMendixProject') || 'Not set'}\n\n`;

    response += `### The Nucleus\n`;
    response += `- **Error Fixes:** ${stats.errorFixes}\n`;
    response += `- **Templates:** ${stats.templates}\n`;
    response += `- **Learned Patterns:** ${stats.learnedPatterns}\n\n`;

    response += `### Knowledge Base\n`;
    if (kbStatus.enabled) {
      response += `✅ Connected (${kbStatus.entriesCount} entries)\n`;
    } else {
      response += `⚠️ Not connected\n`;
    }

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
  }
}

// ============================================================================
// TOOL REGISTRATION HELPER
// ============================================================================

export function registerAllTools(
  context: vscode.ExtensionContext,
  pathValidator: MendixPathValidator,
  generatorBridge: WidgetGeneratorBridge
): void {
  // Initialize shared components
  const beastMode = new BeastModeResearch();
  const dynamicPatterns = new DynamicPatterns();
  const buildLoop = new BuildLoop(generatorBridge, beastMode);
  const knowledgeSharing = new KnowledgeSharing();
  const selfUpdate = new SelfUpdate();

  // Register all tools
  context.subscriptions.push(
    vscode.lm.registerTool(
      'mendix-widget_create_widget',
      new CreateWidgetTool(context, pathValidator, generatorBridge, buildLoop, dynamicPatterns)
    ),
    vscode.lm.registerTool(
      'mendix-widget_fix_errors',
      new FixWidgetTool(beastMode, dynamicPatterns, buildLoop)
    ),
    vscode.lm.registerTool('mendix-widget_research', new ResearchWidgetTool(beastMode)),
    vscode.lm.registerTool('mendix-widget_list_templates', new ListTemplatesTool(generatorBridge)),
    vscode.lm.registerTool('mendix-widget_deploy', new DeployWidgetTool(pathValidator)),
    vscode.lm.registerTool('mendix-widget_show_patterns', new ShowPatternsTool(dynamicPatterns)),
    vscode.lm.registerTool(
      'mendix-widget_status',
      new GetStatusTool(knowledgeSharing, dynamicPatterns, selfUpdate)
    )
  );

  console.log('[MendixWidget] All 7 Language Model Tools registered!');
}
