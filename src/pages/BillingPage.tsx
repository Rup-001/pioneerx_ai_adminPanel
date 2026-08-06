import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { PaymentRecord, StripePrice } from "@/types";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
  btnGhost,
} from "@/components/ui/PageShell";

const TIERS = ["PRO", "PRO_PLUS", "ELITE"];
const INTERVALS = ["month", "year"];

const emptyForm = {
  priceId: "",
  tier: "PRO",
  interval: "month",
  label: "",
  amount: "",
  compareAtAmount: "",
  currency: "usd",
};

function formatAmount(amount: number | null | undefined, currency: string) {
  if (amount === null || amount === undefined) return "—";
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function parseCents(value: string): number | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new Error("Amounts must be whole cents (e.g. 1499 = $14.99)");
  }
  return n;
}

export default function BillingPage() {
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [drafts, setDrafts] = useState<
    Record<string, { amount: string; compareAtAmount: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function syncDrafts(list: StripePrice[]) {
    const next: Record<string, { amount: string; compareAtAmount: string }> =
      {};
    list.forEach((p) => {
      next[p.id] = {
        amount: p.amount == null ? "" : String(p.amount),
        compareAtAmount:
          p.compareAtAmount == null ? "" : String(p.compareAtAmount),
      };
    });
    setDrafts(next);
  }

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [priceList, paymentPage] = await Promise.all([
        adminApi.getStripePrices(),
        adminApi.getPayments(1, 20).catch(() => null),
      ]);
      const list = Array.isArray(priceList) ? priceList : [];
      setPrices(list);
      syncDrafts(list);
      setPayments(paymentPage?.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addPrice() {
    if (!form.priceId.trim()) {
      setError("Paste the price id from the Stripe dashboard first.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const amount = parseCents(form.amount);
      const compareAtAmount = parseCents(form.compareAtAmount);
      const created = await adminApi.createStripePrice({
        priceId: form.priceId.trim(),
        tier: form.tier,
        interval: form.interval,
        label: form.label.trim() || undefined,
        amount,
        compareAtAmount: compareAtAmount ?? null,
        currency: form.currency.trim() || "usd",
      });
      setPrices((prev) => {
        const next = [...prev, created];
        syncDrafts(next);
        return next;
      });
      setForm(emptyForm);
      setSuccess(`Mapped ${created.priceId} → ${created.tier}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add price");
    } finally {
      setSaving(false);
    }
  }

  async function saveDisplayAmounts(price: StripePrice) {
    const draft = drafts[price.id];
    if (!draft) return;
    try {
      setSavingId(price.id);
      setError("");
      setSuccess("");
      const amount = parseCents(draft.amount);
      const compareRaw = draft.compareAtAmount.trim();
      const compareAtAmount =
        compareRaw === "" ? null : parseCents(compareRaw) ?? null;
      const updated = await adminApi.updateStripePrice(price.id, {
        amount: amount ?? undefined,
        compareAtAmount,
      });
      setPrices((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? updated : p));
        syncDrafts(next);
        return next;
      });
      setSuccess(`Updated display prices for ${updated.tier}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(price: StripePrice) {
    try {
      setError("");
      const updated = await adminApi.updateStripePrice(price.id, {
        isActive: !price.isActive,
      });
      setPrices((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function remove(price: StripePrice) {
    if (!confirm(`Remove mapping for ${price.priceId}?`)) return;
    try {
      setError("");
      await adminApi.deleteStripePrice(price.id);
      setPrices((prev) => {
        const next = prev.filter((p) => p.id !== price.id);
        syncDrafts(next);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <PageShell
      title="Billing (Stripe)"
      subtitle="Map Stripe prices to tiers. Amount = sale price; Compare-at = crossed-out price on the website."
      actions={
        <button type="button" className={btnGhost} onClick={load}>
          Refresh
        </button>
      }
    >
      <StatusBanner error={error} success={success} />

      <div className="rounded-xl border border-admin-border bg-admin-panel p-4">
        <h2 className="mb-3 text-sm font-semibold">Add a price mapping</h2>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <div className="xl:col-span-2">
            <FieldLabel>Stripe price id</FieldLabel>
            <input
              className={inputClass}
              placeholder="price_1Qxyz…"
              value={form.priceId}
              onChange={(e) => setForm({ ...form, priceId: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Tier</FieldLabel>
            <select
              className={inputClass}
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value })}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Interval</FieldLabel>
            <select
              className={inputClass}
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Amount (cents)</FieldLabel>
            <input
              className={inputClass}
              placeholder="1499"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Compare-at (cents)</FieldLabel>
            <input
              className={inputClass}
              placeholder="2099"
              value={form.compareAtAmount}
              onChange={(e) =>
                setForm({ ...form, compareAtAmount: e.target.value })
              }
            />
          </div>
          <div>
            <FieldLabel>Label</FieldLabel>
            <input
              className={inputClass}
              placeholder="Pro monthly"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-admin-muted">
          Example: amount <code>1499</code> ($14.99) + compare-at{" "}
          <code>2099</code> ($20.99) → website shows $14.99 with $20.99
          crossed out.
        </p>
        <button
          type="button"
          className={`${btnPrimary} mt-4`}
          disabled={saving}
          onClick={addPrice}
        >
          {saving ? "Saving…" : "Add mapping"}
        </button>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Price map</h2>
        {loading ? (
          <p className="text-sm text-admin-muted">Loading…</p>
        ) : prices.length === 0 ? (
          <p className="text-sm text-admin-muted">
            No prices mapped yet. Create products in the Stripe dashboard, then
            paste each price id here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-admin-border">
            <table className="w-full text-sm">
              <thead className="bg-admin-panel text-left text-xs uppercase text-admin-muted">
                <tr>
                  <th className="px-4 py-3">Price id</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Interval</th>
                  <th className="px-4 py-3">Amount ¢</th>
                  <th className="px-4 py-3">Compare-at ¢</th>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => {
                  const draft = drafts[p.id] || {
                    amount: "",
                    compareAtAmount: "",
                  };
                  return (
                    <tr key={p.id} className="border-t border-admin-border">
                      <td className="px-4 py-3 font-mono text-xs">{p.priceId}</td>
                      <td className="px-4 py-3">{p.tier}</td>
                      <td className="px-4 py-3">{p.interval}</td>
                      <td className="px-4 py-3">
                        <input
                          className={`${inputClass} w-24`}
                          value={draft.amount}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...draft,
                                amount: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className={`${inputClass} w-24`}
                          value={draft.compareAtAmount}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...draft,
                                compareAtAmount: e.target.value,
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-medium">
                          {formatAmount(
                            draft.amount ? Number(draft.amount) : null,
                            p.currency,
                          )}
                        </span>
                        {draft.compareAtAmount.trim() !== "" && (
                          <span className="ml-2 text-admin-muted line-through">
                            {formatAmount(
                              Number(draft.compareAtAmount),
                              p.currency,
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            p.isActive
                              ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300"
                              : "rounded-full bg-white/10 px-2 py-0.5 text-xs text-admin-muted"
                          }
                        >
                          {p.isActive ? "active" : "disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            className={btnGhost}
                            disabled={savingId === p.id}
                            onClick={() => saveDisplayAmounts(p)}
                          >
                            {savingId === p.id ? "Saving…" : "Save prices"}
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            onClick={() => toggleActive(p)}
                          >
                            {p.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            onClick={() => remove(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Recent payments</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-admin-muted">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-admin-border">
            <table className="w-full text-sm">
              <thead className="bg-admin-panel text-left text-xs uppercase text-admin-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-admin-border">
                    <td className="px-4 py-3">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{p.user?.email || p.userId}</td>
                    <td className="px-4 py-3">
                      {formatAmount(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3 text-admin-muted">
                      {p.description || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
