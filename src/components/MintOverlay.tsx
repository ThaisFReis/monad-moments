'use client';

import { MintStep } from '@/hooks/useMint';

interface MintOverlayProps {
  step: MintStep;
  progress: string;
  txHash: string | null;
}

const STEP_CONFIG: Record<
  Exclude<MintStep, 'idle' | 'success' | 'error'>,
  { icon: string; label: string; order: number }
> = {
  processing: { icon: '⚡', label: 'Processing', order: 1 },
  uploading: { icon: '☁️', label: 'Uploading', order: 2 },
  confirming: { icon: '👆', label: 'Sign', order: 3 },
  minting: { icon: '⛓️', label: 'Minting', order: 4 },
};

export function MintOverlay({ step, progress, txHash }: MintOverlayProps) {
  if (step === 'idle' || step === 'success' || step === 'error') return null;

  const currentConfig = STEP_CONFIG[step];
  const steps = Object.entries(STEP_CONFIG);

  return (
    <div className="fixed inset-0 z-[60] bg-monad-bg/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      {/* Pulsing orb */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-monad-purple to-monad-fuchsia animate-pulse-glow flex items-center justify-center">
          <span className="text-4xl">{currentConfig.icon}</span>
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-monad-purple animate-spin" />
      </div>

      {/* Progress text */}
      <p className="text-monad-text text-lg font-display font-semibold mb-2">
        {progress}
      </p>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mt-4">
        {steps.map(([key, config]) => {
          const isActive = key === step;
          const isPast = config.order < currentConfig.order;

          return (
            <div key={key} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-monad-purple text-white scale-110'
                    : isPast
                    ? 'bg-monad-success/20 text-monad-success'
                    : 'bg-monad-card text-monad-muted border border-monad-border'
                }`}
              >
                {isPast ? '✓' : config.order}
              </div>
              {config.order < 4 && (
                <div
                  className={`w-6 h-[2px] transition-colors ${
                    isPast ? 'bg-monad-success' : 'bg-monad-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Sub-second finality note */}
      {step === 'minting' && (
        <p className="text-monad-muted text-xs mt-6 animate-fade-in">
          Monad finality: ~800ms ⚡
        </p>
      )}

      {/* Transaction hash link */}
      {txHash && (
        <a
          href={`https://testnet.monadexplorer.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-monad-accent text-xs font-mono hover:underline"
        >
          View tx →
        </a>
      )}
    </div>
  );
}
