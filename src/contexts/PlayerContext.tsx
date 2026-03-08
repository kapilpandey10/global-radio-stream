import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { RadioStation } from "@/types/radio";

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

// Try to fetch ICY metadata from a proxy
const fetchNowPlaying = async (stationUrl: string): Promise<string | null> => {
  try {
    // Use a CORS proxy to get ICY metadata
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(stationUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: { 'Icy-MetaData': '1' },
    });
    clearTimeout(timeout);
    
    // Check for icy-name or other headers
    const icyName = res.headers.get('icy-name');
    if (icyName) return icyName;
    
    return null;
  } catch {
    return null;
  }
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        audioRef.current?.pause();
        setState(s => ({ ...s, isPlaying: false }));
      }, settings.sleepTimer * 60 * 1000);
    }
    return () => { if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current); };
  }, [settings.sleepTimer, state.isPlaying]);

  // Poll for now playing metadata
  useEffect(() => {
    if (metadataIntervalRef.current) clearInterval(metadataIntervalRef.current);
    
    if (state.currentStation && state.isPlaying) {
      const pollMetadata = async () => {
        const url = state.currentStation?.url_resolved || state.currentStation?.url;
        if (url) {
          const info = await fetchNowPlaying(url);
          if (info) {
            setState(s => ({ ...s, nowPlayingInfo: info }));
          }
        }
      };
      
      // Poll every 30 seconds
      pollMetadata();
      metadataIntervalRef.current = setInterval(pollMetadata, 30000);
    }
    
    return () => { if (metadataIntervalRef.current) clearInterval(metadataIntervalRef.current); };
  }, [state.currentStation?.stationuuid, state.isPlaying]);

  const addToRecent = useCallback((station: RadioStation) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.stationuuid !== station.stationuuid);
      return [station, ...filtered].slice(0, 20);
    });
  }, []);

  const play = useCallback((station: RadioStation) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.src = station.url_resolved || station.url;
    audio.volume = state.volume;
    setState(s => ({ ...s, currentStation: station, isLoading: true, isPlaying: false, nowPlayingInfo: null }));
    addToRecent(station);
    audio.play().then(() => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    }).catch(() => {
      setState(s => ({ ...s, isLoading: false, isPlaying: false }));
    });
    audio.onplaying = () => setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    audio.onwaiting = () => setState(s => ({ ...s, isLoading: true }));
    audio.onerror = () => setState(s => ({ ...s, isPlaying: false, isLoading: false }));
  }, [state.volume, addToRecent]);

  const pause = useCallback(() => { audioRef.current?.pause(); setState(s => ({ ...s, isPlaying: false })); }, []);
  const resume = useCallback(() => { audioRef.current?.play(); setState(s => ({ ...s, isPlaying: true })); }, []);
  const setVolume = useCallback((v: number) => { if (audioRef.current) audioRef.current.volume = v; setState(s => ({ ...s, volume: v })); }, []);
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
