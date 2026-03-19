import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Zap, FileText, Code, CheckSquare, Layout, Video, Wrench,
  CheckCircle2, XCircle, ShoppingBag, RefreshCw, Eye, Edit3, Filter
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Streamdown } from "streamdown";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  automation_script: <Code className="w-4 h-4 text-violet-400" />,
  pdf_guide: <FileText className="w-4 h-4 text-cyan-400" />,
  mini_tool: <Wrench className="w-4 h-4 text-amber-400" />,
  checklist: <CheckSquare className="w-4 h-4 text-green-400" />,
  template: <Layout className="w-4 h-4 text-pink-400" />,
  video_script: <Video className="w-4 h-4 text-orange-400" />,
};

const TYPE_LABELS: Record<string, string> = {
  automation_script: "Automation Script",
  pdf_guide: "PDF Guide",
  mini_tool: "Mini Tool",
  checklist: "Checklist",
  template: "Template",
  video_script: "Video Script",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  pending_review: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  approved: "bg-green-500/20 text-green-300 border-green-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  published: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export default function Solutions() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSolution, setSelectedSolution] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const { data: solutions = [], refetch } = trpc.solutions.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100,
  });

  const reviewSolution = trpc.solutions.review.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Solution ${vars.status === 'approved' ? 'approved' : 'rejected'}!`);
      setSelectedSolution(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const publishSolution = trpc.solutions.publish.useMutation({
    onMutate: ({ id }) => setPublishingId(id),
    onSuccess: (data) => {
      toast.success("Solution published to marketplace!");
      setPublishingId(null);
      refetch();
    },
    onError: (e) => {
      toast.error(e.message);
      setPublishingId(null);
    },
  });

  const openPreview = (solution: any) => {
    setSelectedSolution(solution);
    setEditTitle(solution.title);
    setEditDescription(solution.description);
    setEditContent(solution.content || "");
    setReviewNotes("");
    setEditMode(false);
  };

  const handleApprove = () => {
    if (!selectedSolution) return;
    reviewSolution.mutate({
      id: selectedSolution.id,
      status: 'approved',
      reviewNotes,
      title: editTitle,
      description: editDescription,
      content: editContent,
    });
  };

  const handleReject = () => {
    if (!selectedSolution) return;
    reviewSolution.mutate({
      id: selectedSolution.id,
      status: 'rejected',
      reviewNotes,
    });
  };

  const pendingCount = solutions.filter(s => s.status === 'pending_review').length;
  const approvedCount = solutions.filter(s => s.status === 'approved').length;
  const publishedCount = solutions.filter(s => s.status === 'published').length;

  return (
    <AppLayout
      title="Solution Generator"
      subtitle="Review, edit, and approve AI-generated solutions before publishing"
      actions={
        <Button variant="outline" size="sm" className="border-border/60" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Review", value: pendingCount, color: "text-amber-400", border: "border-amber-500/20" },
          { label: "Approved", value: approvedCount, color: "text-green-400", border: "border-green-500/20" },
          { label: "Published", value: publishedCount, color: "text-cyan-400", border: "border-cyan-500/20" },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-card border-border/50 ${stat.border}`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-input border-border/60">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Solutions</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{solutions.length} solutions</span>
      </div>

      {/* Solutions List */}
      {solutions.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-16 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="font-semibold mb-2">No Solutions Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Go to Pain Points and click "Generate Solution" to create your first solution.
            </p>
            <Button variant="outline" size="sm" className="border-border/60" onClick={() => window.location.href = '/pain-points'}>
              Go to Pain Points
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {solutions.map((sol) => (
            <Card key={sol.id} className="bg-card border-border/50 hover:border-border/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                    {TYPE_ICONS[sol.type] || <FileText className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-sm leading-snug" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {sol.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0 ${STATUS_STYLES[sol.status]}`}>
                            {sol.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0 border-border/40 text-muted-foreground">
                            {TYPE_LABELS[sol.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sol.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => openPreview(sol)}
                        >
                          <Eye className="w-3 h-3 mr-1" />Preview
                        </Button>
                        {sol.status === 'approved' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                            onClick={() => publishSolution.mutate({ id: sol.id })}
                            disabled={publishingId === sol.id}
                          >
                            {publishingId === sol.id ? (
                              <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Publishing...</>
                            ) : (
                              <><ShoppingBag className="w-3 h-3 mr-1" />Publish</>
                            )}
                          </Button>
                        )}
                        {sol.status === 'pending_review' && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                            onClick={() => openPreview(sol)}
                          >
                            <Edit3 className="w-3 h-3 mr-1" />Review
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{sol.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview/Review Dialog */}
      <Dialog open={!!selectedSolution} onOpenChange={(open) => !open && setSelectedSolution(null)}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {selectedSolution && TYPE_ICONS[selectedSolution.type]}
              Solution Review
            </DialogTitle>
          </DialogHeader>

          {selectedSolution && (
            <div className="space-y-4">
              {/* Edit toggle */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`${STATUS_STYLES[selectedSolution.status]}`}>
                  {selectedSolution.status.replace('_', ' ')}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-border/60"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {editMode ? "Preview" : "Edit"}
                </Button>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Title</label>
                {editMode ? (
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="bg-input border-border"
                  />
                ) : (
                  <h3 className="font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{editTitle}</h3>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                {editMode ? (
                  <Textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    rows={3}
                    className="bg-input border-border resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{editDescription}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Content</label>
                {editMode ? (
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={12}
                    className="bg-input border-border resize-none font-mono text-xs"
                  />
                ) : (
                  <div className="bg-secondary/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="text-sm text-foreground prose prose-invert prose-sm max-w-none">
                      <Streamdown>{editContent || "No content generated yet."}</Streamdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Notes */}
              {selectedSolution.status === 'pending_review' && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Review Notes (optional)</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this solution..."
                    rows={2}
                    className="bg-input border-border resize-none text-sm"
                  />
                </div>
              )}

              {/* Actions */}
              {selectedSolution.status === 'pending_review' && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                    onClick={handleApprove}
                    disabled={reviewSolution.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />Approve & Save
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={handleReject}
                    disabled={reviewSolution.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />Reject
                  </Button>
                </div>
              )}
              {selectedSolution.status === 'approved' && (
                <Button
                  className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                  onClick={() => {
                    publishSolution.mutate({ id: selectedSolution.id });
                    setSelectedSolution(null);
                  }}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />Publish to Marketplace
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
