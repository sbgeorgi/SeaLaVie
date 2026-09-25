import { PICK, type SectionKey } from "./photos";

/** Configure contact channels here. */
export const CONTACT = {
  whatsapp: "50400000000", // international format, digits only — replace with the host's WhatsApp number
  whatsappDisplay: "+504 0000 0000",
  email: "stay@sealavie-roatan.com",
  airbnb: "https://www.airbnb.com/rooms/1552405518329523441",
};

export const FACTS = [
  { k: "Suites", v: "3", note: "each with en-suite bath & balcony" },
  { k: "Guests", v: "6", note: "two king, one queen" },
  { k: "Interior", v: "3,000", note: "square feet · entire 2nd floor" },
  { k: "To West End", v: "7", note: "minute walk · ½ mile" },
];

export const NAV = [
  { id: "story", label: "Story" },
  { id: "architecture", label: "Architecture" },
  { id: "location", label: "Location" },
  { id: "suites", label: "Suites" },
  { id: "rates", label: "Rates" },
];

export type Suite = {
  id: string;
  numeral: string;
  name: string;
  kicker: string;
  bed: string;
  copy: string;
  features: string[];
  image: string;
  alt: string;
  section: SectionKey;
};

export const SUITES: Suite[] = [
  {
    id: "great-room",
    numeral: "—",
    name: "The Great Room",
    kicker: "Living · Kitchen · Dining",
    bed: "Gathering",
    copy: "An open plan of cool marble, warm timber and wide glass. The full kitchen is built for long, unhurried island breakfasts; the table seats six beside doors thrown open to the sea.",
    features: ["Full kitchen with gas range & island", "Indoor dining for six", "Living room with TV & books", "Dedicated workspace & Wi-Fi"],
    image: PICK.livingDay,
    alt: "Light-filled living room with pale sofas and sliding doors",
    section: "living",
  },
  {
    id: "suite-1",
    numeral: "I",
    name: "Suite One",
    kicker: "Primary · Ocean Front",
    bed: "King",
    copy: "Navy and white, the calm of a harbour at dawn. A writing desk faces floor-to-ceiling glass, so every email is answered with the horizon in view.",
    features: ["King bed", "Private en-suite bath", "Private balcony", "Ocean-view desk"],
    image: PICK.suite1,
    alt: "Suite One with king bed and navy accents",
    section: "suite1",
  },
  {
    id: "suite-2",
    numeral: "II",
    name: "Suite Two",
    kicker: "Guest · Kitchenette",
    bed: "King",
    copy: "Honeyed light, a reading chair and a quiet door of its own. The private kitchenette with wet bar and mini fridge makes this a self-contained retreat for a second couple.",
    features: ["King bed", "Private en-suite bath", "Kitchenette & wet bar", "Private balcony"],
    image: PICK.suite2,
    alt: "Suite Two with king bed and reading chair",
    section: "suite2",
  },
  {
    id: "suite-3",
    numeral: "III",
    name: "Suite Three",
    kicker: "Guest · Balcony",
    bed: "Queen",
    copy: "Beneath a painted sea, a queen bed and a sitting corner that opens to a timber-ceilinged balcony — the place for a first coffee while the reef is still glassy.",
    features: ["Queen bed", "Private en-suite bath", "Kitchenette & mini fridge", "Timber-ceiling balcony"],
    image: PICK.suite3,
    alt: "Suite Three with queen bed beneath a sea painting",
    section: "suite3",
  },
  {
    id: "terrace",
    numeral: "∞",
    name: "Patio & Pool",
    kicker: "Sunset · Oceanfront",
    bed: "Outdoors",
    copy: "A large private patio above the pool, framed by white arches. Mornings belong to coffee and pelicans; evenings to the long gold light that makes the West End famous.",
    features: ["Large private patio", "Oceanfront pool & sun loungers", "Outdoor dining palapa", "Beach towels, chairs & umbrella"],
    image: PICK.loggia,
    alt: "Arched loggia with lounge seating above the sea",
    section: "terrace",
  },
];

export const AMENITIES: { group: string; items: string[] }[] = [
  { group: "Kitchen & Dining", items: ["Full kitchen", "Refrigerator", "Gas stove", "Stainless steel oven", "Microwave", "Coffee maker", "Blender", "Toaster", "Baking sheet", "Wine glasses", "Pots, pans, oil, salt & pepper", "Dishes & silverware", "Two mini kitchenettes", "Mini fridge", "Dining table"] },
  { group: "Outdoor & Waterfront", items: ["Waterfront — right on the sea", "Shared beach access", "Pool", "Private patio or balcony", "Outdoor furniture", "Outdoor dining area", "Sun loungers", "Beach towels, chairs & umbrella"] },
  { group: "Bedroom & Laundry", items: ["Washer", "Free in-unit dryer", "Bed linens", "Room-darkening shades", "Hangers", "Drying rack", "Clothing storage", "In-room safe"] },
  { group: "Bath", items: ["Three en-suite baths", "Hot water", "Shampoo", "Conditioner", "Body soap", "Shower gel", "Cleaning products"] },
  { group: "Comfort & Connection", items: ["Air conditioning", "Ceiling fans", "Portable fans", "Wi-Fi", "Dedicated workspace", "TV", "Books & reading material"] },
  { group: "Arrival & Safety", items: ["Private entrance", "Private security gate", "Self check-in · lockbox", "Luggage drop-off", "Long stays welcome (28+ nights)", "Fire extinguisher"] },
];

export const SERVICES = [
  {
    title: "Gated, self-guided arrival",
    lead: "A private security gate, a lockbox and a door of your own.",
    body: "The community is private and gated. Your access code arrives before check-in, and a lockbox means you can arrive on your own schedule — whether your flight lands at noon or your ferry at dusk. Only registered guests may enter the property.",
  },
  {
    title: "Luggage drop-off",
    lead: "Early arrival or late flight — leave the bags, keep the day.",
    body: "Drop your luggage when you arrive early or before a late departure, and spend those hours in the water instead of waiting in a lobby.",
  },
  {
    title: "Daily housekeeping",
    lead: "Available every day, at additional cost.",
    body: "Fresh linens, a reset kitchen and a quietly restored residence while you're at the reef. Housekeeping can be scheduled daily for an extra fee — add it to your brief and we'll arrange it.",
  },
  {
    title: "The long season",
    lead: "Stays of 28 nights or more are welcomed.",
    body: "A dedicated workspace, reliable Wi-Fi, a washer and in-unit dryer and a full kitchen make Sea La Vie a natural base for a remote-work winter or a slow sabbatical on the island.",
  },
  {
    title: "Beach & water essentials",
    lead: "Towels, chairs, umbrella and loungers, ready.",
    body: "Everything for the pool deck and the shared beach is in place. The reef, dive shops and Half Moon Bay are a seven-minute walk along the West End shoreline.",
  },
];

export const TIERS = [
  {
    id: "island",
    name: "Island Stay",
    rate: 325,
    unit: "night",
    min: "3-night minimum",
    blurb: "The full residence, self check-in and every in-unit comfort.",
    includes: ["Entire 3,000 sq ft second floor", "Three en-suite suites", "Pool, patio & beach gear", "Self check-in & luggage drop-off"],
  },
  {
    id: "signature",
    name: "Signature",
    rate: 425,
    unit: "night",
    min: "5-night minimum",
    blurb: "Our most requested — arrive to a residence already set for island life.",
    includes: ["Everything in Island Stay", "Daily housekeeping", "Welcome provisions", "Priority response on WhatsApp"],
    featured: true,
  },
  {
    id: "season",
    name: "Long Season",
    rate: 6900,
    unit: "month",
    min: "28 nights +",
    blurb: "A slower rhythm for remote work, dive seasons and winters abroad.",
    includes: ["Preferred monthly rate", "Weekly housekeeping", "Dedicated workspace & Wi-Fi", "Washer & in-unit dryer"],
  },
];

export const EXTRAS = [
  { id: "housekeeping", label: "Daily housekeeping", price: 45, per: "day" },
  { id: "transfer", label: "Airport transfer (RTB)", price: 60, per: "trip" },
  { id: "provisions", label: "Grocery pre-stock", price: 90, per: "stay" },
  { id: "dive", label: "Dive & snorkel booking", price: 0, per: "on request" },
  { id: "chef", label: "Private chef evening", price: 0, per: "on request" },
  { id: "late", label: "Early luggage drop-off", price: 0, per: "complimentary" },
];

export const OCCASIONS = ["Family", "Couples", "Friends", "Dive trip", "Remote work", "Celebration"];

export const FAQS = [
  { q: "How is electricity billed?", a: "Electricity is metered per unit and billed at $0.42 per kWh. The bill is settled before departure, in cash or through Airbnb." },
  { q: "How do we access the property?", a: "Sea La Vie sits within a private, gated community. Your security-gate code is shared at check-in and entry is by self check-in lockbox. Non-registered guests are not permitted on the property." },
  { q: "How far is the beach and West End?", a: "About a seven-minute walk — roughly half a mile — to the beach, dive shops, Sundowners, restaurants and the heart of West End village." },
  { q: "Which floor is the residence on?", a: "The residence occupies the entire second floor of the building, giving every room elevated views across the pool to the sea." },
  { q: "Is it suitable for two couples or a family?", a: "Yes. Each of the three bedrooms has its own en-suite bath and balcony, and two include private kitchenettes with mini fridge, microwave and wet bar — ideal for shared stays with privacy." },
  { q: "Can we work remotely?", a: "There is Wi-Fi throughout and a dedicated workspace, plus an ocean-view desk in Suite One. Stays of 28 nights or more are welcome." },
];
