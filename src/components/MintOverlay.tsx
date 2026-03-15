'use client';

import { MintStep } from '@/hooks/useMint';

interface MintOverlayProps {
  step: MintStep;
  progress: string;
  txHash: string | null;
}

const STEP_CONFIG: Record<
  Exclude<MintStep, 'idle' | 'success' | 'error'>,
  { label: string; code: string; order: number }
> = {
  processing:  { label: 'Preparing media',        code: 'EXTRACTING_METADATA', order: 1 },
  compositing: { label: 'Crafting badge artwork', code: 'CRAFTING_BADGE',      order: 2 },
  uploading:   { label: 'Uploading to IPFS',      code: 'UPLOADING_IPFS',      order: 3 },
  confirming:  { label: 'Awaiting signature',     code: 'AWAITING_SIGNATURE',  order: 4 },
  minting:     { label: 'Anchoring on Monad',     code: 'ANCHORING_L1',        order: 5 },
};

export function MintOverlay({ step, progress, txHash }: MintOverlayProps) {
  if (step === 'idle' || step === 'success' || step === 'error') return null;

  const currentConfig = STEP_CONFIG[step];
  const steps = Object.entries(STEP_CONFIG);

  return (
    <div className="fixed inset-0 z-[60] bg-monad-bg/95 backdrop-blur-xl flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,69,0,0.16),transparent_50%)]" />

      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
        <h2 className="font-display text-5xl italic text-monad-text mb-4">
          Anchoring...
        </h2>
        <p className="text-sm text-neutral-400 mb-12 max-w-xs">
          {progress}
        </p>

        <div className="space-y-6 font-mono text-xs tracking-[0.24em] uppercase">
          {steps.map(([key, config]) => {
            const isPast = config.order < currentConfig.order;
            const isActive = key === step;

            return (
              <div
                key={key}
                className={`flex flex-col gap-2 transition-opacity duration-500 ${
                  isPast || isActive ? 'opacity-100' : 'opacity-35'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-4 h-4 flex items-center justify-center border ${
                      isPast
                        ? 'border-monad-purple bg-monad-purple text-white'
                        : isActive
                        ? 'border-monad-purple animate-pulse'
                        : 'border-monad-border'
                    }`}
                  >
                    {isPast ? '✓' : ''}
                  </div>
                  <span className={isActive ? 'text-monad-purple' : 'text-monad-muted'}>
                    {config.code}
                  </span>
                </div>
                {isActive && (
                  <span className="text-[10px] text-neutral-500 ml-8 tracking-[0.18em]">
                    {config.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {step === 'minting' && (
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            Monad finality: ~800ms
          </p>
        )}

        {txHash && (
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple"
          >
            View transaction ↗
          </a>
        )}
      </div>
    </div>
  );
}
