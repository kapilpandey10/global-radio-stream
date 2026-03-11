import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { RadioStation } from "@/types/radio";
import IcecastMetadataPlayer from "icecast-metadata-player";

interface Settings {
  theme: "light" | "dark" | "system";
  streamQuality: "low" | "medium" | "high";
  autoPlay: boolean;
  showNotifications: boolean;
  sleepTimer: number;
  locationEnabled: boolean;
  skipBackward: number;
  skipForward: number;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  streamQuality: "high",
  autoPlay: true,
  showNotifications: true,
  sleepTimer: 0,
  locationEnabled: true,
  skipBackward: 10,
  skipForward: 30,
};

type StreamStatus = "idle" | "connecting" | "buffering" | "playing" | "stalled" | "error";

interface PlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  showNowPlaying: boolean;
  nowPlayingInfo: string | null;
  streamStatus: StreamStatus;
}

interface PlayerContextType extends PlayerState {
  play: (station: RadioStation) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  toggleNowPlaying: () => void;
  favorites: RadioStation[];
  toggleFavorite: (station: RadioStation) => void;
  isFavorite: (stationuuid: string) => boolean;
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  recentlyPlayed: RadioStation[];
  skipBack: () => void;
  skipForward: () => void;
  analyserNode: AnalyserNode | null;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const icecastPlayerRef = useRef<IcecastMetadataPlayer | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const usingFallbackRef = useRef(false);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Web Audio API for visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentStation: null,
    isPlaying: false,
    volume: 0.8,
    isLoading: false,
    showNowPlaying: false,
    nowPlayingInfo: null,
    streamStatus: "idle",
  });

  const [favorites, setFavorites] = useState<RadioStation[]>(() => {
    try { return JSON.parse(localStorage.getItem("radio-favorites") || "[]"); }
    catch { return []; }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<RadioStation[]>(() => {
    try { return JSON.parse(localStorage.getItem("radio-recent") || "[]"); }
    catch { return []; }
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("radio-settings") || "{}") }; }
    catch { return DEFAULT_SETTINGS; }
  });

  useEffect(() => { localStorage.setItem("radio-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("radio-recent", JSON.stringify(recentlyPlayed)); }, [recentlyPlayed]);
  useEffect(() => { localStorage.setItem("radio-settings", JSON.stringify(settings)); }, [settings]);

  // Theme management
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", settings.theme === "dark");
    }
  }, [settings.theme]);

  // Sleep timer
  useEffect(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (settings.sleepTimer > 0 && state.isPlaying) {
      sleepTimerRef.current = setTimeout(() => {
        stopCurrentPlayer();
        setState(s => ({ ...s, isPlaying: false, streamStatus: "idle" }));
      }, settings.sleepTimer * 60 * 1000);
    }
    return () => { if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current); };
  }, [settings.sleepTimer, state.isPlaying]);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const startStallDetection = useCallback((audio: HTMLAudioElement) => {
    clearStallTimer();
    
    // Monitor for stalled/no-audio state
    const checkStall = () => {
      if (!audio || audio.paused) return;
      
      // Check if audio is actually producing output
      if (audio.readyState < 2 || audio.networkState === 3) {
        setState(s => ({ ...s, streamStatus: "stalled", isLoading: false }));
      }
    };
    
    // Check every 8 seconds for stalled streams
    stallTimerRef.current = setInterval(checkStall, 8000) as any;
    
    audio.addEventListener('stalled', () => {
      setState(s => ({ ...s, streamStatus: "buffering" }));
    });
    
    audio.addEventListener('waiting', () => {
      setState(s => ({ ...s, streamStatus: "buffering", isLoading: true }));
    });
    
    audio.addEventListener('playing', () => {
      setState(s => ({ ...s, streamStatus: "playing", isPlaying: true, isLoading: false }));
    });
    
    audio.addEventListener('error', () => {
      setState(s => ({ ...s, streamStatus: "error", isPlaying: false, isLoading: false }));
      clearStallTimer();
    });
  }, [clearStallTimer]);

  const stopCurrentPlayer = useCallback(() => {
    clearStallTimer();
    if (icecastPlayerRef.current) {
      try { icecastPlayerRef.current.stop(); } catch {}
      icecastPlayerRef.current = null;
    }
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.src = "";
    }
    usingFallbackRef.current = false;
  }, [clearStallTimer]);

  // Setup Web Audio API for visualizer
  const setupAudioContext = useCallback((audioElement: HTMLAudioElement) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!analyserNodeRef.current) {
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        analyserNodeRef.current.fftSize = 256;
        analyserNodeRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceNodeRef.current) {
        try {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceNodeRef.current.connect(analyserNodeRef.current);
          analyserNodeRef.current.connect(audioContextRef.current.destination);
        } catch (err) {
          console.warn('Audio context setup warning:', err);
        }
      }
    } catch (err) {
      console.warn('Failed to setup audio context:', err);
    }
  }, []);

  const addToRecent = useCallback((station: RadioStation) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.stationuuid !== station.stationuuid);
      return [station, ...filtered].slice(0, 20);
    });
  }, []);

  const playWithFallback = useCallback((station: RadioStation, vol: number) => {
    usingFallbackRef.current = true;
    if (!fallbackAudioRef.current) fallbackAudioRef.current = new Audio();
    const audio = fallbackAudioRef.current;
    audio.src = station.url_resolved || station.url;
    audio.volume = vol;
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    
    setupAudioContext(audio);
    startStallDetection(audio);
    
    setState(s => ({ ...s, streamStatus: "connecting" }));
    
    audio.play().then(() => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false, streamStatus: "playing" }));
    }).catch(() => {
      setState(s => ({ ...s, isLoading: false, isPlaying: false, streamStatus: "error" }));
    });
    
    audio.onplaying = () => setState(s => ({ ...s, isPlaying: true, isLoading: false, streamStatus: "playing" }));
    audio.onwaiting = () => setState(s => ({ ...s, isLoading: true, streamStatus: "buffering" }));
    audio.onerror = () => {
      clearStallTimer();
      setState(s => ({ ...s, isPlaying: false, isLoading: false, streamStatus: "error" }));
    };
  }, [setupAudioContext, startStallDetection, clearStallTimer]);

  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2; // Reduced from 3 for faster fallback

  const play = useCallback((station: RadioStation) => {
    stopCurrentPlayer();
    retryCountRef.current = 0;
    const streamUrl = station.url_resolved || station.url;
    setState(s => ({ ...s, currentStation: station, isLoading: true, isPlaying: false, nowPlayingInfo: null, streamStatus: "connecting" }));
    addToRecent(station);

    try {
      const player = new IcecastMetadataPlayer(streamUrl, {
        onMetadata: (metadata: any) => {
          const title = metadata?.StreamTitle || metadata?.ARTIST 
            ? `${metadata?.ARTIST || ""}${metadata?.ARTIST && metadata?.TITLE ? " - " : ""}${metadata?.TITLE || ""}`
            : metadata?.StreamTitle || null;
          if (title && title.trim()) {
            setState(s => ({ ...s, nowPlayingInfo: title.trim() }));
          }
        },
        onPlay: () => {
          retryCountRef.current = 0;
          setState(s => ({ ...s, isPlaying: true, isLoading: false, streamStatus: "playing" }));
        },
        onLoad: () => {
          setState(s => ({ ...s, isLoading: true, streamStatus: "buffering" }));
        },
        onStop: () => {
          setState(s => ({ ...s, isPlaying: false }));
        },
        onError: (error: any) => {
          console.warn("IcecastMetadataPlayer error, falling back to HTML Audio:", error);
          playWithFallback(station, state.volume);
        },
        onRetry: () => {
          retryCountRef.current++;
          if (retryCountRef.current > MAX_RETRIES) {
            console.warn("Max retries reached, falling back to HTML Audio");
            if (icecastPlayerRef.current) {
              try { icecastPlayerRef.current.stop(); } catch {}
              icecastPlayerRef.current = null;
            }
            playWithFallback(station, state.volume);
            return;
          }
          setState(s => ({ ...s, isLoading: true, streamStatus: "buffering" }));
        },
        metadataTypes: ["icy"],
        retryTimeout: 1500,  // Faster retry (was 2000)
        retryDelayRate: 1.2,  // Less aggressive backoff (was 1.5)
      } as any);

      icecastPlayerRef.current = player;
      
      const checkAudioAndSetup = () => {
        if (player.audioElement) {
          player.audioElement.volume = state.volume;
          player.audioElement.crossOrigin = "anonymous";
          setupAudioContext(player.audioElement);
          startStallDetection(player.audioElement);
        }
      };
      
      // Faster timeout for fallback (8s instead of 15s)
      const playTimeout = setTimeout(() => {
        if (icecastPlayerRef.current === player) {
          console.warn("Play timeout, falling back");
          try { player.stop(); } catch {}
          icecastPlayerRef.current = null;
          playWithFallback(station, state.volume);
        }
      }, 8000);

      player.play().then(() => {
        clearTimeout(playTimeout);
        checkAudioAndSetup();
      }).catch(() => {
        clearTimeout(playTimeout);
        console.warn("IcecastMetadataPlayer play failed, using fallback");
        playWithFallback(station, state.volume);
      });
    } catch (e) {
      console.warn("IcecastMetadataPlayer init failed, using fallback:", e);
      playWithFallback(station, state.volume);
    }
  }, [state.volume, addToRecent, stopCurrentPlayer, playWithFallback, setupAudioContext, startStallDetection]);

  const pause = useCallback(() => {
    clearStallTimer();
    if (usingFallbackRef.current) {
      fallbackAudioRef.current?.pause();
    } else if (icecastPlayerRef.current) {
      try { icecastPlayerRef.current.stop(); } catch {}
    }
    setState(s => ({ ...s, isPlaying: false, streamStatus: "idle" }));
  }, [clearStallTimer]);

  const resume = useCallback(() => {
    if (usingFallbackRef.current) {
      fallbackAudioRef.current?.play();
      setState(s => ({ ...s, isPlaying: true, streamStatus: "playing" }));
    } else {
      const station = state.currentStation;
      if (station) {
        play(station);
      }
    }
  }, [state.currentStation, play]);

  const setVolume = useCallback((v: number) => {
    if (usingFallbackRef.current && fallbackAudioRef.current) {
      fallbackAudioRef.current.volume = v;
    } else if (icecastPlayerRef.current?.audioElement) {
      icecastPlayerRef.current.audioElement.volume = v;
    }
    setState(s => ({ ...s, volume: v }));
  }, []);

  const toggleNowPlaying = useCallback(() => { setState(s => ({ ...s, showNowPlaying: !s.showNowPlaying })); }, []);

  const stop = useCallback(() => {
    stopCurrentPlayer();
    setState(s => ({ ...s, currentStation: null, isPlaying: false, isLoading: false, showNowPlaying: false, nowPlayingInfo: null, streamStatus: "idle" }));
  }, [stopCurrentPlayer]);

  const seekAudio = useCallback((seconds: number) => {
    const audio = usingFallbackRef.current
      ? fallbackAudioRef.current
      : icecastPlayerRef.current?.audioElement;
    if (audio && isFinite(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
    }
  }, []);

  const skipBack = useCallback(() => {
    seekAudio(-settings.skipBackward);
  }, [seekAudio, settings.skipBackward]);

  const skipForwardFn = useCallback(() => {
    seekAudio(settings.skipForward);
  }, [seekAudio, settings.skipForward]);

  const toggleFavorite = useCallback((station: RadioStation) => {
    setFavorites(prev => prev.some(s => s.stationuuid === station.stationuuid)
      ? prev.filter(s => s.stationuuid !== station.stationuuid)
      : [...prev, station]);
  }, []);

  const isFavorite = useCallback((stationuuid: string) => favorites.some(s => s.stationuuid === stationuuid), [favorites]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && state.currentStation) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.nowPlayingInfo || state.currentStation.name,
        artist: state.nowPlayingInfo ? state.currentStation.name : "Mero Radio",
        album: state.currentStation.country || "Live Radio",
        artwork: [
          { src: state.currentStation.favicon || '/apple-touch-icon.png', sizes: '96x96', type: 'image/png' },
          { src: state.currentStation.favicon || '/apple-touch-icon.png', sizes: '128x128', type: 'image/png' },
          { src: state.currentStation.favicon || '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
          { src: state.currentStation.favicon || '/apple-touch-icon.png', sizes: '256x256', type: 'image/png' },
          { src: state.currentStation.favicon || '/apple-touch-icon.png', sizes: '384x384', type: 'image/png' },
          { src: state.currentStation.favicon || '/apple-touch-icon.png', sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => { resume(); });
      navigator.mediaSession.setActionHandler('pause', () => { pause(); });
      navigator.mediaSession.setActionHandler('stop', () => { stop(); });
      navigator.mediaSession.setActionHandler('seekbackward', () => { skipBack(); });
      navigator.mediaSession.setActionHandler('seekforward', () => { skipForwardFn(); });
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      }
    };
  }, [state.currentStation, state.isPlaying, state.nowPlayingInfo, pause, resume, stop, skipBack, skipForwardFn]);

  return (
    <PlayerContext.Provider value={{
      ...state, play, pause, resume, stop, setVolume, toggleNowPlaying,
      favorites, toggleFavorite, isFavorite, settings, updateSettings, recentlyPlayed,
      skipBack, skipForward: skipForwardFn,
      analyserNode: analyserNodeRef.current,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
