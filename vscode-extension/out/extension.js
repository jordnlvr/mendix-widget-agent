"use strict";
/**
 * Mendix Custom Widget Agent - VS Code Extension v2.4.2
 *
 * AI-powered Mendix Pluggable Widget generator with SMART INTERVIEWING.
 *
 * NOW USES LANGUAGE MODEL TOOLS instead of Chat Participant!
 * This means it works with ANY model (Claude, GPT, Copilot, etc.)
 * in Agent Mode. Users don't need @mendix-widget anymore -
 * just ask to create a Mendix widget and the tools get invoked.
 *
 * v2.4.2 Fixes:
 * - Mendix 11.5 compatibility (pluggable-widgets-tools 11.3.0)
 * - Reserved 'class' property error fixed
 * - Icon question now properly asked in interview
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const generatorBridge_1 = require("./generatorBridge");
const mendixPathValidator_1 = require("./mendixPathValidator");
const widgetAgentTools_1 = require("./widgetAgentTools");
function activate(context) {
    console.log('[MendixWidgetAgent] v2.4.1 - Enhanced Interview Edition activating...');
    // Initialize components
    const pathValidator = new mendixPathValidator_1.MendixPathValidator();
    const generatorBridge = new generatorBridge_1.WidgetGeneratorBridge(context);
    // Register all Language Model Tools
    // These work with ANY model in Agent Mode!
    (0, widgetAgentTools_1.registerAllTools)(context, pathValidator, generatorBridge);
    // Register commands (still useful for quick access via Command Palette)
    context.subscriptions.push(vscode.commands.registerCommand('mendix-widget.setMendixProject', async () => {
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
                await config.update('defaultMendixProject', projectPath, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Mendix project set: ${validation.projectName} (${validation.mendixVersion})`);
            }
            else {
                vscode.window.showErrorMessage(validation.error || 'Invalid Mendix project');
            }
        }
    }), vscode.commands.registerCommand('mendix-widget.setWorkFolder', async () => {
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: 'Select Widget Work Folder',
            openLabel: 'Select Folder',
        });
        if (result && result[0]) {
            const config = vscode.workspace.getConfiguration('mendixWidget');
            await config.update('defaultWorkFolder', result[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Work folder set: ${result[0].fsPath}`);
        }
    }), vscode.commands.registerCommand('mendix-widget.showTemplates', async () => {
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
            vscode.window.showInformationMessage(`Template "${selected.label}" selected. In Agent Mode, ask to create a ${selected.template.displayName.toLowerCase()}.`);
        }
    }));
    // Show welcome message on first activation (updated for v2.4.2)
    const welcomeVersion = context.globalState.get('mendixWidget.welcomeVersion');
    if (welcomeVersion !== '2.4.2') {
        vscode.window
            .showInformationMessage('🤖 Mendix Widget Agent v2.4.2 - Fixed Mendix 11.5 compatibility & reserved property errors!', 'Got it!')
            .then(() => {
            context.globalState.update('mendixWidget.welcomeVersion', '2.4.2');
        });
    }
    console.log('[MendixWidgetAgent] v2.4.1 activated! 8 tools registered (create, convert, fix, research, templates, deploy, patterns, status).');
}
function deactivate() {
    console.log('[MendixWidgetAgent] Deactivated');
}
//# sourceMappingURL=extension.js.map