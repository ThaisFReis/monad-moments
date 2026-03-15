'use client';

import { useState } from 'react';
import { MomentItem } from '@/hooks/useFeed';
import { resolveContentURI, PINATA_GATEWAY } from '@/config/contracts';
import { shortenAddress, formatTime } from '@/lib/utils';

interface MomentCardProps {
  moment: MomentItem;
}

export function MomentCard({ moment }: MomentCardProps) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Build the image URL from IPFS
  // contentURI may point to metadata JSON or directly to the image
  const imageUrl = resolveContentURI(moment.contentURI);

  // If the contentURI points to metadata, we need to fetch the image field
  // For MVP simplicity, we display a placeholder if direct resolve fails
  // and the actual image will be loaded from the media CID

  return (
    <>
      {/* Grid card */}
      <button
        onClick={() => setExpanded(true)}
        className="relative aspect-square rounded-xl overflow-hidden bg-monad-card border border-monad-border hover:border-monad-purple/50 transition-all group"
      >
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`Moment #${moment.tokenId}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-monad-muted">
            <span className="text-2xl mb-1">📸</span>
            <span className="text-[10px]">#{moment.tokenId.toString()}</span>
          </div>
        )}

        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-[10px] font-mono">
            {shortenAddress(moment.owner)}
          </p>
          <p className="text-white/60 text-[10px]">
            {formatTime(moment.timestamp)}
          </p>
        </div>
      </button>

      {/* Expanded detail modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-[60] bg-monad-bg/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="max-w-sm w-full animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-monad-card border border-monad-border flex items-center justify-center text-monad-muted hover:text-monad-text"
            >
              ✕
            </button>

            {/* Image */}
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-monad-card mb-4">
              {!imageError ? (
                <img
                  src={imageUrl}
                  alt={`Moment #${moment.tokenId}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-monad-muted">
                  <span className="text-5xl">📸</span>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              {/* Token ID + time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-monad-purple to-monad-accent" />
                  <span className="text-monad-text text-sm font-mono">
                    {shortenAddress(moment.owner)}
                  </span>
                </div>
                <span className="text-monad-muted text-xs">
                  {formatTime(moment.timestamp)}
                </span>
              </div>

              {/* On-chain info */}
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-1 rounded-lg bg-monad-card border border-monad-border text-monad-accent font-mono">
                  Moment #{moment.tokenId.toString()}
                </span>
                <span className="px-2 py-1 rounded-lg bg-monad-card border border-monad-border text-monad-muted font-mono">
                  Day {moment.dayId}
                </span>
              </div>

              {/* Explorer link */}
              <a
                href={`https://testnet.monadexplorer.com/tx/${moment.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2.5 rounded-xl border border-monad-border text-monad-accent text-sm font-medium hover:border-monad-accent/50 transition-colors"
              >
                View on Monad Explorer →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
