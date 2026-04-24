import { Link } from "react-router-dom";
import { useContracts } from "@/hooks/useContracts";
import ContractCard from "@/components/contracts/ContractCard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { daysUntilAction, formatEuro, getUrgency } from "@/lib/contractUtils";
import { addMonths, isBefore } from "date-fns";

const Dashboard = () => {
  const { data: contracts = [], isLoading } = useContracts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Nog geen contracten</h2>
        <p className="text-muted-foreground mb-6">Voeg je eerste contract toe om te beginnen.</p>
        <Link to="/app/upload">
          <Button size="lg" className="gap-2"><Plus className="w-4 h-4" /> Contract toevoegen</Button>
        </Link>
      </div>
    );
  }

  // Buckets
  const urgent = contracts.filter((c) => getUrgency(c) === "urgent" || getUrgency(c) === "expired");
  const soon = contracts.filter((c) => getUrgency(c) === "soon");
  const later = contracts.filter((c) => getUrgency(c) === "later");

  // Top stats
  const threeMonthsFromNow = addMonths(new Date(), 3);
  const renewingSoon = contracts.filter((c) =>
    isBefore(new Date(c.end_date), threeMonthsFromNow)
  );
  const renewingValue = renewingSoon.reduce((sum, c) => sum + (Number(c.yearly_cost) || 0), 0);
  const actionsThisMonth = contracts.filter((c) => {
    const d = daysUntilAction(c);
    return d >= 0 && d <= 30;
  }).length;

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Wat moet er deze maand gebeuren?</h1>
        <p className="text-muted-foreground">Een overzicht van je contracten — gerangschikt op urgentie.</p>
      </div>

      {/* Top stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4" /> Verlengen binnen 3 maanden
          </div>
          <div className="text-3xl font-bold">{formatEuro(renewingValue)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {renewingSoon.length} {renewingSoon.length === 1 ? "contract" : "contracten"}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <AlertCircle className="w-4 h-4" /> Acties nodig deze maand
          </div>
          <div className="text-3xl font-bold">{actionsThisMonth}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {actionsThisMonth === 0 ? "Alles onder controle" : "Bekijk hieronder"}
          </div>
        </div>
      </div>

      {/* Sections */}
      <Section
        title="🔥 Urgent — actie nodig binnen 30 dagen"
        contracts={urgent}
        emptyText="Geen urgente acties. Goed bezig."
      />
      <Section
        title="⏳ Binnenkort — 30–90 dagen"
        contracts={soon}
        emptyText="Niets binnenkort."
      />
      <Section
        title="✅ Later — meer dan 90 dagen"
        contracts={later}
        emptyText="Geen contracten op lange termijn."
      />
    </div>
  );
};

const Section = ({
  title,
  contracts,
  emptyText,
}: {
  title: string;
  contracts: any[];
  emptyText: string;
}) => (
  <section>
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {contracts.length === 0 ? (
      <div className="text-sm text-muted-foreground py-4 px-5 bg-muted/30 rounded-lg flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> {emptyText}
      </div>
    ) : (
      <div className="space-y-3">
        {contracts.map((c) => (
          <ContractCard key={c.id} contract={c} />
        ))}
      </div>
    )}
  </section>
);

export default Dashboard;
