'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MOMENT_NFT_ABI, MOMENT_NFT_ADDRESS, HACKATHON_EVENT } from '@/config/contracts';
import { stripExifAndCompress } from '@/lib/exif';
import { uploadToPinata, uploadMetadata } from '@/lib/pinata';
import { generateFilename, isEventActive } from '@/lib/utils';

export type MintStep =
  | 'idle'
  | 'processing'    // Stripping EXIF + compressing
  | 'uploading'     // Uploading to IPFS
  | 'confirming'    // Waiting for user to sign tx
  | 'minting'       // Transaction submitted, waiting for confirmation
  | 'success'       // All done — show badge!
  | 'error';

interface MintState {
  step: MintStep;
  progress: string;
  txHash: string | null;
  tokenId: bigint | null;
  ipfsCid: string | null;
  earnedBadge: boolean;
  error: string | null;
}

export function useMint() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [state, setState] = useState<MintState>({
    step: 'idle',
    progress: '',
    txHash: null,
    tokenId: null,
    ipfsCid: null,
    earnedBadge: false,
    error: null,
  });

  // Reset state for a new mint
  const reset = useCallback(() => {
    setState({
      step: 'idle',
      progress: '',
      txHash: null,
      tokenId: null,
      ipfsCid: null,
      earnedBadge: false,
      error: null,
    });
  }, []);

  /**
   * THE ONE-BUTTON FLOW
   * Takes a captured blob and runs the entire pipeline:
   * 1. Strip EXIF + compress
   * 2. Upload media to IPFS via Pinata
   * 3. Upload NFT metadata JSON to IPFS
   * 4. Call mint() on MomentNFT contract
   * 5. Wait for transaction confirmation
   * 6. Check if hackathon badge earned
   */
  const mintMoment = useCallback(
    async (blob: Blob, type: 'photo' | 'video', location?: { lat: number; lng: number }) => {
      if (!address) {
        setState((prev) => ({ ...prev, step: 'error', error: 'Wallet not connected' }));
        return;
      }

      try {
        // === STEP 1: Process media ===
        setState({
          step: 'processing',
          progress: 'Preparing your moment...',
          txHash: null,
          tokenId: null,
          ipfsCid: null,
          earnedBadge: false,
          error: null,
        });

        let processedBlob: Blob;
        if (type === 'photo') {
          processedBlob = await stripExifAndCompress(blob);
        } else {
          // Videos don't go through canvas EXIF strip — just pass through
          processedBlob = blob;
        }

        // === STEP 2: Upload to IPFS ===
        setState((prev) => ({
          ...prev,
          step: 'uploading',
          progress: 'Uploading to IPFS...',
        }));

        const filename = generateFilename(type);
        const mediaCid = await uploadToPinata(processedBlob, filename);
        const mediaUri = `ipfs://${mediaCid}`;

        // Build NFT metadata
        const now = new Date();
        const attributes: Array<{ trait_type: string; value: string | number }> = [
          { trait_type: 'Type', value: type },
          { trait_type: 'Day', value: now.toISOString().split('T')[0] },
        ];

        if (location) {
          // Store approximate location (2 decimal places ≈ 1.1km precision)
          attributes.push(
            { trait_type: 'Latitude', value: Number(location.lat.toFixed(2)) },
            { trait_type: 'Longitude', value: Number(location.lng.toFixed(2)) }
          );
        }

        // Check if this is during the hackathon event
        const duringEvent = isEventActive(
          HACKATHON_EVENT.startTime,
          HACKATHON_EVENT.endTime
        );

        if (duringEvent) {
          attributes.push({
            trait_type: 'Event',
            value: HACKATHON_EVENT.name,
          });
        }

        const metadata = {
          name: `Moment — ${now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`,
          description: `A moment captured on Monad Moments. ${
            duringEvent ? `📍 ${HACKATHON_EVENT.name}` : ''
          }`,
          image: mediaUri,
          attributes,
        };

        const metadataCid = await uploadMetadata(metadata);
        const contentURI = `ipfs://${metadataCid}`;

        setState((prev) => ({
          ...prev,
          ipfsCid: mediaCid,
        }));

        // === STEP 3: Submit mint transaction ===
        setState((prev) => ({
          ...prev,
          step: 'confirming',
          progress: 'Confirm in your wallet...',
        }));

        const txHash = await writeContractAsync({
          address: MOMENT_NFT_ADDRESS,
          abi: MOMENT_NFT_ABI,
          functionName: 'mint',
          args: [contentURI],
        });

        // === STEP 4: Wait for confirmation ===
        setState((prev) => ({
          ...prev,
          step: 'minting',
          progress: 'Minting on Monad...',
          txHash,
        }));

        // Poll for receipt (Monad has sub-second finality)
        const { createPublicClient, http } = await import('viem');
        const { monadTestnet } = await import('@/config/wagmi');

        const client = createPublicClient({
          chain: monadTestnet,
          transport: http(),
        });

        const receipt = await client.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 1,
        });

        // Parse the MomentMinted event to get tokenId
        let tokenId: bigint | null = null;
        for (const log of receipt.logs) {
          if (log.topics[0]) {
            // MomentMinted event topic — tokenId is the second indexed param
            try {
              tokenId = BigInt(log.topics[2] || '0');
            } catch {
              // Not the right log, continue
            }
          }
        }

        // === STEP 5: Success! ===
        setState({
          step: 'success',
          progress: duringEvent
            ? `${HACKATHON_EVENT.emoji} Moment minted + Event badge earned!`
            : 'Moment minted on Monad!',
          txHash,
          tokenId,
          ipfsCid: mediaCid,
          earnedBadge: duringEvent,
          error: null,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong';

        // Friendly error messages
        let friendlyMessage = message;
        if (message.includes('AlreadyMintedToday')) {
          friendlyMessage = 'You already posted your moment today! Come back tomorrow 🌅';
        } else if (message.includes('User rejected') || message.includes('user rejected')) {
          friendlyMessage = 'Transaction cancelled';
        } else if (message.includes('insufficient funds')) {
          friendlyMessage = 'Not enough MON for gas. Get testnet MON from faucet.monad.xyz';
        }

        setState((prev) => ({
          ...prev,
          step: 'error',
          progress: '',
          error: friendlyMessage,
        }));
      }
    },
    [address, writeContractAsync]
  );

  return {
    ...state,
    mintMoment,
    reset,
    isBusy: !['idle', 'success', 'error'].includes(state.step),
  };
}
