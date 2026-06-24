import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SECTORS = [
  "Energie & Nutsvoorzieningen",
  "Telecom & IT",
  "Verzekeringen",
  "Financiële diensten",
  "Horeca",
  "Retail",
  "Bouw & Vastgoed",
  "Transport & Logistiek",
  "Industrie & Productie",
  "Gezondheidszorg",
  "Onderwijs",
  "Zakelijke dienstverlening",
  "Overheid & Non-profit",
  "Andere",
];

const PROVINCES = [
  "Antwerpen",
  "Limburg",
  "Oost-Vlaanderen",
  "Vlaams-Brabant",
  "West-Vlaanderen",
  "Henegouwen",
  "Luik",
  "Luxemburg",
  "Namen",
  "Waals-Brabant",
  "Brussels Hoofdstedelijk Gewest",
];

const CompanyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "",
    full_name: "",
    phone: "",
    sector: "",
    province: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("company_name,full_name,phone,sector,province")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          company_name: data.company_name ?? "",
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          sector: (data as any).sector ?? "",
          province: (data as any).province ?? "",
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
    toast({ title: "Bedrijfsprofiel opgeslagen" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <DashboardHeader
          title="Bedrijfsprofiel"
          subtitle="Deze gegevens worden gebruikt om relevante leveranciers te matchen"
        />
        <main className="p-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Bedrijfsgegevens</CardTitle>
                <CardDescription>
                  Sector en provincie helpen om uw contracten te koppelen aan de juiste leveranciers.
                </CardDescription>
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
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <Select
                      value={profile.sector}
                      onValueChange={(v) => setProfile({ ...profile, sector: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kies een sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Provincie</Label>
                    <Select
                      value={profile.province}
                      onValueChange={(v) => setProfile({ ...profile, province: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kies een provincie" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Opslaan
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        </main>
      </div>
    </div>
  );
};

export default CompanyProfile;
