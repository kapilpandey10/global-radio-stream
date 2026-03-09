import { RadioStation } from "@/types/radio";

// Helper to create a RadioStation-compatible object from minimal info
const makeStation = (
  id: string,
  name: string,
  url: string,
  country: string,
  countrycode: string,
  favicon: string = "",
  tags: string = "",
  bitrate: number = 128,
  codec: string = "MP3"
): RadioStation => ({
  changeuuid: id,
  stationuuid: `custom-${id}`,
  name,
  url,
  url_resolved: url,
  homepage: "",
  favicon,
  tags,
  country,
  countrycode,
  state: "",
  language: "",
  languagecodes: "",
  votes: 0,
  lastchangetime: "",
  codec,
  bitrate,
  hls: 0,
  lastcheckok: 1,
  clickcount: 0,
  clicktrend: 0,
  geo_lat: null,
  geo_long: null,
});

// Add your preset custom stations here
export const PRESET_CUSTOM_STATIONS: RadioStation[] = [
  makeStation("afno-fm-okhaldhunga", "Afno FM (Okhaldhunga)", "https://streaming.softnep.net:10969/;stream.nsv&type=mp3&volume=70", "Nepal", "NP", "https://okhaldhunga.afnofm.org/themes/okhaldhunga/images/logo.png", "nepal,local,fm", 128),
];

// localStorage-backed user-added stations
const STORAGE_KEY = "radio-custom-stations";

export const getUserCustomStations = (): RadioStation[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveUserCustomStation = (station: RadioStation) => {
  const existing = getUserCustomStations();
  existing.push(station);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const removeUserCustomStation = (stationuuid: string) => {
  const existing = getUserCustomStations().filter(s => s.stationuuid !== stationuuid);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getAllCustomStations = (): RadioStation[] => {
  return [...PRESET_CUSTOM_STATIONS, ...getUserCustomStations()];
};

export { makeStation };
