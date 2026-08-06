import { Link } from "react-router-dom";
import {
  Coins,
  Megaphone,
  Ticket,
  Star,
  Settings2,
  FileText,
  CreditCard,
  Cpu,
} from "lucide-react";

const cards = [
  {
    to: "/ai-configs",
    title: "AI model configs",
    desc: "Map each pipeline role to a provider + model (proposers, aggregator, free tier, image).",
    icon: Cpu,
  },
  {
    to: "/credits",
    title: "Credit allowances",
    desc: "Only usage gate — chat, generate, and images (40 credits / image) all spend from here.",
    icon: Coins,
  },
  {
    to: "/promos",
    title: "Promo codes",
    desc: "Create and disable trial promo codes.",
    icon: Ticket,
  },
  {
    to: "/reviews",
    title: "Reviews",
    desc: "Approve, reject, or publish testimonials.",
    icon: Star,
  },
  {
    to: "/broadcast",
    title: "Broadcast",
    desc: "Send platform / model update notifications to all users.",
    icon: Megaphone,
  },
  {
    to: "/site-pages",
    title: "Site pages",
    desc: "About, Contact, Privacy Policy, Terms & Conditions for the website.",
    icon: FileText,
  },
  {
    to: "/billing",
    title: "Billing (Stripe)",
    desc: "Map Stripe prices to tiers for website checkout and review payments.",
    icon: CreditCard,
  },
];

export default function SettingsPage() {
  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-4 sm:p-6">
      <div className="mb-2 flex items-center gap-2">
        <Settings2 size={20} className="text-indigo-400" />
        <h1 className="text-lg font-semibold sm:text-xl">Settings</h1>
      </div>
      <p className="text-sm text-admin-muted">
        Admin tools — credits gate all AI usage (chat + images). Quotas are retired.
      </p>

      <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
        {cards.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl border border-admin-border bg-admin-panel p-4 transition hover:border-indigo-500/40 hover:bg-white/[0.03]"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon size={18} className="text-indigo-400" />
              <h2 className="font-medium">{title}</h2>
            </div>
            <p className="text-sm text-admin-muted">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
