import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Globe, Zap, CheckCircle2, XCircle, Clock, AlertCircle,
  Play, Plus, Trash2, RefreshCw, Radio
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SOURCE_TYPE_COLORS: Record<string, string> = {
  reddit: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  hackernews: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  quora: "bg-red-500/20 text-red-300 border-red-500/30",
  producthunt: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  forum: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  custom: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const STATUS_ICONS = {
  pending: <Clock className="w-3.5 h-3.5 text-amber-400" />,
  running: <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
  failed: <XCircle className="w-3.5 h-3.5 text-red-400" />,
};

export default function ScanDashboard() {
  const [scanning, setScanning] = useState(false);
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState({ name: "", type: "reddit" as const, url: "", keywords: "" });

  const { data: sources = [], refetch: refetchSources } = trpc.scanner.getSources.useQuery();
  const { data: jobs = [], refetch: refetchJobs } = trpc.scanner.getRecentJobs.useQuery({ limit: 20 });

  const triggerScan = trpc.scanner.triggerScanPublic.useMutation({
    onSuccess: () => {
      toast.success("Scan started! Results will appear shortly.");
      setScanning(true);
      setTimeout(() => {
        setScanning(false);
        refetchJobs();
      }, 5000);
    },
    onError: (e) => toast.error(e.message),
  });

  const createSource = trpc.scanner.createSource.useMutation({
    onSuccess: () => {
      toast.success("Scan source added!");
      setAddSourceOpen(false);
      refetchSources();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteSource = trpc.scanner.deleteSource.useMutation({
    onSuccess: () => { toast.success("Source removed"); refetchSources(); },
    onError: (e) => toast.error(e.message),
  });

  const handleAddSource = () => {
    if (!newSource.name || !newSource.type) return;
    createSource.mutate({
      name: newSource.name,
      type: newSource.type as any,
      url: newSource.url || undefined,
      keywords: newSource.keywords ? newSource.keywords.split(",").map(k => k.trim()).filter(Boolean) : [],
    });
  };

  const totalFound = jobs.reduce((sum, j) => sum + (j.painPointsFound || 0), 0);
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const runningJobs = jobs.filter(j => j.status === 'running').length;

  return (
    <AppLayout
      title="Internet Scanner"
      subtitle="Real-time pain point discovery from across the web"
      actions={
        <Button
          onClick={() => triggerScan.mutate({})}
          disabled={scanning || triggerScan.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {scanning || triggerScan.isPending ? (
            <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Scanning...</>
          ) : (
            <><Play className="w-3.5 h-3.5 mr-2" />Run Scan</>
          )}
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Pain Points Found", value: totalFound, icon: Globe, color: "text-violet-400" },
          { label: "Scans Completed", value: completedJobs, icon: CheckCircle2, color: "text-green-400" },
          { label: "Active Sources", value: sources.filter(s => s.isActive).length, icon: Radio, color: "text-cyan-400" },
          { label: "Scans Running", value: runningJobs, icon: RefreshCw, color: "text-amber-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Sources */}
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Scan Sources</CardTitle>
            <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs border-border/60">
                  <Plus className="w-3 h-3 mr-1" />Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add Scan Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Source Name</Label>
                    <Input
                      placeholder="e.g. Reddit - Freelancing"
                      value={newSource.name}
                      onChange={e => setNewSource(p => ({ ...p, name: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Platform Type</Label>
                    <Select value={newSource.type} onValueChange={v => setNewSource(p => ({ ...p, type: v as any }))}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {["reddit", "twitter", "hackernews", "quora", "producthunt", "forum", "custom"].map(t => (
                          <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Keywords (comma-separated)</Label>
                    <Input
                      placeholder="automation, workflow, productivity"
                      value={newSource.keywords}
                      onChange={e => setNewSource(p => ({ ...p, keywords: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleAddSource}
                    disabled={createSource.isPending}
                  >
                    {createSource.isPending ? "Adding..." : "Add Source"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {sources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No sources configured. The scanner uses built-in topics by default.</p>
                <p className="text-xs mt-1">Add custom sources to target specific communities.</p>
              </div>
            ) : (
              sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${source.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{source.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${SOURCE_TYPE_COLORS[source.type]}`}>
                          {source.type}
                        </Badge>
                        {source.lastScannedAt && (
                          <span className="text-xs text-muted-foreground">
                            Last: {new Date(source.lastScannedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-primary hover:bg-primary/10"
                      onClick={() => triggerScan.mutate({ sourceId: source.id })}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteSource.mutate({ id: source.id })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Scan Jobs */}
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Scan Jobs</CardTitle>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => refetchJobs()}>
              <RefreshCw className="w-3 h-3 mr-1" />Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No scans yet. Click "Run Scan" to start discovering pain points.</p>
              </div>
            ) : (
              jobs.slice(0, 12).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    {STATUS_ICONS[job.status as keyof typeof STATUS_ICONS] || <AlertCircle className="w-3.5 h-3.5 text-gray-400" />}
                    <div>
                      <div className="text-sm font-medium">Scan #{job.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`text-xs ${
                      job.status === 'completed' ? 'border-green-500/30 text-green-400' :
                      job.status === 'running' ? 'border-blue-500/30 text-blue-400' :
                      job.status === 'failed' ? 'border-red-500/30 text-red-400' :
                      'border-amber-500/30 text-amber-400'
                    }`}>
                      {job.status}
                    </Badge>
                    {job.painPointsFound > 0 && (
                      <div className="text-xs text-violet-400 mt-0.5">+{job.painPointsFound} found</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan trigger info */}
      <Card className="mt-6 bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>How the Scanner Works</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The scanner uses Perplexity Sonar AI to search the live internet for real pain points from Reddit, Twitter, HackerNews, Quora, and ProductHunt.
                Each discovered problem is automatically scored for urgency and market potential using AI analysis.
                Click <strong className="text-foreground">Run Scan</strong> to trigger an immediate scan, or add custom sources with specific keywords to target particular niches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
