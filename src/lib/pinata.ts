export interface MetadataPayload {
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  name?: string;
  description?: string;
  animation_url?: string;
}

interface UploadResponse {
  cid: string;
}

async function parseUploadResponse(response: Response): Promise<UploadResponse> {
  const data = (await response.json()) as { cid?: string; error?: string };

  if (!response.ok || !data.cid) {
    throw new Error(data.error || 'Pinata upload failed');
  }

  return { cid: data.cid };
}

export async function uploadToPinata(blob: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('filename', filename);

  const response = await fetch('/api/pinata/file', {
    method: 'POST',
    body: formData,
  });

  const data = await parseUploadResponse(response);
  return data.cid;
}

export async function uploadMetadata(metadata: MetadataPayload): Promise<string> {
  const response = await fetch('/api/pinata/metadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  const data = await parseUploadResponse(response);
  return data.cid;
}
