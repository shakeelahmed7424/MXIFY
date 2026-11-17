import React, { createElement } from "react";

export default function BarcodeImage({triggerAction , cssClass}) {

    let qrImageClass = "opcore-qr-image";
    if (cssClass) {
        qrImageClass = `${qrImageClass} ${cssClass}`;
    }
    return (
        <img className={qrImageClass} role="button" src="./img/cmdQRCode.svg" alt="QR Code" onMouseDown={triggerAction} />
    );
}
