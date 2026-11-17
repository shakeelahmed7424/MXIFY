import { useCallback } from "react";
import { DocRendererElement, DocumentRendererProps } from "./documentRenderer";
import BaseViewer from "./BaseViewer";
import { openInNewTab } from "../utils/helpers";

const ErrorViewer: DocRendererElement = (props: DocumentRendererProps) => {
    const { file, documentStatus } = props;
    const openInNewTabClick = useCallback(() => {
        openInNewTab(file.value?.uri);
    }, [file]);

    return (
        <BaseViewer
            {...props}
            fileName={file.value?.name || ""}
            CustomControl={
                <>
                    <button
                        onClick={openInNewTabClick}
                        className="icons icon-open-in-new-tab btn btn-icon-only btn-open-in-new-tab"
                        aria-label={"Open in new tab"}
                        title={"Open in new tab"}
                    >
                        <img src={require("../ui/icons/cmdOpenInNewTab16.svg")} alt="" />
                    </button>
                    <a
                        href={file.value?.uri}
                        download
                        className="icons icon-Download btn btn-icon-only"
                        aria-label={"Download"}
                        title={"Download"}
                    ></a>
                </>
            }
        >
            {file.status === "available" ? (
                <div>{documentStatus.message}</div>
            ) : (
                <div className="widget-document-viewer-loading"></div>
            )}
        </BaseViewer>
    );
};

ErrorViewer.contentTypes = [];
ErrorViewer.fileTypes = [];

export default ErrorViewer;
