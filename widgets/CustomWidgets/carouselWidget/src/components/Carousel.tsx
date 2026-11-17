// Carousel.tsx
import React, { createElement, useEffect, useRef, useState } from "react";
import "../ui/CarouselWidget.css";

interface CarouselItem {
  type:
  | "PDF"
  | "3D"
  | "WORD"
  | "EXCEL"
  | "POWERPOINT"
  | "TXT"
  | "RTF"
  | "HTML"
  | "JPG"
  | "PNG"
  | "BMP"
  | "UNKNOWN";
  title: string;
  icon: string;
}

const Carousel: React.FC<{ documentList: any; instanceId: any; displayName: any; documentIcon: any; selectedDocumentId: any; thumbnailClickAction?: any }> = ({ documentList, displayName, documentIcon, instanceId, selectedDocumentId, thumbnailClickAction }) => {
  // Static icon mapping for all available icons
  const ICON_MAP: Record<string, any> = {
    "type3d48.svg": require("../icons/type3D48.svg"),
    "typepdf48.svg": require("../icons/typePdf48.svg"),
    "typemsword48.svg": require("../icons/typeMsWord48.svg"),
    "typemsexcel48.svg": require("../icons/typeMsExcel48.svg"),
    "typemspowerpoint48.svg": require("../icons/typeMsPowerpoint48.svg"),
    "typetxt48.svg": require("../icons/typeTxt48.svg"),
    "typertf48.svg": require("../icons/typeRTF48.svg"),
    "typehtml48.svg": require("../icons/typeHtml48.svg"),
    "typejpg48.svg": require("../icons/typeJpg48.svg"),
    "typepng48.svg": require("../icons/typePng48.svg"),
    "typebmp48.svg": require("../icons/typeBMP48.svg"),
    "typeunknown48.svg": require("../icons/typeUnknown48.svg"),
  };

  /**
   * Returns the appropriate icon path based on the item type
   * @param iconPath - The document icon path from Mendix
   * @returns The icon file path
   */
  const getDocumentIcon = (iconPath: string): string => {
    // Extract the icon filename from the Mendix path and convert to lowercase
    const filename = iconPath?.replace("/img/DISW_DesignSystem$SVG_Icons$", "").toLowerCase() || "";
    // Look up the icon in the static map
    return ICON_MAP[filename] || ICON_MAP["typeunknown48.svg"];
  };

  // Use documentList items or empty array if not available
  const items: CarouselItem[] = documentList?.items
    ? documentList.items.map((item: any, index: number) => {
      const displayNameValue = displayName?.get(item)?.value || `Item ${index + 1}`;
      const documentIconValue = documentIcon?.get(item)?.value || "UNKNOWN";
      // Determine type from the item or default to UNKNOWN
      const type: CarouselItem["type"] = "UNKNOWN"; // You can add logic to determine type from item properties
      return {
        type,
        title: displayNameValue,
        icon: getDocumentIcon(documentIconValue),
      };
    })
    : [];

  // Carousel dimensions and spacing constants
  const thumbnailWidth = 80; // Width of each thumbnail in pixels
  const gap = 8; // Gap between thumbnails in pixels
  const arrowWidth = 40; // Width of navigation arrow buttons

  // Current scroll position in the carousel (index of first visible item)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Number of items that can fit in the visible area
  const [visibleCount, setVisibleCount] = useState<number>(3);
  // Index of the currently selected/active item
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  // Whether thumbnails should be centered when they don't fill the track
  const [isCentered, setIsCentered] = useState<boolean>(false);

  // Reference to the carousel container element for measuring dimensions
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Effect to calculate and update the number of visible items based on container width
  useEffect(() => {
    /**
     * Calculates how many items can fit in the visible carousel area
     * Measures actual DOM elements to account for CSS-applied dimensions
     */
    const updateVisibleCount = () => {
      // Exit early if container hasn't been rendered yet
      if (!containerRef.current) return;

      // Get references to carousel elements for measurement
      const trackElement = containerRef.current.querySelector<HTMLDivElement>(".carousel-track");
      const firstItem = trackElement?.querySelector<HTMLDivElement>(".carousel-item");
      const containerWidth = containerRef.current.getBoundingClientRect().width;

      // Calculate space available for thumbnails (total width minus arrow buttons and margins)
      const reservedForArrows = 2 * (arrowWidth + 20); // 20px margin on each side
      const availableForTrack = Math.max(0, containerWidth - reservedForArrows);

      // Use default dimensions initially
      let actualThumbnailWidth = thumbnailWidth;
      let actualGap = gap;

      // If items are rendered, measure their actual dimensions from the DOM
      if (firstItem && trackElement) {
        const firstItemRect = firstItem.getBoundingClientRect();
        // Only use measured width if valid (greater than 0)
        if (firstItemRect.width > 0) actualThumbnailWidth = firstItemRect.width;

        // Get the actual gap value from CSS
        const trackStyles = window.getComputedStyle(trackElement);
        const gapValue = trackStyles.getPropertyValue("gap") || "8px";
        const parsedGap = parseFloat(gapValue);
        if (!Number.isNaN(parsedGap)) actualGap = parsedGap;
      }

      // Calculate how many complete items fit in the available space
      const count = Math.floor((availableForTrack + actualGap) / (actualThumbnailWidth + actualGap));
      const finalCount = count > 0 ? count : 1; // Ensure at least 1 item is visible

      // Update visible count and adjust scroll position if needed
      setVisibleCount((prevCount) => {
        if (prevCount !== finalCount) {
          // Adjust currentIndex if it exceeds the new max index
          const newMaxIndex = Math.max(0, items.length - finalCount);
          setCurrentIndex((prevIndex) => Math.min(prevIndex, newMaxIndex));
          return finalCount;
        }
        return prevCount;
      });

      // Determine if items should be centered (when they don't fill the entire track width)
      const visibleItems = Math.min(items.length, finalCount);
      const totalVisibleWidth = visibleItems * (actualThumbnailWidth + actualGap) - actualGap;
      setIsCentered(totalVisibleWidth <= availableForTrack);
    };

    // Initial calculation on mount
    updateVisibleCount();

    // Watch for container size changes using ResizeObserver
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(updateVisibleCount);
      resizeObserver.observe(containerRef.current);
    }

    // Also listen for window resize events as a fallback
    window.addEventListener("resize", updateVisibleCount);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("resize", updateVisibleCount);
      resizeObserver?.disconnect();
    };
  }, [items.length]);

  useEffect(() => {
    // Set active index based on selectedDocumentId by matching instanceId
    const documentId = selectedDocumentId?.value?.toString();

    if (!documentId || !documentList?.items) {
      setActiveIndex(-1);
      return;
    }

    // Find the index of the document with matching instanceId
    const matchingIndex = documentList.items.findIndex((item: any) => {
      const itemInstanceId = instanceId?.get(item)?.value;
      return itemInstanceId && itemInstanceId === documentId;
    });

    if (matchingIndex !== -1) {
      setActiveIndex(matchingIndex);

      // Scroll to make the selected document visible if it's not in the current view
      const isInView = matchingIndex >= currentIndex && matchingIndex < currentIndex + visibleCount;
      if (!isInView) {
        // Calculate the best scroll position to center the selected item
        const newIndex = Math.max(0, Math.min(matchingIndex - Math.floor(visibleCount / 2), items.length - visibleCount));
        setCurrentIndex(newIndex);
      }
    } else {
      setActiveIndex(-1);
    }
  }, [selectedDocumentId, documentList, visibleCount, thumbnailClickAction]);

  /**
   * Handles thumbnail click events
   * Sets the clicked item as active and logs the interaction
   */
  const handleThumbnailClick = (globalIndex: number, item: CarouselItem) => {
    // Prevent action execution if clicking on the already active item
    const isAlreadyActive = globalIndex === activeIndex;

    if (isAlreadyActive) {
      console.log("Item already active, ignoring click:", {
        index: globalIndex,
        identifier: item.title,
      });
      return;
    }

    setActiveIndex(globalIndex);

    console.log("Thumbnail clicked:", {
      index: globalIndex,
      identifier: item.title,
      item,
    });

    if (!thumbnailClickAction) {
      console.warn("Thumbnail Click Action is not defined.");
      return;
    }

    const thumbnailAction = thumbnailClickAction.get?.(documentList.items[globalIndex]);

    if (thumbnailAction?.canExecute) {
      thumbnailAction.execute();
    } else {
      console.warn("Thumbnail action cannot be executed or is not available.");
    }
  };

  // Calculate the maximum scroll position (last page of items)
  const maxIndex = Math.max(0, items.length - visibleCount);
  // Determine if navigation buttons should be enabled
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  /**
   * Navigates to the next slide (scrolls right by one item)
   */
  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex));
    }
  };

  /**
   * Navigates to the previous slide (scrolls left by one item)
   */
  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  };

  /**
   * Returns the subset of items that should be visible based on current scroll position
   */
  const getVisibleItems = (): CarouselItem[] => {
    // Show all items if they fit within the visible area
    if (items.length <= visibleCount) return items;
    // If scrolled past the end, show the last page of items
    if (currentIndex > items.length - visibleCount) {
      return items.slice(items.length - visibleCount);
    }
    // Normal case: show items starting from currentIndex
    return items.slice(currentIndex, currentIndex + visibleCount);
  };

  return (
    <div>
      <div className="carousel-container" ref={containerRef}>
        <div className="carousel-inner">
          <button className="arrow left" onClick={prevSlide} disabled={!canGoPrev}>
            <img src={require("../icons/miscChevronLeft24.svg")} alt="Previous" />
          </button>

          <div className={`carousel-track${isCentered ? " center" : ""}`}>
            {getVisibleItems().map((item, index) => {
              // Calculate the global index (position in full items array) from local index
              const globalIndex =
                items.length <= visibleCount
                  ? index // All items visible: local index equals global index
                  : currentIndex > items.length - visibleCount
                    ? items.length - visibleCount + index // At end: offset from last page
                    : currentIndex + index; // Normal: offset by current scroll position

              // Check if this item matches the selected document
              const itemInstanceId = documentList.items[globalIndex] ? instanceId?.get(documentList.items[globalIndex])?.value : null;
              const selectedId = selectedDocumentId?.value?.toString();
              const isSelected = itemInstanceId && selectedId && itemInstanceId === selectedId;

              return (
                <div
                  key={globalIndex}
                  className={`carousel-item${globalIndex === activeIndex ? " active" : ""}${isSelected ? " selected" : ""}`}
                  onClick={() => handleThumbnailClick(globalIndex, item)}
                  data-id={globalIndex}
                >
                  <img src={item.icon} alt={item.title} className="item-icon" />
                  <p className="item-title" title={item.title}>{item.title}</p>
                </div>
              );
            })}
          </div>

          <button className="arrow right" onClick={nextSlide} disabled={!canGoNext}>
            <img src={require("../icons/miscChevronRight24.svg")} alt="Next" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
