// MomentNFT contract ABI — only the functions we use in the frontend
export const MOMENT_NFT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'contentURI', type: 'string' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'canMintToday',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'getDayId',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint32' }],
  },
  {
    name: 'MomentMinted',
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'dayId', type: 'uint32', indexed: false },
      { name: 'contentURI', type: 'string', indexed: false },
      { name: 'blockTimestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

export const MOMENT_NFT_DEPLOY_BLOCK = 19051903;

export const MOMENT_NFT_ADDRESS = (process.env.NEXT_PUBLIC_MOMENT_NFT_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

if (
  process.env.NODE_ENV === 'development' &&
  MOMENT_NFT_ADDRESS === '0x0000000000000000000000000000000000000000'
) {
  console.warn(
    '[Monad Moments] NEXT_PUBLIC_MOMENT_NFT_ADDRESS is not set — deploy the contract first (Block 1)'
  );
}

// Pinata dedicated gateway (CORS-safe); falls back to a public gateway
const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN || '';

// Resolve any contentURI to an HTTPS URL for display
export function resolveContentURI(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    const tokenParam = PINATA_GATEWAY_TOKEN
      ? `?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`
      : '';
    return `https://${IPFS_GATEWAY}/ipfs/${cid}${tokenParam}`;
  }
  if (uri.startsWith('ar://')) {
    return `https://arweave.net/${uri.replace('ar://', '')}`;
  }
  return uri;
}

// Monad Blitz Rio event config (hackathon badge)
export const HACKATHON_EVENT = {
  name: 'Monad Blitz Rio de Janeiro',
  emoji: '🎪',
  // R. Santa Cristina, 15 - Santa Teresa, Rio de Janeiro - RJ, 20241-250
  // 2026-03-15 (UTC-3 → ends at 03:00 UTC on Mar 16)
  startTime: Math.floor(new Date('2026-03-15T00:00:00Z').getTime() / 1000),
  endTime: Math.floor(new Date('2026-03-16T03:00:00Z').getTime() / 1000),
};
