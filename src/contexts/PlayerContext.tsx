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

interface PlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  showNowPlaying: boolean;
  nowPlayingInfo: string | null;
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
        setState(s => ({ ...s, isPlaying: false }));
      }, settings.sleepTimer * 60 * 1000);
    }
    return () => { if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current); };
  }, [settings.sleepTimer, state.isPlaying]);

  const stopCurrentPlayer = useCallback(() => {
    if (icecastPlayerRef.current) {
      try { icecastPlayerRef.current.stop(); } catch {}
      icecastPlayerRef.current = null;
    }
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.src = "";
    }
    usingFallbackRef.current = false;
  }, []);

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

      // Only create source node once per audio element
      if (!sourceNodeRef.current) {
        try {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          sourceNodeRef.current.connect(analyserNodeRef.current);
          analyserNodeRef.current.connect(audioContextRef.current.destination);
        } catch (err) {
          // Source already connected or CORS issue - gracefully ignore
          console.warn('Audio context setup warning:', err);
        }
      }
    } catch (err) {
      console.warn('Failed to setup audio context (may be CORS restricted):', err);
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
    audio.crossOrigin = "anonymous"; // Enable CORS for visualizer
    
    // Setup audio context for visualizer
    setupAudioContext(audio);
    
    audio.play().then(() => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    }).catch(() => {
      setState(s => ({ ...s, isLoading: false, isPlaying: false }));
    });
    audio.onplaying = () => setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    audio.onwaiting = () => setState(s => ({ ...s, isLoading: true }));
    audio.onerror = () => setState(s => ({ ...s, isPlaying: false, isLoading: false }));
  }, [setupAudioContext]);

  const play = useCallback((station: RadioStation) => {
    stopCurrentPlayer();
    const streamUrl = station.url_resolved || station.url;
    setState(s => ({ ...s, currentStation: station, isLoading: true, isPlaying: false, nowPlayingInfo: null }));
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
          setState(s => ({ ...s, isPlaying: true, isLoading: false }));
        },
        onLoad: () => {
          setState(s => ({ ...s, isLoading: true }));
        },
        onStop: () => {
          setState(s => ({ ...s, isPlaying: false }));
        },
        onError: (error: any) => {
          console.warn("IcecastMetadataPlayer error, falling back to HTML Audio:", error);
          // Fall back to regular HTML Audio
          playWithFallback(station, state.volume);
        },
        onRetry: () => {
          setState(s => ({ ...s, isLoading: true }));
        },
        metadataTypes: ["icy"],
      } as any);

      icecastPlayerRef.current = player;
      
      // Set volume and setup audio context when available
      const checkAudioAndSetup = () => {
        if (player.audioElement) {
          player.audioElement.volume = state.volume;
          player.audioElement.crossOrigin = "anonymous"; // Enable CORS for visualizer
          setupAudioContext(player.audioElement);
        }
      };
      
      player.play().then(() => {
        checkAudioAndSetup();
      }).catch(() => {
        console.warn("IcecastMetadataPlayer play failed, using fallback");
        playWithFallback(station, state.volume);
      });
    } catch (e) {
      console.warn("IcecastMetadataPlayer init failed, using fallback:", e);
      playWithFallback(station, state.volume);
    }
  }, [state.volume, addToRecent, stopCurrentPlayer, playWithFallback, setupAudioContext]);

  const pause = useCallback(() => {
    if (usingFallbackRef.current) {
      fallbackAudioRef.current?.pause();
    } else if (icecastPlayerRef.current) {
      try { icecastPlayerRef.current.stop(); } catch {}
    }
    setState(s => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    if (usingFallbackRef.current) {
      fallbackAudioRef.current?.play();
      setState(s => ({ ...s, isPlaying: true }));
    } else {
      // For icecast player, we need to re-play since stop() kills the connection
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
    setState(s => ({ ...s, currentStation: null, isPlaying: false, isLoading: false, showNowPlaying: false, nowPlayingInfo: null }));
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

  // Media Session API for background play and lock screen controls
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

      // Action handlers
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
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
