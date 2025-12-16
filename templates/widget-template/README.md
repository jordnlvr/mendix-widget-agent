# {{WidgetName}}

A Mendix Pluggable Widget built with React.

## Features

- [Feature 1]
- [Feature 2]
- [Feature 3]

## Usage

1. Download the `.mpk` file from the releases
2. Copy to your Mendix project's `widgets` folder
3. Restart Studio Pro and look for **{{WidgetName}}** in the **{{studioProCategory}}** toolbox category

## Properties

| Property      | Type                | Required | Default | Description                |
| ------------- | ------------------- | -------- | ------- | -------------------------- |
| textValue     | Expression (String) | Yes      | -       | The text to display        |
| styleType     | Enumeration         | No       | primary | Visual style variant       |
| onClickAction | Action              | No       | -       | Action to execute on click |

## Styling

The widget uses CSS custom properties for easy theming:

```css
.widget-{{widgetNameLower}} {
    --{{widgetNameLower}}-primary-color: #264ae5;
    --{{widgetNameLower}}-font-size: 14px;
    --{{widgetNameLower}}-padding: 8px 16px;
}
```

Override these in your app's custom CSS to match your theme.

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
```

### Commands

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Start development mode with hot reload |
| `npm run build`    | Build production widget                |
| `npm run lint`     | Run ESLint                             |
| `npm run lint:fix` | Fix auto-fixable lint issues           |
| `npm test`         | Run tests                              |

### Project Structure

```
{{widgetNameLower}}/
├── src/
│   ├── {{WidgetName}}.tsx          # Main widget component
│   ├── {{WidgetName}}.xml          # Widget definition
│   ├── {{WidgetName}}.editorPreview.tsx  # Studio Pro preview
│   ├── components/
│   │   └── {{WidgetName}}Display.tsx     # Pure display component
│   └── ui/
│       └── {{WidgetName}}.css      # Widget styles
├── typings/
│   └── {{WidgetName}}Props.d.ts    # Auto-generated type definitions
├── package.json
└── tsconfig.json
```

## Compatibility

- Mendix Studio Pro 10.0+
- React 18.2

## License

Apache 2.0

## Author

{{company}} - {{author}}
