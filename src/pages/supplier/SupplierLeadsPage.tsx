import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SupplierLeadsInbox from "@/components/supplier/SupplierLeadsInbox";
import { useSupplierLeads } from "@/hooks/useSupplierLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, CheckCircle2 } from "lucide-react";

const statusLabel: Record<string, string> = {
  open: "Open",
  claimed: "Geclaimd",
  in_progress: "Lopend",
  completed: "Afgerond",
  cancelled: "Geannuleerd",
};

const SupplierLeadsPage = () => {
  const { myLeads } = useSupplierLeads();

  return (
    <>
      <DashboardHeader title="Leads" subtitle="Inkomende leads uit de marketplace" />
      <div className="p-6">
        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="mine">Mijn Leads ({myLeads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="mt-6">
            <SupplierLeadsInbox />
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
                    {myLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-border"
                      >
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">
                              {lead.contract?.name ?? "Contract"}
                            </h3>
                            <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                              {lead.contract?.end_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(lead.contract.end_date).toLocaleDateString("nl-BE")}
                                </span>
                              )}
                              <span>
                                Geclaimd:{" "}
                                {lead.claimed_at
                                  ? new Date(lead.claimed_at).toLocaleDateString("nl-BE")
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge>{statusLabel[lead.status] ?? lead.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SupplierLeadsPage;
