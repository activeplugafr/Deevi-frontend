/**
 * FABRICATED demo data for the Wallet & Escrow screen.
 *
 * ⚠️ This is placeholder data only. The Deevi backend does NOT expose wallet,
 * escrow, or payout endpoints (they are dormant — see GET /health dormantFeatures).
 * Nothing here moves real money. Kept isolated here so it is trivial to delete or
 * swap for a real API client when/if those endpoints ship.
 */

export const DEMO = true;

export interface WalletSummary {
  availableForWithdrawal: number;
  lockedInEscrow: number;
  totalLifetimePayouts: number;
  completedJobs: number;
  activeMilestoneDeposits: number;
  currency: string;
}

export interface EscrowMilestone {
  id: string;
  title: string;
  client: string;
  area: string;
  vaultId: string;
  amount: number;
  status: "In Progress" | "Client Deposited" | "Awaiting Sign-off";
  statusNote: string;
}

export interface LedgerEntry {
  id: string;
  kind: "escrow_release" | "bank_withdrawal" | "bonus";
  title: string;
  subtitle: string;
  amount: number; // positive = credit, negative = debit
  when: string;
  status: string;
}

export interface LinkedBank {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export const walletSummary: WalletSummary = {
  availableForWithdrawal: 142500,
  lockedInEscrow: 85500,
  totalLifetimePayouts: 1890000,
  completedJobs: 68,
  activeMilestoneDeposits: 3,
  currency: "NGN",
};

export const escrowMilestones: EscrowMilestone[] = [
  {
    id: "ESC-9082",
    title: "Fix leaking kitchen pipe & sink mixer tap",
    client: "Ada Okafor",
    area: "Lekki Phase 1",
    vaultId: "#ESC-9082",
    amount: 18500,
    status: "In Progress",
    statusNote: "Disburses on completion",
  },
  {
    id: "ESC-9140",
    title: "Water Tank Float Valve Malfunction",
    client: "Tunde Adeleke",
    area: "Ikoyi, Lagos",
    vaultId: "#ESC-9140",
    amount: 22000,
    status: "Client Deposited",
    statusNote: "Ready for inspection",
  },
  {
    id: "ESC-8994",
    title: "Bathroom Vanity Unit Installation",
    client: "Mrs. Folake Davies",
    area: "Oniru Estate",
    vaultId: "#ESC-8994",
    amount: 45000,
    status: "Awaiting Sign-off",
    statusNote: "Auto-release in 14h",
  },
];

export const ledger: LedgerEntry[] = [
  {
    id: "TX-9921",
    kind: "bank_withdrawal",
    title: "Instant Bank Transfer to GTBank (***32109)",
    subtitle: "24 Oct 2024 · 16:42 · Ref #TX-9921",
    amount: -85000,
    when: "24 Oct 2024",
    status: "Successful",
  },
  {
    id: "TX-ESC-451",
    kind: "escrow_release",
    title: "Escrow Payout: 5kVA Solar Inverter Wiring",
    subtitle: "23 Oct 2024 · 11:15 · Client: Chief Kayode",
    amount: 45000,
    when: "23 Oct 2024",
    status: "Completed",
  },
  {
    id: "TX-ESC-448",
    kind: "escrow_release",
    title: "Escrow Payout: PPR Pipe Welding in Victoria Island",
    subtitle: "21 Oct 2024 · 09:30 · Client: Sterling Real Estate",
    amount: 28000,
    when: "21 Oct 2024",
    status: "Completed",
  },
  {
    id: "TX-BONUS-12",
    kind: "bonus",
    title: "Lekki Weekend Surge Dispatch Incentive",
    subtitle: "20 Oct 2024 · 18:00 · Platform Bonus",
    amount: 5000,
    when: "20 Oct 2024",
    status: "Credited",
  },
  {
    id: "TX-9844",
    kind: "bank_withdrawal",
    title: "Instant Bank Transfer to GTBank (***32109)",
    subtitle: "19 Oct 2024 · 14:10 · Ref #TX-9844",
    amount: -72000,
    when: "19 Oct 2024",
    status: "Successful",
  },
];

export const linkedBank: LinkedBank = {
  bankName: "Guaranty Trust Bank (GTBank)",
  accountNumber: "0149832109",
  accountHolder: "Emeka Christian Okafor",
};
