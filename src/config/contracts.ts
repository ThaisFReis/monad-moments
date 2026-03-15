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

export const MOMENT_NFT_ADDRESS = (process.env.NEXT_PUBLIC_MOMENT_NFT_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Pinata gateway for resolving IPFS URIs
export const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

// Resolve any contentURI to an HTTPS URL for display
export function resolveContentURI(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
  }
  if (uri.startsWith('ar://')) {
    return `https://arweave.net/${uri.replace('ar://', '')}`;
  }
  return uri;
}

// Monad Blitz Rio event config (hackathon badge)
export const HACKATHON_EVENT = {
  name: 'Monad Blitz Rio 2026',
  emoji: '🎪',
  // Set these to your actual event window (UTC timestamps)
  startTime: Math.floor(new Date('2026-03-20T10:00:00Z').getTime() / 1000),
  endTime: Math.floor(new Date('2026-03-22T23:59:59Z').getTime() / 1000),
};
