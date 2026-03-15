'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type CameraMode = 'photo' | 'video';
type CameraFacing = 'user' | 'environment';

interface CameraState {
  isReady: boolean;
  isRecording: boolean;
  capturedBlob: Blob | null;
  capturedUrl: string | null;
  capturedType: CameraMode | null;
  error: string | null;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const capturedUrlRef = useRef<string | null>(null);

  const [state, setState] = useState<CameraState>({
    isReady: false,
    isRecording: false,
    capturedBlob: null,
    capturedUrl: null,
    capturedType: null,
    error: null,
  });

  const [mode, setMode] = useState<CameraMode>('photo');
  const [facing, setFacing] = useState<CameraFacing>('environment');

  useEffect(() => {
    capturedUrlRef.current = state.capturedUrl;
  }, [state.capturedUrl]);

  const releaseStream = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  }, []);

  const clearActiveStream = useCallback(() => {
    if (streamRef.current) {
      releaseStream(streamRef.current);
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [releaseStream]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      clearActiveStream();
      setState((prev) => ({ ...prev, isReady: false, error: null }));

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!mountedRef.current || requestIdRef.current !== requestId) {
        releaseStream(stream);
        return;
      }

      streamRef.current = stream;
      const videoElement = videoRef.current;

      if (!videoElement) {
        streamRef.current = null;
        releaseStream(stream);
        return;
      }

      videoElement.srcObject = stream;
      await videoElement.play();

      if (!mountedRef.current || requestIdRef.current !== requestId) {
        if (videoElement.srcObject === stream) {
          videoElement.srcObject = null;
        }
        if (streamRef.current === stream) {
          streamRef.current = null;
        }
        releaseStream(stream);
        return;
      }

      setState((prev) => ({ ...prev, isReady: true, error: null }));
    } catch (err) {
      if (!mountedRef.current || requestIdRef.current !== requestId) {
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Camera access denied';
      setState((prev) => ({ ...prev, isReady: false, error: message }));
    }
  }, [clearActiveStream, facing, releaseStream]);

  const stopCamera = useCallback(() => {
    requestIdRef.current += 1;

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    clearActiveStream();

    setState((prev) => ({
      ...prev,
      isReady: false,
      isRecording: false,
    }));
  }, [clearActiveStream]);

  // Take a photo by capturing a frame from the video stream
  const takePhoto = useCallback((): Blob | null => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    // Convert to blob synchronously via dataURL, then return
    // We'll use the async version in the capture function
    return null; // Placeholder — real capture below
  }, []);

  // Capture a photo (returns a Promise<Blob>)
  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.92
      );
    });
  }, []);

  // Record a 1-second video clip
  const recordVideo = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!streamRef.current) {
        resolve(null);
        return;
      }

      // Need audio for video — try to get it
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      chunksRef.current = [];

      try {
        const recorder = new MediaRecorder(streamRef.current, {
          mimeType,
          videoBitsPerSecond: 2_500_000,
        });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          resolve(blob);
        };

        recorder.onerror = () => resolve(null);

        setState((prev) => ({ ...prev, isRecording: true }));
        recorder.start();

        // Auto-stop after 1 second
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
            setState((prev) => ({ ...prev, isRecording: false }));
          }
        }, 1000);
      } catch {
        resolve(null);
      }
    });
  }, []);

  // Main capture function — dispatches to photo or video
  const capture = useCallback(async () => {
    let blob: Blob | null = null;

    if (mode === 'photo') {
      blob = await capturePhoto();
    } else {
      blob = await recordVideo();
    }

    if (blob) {
      // Revoke previous URL
      if (state.capturedUrl) URL.revokeObjectURL(state.capturedUrl);

      const url = URL.createObjectURL(blob);
      setState((prev) => ({
        ...prev,
        capturedBlob: blob,
        capturedUrl: url,
        capturedType: mode,
      }));
    }

    return blob;
  }, [mode, capturePhoto, recordVideo, state.capturedUrl]);

  // Discard the captured media and go back to camera view
  const discard = useCallback(() => {
    if (state.capturedUrl) URL.revokeObjectURL(state.capturedUrl);
    setState((prev) => ({
      ...prev,
      capturedBlob: null,
      capturedUrl: null,
      capturedType: null,
    }));
  }, [state.capturedUrl]);

  // Toggle between front/back camera
  const flipCamera = useCallback(() => {
    setFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  // Cleanup on unmount (reset mountedRef on mount for React Strict Mode remount)
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      clearActiveStream();
      if (capturedUrlRef.current) {
        URL.revokeObjectURL(capturedUrlRef.current);
      }
    };
  }, [clearActiveStream]);

  return {
    videoRef,
    ...state,
    mode,
    setMode,
    facing,
    startCamera,
    stopCamera,
    capture,
    discard,
    flipCamera,
  };
}
