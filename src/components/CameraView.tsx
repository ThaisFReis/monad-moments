'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useCamera } from '@/hooks/useCamera';
import { useLocation } from '@/hooks/useLocation';
import { useMint } from '@/hooks/useMint';
import { MintOverlay } from './MintOverlay';
import { BadgeCelebration } from './BadgeCelebration';

interface CameraViewProps {
  isActive: boolean;
  onMintSuccess: () => void;
  onBackToFeed: () => void;
}

export function CameraView({ isActive, onMintSuccess, onBackToFeed }: CameraViewProps) {
  const { isConnected } = useAccount();
  const camera = useCamera();
  const location = useLocation();
  const mint = useMint();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isConnected && isActive && !camera.capturedBlob) {
      camera.startCamera();
      return;
    }

    camera.stopCamera();
  }, [
    camera.capturedBlob,
    camera.facing,
    camera.startCamera,
    camera.stopCamera,
    isActive,
    isConnected,
  ]);

  const handlePost = async () => {
    if (!camera.capturedBlob || !camera.capturedType) return;

    const loc =
      location.latitude && location.longitude
        ? { lat: location.latitude, lng: location.longitude }
        : undefined;

    await mint.mintMoment(camera.capturedBlob, camera.capturedType, loc, title || undefined, description || undefined);
  };

  const handleCelebrationClose = () => {
    mint.reset();
    onMintSuccess();   // navigate to feed first → isActive=false before capturedBlob clears
    camera.discard();  // clearing blob now can't trigger startCamera (isActive is false)
  };

  const handleErrorDismiss = () => {
    mint.reset();
  };

  const handleSaveToDevice = async () => {
    if (!camera.capturedBlob || !camera.capturedUrl) return;
    const ext = camera.capturedType === 'video' ? 'webm' : 'jpg';
    const filename = `moment-${Date.now()}.${ext}`;

    // Use Web Share API on mobile if available (works better on iOS)
    if (navigator.share && typeof navigator.canShare === 'function') {
      const file = new File([camera.capturedBlob], filename, { type: camera.capturedBlob.type });
      try {
        await navigator.share({ files: [file] });
        return;
      } catch {
        // User cancelled or share failed — fall through to download
      }
    }

    // Fallback: trigger download via anchor element
    const a = document.createElement('a');
    a.href = camera.capturedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col justify-between px-6 py-8 relative overflow-hidden animate-fade-in">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] border border-monad-border rounded-full opacity-50 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[95vw] border border-neutral-800 rounded-full opacity-50 pointer-events-none" />

        <div className="flex justify-between items-start z-10">
          <div>
            <span className="font-display text-2xl italic text-monad-text">
              Moments.
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted block">
              Network
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple flex items-center gap-2 justify-end mt-1">
              <span className="w-1.5 h-1.5 bg-monad-purple rounded-full animate-pulse" />
              MONAD_L1
            </span>
          </div>
        </div>

        <div className="z-10 w-full">
          <h2 className="font-display text-6xl text-monad-text leading-[0.9] mb-8">
            Establish <br />
            <span className="italic text-neutral-500">Identity.</span>
          </h2>
          <p className="font-mono text-sm text-neutral-500 mb-12 max-w-sm leading-relaxed normal-case tracking-normal">
            Connect your cryptographic ledger to author moments, preserve memories,
            and anchor them on-chain.
          </p>
          <div className="[&_button]:w-full [&_button]:flex [&_button]:justify-between [&_button]:items-center [&_button]:bg-monad-text [&_button]:text-monad-bg [&_button]:px-8 [&_button]:py-5 [&_button]:rounded-full [&_button]:font-mono [&_button]:text-xs [&_button]:uppercase [&_button]:tracking-[0.24em] [&_button]:hover:bg-neutral-300 [&_button]:transition-all">
            <ConnectButton />
          </div>
        </div>

        <div className="z-10 flex justify-between items-end">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-600">
            EST. 2026 / SAO PAULO
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-600">
            SECURED BY MATH
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <MintOverlay
        step={mint.step}
        progress={mint.progress}
        txHash={mint.txHash}
      />

      <BadgeCelebration
        show={mint.step === 'success'}
        earnedBadge={mint.earnedBadge}
        tokenId={mint.tokenId}
        txHash={mint.txHash}
        onClose={handleCelebrationClose}
      />

      {mint.step === 'error' && (
        <div className="fixed top-24 left-4 right-4 z-[60] animate-slide-up">
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/30 rounded-[20px] px-4 py-3 flex items-center justify-between">
            <p className="text-red-400 text-sm">{mint.error}</p>
            <button
              onClick={handleErrorDismiss}
              className="text-red-400 text-lg ml-3 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {!camera.capturedBlob ? (
        <div className="w-full h-full relative animate-fade-in">
          {/* Fullscreen camera feed */}
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent pt-[env(safe-area-inset-top)] px-5 pb-8">
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={onBackToFeed}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white border border-white/10 transition-colors hover:bg-white/20"
              >
                <span aria-hidden="true">←</span>
                Feed
              </button>

              <div className="bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-monad-purple" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white">
                  DAILY_RECORD
                </span>
              </div>

              <button
                onClick={camera.flipCamera}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors"
              >
                ↺
              </button>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <span className="font-mono text-monad-purple text-[10px] uppercase tracking-[0.24em] animate-pulse">
                REC_READY
              </span>
              <span className="font-mono text-white/40 text-[10px] uppercase tracking-[0.24em]">
                {location.granted ? 'LOCATION_ON' : location.permissionState === 'denied' ? 'LOCATION_BLOCKED' : 'PRIVACY_MODE'}
              </span>
            </div>
          </div>

          {/* Viewfinder corners */}
          <div className="absolute top-24 left-8 text-white/20 text-lg">+</div>
          <div className="absolute top-24 right-8 text-white/20 text-lg">+</div>
          <div className="absolute bottom-48 left-8 text-white/20 text-lg">+</div>
          <div className="absolute bottom-48 right-8 text-white/20 text-lg">+</div>

          {/* Camera error overlay */}
          {camera.error && (
            <div className="absolute inset-0 z-20 bg-monad-bg/90 flex flex-col items-center justify-center px-8 text-center">
              <p className="font-display text-4xl italic text-monad-text mb-3">
                Camera unavailable.
              </p>
              <p className="text-sm text-neutral-400 mb-6 max-w-xs">
                Camera access is required to author a new moment.
              </p>
              <button
                onClick={camera.startCamera}
                className="px-6 py-3 rounded-full bg-monad-text text-monad-bg font-mono text-[10px] uppercase tracking-[0.24em]"
              >
                Enable camera
              </button>
            </div>
          )}

          {/* Recording indicator */}
          {camera.isRecording && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white">
                Recording
              </span>
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent pb-[env(safe-area-inset-bottom)] pt-12 px-6">
            <div className="flex flex-col items-center gap-5 pb-6">
              <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
                <button
                  onClick={() => camera.setMode('photo')}
                  className={`px-6 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
                    camera.mode === 'photo'
                      ? 'bg-white text-black'
                      : 'text-white/60'
                  }`}
                >
                  Photo
                </button>
                <button
                  onClick={() => camera.setMode('video')}
                  className={`px-6 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
                    camera.mode === 'video'
                      ? 'bg-white text-black'
                      : 'text-white/60'
                  }`}
                >
                  1S Video
                </button>
              </div>

              <button
                onClick={camera.capture}
                disabled={!camera.isReady || camera.isRecording}
                className="w-20 h-20 rounded-full border-[3px] border-white/80 flex items-center justify-center p-1.5 transition-all duration-300 hover:border-white active:scale-95 disabled:opacity-40"
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center ${
                  camera.mode === 'video' ? 'bg-monad-purple' : 'bg-white'
                }`}>
                  {camera.mode === 'video' ? (
                    <div className="w-6 h-6 bg-white rounded-sm" />
                  ) : (
                    <div className="w-14 h-14 border border-neutral-300 rounded-full" />
                  )}
                </div>
              </button>

              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50 text-center">
                {camera.mode === 'video' ? 'Tap once to record a 1 second clip' : 'Tap once to capture your daily record'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 bg-monad-bg flex flex-col max-w-md mx-auto overflow-hidden animate-fade-in">
          <div className="flex-1 relative mx-2 mt-4 rounded-t-[40px] overflow-hidden bg-monad-card border-x border-t border-monad-border">
            {camera.capturedType === 'photo' ? (
              <img
                src={camera.capturedUrl || ''}
                alt="Captured moment"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={camera.capturedUrl || ''}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <button
                onClick={() => { camera.discard(); setTitle(''); setDescription(''); }}
                className="flex items-center gap-2 bg-monad-bg/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-mono text-[10px] uppercase tracking-[0.24em] hover:bg-monad-card transition-colors"
              >
                ← Retake
              </button>
              {location.granted && (
                <div className="bg-monad-bg/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-mono text-[10px] uppercase tracking-[0.24em]">
                  Location on
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-monad-bg to-transparent pointer-events-none" />
          </div>

          <div className="bg-monad-bg px-6 pt-4 pb-8 border-t border-monad-border rounded-b-[40px] mx-2 mb-4 z-20 shadow-2xl shadow-black">
            <div className="flex flex-col gap-3">
              <p className="font-display text-3xl text-monad-text">
                Ready to author this record?
              </p>
              <p className="text-sm text-neutral-400">
                One tap to strip metadata, upload to IPFS, and anchor on Monad.
              </p>

              {location.granted ? (
                <div className="flex items-center gap-2 py-2">
                  <span className="w-1.5 h-1.5 bg-monad-purple rounded-full animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple">
                    Location captured — badge eligible
                  </span>
                </div>
              ) : location.permissionState === 'denied' ? (
                <div className="w-full flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <span className="text-red-400 text-lg">⌖</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-red-400">
                    Location blocked — enable in browser settings
                  </span>
                </div>
              ) : (
                <button
                  onClick={location.requestLocation}
                  disabled={location.loading}
                  className="w-full flex items-center gap-3 bg-monad-purple/10 border border-monad-purple/40 rounded-xl px-4 py-3 hover:bg-monad-purple/20 transition-colors disabled:opacity-50"
                >
                  <span className="text-monad-purple text-lg">⌖</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple">
                    {location.loading ? 'Requesting...' : 'Enable location for hackathon badge'}
                  </span>
                </button>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title… (optional)"
                maxLength={100}
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-monad-purple"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description… (optional)"
                rows={3}
                maxLength={500}
                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-monad-purple resize-none"
              />

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSaveToDevice}
                  disabled={mint.isBusy}
                  className="flex-1 py-4 rounded-xl bg-monad-card border border-monad-border text-monad-text font-mono text-[11px] uppercase tracking-[0.24em] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handlePost}
                  disabled={mint.isBusy}
                  className="flex-[2] py-4 rounded-xl bg-monad-purple text-monad-text font-mono text-[11px] uppercase tracking-[0.24em] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e03d00] transition-colors"
                >
                  {mint.isBusy ? 'Authoring...' : 'Author moment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
