import React, { createElement, useState, useRef, CSSProperties, ChangeEvent } from 'react';

export interface InputMaskProps {
    ref?: React.MutableRefObject<HTMLInputElement | undefined>
    id: string;
    className?: string;
    style?: CSSProperties;
    showAsPassowrd?: boolean;
    inputMask?: string;
    mask?: string;
    placeHolderChar?: string;
    placeHolderInput?: string;
    tabIndex?: number;
    value?: string;
    onChangeHandler?: (event: ChangeEvent<HTMLInputElement>, inInputMaskValue: boolean, value: string) => void;
    onEnterKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
    onFocus:() => void;
    onBlur: () => void;
    ariaRequired: boolean;
    ariaLabel?: string
    ariaInvalid?: boolean;
    autoComplete: string;
    maxLength?: number;
    disabled?: boolean;
    hasError?: boolean;
    required?: boolean;
}

var placeHolder = '';

const CustomInputMask = (props: InputMaskProps) => {
    const mask = props.mask ?? '';
    const placeholderChar = props.placeHolderChar ?? '_';
    placeHolder = props.placeHolderInput ?? '';
    
    const [value, setValue] = useState(props.value ?? '');
    const inputRef = useRef<HTMLInputElement>(null);

    const maskRules: { [key: string]: RegExp } = {
        '9': /\d/,
        'Z': /[A-Za-z]/,
        'U': /[A-Z]/,
        'L': /[a-z]/,
        '*': /[A-Za-z0-9]/
    };


    const cleanValue = (input: string) => {
        return input.replace(/[^0-9a-zA-Z]/g, '');
    }

    const applyMask = (input: string) => {
        let cleanInput = cleanValue(input);
        let maskedValue = '';
        let inputIndex = 0;

        for (let i = 0; i < mask.length; i++) {
            const maskChar = mask[i];

            if (maskRules[maskChar]) {
                if (inputIndex < cleanInput.length && maskRules[maskChar].test(cleanInput[inputIndex])) {
                    maskedValue += cleanInput[inputIndex];
                    inputIndex++;
                } else {
                    maskedValue += placeholderChar;
                }
            } else {
                maskedValue += maskChar;
                if (cleanInput[inputIndex] === maskChar) {
                    inputIndex++;
                }
            }
        }

        return maskedValue;
    };


    const getNextCursorPosition = (cursorPosition: number, maskedValue: string) => {
        for (let i = cursorPosition; i < maskedValue.length; i++) {
            if (maskedValue[i] !== placeholderChar || maskRules[mask[i]]) {
                return i;
            }
        }
        return maskedValue.length;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value;
        const cursorPosition = event.target.selectionStart ?? 0;
        const maskedValue = applyMask(input);
        setValue(maskedValue);
        props.onChangeHandler?.(event, true, maskedValue);

        const nextCursorPosition = getNextCursorPosition(cursorPosition ?? 0, maskedValue);

        setTimeout(() => {
            inputRef.current?.setSelectionRange(nextCursorPosition, nextCursorPosition);
        }, 0);
    }



    return (

        <input
            ref={node => {
                if (props.ref) {
                    props.ref.current = node ?? undefined;
                }
            }}
            style={props.style}
            id={props.id}
            className={props.className}
            tabIndex={props.tabIndex}
            type={props.showAsPassowrd ? 'password' : 'text'}
            value={value}
            onChange={handleChange}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    props.onEnterKeyPress?.(e);
                }
            }}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            placeholder={placeHolder}
            maxLength={props.maxLength}
            disabled={props.disabled}
            {...props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}}
            {...props.hasError ? { 'aria-invalid': true } : {}}
            {...props.ariaRequired ? { 'aria-required': true } : {}}
            {...props.required ? { required: true } : {}}
            autoComplete={props.autoComplete.replaceAll('_', '-')}
        />
    );
}

export default CustomInputMask;