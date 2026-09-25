const BASE = "https://a0.muscache.com/im/pictures/hosting/Hosting-1552405518329523441/original/";

export type Photo = {
  id: string;
  alt: string;
  section: SectionKey;
  ratio: number; // width / height
};

export type SectionKey =
  | "living"
  | "kitchen"
  | "dining"
  | "suite1"
  | "suite2"
  | "suite3"
  | "baths"
  | "terrace"
  | "exterior"
  | "pool";

export const SECTIONS: { key: SectionKey; label: string; short: string }[] = [
  { key: "exterior", label: "The Residence & Aerials", short: "Aerials" },
  { key: "pool", label: "Oceanfront Pool", short: "Pool" },
  { key: "terrace", label: "Patio & Balconies", short: "Terraces" },
  { key: "living", label: "Living Room", short: "Living" },
  { key: "kitchen", label: "Full Kitchen", short: "Kitchen" },
  { key: "dining", label: "Dining", short: "Dining" },
  { key: "suite1", label: "Suite I — King", short: "Suite I" },
  { key: "suite2", label: "Suite II — King", short: "Suite II" },
  { key: "suite3", label: "Suite III — Queen", short: "Suite III" },
  { key: "baths", label: "Three En-Suite Baths", short: "Baths" },
];

const P = (id: string, section: SectionKey, alt: string, ratio = 1.5): Photo => ({ id, section, alt, ratio });

export const PHOTOS: Photo[] = [
  // Exterior & aerials
  P("98fb7798-2bd7-4b95-85ae-7e56055af0d3", "exterior", "Panoramic view from the sea of the white Sea La Vie buildings above the turquoise water of the Iron Shore", 1.78),
  P("ee585ce0-c569-4ce1-9ab6-e230ae538459", "exterior", "The arched white residence rising above the oceanfront pool and palms"),
  P("b2a6c1f9-c441-46a5-b847-71e22be3c7af", "exterior", "Aerial of the rocky ironshore point, a thatched palapa and the residence beside a calm bay with a dock"),
  P("47f0a308-57fd-419f-9664-9a1b9acd9bd1", "exterior", "The twin white residences seen from the turquoise water, set on a dark ironshore ledge", 1.78),
  P("45aa3110-66e7-4791-8c2f-6c60d0f00015", "exterior", "Aerial view of the residences, the pool and palms, with the Caribbean beyond"),
  P("763e477c-85b3-4c46-9296-f0b39f72c364", "exterior", "Portrait view of open blue sea and palms from the property", 0.75),
  P("37b234c6-233b-43de-bc3d-06170a5e40be", "exterior", "High aerial of the ironshore point and bay with the residence among palms"),
  P("b3e12bea-8070-46bb-92d2-186107b7cd75", "terrace", "Arched loggia with two lounge chairs overlooking the pool, palapas and the open sea"),
  P("ec03ac61-aa0a-474a-a4d2-41b4e8c1dffd", "exterior", "Tall view of calm Caribbean water beyond the palm canopy", 0.75),
  // Pool
  P("133cde73-cfb0-4d53-a2f1-4c2e5c0410c0", "pool", "View from the balcony over the pool, palms and thatched palapas to the sea"),
  P("12ee983d-9e2d-4358-9c60-98a12dbf0e07", "pool", "Sunset over the sea with the infinity-edge pool glowing in the foreground", 1.33),
  P("0e062096-a085-4669-802c-187fafa88401", "pool", "The residence's arched façade above the pool and gardens"),
  P("7a06cad1-c69b-4118-b159-709a3e346f88", "pool", "Aerial of the pool, gardens and arched residences with the coastline beyond"),
  P("03b16539-27ae-4a34-b3b3-baf7f09fd087", "pool", "Pool and palapas beneath the balcony with open sea on the horizon"),
  P("273ed28b-f476-40fe-acfa-53a91645c82c", "pool", "Sun loungers beside the pool under a thatched palapa, the residence behind"),
  // Terraces
  P("a3235d16-e5a4-4abd-88e9-b5c8f9bd713e", "terrace", "A thatched palapa shelters an outdoor dining table on the stone patio by the sea"),
  P("30b10a10-41af-4003-960a-b9f96f05d628", "terrace", "Arched balcony with woven lounge seating looking out to the sea", 1.33),
  P("7c259cc8-d564-4d77-b70a-8ccd951380a3", "terrace", "Wide arched loggia with outdoor sofas above palms and turquoise water"),
  P("f20f487f-21e4-4c24-80fa-5049da004a67", "terrace", "Suite balcony with timber ceiling, railing and ocean glimpse"),
  P("8429e262-24e3-471c-b473-8a830449f9b0", "terrace", "Lounger and seating under white arches with the sea and palms beyond"),
  // Living
  P("f8230915-fa96-49ed-b22d-be17c584a393", "living", "Living room at dusk with soft lamplight, sofas and a view to the dark terrace", 0.75),
  P("f46f08b0-7c83-4fe2-8142-3862d864fe42", "living", "Open living and dining room with ocean windows and marble floors", 0.75),
  P("aa1281d7-5be4-48a6-9ee6-3eb893a6c852", "living", "Light-filled living room with pale sofas, ceiling fan and sliding doors", 0.75),
  // Kitchen
  P("3cbd24f7-471f-47e9-9212-3e55904046b8", "kitchen", "Full kitchen with warm wood cabinetry, granite island and stainless appliances", 0.75),
  P("b0ed46c0-d422-438f-a472-5d5167483d08", "kitchen", "Kitchen island with seating, gas range and stainless steel refrigerator", 0.75),
  P("06b30ef7-8665-42f2-9d2a-d23d2be0d66f", "kitchen", "Kitchen seen from the dining area with ocean-facing window", 0.75),
  // Dining
  P("4c0bc245-9a30-4f90-96f5-b5f8087394e4", "dining", "Timber dining table beside wide glass doors opening to the sea"),
  P("cdec21e9-b704-4d10-bc0d-4508fd912c3d", "dining", "Outdoor dining beneath the palapa with the coastline beyond"),
  P("b1b79de7-3600-493d-b65c-c1f0d7b00461", "dining", "Indoor dining table for six with windows to the water", 0.75),
  // Suites
  P("93c8a49a-aa4d-4f38-b37a-71782a08ee87", "suite1", "Suite I: king bed with navy accents, framed art and ceiling fan", 0.75),
  P("c44fa5b1-1d6a-4925-b408-350da6861948", "suite1", "Suite I: king bed facing sliding doors to the balcony", 0.75),
  P("d8f2b6e1-f97c-4542-85e4-0c494bfedda0", "suite1", "Suite I: writing desk before floor-to-ceiling glass and the ocean", 0.75),
  P("3eb5425c-4873-4fad-ac66-8ba4c47e43b8", "suite2", "Suite II: king bed and reading chair beneath a ceiling fan", 0.75),
  P("939afa3f-6419-4af1-8116-df40816afb1d", "suite2", "Suite II: warm-toned bedroom with king bed and patterned cushions", 0.75),
  P("cb59b869-0c1a-4985-bc22-b963fdafd506", "suite2", "Suite II: sitting area with armchairs and sliding doors to the view", 0.75),
  P("847618c6-0ded-46fb-945a-72cbf11f8227", "suite3", "Suite III: private balcony with timber ceiling and sea view"),
  P("5b6f9f68-32ac-4b6c-bd41-c28c3b661336", "suite3", "Suite III: louvered wood kitchenette with mini fridge and microwave"),
  P("2fce189d-90ea-4efd-a62a-33125abd45ae", "suite3", "Suite III: queen bed beneath a sea-inspired painting", 0.75),
  P("282e5b92-07c2-4a0b-8da1-009aee1389f6", "suite3", "Suite III: sitting corner with sofa and doors to the balcony", 0.75),
  P("e0bf50f5-9256-4845-b595-8142490d0c23", "suite3", "Suite III: bedroom seen from the entry with bed and rug", 0.75),
  // Baths
  P("fc5d2068-4ca5-4fe3-b8b7-ca18a754c7d8", "baths", "En-suite bath with wood vanity, granite counter and mirror", 0.75),
  P("59dc4840-30cf-4af0-98e3-02d1aa9d55da", "baths", "Walk-in stone-tiled shower with mosaic band", 0.75),
  P("8570a6b7-ca74-4658-9693-c543a5de71af", "baths", "Vanity with warm wood cabinetry and bronze fixtures", 0.75),
  P("bc5cecd4-7e9e-462a-b2cf-f7db8fde607b", "baths", "Wide view of a tiled bath with shower, towels and vanity"),
  P("68b167e0-03aa-45e6-9e69-9e7ffde755b6", "baths", "Second en-suite with stone tile, shower and granite vanity"),
  P("3eb18a59-0175-4a1f-82ee-8bc40f8db9bd", "baths", "Walk-in shower finished in earthy stone tile", 0.75),
  P("e14195ff-538a-4dc8-92ca-71460531223b", "baths", "Bath with fresh white towels and mosaic accent"),
  P("aad00714-fdb3-4304-ab47-e41e0379614a", "baths", "Third en-suite bath with tiled shower and vanity"),
  P("3ecccce8-ca5c-4e8f-bb32-f3b2a1ee4d80", "baths", "Compact en-suite with wood vanity and tiled shower", 0.75),
].filter((p) => p.alt !== "");

export const img = (id: string, w = 1440) => `${BASE}${id}.jpeg?im_w=${w}`;
export const srcSet = (id: string) => [480, 720, 1200, 1920].map((w) => `${img(id, w)} ${w}w`).join(", ");

export const byId = (id: string) => PHOTOS.find((p) => p.id === id)!;
export const bySection = (s: SectionKey) => PHOTOS.filter((p) => p.section === s);

// Curated art-direction picks
export const PICK = {
  heroSea: "b3e12bea-8070-46bb-92d2-186107b7cd75",
  aerialPoint: "45aa3110-66e7-4791-8c2f-6c60d0f00015",
  aerialPool: "7a06cad1-c69b-4118-b159-709a3e346f88",
  aerialHigh: "37b234c6-233b-43de-bc3d-06170a5e40be",
  fromWater: "ee585ce0-c569-4ce1-9ab6-e230ae538459",
  sunset: "12ee983d-9e2d-4358-9c60-98a12dbf0e07",
  poolDay: "133cde73-cfb0-4d53-a2f1-4c2e5c0410c0",
  loggia: "7c259cc8-d564-4d77-b70a-8ccd951380a3",
  loggiaSeat: "30b10a10-41af-4003-960a-b9f96f05d628",
  lounger: "8429e262-24e3-471c-b473-8a830449f9b0",
  palapa: "a3235d16-e5a4-4abd-88e9-b5c8f9bd713e",
  livingDusk: "f8230915-fa96-49ed-b22d-be17c584a393",
  livingDay: "aa1281d7-5be4-48a6-9ee6-3eb893a6c852",
  kitchen: "3cbd24f7-471f-47e9-9212-3e55904046b8",
  dining: "4c0bc245-9a30-4f90-96f5-b5f8087394e4",
  suite1: "93c8a49a-aa4d-4f38-b37a-71782a08ee87",
  suite1desk: "d8f2b6e1-f97c-4542-85e4-0c494bfedda0",
  suite2: "3eb5425c-4873-4fad-ac66-8ba4c47e43b8",
  suite3: "2fce189d-90ea-4efd-a62a-33125abd45ae",
  suite3balcony: "847618c6-0ded-46fb-945a-72cbf11f8227",
  bath: "bc5cecd4-7e9e-462a-b2cf-f7db8fde607b",
  seaTall: "763e477c-85b3-4c46-9296-f0b39f72c364",
  loungers: "273ed28b-f476-40fe-acfa-53a91645c82c",
};
