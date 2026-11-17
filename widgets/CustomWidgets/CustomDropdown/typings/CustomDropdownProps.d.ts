/**
 * This file was generated from CustomDropdown.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue, ListExpressionValue } from "mendix";

export interface CustomDropdownContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    contextObjId: EditableValue<string>;
    contextObjLabel: EditableValue<string>;
    paginate: boolean;
    pageSize: number;
    showQrImageUserInput: boolean;
    defaultValue: ListValue;
    objIdDefaultValue: ListAttributeValue<string>;
    firstLabelDefaultValue: ListAttributeValue<string>;
    secondLabelDefaultValue?: ListAttributeValue<string>;
    imgUrlDefaultValue?: ListAttributeValue<string>;
    dynamicClassDefault?: ListExpressionValue<string>;
    options: ListValue;
    objIdOptions?: ListAttributeValue<string>;
    refreshOnContextChange: boolean;
    firstLabelOptions: ListAttributeValue<string>;
    secondLabelOptions?: ListAttributeValue<string>;
    imgUrlOptions?: ListAttributeValue<string>;
    classOptions?: ListExpressionValue<string>;
    selectOption?: ActionValue;
    enableCreate: boolean;
    createValue?: ActionValue;
    onClickAction?: ActionValue;
    enableClear: boolean;
    clearValue?: ActionValue;
    enableSearch: boolean;
    refreshDatasource: boolean;
    onFocus?: ActionValue;
    useDefaultStyle: boolean;
    useAvatar: boolean;
    placeholder: string;
    className: string;
    classNamePrefix: string;
    menuHeight: number;
}

export interface CustomDropdownPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    contextObjId: string;
    contextObjLabel: string;
    paginate: boolean;
    pageSize: number | null;
    showQrImageUserInput: boolean;
    defaultValue: {} | { caption: string } | { type: string } | null;
    objIdDefaultValue: string;
    firstLabelDefaultValue: string;
    secondLabelDefaultValue: string;
    imgUrlDefaultValue: string;
    dynamicClassDefault: string;
    options: {} | { caption: string } | { type: string } | null;
    objIdOptions: string;
    refreshOnContextChange: boolean;
    firstLabelOptions: string;
    secondLabelOptions: string;
    imgUrlOptions: string;
    classOptions: string;
    selectOption: {} | null;
    enableCreate: boolean;
    createValue: {} | null;
    onClickAction: {} | null;
    enableClear: boolean;
    clearValue: {} | null;
    enableSearch: boolean;
    refreshDatasource: boolean;
    onFocus: {} | null;
    useDefaultStyle: boolean;
    useAvatar: boolean;
    placeholder: string;
    className: string;
    classNamePrefix: string;
    menuHeight: number | null;
}
