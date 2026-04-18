import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you make a purchase, we collect your name and email address to fulfill your order and send your download link. We do not store payment card details — all payment information is handled by Stripe.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
            <li>To process and fulfill your digital product orders</li>
            <li>To send your purchase confirmation and download link</li>
            <li>To provide customer support if needed</li>
            <li>To improve our Service and product offerings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Sharing Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties. We share data only with service providers necessary to operate our platform (such as Stripe for payment processing), who are bound by their own privacy policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your order information for accounting and legal compliance purposes. Download tokens expire 7 days after purchase. You may request deletion of your personal data by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use a session cookie solely for authentication purposes. No tracking or advertising cookies are used.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use industry-standard security measures to protect your personal information. Download links are secured with unique tokens and expire after 7 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to access, correct, or request deletion of your personal data. To exercise these rights, please contact us through the Genie System platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy questions or data requests, please contact us through the Genie System platform.
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
