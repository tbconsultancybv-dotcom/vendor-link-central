import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScanText, Info, Sparkles } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("ocr_enabled")
        .eq("user_id", user.id)
        .maybeSingle();
      setOcrEnabled(Boolean(data?.ocr_enabled));
      setLoading(false);
    })();
  }, [user]);

  const handleToggleOcr = async (checked: boolean) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ocr_enabled: checked })
      .eq("user_id", user.id);
    setSaving(false);

    if (error) {
      toast({
        title: "Opslaan mislukt",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setOcrEnabled(checked);
    toast({
      title: checked ? "OCR geactiveerd" : "OCR gedeactiveerd",
      description: checked
        ? "Nieuwe documenten worden automatisch geanalyseerd (extra kosten van toepassing)."
        : "Documenten worden niet automatisch geanalyseerd.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <DashboardHeader title="Instellingen" />
        <main className="p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Instellingen</h1>
            <p className="text-muted-foreground mt-1">
              Beheer voorkeuren en functies van uw account.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ScanText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      OCR contractextractie
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Laat AI automatisch leverancier, datums, bedragen en opzegtermijnen uit
                      geüploade PDF's en scans halen.
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Betaalde functie</AlertTitle>
                <AlertDescription>
                  Deze functie verbruikt AI-credits per geanalyseerd document. Kosten worden
                  apart afgerekend bovenop uw abonnement. Activeer alleen indien u bewust voor
                  het bijbetalen kiest.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="ocr-toggle" className="text-base">
                    Automatische OCR inschakelen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {ocrEnabled
                      ? "Actief — nieuwe uploads worden automatisch geanalyseerd."
                      : "Uitgeschakeld — er worden geen extra kosten gemaakt."}
                  </p>
                </div>
                <Switch
                  id="ocr-toggle"
                  checked={ocrEnabled}
                  onCheckedChange={handleToggleOcr}
                  disabled={loading || saving}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Tip: u kunt deze functie op elk moment weer uitschakelen. Reeds verwerkte
                documenten blijven beschikbaar.
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Settings;
