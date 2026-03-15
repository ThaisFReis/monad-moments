'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePublicClient } from 'wagmi';
import { MOMENT_NFT_ABI, MOMENT_NFT_ADDRESS, resolveContentURI } from '@/config/contracts';

const PAGE_SIZE = 10;

export interface MomentItem {
  tokenId: bigint;
  owner: string;
  dayId: number;
  contentURI: string;
  mediaUrl: string;
  imageUrl: string | null;
  title: string;
  description: string;
  timestamp: number;
  txHash: string | null;
}

// Module-level cache so metadata survives re-renders and refetches
const metadataCache = new Map<string, { imageUrl: string | null; title: string; description: string }>();

async function fetchMetadata(contentURI: string, tokenId: bigint) {
  if (metadataCache.has(contentURI)) return metadataCache.get(contentURI)!;

  try {
    const url = resolveContentURI(contentURI);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const result = {
      imageUrl: data.image ? resolveContentURI(data.image) : null,
      title: data.name || `Moment #${tokenId.toString()}`,
      description: data.description || '',
    };
    metadataCache.set(contentURI, result);
    return result;
  } catch {
    const fallback = { imageUrl: null, title: `Moment #${tokenId.toString()}`, description: '' };
    metadataCache.set(contentURI, fallback);
    return fallback;
  }
}

export function useFeed() {
  const publicClient = usePublicClient();
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<number | null>(null);

  const fetchPage = useCallback(async (startTokenId: number) => {
    if (!publicClient) return [];

    // Token IDs are 0-based: valid range is [0, supply-1]
    // startTokenId is the highest token ID to include in this page
    const endTokenId = Math.max(0, startTokenId - PAGE_SIZE + 1);
    const tokenIds: number[] = [];
    for (let id = startTokenId; id >= endTokenId; id--) {
      tokenIds.push(id);
    }

    if (tokenIds.length === 0) return [];

    // Parallel readContract calls (Monad testnet has no multicall3)
    const readCall = (functionName: 'tokenURI' | 'ownerOf' | 'getDayId', tokenId: bigint) =>
      publicClient.readContract({
        address: MOMENT_NFT_ADDRESS,
        abi: MOMENT_NFT_ABI,
        functionName,
        args: [tokenId],
      }).catch(() => null);

    const baseItems = await Promise.all(
      tokenIds.map(async (id) => {
        const tokenId = BigInt(id);
        const [contentURI, owner, dayId] = await Promise.all([
          readCall('tokenURI', tokenId) as Promise<string | null>,
          readCall('ownerOf', tokenId) as Promise<string | null>,
          readCall('getDayId', tokenId) as Promise<number | null>,
        ]);

        const dayNum = Number(dayId ?? 0);
        return {
          tokenId,
          owner: owner ?? '0x0',
          dayId: dayNum,
          contentURI: contentURI ?? '',
          timestamp: dayNum * 86400,
        };
      })
    );

    // Fetch IPFS metadata in parallel
    const metadataResults = await Promise.all(
      baseItems.map((item) =>
        item.contentURI
          ? fetchMetadata(item.contentURI, item.tokenId)
          : { imageUrl: null, title: `Moment #${item.tokenId.toString()}`, description: '' }
      )
    );

    return baseItems.map((item, i) => ({
      ...item,
      mediaUrl: item.contentURI ? resolveContentURI(item.contentURI) : '',
      imageUrl: metadataResults[i].imageUrl,
      title: metadataResults[i].title,
      description: metadataResults[i].description,
      txHash: null,
    })) as MomentItem[];
  }, [publicClient]);

  const fetchMoments = useCallback(async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setError(null);

      const supply = await publicClient.readContract({
        address: MOMENT_NFT_ADDRESS,
        abi: MOMENT_NFT_ABI,
        functionName: 'totalSupply',
      }) as bigint;

      const supplyNum = Number(supply);
      setTotal(supplyNum);

      if (supplyNum === 0) {
        setMoments([]);
        cursorRef.current = null;
        setHasMore(false);
        return;
      }

      // Token IDs are 0-based: last minted token is supplyNum - 1
      const lastTokenId = supplyNum - 1;
      const items = await fetchPage(lastTokenId);
      setMoments(items);

      // Next cursor: token ID below the lowest one we fetched
      const lowestFetched = lastTokenId - items.length + 1;
      const nextCursor = lowestFetched > 0 ? lowestFetched - 1 : null;
      cursorRef.current = nextCursor;
      setHasMore(nextCursor !== null && nextCursor >= 0);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [publicClient, fetchPage]);

  const loadMore = useCallback(async () => {
    if (!publicClient || cursorRef.current === null || cursorRef.current < 0 || loadingMore) return;

    try {
      setLoadingMore(true);
      const items = await fetchPage(cursorRef.current);
      setMoments((prev) => [...prev, ...items]);

      const lowestFetched = cursorRef.current - items.length + 1;
      const nextCursor = lowestFetched > 0 ? lowestFetched - 1 : null;
      cursorRef.current = nextCursor;
      setHasMore(nextCursor !== null && nextCursor >= 0);
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [publicClient, loadingMore, fetchPage]);

  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  return {
    moments,
    loading,
    loadingMore,
    error,
    refetch: fetchMoments,
    loadMore,
    hasMore,
    total,
  };
}
