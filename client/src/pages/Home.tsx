import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Zap, Search, Brain, ShoppingBag, BarChart3, Settings, ArrowRight, Sparkles, Globe, TrendingUp, Package } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Real-Time Internet Scanner",
    description: "AI bots continuously scan Reddit, forums, Twitter, HackerNews, and communities to discover niche pain points as they emerge.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    href: "/scan",
  },
  {
    icon: Brain,
    title: "AI Pain Point Analyzer",
    description: "Every discovered problem is scored for urgency, market potential, and niche category — surfacing the highest-value opportunities.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    href: "/pain-points",
  },
  {
    icon: Zap,
    title: "Automated Solution Generator",
    description: "AI instantly creates automation scripts, PDF guides, checklists, templates, and mini-tools tailored to each pain point.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    href: "/solutions",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace Storefront",
    description: "Generated solutions are automatically listed in a polished marketplace with pricing, categories, and instant digital delivery.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    href: "/marketplace",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track scan activity, solution pipeline, sales metrics, and revenue in a live dashboard with charts and KPIs.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    href: "/analytics",
  },
  {
    icon: Settings,
    title: "Admin Control Panel",
    description: "Configure scan sources, solution templates, pricing rules, and marketplace settings from a centralized admin interface.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    href: "/admin",
  },
];

const stats = [
  { label: "Pain Points Discovered", value: "∞", icon: Search },
  { label: "Solutions Generated", value: "AI-Powered", icon: Zap },
  { label: "Niches Covered", value: "Any", icon: Globe },
  { label: "Revenue Potential", value: "Unlimited", icon: TrendingUp },
];

export default function Home() {
  const { data: summary } = trpc.analytics.summary.useQuery();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="text-primary">Genie</span> System
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/scan" className="hover:text-foreground transition-colors">Scanner</Link>
            <Link href="/pain-points" className="hover:text-foreground transition-colors">Pain Points</Link>
            <Link href="/solutions" className="hover:text-foreground transition-colors">Solutions</Link>
            <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
            <Link href="/analytics" className="hover:text-foreground transition-colors">Analytics</Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
          </div>
          <Link href="/scan">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Launch Scanner
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, oklch(0.65 0.25 290), transparent)' }} />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 200), transparent)' }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(0.30 0.02 260 / 0.4) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container relative text-center">
          <Badge variant="outline" className="mb-6 border-primary/40 text-primary bg-primary/10 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Autonomous Pain Point Discovery Engine
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Find Problems.{" "}
            <span style={{
              background: 'linear-gradient(135deg, oklch(0.75 0.22 290), oklch(0.72 0.18 200))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Build Solutions.
            </span>
            <br />Sell Automatically.
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI-powered ecosystem that continuously scans the internet for niche pain points,
            generates sellable solutions, and runs a marketplace — all in real time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/scan">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base">
                <Zap className="w-4 h-4 mr-2" />
                Start Scanning Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-border/60 px-8 h-12 text-base hover:bg-secondary">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Pain Points Found", value: summary?.totalPainPoints ?? 0, color: "text-violet-400" },
              { label: "Solutions Generated", value: summary?.totalSolutions ?? 0, color: "text-cyan-400" },
              { label: "Products Listed", value: summary?.totalProducts ?? 0, color: "text-green-400" },
              { label: "Orders Completed", value: summary?.totalOrders ?? 0, color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-4">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              The Complete Autonomous Pipeline
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From discovery to delivery — every step is automated, AI-powered, and running 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href}>
                <div className={`group rounded-xl border p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${feature.bg}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feature.bg}`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              How The Genie Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: "01", title: "Scan", desc: "AI bots crawl forums, Reddit, Twitter & communities for real complaints and frustrations.", icon: Globe, color: "text-violet-400", border: "border-violet-500/30" },
              { step: "02", title: "Analyze", desc: "Each pain point is scored for urgency, market size, and solution feasibility.", icon: Brain, color: "text-cyan-400", border: "border-cyan-500/30" },
              { step: "03", title: "Generate", desc: "AI creates a tailored solution: script, guide, checklist, template, or tool.", icon: Zap, color: "text-amber-400", border: "border-amber-500/30" },
              { step: "04", title: "Sell", desc: "Approved solutions are listed in the marketplace and delivered automatically on purchase.", icon: Package, color: "text-green-400", border: "border-green-500/30" },
            ].map((item, i) => (
              <div key={i} className={`relative rounded-xl border ${item.border} bg-card/30 p-6 text-center`}>
                <div className="text-xs font-mono text-muted-foreground mb-3">{item.step}</div>
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto rounded-2xl border border-primary/20 bg-primary/5 p-12">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to Let the Genie Work?
            </h2>
            <p className="text-muted-foreground mb-8">
              Trigger your first scan and watch the system discover, analyze, and generate solutions in real time.
            </p>
            <Link href="/scan">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-12 text-base">
                <Zap className="w-4 h-4 mr-2" />
                Launch Your First Scan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Genie System</span>
          </div>
          <p className="text-xs text-muted-foreground">Autonomous Pain Point Discovery & Solution Engine</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
            <Link href="/analytics" className="hover:text-foreground">Analytics</Link>
            <Link href="/admin" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
