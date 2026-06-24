import { supabase } from "@/integrations/supabase/client";

const DEFAULT_BUCKET = "documents";
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 10;

export const createStorageBlobUrl = async (
  filePath: string,
  bucket = DEFAULT_BUCKET
) => {
  const { data: blob, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(filePath);

  if (blob && !downloadError) {
    return URL.createObjectURL(blob);
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, DEFAULT_SIGNED_URL_TTL_SECONDS);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw signedUrlError ?? new Error("Geen downloadlink beschikbaar");
  }

  const response = await fetch(signedUrlData.signedUrl);
  if (!response.ok) {
    throw new Error(`Download mislukt (${response.status})`);
  }

  const signedBlob = await response.blob();
  return URL.createObjectURL(signedBlob);
};

const getFilename = (filePath: string) => {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || "document";
};

export const openStorageFileInNewTab = async (filePath: string, bucket = DEFAULT_BUCKET) => {
  const blobUrl = await createStorageBlobUrl(filePath, bucket);
  const filename = getFilename(filePath);

  // Try opening in a new tab first (works in top-level windows).
  const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");

  // In sandboxed iframes (Lovable preview), navigating a popup to a blob: URL
  // from a different origin is blocked. Fall back to an anchor-triggered download.
  if (!newWindow) {
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};