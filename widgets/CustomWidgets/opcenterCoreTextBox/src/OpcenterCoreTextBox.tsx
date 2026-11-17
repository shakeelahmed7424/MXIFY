import { ReactElement, createElement, useEffect, useState, useRef } from "react";
import { OpcenterCoreTextBoxContainerProps } from "../typings/OpcenterCoreTextBoxProps";
import { InputElement } from "./components/InputElement";
import { BarcodeImage } from "./components/BarcodeImage";
import "./ui/OpcenterCoreTextBox.css";
import { Alert } from "./components/Alert";

interface OpcenterCoreTextBoxExtendedProps {
    showInputQRImage?: boolean;
    isInputQRImageClick?: boolean;
    isValueChangeByScan?: boolean;
}

var isFocusFromQRImage: boolean = false;

export function OpcenterCoreTextBox(props: OpcenterCoreTextBoxContainerProps): ReactElement {
    const { valueAttribute, showAsPassowrd, placeholder, showQrImageUserInput, inputMask, readOnlyStyle,
        onClickAction, onBarcodeScanAction, submitDelay,
        onEnterAction, tabIndex, onEnterKeyAction, onLeaveAction } = props;

    const validationFeedback = props.valueAttribute?.validation;
    const required = props.validationProperty === "required" || props.validationPropertyForDigit === "required";
    const submitDelayValue = submitDelay ? submitDelay >= 0 ? submitDelay : 0 : 0;
    const inputRef = useRef<HTMLInputElement>();

    const [state, setState] =
        useState<OpcenterCoreTextBoxExtendedProps>({
            showInputQRImage: false,
            isInputQRImageClick: false, isValueChangeByScan: false
        });

    // useEffect(() => {
    //     checkValidators();
    // }, []);

    useEffect(() => {
        CheckIfAttributeValueChangedByScan();
        checkValidators();
    }, [valueAttribute?.value]);

    const checkValidators = () => {
        if (props.validationProperty === "required" || props.validationPropertyForDigit === "required") {
            props.valueAttribute?.setValidator(requiredvalidator);
        }
        else if (props.validationProperty === "email") {
            props.valueAttribute?.setValidator(emailvalidator);
        }
        else if (props.validationProperty === "custom" || props.validationPropertyForDigit === "custom") {
            props.valueAttribute?.setValidator(customValidator);
        }
        else if (props.validationPropertyForDigit === "positiveNumber") {
            props.valueAttribute?.setValidator(positiveNumberValidator);
        }
        else
            props.valueAttribute?.setValidator(undefined);
    }

    function CheckIfAttributeValueChangedByScan(): void {
        if (state.isInputQRImageClick) {
            if (onClickAction) {
                var attributeValue = valueAttribute?.value !== undefined ? valueAttribute.displayValue : '';
                if (attributeValue !== '') {
                    setTimeout(() => {
                        onBarcodeScanActionExecute();
                    }, 500);
                    setTimeout(() => {
                        focusNextElement();
                    }, 1000);
                    //focusNextElement(1500);
                    if (onLeaveAction && onLeaveAction.canExecute) {
                        onLeaveAction.execute();
                    }
                }
            }
            setState((prevState) => ({ ...prevState, isInputQRImageClick: false, isValueChangeByScan: true }));
        }
        else {
            setState((prevState) => ({ ...prevState, isValueChangeByScan: false }));
        }
    }

    function onBarcodeScanActionExecute(): void {
        if (onBarcodeScanAction && onBarcodeScanAction.canExecute) {
            onBarcodeScanAction.execute();
        }
    }

    const onClickHandler = (isQRImageClicked: boolean) => {
        if (onClickAction && onClickAction.canExecute) {
            onClickAction.execute();
        }
        setState((prevState) => ({ ...prevState, isInputQRImageClick: isQRImageClicked }));
    }

    const onEnterHandler = (showQRImage: boolean) => {
        if (!isFocusFromQRImage && onEnterAction && onEnterAction.canExecute) {
            onEnterAction.execute();
        }
        isFocusFromQRImage = false;
        setState((prevState) => ({
            ...prevState,
            showInputQRImage: showQRImage, isInputQRImageClick: false
        }));
    }

    const onEnterKeyPressHandler =  (value: string | Big, isChanged: boolean, isValueInvalid: boolean = false) => {
        if (!isValueInvalid) {
                
            if (isChanged) {
                    applyChange(value);
            }
        }
        if (onEnterKeyAction && onEnterKeyAction.canExecute) {
            onEnterKeyAction.execute();
        }
    }

    const onLeaveHandler = (value: string | Big, isChanged: boolean, showQRImage: boolean, isValueInvalid: boolean = false) => {
        if (!isValueInvalid) {
            if (!state.isInputQRImageClick && onLeaveAction && onLeaveAction.canExecute) {
                onLeaveAction.execute();
            }

            if (isChanged) {
                if ((!state.isInputQRImageClick) || (state.isInputQRImageClick && !onClickAction))
                    applyChange(value);
            }

            if (state.isInputQRImageClick && !onClickAction) {
                focusCurrentElement();
            }
            else {
                setState((prevState) => ({ ...prevState, showInputQRImage: showQRImage }));
            }
        }
        else
            setState((prevState) => ({ ...prevState, showInputQRImage: showQRImage }));

    };

    const applyChange = (value: string | Big) => {

        if (!props.valueAttribute?.readOnly && props.valueAttribute?.status === "available") {
            if (value === '' && (props.selectedAttributeType === "integer"
                || props.selectedAttributeType === "decimal" || props.selectedAttributeType === "long")) {
                props.valueAttribute.setValue(undefined);
            } else
                props.valueAttribute.setValue(value);
        }
    }

    const applyChangeWhileEditing = (value: string | Big) => {
        setTimeout(
            () => applyChange(value),
            submitDelayValue
        );
    }

    const requiredvalidator = (value: string | undefined): string | undefined => {
        const { validationMessage } = props;

        if (validationMessage && !value) {
            return validationMessage;
        }
    }

    const emailvalidator = (value: string | undefined): string | undefined => {
        const { validationMessage } = props;

        if (value !== undefined && value !== '') {
            let matchResult = value.match(/[A-Za-z0-9!#$%&''*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&''*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?/);

            if (matchResult === null) {
                if (validationMessage) {
                    return validationMessage;
                }
            }
        }
    }

    const positiveNumberValidator = (value: string | undefined): string | undefined => {
        const { validationMessage } = props;

        if (value !== undefined && value !== '') {
            let matchResult = value.toString().match(/^(?!0(\.0+)?$)\d*\.?\d+$/);

            if (matchResult === null) {
                if (validationMessage) {
                    return validationMessage;
                }
            }
        }
    }

    const customValidator = (value: string | undefined): string | undefined => {
        const { validationMessage, validationExpression } = props;

        if (validationExpression?.value && value !== undefined && value !== '') {
            let matchResult = value.toString().match(validationExpression.value);

            if (matchResult === null) {
                if (validationMessage) {
                    return validationMessage;
                }
            }
        }
    }

    const focusCurrentElement = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    const focusNextElement = (timeout: number = 0) => {

        // if (document.activeElement instanceof HTMLElement) {
        //     document.activeElement.blur();
        // }

        if (inputRef.current) {
            let currentElement = inputRef.current as HTMLElement | null;

            // Traverse up to the parent element
            while (currentElement) {
                let nextElement = currentElement.nextElementSibling as HTMLElement | null;

                // Traverse down to find the next focusable element
                while (nextElement) {
                    const focusableElement = findFocusableElement(nextElement);
                    if (focusableElement) {
                        //focusableElement.focus();
                        setTimeout(() => {
                            focusableElement.focus();
                        }, timeout);
                        return;
                    }
                    nextElement = nextElement.nextElementSibling as HTMLElement | null;
                }

                currentElement = currentElement.parentElement as HTMLElement | null;
            }
        }
    };

    const findFocusableElement = (element: HTMLElement): HTMLElement | null => {
        if (isFocusable(element)) {
            return element;
        }

        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            const focusableChild = findFocusableElement(children[i] as HTMLElement);
            if (focusableChild) {
                return focusableChild;
            }
        }

        return null;
    };

    const isFocusable = (element: HTMLElement): boolean => {
        const focusableElements = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'];
        return (
            focusableElements.includes(element.tagName) ||
            element.tabIndex >= 0
        );
    };

    return (
        (!props.valueAttribute?.readOnly && readOnlyStyle === "text") || (readOnlyStyle === "dataView" || readOnlyStyle === "control") ?
            <div>
                <div
                    className="widget-opcoretextbox-holder">
                    <InputElement
                        inputRef={inputRef}
                        id={props.id}
                        inputType={showAsPassowrd}
                        placeHolderInput={placeholder?.value}
                        inputMask={inputMask}
                        tabIndex={tabIndex}
                        maxLengthType={props.maxLengthType}
                        maxLength={props.customMaxLength}
                        ariaRequired={props.ariaRequired}
                        ariaLabel={props.screenReaderCaption?.value}
                        autoComplete={props.autoComplete}
                        showQRImage={showQrImageUserInput !== undefined && showQrImageUserInput ? !!state.showInputQRImage : false}
                        isInputQRImageClick={state.isInputQRImageClick}
                        isValueChangedByScan={state.isValueChangeByScan}
                        attributeType={props.selectedAttributeType}
                        decimalMode={props.decimalMode}
                        decimalPrecision={props.decimalPrecision}
                        groupDigits={props.groupDigits}
                        onEnter={onEnterHandler}
                        onLeave={onLeaveHandler}
                        onEnterKeyPress={onEnterKeyPressHandler}
                        onChange={props.valueAttribute?.setValue}
                        applyChange={props.submitWhileEditing === "whileEditing" ? applyChangeWhileEditing : undefined}
                        value={valueAttribute ? valueAttribute.displayValue : ""}
                        disabled={props.valueAttribute?.readOnly}
                        hasError={!!validationFeedback}
                        required={required}
                    />
                    {showQrImageUserInput !== undefined && showQrImageUserInput && !!state.showInputQRImage ?
                        <BarcodeImage
                            onClickHandler={onClickHandler}
                        ></BarcodeImage> : null
                    }
                    <Alert id={props.id} message={validationFeedback} bootstrapStyle="danger" className={"mx-validation-message"}></Alert>
                </div>
            </div> :
            <div
                className="widget-opcoretextbox-holder">
                <div
                    className="form-control-static">
                    {valueAttribute ? valueAttribute.displayValue : " "}
                </div>
            </div>
    );
}
