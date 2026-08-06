export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  isTrialActive?: boolean;
  subscription: {
    tier: string;
    status: string;
    renewsAt: string | null;
  } | null;
}

export interface PaginatedUsers {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TokenDashboardUser {
  userId: string;
  email: string;
  tier: string;
  trialEndsAt: string | null;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCostUsd: number;
  byProvider: {
    provider: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  }[];
}

export interface TokenDashboard {
  filters: Record<string, unknown>;
  summary: {
    userCount: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalEstimatedCostUsd: number;
  };
  users: TokenDashboardUser[];
}

export interface DashboardStats {
  totals: {
    totalUsers: number;
    trialUsers: number;
    paidUsers: number;
    freeUsers: number;
    aiCostTodayUsd: number;
    aiCostMonthUsd: number;
    aiCostAllTimeUsd: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  };
  userGrowth: { month: string; users: number }[];
  aiCostByMonth: { month: string; cost: number }[];
  tierCounts: Record<string, number>;
  recentUsers: {
    id: string;
    email: string;
    name: string | null;
    tier: string;
    createdAt: string;
  }[];
}

export type SubscriptionTier =
  | "FREE"
  | "PRO"
  | "PRO_PLUS"
  | "ELITE"
  | string;


export interface CreditConfig {
  id: string;
  tier: SubscriptionTier;
  monthlyCredits: number | null;
  dailyCredits: number | null;
  trialCredits: number | null;
  dailyImageLimit?: number | null;
  updatedAt?: string;
}

export interface QuotaConfig {
  id: string;
  tier: SubscriptionTier;
  dailyTokenLimit: number | null;
  dailyRegenerateLimit: number | null;
  dailyImageLimit: number | null;
  updatedAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  trialDays: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminReview {
  id: string;
  userId: string | null;
  name: string;
  roleCompany: string | null;
  reviewText: string;
  rating: number | null;
  avatarUrl: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
  createdAt?: string;
}

export interface StripePrice {
  id: string;
  priceId: string;
  tier: SubscriptionTier;
  interval: string;
  label: string | null;
  amount: number | null;
  compareAtAmount?: number | null;
  currency: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  provider: string;
  invoiceId: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
  user?: { id: string; email: string; name: string | null };
}

export interface PaginatedPayments {
  data: PaymentRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AiModelConfig {
  id: string;
  role: string;
  provider: string;
  modelId: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
