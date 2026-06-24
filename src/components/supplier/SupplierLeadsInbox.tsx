import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CreditCard,
  Inbox,
  Loader2,
  Users,
  AlertCircle,
  MapPin,
  Tag,
  Lock,
  Sparkles,
  Crown,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupplierLeads, SupplierLead } from "@/hooks/useSupplierLeads";
import { Link } from "react-router-dom";

interface Props {
  limit?: number;
  leadsController?: ReturnType<typeof useSupplierLeads>;
  onClaimed?: () => void;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" }) : "—";

const daysUntil = (d: string | null) => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const tierConfig: Record<number, { label: string; icon: typeof Lock; className: string }> = {
  1: { label: "Basis", icon: Lock, className: "bg-muted text-muted-foreground" },
  2: { label: "Premium", icon: Sparkles, className: "bg-primary/10 text-primary" },
  3: { label: "Elite", icon: Crown, className: "bg-accent text-accent-foreground" },
};

const SupplierLeadsInbox = ({ limit, leadsController, onClaimed }: Props) => {
  const fallbackController = useSupplierLeads();
  const { openLeads, loading, isSupplier, claimLead } = leadsController ?? fallbackController;
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<string | null>(null);

  // Group open leads by contract so each contract appears once.
  const groupedLeads = openLeads.reduce((acc, lead) => {
    const contractId = lead.contract?.id ?? lead.id;
    if (!acc[contractId]) {
      acc[contractId] = { leads: [], contract: lead.contract };
    }
    acc[contractId].leads.push(lead);
    return acc;
  }, {} as Record<string, { leads: SupplierLead[]; contract: SupplierLead["contract"] }>);

  const shown = Object.values(groupedLeads).slice(0, limit ?? undefined);
  const totalOpenCount = Object.values(groupedLeads).length;

  const handleClaim = async (contractId: string) => {
    const group = groupedLeads[contractId];
    if (!group) return;
    const availableLead = group.leads.find((l) => l.status === "open");
    if (!availableLead) return;
    setClaiming(contractId);
    const { error } = await claimLead(availableLead.id, availableLead.credits_cost);
    setClaiming(null);
    if (error) {
      toast({
        title: "Claimen mislukt",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Lead geclaimd!",
      description: `${availableLead.credits_cost} credits afgeschreven. Gegevens nu zichtbaar.`,
    });
    onClaimed?.();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          Nieuwe Leads
          {totalOpenCount > 0 && (
            <Badge className="bg-accent text-accent-foreground">{totalOpenCount}</Badge>
          )}
        </CardTitle>
        {limit && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/supplier/leads">Alle Leads</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !isSupplier ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">Leveranciersmodus staat uit</p>
            <p className="text-sm mt-1 mb-4">
              Zet deze aan in je bedrijfsprofiel om leads te kunnen claimen.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/supplier/profile">Bedrijfsprofiel openen</Link>
            </Button>
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">Nog geen open leads</p>
            <p className="text-sm mt-1">
              Zodra een klant een contract publiceert in de marketplace, verschijnt het hier.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shown.map((group) => {
              const c = group.contract;
              const lead = group.leads[0];
              const totalSlots = c?.max_suppliers ?? group.leads.length;
              const openSlots = group.leads.filter((l) => l.status === "open").length;
              const days = daysUntil(c?.end_date ?? null);
              const tier = tierConfig[(c?.data_visibility_level as 1 | 2 | 3) ?? 1];
              const TierIcon = tier.icon;
              const province = c?.customer?.province ?? "Onbekend";
              const categoryName = c?.category?.name ?? "Algemeen";

              return (
                <div
                  key={c?.id ?? lead.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-medium text-foreground">
                          Lead · {categoryName}
                        </h3>
                        <Badge className={`gap-1 ${tier.className}`}>
                          <TierIcon className="w-3 h-3" />
                          {tier.label}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="w-3 h-3" />
                          {openSlots} van {totalSlots} plaatsen
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          Provincie: <span className="text-foreground font-medium">{province}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {categoryName}
                        </span>
                        {c?.end_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Vervalt {formatDate(c.end_date)}
                            {days !== null && days >= 0 && (
                              <span className="text-warning">({days}d)</span>
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Klantgegevens worden vrijgegeven na het claimen van de lead.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleClaim(c?.id ?? lead.id)}
                      disabled={claiming === (c?.id ?? lead.id)}
                    >
                      {claiming === (c?.id ?? lead.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      Claim ({lead.credits_cost} credits)
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString("nl-BE")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierLeadsInbox;
