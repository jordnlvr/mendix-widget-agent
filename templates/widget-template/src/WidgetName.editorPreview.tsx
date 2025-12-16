import { ReactElement } from "react";

import { {{WidgetName}}PreviewProps } from "../typings/{{WidgetName}}Props";
import { {{WidgetName}}Display } from "./components/{{WidgetName}}Display";

export function preview(props: {{WidgetName}}PreviewProps): ReactElement {
    return (
        <{{WidgetName}}Display
            value={props.textValue ?? "[{{WidgetName}}]"}
            styleType={props.styleType ?? "primary"}
            className={props.className}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/{{WidgetName}}.css");
}
