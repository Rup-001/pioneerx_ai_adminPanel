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
  currency: "usd",
};

function formatAmount(amount: number | null, currency: string) {
  if (amount === null || amount === undefined) return "—";
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export default function BillingPage() {
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [priceList, paymentPage] = await Promise.all([
        adminApi.getStripePrices(),
        adminApi.getPayments(1, 20).catch(() => null),
      ]);
      setPrices(Array.isArray(priceList) ? priceList : []);
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
      const created = await adminApi.createStripePrice({
        priceId: form.priceId.trim(),
        tier: form.tier,
        interval: form.interval,
        label: form.label.trim() || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        currency: form.currency.trim() || "usd",
      });
      setPrices((prev) => [...prev, created]);
      setForm(emptyForm);
      setSuccess(`Mapped ${created.priceId} → ${created.tier}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add price");
    } finally {
      setSaving(false);
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
      setPrices((prev) => prev.filter((p) => p.id !== price.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <PageShell
      title="Billing (Stripe)"
      subtitle="Map Stripe prices to tiers for website checkout. Mobile purchases still go through RevenueCat."
      actions={
        <button type="button" className={btnGhost} onClick={load}>
          Refresh
        </button>
      }
    >
      <StatusBanner error={error} success={success} />

      <div className="rounded-xl border border-admin-border bg-admin-panel p-4">
        <h2 className="mb-3 text-sm font-semibold">Add a price mapping</h2>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <div className="lg:col-span-2">
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
            <FieldLabel>Label</FieldLabel>
            <input
              className={inputClass}
              placeholder="Pro monthly"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
        </div>
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
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.id} className="border-t border-admin-border">
                    <td className="px-4 py-3 font-mono text-xs">{p.priceId}</td>
                    <td className="px-4 py-3">{p.tier}</td>
                    <td className="px-4 py-3">{p.interval}</td>
                    <td className="px-4 py-3">
                      {formatAmount(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3 text-admin-muted">
                      {p.label || "—"}
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
                      <div className="flex justify-end gap-2">
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
                ))}
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
