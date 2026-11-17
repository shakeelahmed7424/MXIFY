/**
 * This file was generated from CustomTreeViewWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue, ListReferenceSetValue, WebImage } from "mendix";

export interface CustomTreeViewWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    items: ListValue;
    displayName: ListAttributeValue<string>;
    hasChild: ListAttributeValue<boolean>;
    children: ListReferenceSetValue;
    parentIcon?: DynamicValue<WebImage>;
    childIcon?: DynamicValue<WebImage>;
    onClick?: ListActionValue;
}

export interface CustomTreeViewWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    items: {} | { caption: string } | { type: string } | null;
    displayName: string;
    hasChild: string;
    children: string;
    parentIcon: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    childIcon: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    onClick: {} | null;
}
