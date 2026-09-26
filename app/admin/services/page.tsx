"use client";

import { useState } from "react";
import { adminApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { messageFor } from "@/lib/errors";
import { useToast } from "@/components/ui/Toast";
import { Card, Badge, Field, Input, Textarea, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AsyncBoundary, SkeletonList } from "@/components/ui/states";
import { PageHeader, Segmented } from "@/components/ui/bits";
import { naira } from "@/lib/format";
import { IconPlus } from "@/components/ui/icons";
import type { CategoryGroup, ServiceCategory, Service } from "@/lib/types";

const GROUPS: CategoryGroup[] = ["HOME_REPAIR", "PERSONAL", "MOBILITY", "GENERAL"];

export default function AdminCatalogue() {
  const [view, setView] = useState<"categories" | "services">("categories");
  return (
    <div>
      <PageHeader title="Catalogue" subtitle="Manage the services customers can request." />
      <div className="mb-4">
        <Segmented
          options={[{ value: "categories", label: "Categories" }, { value: "services", label: "Services" }]}
          value={view}
          onChange={setView}
        />
      </div>
      {view === "categories" ? <Categories /> : <Services />}
    </div>
  );
}

// ---- Categories ------------------------------------------------------------

function Categories() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.catCategories({ includeInactive: true }), []);
  const [modal, setModal] = useState<ServiceCategory | "new" | null>(null);
  const [retire, setRetire] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="subtle" size="sm" onClick={() => setModal("new")}><IconPlus size={16} /> New category</Button>
      </div>
      <AsyncBoundary loading={loading} error={error} onRetry={reload} skeleton={<SkeletonList count={6} />}>
        <div className="space-y-2.5">
          {data?.items.map((c) => (
            <Card key={c.id} className="flex items-center gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{c.name}</p>
                <p className="text-xs text-muted">{c.group_key.replace("_", " ")}</p>
              </div>
              {!c.is_active && <Badge className="bg-canvas text-muted border border-line">Inactive</Badge>}
              <Button variant="ghost" size="sm" onClick={() => setModal(c)}>Edit</Button>
              {c.is_active && <Button variant="ghost" size="sm" className="text-muted" onClick={() => setRetire(c.id)}>Retire</Button>}
            </Card>
          ))}
        </div>
      </AsyncBoundary>

      {modal && (
        <CategoryModal
          category={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); reload(); }}
        />
      )}
      <ConfirmDialog
        open={!!retire}
        onClose={() => setRetire(null)}
        title="Retire this category?"
        message="It will be hidden from customers. Existing jobs are unaffected."
        confirmLabel="Retire"
        danger
        onConfirm={async () => {
          try { await adminApi.retireCategory(retire!); toast.success("Category retired."); reload(); }
          catch (err) { toast.error(messageFor(err)); }
        }}
      />
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }: { category: ServiceCategory | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: category?.name ?? "",
    groupKey: (category?.group_key ?? "HOME_REPAIR") as CategoryGroup,
    description: category?.description ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      if (category) {
        await adminApi.updateCategory(category.id, { name: form.name.trim(), groupKey: form.groupKey, description: form.description.trim() || undefined });
      } else {
        await adminApi.createCategory({ name: form.name.trim(), groupKey: form.groupKey, description: form.description.trim() || undefined });
      }
      toast.success(category ? "Category updated." : "Category created.");
      onSaved();
    } catch (err) { toast.error(messageFor(err)); }
    finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} title={category ? "Edit category" : "New category"}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy} disabled={!form.name.trim()}>Save</Button></>}>
      <div className="space-y-4">
        <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Group" required>
          <Select value={form.groupKey} onChange={(e) => setForm({ ...form, groupKey: e.target.value as CategoryGroup })}>
            {GROUPS.map((g) => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
          </Select>
        </Field>
        <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

// ---- Services --------------------------------------------------------------

function Services() {
  const toast = useToast();
  const { data: categories } = useAsync(() => adminApi.catCategories({ includeInactive: true }), []);
  const { data, loading, error, reload } = useAsync(() => adminApi.catServices({ includeInactive: true }), []);
  const [modal, setModal] = useState<Service | "new" | null>(null);
  const [retire, setRetire] = useState<string | null>(null);

  const catName = (id: string) => categories?.items.find((c) => c.id === id)?.name ?? "—";

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="subtle" size="sm" onClick={() => setModal("new")}><IconPlus size={16} /> New service</Button>
      </div>
      <AsyncBoundary loading={loading} error={error} onRetry={reload} skeleton={<SkeletonList count={6} />}>
        <div className="space-y-2.5">
          {data?.items.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{s.name}</p>
                <p className="text-xs text-muted">
                  {catName(s.category_id)}
                  {s.typical_price_min != null && <span> · from {naira(s.typical_price_min)}</span>}
                </p>
              </div>
              {!s.is_active && <Badge className="bg-canvas text-muted border border-line">Inactive</Badge>}
              <Button variant="ghost" size="sm" onClick={() => setModal(s)}>Edit</Button>
              {s.is_active && <Button variant="ghost" size="sm" className="text-muted" onClick={() => setRetire(s.id)}>Retire</Button>}
            </Card>
          ))}
        </div>
      </AsyncBoundary>

      {modal && (
        <ServiceModal
          service={modal === "new" ? null : modal}
          categories={categories?.items ?? []}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); reload(); }}
        />
      )}
      <ConfirmDialog
        open={!!retire}
        onClose={() => setRetire(null)}
        title="Retire this service?"
        confirmLabel="Retire"
        danger
        onConfirm={async () => {
          try { await adminApi.retireService(retire!); toast.success("Service retired."); reload(); }
          catch (err) { toast.error(messageFor(err)); }
        }}
      />
    </div>
  );
}

function ServiceModal({ service, categories, onClose, onSaved }: { service: Service | null; categories: ServiceCategory[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    categoryId: service?.category_id ?? categories[0]?.id ?? "",
    name: service?.name ?? "",
    description: service?.description ?? "",
    priceMin: service?.typical_price_min != null ? String(service.typical_price_min) : "",
    priceMax: service?.typical_price_max != null ? String(service.typical_price_max) : "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.name.trim() || !form.categoryId) return;
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      typicalPriceMin: form.priceMin ? Number(form.priceMin) : undefined,
      typicalPriceMax: form.priceMax ? Number(form.priceMax) : undefined,
    };
    try {
      if (service) {
        await adminApi.updateService(service.id, { ...payload, categoryId: form.categoryId });
      } else {
        await adminApi.createService({ ...payload, categoryId: form.categoryId });
      }
      toast.success(service ? "Service updated." : "Service created.");
      onSaved();
    } catch (err) { toast.error(messageFor(err)); }
    finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} title={service ? "Edit service" : "New service"}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy} disabled={!form.name.trim()}>Save</Button></>}>
      <div className="space-y-4">
        <Field label="Category" required>
          <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Typical price from (₦)"><Input type="number" min={0} value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} /></Field>
          <Field label="to (₦)"><Input type="number" min={0} value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} /></Field>
        </div>
      </div>
    </Modal>
  );
}
