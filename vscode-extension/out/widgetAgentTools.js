"use strict";
/**
 * Mendix Custom Widget Agent - Smart Tools
 *
 * The INTELLIGENT widget creation and conversion agent.
 * Uses smart interviewing to gather requirements, NOT dumb click-and-move.
 *
 * Two main flows:
 * 1. CREATE - Build a widget from scratch via intelligent interview
 * 2. CONVERT - Transform TSX/React components into Mendix pluggable widgets
 *
 * Both flows use:
 * - Smart question-by-question interviewing
 * - Deduction of answers where possible
 * - SVG-first icon approach (single file → toolbox + preview)
 * - Beast Mode research for patterns
 * - Self-learning nucleus
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
exports.GetStatusTool = exports.ShowPatternsTool = exports.DeployWidgetTool = exports.ListTemplatesTool = exports.ResearchWidgetTool = exports.FixWidgetTool = exports.ConvertTsxTool = exports.CreateWidgetTool = void 0;
exports.registerAllTools = registerAllTools;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const beastModeResearch_1 = require("./beastModeResearch");
const buildLoop_1 = require("./buildLoop");
const dynamicPatterns_1 = require("./dynamicPatterns");
const knowledgeSharing_1 = require("./knowledgeSharing");
const selfUpdate_1 = require("./selfUpdate");
// ============================================================================
// CRITICAL PATTERNS - Learned from testing, DO NOT CHANGE!
// ============================================================================
const PROVEN_PATTERNS = {
    // Toolbox categories available in Studio Pro
    TOOLBOX_CATEGORIES: ['Display', 'Input', 'Data', 'Container', 'Visualization', 'Custom Widgets'],
    // Package.json template - EXACT pattern that works with Mendix 11.5.0
    PACKAGE_JSON: {
        devDependencies: {
            '@mendix/pluggable-widgets-tools': '^11.3.0', // Mendix 11.x requires 11.3.0+
            'cross-env': '^7.0.3',
        },
        dependencies: {
            classnames: '^2.5.1',
        },
        // CRITICAL: React 18.2.0 overrides prevent duplicate React errors
        overrides: {
            react: '18.2.0',
            'react-dom': '18.2.0',
            '@types/react': '~18.2.0',
            '@types/react-dom': '~18.2.0',
        },
    },
    // Widget XML ID format - MUST follow this pattern
    WIDGET_ID_FORMAT: (company, name) => `${company}.widget.${name.toLowerCase()}.${name}`,
    // Package.xml template - NO moduleType attribute!
    PACKAGE_XML: (widgetName) => `<?xml version="1.0" encoding="utf-8" ?>
<package xmlns="http://www.mendix.com/package/1.0/">
    <clientModule name="${widgetName}" version="1.0.0" xmlns="http://www.mendix.com/clientModule/1.0/">
        <widgetFiles>
            <widgetFile path="${widgetName}.xml" />
        </widgetFiles>
        <files>
            <file path="${widgetName}.js" />
        </files>
    </clientModule>
</package>`,
    // Icon rules - CRITICAL for both toolbox and Structure Mode preview
    ICON_RULES: {
        // Toolbox icon: PNG file in src/ folder
        toolbox: {
            format: 'PNG',
            sizes: ['64x64 (required)', '128x128 (optional for retina)'],
            naming: '{WidgetName}.tile.png',
            location: 'src/',
        },
        // Structure Mode preview: Raw SVG in editorConfig.js
        preview: {
            format: 'RAW SVG XML string',
            note: 'NOT base64! The Image document property expects raw SVG XML.',
            example: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">...</svg>',
        },
    },
    // Default SVG icon (Mendix blue, simple widget shape)
    DEFAULT_SVG: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="8" width="48" height="48" rx="8" fill="#264AE5" fill-opacity="0.1" stroke="#264AE5" stroke-width="2"/><rect x="16" y="20" width="32" height="4" rx="2" fill="#264AE5"/><rect x="16" y="30" width="24" height="4" rx="2" fill="#264AE5" fill-opacity="0.6"/><rect x="16" y="40" width="28" height="4" rx="2" fill="#264AE5" fill-opacity="0.4"/></svg>',
    // Common errors and how to prevent them
    COMMON_ERRORS: {
        'moduleType attribute': "Do NOT include moduleType in package.xml - it's not a valid attribute",
        'base64Binary icon': "The icon element in widget XML expects base64 PNG. Structure Mode preview expects raw SVG in editorConfig.js. Don't mix them up!",
        'Widget not found': 'Widget ID must match: company.widget.name.Name format in XML',
        'React version mismatch': 'Always include React 18.2.0 overrides in package.json',
        'Cannot find module': 'Use extends in tsconfig.json, not custom moduleResolution',
    },
};
class CreateWidgetTool {
    context;
    pathValidator;
    generatorBridge;
    buildLoop;
    dynamicPatterns;
    constructor(context, pathValidator, generatorBridge, buildLoop, dynamicPatterns) {
        this.context = context;
        this.pathValidator = pathValidator;
        this.generatorBridge = generatorBridge;
        this.buildLoop = buildLoop;
        this.dynamicPatterns = dynamicPatterns;
    }
    async prepareInvocation(options, _token) {
        return {
            invocationMessage: '🤖 Mendix Widget Agent ready to help you create a custom widget...',
        };
    }
    async invoke(options, token) {
        const { description, answers } = options.input;
        // Load any saved configuration
        const config = vscode.workspace.getConfiguration('mendixWidget');
        const savedWorkFolder = config.get('defaultWorkFolder');
        const savedMendixProject = config.get('defaultMendixProject');
        // ========================================================================
        // STAGE 1: No description yet - Start the interview!
        // ========================================================================
        if (!description) {
            return this.startInterview();
        }
        // ========================================================================
        // STAGE 2: Have description, analyze and ask follow-up questions
        // ========================================================================
        const requirements = await this.analyzeDescription(description);
        // Apply any answers provided by user
        if (answers) {
            if (answers.widgetName)
                requirements.widgetName = answers.widgetName;
            if (answers.company) {
                requirements.company = answers.company;
                // Save for future use
                await config.update('defaultCompany', answers.company, vscode.ConfigurationTarget.Global);
            }
            if (answers.author) {
                requirements.author = answers.author;
                // Save for future use
                await config.update('defaultAuthor', answers.author, vscode.ConfigurationTarget.Global);
            }
            if (answers.workFolder) {
                requirements.workFolder = answers.workFolder;
                // Save for future use
                await config.update('defaultWorkFolder', answers.workFolder, vscode.ConfigurationTarget.Global);
            }
            if (answers.mendixProject) {
                // Handle skip/none responses
                if (answers.mendixProject.toLowerCase() === 'skip' ||
                    answers.mendixProject.toLowerCase() === 'none') {
                    requirements.mendixProject = undefined;
                }
                else {
                    requirements.mendixProject = answers.mendixProject;
                    // Save for future use
                    await config.update('defaultMendixProject', answers.mendixProject, vscode.ConfigurationTarget.Global);
                }
            }
            if (answers.toolboxCategory)
                requirements.toolboxCategory = answers.toolboxCategory;
            if (answers.iconPath) {
                // Handle skip/default responses - store 'default' so checkMissingInfo knows user made a choice
                if (answers.iconPath.toLowerCase() === 'skip' ||
                    answers.iconPath.toLowerCase() === 'default' ||
                    answers.iconPath.toLowerCase() === 'none') {
                    requirements.iconPath = 'default'; // Sentinel: user chose to use default icon
                }
                else {
                    requirements.iconPath = answers.iconPath;
                }
            }
        }
        // ========================================================================
        // STAGE 3: Check what's still missing and ask
        // ========================================================================
        const missingInfo = this.checkMissingInfo(requirements);
        if (missingInfo.length > 0 && !answers?.confirm) {
            return this.askNextQuestion(requirements, missingInfo);
        }
        // ========================================================================
        // STAGE 4: Ready to build! Show summary and confirm
        // ========================================================================
        if (!answers?.confirm) {
            return this.showSummaryAndConfirm(requirements);
        }
        // ========================================================================
        // STAGE 5: Build the widget!
        // ========================================================================
        return await this.buildWidget(requirements, token);
    }
    startInterview() {
        const response = `# 🎨 Mendix Custom Widget Agent

**Let's create something awesome!**

Tell me what you want to build. Describe your widget in plain English - I'll figure out the technical details.

## 💡 Popular Widget Ideas:

### Display Widgets
- **Status Badge** - Show status with colors (red/yellow/green) based on an enum
- **Info Card** - Card with image, title, description, and actions
- **Progress Indicator** - Animated progress bar or circular gauge
- **Countdown Timer** - Count down to a target date/time
- **Rating Display** - Show star ratings (read-only or interactive)

### Input Widgets  
- **Smart Date Picker** - Date/time selection with calendar
- **Range Slider** - Select a value or range with a slider
- **File Upload** - Drag-and-drop file uploader with preview
- **Search Box** - Autocomplete search with suggestions
- **Toggle Switch** - On/off switch with labels

### Data Widgets
- **Data Grid** - Sortable, filterable table with actions
- **Tree View** - Hierarchical data display
- **Kanban Board** - Drag-and-drop cards in columns
- **Timeline** - Chronological event display

### Container Widgets
- **Collapsible Section** - Expandable/collapsible content area
- **Tab Container** - Organize content in tabs
- **Modal Dialog** - Pop-up dialog with content
- **Wizard Steps** - Multi-step form navigation

---

**What would you like to create?** 

*Be specific! Example: "A status badge that shows red for Critical, yellow for Warning, and green for OK based on a Status enum"*

💡 *The more details you give, the smarter I can be!*`;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
    async analyzeDescription(description) {
        // Load saved preferences
        const config = vscode.workspace.getConfiguration('mendixWidget');
        const savedCompany = config.get('defaultCompany');
        const savedAuthor = config.get('defaultAuthor');
        const savedWorkFolder = config.get('defaultWorkFolder');
        const savedMendixProject = config.get('defaultMendixProject');
        const requirements = {
            description,
            company: savedCompany || undefined, // Don't default, ask user
            author: savedAuthor || undefined, // Don't default, ask user
            workFolder: savedWorkFolder || undefined,
            mendixProject: savedMendixProject || undefined,
            toolboxCategory: undefined, // Will be set based on description analysis
            properties: [],
            events: [],
        };
        // Smart name generation from description
        const nameWords = description
            .toLowerCase()
            .replace(/[^a-z\s]/g, '')
            .split(/\s+/)
            .filter((w) => ![
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
            'widget',
            'component',
        ].includes(w))
            .slice(0, 3);
        requirements.widgetName = nameWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        requirements.displayName = requirements.widgetName.replace(/([A-Z])/g, ' $1').trim();
        // Auto-generate a good description for the widget XML
        requirements.description = `A custom ${requirements.displayName?.toLowerCase()} widget for Mendix applications. ${description}`;
        // Analyze for common patterns and deduce properties
        const lowerDesc = description.toLowerCase();
        // =======================================================================
        // SMART PATTERN DETECTION - Infer properties, events, and category
        // =======================================================================
        // Status/Badge patterns - very common in business apps
        if (lowerDesc.includes('status') ||
            lowerDesc.includes('badge') ||
            lowerDesc.includes('indicator')) {
            requirements.properties?.push({
                key: 'statusAttribute',
                type: 'attribute',
                caption: 'Status Attribute',
                description: 'The attribute that determines the status display',
            });
            requirements.properties?.push({
                key: 'colorMapping',
                type: 'object',
                caption: 'Color Mapping',
                description: 'Map status values to colors',
            });
            requirements.toolboxCategory = 'Display';
        }
        // Click/Action patterns - most widgets need some interactivity
        if (lowerDesc.includes('click') ||
            lowerDesc.includes('button') ||
            lowerDesc.includes('action') ||
            lowerDesc.includes('tap') ||
            lowerDesc.includes('press')) {
            requirements.events?.push({
                key: 'onClick',
                caption: 'On Click',
                description: 'Action to perform when clicked',
            });
        }
        // Image patterns
        if (lowerDesc.includes('image') ||
            lowerDesc.includes('picture') ||
            lowerDesc.includes('photo') ||
            lowerDesc.includes('avatar') ||
            lowerDesc.includes('thumbnail')) {
            requirements.properties?.push({
                key: 'imageUrl',
                type: 'expression',
                caption: 'Image URL',
                description: 'URL or path to the image',
            });
            requirements.properties?.push({
                key: 'altText',
                type: 'expression',
                caption: 'Alt Text',
                description: 'Alternative text for accessibility',
            });
        }
        // Text/Content patterns
        if (lowerDesc.includes('text') ||
            lowerDesc.includes('title') ||
            lowerDesc.includes('label') ||
            lowerDesc.includes('content') ||
            lowerDesc.includes('heading') ||
            lowerDesc.includes('caption')) {
            requirements.properties?.push({
                key: 'content',
                type: 'expression',
                caption: 'Content',
                description: 'Text content to display',
            });
        }
        // Color patterns
        if (lowerDesc.includes('color') ||
            lowerDesc.includes('colour') ||
            lowerDesc.includes('theme')) {
            requirements.properties?.push({
                key: 'primaryColor',
                type: 'string',
                caption: 'Primary Color',
                description: 'Primary color value (hex, rgb, or CSS variable)',
            });
        }
        // Tooltip patterns
        if (lowerDesc.includes('tooltip') ||
            lowerDesc.includes('hover') ||
            lowerDesc.includes('help') ||
            lowerDesc.includes('hint')) {
            requirements.properties?.push({
                key: 'tooltipText',
                type: 'expression',
                caption: 'Tooltip Text',
                description: 'Text to show on hover',
            });
        }
        // Date/Time patterns
        if (lowerDesc.includes('date') ||
            lowerDesc.includes('time') ||
            lowerDesc.includes('calendar') ||
            lowerDesc.includes('schedule') ||
            lowerDesc.includes('picker')) {
            requirements.properties?.push({
                key: 'dateAttribute',
                type: 'attribute',
                caption: 'Date Attribute',
                description: 'Attribute to store the selected date/time',
            });
            requirements.events?.push({
                key: 'onChange',
                caption: 'On Change',
                description: 'Triggered when the date/time changes',
            });
            requirements.toolboxCategory = 'Input';
        }
        // Progress/Percentage patterns
        if (lowerDesc.includes('progress') ||
            lowerDesc.includes('percent') ||
            lowerDesc.includes('gauge') ||
            lowerDesc.includes('meter')) {
            requirements.properties?.push({
                key: 'value',
                type: 'expression',
                caption: 'Value',
                description: 'Current progress value (0-100)',
            });
            requirements.properties?.push({
                key: 'maxValue',
                type: 'expression',
                caption: 'Max Value',
                description: 'Maximum value (default 100)',
            });
            requirements.properties?.push({
                key: 'showLabel',
                type: 'boolean',
                caption: 'Show Label',
                description: 'Display percentage label',
            });
            requirements.toolboxCategory = 'Display';
        }
        // Card/Container patterns
        if (lowerDesc.includes('card') ||
            lowerDesc.includes('panel') ||
            lowerDesc.includes('box') ||
            lowerDesc.includes('container')) {
            requirements.properties?.push({
                key: 'title',
                type: 'expression',
                caption: 'Title',
                description: 'Card/panel title',
            });
            requirements.properties?.push({
                key: 'content',
                type: 'widgets',
                caption: 'Content',
                description: 'Widgets to display inside',
            });
            requirements.toolboxCategory = 'Container';
        }
        // List/Grid patterns
        if (lowerDesc.includes('list') ||
            lowerDesc.includes('grid') ||
            lowerDesc.includes('table') ||
            lowerDesc.includes('data')) {
            requirements.properties?.push({
                key: 'dataSource',
                type: 'datasource',
                caption: 'Data Source',
                description: 'The data to display',
            });
            requirements.properties?.push({
                key: 'itemTemplate',
                type: 'widgets',
                caption: 'Item Template',
                description: 'Widget template for each item',
            });
            requirements.toolboxCategory = 'Data';
        }
        // Rating/Stars patterns
        if (lowerDesc.includes('rating') ||
            lowerDesc.includes('star') ||
            lowerDesc.includes('review') ||
            lowerDesc.includes('score')) {
            requirements.properties?.push({
                key: 'ratingAttribute',
                type: 'attribute',
                caption: 'Rating Attribute',
                description: 'Attribute to store the rating value',
            });
            requirements.properties?.push({
                key: 'maxRating',
                type: 'integer',
                caption: 'Max Rating',
                description: 'Maximum rating value (default 5)',
            });
            requirements.properties?.push({
                key: 'readonly',
                type: 'boolean',
                caption: 'Read Only',
                description: 'If true, rating cannot be changed',
            });
            requirements.events?.push({
                key: 'onRate',
                caption: 'On Rate',
                description: 'Triggered when rating changes',
            });
            requirements.toolboxCategory = 'Input';
        }
        // Modal/Dialog patterns
        if (lowerDesc.includes('modal') ||
            lowerDesc.includes('dialog') ||
            lowerDesc.includes('popup') ||
            lowerDesc.includes('overlay')) {
            requirements.properties?.push({
                key: 'isOpen',
                type: 'attribute',
                caption: 'Is Open',
                description: 'Boolean attribute controlling visibility',
            });
            requirements.properties?.push({
                key: 'modalContent',
                type: 'widgets',
                caption: 'Modal Content',
                description: 'Widgets to display in the modal',
            });
            requirements.events?.push({
                key: 'onClose',
                caption: 'On Close',
                description: 'Triggered when modal is closed',
            });
            requirements.toolboxCategory = 'Container';
        }
        // Search/Filter patterns
        if (lowerDesc.includes('search') ||
            lowerDesc.includes('filter') ||
            lowerDesc.includes('find') ||
            lowerDesc.includes('autocomplete')) {
            requirements.properties?.push({
                key: 'searchAttribute',
                type: 'attribute',
                caption: 'Search Attribute',
                description: 'Attribute to store search text',
            });
            requirements.properties?.push({
                key: 'placeholder',
                type: 'expression',
                caption: 'Placeholder',
                description: 'Placeholder text when empty',
            });
            requirements.events?.push({
                key: 'onSearch',
                caption: 'On Search',
                description: 'Triggered when search is submitted',
            });
            requirements.toolboxCategory = 'Input';
        }
        // Upload/File patterns
        if (lowerDesc.includes('upload') ||
            lowerDesc.includes('file') ||
            lowerDesc.includes('attachment') ||
            lowerDesc.includes('drag')) {
            requirements.properties?.push({
                key: 'acceptedTypes',
                type: 'string',
                caption: 'Accepted File Types',
                description: 'Comma-separated file extensions (e.g., .pdf,.docx)',
            });
            requirements.properties?.push({
                key: 'maxSize',
                type: 'integer',
                caption: 'Max File Size (MB)',
                description: 'Maximum file size in megabytes',
            });
            requirements.events?.push({
                key: 'onUpload',
                caption: 'On Upload',
                description: 'Triggered when file is uploaded',
            });
            requirements.toolboxCategory = 'Input';
        }
        // Chart/Visualization patterns
        if (lowerDesc.includes('chart') ||
            lowerDesc.includes('graph') ||
            lowerDesc.includes('pie') ||
            lowerDesc.includes('bar') ||
            lowerDesc.includes('line')) {
            requirements.properties?.push({
                key: 'dataSource',
                type: 'datasource',
                caption: 'Data Source',
                description: 'Data to visualize',
            });
            requirements.properties?.push({
                key: 'labelAttribute',
                type: 'attribute',
                caption: 'Label Attribute',
                description: 'Attribute for chart labels',
            });
            requirements.properties?.push({
                key: 'valueAttribute',
                type: 'attribute',
                caption: 'Value Attribute',
                description: 'Attribute for chart values',
            });
            requirements.toolboxCategory = 'Visualization';
        }
        // Tab/Accordion patterns
        if (lowerDesc.includes('tab') ||
            lowerDesc.includes('accordion') ||
            lowerDesc.includes('collapse') ||
            lowerDesc.includes('expand')) {
            requirements.properties?.push({
                key: 'activeTab',
                type: 'attribute',
                caption: 'Active Tab',
                description: 'Index or ID of the active tab',
            });
            requirements.events?.push({
                key: 'onTabChange',
                caption: 'On Tab Change',
                description: 'Triggered when active tab changes',
            });
            requirements.toolboxCategory = 'Container';
        }
        // Timer/Countdown patterns
        if (lowerDesc.includes('timer') ||
            lowerDesc.includes('countdown') ||
            lowerDesc.includes('stopwatch') ||
            lowerDesc.includes('clock')) {
            requirements.properties?.push({
                key: 'targetDateTime',
                type: 'attribute',
                caption: 'Target Date/Time',
                description: 'Date/time to count down to',
            });
            requirements.properties?.push({
                key: 'format',
                type: 'enumeration',
                caption: 'Display Format',
                description: 'How to display the time (days/hours/minutes)',
            });
            requirements.events?.push({
                key: 'onComplete',
                caption: 'On Complete',
                description: 'Triggered when countdown reaches zero',
            });
            requirements.toolboxCategory = 'Display';
        }
        // Icon/Emoji patterns
        if (lowerDesc.includes('icon') || lowerDesc.includes('emoji') || lowerDesc.includes('symbol')) {
            requirements.properties?.push({
                key: 'iconName',
                type: 'icon',
                caption: 'Icon',
                description: 'Icon to display',
            });
            requirements.properties?.push({
                key: 'iconSize',
                type: 'enumeration',
                caption: 'Icon Size',
                description: 'Size of the icon (small, medium, large)',
            });
            requirements.toolboxCategory = 'Display';
        }
        // Default toolbox category if not set
        if (!requirements.toolboxCategory) {
            requirements.toolboxCategory = 'Display';
        }
        // Always add common styling properties
        // CRITICAL: 'class' is RESERVED by Mendix - use 'styleClass' instead!
        requirements.properties?.push({
            key: 'styleClass',
            type: 'string',
            caption: 'Style Class',
            description: 'Additional CSS classes to apply to this widget',
        });
        return requirements;
    }
    /**
     * Check what required information is still missing
     * The order here determines the order questions are asked!
     */
    checkMissingInfo(requirements) {
        const missing = [];
        // REQUIRED fields - must ask in this order
        if (!requirements.company)
            missing.push('company');
        if (!requirements.author)
            missing.push('author');
        if (!requirements.workFolder)
            missing.push('workFolder');
        if (!requirements.mendixProject)
            missing.push('mendixProject');
        if (!requirements.toolboxCategory)
            missing.push('toolboxCategory');
        if (!requirements.iconPath)
            missing.push('iconPath');
        return missing;
    }
    /**
     * Ask the next question based on what's missing
     * Questions are asked ONE AT A TIME for clarity
     */
    askNextQuestion(requirements, missing) {
        const nextQuestion = missing[0]; // Get first missing item
        let response = `# 📋 Widget Configuration: ${requirements.displayName || requirements.widgetName}\n\n`;
        response += `*${requirements.description}*\n\n`;
        // Show what we've collected so far
        response += `## Current Settings\n`;
        response += `| Setting | Value |\n`;
        response += `|---------|-------|\n`;
        response += `| Widget Name | ${requirements.widgetName || '❓'} |\n`;
        response += `| Company | ${requirements.company || '❓'} |\n`;
        response += `| Author | ${requirements.author || '❓'} |\n`;
        response += `| Work Folder | ${requirements.workFolder || '❓'} |\n`;
        response += `| Mendix Project | ${requirements.mendixProject || '❓ (optional)'} |\n`;
        response += `| Toolbox Category | ${requirements.toolboxCategory || '❓'} |\n`;
        response += `| Icon | ${requirements.iconPath === 'default' ? '📦 Default (will generate)' : requirements.iconPath || '❓'} |\n\n`;
        if (requirements.properties && requirements.properties.length > 0) {
            response += `**Properties detected:** ${requirements.properties
                .map((p) => p.caption)
                .join(', ')}\n`;
        }
        if (requirements.events && requirements.events.length > 0) {
            response += `**Events detected:** ${requirements.events.map((e) => e.caption).join(', ')}\n`;
        }
        response += `\n---\n\n`;
        // Ask specific question based on what's missing
        switch (nextQuestion) {
            case 'company':
                response += `## 🏢 Company Identifier\n\n`;
                response += `What company/organization identifier should I use?\n\n`;
                response += `This becomes part of the widget's unique ID (e.g., \`com.yourcompany.widgets\`).\n\n`;
                response += `**Examples:** \`blueprintmx\`, \`acme\`, \`mycompany\`\n\n`;
                response += `💡 *I'll remember this for future widgets.*\n`;
                break;
            case 'author':
                response += `## 👤 Author Name\n\n`;
                response += `Who should be credited as the widget author?\n\n`;
                response += `**Example:** \`Kelly Seale\`, \`Your Name\`\n\n`;
                response += `💡 *I'll remember this for future widgets.*\n`;
                break;
            case 'workFolder':
                response += `## 📁 Work Folder\n\n`;
                response += `Where should I create the widget source code?\n\n`;
                response += `Provide a folder path where I'll create a \`${requirements.widgetName?.toLowerCase()}\` subfolder.\n\n`;
                response += `**Example:** \`D:\\WidgetProjects\` or \`C:\\Dev\\MendixWidgets\`\n\n`;
                response += `💡 *I'll remember this for future widgets.*\n`;
                break;
            case 'mendixProject':
                response += `## 🚀 Mendix Project (for auto-deploy)\n\n`;
                response += `Which Mendix project should I deploy to after building?\n\n`;
                response += `Provide the path to your Mendix project folder (containing the \`.mpr\` file).\n\n`;
                response += `**Example:** \`D:\\Projects\\MyApp-main\`\n\n`;
                response += `*Type "skip" or "none" to skip auto-deployment.*\n\n`;
                response += `💡 *I'll remember this for future widgets.*\n`;
                break;
            case 'toolboxCategory':
                response += `## 📦 Toolbox Category\n\n`;
                response += `Where in Studio Pro's toolbox should this widget appear?\n\n`;
                response += `**Available categories:**\n`;
                PROVEN_PATTERNS.TOOLBOX_CATEGORIES.forEach((cat) => {
                    const desc = cat === 'Display'
                        ? '(badges, labels, indicators)'
                        : cat === 'Input'
                            ? '(text fields, pickers, selectors)'
                            : cat === 'Data'
                                ? '(grids, lists, data views)'
                                : cat === 'Container'
                                    ? '(layout, grouping)'
                                    : cat === 'Visualization'
                                        ? '(charts, graphs)'
                                        : '';
                    response += `- **${cat}** ${desc}\n`;
                });
                response += `\n💡 *Based on your description, I'd suggest: **${requirements.toolboxCategory || 'Display'}**\n`;
                break;
            case 'iconPath':
                response += `## 🎨 Widget Icon\n\n`;
                response += `Do you have an SVG icon file for this widget?\n\n`;
                response += `**Best approach:** Provide one SVG file (64×64) - I'll use it for:\n`;
                response += `1. **Toolbox icon** (converted to PNG)\n`;
                response += `2. **Structure Mode preview** (raw SVG in page editor)\n\n`;
                response += `**Provide path or respond:**\n`;
                response += `- Path to SVG: \`D:\\Icons\\my-widget.svg\`\n`;
                response += `- Type "default" to use a generic Mendix-style icon\n`;
                response += `- Type "skip" to handle icons later\n`;
                break;
        }
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
    async showSummaryAndConfirm(requirements) {
        let response = `# ✅ Ready to Build!\n\n`;
        response += `## Widget Configuration\n\n`;
        response += `| Setting | Value |\n`;
        response += `|---------|-------|\n`;
        response += `| **Name** | ${requirements.widgetName} |\n`;
        response += `| **Display Name** | ${requirements.displayName} |\n`;
        response += `| **Description** | ${requirements.description} |\n`;
        response += `| **Company** | ${requirements.company} |\n`;
        response += `| **Author** | ${requirements.author} |\n`;
        response += `| **Toolbox Category** | ${requirements.toolboxCategory} |\n`;
        response += `| **Work Folder** | ${requirements.workFolder} |\n`;
        if (requirements.mendixProject &&
            requirements.mendixProject !== 'skip' &&
            requirements.mendixProject !== 'none') {
            response += `| **Deploy To** | ${requirements.mendixProject} |\n`;
        }
        response += `\n### Properties (${requirements.properties?.length || 0})\n\n`;
        if (requirements.properties && requirements.properties.length > 0) {
            for (const prop of requirements.properties) {
                response += `- **${prop.caption}** (\`${prop.key}\`) - ${prop.type}\n`;
            }
        }
        else {
            response += `*No properties detected. I'll add basic defaults.*\n`;
        }
        response += `\n### Events (${requirements.events?.length || 0})\n\n`;
        if (requirements.events && requirements.events.length > 0) {
            for (const evt of requirements.events) {
                response += `- **${evt.caption}** (\`${evt.key}\`)\n`;
            }
        }
        else {
            response += `*No events detected.*\n`;
        }
        response += `\n---\n\n`;
        response += `## 🎨 Icons\n\n`;
        if (requirements.iconPath && requirements.iconPath !== 'default') {
            response += `Using your icon: \`${requirements.iconPath}\`\n`;
        }
        else {
            response += `I'll generate a default Mendix-style icon. You can customize it later by:\n`;
            response += `1. Dropping an SVG (64×64) into the widget's \`src/\` folder\n`;
            response += `2. Run \`npm run build\` to regenerate\n\n`;
            response += `💡 *SVG is best! One file works for both toolbox AND Structure Mode preview.*\n`;
        }
        response += `\n---\n\n`;
        response += `**Say "yes" or "build it" to proceed, or tell me what to change.**\n`;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
    async buildWidget(requirements, token) {
        // Ensure we have minimum requirements
        if (!requirements.workFolder) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ Cannot build without a work folder. Please provide one.`),
            ]);
        }
        if (!requirements.widgetName) {
            requirements.widgetName = 'CustomWidget';
        }
        // Build the widget configuration
        const widgetConfig = {
            name: requirements.widgetName,
            displayName: requirements.displayName || requirements.widgetName,
            description: requirements.description || '',
            category: requirements.toolboxCategory || 'Custom Widgets',
            company: requirements.company || 'mycompany',
            properties: requirements.properties || [],
            events: requirements.events || [],
        };
        let output = [];
        try {
            const result = await this.buildLoop.execute(widgetConfig, {
                workFolder: requirements.workFolder,
                mendixProject: requirements.mendixProject,
                autoDeploy: !!requirements.mendixProject,
            }, undefined, (update) => output.push(update), token);
            if (result.success) {
                // Learn from success
                this.dynamicPatterns.learnWidgetTemplate(widgetConfig.category || 'Display', requirements.description || '', '', widgetConfig.properties.map((p) => ({
                    name: p.key,
                    type: p.type,
                    description: p.caption || '',
                })));
                let response = `# 🎉 Widget Created Successfully!\n\n`;
                response += `## ${widgetConfig.displayName}\n\n`;
                response += `| | |\n`;
                response += `|---|---|\n`;
                response += `| 📁 **Location** | \`${result.outputPath}\` |\n`;
                response += `| 📦 **MPK File** | \`${result.mpkPath}\` |\n`;
                if (result.deployedTo) {
                    response += `| 🚀 **Deployed To** | \`${result.deployedTo}\` |\n`;
                }
                response += `\n## Next Steps\n\n`;
                response += `1. **Open in VS Code:** \`code "${result.outputPath}"\`\n`;
                if (result.deployedTo) {
                    response += `2. **Refresh Studio Pro:** Press \`F4\` to see the widget in your toolbox\n`;
                    response += `3. **Find it in:** Toolbox → ${requirements.toolboxCategory}\n`;
                }
                else {
                    response += `2. **Build:** \`npm run build\` in the widget folder\n`;
                    response += `3. **Deploy:** Copy the \`.mpk\` to your Mendix project's \`widgets\` folder\n`;
                }
                response += `\n## Customization\n\n`;
                response += `- **Icon:** Replace \`src/${widgetConfig.name}.tile.png\` with your 64×64 PNG or SVG\n`;
                response += `- **Preview:** Edit \`src/${widgetConfig.name}.editorConfig.js\` for Structure Mode icon\n`;
                response += `- **Logic:** Edit \`src/${widgetConfig.name}.jsx\` for widget behavior\n`;
                response += `- **Properties:** Edit \`src/${widgetConfig.name}.xml\` to add/modify properties\n`;
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
            }
            else {
                let response = `# ❌ Build Failed\n\n`;
                response += `**Errors:**\n\`\`\`\n${result.errors.join('\n')}\n\`\`\`\n\n`;
                response += `Use **#mendix-fix** to analyze and fix these errors, or ask me to research the issue.\n`;
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
            }
        }
        catch (error) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ Error during build: ${error instanceof Error ? error.message : String(error)}`),
            ]);
        }
    }
}
exports.CreateWidgetTool = CreateWidgetTool;
class ConvertTsxTool {
    context;
    pathValidator;
    generatorBridge;
    buildLoop;
    dynamicPatterns;
    constructor(context, pathValidator, generatorBridge, buildLoop, dynamicPatterns) {
        this.context = context;
        this.pathValidator = pathValidator;
        this.generatorBridge = generatorBridge;
        this.buildLoop = buildLoop;
        this.dynamicPatterns = dynamicPatterns;
    }
    async prepareInvocation(options, _token) {
        return {
            invocationMessage: '🔄 Mendix Widget Agent ready to convert your TSX/React component...',
        };
    }
    async invoke(options, token) {
        const { tsxPath, answers } = options.input;
        // Load any saved configuration
        const config = vscode.workspace.getConfiguration('mendixWidget');
        const savedWorkFolder = config.get('defaultWorkFolder');
        const savedMendixProject = config.get('defaultMendixProject');
        // ========================================================================
        // STAGE 1: No TSX path - Ask for it!
        // ========================================================================
        if (!tsxPath) {
            return this.askForTsxFile();
        }
        // ========================================================================
        // STAGE 2: Have TSX path - Analyze it!
        // ========================================================================
        const analysis = await this.analyzeTsxFile(tsxPath);
        if (!analysis.success) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ Could not analyze TSX file:\n${analysis.error}`),
            ]);
        }
        // Build requirements from analysis
        const requirements = {
            sourceTsxPath: tsxPath,
            sourceTsxContent: analysis.content,
            widgetName: analysis.componentName,
            displayName: analysis.componentName?.replace(/([A-Z])/g, ' $1').trim(),
            description: `Mendix wrapper for ${analysis.componentName}`,
            analyzedProps: analysis.props,
            analyzedEvents: analysis.events,
            workFolder: savedWorkFolder,
            mendixProject: savedMendixProject,
            toolboxCategory: 'Custom Widgets',
            isWrapped: true, // Default to wrapping
        };
        // Apply any answers
        if (answers) {
            if (answers.widgetName)
                requirements.widgetName = answers.widgetName;
            if (answers.workFolder)
                requirements.workFolder = answers.workFolder;
            if (answers.mendixProject)
                requirements.mendixProject = answers.mendixProject;
            if (answers.toolboxCategory)
                requirements.toolboxCategory = answers.toolboxCategory;
            if (answers.iconPath)
                requirements.iconPath = answers.iconPath;
            if (answers.wrapOriginal !== undefined)
                requirements.isWrapped = answers.wrapOriginal;
        }
        // ========================================================================
        // STAGE 3: Show analysis and ask questions
        // ========================================================================
        if (!answers?.confirm) {
            return this.showAnalysisAndAsk(requirements, analysis);
        }
        // ========================================================================
        // STAGE 4: Convert/Wrap the component!
        // ========================================================================
        return await this.convertComponent(requirements, token);
    }
    askForTsxFile() {
        const response = `# 🔄 Convert TSX to Mendix Widget

**I can convert your React/TSX component into a Mendix pluggable widget!**

## Two Options:

### 1. **Wrap** (Recommended)
Keep your original component as-is, and create a Mendix wrapper around it.
- ✅ Preserves your original code
- ✅ Easy updates - just replace the original file
- ✅ Best for complex components

### 2. **Convert**
Transform the component to use Mendix patterns directly.
- ✅ Better integration with Mendix
- ⚠️ More changes to original code

---

**Please provide the path to your TSX file:**

Example: \`D:\\MyComponents\\StatusBadge.tsx\`

Or drag and drop the file here.`;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
    async analyzeTsxFile(tsxPath) {
        try {
            // Check file exists
            if (!fs.existsSync(tsxPath)) {
                return { success: false, error: `File not found: ${tsxPath}` };
            }
            const content = fs.readFileSync(tsxPath, 'utf8');
            // Extract component name
            const componentMatch = content.match(/(?:export\s+(?:default\s+)?)?(?:function|const)\s+(\w+)/);
            const componentName = componentMatch
                ? componentMatch[1]
                : path.basename(tsxPath, path.extname(tsxPath));
            // Extract props from interface or type
            const propsMatch = content.match(/interface\s+\w*Props\w*\s*\{([^}]+)\}/s) ||
                content.match(/type\s+\w*Props\w*\s*=\s*\{([^}]+)\}/s);
            const props = [];
            const events = [];
            if (propsMatch) {
                const propsContent = propsMatch[1];
                // Parse each property line
                const propLines = propsContent
                    .split('\n')
                    .filter((line) => line.trim() && !line.trim().startsWith('//'));
                for (const line of propLines) {
                    const propMatch = line.match(/^\s*(\w+)(\?)?\s*:\s*([^;]+)/);
                    if (propMatch) {
                        const [, name, optional, type] = propMatch;
                        // Check if it's an event (function type)
                        if (type.includes('=>') || type.includes('Function') || name.startsWith('on')) {
                            events.push({
                                name,
                                description: `${name} event handler`,
                            });
                        }
                        else {
                            props.push({
                                name,
                                type: type.trim(),
                                required: !optional,
                                description: `${name} property`,
                            });
                        }
                    }
                }
            }
            // Check for styles
            const hasStyles = content.includes('import') &&
                (content.includes('.css') ||
                    content.includes('.scss') ||
                    content.includes('styled-components') ||
                    content.includes('emotion'));
            // Extract imports
            const importMatches = content.matchAll(/import\s+.+\s+from\s+['"]([^'"]+)['"]/g);
            const imports = Array.from(importMatches).map((m) => m[1]);
            return {
                success: true,
                content,
                componentName,
                props,
                events,
                hasStyles,
                imports,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    showAnalysisAndAsk(requirements, analysis) {
        let response = `# 🔍 TSX Analysis Complete!\n\n`;
        response += `## Component: ${analysis.componentName}\n\n`;
        response += `**File:** \`${requirements.sourceTsxPath}\`\n\n`;
        response += `### Properties Detected (${analysis.props?.length || 0})\n\n`;
        if (analysis.props && analysis.props.length > 0) {
            response += `| Name | Type | Required |\n`;
            response += `|------|------|----------|\n`;
            for (const prop of analysis.props) {
                response += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} |\n`;
            }
        }
        else {
            response += `*No props detected. I'll create a simple wrapper.*\n`;
        }
        response += `\n### Events Detected (${analysis.events?.length || 0})\n\n`;
        if (analysis.events && analysis.events.length > 0) {
            for (const evt of analysis.events) {
                response += `- \`${evt.name}\`\n`;
            }
        }
        else {
            response += `*No events detected.*\n`;
        }
        if (analysis.hasStyles) {
            response += `\n### ⚠️ Styles Detected\n`;
            response += `This component has CSS imports. I'll include them in the widget.\n`;
        }
        if (analysis.imports && analysis.imports.length > 0) {
            response += `\n### Dependencies\n`;
            const externalImports = analysis.imports.filter((i) => !i.startsWith('.') && !i.startsWith('/'));
            if (externalImports.length > 0) {
                response += `External packages needed: ${externalImports.join(', ')}\n`;
            }
        }
        response += `\n---\n\n`;
        response += `## Configuration Needed\n\n`;
        if (!requirements.workFolder) {
            response += `### 📁 Work Folder\n`;
            response += `Where should I create the Mendix widget project?\n\n`;
        }
        if (!requirements.mendixProject) {
            response += `### 🎯 Mendix Project (Optional)\n`;
            response += `Do you want me to deploy directly to a Mendix project? Provide the path.\n\n`;
        }
        response += `### 🏷️ Widget Name\n`;
        response += `Suggested: **${requirements.widgetName}**\n`;
        response += `*Change this if you want a different name.*\n\n`;
        response += `### 📂 Toolbox Category\n`;
        response += `Default: **${requirements.toolboxCategory}**\n`;
        response += `*Where should this appear in Studio Pro's toolbox?*\n\n`;
        response += `### 🎨 Icon\n`;
        response += `Drop an SVG (64×64) in the work folder, or I'll generate a default.\n\n`;
        response += `---\n\n`;
        response += `**Provide any changes, or say "convert" to proceed with these settings.**\n`;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
    async convertComponent(requirements, token) {
        if (!requirements.workFolder) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ Cannot convert without a work folder. Please provide one.`),
            ]);
        }
        if (!requirements.widgetName) {
            requirements.widgetName = 'ConvertedWidget';
        }
        // Convert analyzed props to Mendix properties
        const mendixProperties = (requirements.analyzedProps || []).map((prop) => {
            // Map TypeScript types to Mendix types
            let mendixType = 'string';
            if (prop.type.includes('number'))
                mendixType = 'integer';
            if (prop.type.includes('boolean'))
                mendixType = 'boolean';
            if (prop.type.includes('Date'))
                mendixType = 'attribute';
            if (prop.type.includes('[]') || prop.type.includes('Array'))
                mendixType = 'object'; // datasource not valid, use object
            return {
                key: prop.name,
                type: mendixType,
                caption: prop.name.replace(/([A-Z])/g, ' $1').trim(),
                description: prop.description || '',
            };
        });
        // Convert analyzed events to Mendix events
        const mendixEvents = (requirements.analyzedEvents || []).map((evt) => ({
            key: evt.name,
            caption: evt.name.replace(/([A-Z])/g, ' $1').trim(),
            description: evt.description || '',
        }));
        const widgetConfig = {
            name: requirements.widgetName,
            displayName: requirements.displayName || requirements.widgetName,
            description: requirements.description || '',
            category: requirements.toolboxCategory || 'Custom Widgets',
            company: requirements.company || 'mycompany',
            properties: mendixProperties,
            events: mendixEvents,
        };
        let output = [];
        try {
            const result = await this.buildLoop.execute(widgetConfig, {
                workFolder: requirements.workFolder,
                mendixProject: requirements.mendixProject,
                autoDeploy: !!requirements.mendixProject,
            }, undefined, (update) => output.push(update), token);
            if (result.success) {
                // Copy original TSX file if wrapping
                if (requirements.isWrapped && requirements.sourceTsxPath && result.outputPath) {
                    const srcFolder = path.join(result.outputPath, 'src');
                    const originalFileName = path.basename(requirements.sourceTsxPath);
                    fs.copyFileSync(requirements.sourceTsxPath, path.join(srcFolder, `Original${originalFileName}`));
                }
                // Learn from success
                this.dynamicPatterns.learnWidgetTemplate('Converted', `Converted from ${requirements.sourceTsxPath}`, requirements.sourceTsxContent || '', mendixProperties.map((p) => ({
                    name: p.key,
                    type: p.type,
                    description: p.caption || '',
                })));
                let response = `# 🎉 Component Converted Successfully!\n\n`;
                response += `## ${widgetConfig.displayName}\n\n`;
                response += `| | |\n`;
                response += `|---|---|\n`;
                response += `| 📁 **Widget Location** | \`${result.outputPath}\` |\n`;
                response += `| 📦 **MPK File** | \`${result.mpkPath}\` |\n`;
                response += `| 📄 **Original TSX** | Copied to \`src/Original*.tsx\` |\n`;
                if (result.deployedTo) {
                    response += `| 🚀 **Deployed To** | \`${result.deployedTo}\` |\n`;
                }
                response += `\n## Property Mapping\n\n`;
                if (mendixProperties.length > 0) {
                    response += `| Original Prop | Mendix Property | Type |\n`;
                    response += `|---------------|-----------------|------|\n`;
                    for (const prop of mendixProperties) {
                        response += `| \`${prop.key}\` | \`${prop.caption}\` | ${prop.type} |\n`;
                    }
                }
                response += `\n## Next Steps\n\n`;
                response += `1. **Review the generated code** in \`src/${widgetConfig.name}.jsx\`\n`;
                response += `2. **Wire up the original component** - import and use your component\n`;
                response += `3. **Map Mendix properties** to your component's props\n`;
                response += `4. **Rebuild:** \`npm run build\`\n`;
                if (result.deployedTo) {
                    response += `5. **Refresh Studio Pro:** Press \`F4\`\n`;
                }
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
            }
            else {
                let response = `# ❌ Conversion Failed\n\n`;
                response += `**Errors:**\n\`\`\`\n${result.errors.join('\n')}\n\`\`\`\n\n`;
                response += `Use **#mendix-fix** to analyze these errors.\n`;
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
            }
        }
        catch (error) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ Error during conversion: ${error instanceof Error ? error.message : String(error)}`),
            ]);
        }
    }
}
exports.ConvertTsxTool = ConvertTsxTool;
class FixWidgetTool {
    beastMode;
    dynamicPatterns;
    buildLoop;
    constructor(beastMode, dynamicPatterns, buildLoop) {
        this.beastMode = beastMode;
        this.dynamicPatterns = dynamicPatterns;
        this.buildLoop = buildLoop;
    }
    async prepareInvocation(options, _token) {
        return {
            invocationMessage: '🔧 Analyzing Mendix widget build errors...',
        };
    }
    async invoke(options, token) {
        const { errorMessage } = options.input;
        // First, check dynamic patterns for known fixes
        const knownFixes = this.dynamicPatterns.getMatchingErrorFixes(errorMessage);
        let response = `# 🔧 Error Analysis\n\n`;
        response += `**Error:**\n\`\`\`\n${errorMessage}\n\`\`\`\n\n`;
        if (knownFixes.length > 0) {
            response += `## 💡 Known Fixes (from experience)\n\n`;
            for (const fix of knownFixes.slice(0, 3)) {
                const confidence = (fix.confidence * 100).toFixed(0);
                response += `### ${fix.fix.description} (${confidence}% confidence)\n\n`;
                if (fix.fix.replace) {
                    response += `\`\`\`typescript\n${fix.fix.replace}\n\`\`\`\n\n`;
                }
            }
        }
        // Research additional fixes using Beast Mode
        response += `## 🔬 Research-Based Suggestions\n\n`;
        const research = await this.buildLoop.researchFixes([errorMessage], undefined);
        response += research;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
}
exports.FixWidgetTool = FixWidgetTool;
class ResearchWidgetTool {
    beastMode;
    constructor(beastMode) {
        this.beastMode = beastMode;
    }
    async prepareInvocation(options, _token) {
        return {
            invocationMessage: `🔬 Beast Mode Research: ${options.input.topic}...`,
        };
    }
    async invoke(options, token) {
        const { topic } = options.input;
        let output = [];
        const research = await this.beastMode.research(topic, undefined, (update) => output.push(update));
        let response = `# 🔬 Beast Mode Research: "${topic}"\n\n`;
        response += research.summary + '\n\n';
        if (research.codeExamples.length > 0) {
            response += `## Code Examples\n\n`;
            for (const example of research.codeExamples.slice(0, 3)) {
                response += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n`;
                response += `*Source: ${example.source}*\n\n`;
            }
        }
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
}
exports.ResearchWidgetTool = ResearchWidgetTool;
class ListTemplatesTool {
    generatorBridge;
    constructor(generatorBridge) {
        this.generatorBridge = generatorBridge;
    }
    async prepareInvocation(_options, _token) {
        return {
            invocationMessage: '📦 Listing available Mendix widget templates...',
        };
    }
    async invoke(options, _token) {
        const templates = this.generatorBridge.getAvailableTemplates();
        let response = `# 📦 Available Widget Templates\n\n`;
        for (const template of templates) {
            response += `## ${template.displayName}\n`;
            response += `- **ID:** ${template.id}\n`;
            response += `- **Description:** ${template.description}\n`;
            response += `- **Properties:** ${template.properties.map((p) => p.key).join(', ') || 'None'}\n`;
            response += `- **Events:** ${template.events.map((e) => e.key).join(', ') || 'None'}\n\n`;
        }
        response += `---\n\n`;
        response += `To create a widget from a template, describe what you want and I'll match the best template.\n`;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
}
exports.ListTemplatesTool = ListTemplatesTool;
class DeployWidgetTool {
    pathValidator;
    constructor(pathValidator) {
        this.pathValidator = pathValidator;
    }
    async prepareInvocation(options, _token) {
        return {
            invocationMessage: '🚀 Deploying widget to Mendix project...',
            confirmationMessages: {
                title: 'Deploy Widget',
                message: new vscode.MarkdownString(`Deploy widget to Mendix project?\n\n` +
                    `**Widget:** ${options.input.widgetPath}\n` +
                    `**Project:** ${options.input.mendixProjectPath}`),
            },
        };
    }
    async invoke(options, _token) {
        const { widgetPath, mendixProjectPath } = options.input;
        // Validate project
        const validation = await this.pathValidator.validateMendixProject(mendixProjectPath);
        if (!validation.isValid) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ Invalid Mendix project: ${validation.error}\n\n${validation.suggestion || ''}`),
            ]);
        }
        // Find the MPK file
        const mpkFiles = fs.readdirSync(widgetPath).filter((f) => f.endsWith('.mpk'));
        if (mpkFiles.length === 0) {
            // Check dist folder
            const distPath = path.join(widgetPath, 'dist');
            if (fs.existsSync(distPath)) {
                const distDirs = fs.readdirSync(distPath);
                for (const dir of distDirs) {
                    const dirPath = path.join(distPath, dir);
                    if (fs.statSync(dirPath).isDirectory()) {
                        const dirMpks = fs.readdirSync(dirPath).filter((f) => f.endsWith('.mpk'));
                        if (dirMpks.length > 0) {
                            const sourceMpk = path.join(dirPath, dirMpks[0]);
                            const destMpk = path.join(validation.widgetsFolder, dirMpks[0]);
                            fs.copyFileSync(sourceMpk, destMpk);
                            return new vscode.LanguageModelToolResult([
                                new vscode.LanguageModelTextPart(`# 🚀 Widget Deployed!\n\n` +
                                    `✅ **Copied:** ${dirMpks[0]}\n` +
                                    `📁 **To:** ${validation.widgetsFolder}\n\n` +
                                    `**Press F4 in Studio Pro** to refresh the toolbox!`),
                            ]);
                        }
                    }
                }
            }
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ No .mpk file found in ${widgetPath}\n\n` +
                    `Run \`npm run build\` first to generate the widget package.`),
            ]);
        }
        // Copy MPK to widgets folder
        const sourceMpk = path.join(widgetPath, mpkFiles[0]);
        const destMpk = path.join(validation.widgetsFolder, mpkFiles[0]);
        fs.copyFileSync(sourceMpk, destMpk);
        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`# 🚀 Widget Deployed!\n\n` +
                `✅ **Copied:** ${mpkFiles[0]}\n` +
                `📁 **To:** ${validation.widgetsFolder}\n` +
                `🎯 **Project:** ${validation.projectName}\n\n` +
                `**Press F4 in Studio Pro** to refresh the toolbox!`),
        ]);
    }
}
exports.DeployWidgetTool = DeployWidgetTool;
class ShowPatternsTool {
    dynamicPatterns;
    constructor(dynamicPatterns) {
        this.dynamicPatterns = dynamicPatterns;
    }
    async prepareInvocation(_options, _token) {
        return {
            invocationMessage: '🔮 Retrieving learned patterns from the nucleus...',
        };
    }
    async invoke(options, _token) {
        const stats = this.dynamicPatterns.getStats();
        let response = `# 🔮 The Nucleus - Self-Learning Patterns\n\n`;
        response += `These patterns improve over time as you build widgets.\n\n`;
        response += `| Category | Count |\n`;
        response += `|----------|-------|\n`;
        response += `| Error Fixes | ${stats.errorFixes} |\n`;
        response += `| Widget Templates | ${stats.templates} |\n`;
        response += `| SDK APIs | ${stats.sdkApis} |\n`;
        response += `| Best Practices | ${stats.bestPractices} |\n`;
        response += `| **Learned from Experience** | **${stats.learnedPatterns}** |\n\n`;
        const errorFixes = this.dynamicPatterns.getMatchingErrorFixes('');
        if (errorFixes.length > 0) {
            response += `## 🔧 Top Error Fixes\n\n`;
            for (const fix of errorFixes.slice(0, 5)) {
                response += `- **${fix.fix.description}** (${(fix.confidence * 100).toFixed(0)}% confidence)\n`;
            }
            response += '\n';
        }
        const practices = this.dynamicPatterns.getBestPractices();
        if (practices.length > 0) {
            response += `## 💡 Best Practices\n\n`;
            for (const practice of practices.slice(0, 5)) {
                response += `- **${practice.title}:** ${practice.description}\n`;
            }
        }
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
}
exports.ShowPatternsTool = ShowPatternsTool;
class GetStatusTool {
    knowledgeSharing;
    dynamicPatterns;
    selfUpdate;
    constructor(knowledgeSharing, dynamicPatterns, selfUpdate) {
        this.knowledgeSharing = knowledgeSharing;
        this.dynamicPatterns = dynamicPatterns;
        this.selfUpdate = selfUpdate;
    }
    async prepareInvocation(_options, _token) {
        return {
            invocationMessage: '📊 Getting Mendix Widget Agent status...',
        };
    }
    async invoke(_options, _token) {
        const stats = this.dynamicPatterns.getStats();
        const kbStatus = this.knowledgeSharing.getStatus();
        const updateInfo = await this.selfUpdate.checkForUpdates();
        const config = vscode.workspace.getConfiguration('mendixWidget');
        let response = `# 📊 Mendix Custom Widget Agent\n\n`;
        response += `## Version\n`;
        response += `- **Installed:** ${selfUpdate_1.VERSION}\n`;
        if (updateInfo.updateAvailable) {
            response += `- ⚠️ **Update Available:** ${updateInfo.latestVersion}\n`;
        }
        else {
            response += `- ✅ Up to date\n`;
        }
        response += '\n';
        response += `## Configuration\n`;
        response += `| Setting | Value |\n`;
        response += `|---------|-------|\n`;
        response += `| Work Folder | ${config.get('defaultWorkFolder') || '❌ Not set'} |\n`;
        response += `| Mendix Project | ${config.get('defaultMendixProject') || '❌ Not set'} |\n\n`;
        response += `## Self-Learning Nucleus\n`;
        response += `| Pattern Type | Count |\n`;
        response += `|--------------|-------|\n`;
        response += `| Error Fixes | ${stats.errorFixes} |\n`;
        response += `| Templates | ${stats.templates} |\n`;
        response += `| Learned Patterns | ${stats.learnedPatterns} |\n\n`;
        response += `## Knowledge Base\n`;
        if (kbStatus.enabled) {
            response += `✅ Connected (${kbStatus.entriesCount} entries)\n`;
        }
        else {
            response += `⚠️ Not connected - Use @mendix-expert for knowledge queries\n`;
        }
        response += `\n---\n\n`;
        response += `## Available Commands\n\n`;
        response += `| Tool | Description |\n`;
        response += `|------|-------------|\n`;
        response += `| \`#mendix-create\` | Create a new widget (smart interview) |\n`;
        response += `| \`#mendix-convert\` | Convert TSX to Mendix widget |\n`;
        response += `| \`#mendix-fix\` | Fix build errors |\n`;
        response += `| \`#mendix-research\` | Beast Mode pattern research |\n`;
        response += `| \`#mendix-templates\` | List available templates |\n`;
        response += `| \`#mendix-deploy\` | Deploy widget to Mendix project |\n`;
        response += `| \`#mendix-patterns\` | Show learned patterns |\n`;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    }
}
exports.GetStatusTool = GetStatusTool;
// ============================================================================
// TOOL REGISTRATION HELPER
// ============================================================================
function registerAllTools(context, pathValidator, generatorBridge) {
    // Initialize shared components
    const beastMode = new beastModeResearch_1.BeastModeResearch();
    const dynamicPatterns = new dynamicPatterns_1.DynamicPatterns();
    const buildLoop = new buildLoop_1.BuildLoop(generatorBridge, beastMode);
    const knowledgeSharing = new knowledgeSharing_1.KnowledgeSharing();
    const selfUpdate = new selfUpdate_1.SelfUpdate();
    // Register all tools
    context.subscriptions.push(
    // Core creation tools
    vscode.lm.registerTool('mendix-widget_create_widget', new CreateWidgetTool(context, pathValidator, generatorBridge, buildLoop, dynamicPatterns)), vscode.lm.registerTool('mendix-widget_convert_tsx', new ConvertTsxTool(context, pathValidator, generatorBridge, buildLoop, dynamicPatterns)), 
    // Support tools
    vscode.lm.registerTool('mendix-widget_fix_errors', new FixWidgetTool(beastMode, dynamicPatterns, buildLoop)), vscode.lm.registerTool('mendix-widget_research', new ResearchWidgetTool(beastMode)), vscode.lm.registerTool('mendix-widget_list_templates', new ListTemplatesTool(generatorBridge)), vscode.lm.registerTool('mendix-widget_deploy', new DeployWidgetTool(pathValidator)), vscode.lm.registerTool('mendix-widget_show_patterns', new ShowPatternsTool(dynamicPatterns)), vscode.lm.registerTool('mendix-widget_status', new GetStatusTool(knowledgeSharing, dynamicPatterns, selfUpdate)));
    console.log('[MendixWidgetAgent] All 8 Language Model Tools registered!');
}
//# sourceMappingURL=widgetAgentTools.js.map