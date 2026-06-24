import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, Star, CreditCard, AlertCircle, Building2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import SupplierLeadsInbox from "@/components/supplier/SupplierLeadsInbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSupplierLeads } from "@/hooks/useSupplierLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SupplierHome = () => {
  const { user } = useAuth();
  const { openLeads, myLeads } = useSupplierLeads();
  const [credits, setCredits] = useState<number>(0);
  const [appointments, setAppointments] = useState<number>(0);
  const [isSupplier, setIsSupplier] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from("profiles").select("credits").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("supplier_appointments")
          .select("*", { count: "exact", head: true })
          .eq("supplier_id", user.id)
          .gte("scheduled_date", new Date().toISOString()),
      ]);
      setCredits(profile?.credits ?? 0);
      setAppointments(count ?? 0);
    })();
  }, [user, myLeads.length]);

  return (
    <>
      <DashboardHeader
        title="Leverancier Dashboard"
        subtitle="Welkom terug! Hier is je lead- en afspraakenoverzicht."
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Open Leads"
            value={openLeads.length}
            change="Live uit marketplace"
            changeType="positive"
            icon={Inbox}
            iconColor="text-primary"
          />
          <StatsCard
            title="Mijn Leads"
            value={myLeads.length}
            change={`${myLeads.filter((l) => l.status === "claimed").length} actief`}
            changeType="neutral"
            icon={Users}
            iconColor="text-accent"
          />
          <StatsCard
            title="Geplande Afspraken"
            value={appointments}
            change="Komende periode"
            changeType="neutral"
            icon={Calendar}
            iconColor="text-warning"
          />
          <StatsCard
            title="Credits"
            value={credits}
            change="Beschikbaar saldo"
            changeType="positive"
            icon={CreditCard}
            iconColor="text-success"
          />
        </div>

        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Hoe komen leads bij u binnen?</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Wanneer een klant een contract op de marketplace plaatst, verschijnt het
                automatisch in uw <b>Leads-inbox</b>. U ziet de contractcategorie, looptijd
                en het aantal benodigde credits. Door te claimen krijgt u toegang tot de
                contactgegevens en kunt u een afspraak voorstellen.
              </p>
            </div>
          </CardHeader>
        </Card>

        <SupplierLeadsInbox limit={5} />
      </div>
    </>
  );
};

export default SupplierHome;
