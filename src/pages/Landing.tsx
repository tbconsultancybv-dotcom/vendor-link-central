import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Mail, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">BivaroX</span>
          <div className="flex gap-3">
            <Link to="/auth"><Button variant="ghost">Inloggen</Button></Link>
            <Link to="/auth"><Button>Gratis starten</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Mis nooit meer een opzegtermijn.
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          BivaroX vertelt je precies wat je wanneer moet doen met je leverancierscontracten. Geen rommel, geen complexiteit. Gewoon actie.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Probeer gratis <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div>
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Altijd op tijd</h3>
            <p className="text-sm text-muted-foreground">Wij rekenen opzegtermijnen voor je uit en waarschuwen ruim op tijd.</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Eén actie per contract</h3>
            <p className="text-sm text-muted-foreground">Geen lijsten en filters. Alleen: "Wat moet ik nu doen?"</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Opzegmail in 1 klik</h3>
            <p className="text-sm text-muted-foreground">Vooraf ingevuld, klaar om te kopiëren of versturen.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} BivaroX
        </div>
      </footer>
    </div>
  );
};

export default Landing;
