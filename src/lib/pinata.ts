const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
const PINATA_API = 'https://api.pinata.cloud';

interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload a file (image/video) to IPFS via Pinata.
 * Returns the IPFS CID.
 */
export async function uploadToPinata(
  blob: Blob,
  filename: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename);

  // Add metadata for organization in Pinata dashboard
  const metadata = JSON.stringify({
    name: `moment-${Date.now()}`,
    keyvalues: {
      app: 'monad-moments',
      type: blob.type.startsWith('video') ? 'video' : 'photo',
    },
  });
  formData.append('pinataMetadata', metadata);

  const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} — ${errorText}`);
  }

  const data: PinataUploadResponse = await response.json();
  return data.IpfsHash;
}

/**
 * Upload JSON metadata to IPFS via Pinata.
 * This creates the NFT metadata JSON that tokenURI points to.
 */
export async function uploadMetadata(metadata: {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}): Promise<string> {
  const response = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `metadata-${Date.now()}`,
        keyvalues: { app: 'monad-moments', type: 'metadata' },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Metadata upload failed: ${response.status}`);
  }

  const data: PinataUploadResponse = await response.json();
  return data.IpfsHash;
}
