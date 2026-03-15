import type { MetadataPayload } from '@/lib/pinata';

const PINATA_API = 'https://api.pinata.cloud';
const PINATA_JWT = process.env.PINATA_JWT || '';

interface PinataUploadResponse {
  IpfsHash: string;
}

function getAuthHeaders(contentType?: string): HeadersInit {
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT is not configured');
  }

  return {
    ...(contentType ? { 'Content-Type': contentType } : {}),
    Authorization: `Bearer ${PINATA_JWT}`,
  };
}

export async function uploadFileToPinata(
  file: Blob,
  filename: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, filename);
  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: `moment-${Date.now()}`,
      keyvalues: {
        app: 'monad-moments',
        type: file.type.startsWith('video') ? 'video' : 'photo',
      },
    })
  );

  const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata file upload failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as PinataUploadResponse;
  return data.IpfsHash;
}

export async function uploadMetadataToPinata(
  metadata: MetadataPayload
): Promise<string> {
  const response = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: getAuthHeaders('application/json'),
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `metadata-${Date.now()}`,
        keyvalues: { app: 'monad-moments', type: 'metadata' },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata metadata upload failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as PinataUploadResponse;
  return data.IpfsHash;
}
