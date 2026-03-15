'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { MOMENT_NFT_ABI, MOMENT_NFT_ADDRESS, resolveContentURI } from '@/config/contracts';
import { parseAbiItem } from 'viem';

export interface MomentItem {
  tokenId: bigint;
  owner: string;
  dayId: number;
  contentURI: string;
  mediaUrl: string;
  timestamp: number;
  txHash: string;
}

export function useFeed() {
  const publicClient = usePublicClient();
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoments = useCallback(async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch MomentMinted events from the last ~500 blocks (~200 seconds on Monad)
      // For hackathon demo, fetch all events from the beginning
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

      const logs = await publicClient.getLogs({
        address: MOMENT_NFT_ADDRESS,
        event: parseAbiItem(
          'event MomentMinted(address indexed owner, uint256 indexed tokenId, uint32 dayId, string contentURI, uint256 blockTimestamp)'
        ),
        fromBlock,
        toBlock: 'latest',
      });

      const items: MomentItem[] = logs.map((log) => {
        const owner = log.args.owner as string;
        const tokenId = log.args.tokenId as bigint;
        const dayId = Number(log.args.dayId);
        const contentURI = log.args.contentURI as string;
        const blockTimestamp = Number(log.args.blockTimestamp);

        // Resolve the contentURI to a displayable URL
        // The contentURI points to metadata JSON; the image is inside it
        // For fast feed loading, we try to resolve directly
        const mediaUrl = resolveContentURI(contentURI);

        return {
          tokenId,
          owner,
          dayId,
          contentURI,
          mediaUrl,
          timestamp: blockTimestamp,
          txHash: log.transactionHash,
        };
      });

      // Sort by timestamp descending (newest first)
      items.sort((a, b) => b.timestamp - a.timestamp);

      setMoments(items);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [publicClient]);

  // Fetch on mount and expose refetch
  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  return {
    moments,
    loading,
    error,
    refetch: fetchMoments,
    total: moments.length,
  };
}
