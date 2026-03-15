'use client';

import { useMemo, useState } from 'react';
import { USERNAME_MIN_LENGTH } from '@/lib/profile';

interface UsernameSetupProps {
  address: `0x${string}`;
  onSubmit: (username: string) => void;
}

export function UsernameSetup({ address, onSubmit }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const trimmedUsername = useMemo(() => username.trim(), [username]);
  const isValid = trimmedUsername.length >= USERNAME_MIN_LENGTH;

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
              Identity
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple flex items-center gap-2 justify-end mt-1">
              <span className="w-1.5 h-1.5 bg-monad-purple rounded-full animate-pulse" />
              USERNAME_REQUIRED
            </span>
          </div>
        </div>

        <div className="z-10 w-full flex-1 flex flex-col justify-center">
          <div className="animate-fade-in">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple mb-5">
              Identity / 00
            </p>
            <h2 className="font-display text-5xl md:text-6xl text-monad-text leading-[0.95] mb-4">
              Choose <br />
              <span className="italic text-neutral-500">Username.</span>
            </h2>
            <p className="font-mono text-sm text-neutral-500 leading-relaxed normal-case tracking-normal mb-10 max-w-sm">
              This is the name shown in the app for this wallet on this device. You only need to set it once.
            </p>

            <div className="space-y-4">
              <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-3">
                  Connected wallet
                </p>
                <p className="font-mono text-xs text-neutral-300 break-all">{address}</p>
              </div>

              <div className="border border-monad-border rounded-[20px] p-4 bg-monad-card">
                <label
                  htmlFor="username"
                  className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted block mb-3"
                >
                  Username
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="yourname"
                  autoComplete="nickname"
                  className="w-full rounded-xl border border-neutral-800 bg-monad-bg px-4 py-3 text-monad-text outline-none transition-colors focus:border-monad-purple"
                />
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                  Minimum {USERNAME_MIN_LENGTH} characters
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10">
          <button
            onClick={() => onSubmit(trimmedUsername)}
            disabled={!isValid}
            className="w-full flex justify-between items-center bg-monad-text text-monad-bg px-8 py-5 rounded-full font-mono text-xs uppercase tracking-[0.24em] hover:bg-neutral-300 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Continue to onboarding</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
