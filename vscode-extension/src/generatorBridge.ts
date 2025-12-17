/**
 * Widget Generator Bridge
 *
 * Connects the VS Code extension to the CLI generator engine.
 * This is the execution layer - the AI brain decides, this executes.
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface WidgetProperty {
  key: string;
  type:
    | 'string'
    | 'integer'
    | 'boolean'
    | 'decimal'
    | 'expression'
    | 'object'
    | 'action'
    | 'attribute'
    | 'enumeration'
    | 'widgets'
    | 'datasource'
    | 'icon';
  caption: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
  enumValues?: { key: string; caption: string }[];
}

export interface WidgetEvent {
  key: string;
  caption: string;
  description?: string;
}

export interface WidgetConfig {
  name: string;
  displayName?: string;
  description?: string;
  category?: string;
  company?: string;
  author?: string;
  properties: WidgetProperty[];
  events: WidgetEvent[];
  mendixProjectPath?: string;
}

export interface WidgetTemplate {
  id: string;
  displayName: string;
  description: string;
  properties: WidgetProperty[];
  events: WidgetEvent[];
}

export interface GenerationResult {
  success: boolean;
  outputPath?: string;
  mpkPath?: string;
  deployedTo?: string;
  errors: string[];
  warnings: string[];
}

export class WidgetGeneratorBridge {
  private context: vscode.ExtensionContext;
  private generatorPath: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    // The generator is in the parent directory
    this.generatorPath = path.join(context.extensionPath, '..', 'cli');
  }

  /**
   * Get list of available templates
   */
  getAvailableTemplates(): WidgetTemplate[] {
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
  async generate(
    config: WidgetConfig,
    options: {
      workFolder: string;
      install?: boolean;
      build?: boolean;
    }
  ): Promise<GenerationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const outputPath = path.join(options.workFolder, config.name.toLowerCase());

      // Create the widget config file
      const configPath = path.join(options.workFolder, `${config.name}-config.json`);
      fs.writeFileSync(
        configPath,
        JSON.stringify(
          {
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
          },
          null,
          2
        )
      );

      // Check if we can use the Node.js generator
      const nodeGeneratorPath = path.join(this.generatorPath, 'index.js');
      const psGeneratorPath = path.join(
        path.dirname(this.generatorPath),
        'Generate-WidgetFromConfig.ps1'
      );

      if (fs.existsSync(nodeGeneratorPath)) {
        // Use Node.js CLI
        return await this.runNodeGenerator(configPath, outputPath, options, config);
      } else if (fs.existsSync(psGeneratorPath)) {
        // Fall back to PowerShell
        return await this.runPowerShellGenerator(configPath, outputPath, options, config);
      } else {
        // Inline generation
        return await this.runInlineGeneration(config, outputPath, options);
      }
    } catch (error) {
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
  private async runNodeGenerator(
    configPath: string,
    outputPath: string,
    options: { workFolder: string; install?: boolean; build?: boolean },
    config: WidgetConfig
  ): Promise<GenerationResult> {
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

      const child = spawn('node', args, {
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
        } else {
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
  private async runPowerShellGenerator(
    configPath: string,
    outputPath: string,
    options: { workFolder: string; install?: boolean; build?: boolean },
    config: WidgetConfig
  ): Promise<GenerationResult> {
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

      const child = spawn('powershell', args, { shell: true });

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
        } else {
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
  private async runInlineGeneration(
    config: WidgetConfig,
    outputPath: string,
    options: { workFolder: string; install?: boolean; build?: boolean }
  ): Promise<GenerationResult> {
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
        execSync('npm install', { cwd: outputPath, stdio: 'pipe' });
      }

      if (options.build !== false) {
        execSync('npm run build', { cwd: outputPath, stdio: 'pipe' });
      }

      const mpkPath = this.findMpk(outputPath);

      // Deploy if Mendix path provided
      let deployedTo: string | undefined;
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
    } catch (error) {
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
  private findMpk(widgetPath: string): string | undefined {
    const distPath = path.join(widgetPath, 'dist');
    if (!fs.existsSync(distPath)) return undefined;

    const files = fs.readdirSync(distPath);
    const mpk = files.find((f) => f.endsWith('.mpk'));
    return mpk ? path.join(distPath, mpk) : undefined;
  }

  // File generation methods

  private generateWidgetXml(dir: string, config: WidgetConfig): void {
    const propsXml = config.properties
      .map((p) => {
        const required = p.required ? ' required="true"' : '';
        const defaultVal = p.defaultValue ? ` defaultValue="${p.defaultValue}"` : '';

        if (p.type === 'enumeration' && p.enumValues) {
          const enums = p.enumValues
            .map(
              (e) =>
                `                <enumerationValue key="${e.key}">${e.caption}</enumerationValue>`
            )
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
      .map(
        (e) =>
          `            <property key="${e.key}" type="action">
                <caption>${e.caption}</caption>
                <description>${e.description || ''}</description>
            </property>`
      )
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

  private generatePackageJson(dir: string, config: WidgetConfig): void {
    // CRITICAL: Use the EXACT working pattern from PROVEN-WIDGET-PATTERN.md
    const widgetName = config.name;
    const pkg = {
      name: config.name.toLowerCase(),
      widgetName: widgetName, // REQUIRED for Mendix build
      version: '1.0.0',
      description: config.description || `A custom ${widgetName} widget`,
      author: config.author || '', // Author name from interview
      copyright: `© ${
        config.company || 'Company'
      } ${new Date().getFullYear()}. All rights reserved.`,
      license: 'Apache-2.0',
      packagePath: `com.${config.company || 'mycompany'}.widget`,
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
        '@mendix/pluggable-widgets-tools': '^10.21.2', // EXACT version that works
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

  private generateTsConfig(dir: string): void {
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

  private generateComponent(dir: string, config: WidgetConfig): void {
    // Generate proper Mendix props based on widget properties
    const propsImports: string[] = [];
    const propDefinitions: string[] = [];

    config.properties.forEach((p) => {
      if (p.type === 'attribute') {
        propsImports.push('EditableValue');
        propDefinitions.push(
          `    ${p.key}?: EditableValue<${
            p.key.includes('date') || p.key.includes('Date') ? 'Date' : 'string'
          }>;`
        );
      } else if (p.type === 'expression') {
        propsImports.push('DynamicValue');
        propDefinitions.push(`    ${p.key}?: DynamicValue<string>;`);
      } else if (p.type === 'action') {
        propsImports.push('ActionValue');
        propDefinitions.push(`    ${p.key}?: ActionValue;`);
      } else {
        propDefinitions.push(`    ${p.key}?: ${this.getTsType(p.type)};`);
      }
    });

    // Add events as ActionValue
    config.events.forEach((e) => {
      if (!propsImports.includes('ActionValue')) propsImports.push('ActionValue');
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
    const { class: className, style${
      config.events.length > 0 ? ', ' + config.events.map((e) => e.key).join(', ') : ''
    } } = props;

${config.events
  .map(
    (e) => `    const handle${e.key.replace(/^on/, '')} = useCallback(() => {
        if (${e.key}?.canExecute) {
            ${e.key}.execute();
        }
    }, [${e.key}]);`
  )
  .join('\n\n')}

    return (
        <${config.name}Display
            className={className}
            style={style}
${config.events
  .map(
    (e) =>
      `            on${e.key.replace(/^on/, '')}={${e.key}?.canExecute ? handle${e.key.replace(
        /^on/,
        ''
      )} : undefined}`
  )
  .join('\n')}
        />
    );
}
`;

    fs.writeFileSync(path.join(dir, 'src', `${config.name}.tsx`), component);
  }

  private generatePreview(dir: string, config: WidgetConfig): void {
    const preview = `import { ReactElement, createElement } from 'react';
import { ${config.name}Props } from './${config.name}';

export function preview(props: ${config.name}Props): ReactElement {
    return (
        <div className="widget-${config.name.toLowerCase()}-preview">
            ${config.displayName || config.name} Preview
        </div>
    );
}
`;

    fs.writeFileSync(path.join(dir, 'src', `${config.name}.editorPreview.tsx`), preview);
  }

  /**
   * Generate editorConfig.js for Structure Mode preview with raw SVG icon
   * CRITICAL: Uses raw SVG string, NOT base64 PNG!
   */
  private generateEditorConfig(dir: string, config: WidgetConfig): void {
    // Default SVG icon - simple widget icon in Mendix blue
    const defaultSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#264AE5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>';

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

  private generateStyles(dir: string, config: WidgetConfig): void {
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
   */
  private generatePackageXml(dir: string, config: WidgetConfig): void {
    // NO moduleType attribute - this causes "moduleType is not declared" error!
    const packageXml = `<?xml version="1.0" encoding="utf-8" ?>
<package xmlns="http://www.mendix.com/package/1.0/">
    <clientModule name="${config.name}" version="1.0.0" xmlns="http://www.mendix.com/clientModule/1.0/">
        <widgetFiles>
            <widgetFile path="${config.name}.xml" />
        </widgetFiles>
        <files>
            <file path="${config.name}.js" />
        </files>
    </clientModule>
</package>`;

    fs.writeFileSync(path.join(dir, 'src', 'package.xml'), packageXml);
  }

  /**
   * Generate a separate display component (best practice)
   */
  private generateDisplayComponent(dir: string, config: WidgetConfig): void {
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

    fs.writeFileSync(
      path.join(dir, 'src', 'components', `${config.name}Display.tsx`),
      displayComponent
    );
  }

  /**
   * Generate default toolbox icon PNG
   * Creates a simple 64x64 Mendix-blue icon
   */
  private generateDefaultIcon(dir: string, config: WidgetConfig): void {
    // Default SVG icon that works well for toolbox
    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#264AE5" fill-opacity="0.1" stroke="#264AE5" stroke-width="2"/>
  <rect x="16" y="20" width="32" height="4" rx="2" fill="#264AE5"/>
  <rect x="16" y="30" width="24" height="4" rx="2" fill="#264AE5" fill-opacity="0.6"/>
  <rect x="16" y="40" width="28" height="4" rx="2" fill="#264AE5" fill-opacity="0.4"/>
</svg>`;

    // Write SVG file (can be converted to PNG by user, or used as-is)
    fs.writeFileSync(path.join(dir, 'src', `${config.name}.icon.svg`), defaultSvg);

    // Also create the tile version (larger for toolbox)
    fs.writeFileSync(path.join(dir, 'src', `${config.name}.tile.svg`), defaultSvg);

    // Note: For PNG, the user needs to convert or provide their own
    // The build process will use the PNG if available, SVG otherwise
  }

  private getTsType(propType: string): string {
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
