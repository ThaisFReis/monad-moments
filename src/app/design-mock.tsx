// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Circle, 
  Disc, 
  Fingerprint, 
  ArrowUpRight, 
  Grid2X2, 
  List,
  Camera, 
  X,
  Plus,
  ArrowRight,
  Terminal,
  Flame,
  Shield,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  RefreshCcw,
  Play,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

// --- MOCK DATA ---
const ACTIVE_EVENT = {
  id: 'evt_1',
  name: 'Monad Blitz São Paulo',
  tag: 'MONAD_BLITZ_SP_26',
  badgeAvailable: 'Pioneer'
};

const MOCK_BADGES = [
  { id: 'b1', name: 'First Flame', type: 'streak', icon: Flame, rarity: 'Common', desc: '3-Day Sequence' },
  { id: 'b2', name: 'Blitz SP Pioneer', type: 'event', icon: MapPin, rarity: 'Epic', desc: 'Top 50 Minter' },
  { id: 'b3', name: 'Week Warrior', type: 'streak', icon: Shield, rarity: 'Uncommon', desc: '7-Day Sequence', locked: true },
];

const INITIAL_FEED = [
  {
    id: 1,
    user: { handle: 'thais.eth', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', pinnedBadge: Flame },
    time: '09:41 AM',
    date: '15 MAR 2026',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85',
    title: 'Concrete Morning',
    caption: 'Morning light piercing through the brutalist concrete structures of the inner city.',
    hashtags: ['#brutalism', '#saopaulo', '#architecture'],
    txHash: '0x8f...3a1',
    dayId: 235,
    comments: [
      { id: 101, user: '0xBuilder', text: 'Stunning light capture.' },
      { id: 102, user: 'monad.cult', text: 'The texture is incredible.' }
    ]
  },
  {
    id: 2,
    user: { handle: '0xBuilder', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', pinnedBadge: MapPin },
    time: '08:15 AM',
    date: '14 MAR 2026',
    mediaType: 'video',
    mediaUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200&q=85',
    title: 'Extraction.',
    caption: 'Dialing in the morning espresso shot. 18g in, 36g out. 25 seconds.',
    hashtags: ['#coffee', '#ritual', '#morning'],
    txHash: '0x2b...9c4',
    dayId: 234,
    comments: [
      { id: 103, user: 'thais.eth', text: 'Need this right now.' }
    ]
  },
  {
    id: 3,
    user: { handle: 'monad.cult', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80' },
    time: '14:30 PM',
    date: '13 MAR 2026',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=85',
    title: 'Offline.',
    caption: 'Disconnecting from the ledger for a few hours.',
    hashtags: ['#nature', '#disconnect', '#alps'],
    txHash: '0x4d...1f8',
    dayId: 233,
    comments: []
  }
];

export default function App() {
  const [authState, setAuthState] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('feed');
  
  // Capture Flow States
  const [captureState, setCaptureState] = useState('idle'); 
  const [mintStep, setMintStep] = useState(0);
  const [captureMode, setCaptureMode] = useState('photo');
  
  // Post Metadata States
  const [postTitle, setPostTitle] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postTags, setPostTags] = useState('');

  // Feed & Profile States
  const [feedData, setFeedData] = useState(INITIAL_FEED);
  const [feedViewMode, setFeedViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedMomentId, setSelectedMomentId] = useState(null);
  const [profileViewTab, setProfileViewTab] = useState('artifacts'); // 'artifacts' | 'archive'

  // User Data
  const [walletAddress, setWalletAddress] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [userSequence, setUserSequence] = useState(2); 

  // Font Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:ital,wght@0,400;0,700&display=swap');
      .font-editorial { font-family: 'Instrument Serif', serif; }
      .font-technical { font-family: 'Space Mono', monospace; }
      ::-webkit-scrollbar { display: none; }
      * { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // --- ACTIONS ---
  const simulateWalletConnect = () => {
    setAuthState('connecting');
    setTimeout(() => {
      setWalletAddress('0x7F9A...4bA2');
      setAuthState('registering');
    }, 1500);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (handleInput.trim().length > 2) {
      setUserHandle(handleInput.trim());
      setAuthState('authenticated');
    }
  };

  const logout = () => {
    setAuthState('landing');
    setWalletAddress('');
    setUserHandle('');
    setActiveTab('feed');
  };

  const handlePostMoment = () => {
    if(!postTitle.trim()) return; 
    setCaptureState('minting');
    setMintStep(1); 
    
    setTimeout(() => setMintStep(2), 1500); 
    setTimeout(() => setMintStep(3), 3000); 
    setTimeout(() => setMintStep(4), 5000); 
    setTimeout(() => {
      const now = new Date();
      const newMoment = {
        id: Date.now(),
        user: { handle: userHandle, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', pinnedBadge: Flame },
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: now.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}).toUpperCase(),
        mediaType: captureMode,
        mediaUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80',
        title: postTitle,
        caption: postCaption,
        hashtags: postTags.split(' ').filter(t => t.startsWith('#')),
        txHash: '0x00...new',
        dayId: 236,
        comments: []
      };
      setFeedData([newMoment, ...feedData]);
      
      setCaptureState('celebrating');
      setUserSequence(prev => prev + 1);
      
      setPostTitle('');
      setPostCaption('');
      setPostTags('');
    }, 6000);
  };

  const closeCelebration = () => {
    setCaptureState('idle');
    setMintStep(0);
    setActiveTab('feed');
    setFeedViewMode('list'); 
  };

  const handleAddComment = (momentId, text) => {
    if(!text.trim()) return;
    setFeedData(prev => prev.map(item => {
      if(item.id === momentId) {
        return {
          ...item,
          comments: [...item.comments, { id: Date.now(), user: userHandle, text: text.trim() }]
        };
      }
      return item;
    }));
  };

  // --- COMPONENTS ---

  const AuthScreen = () => (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden animate-in fade-in duration-700 max-w-md mx-auto">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] border-[1px] border-neutral-900 rounded-full opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] border-[1px] border-neutral-800 rounded-full opacity-50 pointer-events-none" />
      
      <div className="flex justify-between items-start z-10">
        <h1 className="font-editorial text-2xl italic text-neutral-100">Moments.</h1>
        <div className="text-right">
          <span className="font-technical text-[10px] text-neutral-500 uppercase tracking-widest block">Network</span>
          <span className="font-technical text-[10px] text-[#FF4500] uppercase tracking-widest flex items-center gap-2 justify-end mt-1">
            <span className="w-1.5 h-1.5 bg-[#FF4500] rounded-full animate-pulse" /> MONAD_L1
          </span>
        </div>
      </div>

      <div className="z-10 w-full">
        {authState === 'landing' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <h2 className="font-editorial text-6xl md:text-8xl text-neutral-100 leading-[0.9] mb-8">
              Establish <br/><span className="italic text-neutral-400">Identity.</span>
            </h2>
            <p className="font-technical text-sm text-neutral-500 mb-12 max-w-sm leading-relaxed">
              Connect your cryptographic ledger to author moments, preserve memories, and earn verifiable on-chain artifacts.
            </p>
            <button 
              onClick={simulateWalletConnect}
              className="w-full flex justify-between items-center bg-neutral-100 text-neutral-950 px-8 py-5 rounded-full font-technical text-xs uppercase tracking-widest hover:bg-neutral-300 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <Fingerprint size={16} /> Connect Ledger
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {authState === 'connecting' && (
          <div className="animate-in fade-in duration-500">
            <Fingerprint size={48} className="text-[#FF4500] mb-8 animate-pulse" strokeWidth={1} />
            <h2 className="font-editorial text-5xl text-neutral-100 italic mb-4">Awaiting Signature.</h2>
            <p className="font-technical text-xs text-neutral-500 uppercase tracking-widest flex items-center gap-3">
              <Terminal size={14} /> Please confirm the request in your wallet...
            </p>
          </div>
        )}

        {authState === 'registering' && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="font-editorial text-5xl md:text-6xl text-neutral-100 leading-tight mb-2">
              Claim your <br/><span className="italic">Handle.</span>
            </h2>
            <div className="font-technical text-[10px] text-neutral-500 uppercase tracking-widest mb-10 flex items-center gap-2">
              Connected: <span className="text-neutral-300 bg-neutral-900 px-2 py-1 rounded">{walletAddress}</span>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="relative w-full">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 font-technical text-2xl text-neutral-500">@</span>
              <input 
                type="text" 
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                placeholder="username"
                autoFocus
                className="w-full bg-transparent border-b border-neutral-700 py-4 pl-8 pr-12 font-technical text-2xl text-neutral-100 focus:outline-none focus:border-neutral-300 transition-colors placeholder:text-neutral-800"
              />
              <button 
                type="submit"
                disabled={handleInput.length < 3}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 transition-colors"
              >
                <ArrowRight size={24} />
              </button>
            </form>
            <p className="font-technical text-[10px] text-neutral-600 mt-4 uppercase tracking-widest">
              Minimum 3 characters. A-Z, 0-9, dots, underscores.
            </p>
          </div>
        )}
      </div>

      <div className="z-10 flex justify-between items-end">
        <span className="font-technical text-[10px] text-neutral-600 uppercase tracking-widest">EST. 2026 / SÃO PAULO</span>
        <span className="font-technical text-[10px] text-neutral-600 uppercase tracking-widest">SECURED BY MATH</span>
      </div>
    </div>
  );

  const TopBar = () => (
    <header className="fixed top-0 w-full z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-900">
      <div className="flex items-center justify-between px-6 py-5 max-w-md mx-auto">
        <h1 className="font-editorial text-3xl italic tracking-tight text-neutral-100">
          Moments.
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-technical text-[10px] text-neutral-300 uppercase tracking-widest flex items-center gap-2">
              @{userHandle}
              <Flame size={12} className="text-[#FF4500]" />
            </span>
            <span className="font-technical text-[8px] text-neutral-500 uppercase tracking-widest">
              {walletAddress}
            </span>
          </div>
          <button onClick={logout} className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-100 hover:border-neutral-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
    </header>
  );

  const FloatingNav = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-2 p-1.5 bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 rounded-full shadow-2xl">
        <button onClick={() => setActiveTab('feed')} className={`p-3 rounded-full transition-all ${activeTab === 'feed' ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <List size={20} strokeWidth={1.5} />
        </button>
        
        <button onClick={() => setActiveTab('capture')} className="p-3 mx-2 rounded-full bg-[#FF4500] text-neutral-50 shadow-[0_0_20px_rgba(255,69,0,0.4)] transition-transform hover:scale-105 active:scale-95">
          <Camera size={20} strokeWidth={2} />
        </button>
        
        <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-full transition-all ${activeTab === 'profile' ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <Disc size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );

  const CommentSection = ({ moment }) => {
    const [commentInput, setCommentInput] = useState('');
    return (
      <div className="mt-8 border-t border-neutral-800 pt-6">
        <h4 className="font-technical text-[10px] text-neutral-500 uppercase tracking-widest mb-6">Dialogue</h4>
        <div className="space-y-4 mb-6">
          {moment.comments.map(c => (
            <div key={c.id} className="flex flex-col gap-1">
              <span className="font-technical text-[10px] uppercase text-[#FF4500]">@{c.user}</span>
              <span className="font-sans text-sm text-neutral-300 leading-relaxed">{c.text}</span>
            </div>
          ))}
          {moment.comments.length === 0 && (
             <div className="font-technical text-[10px] uppercase text-neutral-600">No records found.</div>
          )}
        </div>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAddComment(moment.id, commentInput); setCommentInput(''); }}
          className="flex gap-3 items-center"
        >
          <input 
            type="text" 
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add to ledger..." 
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 font-technical text-xs text-neutral-200 focus:border-[#FF4500] focus:outline-none placeholder:text-neutral-600" 
          />
          <button 
            type="submit"
            disabled={!commentInput.trim()}
            className="text-[#FF4500] font-technical text-[10px] uppercase tracking-widest disabled:opacity-30 transition-opacity"
          >
            Post
          </button>
        </form>
      </div>
    );
  };

  // --- UI/UX SPEC 8: Feed List View (Editorial Minimalist) ---
  const FeedListCard = ({ item }) => (
    <article 
      onClick={() => setSelectedMomentId(item.id)}
      className="group cursor-pointer border-b border-neutral-900 pb-8 mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="font-technical text-[10px] uppercase tracking-widest text-neutral-500">
          {item.date} <span className="mx-1">/</span> {item.time}
        </div>
        <div className="font-technical text-[10px] uppercase tracking-widest text-[#FF4500] bg-[#FF4500]/10 px-2 py-0.5 rounded-sm">
          Archive {item.txHash.substring(0,6)}
        </div>
      </div>

      <h2 className="font-editorial text-4xl text-neutral-100 mb-4 group-hover:text-neutral-300 transition-colors">
        {item.title}
      </h2>

      <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden border border-neutral-800 rounded-[24px]">
        <img 
          src={item.mediaUrl} 
          className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
          alt={item.title} 
        />
        {item.mediaType === 'video' && (
          <div className="absolute top-4 right-4 bg-black/50 p-1.5 rounded-full backdrop-blur-md">
             <Play size={14} className="text-white" fill="currentColor" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-5">
        <div className="flex items-center gap-2">
          <img src={item.user.avatar} className="w-5 h-5 rounded-full grayscale" alt="avatar" />
          <span className="font-technical text-[10px] uppercase text-neutral-300">@{item.user.handle}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500 group-hover:text-[#FF4500] transition-colors">
           <span className="font-technical text-[10px] uppercase tracking-widest">Open Record</span>
           <ArrowRight size={14} />
        </div>
      </div>
    </article>
  );

  // Modal containing Full Details
  const MomentDetailModal = () => {
    const activeMoment = feedData.find(m => m.id === selectedMomentId);
    if (!activeMoment) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col animate-in slide-in-from-bottom-full duration-300">
        <div className="fixed top-0 w-full z-10 bg-gradient-to-b from-neutral-950 to-transparent pt-6 pb-12 px-6 flex justify-between items-center max-w-md mx-auto">
           <span className="font-technical text-[10px] text-neutral-400 uppercase tracking-widest drop-shadow-md">Record Detail</span>
           <button onClick={() => setSelectedMomentId(null)} className="w-10 h-10 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all">
             <X size={20} />
           </button>
        </div>
        
        <div className="flex-1 px-4 max-w-md mx-auto w-full pb-24 overflow-y-auto pt-20">
           
           {/* Big Media */}
           <div className="aspect-square rounded-[32px] overflow-hidden bg-neutral-900 border border-neutral-800 mb-6 relative">
             <img src={activeMoment.mediaUrl} className="w-full h-full object-cover" alt="moment" />
             {activeMoment.mediaType === 'video' && (
                <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-md">
                  <Play size={16} className="text-white" fill="currentColor" />
                </div>
              )}
           </div>
           
           <h2 className="font-editorial text-5xl text-neutral-100 leading-tight mb-4">
             {activeMoment.title}
           </h2>

           <div className="flex items-center justify-between border-y border-neutral-900 py-4 mb-6">
             <div className="flex items-center gap-3">
               <img src={activeMoment.user.avatar} className="w-8 h-8 rounded-full grayscale" alt="avatar" />
               <div className="flex flex-col">
                 <span className="font-technical text-xs uppercase tracking-widest text-neutral-200">@{activeMoment.user.handle}</span>
                 <span className="font-technical text-[9px] uppercase text-neutral-500">{activeMoment.date} • {activeMoment.time}</span>
               </div>
             </div>
             <span className="font-technical text-[10px] text-neutral-500 uppercase">DAY {activeMoment.dayId}</span>
           </div>

           {activeMoment.caption && <p className="font-sans text-base text-neutral-300 mb-6 leading-relaxed">{activeMoment.caption}</p>}
           
           {activeMoment.hashtags && activeMoment.hashtags.length > 0 && (
             <div className="flex gap-2 mb-8 flex-wrap">
               {activeMoment.hashtags.map(tag => (
                 <span key={tag} className="font-technical text-[10px] uppercase text-[#FF4500] border border-[#FF4500]/30 px-2 py-1 rounded-sm bg-[#FF4500]/5">{tag}</span>
               ))}
             </div>
           )}

           <button className="w-full py-4 border border-neutral-800 hover:bg-neutral-900 rounded-xl text-neutral-300 font-technical text-[10px] uppercase tracking-widest transition-colors flex justify-center items-center gap-2 mb-8">
             View on Explorer <ExternalLink size={14} className="text-neutral-500" />
           </button>

           <CommentSection moment={activeMoment} />
        </div>
      </div>
    );
  };

  const FeedTab = () => (
    <div className="pt-24 pb-32 max-w-md mx-auto animate-in fade-in duration-500">
      
      {/* Event Banner */}
      <div className="mx-4 mb-8 p-4 border border-[#FF4500]/30 bg-[#FF4500]/5 rounded-[20px] flex items-start gap-4">
        <MapPin className="text-[#FF4500] shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-technical text-[10px] text-[#FF4500] uppercase tracking-widest mb-1">Active Event: {ACTIVE_EVENT.name}</h3>
          <p className="font-editorial text-xl text-neutral-300">Post a moment to earn the artifact.</p>
        </div>
      </div>

      <div className="px-4 mb-8 flex justify-between items-end border-b border-neutral-900 pb-4">
        <div>
          <h2 className="font-editorial text-3xl text-neutral-100">Global Archive.</h2>
          <span className="font-technical text-[10px] text-neutral-500 uppercase tracking-widest">14,204 moments anchored</span>
        </div>
        
        {/* Feed View Toggle */}
        <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          <button 
            onClick={() => setFeedViewMode('list')}
            className={`p-2 rounded-md transition-all ${feedViewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setFeedViewMode('grid')}
            className={`p-2 rounded-md transition-all ${feedViewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
          >
            <Grid2X2 size={16} />
          </button>
        </div>
      </div>

      {feedViewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-1 px-1">
          {feedData.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedMomentId(item.id)}
              className="aspect-square relative bg-neutral-900 overflow-hidden group cursor-pointer"
            >
              <img 
                src={item.mediaUrl} 
                alt="Moment" 
                className="w-full h-full object-cover grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105" 
              />
              {item.mediaType === 'video' && (
                <div className="absolute top-2 right-2">
                  <Play size={14} className="text-white drop-shadow-md" fill="currentColor" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6">
          {feedData.map(item => <FeedListCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );

  const CaptureTab = () => {
    // 1. CELEBRATION STATE (Post-Mint)
    if (captureState === 'celebrating') {
      return (
        <div className="fixed inset-0 z-50 bg-[#FF4500] text-neutral-50 flex flex-col p-8 animate-in slide-in-from-bottom-full duration-500 max-w-md mx-auto">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-editorial text-7xl md:text-8xl italic leading-[0.9] mb-8 animate-in slide-in-from-left-8 delay-150 duration-700">
              Sequence<br/>Extended.
            </h2>
            
            <div className="space-y-6 animate-in fade-in delay-500 duration-1000">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-white flex items-center justify-center">
                  <span className="font-editorial text-3xl">{userSequence}</span>
                </div>
                <div>
                  <span className="font-technical text-[10px] uppercase tracking-widest opacity-80 block mb-1">Current Streak</span>
                  <span className="font-technical text-sm font-bold tracking-widest">DAYS ACTIVE</span>
                </div>
              </div>

              {/* Badge Unlock Simulation */}
              {userSequence === 3 && (
                <div className="p-4 bg-black/20 border border-white/30 rounded-[20px] backdrop-blur-sm flex items-start gap-4">
                  <div className="p-3 bg-white text-[#FF4500] rounded-xl"><Flame size={24} /></div>
                  <div>
                    <span className="font-technical text-[10px] uppercase tracking-widest opacity-80 block mb-1">ARTIFACT ISSUED</span>
                    <span className="font-technical text-sm font-bold tracking-widest">FIRST FLAME [ERC-1155]</span>
                  </div>
                </div>
              )}
              
              <div className="p-4 border border-white/20 rounded-[20px] flex items-start gap-4">
                <div className="p-3 bg-white/10 text-white rounded-xl"><MapPin size={24} /></div>
                <div>
                  <span className="font-technical text-[10px] uppercase tracking-widest opacity-80 block mb-1">EVENT RECORDED</span>
                  <span className="font-technical text-sm font-bold tracking-widest">MONAD BLITZ SP PIONEER</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-40 flex flex-col items-center justify-center pb-12">
            <button onClick={closeCelebration} className="w-full py-5 rounded-full bg-white text-[#FF4500] font-technical text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-2xl">
              View Feed <ArrowRight size={16} />
            </button>
          </div>
        </div>
      );
    }

    // 2. MINT PIPELINE STATE
    if (captureState === 'minting') {
      return (
        <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col max-w-md mx-auto">
          <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
            <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80" className="w-full h-full object-cover" alt="" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center px-8">
            <h2 className="font-editorial text-5xl text-neutral-100 italic mb-12">Anchoring...</h2>
            
            <div className="space-y-6 font-technical text-xs tracking-widest uppercase">
              <div className={`flex items-center gap-4 transition-opacity duration-500 ${mintStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                {mintStep > 1 ? <CheckCircle2 size={16} className="text-[#FF4500]" /> : <div className="w-4 h-4 border border-neutral-500 animate-spin" />}
                <span className={mintStep === 1 ? 'text-white' : 'text-neutral-500'}>EXTRACTING_METADATA</span>
              </div>
              
              <div className={`flex items-center gap-4 transition-opacity duration-500 ${mintStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                {mintStep > 2 ? <CheckCircle2 size={16} className="text-[#FF4500]" /> : mintStep === 2 ? <div className="w-4 h-4 border border-neutral-500 animate-spin" /> : <div className="w-4 h-4 border border-neutral-800" />}
                <span className={mintStep === 2 ? 'text-white' : 'text-neutral-500'}>UPLOADING_IPFS</span>
              </div>

              <div className={`flex items-center gap-4 transition-opacity duration-500 ${mintStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                {mintStep > 3 ? <CheckCircle2 size={16} className="text-[#FF4500]" /> : mintStep === 3 ? <div className="w-4 h-4 border border-[#FF4500] animate-pulse" /> : <div className="w-4 h-4 border border-neutral-800" />}
                <span className={mintStep === 3 ? 'text-[#FF4500]' : 'text-neutral-500'}>AWAITING_SIGNATURE</span>
              </div>

              <div className={`flex flex-col gap-2 transition-opacity duration-500 ${mintStep >= 4 ? 'opacity-100' : 'opacity-30'}`}>
                <div className="flex items-center gap-4">
                  {mintStep > 4 ? <CheckCircle2 size={16} className="text-[#FF4500]" /> : mintStep === 4 ? <div className="w-4 h-4 border border-neutral-500 animate-spin" /> : <div className="w-4 h-4 border border-neutral-800" />}
                  <span className={mintStep === 4 ? 'text-white' : 'text-neutral-500'}>ANCHORING_L1</span>
                </div>
                {mintStep >= 4 && (
                  <span className="text-[9px] text-neutral-600 ml-8">MONAD_FINALITY: ~800MS</span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. PREVIEW & METADATA ENTRY STATE (Form)
    if (captureState === 'preview') {
      return (
        <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col max-w-md mx-auto overflow-hidden">
          
          <div className="flex-1 relative mx-2 mt-4 rounded-t-[40px] overflow-hidden bg-neutral-900 border-x border-t border-neutral-800">
            <img 
              src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80" 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
            
            {/* Top HUD */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <button onClick={() => setCaptureState('idle')} className="flex items-center gap-2 bg-neutral-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-technical text-[10px] uppercase tracking-widest hover:bg-neutral-900 transition-colors">
                <ArrowLeft size={14} /> Retake
              </button>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
          </div>

          {/* Form Area */}
          <div className="bg-neutral-950 px-6 pt-4 pb-8 border-t border-neutral-800 rounded-b-[40px] mx-2 mb-4 z-20 shadow-2xl shadow-black">
             <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  placeholder="TITLE..." 
                  className="font-editorial text-3xl bg-transparent border-b border-neutral-800 pb-2 text-white placeholder:text-neutral-700 focus:outline-none focus:border-[#FF4500] transition-colors" 
                />
                <textarea 
                  value={postCaption}
                  onChange={e => setPostCaption(e.target.value)}
                  placeholder="Describe this moment..." 
                  className="font-sans text-sm bg-transparent border-b border-neutral-800 pb-2 text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-[#FF4500] resize-none h-14 transition-colors" 
                />
                <input 
                  type="text" 
                  value={postTags}
                  onChange={e => setPostTags(e.target.value)}
                  placeholder="#HASHTAGS" 
                  className="font-technical text-[10px] uppercase tracking-widest bg-transparent border-b border-neutral-800 pb-2 text-[#FF4500] placeholder:text-neutral-700 focus:outline-none focus:border-[#FF4500] transition-colors" 
                />
                
                <button 
                  onClick={handlePostMoment}
                  disabled={!postTitle.trim()}
                  className="mt-4 w-full py-4 rounded-xl bg-[#FF4500] text-neutral-50 font-technical text-[11px] uppercase tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e03d00] transition-colors"
                >
                  AUTHOR MOMENT
                </button>
             </div>
          </div>
        </div>
      );
    }

    // 4. IDLE CAMERA STATE 
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col animate-in zoom-in-95 duration-300 max-w-md mx-auto">
        <div className="flex items-center justify-between px-6 pt-12 pb-4">
          <div className="flex flex-col">
            <span className="font-technical text-[#FF4500] text-[10px] uppercase tracking-widest animate-pulse">
              ● REC_READY
            </span>
            <span className="font-technical text-neutral-500 text-[10px] uppercase tracking-widest">
              MONAD_L1 // 0.8S_FINALITY
            </span>
          </div>
          <button onClick={() => setActiveTab('feed')} className="p-2 text-neutral-400 hover:text-white transition-colors">
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        <div className="flex-1 relative mx-4 mb-4 rounded-[40px] overflow-hidden bg-neutral-900 border border-neutral-800">
          <img 
            src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80" 
            alt="Viewfinder" 
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-8 left-8 text-white/30"><Plus size={24} strokeWidth={1}/></div>
          <div className="absolute top-8 right-8 text-white/30"><Plus size={24} strokeWidth={1}/></div>
          <div className="absolute bottom-8 left-8 text-white/30"><Plus size={24} strokeWidth={1}/></div>
          <div className="absolute bottom-8 right-8 text-white/30"><Plus size={24} strokeWidth={1}/></div>

          <button className="absolute top-6 right-6 w-10 h-10 bg-neutral-950/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-neutral-900 transition-colors">
            <RefreshCcw size={16} />
          </button>

          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-3">
            <MapPin size={12} className="text-[#FF4500]" />
            <span className="font-technical text-[10px] uppercase tracking-widest text-white drop-shadow-md">
              {ACTIVE_EVENT.tag}
            </span>
          </div>
        </div>

        <div className="h-48 flex flex-col items-center justify-start pt-6 pb-safe">
          <div className="flex bg-neutral-900 rounded-full p-1 mb-6 border border-neutral-800">
            <button 
              onClick={() => setCaptureMode('photo')}
              className={`px-6 py-2 rounded-full font-technical text-[10px] uppercase tracking-widest transition-colors ${captureMode === 'photo' ? 'bg-neutral-100 text-black' : 'text-neutral-500'}`}
            >
              Photo
            </button>
            <button 
              onClick={() => setCaptureMode('video')}
              className={`px-6 py-2 rounded-full font-technical text-[10px] uppercase tracking-widest transition-colors ${captureMode === 'video' ? 'bg-neutral-100 text-black' : 'text-neutral-500'}`}
            >
              1S Video
            </button>
          </div>

          <button 
            onClick={() => setCaptureState('preview')}
            className={`w-20 h-20 rounded-full border border-neutral-700 flex items-center justify-center p-2 transition-all duration-300 hover:border-neutral-500 active:scale-95`}
          >
            <div className={`w-full h-full rounded-full flex items-center justify-center ${captureMode === 'video' ? 'bg-[#FF4500]' : 'bg-neutral-100'}`}>
               {captureMode === 'video' ? <div className="w-6 h-6 bg-white rounded-sm" /> : <div className="w-14 h-14 border border-neutral-300 rounded-full" />}
            </div>
          </button>
        </div>
      </div>
    );
  };

  const ProfileTab = () => (
    <div className="pt-24 pb-32 max-w-md mx-auto px-6 animate-in fade-in duration-500">
      
      {/* Editorial Profile Header */}
      <div className="mb-8 flex items-end justify-between border-b border-neutral-900 pb-6">
        <div>
          <div className="w-16 h-16 rounded-full border border-neutral-700 bg-neutral-900 overflow-hidden mb-4">
             <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" className="w-full h-full object-cover grayscale" alt="avatar" />
          </div>
          <h2 className="font-editorial text-5xl text-neutral-100 italic tracking-tight leading-none">
            @{userHandle}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-2 pb-1">
          <span className="px-2 py-1 border border-[#FF4500]/50 text-[#FF4500] font-technical text-[8px] uppercase tracking-widest rounded-sm bg-[#FF4500]/10">
            Active Identity
          </span>
          <span className="font-technical text-[9px] text-neutral-500 tracking-widest uppercase">
            {walletAddress}
          </span>
        </div>
      </div>

      {/* Structural Stats */}
      <div className="flex mb-10 border-b border-neutral-900 pb-8">
         <div className="flex-1 border-r border-neutral-900 pr-4">
           <span className="block font-technical text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Authored</span>
           <span className="font-editorial text-5xl text-neutral-100">42</span>
         </div>
         <div className="flex-1 pl-6 relative">
           <span className="block font-technical text-[9px] text-[#FF4500] uppercase tracking-widest mb-1">Sequence</span>
           <span className="font-editorial text-5xl text-[#FF4500]">{userSequence}</span>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-900 mb-8">
        <button 
          onClick={() => setProfileViewTab('artifacts')}
          className={`flex-1 pb-4 font-technical text-[10px] uppercase tracking-widest transition-colors border-b-2 ${profileViewTab === 'artifacts' ? 'border-[#FF4500] text-white' : 'border-transparent text-neutral-600 hover:text-neutral-400'}`}
        >
          Artifacts
        </button>
        <button 
          onClick={() => setProfileViewTab('archive')}
          className={`flex-1 pb-4 font-technical text-[10px] uppercase tracking-widest transition-colors border-b-2 ${profileViewTab === 'archive' ? 'border-[#FF4500] text-white' : 'border-transparent text-neutral-600 hover:text-neutral-400'}`}
        >
          Archive
        </button>
      </div>

      {/* Tab Content */}
      {profileViewTab === 'artifacts' && (
        <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
          {MOCK_BADGES.map(badge => {
            const isUnlocked = !badge.locked || (badge.id === 'b1' && userSequence >= 3) || (badge.id === 'b3' && userSequence >= 7);
            return (
              <div key={badge.id} className={`bg-neutral-900 border border-neutral-800 rounded-[20px] p-5 flex flex-col items-center text-center transition-all ${isUnlocked ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 ${isUnlocked ? 'border-neutral-700 text-neutral-200' : 'border-neutral-800 text-neutral-600'}`}>
                  <badge.icon size={16} />
                </div>
                <h4 className="font-technical text-[9px] text-neutral-300 uppercase tracking-widest mb-1">{badge.name}</h4>
                <span className="font-editorial text-xs text-neutral-500 italic">{badge.desc}</span>
              </div>
            );
          })}
        </div>
      )}

      {profileViewTab === 'archive' && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-editorial text-2xl text-neutral-300">Mar 2026</h3>
            <span className="font-technical text-[9px] text-[#FF4500] tracking-widest uppercase border border-[#FF4500]/30 bg-[#FF4500]/5 px-2 py-1 rounded">28 Days</span>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
             {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-center font-technical text-[8px] text-neutral-600">{d}</div>
             ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const isMissed = i === 5 || i === 12;
              const isFuture = i > 15;
              const isPosted = !isMissed && !isFuture;
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-lg flex items-center justify-center border transition-all ${
                    isPosted 
                      ? 'border-neutral-600 bg-neutral-800 text-neutral-300' 
                      : isFuture
                        ? 'border-neutral-900 bg-transparent text-neutral-800'
                        : 'border-dashed border-neutral-800 bg-neutral-950 text-neutral-800'
                  }`}
                >
                  <span className="font-technical text-[8px]">{i + 1}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );

  // --- MAIN RENDER ---
  if (authState !== 'authenticated') {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-[#FF4500]/30 selection:text-white flex justify-center">
      <div className="w-full max-w-md relative min-h-screen shadow-2xl shadow-black/50 bg-neutral-950">
        
        {captureState === 'idle' && <TopBar />}
        
        <main className="relative min-h-screen">
          {activeTab === 'feed' && captureState === 'idle' && <FeedTab />}
          {activeTab === 'capture' && <CaptureTab />}
          {activeTab === 'profile' && captureState === 'idle' && <ProfileTab />}
        </main>

        {captureState === 'idle' && <FloatingNav />}
        
        <MomentDetailModal />
      </div>
    </div>
  );
}
