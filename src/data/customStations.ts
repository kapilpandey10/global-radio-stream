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
  makeStation("radio-nepal", "Radio Nepal", "https://stream1.radionepal.gov.np/live/", "Nepal", "NP", "", "nepal,am,sw,fm", 128),
  makeStation("kantipur-fm", "Kantipur FM", "https://radio-broadcast.ekantipur.com/stream/", "Nepal", "NP", "", "nepal,fm,91.2mhz,kathmandu", 128),
  makeStation("ujyalo-90-network", "Ujyalo 90 Network", "https://stream.zeno.fm/h527zwd11uquv", "Nepal", "NP", "", "nepal,fm,90mhz,kathmandu", 128),
  makeStation("kalika-fm", "Kalika FM", "http://kalika-stream.softnep.com:7740/;", "Nepal", "NP", "", "nepal,fm,95.2mhz,butwal", 128),
  makeStation("galyang-fm", "Galyang FM", "https://live.itech.host:9107/stream", "Nepal", "NP", "", "nepal,fm,92.2mhz,syangja", 128),
  makeStation("radio-audio", "Radio Audio", "https://stream.zeno.fm/fvrx47wpg0quv", "Nepal", "NP", "", "nepal,fm,106.3mhz,kathmandu", 128),
  makeStation("shreenagar-fm", "Shreenagar FM", "https://live.itech.host:9598/stream", "Nepal", "NP", "", "nepal,fm,93.2mhz,tansen,palpa", 128),
  makeStation("radio-bhorukawa", "Radio Bhorukawa", "https://live.itech.host:8379/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("hits-fm", "Hits FM", "https://usa15.fastcast4u.com/proxy/hitsfm912?mp=/1", "Nepal", "NP", "", "nepal,fm,hits", 128),
  makeStation("radio-annapurna", "Radio Annapurna Nepal", "https://shoutcast.prixa.live/annapurna", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("bfbs-gurkha", "BFBS Gurkha Radio", "https://listen-ssvcbfbs.sharp-stream.com/ssvcbfbs3.aac", "Nepal", "NP", "", "nepal,gurkha", 128, "AAC"),
  makeStation("radio-tufan", "Radio Tufan", "https://stream.zeno.fm/60tx8fw9dd0uv", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("capital-fm", "Capital FM", "https://streaming.softnep.net:10982/;stream.nsv&type:mp3&volume:10", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("radio-amargadhi", "Radio Amargadhi", "https://live.itech.host:8927/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("barahathawa-fm", "Barahathawa FM 101.1MHz", "https://stream.zeno.fm/gubb557z4k8uv", "Nepal", "NP", "", "nepal,fm,101.1mhz", 128),
  makeStation("sky-fm", "Sky FM 106.6", "https://onlineradio.websoftitnepal.com/8002/stream", "Nepal", "NP", "", "nepal,fm,106.6mhz", 128),
  makeStation("shuklaphanta-fm", "Shuklaphanta FM", "https://streaming.webhostnepal.com/8010/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("good-news-fm", "Good News FM", "https://live.itech.host:8167/stream?1611505122592", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("radio-resunga", "Radio Resunga", "https://live.itech.host:3260/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("radio-rudraksha", "Radio Rudraksha", "https://streaming.softnep.net:10874/;stream.nsv&type:mp3&volume:50", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("classic-fm", "Classic FM", "https://stream.hamropatro.com/8783", "Nepal", "NP", "", "nepal,fm,classic", 128),
  makeStation("times-fm", "Times FM", "https://astream.nepalipatro.com.np:8119/index.html", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("pathibhara-fm", "Pathibhara FM", "https://live.itech.host:8749/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("krishnasar-fm", "Krishnasar FM", "https://live.itech.host:8434/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("synergy-fm", "Synergy FM", "https://live.itech.host:3880/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("radio-prakriti", "Radio Prakriti", "https://live.itech.host:8939/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("radio-nepalbani", "Radio Nepalbani", "https://live.itech.host:8681/stream", "Nepal", "NP", "", "nepal,fm", 128),
  makeStation("radio-marsyangdi", "Radio Marsyangdi", "https://streaming.webhostnepal.com:7032/;stream.nsv&type:mp3&volume:30", "Nepal", "NP", "", "nepal,fm", 128),
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
