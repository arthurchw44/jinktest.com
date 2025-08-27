// src/hooks/useFragmentAudioPlayer.ts

import { useRef, useState, useCallback, useEffect } from 'react';
import { handleAudioError } from '../utils/errorUtils'; // adjust path


export interface FragmentTiming {
  fragmentIndex: number;
  order: number;
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  wordCount: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  canPlay: boolean;
  error: string | null;
}

export interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekToFragment: (fragmentIndex: number) => void;
  replayCurrentFragment: () => void;
  setPlaybackRate: (rate: number) => void;
  togglePlayback: () => void;
}

const PREROLL_SECONDS = 0.05; // Slight preroll for better onset perception
const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 2.0;

export function useFragmentAudioPlayer(
  audioUrl: string,
  fragments: FragmentTiming[] = [],
  autoStopAtFragmentEnd: boolean = true
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentFragmentRef = useRef<number>(-1);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    canPlay: false,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous'; // For CORS if needed
    
    // Event listeners
    const updateState = (updates: Partial<AudioPlayerState>) => {
      setState(prev => ({ ...prev, ...updates }));
    };

    const handleLoadStart = () => updateState({ isLoading: true, error: null });
    const handleCanPlay = () => updateState({ canPlay: true, isLoading: false });
    const handleLoadedMetadata = () => updateState({ duration: audio.duration });

    // const handleError = (e: ErrorEvent) => {
    //   console.error('Audio error:', e);
    //   updateState({ 
    //     error: 'Failed to load audio', 
    //     isLoading: false, 
    //     isPlaying: false 
    //   });
    // };
    
    const handleError = (e: any) => {
      const friendly = handleAudioError(e?.error ?? new Error('Audio error'));
      updateState({
      error: friendly,
      isLoading: false,
      isPlaying: false,
      });
    };


    const handlePlay = () => updateState({ isPlaying: true });
    const handlePause = () => updateState({ isPlaying: false });
    const handleEnded = () => {
      updateState({ isPlaying: false });
      currentFragmentRef.current = -1;
    };

    const handleTimeUpdate = () => {
      updateState({ currentTime: audio.currentTime });
    };

    // Attach event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError as EventListener);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    audio.src = audioUrl;
    audioRef.current = audio;

    return () => {
      // Cleanup
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError as EventListener);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl]);

  // Auto-stop monitoring for fragment playback
  const monitorFragmentEnd = useCallback(() => {
    if (!audioRef.current || currentFragmentRef.current === -1 || !autoStopAtFragmentEnd) {
      return;
    }

    const fragment = fragments[currentFragmentRef.current];
    if (!fragment) return;

    const checkTime = () => {
      if (!audioRef.current || !state.isPlaying) return;

      if (audioRef.current.currentTime >= fragment.endTime) {
        audioRef.current.pause();
        currentFragmentRef.current = -1;
      } else {
        animationFrameRef.current = requestAnimationFrame(checkTime);
      }
    };

    animationFrameRef.current = requestAnimationFrame(checkTime);
  }, [fragments, autoStopAtFragmentEnd, state.isPlaying]);

  useEffect(() => {
    if (state.isPlaying && currentFragmentRef.current !== -1) {
      monitorFragmentEnd();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [state.isPlaying, monitorFragmentEnd]);

  const controls: AudioPlayerControls = {
    play: useCallback(() => {
      if (!audioRef.current || !state.canPlay) return;
      audioRef.current.play().catch(console.error);
    }, [state.canPlay]),

    pause: useCallback(() => {
      if (!audioRef.current) return;
      audioRef.current.pause();
    }, []),

    stop: useCallback(() => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      currentFragmentRef.current = -1;
    }, []),

    seekToFragment: useCallback((fragmentIndex: number) => {
      if (!audioRef.current || !state.canPlay || !fragments[fragmentIndex]) return;

      const fragment = fragments[fragmentIndex];
      const seekTime = Math.max(0, fragment.startTime - PREROLL_SECONDS);
      
      audioRef.current.currentTime = seekTime;
      currentFragmentRef.current = fragmentIndex;
    }, [fragments, state.canPlay]),

    replayCurrentFragment: useCallback(() => {
      if (currentFragmentRef.current !== -1) {
        controls.seekToFragment(currentFragmentRef.current);
        if (!state.isPlaying) {
          controls.play();
        }
      }
    }, [state.isPlaying]),

    setPlaybackRate: useCallback((rate: number) => {
      if (!audioRef.current) return;
      
      const clampedRate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, rate));
      audioRef.current.playbackRate = clampedRate;
      setState(prev => ({ ...prev, playbackRate: clampedRate }));
    }, []),

    togglePlayback: useCallback(() => {
      if (state.isPlaying) {
        controls.pause();
      } else {
        controls.play();
      }
    }, [state.isPlaying])
  };

  return {
    state,
    controls,
    currentFragmentIndex: currentFragmentRef.current,
    audioRef
  };
}
