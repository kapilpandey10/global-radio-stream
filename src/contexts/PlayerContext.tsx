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
    audio.play().then(() => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    }).catch(() => {
      setState(s => ({ ...s, isLoading: false, isPlaying: false }));
    });
    audio.onplaying = () => setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    audio.onwaiting = () => setState(s => ({ ...s, isLoading: true }));
    audio.onerror = () => setState(s => ({ ...s, isPlaying: false, isLoading: false }));
  }, []);

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
        retries: 1,
        retryTimeout: 2000,
      });

      icecastPlayerRef.current = player;
      
      // Set volume via audioElement when available
      const checkAudio = () => {
        if (player.audioElement) {
          player.audioElement.volume = state.volume;
        }
      };
      
      player.play().then(() => {
        checkAudio();
      }).catch(() => {
        console.warn("IcecastMetadataPlayer play failed, using fallback");
        playWithFallback(station, state.volume);
      });
    } catch (e) {
      console.warn("IcecastMetadataPlayer init failed, using fallback:", e);
      playWithFallback(station, state.volume);
    }
  }, [state.volume, addToRecent, stopCurrentPlayer, playWithFallback]);

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

  const skipBack = useCallback(() => {
    const currentIdx = recentlyPlayed.findIndex(s => s.stationuuid === state.currentStation?.stationuuid);
    const prevStation = currentIdx < recentlyPlayed.length - 1 ? recentlyPlayed[currentIdx + 1] : null;
    if (prevStation) play(prevStation);
  }, [recentlyPlayed, state.currentStation, play]);

  const skipForwardFn = useCallback(() => {
    const currentIdx = recentlyPlayed.findIndex(s => s.stationuuid === state.currentStation?.stationuuid);
    const nextStation = currentIdx > 0 ? recentlyPlayed[currentIdx - 1] : null;
    if (nextStation) play(nextStation);
  }, [recentlyPlayed, state.currentStation, play]);

  const toggleFavorite = useCallback((station: RadioStation) => {
    setFavorites(prev => prev.some(s => s.stationuuid === station.stationuuid)
      ? prev.filter(s => s.stationuuid !== station.stationuuid)
      : [...prev, station]);
  }, []);

  const isFavorite = useCallback((stationuuid: string) => favorites.some(s => s.stationuuid === stationuuid), [favorites]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  return (
    <PlayerContext.Provider value={{
      ...state, play, pause, resume, setVolume, toggleNowPlaying,
      favorites, toggleFavorite, isFavorite, settings, updateSettings, recentlyPlayed,
      skipBack, skipForward: skipForwardFn,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
