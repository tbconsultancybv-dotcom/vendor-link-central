import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SupplierLeadsInbox from "@/components/supplier/SupplierLeadsInbox";
import { useSupplierLeads, SupplierLead } from "@/hooks/useSupplierLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  User,
  Euro,
  FileText,
  Eye,
  MapPin,
  Cpu,
  Lock,
  Sparkles,
  Crown,
  FileLock2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type LeadDocument = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string;
};

const statusLabel: Record<string, string> = {
  open: "Open",
  claimed: "Geclaimd",
  in_progress: "Lopend",
  completed: "Afgerond",
  cancelled: "Geannuleerd",
};

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" }) : "—";

const SupplierLeadsPage = () => {
  const supplierLeads = useSupplierLeads();
  const { myLeads } = supplierLeads;
  const [selected, setSelected] = useState<SupplierLead | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [leadDocs, setLeadDocs] = useState<LeadDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!selected) {
      setLeadDocs([]);
      return;
    }
    const tier = (selected.contract?.data_visibility_level ?? 1) as number;
    if (tier < 3) {
      setLeadDocs([]);
      return;
    }
    let cancelled = false;
    setDocsLoading(true);
    supabase
      .rpc("get_lead_documents", { _lead_id: selected.id })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast({
            title: "Documenten niet beschikbaar",
            description: error.message,
            variant: "destructive",
          });
          setLeadDocs([]);
        } else {
          setLeadDocs((data as LeadDocument[]) ?? []);
        }
        setDocsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, toast]);

  const openDocument = async (doc: LeadDocument) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60 * 10);
    if (error || !data?.signedUrl) {
      toast({
        title: "Kon document niet openen",
        description: error?.message ?? "Onbekende fout",
        variant: "destructive",
      });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <DashboardHeader title="Leads" subtitle="Inkomende leads uit de marketplace" />
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="mine">Mijn Leads ({myLeads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <SupplierLeadsInbox
              leadsController={supplierLeads}
              onClaimed={() => setActiveTab("mine")}
            />
          </TabsContent>

          <TabsContent value="mine" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Geclaimde Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Je hebt nog geen leads geclaimd.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myLeads.map((lead) => {
                      const c = lead.contract;
                      return (
                        <div
                          key={lead.id}
                          className="flex items-start justify-between p-4 rounded-lg border border-border gap-4"
                        >
                          <div className="flex gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-foreground">
                                {c?.name ?? "Contract"}
                              </h3>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                {c?.contact_email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {c.contact_email}
                                  </span>
                                )}
                                {c?.contact_phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    {c.contact_phone}
                                  </span>
                                )}
                                {c?.end_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Vervalt {fmtDate(c.end_date)}
                                  </span>
                                )}
                                <span>Geclaimd: {fmtDate(lead.claimed_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge>{statusLabel[lead.status] ?? lead.status}</Badge>
                            <Button size="sm" variant="outline" onClick={() => setSelected(lead)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Bekijk
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected?.contract && (() => {
            const c = selected.contract;
            const tier = (c.data_visibility_level ?? 1) as 1 | 2 | 3;
            const tierMeta = {
              1: { label: "Basis", icon: Lock, className: "bg-muted text-muted-foreground" },
              2: { label: "Premium", icon: Sparkles, className: "bg-primary/10 text-primary" },
              3: { label: "Elite", icon: Crown, className: "bg-accent text-accent-foreground" },
            }[tier];
            const TierIcon = tierMeta.icon;
            const showContractDetails = tier >= 2;
            const showDocuments = tier >= 3;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 flex-wrap">
                    <Building2 className="w-5 h-5 text-primary" />
                    {c.customer?.company_name || c.name || "Lead details"}
                    <Badge className={`gap-1 ${tierMeta.className}`}>
                      <TierIcon className="w-3 h-3" />
                      {tierMeta.label}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Geclaimd op {fmtDate(selected.claimed_at)} · {selected.credits_cost} credits
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  {/* Basis info — always visible after claim */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Klantgegevens
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {c.customer?.company_name && (
                        <div>
                          <p className="text-muted-foreground text-xs">Bedrijfsnaam</p>
                          <p className="text-foreground">{c.customer.company_name}</p>
                        </div>
                      )}
                      {(c.responsible_name || c.customer?.full_name) && (
                        <div>
                          <p className="text-muted-foreground text-xs">Contactpersoon</p>
                          <p className="text-foreground">
                            {c.responsible_name || c.customer?.full_name}
                          </p>
                        </div>
                      )}
                      {(c.contact_phone || c.customer?.phone) && (
                        <div>
                          <p className="text-muted-foreground text-xs">Telefoon</p>
                          <a
                            href={`tel:${c.contact_phone || c.customer?.phone}`}
                            className="text-primary hover:underline"
                          >
                            {c.contact_phone || c.customer?.phone}
                          </a>
                        </div>
                      )}
                      {(c.contact_email || c.customer?.email) && (
                        <div>
                          <p className="text-muted-foreground text-xs">E-mail</p>
                          <a
                            href={`mailto:${c.contact_email || c.customer?.email}`}
                            className="text-primary hover:underline"
                          >
                            {c.contact_email || c.customer?.email}
                          </a>
                        </div>
                      )}
                      {c.customer?.province && (
                        <div>
                          <p className="text-muted-foreground text-xs">Provincie</p>
                          <p className="text-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {c.customer.province}
                          </p>
                        </div>
                      )}
                      {c.device_count !== null && c.device_count !== undefined && (
                        <div>
                          <p className="text-muted-foreground text-xs">Aantal toestellen</p>
                          <p className="text-foreground flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5" />
                            {c.device_count}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Premium & Elite — full contract details */}
                  {showContractDetails ? (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Contractdetails
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {c.supplier_name && (
                            <div>
                              <p className="text-muted-foreground text-xs">Huidige leverancier</p>
                              <p className="text-foreground">{c.supplier_name}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground text-xs">Looptijd</p>
                            <p className="text-foreground">
                              {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                            </p>
                          </div>
                          {(c.monthly_cost || c.yearly_cost) && (
                            <div>
                              <p className="text-muted-foreground text-xs">Kost</p>
                              <p className="text-foreground flex items-center gap-1">
                                <Euro className="w-3.5 h-3.5" />
                                {c.monthly_cost
                                  ? `${Number(c.monthly_cost).toLocaleString("nl-BE")} / maand`
                                  : `${Number(c.yearly_cost).toLocaleString("nl-BE")} / jaar`}
                              </p>
                            </div>
                          )}
                        </div>
                        {c.description && (
                          <div className="mt-3">
                            <p className="text-muted-foreground text-xs mb-1">Omschrijving</p>
                            <p className="text-sm text-foreground">{c.description}</p>
                          </div>
                        )}
                        {c.notes && (
                          <div className="mt-3">
                            <p className="text-muted-foreground text-xs mb-1">Notities klant</p>
                            <p className="text-sm text-foreground">{c.notes}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground flex items-start gap-2">
                      <Lock className="w-4 h-4 mt-0.5" />
                      <span>
                        Volledige contractgegevens (looptijd, kosten, beschrijving) zijn enkel
                        beschikbaar bij een <strong>Premium</strong> of <strong>Elite</strong> lead.
                      </span>
                    </div>
                  )}

                  {/* Elite — documents */}
                  {showDocuments ? (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <FileLock2 className="w-4 h-4" /> Documenten
                        </h4>
                        {docsLoading ? (
                          <p className="text-sm text-muted-foreground">Documenten laden…</p>
                        ) : leadDocs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Nog geen documenten vrijgegeven voor deze lead.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {leadDocs.map((doc) => (
                              <li
                                key={doc.id}
                                className="flex items-center justify-between gap-3 rounded-md border border-border p-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 text-primary shrink-0" />
                                  <span className="text-sm text-foreground truncate">
                                    {doc.file_name}
                                  </span>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => openDocument(doc)}>
                                  <Eye className="w-4 h-4 mr-1" /> Open
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground flex items-start gap-2">
                      <FileLock2 className="w-4 h-4 mt-0.5" />
                      <span>
                        PDF contracten en facturen zijn enkel beschikbaar bij een{" "}
                        <strong>Elite</strong> lead.
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {(c.contact_email || c.customer?.email) && (
                      <Button asChild>
                        <a href={`mailto:${c.contact_email || c.customer?.email}`}>
                          <Mail className="w-4 h-4 mr-1" /> Mail klant
                        </a>
                      </Button>
                    )}
                    {(c.contact_phone || c.customer?.phone) && (
                      <Button variant="outline" asChild>
                        <a href={`tel:${c.contact_phone || c.customer?.phone}`}>
                          <Phone className="w-4 h-4 mr-1" /> Bel klant
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupplierLeadsPage;
