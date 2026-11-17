import { createElement } from "react";
import { StepperComponent } from "./components/StepperComponent";

export function preview({ sampleText }) {
    return <StepperComponent sampleText={sampleText} />;
}

export function getPreviewCss() {
    return require("./ui/Stepper.css");
}
