import { OpcenterCoreTextBoxPreviewProps } from "../typings/OpcenterCoreTextBoxProps";
import { hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
import { InputElementProps } from "./components/InputElement";
// import cmdQRCode from "./images/cmdQRCode.svg";

export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[]; // used for customizing object grids
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[]; // used for customizing object grids
};

export type Problem = {
    property?: string; // key of the property, at which the problem exists
    severity?: "error" | "warning" | "deprecation"; // default = "error"
    message: string; // description of the problem
    studioMessage?: string; // studio-specific message, defaults to message
    url?: string; // link with more information about the problem
    studioUrl?: string; // studio-specific link
};

type BaseProps = {
    type: "Image" | "Container" | "RowLayout" | "Text" | "DropZone" | "Selectable" | "Datasource";
    grow?: number; // optionally sets a growth factor if used in a layout (default = 1)
};

type ImageProps = BaseProps & {
    type: "Image";
    document?: string; // svg image
    data?: string; // base64 image
    property?: object; // widget image property object from Values API
    width?: number; // sets a fixed maximum width
    height?: number; // sets a fixed maximum height
};

type ContainerProps = BaseProps & {
    type: "Container" | "RowLayout";
    children: PreviewProps[]; // any other preview element
    borders?: boolean; // sets borders around the layout to visually group its children
    borderRadius?: number; // integer. Can be used to create rounded borders
    backgroundColor?: string; // HTML color, formatted #RRGGBB
    borderWidth?: number; // sets the border width
    padding?: number; // integer. adds padding around the container
};

type RowLayoutProps = ContainerProps & {
    type: "RowLayout";
    columnSize?: "fixed" | "grow"; // default is fixed
};

type TextProps = BaseProps & {
    type: "Text";
    content: string; // text that should be shown
    fontSize?: number; // sets the font size
    fontColor?: string; // HTML color, formatted #RRGGBB
    bold?: boolean;
    italic?: boolean;
};

type DropZoneProps = BaseProps & {
    type: "DropZone";
    property: object; // widgets property object from Values API
    placeholder: string; // text to be shown inside the dropzone when empty
    showDataSourceHeader?: boolean; // true by default. Toggles whether to show a header containing information about the datasource
};

type SelectableProps = BaseProps & {
    type: "Selectable";
    object: object; // object property instance from the Value API
    child: PreviewProps; // any type of preview property to visualize the object instance
};

type DatasourceProps = BaseProps & {
    type: "Datasource";
    property: object | null; // datasource property object from Values API
    child?: PreviewProps; // any type of preview property component (optional)
};

export type PreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;

export function getProperties(
    _values: OpcenterCoreTextBoxPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    // Do the values manipulation here to control the visibility of properties in Studio and Studio Pro conditionally.
    /* Example
    if (values.myProperty === "custom") {
        delete defaultProperties.properties.myOtherProperty;
    }
    */

    if (_values.maxLengthType !== "custom") {
        hidePropertiesIn(defaultProperties, _values, ["customMaxLength"])
    }

    if (_values.selectedAttributeType === "string" || _values.selectedAttributeType === "hashString" || _values.selectedAttributeType === "autoNumber") {
        hidePropertiesIn(defaultProperties, _values, ["validationPropertyForDigit"]);
        if (_values.validationProperty === "none") {
            hidePropertiesIn(defaultProperties, _values, ["validationExpression"])
            hidePropertiesIn(defaultProperties, _values, ["validationMessage"])
        }
        if (_values.validationProperty === "required" || _values.validationProperty === "email") {
            hidePropertiesIn(defaultProperties, _values, ["validationExpression"])
        }
    } else {
        hidePropertiesIn(defaultProperties, _values, ["validationProperty"]);
        if (_values.validationPropertyForDigit === "none") {
            hidePropertiesIn(defaultProperties, _values, ["validationExpression"])
            hidePropertiesIn(defaultProperties, _values, ["validationMessage"])
        }
        if (_values.validationPropertyForDigit === "required" || _values.validationPropertyForDigit === "positiveNumber") {
            hidePropertiesIn(defaultProperties, _values, ["validationExpression"])
        }
    }

    if (_values.submitWhileEditing === "whenLeave") {
        hidePropertiesIn(defaultProperties, _values, ["submitDelay"]);
    }

    if (_values.valueAttribute === "whenLeave") {
        hidePropertiesIn(defaultProperties, _values, ["submitDelay"]);
    }

    if(_values.selectedAttributeType === "autoNumber" || _values.selectedAttributeType === "decimal"
        || _values.selectedAttributeType === "integer" || _values.selectedAttributeType === "long") {
        hidePropertiesIn(defaultProperties, _values, ["showAsPassowrd"]);
    }

    if (_values.selectedAttributeType === "string" || _values.selectedAttributeType === "hashString" || _values.selectedAttributeType === "autoNumber") {
        hidePropertiesIn(defaultProperties, _values, ["decimalMode", "decimalPrecision", "groupDigits"]);
    } else if (_values.selectedAttributeType === "integer" || _values.selectedAttributeType === "long") {
        hidePropertiesIn(defaultProperties, _values, ["decimalMode"]);
        hidePropertiesIn(defaultProperties, _values, ["decimalPrecision"]);
    }

    if (_values.decimalMode === "auto") {
        hidePropertiesIn(defaultProperties, _values, ["decimalPrecision"]);
        const formattingGroup = defaultProperties.find(pg => pg.caption === "General")?.propertyGroups?.find(pg => pg.caption === "Formatting");
        const decimalModeProperty = formattingGroup ? formattingGroup.properties?.find(p => p.key === "decimalMode") : undefined;
        if (decimalModeProperty) {
            decimalModeProperty.description = "Display the complete fractional part of the attribute without trailing zeros. For integer values no decimal point is displayed.";
        }
    } else if (_values.decimalMode === "fixed") {

    }

    return defaultProperties;
}

// export function check(_values: OpcenterCoreTextBoxPreviewProps): Problem[] {
//     const errors: Problem[] = [];
//     // Add errors to the above array to throw errors in Studio and Studio Pro.
//     /* Example
//     if (values.myProperty !== "custom") {
//         errors.push({
//             property: `myProperty`,
//             message: `The value of 'myProperty' is different of 'custom'.`,
//             url: "https://github.com/myrepo/mywidget"
//         });
//     }
//     */
//     return errors;
// }

// export function getPreview(values: OpcenterCoreTextBoxPreviewProps, isDarkMode: boolean, version: number[]): PreviewProps {
//     // Customize your pluggable widget appearance for Studio Pro.


//     return {
//                 type: "Container",
//                 children: []
//             }
// }
const inputStyle = "form-control";

function transformProps(props: OpcenterCoreTextBoxPreviewProps): InputElementProps {
    let valueAttributeDisplay = '';
    if (props.valueAttribute !== undefined && props.valueAttribute !== '') {
        const valueAttribute = props.valueAttribute;
        const lastSlashIndex = valueAttribute.lastIndexOf('.');
        valueAttributeDisplay = lastSlashIndex !== -1 ? '.../' + valueAttribute.substring(lastSlashIndex + 1) : valueAttribute;

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


export function getPreview(props: OpcenterCoreTextBoxPreviewProps/*, isDarkMode: boolean, version: number[]*/): PreviewProps {
    return {
        columnSize: "grow",
        borders: true,
        padding: 6,
        borderRadius: 0,
        backgroundColor: "",
        type: "RowLayout",
        children: [
            {
                type: "Text", 
                content: `${transformProps(props).value}`, 
                fontSize: 9, 
                fontColor: "#2daeeb", 
                bold: false
            }
        ]
    }
};


// export function getCustomCaption(values: OpcenterCoreTextBoxPreviewProps, platform: Platform): string {
//     return "OpcenterCoreTextBox";
// }
