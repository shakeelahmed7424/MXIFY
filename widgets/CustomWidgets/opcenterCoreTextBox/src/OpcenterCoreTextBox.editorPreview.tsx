import { ReactElement, createElement, CSSProperties } from "react";

// import { parseInlineStyle } from "@mendix/pluggable-widgets-tools";

import { InputElement, InputElementProps } from "./components/InputElement";
import { OpcenterCoreTextBoxPreviewProps } from "../typings/OpcenterCoreTextBoxProps";
import { BarcodeImage } from "./components/BarcodeImage";

// function parentInline(node?: HTMLElement | null): void {
//     // Temporary fix, the web modeler add a containing div, to render inline we need to change it.
//     if (node && node.parentElement && node.parentElement.parentElement) {
//         node.parentElement.parentElement.style.display = "inline-block";
//     }
// }

const inputStyle = "form-control";

const imgStyle: CSSProperties = {
    position: "absolute",
    width: "24px",
    height: "24px",
    right: "3px",
    top: "4px",
    cursor: "pointer"
}

function transformProps(props: OpcenterCoreTextBoxPreviewProps): InputElementProps {
    let valueAttributeDisplay = '';
    if (props.valueAttribute !== undefined && props.valueAttribute !== '') {
        const valueAttribute = props.valueAttribute;
        const lastSlashIndex = valueAttribute.lastIndexOf('.');
        valueAttributeDisplay = lastSlashIndex !== -1 ? '.../'+ valueAttribute.substring(lastSlashIndex + 1) : valueAttribute;

    }
    return {
        id: "",
        className: inputStyle,
        inputType: false,
        showQRImage: true,
        clickable: false,
        value: '[' + valueAttributeDisplay + ']',
        ariaRequired: false,
        autoComplete: "off",
        maxLength: 200,
        maxLengthType: "default",
        disabled: props.readOnly
    };
}


export function preview(props: OpcenterCoreTextBoxPreviewProps): ReactElement {
    //var showQR = props.showQrImageUserInput !== undefined ? (/true/i).test(props.showQrImageUserInput) : false;
    return (

        (!props.readOnly && props.readOnlyStyle === "text") || (props.readOnlyStyle === "dataView" || props.readOnlyStyle === "control") ?
            <div>
                <div
                    className="widget-opcoretextbox-holder">
                    <InputElement {...transformProps(props)}></InputElement>
                    {props.showQrImageUserInput ?
                        <BarcodeImage
                            style={imgStyle}
                        ></BarcodeImage> : null
                    }
                </div>
            </div> :
            <div
                className="widget-opcoretextbox-holder">
                <div
                    className="form-control-static">
                    {transformProps(props).value}
                </div>
            </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/OpcenterCoreTextBox.css");
}

