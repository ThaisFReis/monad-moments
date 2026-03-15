'use client';

import { useState, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CameraView } from '@/components/CameraView';
import { Feed } from '@/components/Feed';
import { MOMENT_NFT_ABI, MOMENT_NFT_ADDRESS } from '@/config/contracts';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'camera' | 'feed'>('camera');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const { address, isConnected } = useAccount();

  // Check if user can mint today
  const { data: canMint } = useReadContract({
    address: MOMENT_NFT_ADDRESS,
    abi: MOMENT_NFT_ABI,
    functionName: 'canMintToday',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30_000, // Re-check every 30s
    },
  });

  // When mint succeeds, switch to feed and trigger refresh
  const handleMintSuccess = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
    setActiveTab('feed');
  }, []);

  return (
    <div className="relative min-h-dvh">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content area with top padding for header */}
      <div className="pt-14">
        {/* Camera tab */}
        <div className={activeTab === 'camera' ? 'block' : 'hidden'}>
          <CameraView onMintSuccess={handleMintSuccess} />

          {/* Already minted today indicator */}
          {isConnected && canMint === false && (
            <div className="mx-4 mt-4 p-4 rounded-xl bg-monad-card border border-monad-border text-center">
              <span className="text-2xl mb-2 block">🌅</span>
              <p className="text-monad-text text-sm font-semibold">
                You already posted today!
              </p>
              <p className="text-monad-muted text-xs mt-1">
                Come back tomorrow for your next moment.
              </p>
              <button
                onClick={() => setActiveTab('feed')}
                className="mt-3 px-4 py-2 rounded-xl bg-monad-purple/20 text-monad-purple text-sm font-medium hover:bg-monad-purple/30 transition-colors"
              >
                View Feed →
              </button>
            </div>
          )}
        </div>

        {/* Feed tab */}
        <div className={activeTab === 'feed' ? 'block' : 'hidden'}>
          <Feed refreshKey={feedRefreshKey} />
        </div>
      </div>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canMint={canMint === true}
      />
    </div>
  );
}
