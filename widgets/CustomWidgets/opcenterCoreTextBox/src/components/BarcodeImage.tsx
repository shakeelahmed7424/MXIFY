import { FunctionComponent, createElement, CSSProperties } from "react";
import cmdQRCode from "../images/cmdQRCode.svg";


export interface BarcodeImageProps {
    style?: CSSProperties
    onClickHandler?: (isQRImageClicked: boolean) => void;
}
export const BarcodeImage: FunctionComponent<BarcodeImageProps> = ({ style, onClickHandler }) =>

    <img
        style={style}
        className="opcore-qr-image"
        role={"button"}
        src={cmdQRCode}
        onMouseDown={() => onClickHandler !== undefined ? onClickHandler(true) : false}
    ></img>

