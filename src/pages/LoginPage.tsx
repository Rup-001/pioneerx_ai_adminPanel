import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, setAdminToken } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await adminApi.login(email, password);
      setAdminToken(result.access_token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-admin-border bg-admin-card p-8"
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold">
            X
          </div>
          <span className="text-xl font-semibold">PioneerX Admin</span>
        </div>

        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-admin-muted">
          Use your admin credentials to access the dashboard.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-admin-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-admin-border bg-admin-panel px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="admin@pioneerx.ai"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-admin-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-admin-border bg-admin-panel px-4 py-3 outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
