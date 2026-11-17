import { ReactElement, createElement } from "react";
import { CarouselWidgetContainerProps } from "../typings/CarouselWidgetProps";

import "./ui/CarouselWidget.css";
import Carousel from "./components/Carousel";

export function CarouselWidget({documentList, displayName,documentIcon,instanceId,selectedDocumentId, thumbnailClickAction }: CarouselWidgetContainerProps): ReactElement {
  return (
    <div className="widget-carousel">
      <Carousel documentList={documentList} displayName={displayName} documentIcon={documentIcon} instanceId={instanceId} selectedDocumentId={selectedDocumentId} thumbnailClickAction={thumbnailClickAction} />
    </div>
  );
}
