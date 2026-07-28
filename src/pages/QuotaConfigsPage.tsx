import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { QuotaConfig } from "@/types";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
} from "@/components/ui/PageShell";

type Draft = {
  dailyTokenLimit: string;
  dailyRegenerateLimit: string;
  dailyImageLimit: string;
};

function toDraft(c: QuotaConfig): Draft {
  return {
    dailyTokenLimit: c.dailyTokenLimit == null ? "" : String(c.dailyTokenLimit),
    dailyRegenerateLimit:
      c.dailyRegenerateLimit == null ? "" : String(c.dailyRegenerateLimit),
    dailyImageLimit: c.dailyImageLimit == null ? "" : String(c.dailyImageLimit),
  };
}

function parseOptionalPositiveInt(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) {
    throw new Error("Limits must be a whole number ≥ 1 (or empty for unlimited)");
  }
  return n;
}

export default function QuotaConfigsPage() {
  const [rows, setRows] = useState<QuotaConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getQuotaConfigs();
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      const next: Record<string, Draft> = {};
      list.forEach((c) => {
        next[c.id] = toDraft(c);
      });
      setDrafts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quotas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(row: QuotaConfig) {
    const draft = drafts[row.id];
    if (!draft) return;
    try {
      setSavingId(row.id);
      setError("");
      setSuccess("");
      const body = {
        dailyTokenLimit: parseOptionalPositiveInt(draft.dailyTokenLimit),
        dailyRegenerateLimit: parseOptionalPositiveInt(draft.dailyRegenerateLimit),
        dailyImageLimit: parseOptionalPositiveInt(draft.dailyImageLimit),
      };
      const updated = await adminApi.updateQuotaConfig(row.id, body);
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      setDrafts((prev) => ({ ...prev, [row.id]: toDraft(updated) }));
      setSuccess(`${row.tier} quota updated.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <PageShell
      title="Quota & image limits"
      subtitle="Daily token, regenerate, and image generation caps per plan. Empty = unlimited."
    >
      <StatusBanner error={error} success={success} />
      {loading && <p className="text-sm text-admin-muted">Loading…</p>}

      <div className="space-y-4">
        {rows.map((row) => {
          const draft = drafts[row.id] || toDraft(row);
          return (
            <div
              key={row.id}
              className="rounded-xl border border-admin-border bg-admin-panel p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{row.tier}</h2>
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
                  <FieldLabel>Daily token limit</FieldLabel>
                  <input
                    className={inputClass}
                    value={draft.dailyTokenLimit}
                    onChange={(e) =>
                      setDrafts((p) => ({
                        ...p,
                        [row.id]: { ...draft, dailyTokenLimit: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Daily regenerate limit</FieldLabel>
                  <input
                    className={inputClass}
                    value={draft.dailyRegenerateLimit}
                    onChange={(e) =>
                      setDrafts((p) => ({
                        ...p,
                        [row.id]: {
                          ...draft,
                          dailyRegenerateLimit: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Daily image limit</FieldLabel>
                  <input
                    className={inputClass}
                    value={draft.dailyImageLimit}
                    onChange={(e) =>
                      setDrafts((p) => ({
                        ...p,
                        [row.id]: { ...draft, dailyImageLimit: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
