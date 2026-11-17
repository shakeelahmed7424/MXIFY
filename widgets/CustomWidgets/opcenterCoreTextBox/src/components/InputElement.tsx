import { ReactElement, CSSProperties, createElement, ChangeEvent, useState, useEffect, Ref } from "react";
import { DecimalModeEnum, MaxLengthTypeEnum, SelectedAttributeTypeEnum } from "typings/OpcenterCoreTextBoxProps";
import classNames from "classnames";
import InputMaskElement from "./InputMaskElement";
import Big from "big.js";

export interface InputElementProps {
    id: string;
    ref?: Ref<HTMLInputElement>;
    inputRef?: React.MutableRefObject<HTMLInputElement | undefined>
    className?: string;
    inputType: boolean;
    style?: CSSProperties;
    value?: string;
    showQRImage: boolean;
    isInputQRImageClick?: boolean;
    isValueChangedByScan?: boolean;
    inputMask?: string;
    placeHolderInput?: string;
    clickable?: boolean;
    tabIndex?: number;
    maxLengthType: MaxLengthTypeEnum;
    ariaRequired: boolean;
    ariaLabel?: string
    autoComplete: string;
    maxLength: number;
    attributeType?: SelectedAttributeTypeEnum;
    decimalMode?: DecimalModeEnum;
    decimalPrecision?: number;
    groupDigits?: boolean;
    onEnter?: (showQRImage: boolean) => void;
    onChange?: (value: string | Big) => void;
    onLeave?: (value: string | Big, changed: boolean, 
        showQRImage: boolean, isValueInvalid: boolean) => void;
    applyChange?: (value: string | Big) => void;
    onEnterKeyPress?: (value: string | Big, changed: boolean, isValueInvalid: boolean) => void;
    getRef?: (node: HTMLElement) => void;
    disabled?: boolean;
    hasError?: boolean;
    required?: boolean;
}

interface InputElementState {
    editedValue?: string;
    hasError?: boolean;
    isFocused?: boolean;
}

export function InputElement(props: InputElementProps): ReactElement {
    const { onLeave, value, placeHolderInput, tabIndex, ariaRequired, showQRImage, maxLengthType, inputMask,
        disabled, onEnter, onEnterKeyPress} = props;

    useEffect(() => {
        if (!props.isValueChangedByScan) {
            // Remove the 'opcore-input-active' class from all input elements
            document.querySelectorAll('input.opcore-input-active').forEach((element) => {
                element.classList.remove('opcore-input-active');
            });
        }
    }, [props.isInputQRImageClick]);
    const inputActiveClass = props.isInputQRImageClick || props.isValueChangedByScan ? "opcore-input-active" : "";
    const inputClass = showQRImage ? "widget-opcoretextbox-padding-right" : "";
    const classNamesInp = classNames("form-control", inputClass);
    const maxLengthInput = getMaxLength();
    const userInputMask = inputMask !== undefined && inputMask.trim() !== '' ? inputMask : ''

    const [state, setState] = useState<InputElementState>({
        editedValue: undefined, isFocused: false, hasError: props.hasError
    });

    useEffect(() =>
        setState((prevState) => ({ ...prevState, editedValue: undefined }))
        , [value]);

    function getCurrentValue(): string | Big {
        return state.editedValue !== undefined ? state.editedValue : value !== undefined ? value : '';
    }

    function getCurrentDisplayValue(): string | Big {
        let currentValue = getCurrentValue().toString();

        if (props.attributeType === "decimal") {
            return getFormattedDecimalString(currentValue, props.applyChange !== undefined, state.isFocused ?? false);
        } else if (props.attributeType === "integer") {
            return getFormattedIntegerString(currentValue, state.isFocused ?? false);
        } else if (props.attributeType === "long") {
            return getFormattedLongString(currentValue, state.isFocused ?? false);
        }

        return currentValue;
    }

    const getValueByAttributeType = (value: string): { isValid: boolean, parsedValue?: string | Big, parsedValueBig?: Big } => {
        if (props.attributeType === "decimal") {
            if (value === '') {
                return { isValid: true, parsedValue: '' };
            }
            let decimalValue: Big;
            try {
                decimalValue = new Big(value);
            } catch (error) {
                return { isValid: false, parsedValue: value };
            }
            let decimalValueParsed;
            let decimalMode = props.decimalMode;
            let decimalPrecision = props.decimalPrecision;

            if (decimalMode === "fixed") {
                if (decimalPrecision !== undefined && decimalPrecision !== null) {
                    // Find the number of digits before the decimal point
                    const integerPart = value.split(".")[0];
                    const digitsBeforeDecimal = parseInt(integerPart) <= 0 ? integerPart.length - 1 : integerPart.length;
                    decimalValueParsed = decimalValue.toPrecision(decimalPrecision + digitsBeforeDecimal);
                }
            }
            else if (decimalMode === "auto") {
                decimalValueParsed = decimalValue.toString();
            }
            return { isValid: true, parsedValue: new Big(decimalValueParsed ?? ''), parsedValueBig: decimalValue };
        }
        else if (props.attributeType === "integer") {
            if (value === '') {
                return { isValid: true, parsedValue: '' };
            }
            const integerRegex = /^-?\d{1,10}$/;
            if (!integerRegex.test(value)) {
                return { isValid: false, parsedValue: value };
            }
            return { isValid: true, parsedValue: new Big(value) };
        }
        else if (props.attributeType === "long") {
            if (value === '') {
                return { isValid: true, parsedValue: '' };
            }
            const longRegex = /^-?\d{1,19}$/;
            if (!longRegex.test(value)) {
                return { isValid: false, parsedValue: value };
            }
            return { isValid: true, parsedValue: new Big(value) };
        }

        return { isValid: true, parsedValue: value };
    }

    const getFormattedDecimalString = (value: string,
        applyChangeWhileEditing: boolean, isFocused: boolean): string => {
        if (value === '' || state.hasError) {
            return value;
        }
        const [integerPart, decimalPart] = value.split(".");
        let groupFormattedIntegerPart = '';
        let digitsBeforeDecimal = parseInt(integerPart) <= 0 ? integerPart.length - 1 : integerPart.length;
        let decimalPrecision = props.decimalMode === "fixed" ? props.decimalPrecision : props.decimalMode === "auto" ? decimalPart?.length : undefined;
        if (decimalPrecision  !== undefined) {
            decimalPrecision = parseInt(integerPart) === 0 ? decimalPrecision - countLeadingZeros(decimalPart) : decimalPrecision;
            if(integerPart === '-0' && decimalPrecision > 0)
                decimalPrecision--;
        }
        let formattedDecimal = new Big(`${integerPart ?? 0}.${decimalPart ?? 0}`);
        let formattedDecimalString = formattedDecimal.toPrecision(decimalPrecision ? 
            (decimalPrecision + digitsBeforeDecimal) : undefined);
        let [formattedIntegerPart, formattedDecimalPart] = formattedDecimalString.split(".");
        formattedIntegerPart = integerPart === '-0' ? '-0' : formattedIntegerPart;
        if (applyChangeWhileEditing || (!applyChangeWhileEditing && !isFocused)) {
            if (props.groupDigits && formattedIntegerPart.length > 3) {
                groupFormattedIntegerPart = formattedIntegerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                return formattedDecimalPart ? `${groupFormattedIntegerPart}.${formattedDecimalPart}` : groupFormattedIntegerPart;
            } else {
                return formattedDecimalPart ? `${formattedIntegerPart}.${formattedDecimalPart}` : formattedIntegerPart;
            }
        } else if (isFocused) {
            return decimalPart !== undefined ? `${formattedIntegerPart}.${decimalPart}` : integerPart;
        } else {
            return formattedDecimalPart ? `${formattedIntegerPart}.${formattedDecimalPart}` : formattedIntegerPart;
        }
    }

    const getFormattedIntegerString = (value: string, isFocused: boolean): string => {
        if (state.hasError)
            return value;
        let groupFormattedIntegerPart = '';
        if (props.groupDigits && value.length > 3 && !isFocused) {
            groupFormattedIntegerPart = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            return groupFormattedIntegerPart;
        } else
            return value;
    }

    const getFormattedLongString = (value: string, isFocused: boolean): string => {
        if (state.hasError)
            return value;
        let groupFormattedLongPart = '';
        if (props.groupDigits && value.length > 3 && !isFocused) {
            groupFormattedLongPart = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            return groupFormattedLongPart;
        } else
            return value;
    }

    function countLeadingZeros(value : string | Big): number {
        const str = value.toString();
        let count = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '0') {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    function getMaxLength(): number {
        if (maxLengthType === "default")
            return 200;
        if (maxLengthType === "custom")
            return props.maxLength;
        else
            return 0;
    }

    const onBlur = (): void => {
        let currentValue = getCurrentValue();
        let valueToBeSet = getValueByAttributeType(currentValue.toString());
        if (valueToBeSet.isValid && valueToBeSet.parsedValue !== undefined) {
            onLeave?.(valueToBeSet.parsedValue, valueToBeSet.parsedValue.toString() !== value, false, false);
        }
        else
            onLeave?.(currentValue, false, false, true);

        if (valueToBeSet.isValid)
            setState({
                editedValue: valueToBeSet.isValid ? undefined : valueToBeSet.parsedValue?.toString(),
                isFocused: false, hasError: !valueToBeSet.isValid
            });
    }

    const onEnterHandle = (): void => {
        setState((prevState) => ({ ...prevState, isFocused: true }));
        onEnter?.(true);
    }

    const onEnterKeyPressHandler = (event: React.KeyboardEvent<HTMLInputElement>): void => {  
        event.preventDefault();  
        let currentValue = getCurrentValue();
        let valueToBeSet = getValueByAttributeType(currentValue.toString());
        if (valueToBeSet.isValid && valueToBeSet.parsedValue !== undefined) {
            onEnterKeyPress?.(valueToBeSet.parsedValue, valueToBeSet.parsedValue.toString() !== value, false);
        }
        else
            onEnterKeyPress?.(currentValue, false, true);

    }

    const onChangeHandle = (event: ChangeEvent<HTMLInputElement>, isInputMaskValue: boolean = false, value: string = ''): void => {
        var valueShouldBeSet = false;
        var valueToBeSet = isInputMaskValue ? value : event.currentTarget.value;
        if (maxLengthInput === 0 || valueToBeSet.length <= maxLengthInput)
            valueShouldBeSet = true;

        if (valueShouldBeSet) {
            let { isValid, parsedValue } = getValueByAttributeType(valueToBeSet);
            setState((prevState) => ({ ...prevState, editedValue: valueToBeSet, hasError: !isValid }));
            if (props.applyChange !== undefined) {
                if (isValid && parsedValue !== undefined) {
                    props.applyChange(parsedValue);
                }
            }
        }
    }

    const inputStyle: CSSProperties = {
        width: "100%"
    }

    function getInputClassNames(): string {
        let classNamesResult = props.isInputQRImageClick || props.isValueChangedByScan ? classNames(classNamesInp, inputActiveClass) : classNamesInp;
        setTimeout(() => {
            return classNamesResult;
        }, 500);
        return classNamesResult;
    }

    return (
        userInputMask === '' ?
            <input
                ref={node => {
                    if (props.inputRef) {
                        props.inputRef.current = node ?? undefined;
                    }
                }}
                style={inputStyle}
                id={props.id}
                className={getInputClassNames()}
                tabIndex={tabIndex}
                value={getCurrentDisplayValue().toString()}
                type={props.inputType ? "password" : "text"}
                maxLength={maxLengthInput === 0 ? undefined : maxLengthInput}
                onFocus={onEnterHandle}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        onEnterKeyPressHandler(event);
                    }
                }}
                placeholder={placeHolderInput}
                onBlur={onBlur}
                onChange={(event) => onChangeHandle(event)}
                disabled={disabled}
                {...props.ariaLabel ? { "aria-label": props.ariaLabel } : {}}
                {...props.hasError || state.hasError ? { "aria-invalid": true } : {}}
                {...props.ariaRequired ? { "aria-required": true } : {}}
                {...props.required ? { required: true } : {}}
                autoComplete={props.autoComplete.replaceAll("_", "-")}
            /> :
            <InputMaskElement
                ref={props.inputRef}
                key={value}
                id={props.id}
                style={inputStyle}
                className={getInputClassNames()}
                tabIndex={tabIndex}
                showAsPassowrd={props.inputType}
                mask={userInputMask}
                maxLength={maxLengthInput === 0 ? undefined : maxLengthInput}
                value={getCurrentDisplayValue().toString()}
                placeHolderChar="_"
                placeHolderInput={placeHolderInput}
                onChangeHandler={onChangeHandle}
                onEnterKeyPress={(event) => {onEnterKeyPressHandler(event)}}
                onFocus={onEnterHandle}
                onBlur={onBlur}
                disabled={disabled}
                ariaLabel={props.ariaLabel}
                ariaInvalid={props.hasError || state.hasError}
                ariaRequired={ariaRequired}
                required={props.required}
                autoComplete={props.autoComplete.replaceAll("_", "-")}
            ></InputMaskElement>
    );
}

export default InputElement;
