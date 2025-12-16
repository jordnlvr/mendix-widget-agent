# ✅ PROVEN Mendix Pluggable Widget Pattern

> **Status**: VERIFIED WORKING - December 15, 2025
> **Tested with**: Mendix Studio Pro 11.5.0
> **Tools Version**: pluggable-widgets-tools ^10.21.2
> **Test Project**: SmartHub-main_ForTesting

## 🎯 Working Widgets

| Widget           | Properties Tested                                        | Status     |
| ---------------- | -------------------------------------------------------- | ---------- |
| **TestLabel**    | `expression`, `enumeration`                              | ✅ Working |
| **SimpleButton** | `textTemplate`, `enumeration`, `action`                  | ✅ Working |
| **ClickToEdit**  | `attribute`, `expression`, `enumeration`, custom classes | ✅ Working |

**Location**: `D:\kelly.seale\CodeBase\PluggableWidgets\`

---

## 🎨 ICON FILES - CRITICAL (Learned the Hard Way!)

Icons **MUST** be PNG files with **exact naming** in `src/` folder:

| File                         | Size (pixels) | Purpose                      |
| ---------------------------- | ------------- | ---------------------------- |
| `{WidgetName}.icon.png`      | 64×64 ideal   | Toolbox list view            |
| `{WidgetName}.icon.dark.png` | 64×64 ideal   | Dark mode toolbox            |
| `{WidgetName}.tile.png`      | 256×192 ideal | Toolbox tile view (optional) |
| `{WidgetName}.tile.dark.png` | 256×192 ideal | Dark mode tile (optional)    |

### How it Works (from rollup.config.mjs):

```javascript
// Build checks for icon files and copies them to MPK root
if (existsSync(`src/${widgetName}.icon.png`) || existsSync(`src/${widgetName}.tile.png`)) {
  cp(join(sourcePath, `src/${widgetName}.@(tile|icon)?(.dark).png`), outDir);
}
```

### ⚠️ Icon Gotchas:

- **EXACT naming required** - must match `widgetName` from package.json
- **PNG format only** - no SVG, no JPEG
- **Case sensitive** - `ClickToEdit.icon.png` not `clicktoedit.icon.png`
- **32×32 works** but 64×64 looks better
- **Don't use `<icon>` in XML** if using file-based icons (one or the other)

---

## 📦 package.json (EXACT PATTERN)

```json
{
  "name": "widgetname",
  "widgetName": "WidgetName",
  "version": "1.0.0",
  "description": "Widget description",
  "copyright": "© Neo 2024. All rights reserved.",
  "license": "Apache-2.0",
  "packagePath": "com.blueprintmx.widget.custom",
  "config": {
    "projectPath": "D:/kelly.seale/CodeBase/SmartHub-main_ForTesting",
    "mendixHost": "http://localhost:8080",
    "developmentPort": 3000
  },
  "scripts": {
    "build": "cross-env MPKOUTPUT=WidgetName.mpk pluggable-widgets-tools build:web",
    "dev": "cross-env MPKOUTPUT=WidgetName.mpk pluggable-widgets-tools start:web",
    "release": "cross-env MPKOUTPUT=WidgetName.mpk pluggable-widgets-tools release:web",
    "lint": "pluggable-widgets-tools lint",
    "lint:fix": "pluggable-widgets-tools lint:fix"
  },
  "devDependencies": {
    "@mendix/pluggable-widgets-tools": "^10.21.2",
    "cross-env": "^7.0.3"
  },
  "dependencies": {
    "classnames": "^2.5.1"
  },
  "overrides": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@types/react": "~18.2.0",
    "@types/react-dom": "~18.2.0"
  }
}
```

### Critical Points:

- `"@mendix/pluggable-widgets-tools": "^10.21.2"` - latest working version
- **overrides** section REQUIRED - locks React to 18.2.0 (prevents duplicate React issues)
- `MPKOUTPUT` env var in scripts defines output filename
- Forward slashes in `projectPath` (even on Windows)
- `packagePath` should use your company namespace

---

## 📝 tsconfig.json (EXACT PATTERN)

```json
{
  "extends": "@mendix/pluggable-widgets-tools/configs/tsconfig.base",
  "compilerOptions": {
    "baseUrl": "./"
  },
  "include": ["./src", "./typings"]
}
```

### Critical Points:

- **MUST** use `extends` - inherits all settings from widget tools
- Do NOT add custom `moduleResolution`, `jsx`, etc. - base handles it

---

## 🏗️ Widget.tsx Main Component (EXACT PATTERN)

```tsx
/**
 * WidgetName Pluggable Widget
 */
import { ReactElement, createElement, useCallback } from 'react';
import { WidgetNameContainerProps } from '../typings/WidgetNameProps';
import { WidgetNameDisplay } from './components/WidgetNameDisplay';
import './ui/WidgetName.css';

// IMPORTANT: Use NAMED export, not default export
export function WidgetName(props: WidgetNameContainerProps): ReactElement {
  const { displayText, styleType, onClick, class: className, style, tabIndex } = props;

  const handleClick = useCallback(() => {
    if (onClick?.canExecute) {
      onClick.execute();
    }
  }, [onClick]);

  return (
    <WidgetNameDisplay
      value={displayText?.value ?? ''}
      styleType={styleType}
      onClick={onClick?.canExecute ? handleClick : undefined}
      className={className}
      style={style}
      tabIndex={onClick?.canExecute ? tabIndex ?? 0 : undefined}
    />
  );
}
```

### Critical Points:

- **Named export** (`export function WidgetName`) - NOT `export default`
- Import `createElement` from 'react' - REQUIRED for JSX transform
- Return type `ReactElement` - explicit typing
- Props type from `../typings/WidgetNameProps` (auto-generated on build)
- Separate display component in `./components/` (separation of concerns)
- Destructure props at top for clarity

---

## 🎯 Widget.xml Definition (EXACT PATTERN)

```xml
<?xml version="1.0" encoding="utf-8" ?>
<widget id="com.blueprintmx.widget.custom.widgetname.WidgetName"
        pluginWidget="true"
        needsEntityContext="false"
        offlineCapable="true"
        xmlns="http://www.mendix.com/widget/1.0/">
  <name>Widget Name</name>
  <description>Widget description</description>
  <studioProCategory>Display</studioProCategory>
  <!-- NOTE: Don't use <icon> if using file-based icons (WidgetName.icon.png) -->

  <properties>
    <propertyGroup caption="General">
      <propertyGroup caption="Data">
        <!-- Properties here -->
      </propertyGroup>
    </propertyGroup>

    <!-- STYLING CUSTOMIZATION PATTERN (Learned from ClickToEdit) -->
    <propertyGroup caption="Appearance">
      <propertyGroup caption="Styling Classes">
        <property key="rootClass" type="string" required="false">
          <caption>Root Class</caption>
          <description>CSS class for the widget container</description>
        </property>
        <property key="labelClass" type="string" required="false">
          <caption>Label Class</caption>
          <description>CSS class for label elements (e.g., mx-text, custom classes)</description>
        </property>
        <property key="inputClass" type="string" required="false">
          <caption>Input Class</caption>
          <description>CSS class for input elements</description>
        </property>
      </propertyGroup>
    </propertyGroup>

    <propertyGroup caption="Common">
      <systemProperty key="Name" />
      <systemProperty key="TabIndex" />
    </propertyGroup>
  </properties>
</widget>
```

### Styling Classes Pattern (NEW - Dec 15, 2025)

This pattern allows Mendix developers to target inner widget elements with their existing CSS:

```xml
<property key="labelClass" type="string" required="false">
  <caption>Label Class</caption>
  <description>CSS class for label elements (e.g., mx-text mx-name-text65)</description>
</property>
```

**In TSX**, apply these classes:

```tsx
<span className={classNames('widget-foo__label', props.labelClass)}>{labelText}</span>
```

**Why this matters**: Mendix devs have existing drawer/page styling. They want widgets to match without writing new CSS. This lets them reuse classes like `mx-text mx-name-text65`.

---

## � Tooltip Pattern (Learned from ClickToEdit)

Don't use browser `title` attribute - build a proper animated tooltip:

### XML Property

```xml
<property key="tooltipText" type="expression" required="false">
  <caption>Tooltip Text</caption>
  <description>Text shown on hover</description>
  <returnType type="String"/>
</property>
```

### TSX Implementation

```tsx
const [showTooltip, setShowTooltip] = useState(false);
const tooltipTimeoutRef = useRef<number | null>(null);

const handleMouseEnter = useCallback(() => {
  if (tooltipText) {
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 150); // Small delay feels natural
  }
}, [tooltipText]);

const handleMouseLeave = useCallback(() => {
  if (tooltipTimeoutRef.current) {
    clearTimeout(tooltipTimeoutRef.current);
  }
  setShowTooltip(false);
}, []);

// In JSX:
<div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
  {/* widget content */}
  {showTooltip && tooltipText && <div className="widget-foo__tooltip">{tooltipText}</div>}
</div>;
```

### CSS for Tooltip

```css
.widget-foo__tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background-color: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  animation: widget-foo-tooltip-in 0.15s ease-out;
}

.widget-foo__tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
}

@keyframes widget-foo-tooltip-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
```

---

## �🔤 Property Types (VERIFIED WORKING)

### Expression Property (read from attribute/microflow)

```xml
<property key="displayValue" type="expression" required="false">
  <caption>Display Value</caption>
  <description>The value to display</description>
  <returnType type="String"/>
</property>
```

**Usage in TSX**: `props.displayValue?.value ?? 'default'`

### TextTemplate Property (translatable text)

```xml
<property key="buttonText" type="textTemplate" required="false">
  <caption>Button Text</caption>
  <description>The text displayed</description>
  <translations>
    <translation lang="en_US">Default Text</translation>
  </translations>
</property>
```

**Usage in TSX**: `props.buttonText?.value ?? 'default'`

### Enumeration Property

```xml
<property key="styleType" type="enumeration" defaultValue="primary">
  <caption>Style</caption>
  <description>Visual style</description>
  <enumerationValues>
    <enumerationValue key="primary">Primary</enumerationValue>
    <enumerationValue key="secondary">Secondary</enumerationValue>
    <enumerationValue key="success">Success</enumerationValue>
    <enumerationValue key="warning">Warning</enumerationValue>
    <enumerationValue key="danger">Danger</enumerationValue>
  </enumerationValues>
</property>
```

**Usage in TSX**: `props.styleType` (returns the key as string)

### Action Property (onClick, onSave, etc.)

```xml
<property key="onClick" type="action" required="false">
  <caption>On Click</caption>
  <description>Action to execute when clicked</description>
</property>
```

**Usage in TSX**:

```tsx
import { useCallback } from 'react';

const handleClick = useCallback(() => {
  if (onClick?.canExecute) {
    onClick.execute();
  }
}, [onClick]);

// In JSX:
<button onClick={onClick?.canExecute ? handleClick : undefined} disabled={!onClick?.canExecute}>
```

---

## 📁 Required File Structure

```
WidgetName/
├── package.json
├── tsconfig.json
└── src/
    ├── WidgetName.tsx               # Main component (named export!)
    ├── WidgetName.xml               # Widget definition
    ├── WidgetName.editorPreview.tsx # Design-time preview
    ├── WidgetName.icon.png          # 🆕 64x64 toolbox icon (CRITICAL!)
    ├── WidgetName.icon.dark.png     # 🆕 Dark mode icon
    ├── package.xml                  # Mendix package metadata
    ├── components/
    │   └── WidgetNameDisplay.tsx    # Pure display component
    └── ui/
        └── WidgetName.css           # Styles (Atlas UI aligned)
```

### Icon Files Checklist

- [ ] `WidgetName.icon.png` - 64×64, PNG format, in `src/` folder
- [ ] `WidgetName.icon.dark.png` - Dark mode variant
- [ ] (Optional) `WidgetName.tile.png` - 256×192 for tile view

---

## 🚀 Build & Deploy Commands

```powershell
# In widget folder
npm install
npm run build

# MPK will be at: dist/{version}/WidgetName.mpk
# Verify icons are included:
# Expand-Archive dist/1.0.0/WidgetName.mpk -DestinationPath temp-check
# Get-ChildItem temp-check/*.png

# Deploy to test project
Copy-Item "dist\1.0.0\WidgetName.mpk" "D:\kelly.seale\CodeBase\SmartHub-main_ForTesting\widgets\" -Force

# In Studio Pro: F4 to synchronize, or Ctrl+Shift+G → Update
```

---

## ⚠️ Known Issues & Solutions

### Problem: Build fails with React version mismatch

**Solution**: The `overrides` section in package.json is REQUIRED. Must lock to React 18.2.0.

### Problem: Widget doesn't appear in Studio Pro

**Solution**: Check widget ID format: `com.company.category.widgetname.WidgetName`

### Problem: Properties not generating types

**Solution**: Run `npm run build` - types auto-generate to `typings/` folder

### Problem: "Cannot find module" errors

**Solution**: Check `tsconfig.json` uses `extends` pattern, not custom settings

---

## 📋 Checklist for New Widget

- [ ] Create folder in `D:\kelly.seale\CodeBase\PluggableWidgets\`
- [ ] Copy package.json pattern, update names
- [ ] Copy tsconfig.json pattern (exact)
- [ ] Create src/ folder structure
- [ ] Create Widget.xml with properties
- [ ] Create Widget.tsx with named export
- [ ] Create package.xml
- [ ] Create display component
- [ ] Create CSS file
- [ ] Create editorPreview
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Copy MPK to test project
- [ ] Test in Studio Pro

---

## 📚 Reference: Working Widget Locations

- **TestLabel**: `D:\kelly.seale\CodeBase\PluggableWidgets\TestLabel\`
- **SimpleButton**: `D:\kelly.seale\CodeBase\PluggableWidgets\SimpleButton\`

**Copy these as templates for new widgets.**

---

## 🌐 Official Reference Resources (NEW - Dec 15, 2025)

### GitHub - mendix/web-widgets (GOLD MINE)

The official Mendix repository with **50+ production widgets**:

- **URL**: https://github.com/mendix/web-widgets
- **Contains**: badge, calendar, datagrid, charts, rich-text, progress bars, etc.
- **Structure**: `packages/pluggableWidgets/{widget-name}-web/`

### Good Simple Examples to Study

| Widget             | Features                          | Learn About          |
| ------------------ | --------------------------------- | -------------------- |
| `badge-web`        | textTemplate, enumeration, action | Basic display widget |
| `progress-bar-web` | expression, min/max values        | Data visualization   |
| `switch-web`       | attribute (EditableValue)         | Two-way binding      |
| `tooltip-web`      | widgets (children)                | Container pattern    |

### Official Execute Action Pattern (from badge-web)

```tsx
import { executeAction } from '@mendix/widget-plugin-platform/framework/execute-action';

const onClick = useCallback(() => executeAction(props.onClick), [props.onClick]);

// With keyboard support
const onKeyDown = useCallback(
  (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  },
  [onClick]
);
```

### Additional Property Types (TO TEST)

These are used in official widgets but not yet verified in our pattern:

```xml
<!-- Attribute (two-way binding) -->
<property key="value" type="attribute">
    <caption>Value</caption>
    <attributeTypes><attributeType name="String"/></attributeTypes>
</property>

<!-- DataSource (list of objects) -->
<property key="dataSource" type="datasource" isList="true">
    <caption>Data Source</caption>
</property>

<!-- Widgets (container for children) -->
<property key="content" type="widgets" required="false">
    <caption>Content</caption>
</property>

<!-- System Properties (built-in) -->
<systemProperty key="Visibility"/>
<systemProperty key="Name"/>
<systemProperty key="TabIndex"/>
```

### Documentation Links

- **Property Types**: https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-property-types/
- **Client APIs**: https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/
- **Tutorial Part 1**: https://docs.mendix.com/howto/extensibility/create-a-pluggable-widget-one/
- **Tutorial Part 2**: https://docs.mendix.com/howto/extensibility/create-a-pluggable-widget-two/

---

_Last Updated: December 15, 2025 by Kai_
