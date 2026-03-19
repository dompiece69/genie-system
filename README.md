# 🧞 Genie System

**Autonomous Pain Point Discovery & Solution Engine**

An AI-powered real-time ecosystem that continuously scans the internet for niche problems, generates sellable solutions, and runs a marketplace — all automatically.

## What It Does

| Module | Description |
|--------|-------------|
| 🔍 **Internet Scanner** | Perplexity Sonar AI scans Reddit, HackerNews, Twitter, Quora, ProductHunt for real pain points |
| 🧠 **Pain Point Analyzer** | Scores each problem 0–10 for urgency and market potential; categorized by niche |
| ⚡ **Solution Generator** | AI creates PDF guides, automation scripts, checklists, and templates for each pain point |
| ✅ **Review & Approval** | Preview, edit, approve or reject solutions before publishing |
| 🛒 **Marketplace** | Product listings with pricing, categories, featured products, and instant checkout |
| 📦 **Automated Delivery** | Token-based download links on purchase, valid for 7 days |
| 📊 **Analytics Dashboard** | Live KPIs, revenue chart, pipeline funnel, niche distribution, activity feed |
| ⚙️ **Admin Control Panel** | Configure scan sources, auto-generate rules, pricing strategy, marketplace settings |

## Tech Stack

- **Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui + Recharts
- **Backend:** Express + tRPC 11 + Drizzle ORM
- **Database:** MySQL/TiDB
- **AI:** Perplexity Sonar API (internet scanning + solution generation)
- **Auth:** Manus OAuth
- **Storage:** S3

## Getting Started

```bash
pnpm install
pnpm db:push
pnpm dev
```

## Environment Variables

See `.env.example` for required environment variables including:
- `DATABASE_URL`
- `SONAR_API_KEY` (Perplexity)
- `JWT_SECRET`

## Testing

```bash
pnpm test
```

17 tests passing across auth, scanner, pain points, solutions, marketplace, and analytics routers.

---

*Built with the Manus AI platform*
