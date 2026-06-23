import { Target, TrendingUp, Star, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: Target,
    title: "Gekwalificeerde Leads",
    description: "Geen cold calling meer. Ontvang alleen aanvragen van bedrijven die actief op zoek zijn naar jouw diensten."
  },
  {
    icon: TrendingUp,
    title: "Transparante Statistieken",
    description: "Volg je performance met real-time dashboards. Zie conversies, feedbackscores en marktpositie."
  },
  {
    icon: Star,
    title: "Reputatieopbouw",
    description: "Bouw een sterke reputatie op met klantbeoordelingen. Onderscheid je van de concurrentie."
  },
  {
    icon: CreditCard,
    title: "Flexibel Creditsysteem",
    description: "Betaal alleen voor wat je gebruikt. Credits voor leads en afspraken, of kies een abonnement met inclusief volume."
  }
];

const SupplierSection = () => {
  return (
    <section id="suppliers" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">
              Voor Leveranciers
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
              Stop met prospecteren. Start met groeien.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              ContractHub verbindt je met bedrijven die actief op zoek zijn naar jouw oplossingen. 
              Geen koude acquisitie meer, maar warme leads die converteren.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/supplier">Word Leverancier</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/supplier">Bekijk Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 rounded-2xl blur-2xl" />
            <div className="relative bg-card rounded-2xl border border-border p-8 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6">Leverancier Dashboard Preview</h3>
              
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">23</div>
                    <div className="text-xs text-muted-foreground">Actieve Leads</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-success">4.8</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">€12K</div>
                    <div className="text-xs text-muted-foreground">Waarde</div>
                  </div>
                </div>

                {/* Recent Leads */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Recente Leads</h4>
                  <div className="space-y-3">
                    {[
                      { company: "TechComm BV", type: "IT Services", status: "Nieuw" },
                      { company: "Bouwgroep België", type: "Telecom", status: "In gesprek" },
                      { company: "Retail Plus", type: "Printing", status: "Offerte verzonden" }
                    ].map((lead, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                        <div>
                          <div className="font-medium text-foreground text-sm">{lead.company}</div>
                          <div className="text-xs text-muted-foreground">{lead.type}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lead.status === "Nieuw" 
                            ? "bg-accent/20 text-accent" 
                            : lead.status === "In gesprek"
                            ? "bg-primary/10 text-primary"
                            : "bg-success/20 text-success"
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credits */}
                <Link to="/supplier" className="flex items-center justify-between p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
                  <div>
                    <div className="font-semibold text-foreground">Beschikbare Credits</div>
                    <div className="text-sm text-muted-foreground">15 credits resterend</div>
                  </div>
                  <Button size="sm" variant="hero">Bekijk Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupplierSection;
