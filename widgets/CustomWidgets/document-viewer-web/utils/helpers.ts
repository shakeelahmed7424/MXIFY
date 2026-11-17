export function openInNewTab(fileUrl: string | undefined): void {
    if (!fileUrl) {
        return;
    }
    const url = new URL(fileUrl);
    url.searchParams.append("target", "window");

    window.open(url, "mendix_file");
}

export function downloadFile(fileUrl: string | undefined): void {
    if (!fileUrl) {
        return;
    }
    const url = new URL(fileUrl);
    
    const anchor = document.createElement("a");
    anchor.href = url.toString();
    anchor.download = "";
    anchor.style.display = "none";
    
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}
