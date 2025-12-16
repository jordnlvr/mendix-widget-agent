# Mendix Widget Property Patterns - Quick Reference

_Reverse-engineered from Mendix official web-widgets (December 2025)_

## Property Type Cheat Sheet

| Type           | Use For                      | Example              |
| -------------- | ---------------------------- | -------------------- |
| `string`       | Static text input            | Font name, CSS class |
| `boolean`      | Toggle on/off                | Enable feature       |
| `integer`      | Whole numbers                | Page size, height    |
| `decimal`      | Numbers with decimals        | Min/max values       |
| `enumeration`  | Dropdown selection           | Alignment, mode      |
| `textTemplate` | User text with translations  | Labels, captions     |
| `expression`   | Dynamic value from Mendix    | Visibility condition |
| `action`       | Microflow/Nanoflow trigger   | On click, on change  |
| `attribute`    | Entity attribute binding     | Value, name field    |
| `datasource`   | List of entities             | Data grid source     |
| `selection`    | Select items from datasource | Multi-select         |
| `association`  | Reference to related entity  | Link tables          |
| `image`        | Static/dynamic image         | Logo, icon           |
| `icon`         | Mendix icon picker           | Button icon          |
| `widgets`      | Child widget container       | Custom content       |
| `object`       | Repeating property group     | Column definitions   |

---

## Code Templates by Property Type

### STRING

```xml
<property key="myString" type="string" required="false">
    <caption>My String</caption>
    <description>Enter a string value</description>
</property>
```

### BOOLEAN

```xml
<property key="isEnabled" type="boolean" defaultValue="true">
    <caption>Enable feature</caption>
    <description />
</property>
```

### INTEGER

```xml
<property key="pageSize" type="integer" defaultValue="20">
    <caption>Page size</caption>
    <description />
</property>
```

### DECIMAL

```xml
<property key="minValue" type="decimal" defaultValue="0">
    <caption>Minimum value</caption>
    <description />
</property>
```

### ENUMERATION

```xml
<property key="alignment" type="enumeration" defaultValue="left">
    <caption>Alignment</caption>
    <description />
    <enumerationValues>
        <enumerationValue key="left">Left</enumerationValue>
        <enumerationValue key="center">Center</enumerationValue>
        <enumerationValue key="right">Right</enumerationValue>
    </enumerationValues>
</property>
```

### TEXT TEMPLATE

```xml
<property key="buttonLabel" type="textTemplate" required="false">
    <caption>Button text</caption>
    <description />
    <translations>
        <translation lang="en_US">Click me</translation>
        <translation lang="nl_NL">Klik hier</translation>
    </translations>
</property>
```

### EXPRESSION (Boolean)

```xml
<property key="isVisible" type="expression" defaultValue="true" required="false">
    <caption>Visible</caption>
    <description />
    <returnType type="Boolean" />
</property>
```

### EXPRESSION (String)

```xml
<property key="dynamicClass" type="expression" required="false">
    <caption>Dynamic CSS class</caption>
    <description />
    <returnType type="String" />
</property>
```

### ACTION

```xml
<property key="onClick" type="action" required="false">
    <caption>On click</caption>
    <description />
</property>
```

### ACTION with Variables

```xml
<property key="onFilterChange" type="action" required="false">
    <caption>On filter change</caption>
    <description />
    <actionVariables>
        <actionVariable key="filterValue" caption="Filter Value" type="String" />
    </actionVariables>
</property>
```

### ATTRIBUTE

```xml
<property key="valueAttribute" type="attribute">
    <caption>Value</caption>
    <description />
    <attributeTypes>
        <attributeType name="String" />
        <attributeType name="Integer" />
        <attributeType name="Decimal" />
    </attributeTypes>
</property>
```

### DATASOURCE

```xml
<property key="dataSource" type="datasource" isList="true">
    <caption>Data source</caption>
    <description />
</property>
```

### SELECTION

```xml
<property key="itemSelection" type="selection" dataSource="dataSource">
    <caption>Selection</caption>
    <description />
    <selectionTypes>
        <selectionType name="None" />
        <selectionType name="Single" />
        <selectionType name="Multi" />
    </selectionTypes>
</property>
```

### IMAGE

```xml
<property key="imageSource" type="image" required="false">
    <caption>Image</caption>
    <description />
</property>
```

### ICON

```xml
<property key="buttonIcon" type="icon" required="false">
    <caption>Icon</caption>
    <description />
</property>
```

### WIDGETS (Child container)

```xml
<property key="content" type="widgets" required="false">
    <caption>Content</caption>
    <description />
</property>
```

### OBJECT LIST (Repeating group)

```xml
<property key="items" type="object" isList="true">
    <caption>Items</caption>
    <description />
    <properties>
        <propertyGroup caption="Item">
            <property key="label" type="textTemplate">
                <caption>Label</caption>
            </property>
            <property key="action" type="action" required="false">
                <caption>On click</caption>
            </property>
        </propertyGroup>
    </properties>
</property>
```

---

## System Properties

```xml
<!-- Widget name (always include) -->
<systemProperty key="Name" />

<!-- Tab order for keyboard navigation -->
<systemProperty key="TabIndex" />

<!-- Conditional visibility -->
<systemProperty key="Visibility" />

<!-- Editability control -->
<systemProperty key="Editability" />

<!-- Built-in form label -->
<systemProperty key="Label" />
```

---

## Widget Element Attributes

```xml
<widget
    id="com.yourcompany.widget.WidgetName"
    pluginWidget="true"
    offlineCapable="true"
    needsEntityContext="false"
    xmlns="http://www.mendix.com/widget/1.0/"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../node_modules/mendix/custom_widget.xsd">
```

| Attribute            | Required | Purpose                           |
| -------------------- | -------- | --------------------------------- |
| `id`                 | ✅       | Unique widget ID (reverse-domain) |
| `pluginWidget`       | ✅       | Must be `"true"`                  |
| `offlineCapable`     | ✅       | Works offline?                    |
| `needsEntityContext` | ❌       | Needs enclosing data view?        |

---

## Studio Pro Categories

```xml
<studioProCategory>Input elements</studioProCategory>
<studioCategory>Input Elements</studioCategory>
<helpUrl>https://docs.mendix.com/appstore/widgets/your-widget</helpUrl>
```

**Valid categories:**

- Data containers
- Input elements
- Buttons
- Menus & navigation
- Images, videos & files
- Display

---

## Attribute Types Reference

| attributeType | Mendix Type            |
| ------------- | ---------------------- |
| `String`      | Text, unlimited string |
| `Integer`     | Integer                |
| `Long`        | Long                   |
| `Decimal`     | Decimal                |
| `Boolean`     | Boolean                |
| `DateTime`    | Date and time          |
| `Enum`        | Enumeration            |
| `AutoNumber`  | Autonumber             |

---

## Expression Return Types

| returnType | Mendix Type    |
| ---------- | -------------- |
| `Boolean`  | Yes/No         |
| `String`   | Text           |
| `Integer`  | Whole number   |
| `Decimal`  | Decimal number |
| `DateTime` | Date/time      |

---

## Property Group Structure

```xml
<properties>
    <!-- First level = tabs -->
    <propertyGroup caption="General">
        <!-- Second level = collapsible sections -->
        <propertyGroup caption="Data source">
            <!-- Properties here -->
        </propertyGroup>
        <propertyGroup caption="Events">
            <!-- Properties here -->
        </propertyGroup>
    </propertyGroup>
    <propertyGroup caption="Appearance">
        <!-- Second tab -->
    </propertyGroup>
</properties>
```

---

_Source: Mendix web-widgets repo - Datagrid, RichText, PopupMenu, Slider, Image, BadgeButton, Combobox_
