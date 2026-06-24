import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Appt = {
  id: string;
  scheduled_date: string;
  meeting_type: string | null;
  location: string | null;
  meeting_link: string | null;
  status: string;
  notes: string | null;
};

const SupplierAppointmentsPage = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("supplier_appointments")
        .select("id,scheduled_date,meeting_type,location,meeting_link,status,notes")
        .eq("supplier_id", user.id)
        .order("scheduled_date", { ascending: true });
      setAppts((data as Appt[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <>
      <DashboardHeader title="Afspraken" subtitle="Geplande gesprekken met klanten" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Komende Afspraken</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : appts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Geen afspraken ingepland. Claim een lead om een afspraak voor te stellen.
              </p>
            ) : (
              <div className="space-y-3">
                {appts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        {a.meeting_type === "video" ? (
                          <Video className="w-5 h-5 text-accent" />
                        ) : (
                          <MapPin className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(a.scheduled_date).toLocaleDateString("nl-BE", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          <Clock className="w-3.5 h-3.5 ml-2" />
                          {new Date(a.scheduled_date).toLocaleTimeString("nl-BE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {a.location && <p className="text-sm">{a.location}</p>}
                        {a.notes && <p className="text-sm text-muted-foreground">{a.notes}</p>}
                      </div>
                    </div>
                    <Badge>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupplierAppointmentsPage;
