import { createElement } from "react";
import DataCollectionGrid from "./components/DataCollectionGrid";

export function preview({}) {
    return <DataCollectionGrid DyanmicText={""} dataList={[]} />;
}

export function getPreviewCss() {
    return require("./ui/CGrid.css");
}
