import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContract, useUpdateContract } from "@/hooks/useContracts";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowLeft, X, RefreshCw, MinusCircle, Calendar, Building2, Euro, Clock, Save } from "lucide-react";
import {
  daysUntilAction,
  formatDate,
  formatEuro,
  getActionDeadline,
  getUrgency,
  urgencyColor,
  urgencyLabel,
} from "@/lib/contractUtils";
import CancellationDialog from "@/components/contracts/CancellationDialog";
import { toast } from "sonner";

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: contract, isLoading } = useContract(id);
  const update = useUpdateContract();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [responsible, setResponsible] = useState("");
  const [openToOffers, setOpenToOffers] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Contract niet gevonden.</p>
        <Link to="/app"><Button variant="outline">Terug naar dashboard</Button></Link>
      </div>
    );
  }

  // Initialize local state lazily
  if (responsible === "" && contract.responsible_name) setResponsible(contract.responsible_name);
  if (openToOffers === "" && contract.open_to_offers) setOpenToOffers(contract.open_to_offers);

  const urgency = getUrgency(contract);
  const deadline = getActionDeadline(contract);
  const days = daysUntilAction(contract);
  const fromName = user?.user_metadata?.full_name || user?.email || "Het team";

  const setDecision = async (decision: "cancel" | "renegotiate" | "keep") => {
    await update.mutateAsync({
      id: contract.id,
      updates: { user_decision: decision, decision_at: new Date().toISOString() },
    });
    const labels = { cancel: "Opzeggen", renegotiate: "Heronderhandelen", keep: "Niets doen" };
    toast.success(`Beslissing bewaard: ${labels[decision]}`);
    if (decision === "cancel") setCancelOpen(true);
  };

  const saveResponsible = async () => {
    await update.mutateAsync({ id: contract.id, updates: { responsible_name: responsible } });
    toast.success("Verantwoordelijke opgeslagen");
  };

  const saveOffers = async (val: string) => {
    setOpenToOffers(val);
    await update.mutateAsync({ id: contract.id, updates: { open_to_offers: val } });
    toast.success("Voorkeur opgeslagen");
  };

  const renewalText = contract.silent_renewal
    ? `automatisch verlengd met ${contract.renewal_period_months ?? 12} maanden`
    : "niet automatisch verlengd";

  const headlineMessage = urgency === "expired"
    ? `Dit contract is op ${formatDate(contract.end_date)} verlopen.`
    : days < 0
    ? `De opzegtermijn is verstreken. Het contract wordt ${renewalText}.`
    : `Je moet dit contract opzeggen vóór ${formatDate(deadline)}, anders wordt het ${renewalText}.`;

  return (
    <div className="space-y-6">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Terug naar dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={urgencyColor(urgency)} variant="secondary">{urgencyLabel(urgency)}</Badge>
            {contract.user_decision && (
              <Badge variant="outline">
                Beslissing: {{
                  cancel: "Opzeggen",
                  renegotiate: "Heronderhandelen",
                  keep: "Niets doen",
                }[contract.user_decision] ?? contract.user_decision}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{contract.supplier_name}</h1>
          <p className="text-lg text-muted-foreground">{contract.name}</p>
        </div>
      </div>

      {/* Headline message */}
      <div className={`rounded-xl border p-6 ${
        urgency === "urgent" || urgency === "expired"
          ? "bg-destructive/5 border-destructive/30"
          : urgency === "soon"
          ? "bg-warning/5 border-warning/30"
          : "bg-success/5 border-success/30"
      }`}>
        <p className="text-lg font-medium leading-relaxed">{headlineMessage}</p>
      </div>

      {/* Action buttons */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Button onClick={() => setDecision("cancel")} variant="default" size="lg" className="gap-2">
          <X className="w-4 h-4" /> Contract opzeggen
        </Button>
        <Button onClick={() => setDecision("renegotiate")} variant="outline" size="lg" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Heronderhandelen
        </Button>
        <Button onClick={() => setDecision("keep")} variant="ghost" size="lg" className="gap-2">
          <MinusCircle className="w-4 h-4" /> Niets doen
        </Button>
      </div>

      {/* Facts */}
      <div className="bg-card border border-border rounded-xl p-6 grid sm:grid-cols-2 gap-4">
        <Fact icon={Building2} label="Leverancier" value={contract.supplier_name} />
        <Fact icon={Calendar} label="Einddatum" value={formatDate(contract.end_date)} />
        <Fact icon={Clock} label="Opzegtermijn" value={`${contract.termination_period_days ?? 0} dagen`} />
        <Fact icon={Calendar} label="Actie vóór" value={formatDate(deadline)} />
        <Fact icon={Euro} label="Per jaar" value={formatEuro(contract.yearly_cost)} />
        <Fact icon={Euro} label="Per maand" value={formatEuro(contract.monthly_cost)} />
      </div>

      {/* Responsible */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Label htmlFor="resp" className="text-base">Verantwoordelijke</Label>
        <p className="text-sm text-muted-foreground mb-3">Wie volgt dit contract op binnen jouw bedrijf?</p>
        <div className="flex gap-2">
          <Input
            id="resp"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            placeholder="Bv. Sofie Janssens"
          />
          <Button onClick={saveResponsible} variant="outline" className="gap-2 shrink-0">
            <Save className="w-4 h-4" /> Opslaan
          </Button>
        </div>
      </div>

      {/* Open to offers */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Label className="text-base">Sta je open voor betere aanbiedingen?</Label>
        <p className="text-sm text-muted-foreground mb-4">Help ons je later betere voorstellen te tonen.</p>
        <RadioGroup value={openToOffers} onValueChange={saveOffers} className="space-y-2">
          {[
            { v: "yes", l: "Ja, contacteer mij" },
            { v: "later", l: "Ja, maar later" },
            { v: "no", l: "Nee" },
          ].map((opt) => (
            <div key={opt.v} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.v} id={`offers-${opt.v}`} />
              <Label htmlFor={`offers-${opt.v}`} className="font-normal cursor-pointer">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <CancellationDialog
        contract={contract}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        fromName={fromName}
      />
    </div>
  );
};

const Fact = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

export default ContractDetail;
