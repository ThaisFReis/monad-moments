'use client';

interface BottomNavProps {
  activeTab: 'camera' | 'feed';
  onTabChange: (tab: 'camera' | 'feed') => void;
  canMint: boolean;
}

export function BottomNav({ activeTab, onTabChange, canMint }: BottomNavProps) {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 safe-area-bottom">
      <div className="flex items-center gap-2 p-1.5 rounded-full border border-monad-border bg-monad-card/80 backdrop-blur-2xl shadow-2xl shadow-black/50">
        <button
          onClick={() => onTabChange('feed')}
          className={`p-3 rounded-full transition-all ${
            activeTab === 'feed'
              ? 'bg-monad-text text-monad-bg'
              : 'text-monad-muted hover:text-monad-text'
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 6h13" />
            <path d="M8 12h13" />
            <path d="M8 18h13" />
            <path d="M3 6h.01" />
            <path d="M3 12h.01" />
            <path d="M3 18h.01" />
          </svg>
        </button>

        <button
          onClick={() => onTabChange('camera')}
          className="relative p-3 mx-2 rounded-full bg-monad-purple text-monad-text shadow-[0_0_20px_rgba(255,69,0,0.35)] transition-transform hover:scale-105 active:scale-95"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          {canMint && activeTab !== 'camera' && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-monad-success animate-pulse" />
          )}
        </button>
      </div>
    </nav>
  );
}
