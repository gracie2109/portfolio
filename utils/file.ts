// utils/downloadFile.ts

export const downloadFile = async (
  url: string,
  filename: string
): Promise<void> => {
  if (!url) return;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob: Blob = await response.blob();
    const objectUrl: string = window.URL.createObjectURL(blob);

    const anchor: HTMLAnchorElement = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();

    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
};