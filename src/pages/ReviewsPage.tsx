import { FormEvent, useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { AdminReview } from "@/types";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
  btnGhost,
} from "@/components/ui/PageShell";

export default function ReviewsPage() {
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<"all" | "pending">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    roleCompany: "",
    reviewText: "",
    rating: "5",
  });

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data =
        filter === "pending"
          ? await adminApi.getPendingReviews()
          : await adminApi.getReviews();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      await adminApi.createReview({
        name: form.name.trim(),
        roleCompany: form.roleCompany.trim() || undefined,
        reviewText: form.reviewText.trim(),
        rating: Number(form.rating) || undefined,
      });
      setForm({ name: "", roleCompany: "", reviewText: "", rating: "5" });
      setSuccess("Approved review created.");
      setFilter("all");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function approve(id: string) {
    try {
      await adminApi.approveReview(id);
      setSuccess("Review approved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }

  async function reject(id: string) {
    try {
      await adminApi.rejectReview(id);
      setSuccess("Review rejected.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await adminApi.deleteReview(id);
      setSuccess("Review deleted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <PageShell
      title="Reviews"
      subtitle="Moderate user testimonials. Pending = awaiting approval for the public site."
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            className={filter === "pending" ? btnPrimary : btnGhost}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            type="button"
            className={filter === "all" ? btnPrimary : btnGhost}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>
      }
    >
      <StatusBanner error={error} success={success} />

      <form
        onSubmit={onCreate}
        className="mb-8 space-y-3 rounded-xl border border-admin-border bg-admin-panel p-4"
      >
        <h2 className="text-sm font-semibold">Create approved review</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <FieldLabel>Name</FieldLabel>
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Role / company</FieldLabel>
            <input
              className={inputClass}
              value={form.roleCompany}
              onChange={(e) =>
                setForm({ ...form, roleCompany: e.target.value })
              }
            />
          </div>
          <div>
            <FieldLabel>Rating (1–5)</FieldLabel>
            <input
              className={inputClass}
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Review text</FieldLabel>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            required
            value={form.reviewText}
            onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Create
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-admin-muted">Loading…</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-admin-border bg-admin-panel p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {row.name}
                    {row.roleCompany ? (
                      <span className="text-admin-muted">
                        {" "}
                        · {row.roleCompany}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-white/80">{row.reviewText}</p>
                  <p className="mt-2 text-xs text-admin-muted">
                    {row.rating != null ? `${row.rating}★ · ` : ""}
                    {new Date(row.createdAt).toLocaleString()} ·{" "}
                    {row.isApproved ? "Approved" : "Pending"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!row.isApproved && (
                    <>
                      <button
                        type="button"
                        className={btnPrimary}
                        onClick={() => approve(row.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={btnGhost}
                        onClick={() => reject(row.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => remove(row.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-admin-muted">No reviews in this view.</p>
          )}
        </div>
      )}
    </PageShell>
  );
}
