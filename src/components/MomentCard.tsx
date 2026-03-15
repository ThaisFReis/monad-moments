'use client';

import { useState } from 'react';
import { MomentItem } from '@/hooks/useFeed';
import { formatTime, shortenAddress } from '@/lib/utils';
import { MOMENT_NFT_ADDRESS } from '@/config/contracts';

interface MomentCardProps {
  moment: MomentItem;
  variant?: 'grid' | 'list';
}

export function MomentCard({
  moment,
  variant = 'grid',
}: MomentCardProps) {
  const imageUrl = moment.imageUrl;
  const title = moment.title;
  const description = moment.description;
  const [imgLoadError, setImgLoadError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasImage = !!imageUrl && !imgLoadError;
  const showError = !imageUrl || imgLoadError;

  const dateLabel = new Date(moment.timestamp * 1000)
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();

  return (
    <>
      {variant === 'grid' ? (
        <button
          onClick={() => setExpanded(true)}
          className="aspect-square relative bg-monad-card overflow-hidden group cursor-pointer"
        >
          {hasImage && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              onError={() => setImgLoadError(true)}
              loading="lazy"
            />
          )}

          {showError && (
            <div className="w-full h-full flex flex-col items-center justify-center text-monad-muted">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
                Record
              </span>
            </div>
          )}
        </button>
      ) : (
        <article
          onClick={() => setExpanded(true)}
          className="group cursor-pointer border-b border-monad-border pb-8 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted">
              {dateLabel} <span className="mx-1">/</span> {formatTime(moment.timestamp)}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple bg-monad-purple/10 px-2 py-0.5 rounded-sm">
              Archive {shortenAddress(moment.owner, 2)}
            </div>
          </div>

          <h2 className="font-display text-4xl text-monad-text mb-4 group-hover:text-neutral-300 transition-colors leading-none">
            {title}
          </h2>

          <div className="relative aspect-[4/5] bg-monad-card overflow-hidden border border-monad-border rounded-[24px]">
            {hasImage && (
              <img
                src={imageUrl}
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                alt={title}
                onError={() => setImgLoadError(true)}
              />
            )}

            {showError && (
              <div className="w-full h-full flex items-center justify-center text-monad-muted">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
                  Asset unavailable
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-monad-card border border-monad-border" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-300">
                {shortenAddress(moment.owner)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-monad-muted group-hover:text-monad-purple transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
                Open record
              </span>
              <span className="text-sm">→</span>
            </div>
          </div>
        </article>
      )}

      {expanded && (
        <div
          className="fixed inset-0 z-[60] bg-monad-bg flex flex-col animate-slide-up"
          onClick={() => setExpanded(false)}
        >
          <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-monad-bg to-transparent pt-6 pb-12 px-6 max-w-md mx-auto w-full flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-400">
              Record detail
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="w-10 h-10 rounded-full bg-monad-card/90 backdrop-blur-md border border-monad-border flex items-center justify-center text-neutral-400 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          <div
            className="flex-1 px-4 max-w-md mx-auto w-full pb-24 overflow-y-auto pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square rounded-[32px] overflow-hidden bg-monad-card border border-monad-border mb-6 relative">
              {hasImage && (
                <img
                  src={imageUrl}
                  className="w-full h-full object-cover"
                  alt={title}
                />
              )}

              {showError && (
                <div className="w-full h-full flex items-center justify-center text-monad-muted">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
                    Asset unavailable
                  </span>
                </div>
              )}
            </div>

            <h2 className="font-display text-5xl text-monad-text leading-tight mb-4">
              {title}
            </h2>

            <div className="flex items-center justify-between border-y border-monad-border py-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-monad-card border border-monad-border" />
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-200">
                    {shortenAddress(moment.owner)}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-monad-muted">
                    {dateLabel} • {formatTime(moment.timestamp)}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted">
                Day {moment.dayId}
              </span>
            </div>

            {description && (
              <p className="text-base text-neutral-300 mb-8 leading-relaxed">
                {description}
              </p>
            )}

            <a
              href={
                moment.txHash
                  ? `https://testnet.monadexplorer.com/tx/${moment.txHash}`
                  : `https://testnet.monadexplorer.com/address/${MOMENT_NFT_ADDRESS}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 border border-monad-border hover:bg-monad-card rounded-xl text-neutral-300 font-mono text-[10px] uppercase tracking-[0.24em] transition-colors flex justify-center items-center gap-2"
            >
              View on explorer <span className="text-monad-muted">↗</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
