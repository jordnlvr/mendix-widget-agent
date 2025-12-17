"use strict";
/**
 * Widget Generator Bridge
 *
 * Connects the VS Code extension to the CLI generator engine.
 * This is the execution layer - the AI brain decides, this executes.
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
exports.WidgetGeneratorBridge = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class WidgetGeneratorBridge {
    context;
    generatorPath;
    constructor(context) {
        this.context = context;
        // The generator is in the parent directory
        this.generatorPath = path.join(context.extensionPath, '..', 'cli');
    }
    /**
     * Get list of available templates
     */
    getAvailableTemplates() {
        return [
            {
                id: 'status-badge',
                displayName: 'Status Badge',
                description: 'Displays a colored badge based on status value',
                properties: [
                    {
                        key: 'status',
                        type: 'attribute',
                        caption: 'Status',
                        description: 'The status value to display',
                        required: true,
                    },
                    {
                        key: 'size',
                        type: 'enumeration',
                        caption: 'Size',
                        defaultValue: 'medium',
                        enumValues: [
                            { key: 'small', caption: 'Small' },
                            { key: 'medium', caption: 'Medium' },
                            { key: 'large', caption: 'Large' },
                        ],
                    },
                ],
                events: [],
            },
            {
                id: 'data-card',
                displayName: 'Data Card',
                description: 'A card component with title, content, and optional image',
                properties: [
                    { key: 'title', type: 'expression', caption: 'Title', required: true },
                    { key: 'content', type: 'expression', caption: 'Content' },
                    { key: 'imageUrl', type: 'expression', caption: 'Image URL' },
                    { key: 'showShadow', type: 'boolean', caption: 'Show Shadow', defaultValue: 'true' },
                ],
                events: [
                    { key: 'onClick', caption: 'On Click', description: 'Triggered when card is clicked' },
                ],
            },
            {
                id: 'progress-bar',
                displayName: 'Progress Bar',
                description: 'Animated progress bar with customizable colors',
                properties: [
                    {
                        key: 'value',
                        type: 'attribute',
                        caption: 'Value',
                        description: 'Current progress (0-100)',
                        required: true,
                    },
                    { key: 'maxValue', type: 'integer', caption: 'Max Value', defaultValue: '100' },
                    { key: 'color', type: 'string', caption: 'Color', defaultValue: '#264AE5' },
                    { key: 'showLabel', type: 'boolean', caption: 'Show Label', defaultValue: 'true' },
                ],
                events: [],
            },
            {
                id: 'rating',
                displayName: 'Rating',
                description: 'Star rating input component',
                properties: [
                    {
                        key: 'value',
                        type: 'attribute',
                        caption: 'Value',
                        description: 'Current rating value',
                        required: true,
                    },
                    { key: 'maxStars', type: 'integer', caption: 'Max Stars', defaultValue: '5' },
                    { key: 'readOnly', type: 'boolean', caption: 'Read Only', defaultValue: 'false' },
                    {
                        key: 'size',
                        type: 'enumeration',
                        caption: 'Size',
                        enumValues: [
                            { key: 'small', caption: 'Small' },
                            { key: 'medium', caption: 'Medium' },
                            { key: 'large', caption: 'Large' },
                        ],
                    },
                ],
                events: [
                    { key: 'onChange', caption: 'On Change', description: 'Triggered when rating changes' },
                ],
            },
            {
                id: 'icon-button',
                displayName: 'Icon Button',
                description: 'A button with icon and optional label',
                properties: [
                    {
                        key: 'icon',
                        type: 'string',
                        caption: 'Icon Class',
                        description: 'Glyphicon or custom icon class',
                        required: true,
                    },
                    { key: 'label', type: 'expression', caption: 'Label' },
                    {
                        key: 'variant',
                        type: 'enumeration',
                        caption: 'Variant',
                        enumValues: [
                            { key: 'primary', caption: 'Primary' },
                            { key: 'secondary', caption: 'Secondary' },
                            { key: 'danger', caption: 'Danger' },
                            { key: 'success', caption: 'Success' },
                        ],
                    },
                    { key: 'disabled', type: 'boolean', caption: 'Disabled', defaultValue: 'false' },
                ],
                events: [
                    { key: 'onClick', caption: 'On Click', description: 'Triggered when button is clicked' },
                ],
            },
            {
                id: 'countdown',
                displayName: 'Countdown Timer',
                description: 'Displays countdown to a target date/time',
                properties: [
                    { key: 'targetDate', type: 'attribute', caption: 'Target Date', required: true },
                    {
                        key: 'format',
                        type: 'enumeration',
                        caption: 'Format',
                        enumValues: [
                            { key: 'full', caption: 'Days Hours Minutes Seconds' },
                            { key: 'compact', caption: 'Compact' },
                            { key: 'minimal', caption: 'Minimal' },
                        ],
                    },
                    { key: 'showLabels', type: 'boolean', caption: 'Show Labels', defaultValue: 'true' },
                ],
                events: [
                    {
                        key: 'onComplete',
                        caption: 'On Complete',
                        description: 'Triggered when countdown reaches zero',
                    },
                ],
            },
            {
                id: 'text-input',
                displayName: 'Text Input',
                description: 'Enhanced text input with validation',
                properties: [
                    { key: 'value', type: 'attribute', caption: 'Value', required: true },
                    { key: 'placeholder', type: 'expression', caption: 'Placeholder' },
                    { key: 'pattern', type: 'string', caption: 'Validation Pattern' },
                    { key: 'maxLength', type: 'integer', caption: 'Max Length' },
                    { key: 'showClear', type: 'boolean', caption: 'Show Clear Button', defaultValue: 'true' },
                ],
                events: [
                    { key: 'onChange', caption: 'On Change' },
                    { key: 'onBlur', caption: 'On Blur' },
                ],
            },
            {
                id: 'modal-trigger',
                displayName: 'Modal Trigger',
                description: 'Button that opens a modal/popup',
                properties: [
                    { key: 'buttonText', type: 'expression', caption: 'Button Text', required: true },
                    { key: 'modalTitle', type: 'expression', caption: 'Modal Title' },
                    {
                        key: 'modalSize',
                        type: 'enumeration',
                        caption: 'Modal Size',
                        enumValues: [
                            { key: 'small', caption: 'Small' },
                            { key: 'medium', caption: 'Medium' },
                            { key: 'large', caption: 'Large' },
                            { key: 'fullscreen', caption: 'Full Screen' },
                        ],
                    },
                ],
                events: [
                    { key: 'onOpen', caption: 'On Open' },
                    { key: 'onClose', caption: 'On Close' },
                ],
            },
            {
                id: 'file-upload',
                displayName: 'File Upload',
                description: 'Drag-and-drop file upload component',
                properties: [
                    {
                        key: 'accept',
                        type: 'string',
                        caption: 'Accepted Types',
                        description: 'e.g., .pdf,.docx,image/*',
                    },
                    { key: 'maxSize', type: 'integer', caption: 'Max Size (MB)', defaultValue: '10' },
                    { key: 'multiple', type: 'boolean', caption: 'Allow Multiple', defaultValue: 'false' },
                ],
                events: [
                    { key: 'onUpload', caption: 'On Upload', description: 'Triggered when file is selected' },
                    { key: 'onError', caption: 'On Error', description: 'Triggered on validation error' },
                ],
            },
            {
                id: 'tabs',
                displayName: 'Tabs',
                description: 'Tab navigation component',
                properties: [
                    { key: 'defaultTab', type: 'integer', caption: 'Default Tab Index', defaultValue: '0' },
                    {
                        key: 'orientation',
                        type: 'enumeration',
                        caption: 'Orientation',
                        enumValues: [
                            { key: 'horizontal', caption: 'Horizontal' },
                            { key: 'vertical', caption: 'Vertical' },
                        ],
                    },
                    { key: 'showIcons', type: 'boolean', caption: 'Show Icons', defaultValue: 'false' },
                ],
                events: [{ key: 'onTabChange', caption: 'On Tab Change' }],
            },
        ];
    }
    /**
     * Generate a widget from configuration
     */
    async generate(config, options) {
        const errors = [];
        const warnings = [];
        try {
            const outputPath = path.join(options.workFolder, config.name.toLowerCase());
            // Create the widget config file
            const configPath = path.join(options.workFolder, `${config.name}-config.json`);
            fs.writeFileSync(configPath, JSON.stringify({
                widget: {
                    name: config.name,
                    displayName: config.displayName || config.name,
                    description: config.description || `A custom ${config.name} widget`,
                    category: config.category || 'Display',
                    company: config.company || 'mycompany',
                },
                properties: config.properties,
                events: config.events,
                mendixProjectPath: config.mendixProjectPath,
            }, null, 2));
            // Check if we can use the Node.js generator
            const nodeGeneratorPath = path.join(this.generatorPath, 'index.js');
            const psGeneratorPath = path.join(path.dirname(this.generatorPath), 'Generate-WidgetFromConfig.ps1');
            if (fs.existsSync(nodeGeneratorPath)) {
                // Use Node.js CLI
                return await this.runNodeGenerator(configPath, outputPath, options, config);
            }
            else if (fs.existsSync(psGeneratorPath)) {
                // Fall back to PowerShell
                return await this.runPowerShellGenerator(configPath, outputPath, options, config);
            }
            else {
                // Inline generation
                return await this.runInlineGeneration(config, outputPath, options);
            }
        }
        catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings,
            };
        }
    }
    /**
     * Run the Node.js CLI generator
     */
    async runNodeGenerator(configPath, outputPath, options, config) {
        return new Promise((resolve) => {
            const args = [
                path.join(this.generatorPath, 'index.js'),
                '--config',
                configPath,
                '--output',
                options.workFolder,
            ];
            if (options.install === false) {
                args.push('--no-install');
            }
            if (options.build === false) {
                args.push('--no-build');
            }
            if (config.mendixProjectPath) {
                args.push('--mendix', config.mendixProjectPath);
            }
            const child = (0, child_process_1.spawn)('node', args, {
                cwd: path.dirname(this.generatorPath),
                shell: true,
            });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    // Find the .mpk file
                    const mpkPath = this.findMpk(outputPath);
                    resolve({
                        success: true,
                        outputPath,
                        mpkPath,
                        deployedTo: config.mendixProjectPath
                            ? path.join(config.mendixProjectPath, 'widgets')
                            : undefined,
                        errors: [],
                        warnings: stderr ? [stderr] : [],
                    });
                }
                else {
                    resolve({
                        success: false,
                        outputPath,
                        errors: [stderr || stdout || `Process exited with code ${code}`],
                        warnings: [],
                    });
                }
            });
        });
    }
    /**
     * Run the PowerShell generator
     */
    async runPowerShellGenerator(configPath, outputPath, options, config) {
        return new Promise((resolve) => {
            const psPath = path.join(path.dirname(this.generatorPath), 'Generate-WidgetFromConfig.ps1');
            const args = [
                '-ExecutionPolicy',
                'Bypass',
                '-File',
                psPath,
                '-ConfigPath',
                configPath,
                '-OutputPath',
                options.workFolder,
            ];
            if (options.install === false) {
                args.push('-NoInstall');
            }
            if (options.build === false) {
                args.push('-NoBuild');
            }
            const child = (0, child_process_1.spawn)('powershell', args, { shell: true });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    const mpkPath = this.findMpk(outputPath);
                    resolve({
                        success: true,
                        outputPath,
                        mpkPath,
                        errors: [],
                        warnings: [],
                    });
                }
                else {
                    resolve({
                        success: false,
                        errors: [stderr || stdout],
                        warnings: [],
                    });
                }
            });
        });
    }
    /**
     * Inline widget generation (fallback)
     */
    async runInlineGeneration(config, outputPath, options) {
        try {
            // Create directory structure - ALL required folders
            fs.mkdirSync(outputPath, { recursive: true });
            fs.mkdirSync(path.join(outputPath, 'src'), { recursive: true });
            fs.mkdirSync(path.join(outputPath, 'src', 'components'), { recursive: true });
            fs.mkdirSync(path.join(outputPath, 'src', 'ui'), { recursive: true });
            fs.mkdirSync(path.join(outputPath, 'typings'), { recursive: true });
            // Generate widget files inline - IN CORRECT ORDER
            this.generatePackageJson(outputPath, config);
            this.generateTsConfig(outputPath);
            this.generatePackageXml(outputPath, config); // CRITICAL: package.xml for MPK structure
            this.generateWidgetXml(outputPath, config); // Widget definition
            this.generateComponent(outputPath, config); // Main component
            this.generateDisplayComponent(outputPath, config); // Separate display component
            this.generatePreview(outputPath, config); // Editor preview
            this.generateEditorConfig(outputPath, config); // Structure Mode preview with SVG
            this.generateStyles(outputPath, config); // CSS
            this.generateDefaultIcon(outputPath, config); // Toolbox icon PNG
            // Install and build
            if (options.install !== false) {
                (0, child_process_1.execSync)('npm install', { cwd: outputPath, stdio: 'pipe' });
            }
            if (options.build !== false) {
                (0, child_process_1.execSync)('npm run build', { cwd: outputPath, stdio: 'pipe' });
            }
            const mpkPath = this.findMpk(outputPath);
            // Deploy if Mendix path provided
            let deployedTo;
            if (config.mendixProjectPath && mpkPath) {
                const widgetsFolder = path.join(config.mendixProjectPath, 'widgets');
                fs.mkdirSync(widgetsFolder, { recursive: true });
                fs.copyFileSync(mpkPath, path.join(widgetsFolder, path.basename(mpkPath)));
                deployedTo = widgetsFolder;
            }
            return {
                success: true,
                outputPath,
                mpkPath,
                deployedTo,
                errors: [],
                warnings: [],
            };
        }
        catch (error) {
            return {
                success: false,
                outputPath,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings: [],
            };
        }
    }
    /**
     * Find the generated .mpk file
     */
    findMpk(widgetPath) {
        const distPath = path.join(widgetPath, 'dist');
        if (!fs.existsSync(distPath))
            return undefined;
        const files = fs.readdirSync(distPath);
        const mpk = files.find((f) => f.endsWith('.mpk'));
        return mpk ? path.join(distPath, mpk) : undefined;
    }
    // File generation methods
    generateWidgetXml(dir, config) {
        const propsXml = config.properties
            .map((p) => {
            const required = p.required ? ' required="true"' : '';
            const defaultVal = p.defaultValue ? ` defaultValue="${p.defaultValue}"` : '';
            if (p.type === 'enumeration' && p.enumValues) {
                const enums = p.enumValues
                    .map((e) => `                <enumerationValue key="${e.key}">${e.caption}</enumerationValue>`)
                    .join('\n');
                return `            <property key="${p.key}" type="enumeration"${defaultVal}>
                <caption>${p.caption}</caption>
                <description>${p.description || ''}</description>
                <enumerationValues>
${enums}
                </enumerationValues>
            </property>`;
            }
            return `            <property key="${p.key}" type="${p.type}"${required}${defaultVal}>
                <caption>${p.caption}</caption>
                <description>${p.description || ''}</description>
            </property>`;
        })
            .join('\n');
        const eventsXml = config.events
            .map((e) => `            <property key="${e.key}" type="action">
                <caption>${e.caption}</caption>
                <description>${e.description || ''}</description>
            </property>`)
            .join('\n');
        // Category for toolbox organization
        const category = config.category || 'Custom Widgets';
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<widget id="${config.company || 'mycompany'}.${config.name.toLowerCase()}.${config.name}" 
        pluginWidget="true" needsEntityContext="false"
        supportedPlatform="Web" offlineCapable="true"
        xmlns="http://www.mendix.com/widget/1.0/" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../node_modules/mendix/custom_widget.xsd">
    <name>${config.displayName || config.name}</name>
    <description>${config.description || ''}</description>
    <studioProCategory>${category}</studioProCategory>
    <icon/>
    <properties>
        <propertyGroup caption="General">
${propsXml}
        </propertyGroup>
        <propertyGroup caption="Events">
${eventsXml}
        </propertyGroup>
        <propertyGroup caption="Common">
            <systemProperty key="Name" />
            <systemProperty key="Visibility" />
        </propertyGroup>
    </properties>
</widget>`;
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.xml`), xml);
    }
    generatePackageJson(dir, config) {
        // CRITICAL: Use the EXACT working pattern from PROVEN-WIDGET-PATTERN.md
        const widgetName = config.name;
        const pkg = {
            name: config.name.toLowerCase(),
            widgetName: widgetName, // REQUIRED for Mendix build
            version: '1.0.0',
            description: config.description || `A custom ${widgetName} widget`,
            author: config.author || '', // Author name from interview
            copyright: `© ${config.company || 'Company'} ${new Date().getFullYear()}. All rights reserved.`,
            license: 'Apache-2.0',
            // CRITICAL: Use simple packagePath like 'bluematrix' NOT 'com.bluematrix.widget'
            // This must match the folder structure that package.xml references
            packagePath: config.company?.toLowerCase() || 'mycompany',
            config: {
                projectPath: config.mendixProjectPath?.replace(/\\/g, '/') || '',
                mendixHost: 'http://localhost:8080',
                developmentPort: 3000,
            },
            scripts: {
                // CRITICAL: MPKOUTPUT env var defines output filename
                build: `cross-env MPKOUTPUT=${widgetName}.mpk pluggable-widgets-tools build:web`,
                dev: `cross-env MPKOUTPUT=${widgetName}.mpk pluggable-widgets-tools start:web`,
                release: `cross-env MPKOUTPUT=${widgetName}.mpk pluggable-widgets-tools release:web`,
                lint: 'pluggable-widgets-tools lint',
                'lint:fix': 'pluggable-widgets-tools lint:fix',
            },
            devDependencies: {
                '@mendix/pluggable-widgets-tools': '^11.3.0', // Mendix 11.x requires 11.3.0+
                'cross-env': '^7.0.3',
            },
            dependencies: {
                classnames: '^2.5.1',
            },
            // CRITICAL: React 18.2.0 overrides prevent duplicate React errors!
            overrides: {
                react: '18.2.0',
                'react-dom': '18.2.0',
                '@types/react': '~18.2.0',
                '@types/react-dom': '~18.2.0',
            },
        };
        fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
    }
    generateTsConfig(dir) {
        // CRITICAL: Use extends pattern, NOT custom settings!
        const tsconfig = {
            extends: '@mendix/pluggable-widgets-tools/configs/tsconfig.base',
            compilerOptions: {
                baseUrl: './',
            },
            include: ['./src', './typings'],
        };
        fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
    }
    generateComponent(dir, config) {
        // Generate proper Mendix props based on widget properties
        const propsImports = [];
        const propDefinitions = [];
        config.properties.forEach((p) => {
            if (p.type === 'attribute') {
                propsImports.push('EditableValue');
                propDefinitions.push(`    ${p.key}?: EditableValue<${p.key.includes('date') || p.key.includes('Date') ? 'Date' : 'string'}>;`);
            }
            else if (p.type === 'expression') {
                propsImports.push('DynamicValue');
                propDefinitions.push(`    ${p.key}?: DynamicValue<string>;`);
            }
            else if (p.type === 'action') {
                propsImports.push('ActionValue');
                propDefinitions.push(`    ${p.key}?: ActionValue;`);
            }
            else {
                propDefinitions.push(`    ${p.key}?: ${this.getTsType(p.type)};`);
            }
        });
        // Add events as ActionValue
        config.events.forEach((e) => {
            if (!propsImports.includes('ActionValue'))
                propsImports.push('ActionValue');
            propDefinitions.push(`    ${e.key}?: ActionValue;`);
        });
        // Remove duplicates
        const uniqueImports = [...new Set(propsImports)];
        // CRITICAL: Use NAMED export, proper imports, and import the display component
        const component = `/**
 * ${config.name} Pluggable Widget
 * ${config.description || ''}
 */
import { ReactElement, createElement, useCallback } from 'react';
${uniqueImports.length > 0 ? `import { ${uniqueImports.join(', ')} } from 'mendix';` : ''}
import { ${config.name}Display } from './components/${config.name}Display';
import './ui/${config.name}.css';

// Props interface - auto-generated from widget XML
export interface ${config.name}ContainerProps {
${propDefinitions.join('\n')}
    class: string;
    style?: React.CSSProperties;
    tabIndex?: number;
}

// IMPORTANT: Use NAMED export, not default export!
export function ${config.name}(props: ${config.name}ContainerProps): ReactElement {
    const { class: className, style${config.events.length > 0 ? ', ' + config.events.map((e) => e.key).join(', ') : ''} } = props;

${config.events
            .map((e) => `    const handle${e.key.replace(/^on/, '')} = useCallback(() => {
        if (${e.key}?.canExecute) {
            ${e.key}.execute();
        }
    }, [${e.key}]);`)
            .join('\n\n')}

    return (
        <${config.name}Display
            className={className}
            style={style}
${config.events
            .map((e) => `            on${e.key.replace(/^on/, '')}={${e.key}?.canExecute ? handle${e.key.replace(/^on/, '')} : undefined}`)
            .join('\n')}
        />
    );
}
`;
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.tsx`), component);
    }
    generatePreview(dir, config) {
        // Check if widget has any 'widgets' type properties (drop zones)
        const widgetProperties = config.properties.filter((p) => p.type === 'widgets');
        const hasDropZones = widgetProperties.length > 0;
        let preview;
        if (hasDropZones) {
            // Generate preview with proper drop zone support using JSX renderer pattern
            const dropZoneRenders = widgetProperties
                .map((p) => `
            {/* ${p.caption} drop zone */}
            {props.${p.key} && typeof props.${p.key} === 'object' && props.${p.key}.renderer && (
                <div className="widget-${config.name.toLowerCase()}-dropzone" style={{
                    minHeight: '50px',
                    padding: '12px',
                    margin: '8px 0',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '4px',
                    backgroundColor: '#fafafa'
                }}>
                    {(() => {
                        const Renderer = props.${p.key}.renderer;
                        return <Renderer><div style={{ textAlign: 'center', color: '#9ca3af' }}>Drop widgets here</div></Renderer>;
                    })()}
                </div>
            )}`)
                .join('\n');
            preview = `/**
 * ${config.name} Editor Preview
 * Provides drop zones for widget containers in Mendix Studio Pro
 */
import { ReactElement, createElement } from 'react';
import { ${config.name}PreviewProps } from '../typings/${config.name}Props';

export function preview(props: ${config.name}PreviewProps): ReactElement {
    return (
        <div className="widget-${config.name.toLowerCase()}-preview" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            minHeight: '100px',
            border: '1px solid #e5e7eb',
            padding: '12px'
        }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>
                ${config.displayName || config.name}
            </div>
${dropZoneRenders}
        </div>
    );
}

export function getPreviewCss(): string {
    return require('./ui/${config.name}.css');
}
`;
        }
        else {
            // Simple preview for non-container widgets
            preview = `import { ReactElement, createElement } from 'react';
import { ${config.name}PreviewProps } from '../typings/${config.name}Props';

export function preview(props: ${config.name}PreviewProps): ReactElement {
    return (
        <div className="widget-${config.name.toLowerCase()}-preview" style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '12px',
            border: '1px solid #e5e7eb'
        }}>
            <span style={{ fontSize: '14px', color: '#4a4a68' }}>${config.displayName || config.name}</span>
        </div>
    );
}
`;
        }
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.editorPreview.tsx`), preview);
    }
    /**
     * Generate editorConfig.js for Structure Mode preview with raw SVG icon
     * CRITICAL: Uses raw SVG string, NOT base64 PNG!
     */
    generateEditorConfig(dir, config) {
        // Default SVG icon - simple widget icon in Mendix blue
        const defaultSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#264AE5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>';
        const editorConfig = `/**
 * Editor Configuration for ${config.name}
 * Provides Structure Mode preview in Mendix Studio Pro
 * 
 * IMPORTANT: The Image type's 'document' property requires RAW SVG XML strings!
 * Do NOT use base64 PNG - it will show red error arrows.
 */

export function getProperties(_values, defaultProperties) {
    return defaultProperties;
}

export function getPreview(_values, isDarkMode) {
    // Raw SVG icon - NOT base64!
    const iconSvg = '${defaultSvg}';
    
    return {
        type: "RowLayout",
        columnSize: "grow",
        backgroundColor: isDarkMode ? "#3B3B3B" : "#F8F8F8",
        borders: true,
        borderRadius: 4,
        children: [
            {
                type: "Container",
                padding: 4,
                children: [{
                    type: "Image",
                    document: iconSvg,
                    width: 24,
                    height: 24
                }]
            },
            {
                type: "Container",
                padding: 8,
                grow: 1,
                children: [{
                    type: "Text",
                    content: "${config.displayName || config.name}",
                    fontColor: isDarkMode ? "#FFFFFF" : "#333333",
                    bold: true
                }]
            }
        ]
    };
}
`;
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.editorConfig.js`), editorConfig);
    }
    generateStyles(dir, config) {
        fs.mkdirSync(path.join(dir, 'src', 'ui'), { recursive: true });
        const css = `.widget-${config.name.toLowerCase()} {
    /* Widget container styles */
    display: inline-flex;
    align-items: center;
}

.widget-${config.name.toLowerCase()}__content {
    /* Content area */
}
`;
        fs.writeFileSync(path.join(dir, 'src', 'ui', `${config.name}.css`), css);
    }
    /**
     * Generate package.xml - CRITICAL for MPK structure
     * DO NOT include moduleType attribute - it's invalid!
     * CRITICAL: file path must be FOLDER path matching widget ID, not .js file!
     */
    generatePackageXml(dir, config) {
        // The file path must reference the folder where the JS/MJS files are located
        // This matches the widget ID structure: {company}/{widgetname}
        const widgetFolderPath = `${(config.company || 'mycompany').toLowerCase()}/${config.name.toLowerCase()}`;
        const packageXml = `<?xml version="1.0" encoding="utf-8" ?>
<package xmlns="http://www.mendix.com/package/1.0/">
    <clientModule name="${config.name}" version="1.0.0" xmlns="http://www.mendix.com/clientModule/1.0/">
        <widgetFiles>
            <widgetFile path="${config.name}.xml" />
        </widgetFiles>
        <files>
            <file path="${widgetFolderPath}" />
        </files>
    </clientModule>
</package>`;
        fs.writeFileSync(path.join(dir, 'src', 'package.xml'), packageXml);
    }
    /**
     * Generate a separate display component (best practice)
     */
    generateDisplayComponent(dir, config) {
        const displayComponent = `/**
 * ${config.name}Display - Pure display component
 * Separates visual rendering from Mendix integration
 */
import { createElement, ReactElement } from 'react';
import classNames from 'classnames';

export interface ${config.name}DisplayProps {
    value?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export function ${config.name}Display(props: ${config.name}DisplayProps): ReactElement {
    const { value, className, style, onClick } = props;
    
    return (
        <div 
            className={classNames('widget-${config.name.toLowerCase()}', className)}
            style={style}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <span className="widget-${config.name.toLowerCase()}__content">
                {value || '${config.displayName || config.name}'}
            </span>
        </div>
    );
}
`;
        fs.writeFileSync(path.join(dir, 'src', 'components', `${config.name}Display.tsx`), displayComponent);
    }
    /**
     * Generate default toolbox icon PNG files
     * CRITICAL: Mendix toolbox requires PNG (64x64), NOT SVG!
     * Creates: .icon.png, .tile.png, .tile.dark.png
     */
    generateDefaultIcon(dir, config) {
        // Default 64x64 PNG icon (Mendix blue) - base64 encoded
        // This is a pre-rendered PNG of a simple widget icon
        const defaultIconPngBase64 = `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`;
        // Decode and write PNG files
        const iconBuffer = Buffer.from(defaultIconPngBase64, 'base64');
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.icon.png`), iconBuffer);
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.tile.png`), iconBuffer);
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.tile.dark.png`), iconBuffer);
        // Also write SVG for Structure Mode preview (optional)
        const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#264AE5" fill-opacity="0.1" stroke="#264AE5" stroke-width="2"/>
  <rect x="16" y="20" width="32" height="4" rx="2" fill="#264AE5"/>
  <rect x="16" y="30" width="24" height="4" rx="2" fill="#264AE5" fill-opacity="0.6"/>
  <rect x="16" y="40" width="28" height="4" rx="2" fill="#264AE5" fill-opacity="0.4"/>
</svg>`;
        fs.writeFileSync(path.join(dir, 'src', `${config.name}.icon.svg`), defaultSvg);
    }
    getTsType(propType) {
        switch (propType) {
            case 'string':
                return 'string';
            case 'integer':
            case 'decimal':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'expression':
                return 'string';
            case 'attribute':
                return 'EditableValue<any>';
            case 'action':
                return 'ActionValue';
            case 'enumeration':
                return 'string';
            default:
                return 'any';
        }
    }
}
exports.WidgetGeneratorBridge = WidgetGeneratorBridge;
//# sourceMappingURL=generatorBridge.js.map