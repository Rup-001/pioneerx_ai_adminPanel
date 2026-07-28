const TOKEN_KEY = "pioneerx_admin_token";

export function getApiBaseUrl(): string {
  const raw =
    import.meta.env.VITE_API_URL || "http://localhost:8010/api/v1";
  // Relative "/api/v1" → same origin (Vite proxy). Absolute URLs unchanged.
  return raw.replace(/\/$/, "");
}

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message || json?.data?.message || "Something went wrong";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return (json?.data ?? json) as T;
}

export const adminApi = {
  login(email: string, password: string) {
    return request<{ access_token: string }>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getUsers(page = 1, limit = 20) {
    return request<import("@/types").PaginatedUsers>(
      `/admin/users?page=${page}&limit=${limit}`,
    );
  },

  getTokenDashboard(params?: { from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<import("@/types").TokenDashboard>(
      `/admin/token-dashboard${suffix}`,
    );
  },

  getDashboardStats() {
    return request<import("@/types").DashboardStats>(
      "/admin/dashboard-stats",
    );
  },

  // Credits — per-tier allowances (FREE daily 500, PRO monthly, etc.)
  getCreditConfigs() {
    return request<import("@/types").CreditConfig[]>("/admin/credit-configs");
  },
  updateCreditConfig(
    id: string,
    body: Partial<
      Pick<
        import("@/types").CreditConfig,
        "monthlyCredits" | "dailyCredits" | "trialCredits"
      >
    >,
  ) {
    return request<import("@/types").CreditConfig>(
      `/admin/credit-configs/${id}`,
      { method: "PATCH", body: JSON.stringify(body) },
    );
  },

  // Quotas — tokens / regenerate / images per day
  getQuotaConfigs() {
    return request<import("@/types").QuotaConfig[]>("/admin/quota-configs");
  },
  updateQuotaConfig(
    id: string,
    body: Partial<
      Pick<
        import("@/types").QuotaConfig,
        "dailyTokenLimit" | "dailyRegenerateLimit" | "dailyImageLimit"
      >
    >,
  ) {
    return request<import("@/types").QuotaConfig>(
      `/admin/quota-configs/${id}`,
      { method: "PATCH", body: JSON.stringify(body) },
    );
  },

  // Promo codes
  getPromoCodes() {
    return request<import("@/types").PromoCode[]>("/admin/promo-codes");
  },
  createPromoCode(body: {
    code: string;
    trialDays: number;
    maxUses?: number;
    expiresAt?: string;
  }) {
    return request<import("@/types").PromoCode>("/admin/promo-codes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updatePromoCode(
    id: string,
    body: Partial<{
      isActive: boolean;
      trialDays: number;
      maxUses: number | null;
      expiresAt: string | null;
    }>,
  ) {
    return request<import("@/types").PromoCode>(`/admin/promo-codes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  // Reviews
  getReviews() {
    return request<import("@/types").AdminReview[]>("/admin/reviews");
  },
  getPendingReviews() {
    return request<import("@/types").AdminReview[]>("/admin/reviews/pending");
  },
  createReview(body: {
    name: string;
    roleCompany?: string;
    reviewText: string;
    rating?: number;
    avatarUrl?: string;
  }) {
    return request<import("@/types").AdminReview>("/admin/reviews", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  approveReview(id: string) {
    return request<import("@/types").AdminReview>(
      `/admin/reviews/${id}/approve`,
      { method: "PATCH" },
    );
  },
  rejectReview(id: string) {
    return request<unknown>(`/admin/reviews/${id}/reject`, {
      method: "PATCH",
    });
  },
  deleteReview(id: string) {
    return request<unknown>(`/admin/reviews/${id}`, { method: "DELETE" });
  },

  // Broadcast
  broadcastNotification(body: {
    type: "model_update" | "platform_update";
    message: string;
  }) {
    return request<{ count?: number } | unknown>(
      "/admin/notifications/broadcast",
      { method: "POST", body: JSON.stringify(body) },
    );
  },

  getSitePages() {
    return request<import("@/types").SitePage[]>("/admin/site-pages");
  },
  updateSitePage(slug: string, body: { title?: string; body: string }) {
    return request<import("@/types").SitePage>(`/admin/site-pages/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  // Stripe billing — price → tier map
  getStripePrices() {
    return request<import("@/types").StripePrice[]>("/admin/stripe-prices");
  },
  createStripePrice(body: {
    priceId: string;
    tier: string;
    interval?: string;
    label?: string;
    amount?: number;
    currency?: string;
  }) {
    return request<import("@/types").StripePrice>("/admin/stripe-prices", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateStripePrice(
    id: string,
    body: Partial<{
      tier: string;
      interval: string;
      label: string;
      amount: number;
      currency: string;
      isActive: boolean;
    }>,
  ) {
    return request<import("@/types").StripePrice>(
      `/admin/stripe-prices/${id}`,
      { method: "PATCH", body: JSON.stringify(body) },
    );
  },
  deleteStripePrice(id: string) {
    return request<unknown>(`/admin/stripe-prices/${id}`, { method: "DELETE" });
  },

  getPayments(page = 1, limit = 20) {
    return request<import("@/types").PaginatedPayments>(
      `/admin/payments?page=${page}&limit=${limit}`,
    );
  },
};
