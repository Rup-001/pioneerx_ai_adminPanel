import { FormEvent, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { PromoCode } from "@/types";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
  btnGhost,
} from "@/components/ui/PageShell";

export default function PromoCodesPage() {
  const [rows, setRows] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "",
    trialDays: "30",
    maxUses: "",
    expiresAt: "",
  });

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getPromoCodes();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load promos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      setCreating(true);
      setError("");
      setSuccess("");
      const body: {
        code: string;
        trialDays: number;
        maxUses?: number;
        expiresAt?: string;
      } = {
        code: form.code.trim().toUpperCase(),
        trialDays: Number(form.trialDays),
      };
      if (form.maxUses.trim()) body.maxUses = Number(form.maxUses);
      if (form.expiresAt.trim()) {
        body.expiresAt = new Date(form.expiresAt).toISOString();
      }
      await adminApi.createPromoCode(body);
      setForm({ code: "", trialDays: "30", maxUses: "", expiresAt: "" });
      setSuccess("Promo code created.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(row: PromoCode) {
    try {
      setError("");
      await adminApi.updatePromoCode(row.id, { isActive: !row.isActive });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <PageShell
      title="Promo codes"
      subtitle="Create trial extension codes. Users redeem via POST /auth/apply-promo or at signup."
    >
      <StatusBanner error={error} success={success} />

      <form
        onSubmit={onCreate}
        className="mb-8 grid gap-3 rounded-xl border border-admin-border bg-admin-panel p-4 md:grid-cols-4"
      >
        <div>
          <FieldLabel>Code</FieldLabel>
          <input
            className={inputClass}
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="LAUNCH30"
          />
        </div>
        <div>
          <FieldLabel>Trial days</FieldLabel>
          <input
            className={inputClass}
            required
            type="number"
            min={1}
            value={form.trialDays}
            onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>Max uses (optional)</FieldLabel>
          <input
            className={inputClass}
            type="number"
            min={1}
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            placeholder="Unlimited"
          />
        </div>
        <div>
          <FieldLabel>Expires (optional)</FieldLabel>
          <input
            className={inputClass}
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </div>
        <div className="md:col-span-4">
          <button type="submit" className={btnPrimary} disabled={creating}>
            {creating ? "Creating…" : "Create promo"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-admin-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-admin-panel text-admin-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Trial days</th>
                <th className="px-4 py-3 text-left font-medium">Uses</th>
                <th className="px-4 py-3 text-left font-medium">Expires</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-admin-border">
                  <td className="px-4 py-3 font-mono font-medium">{row.code}</td>
                  <td className="px-4 py-3">{row.trialDays}</td>
                  <td className="px-4 py-3">
                    {row.usedCount}
                    {row.maxUses != null ? ` / ${row.maxUses}` : " / ∞"}
                  </td>
                  <td className="px-4 py-3 text-admin-muted">
                    {row.expiresAt
                      ? new Date(row.expiresAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        row.isActive
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-white/10 text-admin-muted"
                      }`}
                    >
                      {row.isActive ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => toggleActive(row)}
                    >
                      {row.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="py-6 text-sm text-admin-muted">No promo codes yet.</p>
          )}
        </div>
      )}
    </PageShell>
  );
}
