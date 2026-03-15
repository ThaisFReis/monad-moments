'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface HeaderProps {
  activeTab: 'camera' | 'feed';
  onTabChange: (tab: 'camera' | 'feed') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { isConnected } = useAccount();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-monad-bg/80 backdrop-blur-xl border-b border-monad-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onTabChange('camera')}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-monad-purple to-monad-fuchsia flex items-center justify-center">
            <span className="text-sm">📸</span>
          </div>
          <span className="font-display font-bold text-monad-text text-lg tracking-tight">
            Moments
          </span>
        </button>

        {/* Right side: wallet */}
        <div className="flex items-center gap-2">
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
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-monad-purple to-monad-fuchsia text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          Connect
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-monad-card border border-monad-border hover:border-monad-purple/50 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-monad-purple to-monad-accent" />
                        <span className="text-monad-text text-sm font-mono">
                          {account.displayName}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
