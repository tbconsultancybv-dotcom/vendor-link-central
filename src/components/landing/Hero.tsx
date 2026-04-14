import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-primary-foreground/80">
              Nu beschikbaar voor Nederlandse bedrijven
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-slide-up">
            Al je contracten.{" "}
            <span className="text-gradient">Eén overzicht.</span>
            <br />
            Volledige controle.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Stop met zoeken in mailboxen en mappen. BivaroX centraliseert al je leverancierscontracten, 
            bewaakt deadlines en helpt je besparen.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth">
                Gratis Starten
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="#demo">
                Bekijk Demo
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/60">
              <Shield className="w-5 h-5" />
              <span className="text-sm">GDPR Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/60">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Nooit meer stilzwijgende verlenging</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/60">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Gemiddeld 23% kostenbesparing</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 rounded-2xl blur-2xl" />
            <div className="relative bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="ml-4 text-sm text-muted-foreground">BivaroX Dashboard</span>
              </div>
              <div className="p-6 bg-background min-h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Actieve Contracten", value: "47" },
                      { label: "Te Verlengen", value: "5" },
                      { label: "Maandkosten", value: "€12.450" },
                      { label: "Besparing", value: "€3.200" },
                    ].map((stat, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
