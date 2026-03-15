'use client';

import { useFeed } from '@/hooks/useFeed';
import { MomentCard } from './MomentCard';
import { HACKATHON_EVENT } from '@/config/contracts';
import { isEventActive } from '@/lib/utils';

interface FeedProps {
  refreshKey: number;
}

export function Feed({ refreshKey }: FeedProps) {
  const { moments, loading, error, refetch, total } = useFeed();

  const eventActive = isEventActive(
    HACKATHON_EVENT.startTime,
    HACKATHON_EVENT.endTime
  );

  return (
    <div className="pb-24 pt-2">
      {/* Event banner */}
      {eventActive && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-monad-purple/20 to-monad-fuchsia/20 border border-monad-purple/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">{HACKATHON_EVENT.emoji}</span>
            <div>
              <p className="text-monad-text text-sm font-display font-semibold">
                {HACKATHON_EVENT.name}
              </p>
              <p className="text-monad-muted text-xs">
                Post a moment to earn the event badge!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feed header */}
      <div className="flex items-center justify-between px-4 mb-4">
        <div>
          <h2 className="text-monad-text text-lg font-display font-bold">
            Global Feed
          </h2>
          <p className="text-monad-muted text-xs">
            {total} moment{total !== 1 ? 's' : ''} minted on Monad
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-monad-card border border-monad-border text-monad-muted text-xs hover:border-monad-purple/50 hover:text-monad-text transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      {/* Loading state */}
      {loading && moments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-monad-purple border-t-transparent animate-spin mb-4" />
          <p className="text-monad-muted text-sm">Loading moments...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mx-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-red-400 text-sm mb-2">{error}</p>
          <button
            onClick={refetch}
            className="text-monad-accent text-xs hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && moments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <span className="text-4xl mb-4">🌅</span>
          <p className="text-monad-text text-lg font-display font-semibold mb-2">
            No moments yet
          </p>
          <p className="text-monad-muted text-sm max-w-[240px]">
            Be the first to capture a moment and mint it on Monad!
          </p>
        </div>
      )}

      {/* Moments grid */}
      {moments.length > 0 && (
        <div className="grid grid-cols-3 gap-1 px-1">
          {moments.map((moment) => (
            <MomentCard key={moment.tokenId.toString()} moment={moment} />
          ))}
        </div>
      )}
    </div>
  );
}
