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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {selected?.contract?.name ?? "Lead details"}
            </DialogTitle>
            <DialogDescription>
              Geclaimd op {fmtDate(selected?.claimed_at)} · {selected?.credits_cost} credits
            </DialogDescription>
          </DialogHeader>

          {selected?.contract && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Contactgegevens klant
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selected.contract.responsible_name && (
                    <div>
                      <p className="text-muted-foreground text-xs">Contactpersoon</p>
                      <p className="text-foreground">{selected.contract.responsible_name}</p>
                    </div>
                  )}
                  {selected.contract.contact_email && (
                    <div>
                      <p className="text-muted-foreground text-xs">E-mail</p>
                      <a
                        href={`mailto:${selected.contract.contact_email}`}
                        className="text-primary hover:underline"
                      >
                        {selected.contract.contact_email}
                      </a>
                    </div>
                  )}
                  {selected.contract.contact_phone && (
                    <div>
                      <p className="text-muted-foreground text-xs">Telefoon</p>
                      <a
                        href={`tel:${selected.contract.contact_phone}`}
                        className="text-primary hover:underline"
                      >
                        {selected.contract.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Contract
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selected.contract.supplier_name && (
                    <div>
                      <p className="text-muted-foreground text-xs">Huidige leverancier</p>
                      <p className="text-foreground">{selected.contract.supplier_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs">Looptijd</p>
                    <p className="text-foreground">
                      {fmtDate(selected.contract.start_date)} → {fmtDate(selected.contract.end_date)}
                    </p>
                  </div>
                  {(selected.contract.monthly_cost || selected.contract.yearly_cost) && (
                    <div>
                      <p className="text-muted-foreground text-xs">Kost</p>
                      <p className="text-foreground flex items-center gap-1">
                        <Euro className="w-3.5 h-3.5" />
                        {selected.contract.monthly_cost
                          ? `${Number(selected.contract.monthly_cost).toLocaleString("nl-BE")} / maand`
                          : `${Number(selected.contract.yearly_cost).toLocaleString("nl-BE")} / jaar`}
                      </p>
                    </div>
                  )}
                </div>
                {selected.contract.description && (
                  <div className="mt-3">
                    <p className="text-muted-foreground text-xs mb-1">Omschrijving</p>
                    <p className="text-sm text-foreground">{selected.contract.description}</p>
                  </div>
                )}
                {selected.contract.notes && (
                  <div className="mt-3">
                    <p className="text-muted-foreground text-xs mb-1">Notities klant</p>
                    <p className="text-sm text-foreground">{selected.contract.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {selected.contract.contact_email && (
                  <Button asChild>
                    <a href={`mailto:${selected.contract.contact_email}`}>
                      <Mail className="w-4 h-4 mr-1" /> Mail klant
                    </a>
                  </Button>
                )}
                {selected.contract.contact_phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${selected.contract.contact_phone}`}>
                      <Phone className="w-4 h-4 mr-1" /> Bel klant
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupplierLeadsPage;
