'use client';

export const USERNAME_MIN_LENGTH = 3;

const PROFILE_STORAGE_PREFIX = 'monad-moments:profile';

export interface UserProfile {
  username: string;
  onboardingCompleted: boolean;
}

function getProfileStorageKey(address: string) {
  return `${PROFILE_STORAGE_PREFIX}:${address.toLowerCase()}`;
}

export function readUserProfile(address: string): UserProfile | null {
  const raw = window.localStorage.getItem(getProfileStorageKey(address));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (typeof parsed.username !== 'string') return null;

    const username = parsed.username.trim();
    if (username.length < USERNAME_MIN_LENGTH) return null;

    return {
      username,
      onboardingCompleted: parsed.onboardingCompleted === true,
    };
  } catch {
    return null;
  }
}

export function writeUserProfile(address: string, profile: UserProfile) {
  window.localStorage.setItem(
    getProfileStorageKey(address),
    JSON.stringify({
      username: profile.username.trim(),
      onboardingCompleted: profile.onboardingCompleted,
    })
  );
}
