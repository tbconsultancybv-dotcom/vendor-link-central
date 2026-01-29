import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "€49",
    period: "/maand",
    description: "Voor kleine bedrijven die grip willen op hun contracten",
    features: [
      "Tot 25 contracten",
      "3 gebruikers",
      "Basismeldingen",
      "Documentopslag",
      "Email support"
    ],
    cta: "Start Gratis",
    highlighted: false
  },
  {
    name: "Professional",
    price: "€149",
    period: "/maand",
    description: "Voor groeiende bedrijven met meer complexiteit",
    features: [
      "Tot 100 contracten",
      "10 gebruikers",
      "Geavanceerde notificaties",
      "AI documentverwerking",
      "Kosteninzichten & trends",
      "Leveranciersmarktplaats",
      "Prioriteit support"
    ],
    cta: "Start Gratis",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Op maat",
    period: "",
    description: "Voor grote organisaties met specifieke wensen",
    features: [
      "Onbeperkt contracten",
      "Onbeperkt gebruikers",
      "Custom integraties (API)",
      "Single Sign-On (SSO)",
      "Dedicated account manager",
      "Audit logging",
      "SLA garanties"
    ],
    cta: "Neem Contact Op",
    highlighted: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Prijzen</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Transparante prijzen, geen verrassingen
          </h2>
          <p className="text-lg text-muted-foreground">
            Kies het plan dat past bij jouw organisatie. Upgrade of downgrade wanneer je wilt.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105"
                  : "bg-card text-card-foreground border-border hover:border-accent/50 hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Meest Gekozen
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-3 text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-accent" : "text-success"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/90" : ""}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "hero" : "default"}
                className="w-full"
                asChild
              >
                <Link to="/dashboard">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
