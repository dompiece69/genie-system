import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, CheckCircle2, XCircle, Sparkles } from "lucide-react";

export default function DownloadPage() {
  const [, params] = useRoute("/download/:token");
  const token = params?.token ?? "";

  const { data, isLoading, error } = trpc.marketplace.getDownload.useQuery(
    { token },
    { enabled: !!token }
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <span className="text-primary">Genie</span> System
          </h1>
        </div>

        <Card className="bg-card border-border/50">
          <CardContent className="p-8">
            {isLoading && (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Verifying your download...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-red-400" />
                </div>
                <h2 className="font-semibold mb-2">Download Unavailable</h2>
                <p className="text-sm text-muted-foreground">
                  {error.message || "This download link is invalid or has expired."}
                </p>
              </div>
            )}

            {data && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="font-semibold text-lg mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Your Download is Ready
                </h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Thank you for your purchase, {data.order.buyerEmail}!
                </p>

                <div className="bg-secondary/30 rounded-lg p-4 text-left mb-6 mt-4">
                  <p className="text-xs text-muted-foreground mb-1">Product</p>
                  <p className="font-medium text-sm">{data.product.title}</p>
                  {data.product.category && (
                    <p className="text-xs text-muted-foreground mt-1">{data.product.category}</p>
                  )}
                </div>

                {data.fileUrl ? (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                    onClick={() => window.open(data.fileUrl!, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Your Solution
                  </Button>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-300">
                    Your solution is being prepared. Please check back in a moment.
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  Download link valid for 7 days from purchase
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
