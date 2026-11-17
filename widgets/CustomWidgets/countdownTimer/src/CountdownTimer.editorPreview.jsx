import { createElement } from "react";
import { CountdownTimerComponent } from "./components/CountdownTimerComponent";

export function preview({ sampleText }) {
    return <CountdownTimerComponent sampleText={sampleText} />;
}

export function getPreviewCss() {
    return require("./ui/CountdownTimer.css");
}
