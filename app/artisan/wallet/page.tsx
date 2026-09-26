"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Card, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/primitives";
import { WorkspaceHeader, SectionCard, RailLayout } from "@/components/ui/patterns";
import { DemoBadge, Segmented } from "@/components/ui/bits";
import { naira } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  IconShield,
  IconClock,
  IconCheck,
  IconWrench,
  IconMapPin,
} from "@/components/ui/icons";
import {
  walletSummary as w,
  escrowMilestones,
  ledger,
  linkedBank,
  type LedgerEntry,
} from "@/lib/mocks/wallet";

const MILESTONE_TONE: Record<string, string> = {
  "In Progress": "bg-brand-50 text-brand-700",
  "Client Deposited": "bg-warn-50 text-warn-600",
  "Awaiting Sign-off": "bg-success-50 text-success-600",
};

type LedgerTab = "all" | "escrow_release" | "bank_withdrawal";

export default function WalletPage() {
  const toast = useToast();
  const [tab, setTab] = useState<LedgerTab>("all");
  const [amount, setAmount] = useState("50000");

  const preview = () =>
    toast.show("Payouts are a preview in this build — not enabled yet.", "info");

  const rows = ledger.filter((e) => tab === "all" || e.kind === tab);

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Guaranteed Artisan Financial Services"
        title="Wallet & Escrow Settlement"
        description="Track your protected job earnings, milestone deposits held in trust, and bank withdrawals across Nigeria."
        actions={
          <>
            <DemoBadge />
            <Button size="sm" onClick={preview}>
              Instant payout
            </Button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Available for withdrawal</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink tnum">{naira(w.availableForWithdrawal)}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted">
            <IconClock size={13} /> Auto-settles daily at 6:00 PM to GTBank
          </p>
          <Button fullWidth className="mt-3" onClick={preview}>
            Withdraw to bank
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Locked in active escrow</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-warn-50 text-warn-600">
              <IconShield size={16} />
            </span>
          </div>
          <p className="mt-1 font-display text-3xl font-bold text-ink tnum">{naira(w.lockedInEscrow)}</p>
          <p className="mt-2 text-xs text-muted">
            {w.activeMilestoneDeposits} active milestone deposits · 100% pre-funded
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs text-success-600">
            <IconCheck size={13} /> Protected by Deevi Escrow Guarantee
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total lifetime payouts</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink tnum">{naira(w.totalLifetimePayouts)}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
            <div>
              <p className="text-sm font-bold text-ink tnum">{w.completedJobs} jobs</p>
              <p className="text-xs text-muted">Completed</p>
            </div>
            <div>
              <p className="text-sm font-bold text-success-600">0% </p>
              <p className="text-xs text-muted">Platform fee</p>
            </div>
          </div>
        </Card>
      </div>

      <RailLayout
        rail={
          <>
            <SectionCard title="Linked settlement bank" aside={<button onClick={preview} className="text-xs font-semibold text-brand-600">Change</button>}>
              <div className="rounded-control bg-canvas p-3 text-sm">
                <Row label="Bank" value={linkedBank.bankName} />
                <Row label="Account" value={linkedBank.accountNumber} />
                <Row label="Holder" value={linkedBank.accountHolder} />
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-success-600">
                <IconCheck size={13} /> Verified NIMC &amp; NIBSS match (BVN linked)
              </p>
            </SectionCard>

            <SectionCard title="Instant withdrawal" aside={<span className="text-xs font-medium text-success-600">0% bank fee</span>}>
              <p className="mb-2 text-xs text-muted">Direct credit to your GTBank account within 60 seconds.</p>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                aria-label="Amount to withdraw"
                className="tnum text-lg font-semibold"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["20000", "50000", "100000"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition",
                      amount === v ? "bg-brand-600 text-white" : "border border-line text-ink-soft hover:bg-canvas",
                    )}
                  >
                    {naira(Number(v))}
                  </button>
                ))}
                <button
                  onClick={() => setAmount(String(w.availableForWithdrawal))}
                  className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-canvas"
                >
                  Max
                </button>
              </div>
              <dl className="mt-3 space-y-1.5 rounded-control bg-canvas p-3 text-xs">
                <Row label="Transfer rail" value="NIBSS Instant Payment (NIP)" />
                <Row label="Settlement fee" value="₦0 (covered by Deevi)" />
                <Row label="Estimated arrival" value="< 2 minutes" />
              </dl>
              <Button fullWidth className="mt-3" onClick={preview}>
                Confirm &amp; send to bank
              </Button>
            </SectionCard>

            <SectionCard icon={<IconShield size={18} />} title="Licensed custodial vaults">
              <p className="text-sm text-ink-soft">
                Artisan payments are held in insured custodial banking partner vaults and guaranteed
                against client default once job deposits are locked.
              </p>
            </SectionCard>
          </>
        }
      >
        {/* Active escrow milestones */}
        <SectionCard
          icon={<IconShield size={18} />}
          title="Active escrow milestones"
          description="Funds held in trust by Deevi until you and your client verify each milestone."
          aside={<Badge className="bg-brand-50 text-brand-700">{escrowMilestones.length} Active</Badge>}
          bodyClassName="space-y-3"
        >
          {escrowMilestones.map((m) => (
            <div key={m.id} className="rounded-control border border-line p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                    <IconWrench size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{m.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span>Client: {m.client}</span>
                      <span className="inline-flex items-center gap-1"><IconMapPin size={12} /> {m.area}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">Escrow Vault {m.vaultId} · 100% Funded</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-base font-bold text-ink tnum">{naira(m.amount)}</p>
                  <Badge className={cn("mt-1", MILESTONE_TONE[m.status])}>{m.status}</Badge>
                </div>
              </div>
              <p className="mt-2 text-right text-xs text-muted">{m.statusNote}</p>
            </div>
          ))}
        </SectionCard>

        {/* History */}
        <SectionCard
          title="Transaction & settlement history"
          description="Ledger of completed payouts and bank disbursements."
        >
          <div className="mb-3">
            <Segmented
              options={[
                { value: "all", label: "All transactions" },
                { value: "escrow_release", label: "Escrow releases" },
                { value: "bank_withdrawal", label: "Bank withdrawals" },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
          <ul className="divide-y divide-line">
            {rows.map((e) => (
              <LedgerRow key={e.id} entry={e} />
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Showing {rows.length} of {ledger.length} demo entries.</p>
        </SectionCard>
      </RailLayout>
    </div>
  );
}

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const credit = entry.amount >= 0;
  const Icon = entry.kind === "bank_withdrawal" ? IconClock : entry.kind === "bonus" ? IconWrench : IconShield;
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-control",
        entry.kind === "bonus" ? "bg-warn-50 text-warn-500" : "bg-brand-50 text-brand-600",
      )}>
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{entry.title}</p>
        <p className="truncate text-xs text-muted">{entry.subtitle}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-sm font-semibold tnum", credit ? "text-success-600" : "text-danger-600")}>
          {credit ? "+" : "-"}{naira(Math.abs(entry.amount))}
        </p>
        <p className="text-xs text-muted">{entry.status}</p>
      </div>
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
