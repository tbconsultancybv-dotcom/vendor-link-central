import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  FileText,
  Calendar,
  CreditCard,
  Inbox,
  Loader2,
  Euro,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupplierLeads, SupplierLead } from "@/hooks/useSupplierLeads";
import { Link } from "react-router-dom";

interface Props {
  limit?: number;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" }) : "—";

const daysUntil = (d: string | null) => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

const SupplierLeadsInbox = ({ limit }: Props) => {
  const { openLeads, loading, isSupplier, claimLead } = useSupplierLeads();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<string | null>(null);

  // Group open leads by contract so a supplier sees each unique contract once,
  // while keeping the individual marketplace lead ids needed for claiming.
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
      description: `${availableLead.credits_cost} credits afgeschreven. Contactgegevens nu zichtbaar.`,
    });
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
              const visibility = c?.data_visibility_level ?? 1;
              return (
                <div
                  key={lead.contract?.id ?? lead.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-foreground truncate">
                          {c?.name ?? "Contract"}
                        </h3>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="w-3 h-3" />
                          {openSlots} van {totalSlots} leveranciers
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {visibility >= 2 ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          Inzage niveau {visibility}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {c?.supplier_name && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            Huidige leverancier: {c.supplier_name}
                          </span>
                        )}
                        {c?.end_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Einddatum {formatDate(c.end_date)}
                            {days !== null && days >= 0 && (
                              <span className="text-warning">({days}d)</span>
                            )}
                          </span>
                        )}
                        {(c?.monthly_cost || c?.yearly_cost) && (
                          <span className="flex items-center gap-1">
                            <Euro className="w-3.5 h-3.5" />
                            {c.monthly_cost
                              ? `€${Number(c.monthly_cost).toLocaleString("nl-BE")}/m`
                              : `€${Number(c.yearly_cost).toLocaleString("nl-BE")}/j`}
                          </span>
                        )}
                      </div>
                      {c?.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleClaim(lead.contract?.id ?? lead.id)}
                      disabled={claiming === (lead.contract?.id ?? lead.id)}
                    >
                      {claiming === (lead.contract?.id ?? lead.id) ? (
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
