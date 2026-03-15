# Monad Moments MVP Documentation

## 1. Project Overview

Monad Moments is a mobile-first Web3 app where a user captures one daily moment (photo or 1-second video) and mints it as an NFT on Monad Testnet.

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind, RainbowKit, wagmi, viem
- Contract: Solidity ERC-721 (`MomentNFT.sol`) with daily mint guard
- Storage: IPFS (Pinata)
- Chain: Monad Testnet (`chainId: 10143`)

## 2. MVP Scope

Included in MVP:
- Wallet connect + Monad network onboarding
- Username setup and local onboarding state
- Camera capture (photo + 1-second video)
- One-button mint pipeline (process media, upload IPFS, call contract)
- On-chain feed based on minted token IDs
- Event badge metadata during event window

Out of scope in MVP:
- Backend database/indexer
- Social graph (likes/comments/follows)
- Streak contracts or separate badge contracts
- Mainnet deployment

## 3. Core User Flow

1. User connects wallet.
2. User creates username (stored in localStorage).
3. User completes onboarding (wallet/network/faucet guidance).
4. User opens camera and captures media.
5. User presses post, triggering:
   - EXIF stripping + compression for photos
   - Optional event composite generation
   - Media upload to Pinata
   - Metadata upload to Pinata
   - `mint(contentURI)` on `MomentNFT`
6. Feed refreshes and shows the new minted moment.

## 4. Smart Contract

Path: `contracts/MomentNFT.sol`

Implemented behavior:
- ERC-721 token (`Monad Moments`, `MOMENT`)
- `mint(string contentURI)` enforces:
  - non-empty URI
  - max URI length of 512
  - one mint per UTC day per wallet (`hasMinted[address][dayId]`)
- `devWhitelist` bypass for allowed addresses
- `canMintToday(address)` helper for UI gating
- `pause/unpause` owner-only emergency controls
- `MomentMinted(owner, tokenId, dayId, contentURI, blockTimestamp)` event

Day ID formula:
- `dayId = uint32(block.timestamp / 1 days)`

## 5. Frontend Architecture

### Main app shell
- `src/app/page.tsx`: root composition, tab state, mint eligibility check, onboarding/profile gates

### Components
- `Header`, `BottomNav`: navigation and wallet actions
- `CameraView`: capture/post interaction
- `MintOverlay`: mint pipeline feedback
- `Feed`, `MomentCard`: global timeline display
- `Onboarding`, `UsernameSetup`: first-use experience

### Hooks
- `useCamera`: stream lifecycle, capture, 1-second recording, facing switch
- `useMint`: processing + IPFS upload + contract write + receipt parsing
- `useFeed`: reads `totalSupply`, token data (`tokenURI`, `ownerOf`, `getDayId`) and metadata
- `useLocation`: optional geolocation capture

### Data helpers
- `src/config/contracts.ts`: ABI, contract address, event window config, URI resolver
- `src/config/wagmi.ts`: Monad Testnet chain config + RainbowKit config
- `src/lib/*`: EXIF/compression, Pinata upload helpers, profile persistence, utilities

## 6. API Routes

Server routes are used for Pinata uploads:

- `POST /api/pinata/file`
  - multipart form with `file`, optional `filename`
  - returns `{ cid }`

- `POST /api/pinata/metadata`
  - JSON metadata payload
  - returns `{ cid }`

Runtime: `nodejs` for both routes.

## 7. Environment Variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `PINATA_JWT`
- `NEXT_PUBLIC_PINATA_GATEWAY`
- `NEXT_PUBLIC_PINATA_GATEWAY_TOKEN`
- `NEXT_PUBLIC_MOMENT_NFT_ADDRESS`
- `NEXT_PUBLIC_MONAD_RPC` (optional; defaults to `https://testnet-rpc.monad.xyz`)

## 8. Local Development

```bash
cd monad-moments-mvp
npm install
cp .env.example .env.local
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```

## 9. Contract Deployment (Foundry)

```bash
forge create contracts/MomentNFT.sol:MomentNFT \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast
```

Then set deployed address in:
- `NEXT_PUBLIC_MOMENT_NFT_ADDRESS`

## 10. Metadata Shape

Mint metadata uploaded to IPFS follows this format:

```json
{
  "image": "ipfs://<cid>",
  "name": "optional title",
  "description": "optional description",
  "attributes": [
    { "trait_type": "Type", "value": "photo" },
    { "trait_type": "Day", "value": "2026-03-15" },
    { "trait_type": "Event", "value": "Monad Blitz Rio de Janeiro" }
  ],
  "animation_url": "ipfs://<cid>"
}
```

Notes:
- `animation_url` is present for event-composited photo mints.
- Location traits are included only when permission is granted.

## 11. Current Limitations / Risks

- Feed pagination is token-ID based; no external indexer.
- Metadata fetches rely on gateway availability and cross-origin behavior.
- Username and onboarding state are localStorage-only (per browser/device).
- Dev whitelist bypass exists in contract and UI for demo operations.
- Video handling depends on browser MediaRecorder support.

## 12. Demo Checklist

1. Wallet installed (MetaMask Mobile recommended).
2. Monad Testnet configured in wallet.
3. Test MON funded from faucet.
4. `.env.local` has valid WalletConnect + Pinata + contract address.
5. Capture and mint a moment.
6. Confirm new item appears in feed.
