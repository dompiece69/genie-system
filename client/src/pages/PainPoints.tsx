import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, Zap, Search, TrendingUp, Filter, ExternalLink, RefreshCw } from "lucide-react";

const SCORE_COLOR = (score: number) => {
  if (score >= 7) return "text-green-400";
  if (score >= 4) return "text-amber-400";
  return "text-red-400";
};

const SCORE_BAR_COLOR = (score: number) => {
  if (score >= 7) return "bg-green-400";
  if (score >= 4) return "bg-amber-400";
  return "bg-red-400";
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  analyzed: { label: "Analyzed", className: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  solution_pending: { label: "Pending", className: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  solution_ready: { label: "Solution Ready", className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  published: { label: "Published", className: "bg-green-500/20 text-green-300 border-green-500/30" },
  archived: { label: "Archived", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export default function PainPoints() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);

  const { data: painPoints = [], refetch } = trpc.painPoints.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100,
  });

  const { data: nicheStats = [] } = trpc.painPoints.getNicheStats.useQuery();

  const generateSolution = trpc.painPoints.generateSolution.useMutation({
    onMutate: ({ painPointId }) => setGeneratingFor(painPointId),
    onSuccess: (data) => {
      toast.success(`Solution generated! Review it in the Solutions tab.`);
      setGeneratingFor(null);
      refetch();
    },
    onError: (e) => {
      toast.error(e.message);
      setGeneratingFor(null);
    },
  });

  return (
    <AppLayout
      title="Pain Point Analyzer"
      subtitle="AI-discovered problems scored by urgency and market potential"
      actions={
        <Button variant="outline" size="sm" className="border-border/60" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
        </Button>
      }
    >
      {/* Niche Stats */}
      {nicheStats.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Niches Discovered</h3>
          <div className="flex flex-wrap gap-2">
            {nicheStats.slice(0, 10).map((stat) => (
              <button
                key={stat.niche}
                onClick={() => setSearch(stat.niche)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 border border-border/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <span>{stat.niche}</span>
                <span className="text-muted-foreground">({stat.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search pain points..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-input border-border/60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-input border-border/60">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="analyzed">Analyzed</SelectItem>
            <SelectItem value="solution_pending">Pending Solution</SelectItem>
            <SelectItem value="solution_ready">Solution Ready</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pain Points Grid */}
      {painPoints.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-16 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="font-semibold mb-2">No Pain Points Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run a scan to start discovering pain points from the internet.
            </p>
            <Button variant="outline" size="sm" className="border-border/60" onClick={() => window.location.href = '/scan'}>
              <Zap className="w-3.5 h-3.5 mr-1.5" />Go to Scanner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {painPoints.map((pp) => {
            const statusInfo = STATUS_LABELS[pp.status] || STATUS_LABELS.new;
            const urgency = pp.urgencyScore ?? 0;
            const market = pp.marketPotentialScore ?? 0;
            const overall = pp.overallScore ?? 0;
            const tags = (pp.tags as string[]) || [];

            return (
              <Card key={pp.id} className="bg-card border-border/50 hover:border-border transition-colors">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-snug mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {pp.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${statusInfo.className}`}>
                          {statusInfo.label}
                        </Badge>
                        {pp.niche && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0 border-border/40 text-muted-foreground">
                            {pp.niche}
                          </Badge>
                        )}
                        {pp.source && (
                          <span className="text-xs text-muted-foreground">{pp.source}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xl font-bold ${SCORE_COLOR(overall)}`}>
                        {overall.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">score</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {pp.description}
                  </p>

                  {/* Score Bars */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">Urgency</span>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${SCORE_BAR_COLOR(urgency)}`} style={{ width: `${urgency * 10}%` }} />
                      </div>
                      <span className={`text-xs font-medium w-6 text-right ${SCORE_COLOR(urgency)}`}>{urgency.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">Market</span>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${SCORE_BAR_COLOR(market)}`} style={{ width: `${market * 10}%` }} />
                      </div>
                      <span className={`text-xs font-medium w-6 text-right ${SCORE_COLOR(market)}`}>{market.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground border border-border/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {pp.status !== 'solution_ready' && pp.status !== 'published' ? (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                        onClick={() => generateSolution.mutate({ painPointId: pp.id })}
                        disabled={generatingFor === pp.id}
                      >
                        {generatingFor === pp.id ? (
                          <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Generating...</>
                        ) : (
                          <><Zap className="w-3 h-3 mr-1" />Generate Solution</>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={() => window.location.href = '/solutions'}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />View Solution
                      </Button>
                    )}
                    {pp.sourceUrl && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" asChild>
                        <a href={pp.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(pp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
