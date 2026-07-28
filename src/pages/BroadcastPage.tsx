import { FormEvent, useState } from "react";
import { adminApi } from "@/lib/api";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
} from "@/components/ui/PageShell";

export default function BroadcastPage() {
  const [type, setType] = useState<"model_update" | "platform_update">(
    "platform_update",
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await adminApi.broadcastNotification({
        type,
        message: message.trim(),
      });
      const count =
        res && typeof res === "object" && "count" in res
          ? String((res as { count: number }).count)
          : "all";
      setSuccess(`Broadcast sent (${count} recipients).`);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Broadcast failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Broadcast notification"
      subtitle="Push a model_update or platform_update notification to every user."
    >
      <StatusBanner error={error} success={success} />

      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-4 rounded-xl border border-admin-border bg-admin-panel p-4"
      >
        <div>
          <FieldLabel>Type</FieldLabel>
          <select
            className={inputClass}
            value={type}
            onChange={(e) =>
              setType(e.target.value as "model_update" | "platform_update")
            }
          >
            <option value="platform_update">platform_update</option>
            <option value="model_update">model_update</option>
          </select>
        </div>
        <div>
          <FieldLabel>Message</FieldLabel>
          <textarea
            className={`${inputClass} min-h-[120px]`}
            required
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="A new AI model has been added to PioneerX."
          />
          <p className="mt-1 text-xs text-admin-muted">
            {message.length}/500
          </p>
        </div>
        <button type="submit" className={btnPrimary} disabled={loading}>
          {loading ? "Sending…" : "Send to all users"}
        </button>
      </form>
    </PageShell>
  );
}
