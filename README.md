# Monad Moments — MVP

> Capture one moment per day. Mint it forever on Monad.

**Built for Monad Blitz Rio de Janeiro 2026**

---

## What is this?

Monad Moments is a social journaling dApp where users capture a single photo or 1-second video each day and mint it as an ERC-721 NFT on the Monad blockchain. The smart contract enforces the **one-post-per-day rule on-chain** — not just in the app.

### Key differentiators:
- **On-chain scarcity**: The 1/day limit is enforced by the smart contract, not the UI
- **Permanent storage**: Media lives on IPFS; ownership record is on Monad forever
- **Sub-second finality**: Monad's ~800ms finality makes minting feel instant
- **Near-zero cost**: ~$0.005 per mint on Monad
- **Event badges**: First mint during the hackathon earns an event badge

---

## User Flow (ONE-BUTTON Design)

```
┌──────────────────────────────────────────────────────┐
│                    USER FLOW                          │
│                                                      │
│  1. Connect wallet (RainbowKit — any mobile wallet)  │
│         ↓                                            │
│  2. Allow location (while using app)                 │
│         ↓                                            │
│  3. Camera opens → tap CAPTURE (photo or 1s video)   │
│         ↓                                            │
│  4. Preview → tap "POST MOMENT ✨" ← ONE BUTTON     │
│         ↓                                            │
│     ┌─────── ONE BUTTON TRIGGERS ALL OF THIS: ───┐   │
│     │  a) Strip EXIF metadata (privacy)           │   │
│     │  b) Compress image to <2MB                  │   │
│     │  c) Upload media to IPFS via Pinata         │   │
│     │  d) Upload NFT metadata JSON to IPFS        │   │
│     │  e) Call mint() on MomentNFT contract       │   │
│     │  f) Wait for Monad confirmation (~800ms)    │   │
│     └────────────────────────────────────────────┘   │
│         ↓                                            │
│  5. Celebration screen + confetti                    │
│     (+ hackathon badge if during event window)       │
│         ↓                                            │
│  6. Photo appears in the global feed                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The user only presses **two buttons total**: CAPTURE → POST. Everything else is automatic.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Wallet | RainbowKit v2 + WalletConnect v2 |
| Chain interaction | wagmi v2 + viem |
| Storage | IPFS via Pinata |
| Smart contract | Solidity 0.8.24, OpenZeppelin, Foundry |
| Blockchain | Monad Testnet (Chain ID 10143) |
| Styling | Tailwind CSS |
| Camera | `getUserMedia` API |
| Privacy | Canvas-based EXIF stripping |
| PWA | manifest.json + standalone mode |

---

## Project Structure

```
monad-moments-mvp/
├── contracts/
│   └── MomentNFT.sol          # Core ERC-721 smart contract
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind + Monad dark theme
│   │   ├── layout.tsx          # Root layout with Providers
│   │   └── page.tsx            # Main page (tab navigation)
│   ├── components/
│   │   ├── Providers.tsx       # RainbowKit + wagmi + React Query
│   │   ├── Header.tsx          # Top bar with wallet connect
│   │   ├── BottomNav.tsx       # Tab navigation (Camera / Feed)
│   │   ├── CameraView.tsx      # Full camera + preview + POST button
│   │   ├── MintOverlay.tsx     # Pipeline progress (4-step indicator)
│   │   ├── BadgeCelebration.tsx # Confetti + badge earned modal
│   │   ├── MomentCard.tsx      # Individual moment in feed grid
│   │   └── Feed.tsx            # Scrollable feed from on-chain events
│   ├── config/
│   │   ├── wagmi.ts            # Monad testnet chain + RainbowKit config
│   │   └── contracts.ts        # ABI, address, URI resolver, event config
│   ├── hooks/
│   │   ├── useCamera.ts        # getUserMedia, photo capture, 1s video
│   │   ├── useLocation.ts      # Geolocation permission + coordinates
│   │   ├── useMint.ts          # THE ONE-BUTTON PIPELINE (core hook)
│   │   └── useFeed.ts          # On-chain event log queries for feed
│   └── lib/
│       ├── exif.ts             # EXIF strip + compression via canvas
│       ├── pinata.ts           # Pinata IPFS upload (file + JSON)
│       └── utils.ts            # Address formatting, time, dayId calc
├── public/
│   └── manifest.json           # PWA manifest
├── .env.example                # Required environment variables
├── package.json
├── tailwind.config.js          # Monad-inspired color palette
├── tsconfig.json
└── README.md                   # ← You are here
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- A WalletConnect project ID (free at https://cloud.walletconnect.com)
- A Pinata account + JWT token (free at https://pinata.cloud)
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- Testnet MON from https://faucet.monad.xyz

### 1. Clone & install

```bash
cd monad-moments-mvp
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your values:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
PINATA_JWT=your_jwt_here
NEXT_PUBLIC_PINATA_GATEWAY=your-gateway.mypinata.cloud
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
```

### 3. Deploy the smart contract

```bash
# Install Foundry dependencies
forge install OpenZeppelin/openzeppelin-contracts

# Deploy to Monad Testnet
forge create contracts/MomentNFT.sol:MomentNFT \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast
```

Copy the deployed address and add to `.env.local`:

> **Already deployed:** `0xe389AB80e846F5640483Be330Dc2491d4E488EEd` (Monad Testnet, 2026-03-15)
> Tx: `0x9fd7e50b2bb69636655d07322b42662a20ac2b93e9d8fae7a4f3a21c9d329c81`
```
NEXT_PUBLIC_MOMENT_NFT_ADDRESS=0xe389AB80e846F5640483Be330Dc2491d4E488EEd
```

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` on your mobile browser (or use Chrome DevTools device emulation).

---

## Smart Contract: MomentNFT.sol

The contract is intentionally minimal for hackathon scope:

| Feature | Implementation |
|---------|---------------|
| Standard | ERC-721 (OpenZeppelin) |
| Daily limit | `hasMinted[address][dayId]` mapping |
| Day calculation | `dayId = block.timestamp / 86400` (UTC) |
| Content storage | Generic `contentURI` (supports `ipfs://`, `ar://`, `https://`) |
| Max URI length | 512 bytes (prevents gas griefing) |
| Emergency | `pause()` / `unpause()` by owner |
| Events | `MomentMinted` — used for feed queries via `getLogs` |

### Contract Invariants
1. One address can only mint once per `dayId` (UTC-based)
2. `tokenId` is sequential starting from 0
3. `contentURI` is immutable after minting
4. `MomentMinted` event emitted for every successful mint

---

## Mobile Wallet Recommendations

The app uses **RainbowKit v2** which supports WalletConnect v2. Best options for mobile browser:

| Wallet | Why | Notes |
|--------|-----|-------|
| **MetaMask Mobile** | Most widely used, built-in browser | Add Monad testnet manually in Networks |
| **Rainbow** | Clean UX, native WalletConnect | Great for demos |
| **Coinbase Wallet** | One-click social login option | Lowest friction for non-crypto users |

**For the hackathon demo**: MetaMask Mobile is the safest bet. Have judges install it and add Monad testnet before the demo. Pre-fund 2-3 wallets with testnet MON.

---

## Hackathon Badge Logic

The MVP includes a simplified event badge system:

1. The `HACKATHON_EVENT` config in `contracts.ts` defines the event window
2. When a user mints during the event window, the NFT metadata includes an `Event` attribute
3. The `BadgeCelebration` component shows a special celebration with confetti
4. Badge is visual-only in the MVP (no separate ERC-1155 contract)

For production, this would connect to the full `EventRegistry` + `BadgeSystem` contracts from the gamification spec.

---

## Architecture Decisions (Hackathon Scope)

| Decision | Rationale |
|----------|-----------|
| No backend | Feed reads directly from on-chain `MomentMinted` events via `getLogs`. Works for <100 moments. |
| IPFS (not Arweave) | Pinata has instant CID, free tier, 2-line SDK. Arweave needs AR tokens + minutes to confirm. |
| No SIWE auth | Wallet address = identity. No session management needed without a backend. |
| Canvas EXIF strip | Privacy is non-negotiable. Canvas redraw strips all GPS, device, and camera metadata. |
| PWA (not native) | Fastest path to demo. `getUserMedia` works on mobile Chrome. PWA install prompt for app feel. |
| UTC dayId | Simple, deterministic. Frontend shows "Day resets at [21:00 BRT]" for local context. |

---

## Post-Hackathon Roadmap

- [ ] Deploy `StreakTracker` + `BadgeSystem` (ERC-1155) contracts
- [ ] Migrate IPFS → Arweave via Irys bundler
- [ ] Build backend + indexer (event listener → PostgreSQL → REST API)
- [ ] Implement SIWE authentication
- [ ] Add streak counter and calendar heatmap
- [ ] Push notifications for daily reminders
- [ ] Full event badge claim flow with `EventRegistry`
- [ ] Retrospective: auto-play 365 moments as a video

---

## License

MIT — Built for Monad Blitz Rio de Janeiro 2026
