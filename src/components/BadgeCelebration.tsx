'use client';

import { useEffect, useRef } from 'react';
import { HACKATHON_EVENT } from '@/config/contracts';

interface BadgeCelebrationProps {
  show: boolean;
  earnedBadge: boolean;
  tokenId: bigint | null;
  txHash: string | null;
  onClose: () => void;
}

export function BadgeCelebration({
  show,
  earnedBadge,
  tokenId,
  txHash,
  onClose,
}: BadgeCelebrationProps) {
  const hasConfettiFired = useRef(false);

  useEffect(() => {
    if (show && !hasConfettiFired.current) {
      hasConfettiFired.current = true;

      // Dynamic import confetti to avoid SSR issues
      import('canvas-confetti').then((confetti) => {
        const duration = 2500;
        const end = Date.now() + duration;

        const colors = ['#836EF9', '#E040FB', '#00E5FF', '#00E676', '#FFD700'];

        const frame = () => {
          confetti.default({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
          });
          confetti.default({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };

        frame();
      });
    }

    if (!show) {
      hasConfettiFired.current = false;
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-monad-bg/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      {/* Badge icon */}
      <div className="animate-badge-reveal mb-6">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-monad-purple via-monad-fuchsia to-monad-accent p-[3px]">
          <div className="w-full h-full rounded-3xl bg-monad-bg flex flex-col items-center justify-center gap-1">
            <span className="text-5xl">
              {earnedBadge ? '🎪' : '📸'}
            </span>
            <span className="text-monad-text text-xs font-bold font-display">
              {earnedBadge ? 'EVENT' : 'MINTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-monad-text text-2xl font-display font-bold mb-2 animate-slide-up">
        {earnedBadge ? 'Badge Earned!' : 'Moment Minted!'}
      </h2>

      {/* Subtitle */}
      <p className="text-monad-muted text-center text-sm max-w-[280px] mb-2 animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        {earnedBadge
          ? `You earned the ${HACKATHON_EVENT.name} Attendee badge!`
          : 'Your moment is permanently stored on Monad.'}
      </p>

      {/* Token ID */}
      {tokenId !== null && (
        <div
          className="mt-2 px-4 py-2 rounded-xl bg-monad-card border border-monad-border animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <span className="text-monad-muted text-xs">Moment #</span>
          <span className="text-monad-accent text-sm font-mono font-bold ml-1">
            {tokenId.toString()}
          </span>
        </div>
      )}

      {/* Explorer link */}
      {txHash && (
        <a
          href={`https://testnet.monadexplorer.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-monad-accent text-xs font-mono hover:underline animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          View on Monad Explorer →
        </a>
      )}

      {/* Close / go to feed */}
      <div
        className="flex gap-3 mt-8 animate-slide-up"
        style={{ animationDelay: '400ms' }}
      >
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-monad-purple to-monad-fuchsia text-white font-semibold hover:opacity-90 transition-opacity"
        >
          View Feed
        </button>
      </div>
    </div>
  );
}
