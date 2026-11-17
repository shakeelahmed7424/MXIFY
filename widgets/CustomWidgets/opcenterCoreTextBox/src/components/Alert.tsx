import { ReactElement, createElement } from "react";
import classNames from "classnames";

export interface AlertProps {
    id?: string;
    message?: string;
    className?: string;
    bootstrapStyle: "default" | "primary" | "success" | "info" | "inverse" | "warning" | "danger";
}

export function Alert({ id, message, className, bootstrapStyle }: AlertProps): ReactElement | null {
    return message ? <div id={`${id}-error`} role="alert" className={classNames(`alert alert-${bootstrapStyle}`, className)}>{message}</div> : null;
}
