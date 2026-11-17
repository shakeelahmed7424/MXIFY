/**
 * This file was generated from OpcenterCoreTextBox.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { Big } from "big.js";

export type MaxLengthTypeEnum = "default" | "unlimited" | "custom";

export type SelectedAttributeTypeEnum = "string" | "autoNumber" | "decimal" | "integer" | "long" | "hashString";

export type DecimalModeEnum = "fixed" | "auto";

export type ReadOnlyStyleEnum = "dataView" | "control" | "text";

export type ValidationPropertyEnum = "none" | "required" | "email" | "custom";

export type ValidationPropertyForDigitEnum = "none" | "required" | "positiveNumber" | "custom";

export type AutoCompleteEnum = "on" | "off" | "name" | "honorific_prefix" | "given_name" | "additional_name" | "family_name" | "honorific_suffix" | "nickname" | "job_title" | "username" | "new_password" | "current_password" | "company" | "street_address" | "address_line1" | "address_line2" | "address_line3" | "address_level4" | "address_level3" | "address_level2" | "address_level1" | "country" | "country_name" | "postal_code" | "cc_name" | "cc_given_name" | "cc_additional_name" | "cc_family_name" | "cc_number" | "cc_exp" | "cc_exp_month" | "cc_exp_year" | "cc_csc" | "cc_type" | "transaction_currency" | "transaction_amount" | "language" | "bday" | "bday_day" | "bday_month" | "bday_year" | "sex" | "url" | "photo" | "tel" | "tel_country_code" | "tel_national" | "tel_area_code" | "tel_local" | "tel_local_prefix" | "tel_local_suffix" | "tel_extension" | "email" | "impp";

export type SubmitWhileEditingEnum = "whenLeave" | "whileEditing";

export interface OpcenterCoreTextBoxContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    showAsPassowrd: boolean;
    inputMask: string;
    maxLengthType: MaxLengthTypeEnum;
    customMaxLength: number;
    placeholder?: DynamicValue<string>;
    valueAttribute?: EditableValue<string | Big>;
    selectedAttributeType: SelectedAttributeTypeEnum;
    showQrImageUserInput: boolean;
    decimalMode: DecimalModeEnum;
    decimalPrecision: number;
    groupDigits: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    validationProperty: ValidationPropertyEnum;
    validationPropertyForDigit: ValidationPropertyForDigitEnum;
    validationExpression?: DynamicValue<string>;
    validationMessage: string;
    screenReaderCaption?: DynamicValue<string>;
    ariaRequired: boolean;
    autoComplete: AutoCompleteEnum;
    onClickAction?: ActionValue;
    onBarcodeScanAction?: ActionValue;
    onEnterAction?: ActionValue;
    onLeaveAction?: ActionValue;
    onEnterKeyAction?: ActionValue;
    submitWhileEditing: SubmitWhileEditingEnum;
    submitDelay: number;
}

export interface OpcenterCoreTextBoxPreviewProps {
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    showAsPassowrd: boolean;
    inputMask: string;
    maxLengthType: MaxLengthTypeEnum;
    customMaxLength: number | null;
    placeholder: string;
    valueAttribute: string;
    selectedAttributeType: SelectedAttributeTypeEnum;
    showQrImageUserInput: boolean;
    decimalMode: DecimalModeEnum;
    decimalPrecision: number | null;
    groupDigits: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    validationProperty: ValidationPropertyEnum;
    validationPropertyForDigit: ValidationPropertyForDigitEnum;
    validationExpression: string;
    validationMessage: string;
    screenReaderCaption: string;
    ariaRequired: boolean;
    autoComplete: AutoCompleteEnum;
    onClickAction: {} | null;
    onBarcodeScanAction: {} | null;
    onChangeAction: {} | null;
    onEnterAction: {} | null;
    onLeaveAction: {} | null;
    onEnterKeyAction: {} | null;
    submitWhileEditing: SubmitWhileEditingEnum;
    submitDelay: number | null;
}
