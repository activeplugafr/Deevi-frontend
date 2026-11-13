/**
 * FABRICATED demo data for the artisans browse screen.
 *
 * ⚠️ Placeholder data only. The Deevi backend has no public artisans list
 * endpoint, so this list is not real. Kept isolated here so it can be
 * replaced with a real API client if that feature ships.
 */

export const DEMO = true;

export interface BrowseArtisan {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  headline: string;
  trade: string;
  location: string;
  distanceKm?: number;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  yearsExperience?: number | null;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
  avatarUrl?: string | null;
  baseRate: number;
  baseRateLabel: string;
  skills: string[];
  category: string;
}

export const browseArtisans: BrowseArtisan[] = [
  {
    id: "art-emeka",
    firstName: "Emeka",
    lastName: "Okafor",
    businessName: "Emeka Plumbing Works",
    headline: "Master Plumber — leak detection, pipe fitting, bathroom renovations",
    trade: "Master Plumber",
    location: "Lekki Phase 1, Lagos",
    distanceKm: 1.2,
    rating: 4.9,
    reviewCount: 82,
    jobsCompleted: 124,
    yearsExperience: 9,
    verificationStatus: "APPROVED",
    baseRate: 8000,
    baseRateLabel: "Base engagement",
    skills: ["Pipe Welding", "Sink Mixers", "Emergency Leak", "Bathroom Fitting"],
    category: "Plumbing",
  },
  {
    id: "art-tunde",
    firstName: "Tunde",
    lastName: "Bakare",
    businessName: "Tunde Solar & Electrical",
    headline: "Master Electrician & Solar Installer — inverters, wiring, circuit breakers",
    trade: "Master Electrician & Solar Installer",
    location: "Victoria Island & Lekki, Lagos",
    distanceKm: 2.1,
    rating: 4.9,
    reviewCount: 114,
    jobsCompleted: 210,
    yearsExperience: 12,
    verificationStatus: "APPROVED",
    avatarUrl: null,
    baseRate: 10000,
    baseRateLabel: "Diagnostic fee",
    skills: ["Inverters", "Circuit Breakers", "Wiring", "Solar Installation"],
    category: "Electrical & Solar",
  },
  {
    id: "art-bolanle",
    firstName: "Bolanle",
    lastName: "Adebayo",
    businessName: "Bolanle Sanitary Services",
    headline: "Sanitary Ware & Pipe Specialist — basin fitting, drain cleaning, PPR welding",
    trade: "Sanitary Ware & Pipe Specialist",
    location: "Oniru & Lekki Phase 1, Lagos",
    distanceKm: 1.8,
    rating: 5.0,
    reviewCount: 47,
    jobsCompleted: 89,
    yearsExperience: 7,
    verificationStatus: "APPROVED",
    baseRate: 7500,
    baseRateLabel: "Base call-out",
    skills: ["Basin Fitting", "Drain Cleaning", "PPR Welding", "Kitchen Drainage"],
    category: "Plumbing",
  },
  {
    id: "art-chidi",
    firstName: "Chidi",
    lastName: "Eze",
    businessName: "Chidi Furniture Craft",
    headline: "Furniture & Cabinetry Craftsman — kitchen cabinets, door hanging, polishing",
    trade: "Furniture & Cabinetry Craftsman",
    location: "Ikoyi & Lekki, Lagos",
    distanceKm: 3.4,
    rating: 4.8,
    reviewCount: 39,
    jobsCompleted: 66,
    yearsExperience: 11,
    verificationStatus: "APPROVED",
    baseRate: 12000,
    baseRateLabel: "Consultation rate",
    skills: ["Kitchen Cabinets", "Door Hanging", "Polishing", "Custom Wardrobes"],
    category: "Carpentry",
  },
  {
    id: "art-fatima",
    firstName: "Fatima",
    lastName: "Aliyu",
    businessName: "Fatima AC & Refrigeration",
    headline: "AC & Refrigeration Engineer — gas refill, compressor repair, split unit wash",
    trade: "AC & Refrigeration Engineer",
    location: "Lekki & Ajah, Lagos",
    distanceKm: 4.2,
    rating: 4.9,
    reviewCount: 63,
    jobsCompleted: 102,
    yearsExperience: 8,
    verificationStatus: "APPROVED",
    baseRate: 9000,
    baseRateLabel: "Inspection & Service",
    skills: ["Gas Refill", "Compressor Repair", "Split Unit Wash", "AC Deep Wash"],
    category: "AC & Cooling",
  },
  {
    id: "art-ibrahim",
    firstName: "Ibrahim",
    lastName: "Yusuf",
    businessName: "Ibrahim Carpentry & Interiors",
    headline: "Carpenter & Interior Fitter — wardrobes, shelving, room partitioning",
    trade: "Carpenter & Interior Fitter",
    location: "Surulere, Lagos",
    distanceKm: 5.1,
    rating: 4.7,
    reviewCount: 28,
    jobsCompleted: 54,
    yearsExperience: 10,
    verificationStatus: "UNDER_REVIEW",
    baseRate: 11000,
    baseRateLabel: "Per project",
    skills: ["Wardrobes", "Shelving", "Room Partitioning", "Wood Polishing"],
    category: "Carpentry",
  },
  {
    id: "art-ola",
    firstName: "Ola",
    lastName: "Abiodun",
    businessName: "Ola Electrical Repairs",
    headline: "Certified Electrician — house rewiring, socket fixing, fuse box upgrades",
    trade: "Certified Electrician",
    location: "Ikeja, Lagos",
    distanceKm: 6.3,
    rating: 4.6,
    reviewCount: 52,
    jobsCompleted: 98,
    yearsExperience: 9,
    verificationStatus: "APPROVED",
    baseRate: 8500,
    baseRateLabel: "Call-out fee",
    skills: ["House Rewiring", "Socket Fixing", "Fuse Box Upgrades", "Lighting Installation"],
    category: "Electrical & Solar",
  },
  {
    id: "art-zainab",
    firstName: "Zainab",
    lastName: "Sani",
    businessName: "Zainab Beauty & Bridal",
    headline: "Makeup Artist & Gele Tyer — bridal makeup, event styling, home visits",
    trade: "Makeup Artist & Gele Tyer",
    location: "Victoria Island, Lagos",
    distanceKm: 2.8,
    rating: 4.9,
    reviewCount: 71,
    jobsCompleted: 156,
    yearsExperience: 6,
    verificationStatus: "APPROVED",
    baseRate: 15000,
    baseRateLabel: "Per session",
    skills: ["Bridal Makeup", "Event Styling", "Gele Tying", "Home Visits"],
    category: "Personal & Beauty",
  },
];

export const browseCategories = [
  "All Categories",
  "Plumbing",
  "Electrical & Solar",
  "Carpentry",
  "AC & Cooling",
  "Personal & Beauty",
] as const;
