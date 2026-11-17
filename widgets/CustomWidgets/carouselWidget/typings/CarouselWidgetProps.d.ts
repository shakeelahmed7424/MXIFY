/**
 * This file was generated from CarouselWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";

export interface CarouselWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    documentList: ListValue;
    instanceId: ListAttributeValue<string>;
    displayName: ListAttributeValue<string>;
    documentIcon: ListAttributeValue<string>;
    selectedDocumentId?: DynamicValue<string>;
    thumbnailClickAction?: ListActionValue;
}

export interface CarouselWidgetPreviewProps {
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
    documentList: {} | { caption: string } | { type: string } | null;
    instanceId: string;
    displayName: string;
    documentIcon: string;
    selectedDocumentId: string;
    thumbnailClickAction: {} | null;
}
