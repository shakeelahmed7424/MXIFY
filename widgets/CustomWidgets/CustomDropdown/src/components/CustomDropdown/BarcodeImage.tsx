import { FunctionComponent, createElement, CSSProperties } from "react";

export interface BarcodeImageProps {
    style?: CSSProperties
    classValue?:string
    onClickHandler?: (isQRImageClicked: boolean) => void;
}

export const BarcodeImage: FunctionComponent<BarcodeImageProps> = ({ style, classValue, onClickHandler }) =>
    <img
        style={style}
        className={classValue}
        role={"button"}
        onMouseDown={() => onClickHandler !== undefined ? onClickHandler(true) : false}
    ></img>