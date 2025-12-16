# Pattern Comparison Analysis

## 🎯 FINAL VERDICT: Both Patterns Work - Use Unified Approach

**Both patterns BUILD and RUN in Mendix Studio Pro 11.5.0!**

### Pattern A: Our Proven Pattern (SimpleButton/TestLabel)

**Status**: ✅ Verified working in Mendix Studio Pro 11.5.0

- Uses `extends` tsconfig (inherits jsx settings)
- Requires `import { createElement } from 'react'`
- Named exports

### Pattern B: Official Mendix Pattern (OfficialBadgeTest - adapted from badge-web)

**Status**: ✅ Verified working in Mendix Studio Pro 11.5.0

- Uses explicit `"jsx": "react-jsx"` in tsconfig
- NO createElement import needed
- Default exports
- Proper `studioProCategory` for toolbox placement

---

## Side-by-Side Comparison

### 1. tsconfig.json

| Aspect                   | Pattern A (Ours)                 | Pattern B (Official)          |
| ------------------------ | -------------------------------- | ----------------------------- |
| **Approach**             | `extends` base config            | Full explicit config          |
| **Line count**           | 6 lines                          | 28 lines                      |
| **jsx**                  | Inherited                        | `"react-jsx"` explicit        |
| **module**               | Inherited                        | `"esnext"` explicit           |
| **React import needed?** | YES - `import { createElement }` | NO - uses react-jsx transform |

**Our tsconfig.json:**

```json
{
  "extends": "@mendix/pluggable-widgets-tools/configs/tsconfig.base",
  "compilerOptions": { "baseUrl": "./" },
  "include": ["./src", "./typings"]
}
```

**Official tsconfig.json:**

```json
{
  "compilerOptions": {
    "jsx": "react-jsx", // NEW React 17+ JSX transform
    "module": "esnext",
    "target": "es6",
    "moduleResolution": "node",
    "esModuleInterop": true
    // ... many more explicit settings
  }
}
```

### 2. Main Component (Widget.tsx)

| Aspect              | Pattern A (Ours)          | Pattern B (Official)       |
| ------------------- | ------------------------- | -------------------------- |
| **Export**          | Named function            | Default export             |
| **Return type**     | `ReactElement`            | `ReactNode`                |
| **createElement**   | Imported                  | Not needed (jsx transform) |
| **Action handling** | Manual `canExecute` check | `executeAction()` helper   |

**Our SimpleButton.tsx:**

```tsx
import { ReactElement, createElement, useCallback } from 'react';
import { SimpleButtonContainerProps } from '../typings/SimpleButtonProps';

export function SimpleButton(props: SimpleButtonContainerProps): ReactElement {
  const handleClick = useCallback(() => {
    if (onClick?.canExecute) {
      onClick.execute();
    }
  }, [onClick]);
  // ...
}
```

**Official Badge.tsx:**

```tsx
import { KeyboardEvent, ReactNode, useCallback } from 'react';
import { executeAction } from '@mendix/widget-plugin-platform/framework/execute-action';
import { BadgeContainerProps } from '../typings/BadgeProps';

export default function Badge(props: BadgeContainerProps): ReactNode {
  const onClick = useCallback(() => executeAction(props.onClick), [props.onClick]);
  // ...
}
```

### 3. Display Component

| Aspect              | Pattern A (Ours) | Pattern B (Official) |
| ------------------- | ---------------- | -------------------- |
| **Export**          | Named function   | Arrow function const |
| **createElement**   | Imported         | Not needed           |
| **Props interface** | Custom inline    | Custom inline        |

**Both patterns**: Separate display component in `components/` folder ✅

### 4. package.json

| Aspect             | Pattern A (Ours)  | Pattern B (Official)                   |
| ------------------ | ----------------- | -------------------------------------- |
| **tools version**  | `"^10.18.0"`      | `"*"` (workspace latest)               |
| **React override** | Explicit `18.2.0` | Not in package.json (monorepo handles) |
| **Extra deps**     | None              | `@mendix/widget-plugin-platform`       |
| **config section** | Has `projectPath` | No config section                      |

### 5. Widget XML

| Aspect                 | Pattern A (Ours)      | Pattern B (Official)       |
| ---------------------- | --------------------- | -------------------------- |
| **Structure**          | Essentially identical | Essentially identical      |
| **needsEntityContext** | Explicit `false`      | Not specified              |
| **studioProCategory**  | Not specified         | Specified (`Display`)      |
| **systemProperties**   | Name, TabIndex        | Visibility, Name, TabIndex |

---

## Key Differences Summary

### 🔴 Critical Differences

1. **JSX Transform**: Official uses `"jsx": "react-jsx"` which means NO `createElement` import needed
2. **Export style**: Official uses `default export`, ours uses named export
3. **Action helper**: Official uses `executeAction()` from `@mendix/widget-plugin-platform`
4. **tsconfig approach**: We extend base, they inline everything

### 🟡 Moderate Differences

1. **React overrides**: We have explicit overrides, they rely on monorepo
2. **Return type**: We use `ReactElement`, they use `ReactNode`
3. **Extra dependencies**: They have `@mendix/widget-plugin-platform`

### 🟢 Same

1. Component structure (main + display component)
2. XML property definitions
3. Props typing from `typings/` folder
4. `useCallback` for memoizing handlers
5. `classnames` for CSS class management

---

## Questions to Resolve

1. **Does our `extends` approach work because the base config has different jsx settings?**

   - Need to check what `@mendix/pluggable-widgets-tools/configs/tsconfig.base` contains

2. **Would the official pattern work standalone (not in monorepo)?**

   - The explicit tsconfig suggests it might be more portable
   - But `workspace:*` dependencies suggest monorepo-only

3. **Is `executeAction()` just a convenience wrapper or does it do more?**

   - Our manual `canExecute` check works fine
   - Is there error handling we're missing?

4. **Named vs Default export - does Mendix care?**
   - Both work for sure (ours is proven, theirs is in production)
   - Consistency matters for team conventions

---

## Test Plan

### Phase 1: Verify base config inheritance

```powershell
# Find what tsconfig.base contains
npm pack @mendix/pluggable-widgets-tools
# or check node_modules after install
```

### Phase 2: Test if official pattern works standalone

1. Create a new widget using official pattern (explicit tsconfig)
2. Try to build without monorepo structure
3. See if it works in our environment

### Phase 3: Compare executeAction behavior

1. Create same widget with both action handling approaches
2. Test edge cases (null action, disabled, etc.)
3. Check console for any different behavior

---

## Preliminary Recommendation

**Continue with Pattern A (ours)** for now because:

1. ✅ Proven working
2. ✅ Simpler tsconfig (less to break)
3. ✅ No extra dependencies needed

**Consider adopting from Pattern B:**

1. Maybe `executeAction()` helper if it adds value
2. `studioProCategory` in XML for better Studio Pro organization
3. `systemProperty key="Visibility"` for built-in visibility handling

**Avoid from Pattern B:**

1. Explicit tsconfig - more maintenance, more to break
2. `workspace:*` dependencies - won't work outside monorepo

---

_Analysis Date: December 15, 2025_

---

## ✅ TEST RESULTS (December 15, 2025)

### Pattern B Test: OfficialBadgeTest

- **Build**: ✅ Successful - MPK created
- **Studio Pro Load**: ✅ Widget appears in toolbox
- **Category**: ✅ Appears under "Display" (not Add-ons)
- **Icon**: ✅ Has default icon (better than no icon)
- **Runtime**: ✅ Renders and functions correctly

### Key Discovery: `studioProCategory`

The `<studioProCategory>Display</studioProCategory>` tag controls where the widget appears in the Studio Pro toolbox!

---

## 🎨 ICONS & CATEGORIES - COMPLETE REFERENCE

### studioProCategory Values (Known Working)

| Value                | Toolbox Section                |
| -------------------- | ------------------------------ |
| `Display`            | Display section                |
| `Input`              | Input section                  |
| `Structure`          | Structure section (containers) |
| `Menus & navigation` | Menus section                  |
| `Data controls`      | Data controls section          |
| _(omitted)_          | Add-ons (default)              |

### Icon Options

1. **Base64 PNG**: `<icon>iVBORw0KGgo...</icon>` - Embedded PNG data
2. **Omit tag**: Gets default widget icon (the pentagon shape)
3. **Custom icons**: Convert any PNG/SVG to base64

### Creating Custom Icons

```powershell
# Convert PNG to base64 for widget XML
$bytes = [IO.File]::ReadAllBytes("icon.png")
[Convert]::ToBase64String($bytes) | Set-Clipboard
# Paste into <icon> tag
```

### Using FontAwesome/Iconscout

FontAwesome is NOT directly usable in the widget icon - that's for runtime icons.
For toolbox icons, you need a base64-encoded PNG (16x16 or 32x32 recommended).

**Workflow for custom icons:**

1. Export icon from FontAwesome/Iconscout as PNG
2. Convert to base64
3. Add to `<icon>` tag in widget XML

### Creating Custom Category (BlueMatrix Tools)

**Finding**: Custom categories (like "BlueMatrix Tools") require a custom Mendix module/extension - not just widget configuration. The `studioProCategory` uses predefined values.

**Workaround**: Use `Add-ons` category and rely on the widget name prefix (e.g., "BM: My Widget")

---

## 🔀 PATTERN RECOMMENDATION: USE UNIFIED PATTERN

Since **both patterns work**, we should adopt the **best of both**:

### Recommended Unified Pattern:

```
✅ FROM PATTERN A (Ours):
- extends tsconfig.base (simpler, less to maintain)
- Named exports (personal preference)
- No extra @mendix/widget-plugin-platform dependency

✅ FROM PATTERN B (Official):
- <studioProCategory> for proper toolbox placement
- <systemProperty key="Visibility" /> for built-in visibility
- Can use "jsx": "react-jsx" if you prefer no createElement
- <helpUrl> for linking to documentation
```

### tsconfig.json - Two Valid Options:

**Option A: Minimal (extends base)**

```json
{
  "extends": "@mendix/pluggable-widgets-tools/configs/tsconfig.base",
  "compilerOptions": { "baseUrl": "./" },
  "include": ["./src", "./typings"]
}
// REQUIRES: import { createElement } from 'react'
```

**Option B: Explicit react-jsx**

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "esnext",
    "target": "es2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "baseUrl": "./"
  },
  "include": ["./src", "./typings"]
}
// NO createElement import needed
```

### Widget XML Template (Best Practices):

```xml
<?xml version="1.0" encoding="utf-8" ?>
<widget id="com.yourcompany.widget.WidgetName"
        pluginWidget="true"
        offlineCapable="true"
        xmlns="http://www.mendix.com/widget/1.0/">
    <name>Widget Name</name>
    <description>What it does</description>
    <studioProCategory>Display</studioProCategory>  <!-- IMPORTANT! -->
    <helpUrl>https://docs.yourcompany.com/widget</helpUrl>
    <icon><!-- base64 PNG --></icon>
    <properties>
        <propertyGroup caption="General">
            <!-- properties here -->
            <propertyGroup caption="Visibility">
                <systemProperty key="Visibility" />  <!-- Built-in visibility -->
            </propertyGroup>
            <propertyGroup caption="Common">
                <systemProperty key="Name" />
                <systemProperty key="TabIndex" />
            </propertyGroup>
        </propertyGroup>
    </properties>
</widget>
```

---

## 🤖 AI DECISION LOGIC

When creating a widget, use this decision tree:

1. **Category**: Ask user what type of widget → map to `studioProCategory`

   - Display/output → `Display`
   - Form input → `Input`
   - Container/layout → `Structure`
   - Navigation → `Menus & navigation`
   - Data list → `Data controls`
   - Utility → _(omit for Add-ons)_

2. **tsconfig approach**:

   - Simple widget → Use extends (Pattern A)
   - Complex/need specific settings → Use explicit (Pattern B)

3. **Icon**:

   - If user has icon → Convert to base64
   - If no icon → Omit tag (gets default)

4. **Action handling**:
   - Simple onClick → Manual canExecute check (Pattern A)
   - Complex actions/need helpers → Consider executeAction (Pattern B)

---
