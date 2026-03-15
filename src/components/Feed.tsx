'use client';

import { useEffect, useState } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { MomentCard } from './MomentCard';
import { HACKATHON_EVENT } from '@/config/contracts';
import { isEventActive } from '@/lib/utils';

interface FeedProps {
  refreshKey: number;
}

export function Feed({ refreshKey }: FeedProps) {
  const { moments, loading, loadingMore, error, refetch, loadMore, hasMore, total } = useFeed();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [eventActive, setEventActive] = useState(false);

  useEffect(() => {
    setEventActive(isEventActive(HACKATHON_EVENT.startTime, HACKATHON_EVENT.endTime));
  }, []);

  useEffect(() => {
    if (refreshKey > 0) refetch();
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pb-32 pt-2">
      {eventActive && (
        <div className="mx-4 mb-8 p-4 border border-monad-purple/30 bg-monad-purple/5 rounded-[20px] flex items-start gap-4">
          <div className="text-monad-purple text-xl leading-none mt-0.5">
            {HACKATHON_EVENT.emoji}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple mb-1">
              Active event: {HACKATHON_EVENT.name}
            </p>
            <p className="font-display text-xl text-neutral-300">
              Post a moment to earn the event artifact.
            </p>
          </div>
        </div>
      )}

      <div className="px-4 mb-8 flex justify-between items-end border-b border-monad-border pb-4">
        <div>
          <h2 className="font-display text-4xl text-monad-text">Global Archive.</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mt-2">
            {total} moment{total !== 1 ? 's' : ''} anchored
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            disabled={loading}
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple disabled:opacity-40"
          >
            {loading ? 'Syncing' : 'Refresh'}
          </button>
          <div className="flex bg-monad-card rounded-lg p-1 border border-monad-border">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-neutral-800 text-white'
                  : 'text-monad-muted'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-white'
                  : 'text-monad-muted'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {loading && moments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border border-monad-border border-t-monad-purple animate-spin mb-5" />
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted">
            Loading archive
          </p>
        </div>
      )}

      {error && (
        <div className="mx-4 p-5 rounded-[24px] border border-red-500/20 bg-red-500/5">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={refetch}
            className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-purple"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && moments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-monad-muted mb-3">
            Archive empty
          </p>
          <h3 className="font-display text-4xl text-monad-text mb-3">
            No moments yet.
          </h3>
          <p className="text-sm text-neutral-400 max-w-[260px]">
            Be the first to author a record on Monad.
          </p>
        </div>
      )}

      {moments.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-1 px-1">
          {moments.map((moment) => (
            <MomentCard
              key={moment.tokenId.toString()}
              moment={moment}
              variant="grid"
            />
          ))}
        </div>
      )}

      {moments.length > 0 && viewMode === 'list' && (
        <div className="px-6">
          {moments.map((moment) => (
            <MomentCard
              key={moment.tokenId.toString()}
              moment={moment}
              variant="list"
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 rounded-full border border-monad-border bg-monad-card font-mono text-[10px] uppercase tracking-[0.24em] text-monad-text hover:border-neutral-600 hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
