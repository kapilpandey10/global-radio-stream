import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { RadioStation } from "@/types/radio";

interface PlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  showNowPlaying: boolean;
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
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentStation: null,
    isPlaying: false,
    volume: 0.8,
    isLoading: false,
    showNowPlaying: false,
  });

  const [favorites, setFavorites] = useState<RadioStation[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("radio-favorites") || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("radio-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const play = useCallback((station: RadioStation) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = station.url_resolved || station.url;
    audio.volume = state.volume;
    setState(s => ({ ...s, currentStation: station, isLoading: true, isPlaying: false }));
    audio.play().then(() => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    }).catch(() => {
      setState(s => ({ ...s, isLoading: false, isPlaying: false }));
    });

    audio.onplaying = () => setState(s => ({ ...s, isPlaying: true, isLoading: false }));
    audio.onwaiting = () => setState(s => ({ ...s, isLoading: true }));
    audio.onerror = () => setState(s => ({ ...s, isPlaying: false, isLoading: false }));
  }, [state.volume]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(s => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
    setState(s => ({ ...s, isPlaying: true }));
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v }));
  }, []);

  const toggleNowPlaying = useCallback(() => {
    setState(s => ({ ...s, showNowPlaying: !s.showNowPlaying }));
  }, []);

  const toggleFavorite = useCallback((station: RadioStation) => {
    setFavorites(prev => {
      const exists = prev.some(s => s.stationuuid === station.stationuuid);
      return exists ? prev.filter(s => s.stationuuid !== station.stationuuid) : [...prev, station];
    });
  }, []);

  const isFavorite = useCallback((stationuuid: string) => {
    return favorites.some(s => s.stationuuid === stationuuid);
  }, [favorites]);

  return (
    <PlayerContext.Provider value={{
      ...state, play, pause, resume, setVolume, toggleNowPlaying,
      favorites, toggleFavorite, isFavorite,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
