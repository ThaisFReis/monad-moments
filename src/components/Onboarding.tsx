'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const MONAD_PARAMS = {
  chainId: '0x279F',
  chainName: 'Monad Testnet',
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

const STEPS = [
  { id: 'welcome', label: 'Identity' },
  { id: 'wallet', label: 'Ledger' },
  { id: 'network', label: 'Network' },
  { id: 'faucet', label: 'Funds' },
  { id: 'ready', label: 'Author' },
] as const;

type WalletStatus = 'idle' | 'loading' | 'no-modal';
type NetworkStatus = 'idle' | 'loading' | 'done' | 'no-ext';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

interface StepFrameProps {
  eyebrow: string;
  title: ReactNode;
  body: string;
  children?: ReactNode;
}

function StepFrame({ eyebrow, title, body, children }: StepFrameProps) {
  return (
    <div className="animate-fade-in">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple mb-5">
        {eyebrow}
      </p>
      <h2 className="font-display text-5xl md:text-6xl text-monad-text leading-[0.95] mb-4">
        {title}
      </h2>
      <p className="font-mono text-sm text-neutral-500 leading-relaxed normal-case tracking-normal mb-10 max-w-sm">
        {body}
      </p>
      {children}
    </div>
  );
}

function Welcome() {
  return (
    <StepFrame
      eyebrow="Onboarding / 01"
      title={
        <>
          Establish <br />
          <span className="italic text-neutral-500">Identity.</span>
        </>
      }
      body="Before you author your first moment, connect a wallet, register Monad Testnet, and load test MON for gas."
    >
      <div className="space-y-4">
        <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-2">
            Protocol
          </p>
          <p className="text-neutral-300 text-sm">
            One photo or one-second video per day, anchored permanently on-chain.
          </p>
        </div>
        <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-2">
            Cost model
          </p>
          <p className="text-neutral-300 text-sm">
            Monad finality stays fast enough to make minting feel immediate during the live demo.
          </p>
        </div>
      </div>
    </StepFrame>
  );
}

function Wallet() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [status, setStatus] = useState<WalletStatus>('idle');

  const connect = async () => {
    if (!openConnectModal) {
      setStatus('no-modal');
      return;
    }

    setStatus('loading');
    openConnectModal();
    setStatus('idle');
  };

  return (
    <StepFrame
      eyebrow="Onboarding / 02"
      title={
        <>
          Connect <br />
          <span className="italic text-neutral-500">Ledger.</span>
        </>
      }
      body="Use RainbowKit to connect MetaMask, Rainbow, or Coinbase Wallet. The app only reads your public address."
    >
      <div className="space-y-4">
        <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-2">
            Recommended
          </p>
          <p className="text-neutral-300 text-sm">
            MetaMask Mobile is the safest option for demos because network switching is predictable.
          </p>
        </div>

        {status === 'no-modal' && (
          <div className="border border-red-500/20 rounded-[20px] p-4 bg-red-500/5 text-red-400 text-sm">
            Wallet modal unavailable. Check WalletConnect project ID configuration.
          </div>
        )}

        {isConnected ? (
          <div className="border border-monad-purple/30 rounded-[20px] p-4 bg-monad-purple/5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple mb-2">
              Connected
            </p>
            <p className="font-mono text-sm tracking-[0.14em] text-neutral-200">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={status === 'loading'}
            className="w-full flex justify-between items-center bg-monad-text text-monad-bg px-8 py-5 rounded-full font-mono text-xs uppercase tracking-[0.24em] hover:bg-neutral-300 transition-all active:scale-95"
          >
            <span>{status === 'loading' ? 'Opening wallet' : 'Connect ledger'}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </StepFrame>
  );
}

function Network() {
  const [status, setStatus] = useState<NetworkStatus>('idle');

  const add = async () => {
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) {
      setStatus('no-ext');
      return;
    }

    setStatus('loading');
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_PARAMS],
      });
      setStatus('done');
    } catch {
      setStatus('idle');
    }
  };

  return (
    <StepFrame
      eyebrow="Onboarding / 03"
      title={
        <>
          Register <br />
          <span className="italic text-neutral-500">Network.</span>
        </>
      }
      body="Monad Testnet must be present in the wallet before the contract call can succeed."
    >
      <div className="space-y-4">
        <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card space-y-3">
          <div className="flex justify-between text-xs">
            <span className="font-mono uppercase tracking-[0.24em] text-monad-muted">Chain ID</span>
            <span className="font-mono text-neutral-200">10143</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-mono uppercase tracking-[0.24em] text-monad-muted">Currency</span>
            <span className="font-mono text-neutral-200">MON</span>
          </div>
          <div className="flex justify-between text-xs gap-4">
            <span className="font-mono uppercase tracking-[0.24em] text-monad-muted">RPC</span>
            <span className="font-mono text-neutral-200 text-right">testnet-rpc.monad.xyz</span>
          </div>
        </div>

        {status === 'no-ext' && (
          <div className="border border-red-500/20 rounded-[20px] p-4 bg-red-500/5 text-red-400 text-sm">
            No injected wallet found. Open the app in your wallet browser.
          </div>
        )}

        {status === 'done' ? (
          <div className="border border-monad-purple/30 rounded-[20px] p-4 bg-monad-purple/5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple mb-2">
              Network ready
            </p>
            <p className="text-neutral-300 text-sm">
              Monad Testnet was added successfully.
            </p>
          </div>
        ) : (
          <button
            onClick={add}
            disabled={status === 'loading'}
            className="w-full flex justify-between items-center bg-monad-text text-monad-bg px-8 py-5 rounded-full font-mono text-xs uppercase tracking-[0.24em] hover:bg-neutral-300 transition-all active:scale-95"
          >
            <span>{status === 'loading' ? 'Registering' : 'Add Monad network'}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </StepFrame>
  );
}

function Faucet({ address }: { address?: `0x${string}` }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <StepFrame
      eyebrow="Onboarding / 04"
      title={
        <>
          Load <br />
          <span className="italic text-neutral-500">Funds.</span>
        </>
      }
      body="You need testnet MON to pay gas. Faucet tokens have no monetary value and are only for testing."
    >
      <div className="space-y-4">
        <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-3">
            Wallet address
          </p>
          {address ? (
            <button
              onClick={copy}
              className="w-full text-left rounded-xl border border-neutral-800 bg-monad-bg px-4 py-3"
            >
              <span className="font-mono text-xs text-neutral-300 break-all">{address}</span>
              <span className="block mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple">
                {copied ? 'Copied' : 'Copy address'}
              </span>
            </button>
          ) : (
            <p className="text-neutral-500 text-sm">Connect your wallet first.</p>
          )}
        </div>

        <a
          href="https://faucet.monad.xyz"
          target="_blank"
          rel="noreferrer"
          className="w-full flex justify-between items-center bg-monad-text text-monad-bg px-8 py-5 rounded-full font-mono text-xs uppercase tracking-[0.24em] hover:bg-neutral-300 transition-all"
        >
          <span>Open faucet</span>
          <span>↗</span>
        </a>
      </div>
    </StepFrame>
  );
}

function Ready({
  address,
  username,
  onComplete,
}: {
  address?: `0x${string}`;
  username: string;
  onComplete: () => void;
}) {
  return (
    <StepFrame
      eyebrow="Onboarding / 05"
      title={
        <>
          Author <br />
          <span className="italic text-neutral-500">Moment.</span>
        </>
      }
      body="The flow is now live. Capture media, review it, and anchor it on Monad in one motion."
    >
      <div className="space-y-4">
        {address && (
          <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-2">
              Active identity
            </p>
            <div className="space-y-2">
              <p className="font-mono text-sm tracking-[0.14em] text-neutral-200">
                {username}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          </div>
        )}

        <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-2">
            Sequence rules
          </p>
          <p className="text-neutral-300 text-sm">
            One record per day. Metadata is stripped before upload. Finality lands in under a second.
          </p>
        </div>

        <button
          onClick={onComplete}
          className="w-full flex justify-between items-center bg-monad-purple text-monad-text px-8 py-5 rounded-full font-mono text-xs uppercase tracking-[0.24em] hover:bg-[#e03d00] transition-all active:scale-95"
        >
          <span>Mint first moment</span>
          <span>→</span>
        </button>
      </div>
    </StepFrame>
  );
}

interface OnboardingProps {
  onComplete: () => void;
  username: string;
}

export function Onboarding({ onComplete, username }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const { address } = useAccount();

  const prev = () => setStep((current) => Math.max(0, current - 1));
  const next = () => setStep((current) => Math.min(STEPS.length - 1, current + 1));
  const isLast = step === STEPS.length - 1;

  const screens = useMemo<ReactNode[]>(
    () => [
      <Welcome key="welcome" />,
      <Wallet key="wallet" />,
      <Network key="network" />,
      <Faucet key="faucet" address={address} />,
      <Ready
        key="ready"
        address={address}
        username={username}
        onComplete={onComplete}
      />,
    ],
    [address, onComplete, username]
  );

  return (
    <div className="min-h-screen bg-monad-bg flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between p-6 md:p-8 relative overflow-hidden animate-fade-in">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border border-monad-border rounded-full opacity-50 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border border-neutral-800 rounded-full opacity-50 pointer-events-none" />

        <div className="flex justify-between items-start z-10">
          <div>
            <span className="font-display text-2xl italic text-monad-text">
              Moments.
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted block">
              Step
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple flex items-center gap-2 justify-end mt-1">
              <span className="w-1.5 h-1.5 bg-monad-purple rounded-full animate-pulse" />
              {step + 1}/{STEPS.length}
            </span>
          </div>
        </div>

        <div className="z-10 w-full flex-1 flex flex-col justify-center">
          {screens[step]}
        </div>

        <div className="z-10">
          <div className="flex justify-between items-center mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-600">
              {STEPS[step].label}
            </span>
            {!isLast && step > 0 && (
              <button
                onClick={prev}
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500 hover:text-neutral-300"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            {STEPS.map((currentStep, index) => (
              <div
                key={currentStep.id}
                className={`h-1 rounded-full flex-1 transition-all ${
                  index <= step ? 'bg-monad-purple' : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>

          {!isLast && (
            <button
              onClick={next}
              className="w-full flex justify-between items-center bg-monad-text text-monad-bg px-8 py-5 rounded-full font-mono text-xs uppercase tracking-[0.24em] hover:bg-neutral-300 transition-all active:scale-95"
            >
              <span>{step === 0 ? 'Begin sequence' : 'Continue'}</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
