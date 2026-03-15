'use client';

import { useRef, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useLocation } from '@/hooks/useLocation';
import { useMint, MintStep } from '@/hooks/useMint';
import { MintOverlay } from './MintOverlay';
import { BadgeCelebration } from './BadgeCelebration';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface CameraViewProps {
  onMintSuccess: () => void;
}

export function CameraView({ onMintSuccess }: CameraViewProps) {
  const { isConnected } = useAccount();
  const camera = useCamera();
  const location = useLocation();
  const mint = useMint();

  // Handle the ONE-BUTTON post flow
  const handlePost = async () => {
    if (!camera.capturedBlob || !camera.capturedType) return;

    const loc =
      location.latitude && location.longitude
        ? { lat: location.latitude, lng: location.longitude }
        : undefined;

    await mint.mintMoment(camera.capturedBlob, camera.capturedType, loc);
  };

  // When mint succeeds and user dismisses celebration, go to feed
  const handleCelebrationClose = () => {
    mint.reset();
    camera.discard();
    onMintSuccess();
  };

  // Handle error dismissal
  const handleErrorDismiss = () => {
    mint.reset();
  };

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-monad-purple to-monad-fuchsia flex items-center justify-center mb-6 animate-pulse-glow">
          <span className="text-4xl">📸</span>
        </div>
        <h1 className="text-monad-text text-2xl font-display font-bold mb-3">
          Monad Moments
        </h1>
        <p className="text-monad-muted text-sm mb-6 max-w-[280px]">
          Capture one moment per day. Mint it forever on Monad.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ minHeight: 'calc(100vh - 7.5rem)' }}>
      {/* Mint progress overlay */}
      <MintOverlay
        step={mint.step}
        progress={mint.progress}
        txHash={mint.txHash}
      />

      {/* Badge celebration */}
      <BadgeCelebration
        show={mint.step === 'success'}
        earnedBadge={mint.earnedBadge}
        tokenId={mint.tokenId}
        txHash={mint.txHash}
        onClose={handleCelebrationClose}
      />

      {/* Error toast */}
      {mint.step === 'error' && (
        <div className="fixed top-16 left-4 right-4 z-[60] animate-slide-up">
          <div className="max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
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

      {/* Camera / Preview area */}
      {!camera.capturedBlob ? (
        /* === CAMERA LIVE VIEW === */
        <div className="relative w-full aspect-[3/4] bg-black rounded-b-2xl overflow-hidden">
          {/* Video feed */}
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Camera error */}
          {camera.error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-monad-bg/90 px-6 text-center">
              <span className="text-3xl mb-3">📷</span>
              <p className="text-monad-muted text-sm mb-4">
                Camera access is needed to capture moments.
              </p>
              <button
                onClick={camera.startCamera}
                className="px-4 py-2 rounded-xl bg-monad-purple text-white text-sm font-semibold"
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* Recording indicator */}
          {camera.isRecording && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/80 backdrop-blur">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold">REC</span>
            </div>
          )}

          {/* Top controls: flip camera */}
          <div className="absolute top-4 right-4">
            <button
              onClick={camera.flipCamera}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 pb-6 pt-12 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center justify-center gap-8">
              {/* Mode toggle */}
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur rounded-full p-1">
                <button
                  onClick={() => camera.setMode('photo')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    camera.mode === 'photo'
                      ? 'bg-white text-black'
                      : 'text-white/70'
                  }`}
                >
                  Photo
                </button>
                <button
                  onClick={() => camera.setMode('video')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    camera.mode === 'video'
                      ? 'bg-white text-black'
                      : 'text-white/70'
                  }`}
                >
                  1s Video
                </button>
              </div>

              {/* CAPTURE BUTTON */}
              <button
                onClick={camera.capture}
                disabled={!camera.isReady || camera.isRecording}
                className="relative group"
              >
                {/* Outer ring */}
                <div
                  className={`w-[72px] h-[72px] rounded-full border-[3px] flex items-center justify-center transition-all ${
                    camera.mode === 'video'
                      ? 'border-red-400'
                      : 'border-white'
                  } ${!camera.isReady ? 'opacity-40' : 'group-hover:scale-105 group-active:scale-95'}`}
                >
                  {/* Inner fill */}
                  <div
                    className={`rounded-full transition-all ${
                      camera.mode === 'video'
                        ? 'w-12 h-12 bg-red-500 rounded-lg'
                        : 'w-14 h-14 bg-white'
                    } ${camera.isRecording ? 'animate-pulse bg-red-600' : ''}`}
                  />
                </div>
              </button>

              {/* Spacer to balance the mode toggle */}
              <div className="w-[88px]" />
            </div>
          </div>
        </div>
      ) : (
        /* === PREVIEW + POST VIEW === */
        <div className="relative w-full aspect-[3/4] bg-black rounded-b-2xl overflow-hidden">
          {/* Preview image or video */}
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

          {/* Preview overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top: retake button */}
          <div className="absolute top-4 left-4">
            <button
              onClick={camera.discard}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 backdrop-blur text-white text-sm font-medium hover:bg-black/60 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Retake
            </button>
          </div>

          {/* Location indicator */}
          {location.granted && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur">
              <div className="w-1.5 h-1.5 rounded-full bg-monad-success" />
              <span className="text-white/80 text-[10px]">Location on</span>
            </div>
          )}

          {/* Bottom: THE ONE POST BUTTON */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <button
              onClick={handlePost}
              disabled={mint.isBusy}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-monad-purple to-monad-fuchsia text-white text-lg font-display font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-monad-purple/30"
            >
              {mint.isBusy ? 'Posting...' : 'Post Moment ✨'}
            </button>
            <p className="text-center text-white/50 text-[10px] mt-2">
              One tap: strip metadata → upload to IPFS → mint on Monad
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
