import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SupplierProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "",
    full_name: "",
    phone: "",
    is_supplier: false,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("company_name,full_name,phone,is_supplier")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          company_name: data.company_name ?? "",
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          is_supplier: Boolean(data.is_supplier),
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Opslaan mislukt", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profiel opgeslagen" });
  };

  return (
    <>
      <DashboardHeader title="Bedrijfsprofiel" subtitle="Beheer uw leveranciersinformatie" />
      <div className="p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Bedrijfsgegevens</CardTitle>
                <CardDescription>Deze info verschijnt bij klanten na claimen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label className="text-base">Leveranciersmodus actief</Label>
                    <p className="text-sm text-muted-foreground">
                      Schakel in om leads uit de marketplace te zien en claimen.
                    </p>
                  </div>
                  <Switch
                    checked={profile.is_supplier}
                    onCheckedChange={(v) => setProfile({ ...profile, is_supplier: v })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bedrijfsnaam</Label>
                    <Input
                      value={profile.company_name}
                      onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contactpersoon</Label>
                    <Input
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefoon</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Opslaan
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupplierProfilePage;
