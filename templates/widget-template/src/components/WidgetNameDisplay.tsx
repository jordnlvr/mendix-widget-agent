import { CSSProperties, KeyboardEvent, ReactElement } from "react";
import classNames from "classnames";

export interface {{WidgetName}}DisplayProps {
    value: string;
    styleType: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
    onClick?: () => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
    className?: string;
    style?: CSSProperties;
    tabIndex?: number;
}

export function {{WidgetName}}Display(props: {{WidgetName}}DisplayProps): ReactElement {
    const { value, styleType, onClick, onKeyDown, className, style, tabIndex } = props;

    return (
        <div
            role={onClick ? "button" : undefined}
            className={classNames(
                "widget-{{widgetNameLower}}",
                `widget-{{widgetNameLower}}--${styleType}`,
                { "widget-{{widgetNameLower}}--clickable": !!onClick },
                className
            )}
            onClick={onClick}
            onKeyDown={onKeyDown}
            style={style}
            tabIndex={tabIndex}
        >
            <span className="widget-{{widgetNameLower}}__label">{value}</span>
        </div>
    );
}
