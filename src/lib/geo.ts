// File: ./src/lib/geo.ts
//
// Tiny, dependency-free geography for the map_highlight component:
// approximate country centroids + coarse continent outlines, projected with
// an equirectangular projection. Accuracy is "right part of the right
// continent", which is all a stylised highlight map needs.

export const MAP_W = 800;
export const MAP_H = 360;
const LAT_TOP = 84;
const LAT_BOTTOM = -58;

export function project(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * MAP_W;
  const y = ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MAP_H;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

// [lon, lat]
const CENTROIDS: Record<string, [number, number]> = {
  "united states": [-98, 39], canada: [-106, 57], mexico: [-102, 23], brazil: [-52, -10], argentina: [-64, -34],
  chile: [-71, -33], colombia: [-74, 4], peru: [-75, -9], venezuela: [-66, 7], ecuador: [-78, -1.5], bolivia: [-64, -17],
  uruguay: [-56, -33], paraguay: [-58, -23], cuba: [-79, 21.5], "dominican republic": [-70.5, 19], guatemala: [-90.3, 15.5],
  "costa rica": [-84, 10], panama: [-80, 8.5], jamaica: [-77.3, 18.1],
  "united kingdom": [-2, 54], ireland: [-8, 53], france: [2.5, 46.5], germany: [10.4, 51], spain: [-3.7, 40.3],
  portugal: [-8, 39.5], italy: [12.5, 42.8], netherlands: [5.3, 52.2], belgium: [4.5, 50.6], switzerland: [8.2, 46.8],
  austria: [14.5, 47.5], poland: [19.1, 52], czechia: [15.3, 49.8], sweden: [16, 62], norway: [9, 61], finland: [26, 64],
  denmark: [10, 56], iceland: [-19, 65], greece: [22, 39], turkey: [35, 39], ukraine: [31, 49], russia: [90, 61],
  romania: [25, 46], hungary: [19.5, 47.2], serbia: [21, 44], croatia: [15.5, 45.2], bulgaria: [25.5, 42.7],
  belarus: [28, 53.7], estonia: [25.5, 58.7], latvia: [24.6, 56.9], lithuania: [23.9, 55.3], luxembourg: [6.1, 49.8],
  china: [104, 35], japan: [138, 36.5], "south korea": [127.8, 36.5], "north korea": [127, 40.2], india: [79, 22],
  pakistan: [69, 30], bangladesh: [90, 24], "sri lanka": [80.7, 7.8], nepal: [84, 28.3], indonesia: [117, -2],
  malaysia: [102, 4], singapore: [103.8, 1.35], thailand: [101, 15], vietnam: [106, 16], philippines: [122, 12.5],
  myanmar: [96, 21], cambodia: [105, 12.5], taiwan: [121, 23.7], "hong kong": [114.2, 22.3], mongolia: [103, 46.8],
  kazakhstan: [67, 48], uzbekistan: [64, 41.4], afghanistan: [66, 33.9], iran: [53, 32.5], iraq: [44, 33],
  "saudi arabia": [45, 24], "united arab emirates": [54, 24], qatar: [51.2, 25.3], kuwait: [47.5, 29.3], oman: [57, 21],
  yemen: [48, 15.5], israel: [34.9, 31.4], jordan: [36.3, 31.2], lebanon: [35.9, 33.9], syria: [38.5, 35],
  egypt: [30, 26.5], morocco: [-6, 32], algeria: [3, 28], tunisia: [9.5, 34], libya: [17, 27], nigeria: [8, 9.5],
  ghana: [-1, 7.9], "ivory coast": [-5.5, 7.5], senegal: [-14.5, 14.5], kenya: [38, 0.5], ethiopia: [39.5, 8.6],
  tanzania: [35, -6.3], uganda: [32.4, 1.4], rwanda: [29.9, -2], "south africa": [24.5, -29], namibia: [17, -22],
  botswana: [24, -22.3], zimbabwe: [29.8, -19], zambia: [27.8, -13.5], angola: [17.5, -12.3], mozambique: [35.5, -18],
  madagascar: [46.8, -19.5], cameroon: [12.5, 5.7], "democratic republic of the congo": [23.6, -2.9], sudan: [30, 15.6],
  australia: [134, -25.5], "new zealand": [172.5, -41.5], "papua new guinea": [144, -6.5], fiji: [178, -17.8],
};

const ALIASES: Record<string, string> = {
  usa: "united states", us: "united states", "u.s.": "united states", "u.s.a.": "united states", america: "united states",
  "united states of america": "united states", uk: "united kingdom", "u.k.": "united kingdom", britain: "united kingdom",
  "great britain": "united kingdom", england: "united kingdom", scotland: "united kingdom", wales: "united kingdom",
  korea: "south korea", "republic of korea": "south korea", "czech republic": "czechia", holland: "netherlands",
  "the netherlands": "netherlands", uae: "united arab emirates", "russian federation": "russia", "türkiye": "turkey",
  turkiye: "turkey", "côte d'ivoire": "ivory coast", "cote d'ivoire": "ivory coast", drc: "democratic republic of the congo",
  "dr congo": "democratic republic of the congo", congo: "democratic republic of the congo", burma: "myanmar",
  persia: "iran", "viet nam": "vietnam", ksa: "saudi arabia", prc: "china", "mainland china": "china",
};

export function countryPoint(name: string): [number, number] | null {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  const c = CENTROIDS[ALIASES[key] ?? key];
  return c ? project(c[0], c[1]) : null;
}

// Coarse continent outlines, [lon, lat] rings.
const CONTINENTS: [number, number][][] = [
  // North America
  [[-165, 65], [-140, 70], [-100, 72], [-80, 70], [-62, 60], [-55, 50], [-70, 43], [-80, 32], [-81, 25], [-97, 26], [-97, 18],
   [-88, 15], [-80, 8], [-85, 10], [-105, 20], [-117, 32], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]],
  // Greenland
  [[-50, 60], [-20, 70], [-22, 82], [-60, 82], [-70, 76], [-55, 68]],
  // South America
  [[-80, 8], [-75, 11], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-73, -50],
   [-72, -30], [-71, -18], [-81, -5]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [3, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [40, 55],
   [30, 45], [28, 41], [20, 40], [15, 38], [10, 44], [3, 42], [-2, 36]],
  // Great Britain & Ireland
  [[-5, 50], [1.5, 51], [0, 53], [-3, 58.5], [-6, 56.5], [-5, 54.5]],
  [[-10, 51.5], [-6, 52], [-6, 55], [-10, 54]],
  // Africa
  [[-17, 15], [-17, 21], [-10, 30], [-6, 36], [10, 37], [20, 32], [32, 31], [34, 27], [43, 12], [51, 12], [42, 0], [40, -15],
   [35, -25], [20, -35], [17, -30], [12, -15], [9, -1], [9, 4], [-5, 5], [-13, 8]],
  // Madagascar
  [[44, -16], [50, -15], [47, -25], [44, -22]],
  // Asia
  [[28, 41], [36, 36], [35, 32], [43, 13], [55, 22], [60, 25], [67, 25], [73, 20], [77, 8], [80, 15], [90, 22], [98, 16],
   [103, 1], [105, 10], [109, 20], [122, 30], [121, 40], [130, 43], [142, 47], [143, 59], [160, 62], [180, 66], [180, 71],
   [140, 73], [100, 78], [70, 73], [60, 70], [40, 67], [40, 55], [30, 45]],
  // Japan
  [[130, 31], [141, 36], [142, 43.5], [140, 41], [135, 34]],
  // Indonesia / Borneo / New Guinea (very coarse)
  [[95, 5], [106, -6], [115, -8], [106, -3], [98, 2]],
  [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]],
  [[131, -1], [141, -2], [150, -6], [147, -10], [138, -8]],
  // Australia
  [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -28], [150, -37], [141, -38], [131, -31], [115, -34]],
  // New Zealand
  [[172, -34], [178.5, -37.5], [174, -41.5], [168, -46.5], [166.5, -45.5], [172.5, -40.5]],
];

export const CONTINENT_PATHS: string[] = CONTINENTS.map(
  (ring) => ring.map(([lon, lat], i) => `${i ? "L" : "M"}${project(lon, lat).join(",")}`).join(" ") + " Z"
);
