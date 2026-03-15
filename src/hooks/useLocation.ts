'use client';

import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  granted: boolean;
  permissionState: 'granted' | 'denied' | 'prompt' | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    granted: false,
    permissionState: null,
  });

  const fetchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          granted: true,
          permissionState: 'granted',
        });
      },
      (err) => {
        const isDenied = err.code === err.PERMISSION_DENIED;
        setLocation({
          latitude: null,
          longitude: null,
          error: isDenied
            ? 'Location access was denied. Enable it in your browser settings to earn the hackathon badge.'
            : err.message,
          loading: false,
          granted: false,
          permissionState: isDenied ? 'denied' : 'prompt',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const requestLocation = useCallback(() => {
    // If denied, calling getCurrentPosition again will silently fail in some browsers.
    // We still try, but the UI should guide the user to browser settings.
    fetchPosition();
  }, [fetchPosition]);

  // On mount: check permission state without triggering a prompt
  useEffect(() => {
    if (!navigator.permissions) {
      // Permissions API not available — leave as prompt, let user click
      setLocation((prev) => ({ ...prev, permissionState: 'prompt' }));
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    const handleChange = () => {
      if (!permissionStatus) return;
      setLocation((prev) => ({ ...prev, permissionState: permissionStatus!.state as LocationState['permissionState'] }));
      if (permissionStatus.state === 'granted') {
        fetchPosition();
      }
      if (permissionStatus.state === 'denied') {
        setLocation((prev) => ({
          ...prev,
          granted: false,
          error: 'Location access was denied. Enable it in your browser settings to earn the hackathon badge.',
          permissionState: 'denied',
        }));
      }
    };

    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
      permissionStatus = status;
      setLocation((prev) => ({ ...prev, permissionState: status.state as LocationState['permissionState'] }));

      // If already granted, fetch silently
      if (status.state === 'granted') {
        fetchPosition();
      }

      status.addEventListener('change', handleChange);
    });

    return () => {
      permissionStatus?.removeEventListener('change', handleChange);
    };
  }, [fetchPosition]);

  return { ...location, requestLocation };
}
