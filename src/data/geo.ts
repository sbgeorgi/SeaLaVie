// Local equirectangular projection centred on the property for sub-metre precision at deep zoom.
export const HOME = { lat: 16.3115, lon: -86.5927 };
export const K = 10000; // world units per degree
const COS = Math.cos((HOME.lat * Math.PI) / 180);
export const METERS_PER_UNIT = 111320 / K;

export const proj = (lon: number, lat: number): [number, number] => [(lon - HOME.lon) * COS * K, -(lat - HOME.lat) * K];
export const unproj = (x: number, y: number): [number, number] => [x / (COS * K) + HOME.lon, -y / K + HOME.lat];
export const spanToUnits = (spanLon: number) => spanLon * COS * K;

type LL = [number, number]; // [lon, lat]
export const pathOf = (pts: LL[], close = true) =>
  pts.map(([lon, lat], i) => {
    const [x, y] = proj(lon, lat);
    return `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join("") + (close ? "Z" : "");

export const MAINLAND: LL[] = [
  [-97, 26], [-97.5, 22], [-96, 19.5], [-94.5, 18.2], [-92, 18.6], [-91, 19], [-90.4, 20.5], [-90, 21.2], [-88.5, 21.5], [-87, 21.5], [-86.8, 20.8],
  [-87.4, 19.6], [-87.8, 18.4], [-88.2, 17.5], [-88.3, 16.3], [-88.9, 15.9], [-88.2, 15.7], [-87.5, 15.8], [-87.1, 15.78], [-86.8, 15.78], [-86.5, 15.79],
  [-86.2, 15.83], [-85.95, 15.92], [-86.0, 16.02], [-85.7, 16.0], [-85.3, 15.95], [-84.8, 15.9], [-84.3, 15.8], [-83.4, 15.2], [-83.2, 14.5], [-83.5, 13.5],
  [-83.6, 12.2], [-83.7, 11.0], [-83.2, 10.2], [-82.4, 9.4], [-81.6, 8.9], [-80.8, 8.95], [-79.6, 9.6], [-78.5, 9.4], [-77.4, 8.6], [-76.8, 8.3], [-76, 9.4],
  [-75.5, 10.6], [-74.8, 11.1], [-74, 11.3], [-73, 11.4], [-72, 12.2], [-71.3, 12.1], [-71, 11.3], [-70, 11.6], [-69, 11.5], [-68, 10.6], [-66, 10.6],
  [-64, 10.6], [-62, 10.7], [-61, 10], [-60, 8.5], [-58, 7], [-58, 0], [-100, 0], [-100, 26],
];
export const FLORIDA: LL[] = [[-83, 30.5], [-82.8, 27.5], [-82, 26], [-81.1, 25.1], [-80.4, 25.2], [-80, 26.5], [-80.5, 28], [-81.3, 30.5]];
export const CUBA: LL[] = [
  [-84.95, 21.85], [-84.4, 22.4], [-83.2, 22.95], [-82, 23.2], [-80.5, 23.1], [-79.5, 22.6], [-78.2, 22.4], [-77.2, 21.7], [-76, 21.1], [-75, 20.7],
  [-74.2, 20.2], [-74.5, 19.9], [-75.8, 19.95], [-77.5, 19.85], [-77.8, 20.5], [-78.6, 21.5], [-80, 21.8], [-81.5, 22.1], [-82.8, 22.6], [-84, 22],
];
export const JAMAICA: LL[] = [[-78.35, 18.25], [-77.8, 18.5], [-77, 18.45], [-76.3, 18.2], [-76.2, 17.9], [-76.9, 17.85], [-77.4, 17.8], [-78.2, 18.1]];
export const HISPANIOLA: LL[] = [
  [-74.45, 18.35], [-73.5, 18.5], [-72.8, 18.5], [-72.7, 19.4], [-73.4, 19.7], [-72.5, 19.9], [-71.5, 19.9], [-70, 19.7], [-69.3, 19.2], [-68.4, 18.6],
  [-68.7, 18.2], [-69.9, 18.4], [-71, 18.2], [-71.4, 17.6], [-72, 18.0], [-73.3, 18.1],
];
export const PUERTO_RICO: LL[] = [[-67.25, 18.4], [-66, 18.45], [-65.6, 18.3], [-65.9, 17.95], [-67.2, 17.95]];
export const CAYMAN: LL[] = [[-81.42, 19.38], [-81.1, 19.36], [-81.08, 19.28], [-81.4, 19.28]];
export const UTILA: LL[] = [[-86.99, 16.09], [-86.95, 16.12], [-86.88, 16.12], [-86.85, 16.1], [-86.87, 16.08], [-86.93, 16.07]];
export const GUANAJA: LL[] = [[-85.96, 16.44], [-85.9, 16.5], [-85.84, 16.52], [-85.82, 16.49], [-85.87, 16.44], [-85.92, 16.42]];

export const ROATAN: LL[] = [
  [-86.605, 16.2665], [-86.6025, 16.274], [-86.601, 16.28], [-86.603, 16.285], [-86.6, 16.29], [-86.599, 16.295], [-86.5975, 16.3], [-86.5968, 16.3035],
  [-86.5976, 16.3055], [-86.5957, 16.3062], [-86.5951, 16.3076], [-86.5964, 16.309], [-86.5948, 16.3098], [-86.59305, 16.3112], [-86.5928, 16.3124],
  [-86.5915, 16.314], [-86.5885, 16.3175], [-86.584, 16.3215], [-86.575, 16.33], [-86.55, 16.345], [-86.52, 16.357], [-86.49, 16.37], [-86.46, 16.385],
  [-86.43, 16.4], [-86.4, 16.415], [-86.37, 16.428], [-86.34, 16.44], [-86.31, 16.452], [-86.29, 16.458], [-86.283, 16.447], [-86.3, 16.432], [-86.33, 16.418],
  [-86.36, 16.4], [-86.39, 16.385], [-86.42, 16.372], [-86.45, 16.358], [-86.48, 16.345], [-86.51, 16.33], [-86.537, 16.313], [-86.56, 16.3], [-86.575, 16.29],
  [-86.587, 16.28], [-86.597, 16.271],
];

export const ROAD: LL[] = [
  [-86.6005, 16.279], [-86.598, 16.29], [-86.596, 16.299], [-86.5946, 16.304], [-86.5938, 16.308], [-86.5921, 16.3108], [-86.5905, 16.3125], [-86.587, 16.316],
  [-86.578, 16.319], [-86.565, 16.321], [-86.55, 16.32], [-86.537, 16.318], [-86.515, 16.33], [-86.48, 16.35], [-86.44, 16.37], [-86.4, 16.39],
];
export const WALK: LL[] = [[-86.5926, 16.3113], [-86.5933, 16.3102], [-86.5939, 16.3088], [-86.5943, 16.3075], [-86.5948, 16.3062], [-86.5953, 16.3045], [-86.5958, 16.3036]];
export const REEF_MESO: LL[] = [[-86.75, 21.2], [-87.2, 20], [-87.45, 19], [-87.6, 18.1], [-87.75, 17.3], [-87.8, 16.8], [-87.3, 16.55], [-86.8, 16.45], [-86.2, 16.55], [-85.6, 16.65]];
export const ROUTES: { from: LL; name: string }[] = [
  { from: [-80.29, 25.79], name: "Miami" },
  { from: [-95.34, 29.98], name: "Houston" },
];

export type Chapter = { key: string; n: string; title: string; kicker: string; copy: string; lon: number; lat: number; span: number; spanM: number };
export const CHAPTERS: Chapter[] = [
  { key: "caribbean", n: "01", title: "The Western Caribbean", kicker: "Scale 1 : 20,000,000", copy: "Around two hours by air from Miami and Houston, where the world's second-longest barrier reef bends toward the coast of Honduras.", lon: -81.5, lat: 17.6, span: 34, spanM: 20 },
  { key: "bay", n: "02", title: "The Bay Islands", kicker: "Scale 1 : 1,500,000", copy: "Utila, Roatán and Guanaja rise from the Mesoamerican Reef, some forty miles off the Honduran mainland.", lon: -86.42, lat: 16.22, span: 1.7, spanM: 1.05 },
  { key: "roatan", n: "03", title: "Roatán", kicker: "Scale 1 : 250,000", copy: "A slender island of green ridges and ironshore. West End lies at its western tip — reef diving by day, the island's best sunsets by evening.", lon: -86.45, lat: 16.355, span: 0.4, spanM: 0.2 },
  { key: "westend", n: "04", title: "West End", kicker: "Scale 1 : 15,000", copy: "Half a mile — seven minutes on foot — to Half Moon Bay, the dive shops, Sundowners and the village's restaurants.", lon: -86.5942, lat: 16.3072, span: 0.02, spanM: 0.012 },
  { key: "home", n: "05", title: "The Iron Shore", kicker: "16°18′41″N · 86°35′34″W", copy: "A private, gated address directly above the water. The pool lies between the house and the sea — and the sun sets straight ahead.", lon: -86.5932, lat: 16.3114, span: 0.0017, spanM: 0.0011 },
];

export type MapLabel = { id: string; name: string; sub?: string; lon: number; lat: number; min: number; max: number; kind: "sea" | "place" | "poi" | "town" };
export const LABELS: MapLabel[] = [
  { id: "carib", name: "Caribbean Sea", lon: -76.5, lat: 15.2, min: 6, max: 80, kind: "sea" },
  { id: "gulf", name: "Gulf of Mexico", lon: -91, lat: 24.8, min: 6, max: 80, kind: "sea" },
  { id: "cuba", name: "Cuba", lon: -79.2, lat: 21.9, min: 6, max: 80, kind: "place" },
  { id: "jam", name: "Jamaica", lon: -77.3, lat: 17.4, min: 6, max: 80, kind: "place" },
  { id: "hond", name: "Honduras", lon: -86.6, lat: 14.6, min: 2.5, max: 80, kind: "place" },
  { id: "yuc", name: "Yucatán", lon: -89.2, lat: 19.8, min: 6, max: 80, kind: "place" },
  { id: "bay", name: "Bay Islands", lon: -86.4, lat: 16.75, min: 8, max: 80, kind: "town" },
  { id: "utila", name: "Utila", lon: -86.92, lat: 16.16, min: 0.5, max: 5, kind: "place" },
  { id: "roatan", name: "Roatán", lon: -86.45, lat: 16.43, min: 0.9, max: 5, kind: "place" },
  { id: "guanaja", name: "Guanaja", lon: -85.89, lat: 16.56, min: 0.5, max: 5, kind: "place" },
  { id: "ceiba", name: "La Ceiba", lon: -86.79, lat: 15.74, min: 0.5, max: 5, kind: "town" },
  { id: "reef", name: "Mesoamerican Reef", lon: -87.2, lat: 16.6, min: 0.9, max: 5, kind: "sea" },
  { id: "westend", name: "West End", lon: -86.598, lat: 16.3, min: 0.09, max: 0.9, kind: "town" },
  { id: "westbay", name: "West Bay", lon: -86.604, lat: 16.277, min: 0.03, max: 0.9, kind: "town" },
  { id: "coxen", name: "Coxen Hole", lon: -86.537, lat: 16.309, min: 0.09, max: 0.9, kind: "town" },
  { id: "french", name: "French Harbour", lon: -86.46, lat: 16.35, min: 0.09, max: 0.9, kind: "town" },
  { id: "rtb", name: "Roatán Airport · RTB", lon: -86.523, lat: 16.3168, min: 0.09, max: 0.9, kind: "poi" },
  { id: "hmb", name: "Half Moon Bay", lon: -86.5968, lat: 16.3072, min: 0.004, max: 0.06, kind: "sea" },
  { id: "sundowners", name: "Sundowners", sub: "sunset bar", lon: -86.5958, lat: 16.3036, min: 0.006, max: 0.06, kind: "poi" },
  { id: "dive", name: "Dive shops", sub: "reef · 5 min", lon: -86.5953, lat: 16.3052, min: 0.006, max: 0.06, kind: "poi" },
  { id: "village", name: "West End Village", sub: "dining", lon: -86.5949, lat: 16.3015, min: 0.006, max: 0.06, kind: "town" },
  { id: "ironshore", name: "Iron Shore", lon: -86.5905, lat: 16.3148, min: 0.006, max: 0.06, kind: "sea" },
  { id: "walk", name: "7 min · ½ mile", sub: "on foot", lon: -86.5936, lat: 16.3082, min: 0.006, max: 0.06, kind: "poi" },
  { id: "sunset", name: "Sunset", sub: "due west", lon: -86.5946, lat: 16.3108, min: 0, max: 0.004, kind: "sea" },
];
