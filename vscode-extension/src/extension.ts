/**
 * Mendix Custom Widget Agent - VS Code Extension v2.4.5
 *
 * AI-powered Mendix Pluggable Widget generator with SMART INTERVIEWING.
 *
 * NOW USES LANGUAGE MODEL TOOLS instead of Chat Participant!
 * This means it works with ANY model (Claude, GPT, Copilot, etc.)
 * in Agent Mode. Users don't need @mendix-widget anymore -
 * just ask to create a Mendix widget and the tools get invoked.
 *
 * v2.4.5 MAJOR FIX:
 * - Fixed icon generation: Uses PNG files with naming convention (not embedded XML)
 * - Fixed drop zones: Generates editorConfig.ts with proper DropZone type
 * - Fixed pattern detection: No more duplicate properties, proper word boundary matching
 * - Fixed preview: Uses official Mendix .renderer pattern from fieldset-web
 */

import * as vscode from 'vscode';
import { WidgetGeneratorBridge } from './generatorBridge';
import { MendixPathValidator } from './mendixPathValidator';
import { registerAllTools } from './widgetAgentTools';

export function activate(context: vscode.ExtensionContext) {
  console.log('[MendixWidgetAgent] v2.4.5 - Icon & DropZone Fix activating...');

  // Initialize components
  const pathValidator = new MendixPathValidator();
  const generatorBridge = new WidgetGeneratorBridge(context);

  // Register all Language Model Tools
  // These work with ANY model in Agent Mode!
  registerAllTools(context, pathValidator, generatorBridge);

  // Register commands (still useful for quick access via Command Palette)
  context.subscriptions.push(
    vscode.commands.registerCommand('mendix-widget.setMendixProject', async () => {
      const result = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select Mendix Project Folder',
        openLabel: 'Select Project',
      });

      if (result && result[0]) {
        const projectPath = result[0].fsPath;
        const validation = await pathValidator.validateMendixProject(projectPath);

        if (validation.isValid) {
          const config = vscode.workspace.getConfiguration('mendixWidget');
          await config.update(
            'defaultMendixProject',
            projectPath,
            vscode.ConfigurationTarget.Global
          );
          vscode.window.showInformationMessage(
            `Mendix project set: ${validation.projectName} (${validation.mendixVersion})`
          );
        } else {
          vscode.window.showErrorMessage(validation.error || 'Invalid Mendix project');
        }
      }
    }),

    vscode.commands.registerCommand('mendix-widget.setWorkFolder', async () => {
      const result = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select Widget Work Folder',
        openLabel: 'Select Folder',
      });

      if (result && result[0]) {
        const config = vscode.workspace.getConfiguration('mendixWidget');
        await config.update(
          'defaultWorkFolder',
          result[0].fsPath,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage(`Work folder set: ${result[0].fsPath}`);
      }
    }),

    vscode.commands.registerCommand('mendix-widget.showTemplates', async () => {
      const templates = generatorBridge.getAvailableTemplates();
      const items = templates.map((t) => ({
        label: t.displayName,
        description: t.description,
        detail: `Properties: ${t.properties.length}, Events: ${t.events.length}`,
        template: t,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a template to use',
        title: 'Available Widget Templates',
      });

      if (selected) {
        vscode.window.showInformationMessage(
          `Template "${
            selected.label
          }" selected. In Agent Mode, ask to create a ${selected.template.displayName.toLowerCase()}.`
        );
      }
    })
  );

  // Show welcome message on first activation (updated for v2.4.4)
  const welcomeVersion = context.globalState.get<string>('mendixWidget.welcomeVersion');
  if (welcomeVersion !== '2.4.4') {
    vscode.window
      .showInformationMessage(
        '🤖 Mendix Widget Agent v2.4.4 - Better interviews, auto-detect icons, working drop zones!',
        'Got it!'
      )
      .then(() => {
        context.globalState.update('mendixWidget.welcomeVersion', '2.4.4');
      });
  }

  console.log(
    '[MendixWidgetAgent] v2.4.4 activated! 8 tools registered (create, convert, fix, research, templates, deploy, patterns, status).'
  );
}

export function deactivate() {
  console.log('[MendixWidgetAgent] Deactivated');
}
