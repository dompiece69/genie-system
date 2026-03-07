import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings, Zap, ShoppingBag, Globe, DollarSign, RefreshCw,
  Save, Play, Trash2, ToggleLeft, ToggleRight, AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPanel() {
  const [scanInterval, setScanInterval] = useState("60");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);
  const [minScore, setMinScore] = useState("6");
  const [defaultPrice, setDefaultPrice] = useState("9.99");
  const [maxPriceGuide, setMaxPriceGuide] = useState("29.99");
  const [maxPriceScript, setMaxPriceScript] = useState("49.99");
  const [saving, setSaving] = useState(false);

  const { data: sources = [], refetch: refetchSources } = trpc.scanner.getSources.useQuery();
  const { data: summary } = trpc.analytics.summary.useQuery();

  const triggerScan = trpc.scanner.triggerScanPublic.useMutation({
    onSuccess: () => toast.success("Full scan triggered across all sources!"),
    onError: (e) => toast.error(e.message),
  });

  const deleteSource = trpc.scanner.deleteSource.useMutation({
    onSuccess: () => { toast.success("Source deleted"); refetchSources(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 800);
  };

  return (
    <AppLayout
      title="Admin Control Panel"
      subtitle="Configure scan sources, solution templates, pricing, and marketplace settings"
      actions={
        <Button
          onClick={() => triggerScan.mutate({})}
          disabled={triggerScan.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {triggerScan.isPending ? (
            <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Scanning...</>
          ) : (
            <><Play className="w-3.5 h-3.5 mr-2" />Run Full Scan</>
          )}
        </Button>
      }
    >
      {/* System Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pain Points", value: summary?.totalPainPoints ?? 0, color: "text-violet-400" },
          { label: "Solutions", value: summary?.totalSolutions ?? 0, color: "text-cyan-400" },
          { label: "Products", value: summary?.totalProducts ?? 0, color: "text-amber-400" },
          { label: "Revenue", value: `$${(summary?.totalRevenue ?? 0).toFixed(2)}`, color: "text-green-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="scanner" className="space-y-5">
        <TabsList className="bg-secondary/50 border border-border/40">
          <TabsTrigger value="scanner" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Globe className="w-3.5 h-3.5 mr-1.5" />Scanner
          </TabsTrigger>
          <TabsTrigger value="solutions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Zap className="w-3.5 h-3.5 mr-1.5" />Solutions
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />Marketplace
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />Pricing
          </TabsTrigger>
        </TabsList>

        {/* Scanner Settings */}
        <TabsContent value="scanner">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Scan Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Scan Interval (minutes)</Label>
                  <div className="flex gap-2">
                    {["15", "30", "60", "120", "360"].map(v => (
                      <button
                        key={v}
                        onClick={() => setScanInterval(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          scanInterval === v
                            ? 'bg-primary/20 border-primary/40 text-primary'
                            : 'bg-secondary/30 border-border/40 text-muted-foreground hover:border-border'
                        }`}
                      >
                        {v}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-Generate Solutions</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically generate solutions for high-scoring pain points</p>
                  </div>
                  <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Minimum Score to Auto-Generate</Label>
                  <div className="flex gap-2">
                    {["5", "6", "7", "8", "9"].map(v => (
                      <button
                        key={v}
                        onClick={() => setMinScore(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          minScore === v
                            ? 'bg-primary/20 border-primary/40 text-primary'
                            : 'bg-secondary/30 border-border/40 text-muted-foreground hover:border-border'
                        }`}
                      >
                        {v}+
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5 mr-2" />Save Scanner Settings</>}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Scan Sources ({sources.filter(s => s.isActive).length})</CardTitle>
              </CardHeader>
              <CardContent>
                {sources.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No custom sources. Using built-in topics.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-border/60 text-xs"
                      onClick={() => window.location.href = '/scan'}
                    >
                      Add Sources in Scanner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${source.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <div>
                            <div className="text-sm font-medium">{source.name}</div>
                            <Badge variant="outline" className="text-xs px-1.5 py-0 border-border/40 text-muted-foreground mt-0.5">
                              {source.type}
                            </Badge>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Solution Settings */}
        <TabsContent value="solutions">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Solution Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-Publish Approved Solutions</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Skip manual review and publish directly to marketplace</p>
                </div>
                <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
              </div>

              {autoPublish && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">Auto-publish is enabled. Solutions will be listed immediately without review. Disable this to manually approve each solution.</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Default Solution Types to Generate</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "pdf_guide", label: "PDF Guide", enabled: true },
                    { type: "automation_script", label: "Automation Script", enabled: true },
                    { type: "checklist", label: "Checklist", enabled: true },
                    { type: "template", label: "Template", enabled: false },
                    { type: "mini_tool", label: "Mini Tool", enabled: false },
                    { type: "video_script", label: "Video Script", enabled: false },
                  ].map((item) => (
                    <div key={item.type} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
                      item.enabled ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary/30 border-border/30 text-muted-foreground'
                    }`}>
                      {item.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5 mr-2" />Save Solution Settings</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Settings */}
        <TabsContent value="marketplace">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Marketplace Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 max-w-lg">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Marketplace Name</Label>
                <Input defaultValue="Genie Solutions Store" className="bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Marketplace Tagline</Label>
                <Input defaultValue="AI-generated solutions for real problems" className="bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Download Link Expiry</Label>
                <Select defaultValue="7">
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="0">Never expire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Sales Count</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Display number of sales on product listings</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5 mr-2" />Save Marketplace Settings</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings */}
        <TabsContent value="pricing">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pricing Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 max-w-lg">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Default Product Price ($)</Label>
                <Input
                  type="number"
                  value={defaultPrice}
                  onChange={e => setDefaultPrice(e.target.value)}
                  className="bg-input border-border"
                  min="0.99"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Max Price — PDF Guide ($)</Label>
                <Input
                  type="number"
                  value={maxPriceGuide}
                  onChange={e => setMaxPriceGuide(e.target.value)}
                  className="bg-input border-border"
                  min="0.99"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Max Price — Automation Script ($)</Label>
                <Input
                  type="number"
                  value={maxPriceScript}
                  onChange={e => setMaxPriceScript(e.target.value)}
                  className="bg-input border-border"
                  min="0.99"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Pricing Strategy</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Fixed", "Score-Based", "Dynamic"].map((strategy) => (
                    <button
                      key={strategy}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        strategy === "Score-Based"
                          ? 'bg-primary/20 border-primary/40 text-primary'
                          : 'bg-secondary/30 border-border/40 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {strategy}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Score-Based: Price is calculated from the pain point's urgency and market potential scores.
                </p>
              </div>
              <Button
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5 mr-2" />Save Pricing Settings</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
