/**
 * Shorten an Ethereum address for display: 0x1234...abcd
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a Unix timestamp to a relative or absolute time string.
 */
export function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get the current UTC day ID (same formula used by the smart contract).
 */
export function getCurrentDayId(): number {
  return Math.floor(Date.now() / 1000 / 86400);
}

/**
 * Check if current time falls within the hackathon event window.
 */
export function isEventActive(startTime: number, endTime: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= startTime && now <= endTime;
}

/**
 * Generate a unique filename for the captured media.
 */
export function generateFilename(type: 'photo' | 'video'): string {
  const timestamp = Date.now();
  const ext = type === 'video' ? 'webm' : 'jpg';
  return `moment-${timestamp}.${ext}`;
}
