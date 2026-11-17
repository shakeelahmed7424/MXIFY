import { ReactElement, createElement } from "react";
import { CarouselWidgetPreviewProps } from "../typings/CarouselWidgetProps";
import Carousel from "./components/Carousel";

export function preview({ instanceId, documentList, displayName, documentIcon, selectedDocumentId, thumbnailClickAction }: CarouselWidgetPreviewProps): ReactElement {
  return (
    <div className="widget-carousel">
      <h2>File Carousel</h2>
      <Carousel instanceId={instanceId} documentList={documentList} displayName={displayName} documentIcon={documentIcon} selectedDocumentId={selectedDocumentId} thumbnailClickAction={thumbnailClickAction} />
    </div>
  );
}

export function getPreviewCss(): string {
  return require("./ui/CarouselWidget.css");
}
