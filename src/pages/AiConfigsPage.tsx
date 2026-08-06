import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { AiModelConfig } from "@/types";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
} from "@/components/ui/PageShell";

const PROVIDERS = ["openai", "google", "anthropic", "xai"] as const;

type Draft = {
  provider: string;
  modelId: string;
  isActive: boolean;
};

function toDraft(c: AiModelConfig): Draft {
  return {
    provider: c.provider,
    modelId: c.modelId,
    isActive: c.isActive,
  };
}

export default function AiConfigsPage() {
  const [rows, setRows] = useState<AiModelConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getAiConfigs();
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      const next: Record<string, Draft> = {};
      list.forEach((c) => {
        next[c.id] = toDraft(c);
      });
      setDrafts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI configs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(row: AiModelConfig) {
    const draft = drafts[row.id];
    if (!draft) return;
    if (!draft.provider.trim() || !draft.modelId.trim()) {
      setError("Provider and model ID are required");
      return;
    }

    try {
      setSavingId(row.id);
      setError("");
      setSuccess("");
      const updated = await adminApi.updateAiConfig(row.id, {
        provider: draft.provider.trim(),
        modelId: draft.modelId.trim(),
        isActive: draft.isActive,
      });
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      setDrafts((prev) => ({ ...prev, [row.id]: toDraft(updated) }));
      setSuccess(`${row.role} updated.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <PageShell
      title="AI model configs"
      subtitle="Assign provider + modelId to each pipeline role (proposers, aggregator, free tier, image, daily tasks)."
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
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold font-mono">{row.role}</h2>
                  <p className="text-xs text-admin-muted mt-0.5">ID: {row.id}</p>
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
                  <FieldLabel>Provider</FieldLabel>
                  <select
                    className={inputClass}
                    value={draft.provider}
                    onChange={(e) =>
                      setDrafts((p) => ({
                        ...p,
                        [row.id]: { ...draft, provider: e.target.value },
                      }))
                    }
                  >
                    {!PROVIDERS.includes(
                      draft.provider as (typeof PROVIDERS)[number],
                    ) && (
                      <option value={draft.provider}>{draft.provider}</option>
                    )}
                    {PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Model ID</FieldLabel>
                  <input
                    className={inputClass}
                    value={draft.modelId}
                    placeholder="e.g. gpt-4o"
                    onChange={(e) =>
                      setDrafts((p) => ({
                        ...p,
                        [row.id]: { ...draft, modelId: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-admin-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(e) =>
                        setDrafts((p) => ({
                          ...p,
                          [row.id]: { ...draft, isActive: e.target.checked },
                        }))
                      }
                      className="h-4 w-4 rounded border-admin-border"
                    />
                    Active
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
