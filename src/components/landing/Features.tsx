import { 
  FileText, 
  Bell, 
  BarChart3, 
  Users, 
  Upload, 
  Calendar,
  Shield,
  Zap
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Centrale Contractbibliotheek",
    description: "Alle contracten overzichtelijk georganiseerd per leverancier, afdeling en categorie. Nooit meer zoeken in mappen of mailboxen."
  },
  {
    icon: Bell,
    title: "Slimme Notificaties",
    description: "Automatische herinneringen bij naderende einddatums. 6 maanden, 3 maanden, 1 maand en 1 week vooraf."
  },
  {
    icon: BarChart3,
    title: "Kosteninzicht",
    description: "Real-time overzicht van alle kosten per contract, leverancier, afdeling of categorie. Spot trends en bespaarmogelijkheden."
  },
  {
    icon: Upload,
    title: "Automatische Documentverwerking",
    description: "Upload PDF's en facturen. Onze AI herkent automatisch leverancier, bedragen en koppelt aan het juiste contract."
  },
  {
    icon: Users,
    title: "Team & Rollen",
    description: "Geef medewerkers toegang op maat. Admins, financieel, viewers - iedereen ziet wat relevant is."
  },
  {
    icon: Calendar,
    title: "Leveranciersworkflow",
    description: "Contract aan vervanging toe? Ontvang offertes van gekwalificeerde leveranciers via ons platform."
  },
  {
    icon: Shield,
    title: "GDPR & Compliance",
    description: "Volledig voldoet aan Europese privacywetgeving. Veilige opslag, audit-trail en data-export."
  },
  {
    icon: Zap,
    title: "Snelle Onboarding",
    description: "Nieuwe medewerker? Volledige contracthistorie en context direct beschikbaar. Geen kennisoverdracht nodig."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Alles wat je nodig hebt voor contractbeheer
          </h2>
          <p className="text-lg text-muted-foreground">
            Van overzicht tot actie. ContractHub biedt de tools om grip te krijgen op al je leverancierscontracten.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-card rounded-xl border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
