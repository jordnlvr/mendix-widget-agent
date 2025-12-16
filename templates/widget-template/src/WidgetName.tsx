import { ReactNode, useCallback, KeyboardEvent } from "react";

import { {{WidgetName}}ContainerProps } from "../typings/{{WidgetName}}Props";
import { {{WidgetName}}Display } from "./components/{{WidgetName}}Display";

import "./ui/{{WidgetName}}.css";

export default function {{WidgetName}}(props: {{WidgetName}}ContainerProps): ReactNode {
    const onClick = useCallback(() => {
        if (props.onClick?.canExecute) {
            props.onClick.execute();
        }
    }, [props.onClick]);

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
            }
        },
        [onClick]
    );

    const clickable = props.onClick?.canExecute ?? false;

    return (
        <{{WidgetName}}Display
            value={props.textValue?.value ?? "{{defaultText}}"}
            styleType={props.styleType}
            onClick={clickable ? onClick : undefined}
            onKeyDown={clickable ? onKeyDown : undefined}
            className={props.class}
            style={props.style}
            tabIndex={clickable ? (props.tabIndex ?? 0) : undefined}
        />
    );
}
