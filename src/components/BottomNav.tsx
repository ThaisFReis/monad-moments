'use client';

interface BottomNavProps {
  activeTab: 'camera' | 'feed';
  onTabChange: (tab: 'camera' | 'feed') => void;
  canMint: boolean;
}

export function BottomNav({ activeTab, onTabChange, canMint }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-monad-bg/90 backdrop-blur-xl border-t border-monad-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {/* Camera tab */}
        <button
          onClick={() => onTabChange('camera')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === 'camera'
              ? 'text-monad-purple'
              : 'text-monad-muted hover:text-monad-text'
          }`}
        >
          <svg
            width="24"
            height="24"
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
          <span className="text-[10px] font-medium">Capture</span>
          {canMint && activeTab !== 'camera' && (
            <div className="absolute top-1 right-4 w-2 h-2 rounded-full bg-monad-success animate-pulse" />
          )}
        </button>

        {/* Feed tab */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
            activeTab === 'feed'
              ? 'text-monad-purple'
              : 'text-monad-muted hover:text-monad-text'
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-[10px] font-medium">Feed</span>
        </button>
      </div>
    </nav>
  );
}
