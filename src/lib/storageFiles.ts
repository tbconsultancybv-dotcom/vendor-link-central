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

export const openStorageFileInNewTab = async (filePath: string, bucket = DEFAULT_BUCKET) => {
  const popup = window.open("about:blank", "_blank");

  try {
    const blobUrl = await createStorageBlobUrl(filePath, bucket);

    if (popup) {
      popup.opener = null;
      popup.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch (error) {
    popup?.close();
    throw error;
  }
};