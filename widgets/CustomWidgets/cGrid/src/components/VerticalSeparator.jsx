import { createElement, useState } from "react";

export default function VerticalSeparator() {
    return (
        <div style={{ display: "flex", alignItems: "center", height: "34px" }}>
            <div style={{ backgroundColor: "#DCDCDC", height: "32px", width: "1px", margin: "0 4px" }} />
        </div>
    );
}
