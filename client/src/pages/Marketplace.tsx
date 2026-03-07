import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingBag, Star, Eye, TrendingUp, Zap, Filter, Package } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Productivity": "text-violet-400",
  "Automation": "text-cyan-400",
  "Marketing": "text-pink-400",
  "Freelancing": "text-amber-400",
  "E-commerce": "text-green-400",
  "Content Creation": "text-orange-400",
  "General": "text-blue-400",
};

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: products = [] } = trpc.marketplace.listProducts.useQuery({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    limit: 48,
  });

  const { data: featured = [] } = trpc.marketplace.getFeatured.useQuery();

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <AppLayout
      title="Marketplace"
      subtitle="AI-generated solutions ready to purchase and download"
    >
      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400" />Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.slice(0, 3).map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}>
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40 transition-all cursor-pointer hover:scale-[1.02]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10">
                        <Star className="w-2.5 h-2.5 mr-1" />Featured
                      </Badge>
                      <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {product.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.shortDescription || product.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{product.viewCount}</span>
                      <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{product.salesCount} sold</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search solutions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-input border-border/60"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48 bg-input border-border/60">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat!} value={cat!}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="font-semibold mb-2">No Products Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate and approve solutions, then publish them to the marketplace.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" className="border-border/60" onClick={() => window.location.href = '/scan'}>
                <Zap className="w-3.5 h-3.5 mr-1.5" />Run Scanner
              </Button>
              <Button variant="outline" size="sm" className="border-border/60" onClick={() => window.location.href = '/solutions'}>
                View Solutions
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{products.length} products available</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}>
                <Card className="bg-card border-border/50 hover:border-border/80 transition-all cursor-pointer hover:scale-[1.01] h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Category */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${CATEGORY_COLORS[product.category || ''] || 'text-muted-foreground'}`}>
                        {product.category || "General"}
                      </span>
                      {product.isFeatured && (
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm mb-2 flex-1 line-clamp-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {product.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                      {product.shortDescription || product.description}
                    </p>

                    {/* Tags */}
                    {product.tags && (product.tags as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(product.tags as string[]).slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{product.viewCount}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{product.salesCount}</span>
                      </div>
                      <span className="text-base font-bold text-primary">${product.price.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
