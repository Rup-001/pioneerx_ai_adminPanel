import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { CreditConfig } from "@/types";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
} from "@/components/ui/PageShell";

type Draft = {
  monthlyCredits: string;
  dailyCredits: string;
  trialCredits: string;
};

function toDraft(c: CreditConfig): Draft {
  return {
    monthlyCredits: c.monthlyCredits == null ? "" : String(c.monthlyCredits),
    dailyCredits: c.dailyCredits == null ? "" : String(c.dailyCredits),
    trialCredits: c.trialCredits == null ? "" : String(c.trialCredits),
  };
}

function parseOptionalInt(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new Error("Credits must be a whole number ≥ 0 (or empty for none)");
  }
  return n;
}

const tierHint: Record<string, string> = {
  FREE: "Free users use Daily credits. Trial users use Trial credits (from this FREE row).",
  PRO: "Paid tier — Monthly credits reset on billing cycle.",
  PRO_PLUS: "Paid tier — Monthly credits reset on billing cycle.",
  ELITE: "Paid tier — Monthly credits reset on billing cycle.",
};

export default function CreditConfigsPage() {
  const [rows, setRows] = useState<CreditConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getCreditConfigs();
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      const next: Record<string, Draft> = {};
      list.forEach((c) => {
        next[c.id] = toDraft(c);
      });
      setDrafts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credit configs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(row: CreditConfig) {
    const draft = drafts[row.id];
    if (!draft) return;
    try {
      setSavingId(row.id);
      setError("");
      setSuccess("");
      const body = {
        monthlyCredits: parseOptionalInt(draft.monthlyCredits),
        dailyCredits: parseOptionalInt(draft.dailyCredits),
        trialCredits: parseOptionalInt(draft.trialCredits),
      };
      const updated = await adminApi.updateCreditConfig(row.id, body);
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      setDrafts((prev) => ({ ...prev, [row.id]: toDraft(updated) }));
      setSuccess(
        `${row.tier} credits updated. Takes effect on the next reset cycle (not mid-cycle for existing balances).`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <PageShell
      title="Credit allowances"
      subtitle="Set how many credits each plan gets. Example: Free daily = 500 — change anytime from here."
    >
      <StatusBanner error={error} success={success} />

      {loading && <p className="text-sm text-admin-muted">Loading…</p>}

      {!loading && rows.length === 0 && (
        <p className="text-sm text-admin-muted">No credit configs found. Run backend seed.</p>
      )}

      <div className="space-y-4">
        {rows.map((row) => {
          const draft = drafts[row.id] || toDraft(row);
          return (
            <div
              key={row.id}
              className="rounded-xl border border-admin-border bg-admin-panel p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">{row.tier}</h2>
                  <p className="text-xs text-admin-muted">
                    {tierHint[row.tier] || "Edit credit fields for this tier."}
                  </p>
                </div>
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={savingId === row.id}
                  onClick={() => save(row)}
                >
                  {savingId === row.id ? "Saving…" : "Save"}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <FieldLabel>Daily credits (Free)</FieldLabel>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="e.g. 500"
                    value={draft.dailyCredits}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, dailyCredits: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Trial credits (daily while on trial)</FieldLabel>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="e.g. 2000"
                    value={draft.trialCredits}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, trialCredits: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Monthly credits (paid tiers)</FieldLabel>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="e.g. 15000"
                    value={draft.monthlyCredits}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, monthlyCredits: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-admin-muted">
                Leave a field empty to clear (null). Typical: FREE fills Daily + Trial; PRO / PRO_PLUS / ELITE fill Monthly.
              </p>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
