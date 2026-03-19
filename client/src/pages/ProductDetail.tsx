import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShoppingBag, Eye, TrendingUp, ArrowLeft, CheckCircle2, Lock, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProductDetail() {
  const [, params] = useRoute("/marketplace/:id");
  const productId = parseInt(params?.id ?? "0");

  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { data: product, isLoading } = trpc.marketplace.getProduct.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  const createCheckoutSession = trpc.marketplace.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe hosted checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AppLayout title="Loading..." subtitle="">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout title="Product Not Found" subtitle="">
        <Card className="bg-card border-border/50">
          <CardContent className="py-16 text-center">
            <h3 className="font-semibold mb-2">Product Not Found</h3>
            <Link href="/marketplace">
              <Button variant="outline" size="sm" className="mt-4 border-border/60">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back to Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const tags = (product.tags as string[]) || [];

  return (
    <AppLayout
      title={product.title}
      subtitle={product.category || "Digital Solution"}
      actions={
        <Link href="/marketplace">
          <Button variant="outline" size="sm" className="border-border/60">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Marketplace
          </Button>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {product.category && (
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
                    {product.category}
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {product.title}
              </h1>

              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground border border-border/30">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* What You Get */}
          <Card className="bg-card border-border/50">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                What You Get
              </h2>
              <div className="space-y-3">
                {[
                  "Instant digital download after payment",
                  "AI-generated solution tailored to this specific problem",
                  "Step-by-step actionable content",
                  "Lifetime access to the downloaded file",
                  "7-day download link validity",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Card */}
        <div className="space-y-4">
          <Card className="bg-card border-primary/20 sticky top-20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-1">${product.price.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mb-5">One-time purchase, instant delivery</p>

              <div className="space-y-3 mb-5 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />Views</span>
                  <span className="text-foreground font-medium">{product.viewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Sold</span>
                  <span className="text-foreground font-medium">{product.salesCount}</span>
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                onClick={() => setCheckoutOpen(true)}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Buy Now — ${product.price.toFixed(2)}
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Secure checkout powered by Stripe</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Complete Your Purchase
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Product: </span>
              <span className="font-medium">{product.title}</span>
              <span className="text-primary font-bold ml-2">${product.price.toFixed(2)}</span>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Your Name</Label>
              <Input
                placeholder="John Doe"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Email Address *</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-400" />
              <span>You will be redirected to Stripe's secure checkout to complete payment.</span>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              onClick={() => createCheckoutSession.mutate({ productId: product.id, buyerEmail, buyerName })}
              disabled={!buyerEmail || createCheckoutSession.isPending}
            >
              {createCheckoutSession.isPending ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />Redirecting to checkout...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />Proceed to Payment</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
