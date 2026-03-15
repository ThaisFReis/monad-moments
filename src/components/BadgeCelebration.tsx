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

      import('canvas-confetti').then((confetti) => {
        const duration = 2500;
        const end = Date.now() + duration;
        const colors = ['#FF4500', '#FF7A00', '#F5F5F5'];

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
    <div className="fixed inset-0 z-[70] bg-monad-purple text-monad-text flex flex-col p-8 animate-slide-up">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-80 mb-6">
          {earnedBadge ? 'Artifact issued' : 'Record anchored'}
        </p>
        <h2 className="font-display text-7xl italic leading-[0.9] mb-8">
          {earnedBadge ? (
            <>
              Badge
              <br />
              Earned.
            </>
          ) : (
            <>
              Moment
              <br />
              Minted.
            </>
          )}
        </h2>

        <div className="space-y-5">
          {tokenId !== null && (
            <div className="p-4 border border-white/20 rounded-[20px] flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-xl">
                {earnedBadge ? '◌' : '●'}
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-80 block mb-1">
                  Token record
                </span>
                <span className="font-mono text-sm tracking-[0.18em]">
                  MOMENT #{tokenId.toString()}
                </span>
              </div>
            </div>
          )}

          <div className="p-4 bg-black/20 border border-white/30 rounded-[20px] backdrop-blur-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-xl">
              {earnedBadge ? '⌘' : '↗'}
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-80 block mb-1">
                {earnedBadge ? 'Event recorded' : 'Monad finalized'}
              </span>
              <span className="font-mono text-sm tracking-[0.18em]">
                {earnedBadge ? HACKATHON_EVENT.name.toUpperCase() : 'SUB-SECOND CONFIRMATION'}
              </span>
            </div>
          </div>
        </div>

        {txHash && (
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-white/80"
          >
            View on explorer ↗
          </a>
        )}
      </div>

      <div className="max-w-md mx-auto w-full pb-8">
        <button
          onClick={onClose}
          className="w-full py-5 rounded-full bg-white text-monad-purple font-mono text-xs uppercase tracking-[0.24em] flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-2xl"
        >
          View archive
        </button>
      </div>
    </div>
  );
}
