/**
 * FABRICATED demo data for the Saved Artisans screen.
 *
 * ⚠️ Placeholder data only. The Deevi backend has no "saved artisans" / favourites
 * endpoint, so this list is not real. Kept isolated here so it can be deleted or
 * replaced with a real API client if that feature ships.
 */

export const DEMO = true;

export interface SavedArtisan {
  id: string;
  name: string;
  trade: string;
  location: string;
  distanceKm?: number;
  rating: number;
  jobsLabel: string;
  badge?: string;
  skills: string[];
  note: string;
  baseRateLabel: string;
  baseRate: number;
  activeProject?: string;
  category: "Plumbing" | "Electrical & Solar" | "Carpentry" | "AC & Cooling";
}

export const savedArtisans: SavedArtisan[] = [
  {
    id: "art-emeka",
    name: "Emeka Okafor",
    trade: "Master Plumber",
    location: "Lekki Phase 1",
    distanceKm: 1.2,
    rating: 4.9,
    jobsLabel: "82 verified reviews",
    badge: "Top Rated 2024",
    skills: ["Pipe Welding", "Sink Mixers", "Emergency Leak"],
    note: "“Hired in Jan for bathroom fitting — excellent, punctual & tidy work.”",
    baseRateLabel: "Base engagement",
    baseRate: 8000,
    category: "Plumbing",
  },
  {
    id: "art-tunde",
    name: "Tunde Bakare",
    trade: "Master Electrician & Solar Installer",
    location: "Victoria Island & Lekki",
    rating: 4.9,
    jobsLabel: "114 jobs completed",
    badge: "Deevi Pro Tier",
    skills: ["Inverters", "Circuit Breakers", "Wiring"],
    note: "Active Project: 5kVA Solar Inverter Installation",
    activeProject: "5kVA Solar Inverter Installation",
    baseRateLabel: "Diagnostic fee",
    baseRate: 10000,
    category: "Electrical & Solar",
  },
  {
    id: "art-bolanle",
    name: "Bolanle Adebayo",
    trade: "Sanitary Ware & Pipe Specialist",
    location: "Oniru & Lekki Phase 1",
    rating: 5.0,
    jobsLabel: "47 jobs · 100% On-Time",
    skills: ["Basin Fitting", "Drain Cleaning", "PPR Welding"],
    note: "Last engaged for Kitchen Drainage Check (Nov 2023)",
    baseRateLabel: "Base call-out",
    baseRate: 7500,
    category: "Plumbing",
  },
  {
    id: "art-chidi",
    name: "Chidi Eze",
    trade: "Furniture & Cabinetry Craftsman",
    location: "Ikoyi & Lekki",
    rating: 4.8,
    jobsLabel: "39 custom jobs",
    badge: "Solid Wood Expert",
    skills: ["Kitchen Cabinets", "Door Hanging", "Polishing"],
    note: "Custom wardrobe quotation delivered in Oct",
    baseRateLabel: "Consultation rate",
    baseRate: 12000,
    category: "Carpentry",
  },
  {
    id: "art-fatima",
    name: "Fatima Aliyu",
    trade: "AC & Refrigeration Engineer",
    location: "Lekki & Ajah",
    rating: 4.9,
    jobsLabel: "63 jobs",
    badge: "Inverter AC Certified",
    skills: ["Gas Refill", "Compressor Repair", "Split Unit Wash"],
    note: "Seasonal AC deep wash & gas test completed in Dec",
    baseRateLabel: "Inspection & Service",
    baseRate: 9000,
    category: "AC & Cooling",
  },
];

export const savedCategories = [
  "All Saved",
  "Plumbing",
  "Electrical & Solar",
  "Carpentry",
  "AC & Cooling",
] as const;
