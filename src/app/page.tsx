'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CameraView } from '@/components/CameraView';
import { Feed } from '@/components/Feed';
import { Onboarding } from '@/components/Onboarding';
import { UsernameSetup } from '@/components/UsernameSetup';
import { MOMENT_NFT_ABI, MOMENT_NFT_ADDRESS } from '@/config/contracts';
import { readUserProfile, writeUserProfile } from '@/lib/profile';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'camera' | 'feed'>('feed');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const showUsernameSetup = isConnected && profileHydrated && !username;
  const showOnboarding =
    isConnected && profileHydrated && !!username && !onboardingCompleted;

  useEffect(() => {
    setMounted(true);

    if (!isConnected || !address) {
      setUsername(null);
      setOnboardingCompleted(false);
      setProfileHydrated(true);
      return;
    }

    const profile = readUserProfile(address);
    setUsername(profile?.username ?? null);
    setOnboardingCompleted(profile?.onboardingCompleted ?? false);
    setProfileHydrated(true);
  }, [address, isConnected]);

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
  // Dev address bypasses the daily mint gate in the UI
  const DEV_ADDRESS = '0x83D8dA81b98274449Ba427a96a68Ee02c99e564D';
  const isDev = address?.toLowerCase() === DEV_ADDRESS.toLowerCase();
  const isCameraBlocked = isConnected && canMint === false && !isDev;

  // When mint succeeds, switch to feed and trigger refresh
  const handleMintSuccess = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
    setActiveTab('feed');
  }, []);

  const handleUsernameSubmit = useCallback(
    (nextUsername: string) => {
      if (!address) return;

      writeUserProfile(address, {
        username: nextUsername,
        onboardingCompleted: false,
      });
      setUsername(nextUsername);
      setOnboardingCompleted(false);
    },
    [address]
  );

  const handleOnboardingComplete = useCallback(() => {
    if (address && username) {
      writeUserProfile(address, {
        username,
        onboardingCompleted: true,
      });
    }
    setOnboardingCompleted(true);
    setActiveTab('feed');
  }, [address, canMint, username]);

  const handleBackToFeed = useCallback(() => {
    setActiveTab('feed');
  }, []);

  const handleTabChange = useCallback(
    (tab: 'camera' | 'feed') => {
      if (tab === 'camera' && isCameraBlocked) {
        setActiveTab('feed');
        return;
      }

      setActiveTab(tab);
    },
    [isCameraBlocked]
  );

  useEffect(() => {
    if (activeTab === 'camera' && (!isConnected || isCameraBlocked)) {
      setActiveTab('feed');
    }
  }, [activeTab, isConnected, isCameraBlocked]);

  const showBottomNav = !(activeTab === 'camera' && isConnected && !isCameraBlocked);

  if (!mounted) {
    return <div className="min-h-screen bg-monad-bg" />;
  }

  if (isConnected && !profileHydrated) {
    return <div className="min-h-screen bg-monad-bg" />;
  }

  if (showUsernameSetup && address) {
    return <UsernameSetup address={address} onSubmit={handleUsernameSubmit} />;
  }

  if (showOnboarding && username) {
    return (
      <Onboarding
        username={username}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  const isCameraActive = activeTab === 'camera' && !isCameraBlocked;

  return (
    <div className="min-h-screen bg-monad-bg text-monad-text flex justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-monad-bg shadow-2xl shadow-black/50">
        {!isCameraActive && (
          <Header
            activeTab={activeTab}
            onTabChange={handleTabChange}
            username={username}
          />
        )}

        {isCameraActive && (
          <CameraView
            isActive={activeTab === 'camera'}
            onMintSuccess={handleMintSuccess}
            onBackToFeed={handleBackToFeed}
          />
        )}

        <div className={isCameraActive ? 'hidden' : 'pt-24 pb-32'}>
          <div className={activeTab === 'feed' ? 'block' : 'hidden'}>
            <Feed refreshKey={feedRefreshKey} />
          </div>
        </div>
        {showBottomNav && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            canMint={canMint === true}
          />
        )}
      </div>
    </div>
  );
}
