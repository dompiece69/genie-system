import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <Link href="/">
            <Button variant="outline" size="sm" className="border-border/60">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container max-w-3xl pt-28 pb-20 prose prose-invert prose-sm mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using the Genie System marketplace ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Digital Products</h2>
          <p className="text-muted-foreground leading-relaxed">
            All products sold on Genie System are AI-generated digital products (guides, scripts, templates, checklists). Due to the digital nature of these products, <strong>all sales are final</strong> and no refunds will be issued once a download link has been accessed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Purchases & Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            Payments are processed securely by Stripe. We do not store your payment card information. Prices are listed in USD. Upon successful payment, you will receive a time-limited download link valid for 7 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            Upon purchase, you receive a personal, non-exclusive, non-transferable license to use the purchased digital product for personal or commercial purposes. You may not resell, redistribute, or sublicense the product to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            Products are provided "as is" without warranty of any kind. AI-generated content is provided for informational purposes and may require customization for your specific use case. We make no guarantees regarding income, business results, or fitness for any particular purpose.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Genie System shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms, please contact us through the Genie System platform.
          </p>
        </section>
      </div>

      <footer className="border-t border-border/30 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Genie System</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
