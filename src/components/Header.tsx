'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { shortenAddress } from '@/lib/utils';

interface HeaderProps {
  activeTab: 'camera' | 'feed';
  onTabChange: (tab: 'camera' | 'feed') => void;
  username?: string | null;
}

export function Header({ activeTab, onTabChange, username }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-monad-bg/80 backdrop-blur-xl border-b border-monad-border">
      <div className="max-w-md mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => onTabChange('camera')}
          className="text-left"
        >
          <span className="font-display text-3xl italic tracking-tight text-monad-text">
            Moments.
          </span>
        </button>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none' as const,
                    userSelect: 'none' as const,
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="px-5 py-3 rounded-full bg-monad-text text-monad-bg font-mono text-[10px] uppercase tracking-[0.28em] hover:bg-neutral-300 transition-colors"
                      >
                        Connect
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="px-3 py-2 rounded-full border border-red-500/30 text-red-400 bg-red-500/10 font-mono text-[10px] uppercase tracking-[0.24em]"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-4 text-right"
                    >
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-text">
                          {username || account.displayName}
                        </span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-monad-muted">
                          {shortenAddress(account.address, 3)}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-monad-border flex items-center justify-center text-monad-purple">
                        <span className="text-xs">●</span>
                      </div>
                    </button>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
