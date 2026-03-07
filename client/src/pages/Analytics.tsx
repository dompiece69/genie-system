import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Globe, Zap, ShoppingBag, DollarSign, TrendingUp,
  Brain, Package, Activity
} from "lucide-react";

const COLORS = [
  "oklch(0.65 0.22 290)",
  "oklch(0.72 0.18 200)",
  "oklch(0.72 0.18 150)",
  "oklch(0.78 0.18 70)",
  "oklch(0.65 0.22 25)",
  "oklch(0.72 0.18 320)",
];

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  scan_started: { label: "Scan Started", color: "text-blue-400" },
  scan_completed: { label: "Scan Completed", color: "text-green-400" },
  pain_point_found: { label: "Pain Point Found", color: "text-violet-400" },
  solution_generated: { label: "Solution Generated", color: "text-cyan-400" },
  product_published: { label: "Product Published", color: "text-amber-400" },
  product_viewed: { label: "Product Viewed", color: "text-pink-400" },
  order_placed: { label: "Order Placed", color: "text-green-400" },
  order_completed: { label: "Order Completed", color: "text-emerald-400" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data: summary } = trpc.analytics.summary.useQuery();
  const { data: revenueData = [] } = trpc.analytics.revenueByDay.useQuery({ days: 30 });
  const { data: nicheStats = [] } = trpc.analytics.nicheStats.useQuery();

  const recentEvents = summary?.recentEvents ?? [];

  const kpis = [
    { label: "Pain Points Found", value: summary?.totalPainPoints ?? 0, icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Solutions Generated", value: summary?.totalSolutions ?? 0, icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
    { label: "Products Published", value: summary?.totalProducts ?? 0, icon: Package, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Orders Completed", value: summary?.totalOrders ?? 0, icon: ShoppingBag, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Total Revenue", value: `$${(summary?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Avg Order Value", value: summary?.totalOrders ? `$${((summary.totalRevenue ?? 0) / summary.totalOrders).toFixed(2)}` : "$0.00", icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  ];

  // Build pipeline chart data
  const pipelineData = [
    { stage: "Discovered", count: summary?.totalPainPoints ?? 0 },
    { stage: "Solutions", count: summary?.totalSolutions ?? 0 },
    { stage: "Products", count: summary?.totalProducts ?? 0 },
    { stage: "Sold", count: summary?.totalOrders ?? 0 },
  ];

  return (
    <AppLayout
      title="Analytics Dashboard"
      subtitle="Real-time metrics across the entire Genie pipeline"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`bg-card border ${kpi.bg}`}>
            <CardContent className="p-4">
              <kpi.icon className={`w-4 h-4 ${kpi.color} mb-2`} />
              <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Revenue (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No revenue data yet. Make your first sale!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.20 0.02 260)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(0.55 0.02 260)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'oklch(0.55 0.02 260)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.72 0.18 150)"
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.72 0.18 150)', r: 3 }}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.20 0.02 260)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'oklch(0.55 0.02 260)' }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: 'oklch(0.75 0.01 240)' }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Niche Distribution */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Pain Points by Niche
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nicheStats.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Run a scan to see niche distribution
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={nicheStats.slice(0, 6)}
                      dataKey="count"
                      nameKey="niche"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                    >
                      {nicheStats.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {nicheStats.slice(0, 6).map((stat, i) => (
                    <div key={stat.niche} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground truncate max-w-24">{stat.niche}</span>
                      </div>
                      <span className="font-medium">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No activity yet. Start a scan to see events here.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {recentEvents.slice(0, 20).map((event) => {
                  const info = EVENT_LABELS[event.type] || { label: event.type, color: "text-muted-foreground" };
                  return (
                    <div key={event.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        <span className={info.color}>{info.label}</span>
                        {event.entityId && (
                          <span className="text-muted-foreground">#{event.entityId}</span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(event.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
