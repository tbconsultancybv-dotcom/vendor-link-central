import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Tx = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  balance_after: number;
  created_at: string;
};

const packages = [
  { credits: 10, price: 99 },
  { credits: 25, price: 225, popular: true },
  { credits: 50, price: 400 },
];

const SupplierCreditsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from("profiles").select("credits").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("credit_transactions")
        .select("id,amount,type,description,balance_after,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setBalance(p?.credits ?? 0);
    setTxs((t as Tx[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const buyDemo = async (credits: number, price: number) => {
    if (!user) return;
    const newBalance = balance + credits;
    await supabase.from("profiles").update({ credits: newBalance }).eq("user_id", user.id);
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: credits,
      type: "purchase",
      description: `Aankoop pakket €${price}`,
      balance_after: newBalance,
    });
    toast({ title: "Credits toegevoegd", description: `+${credits} credits` });
    load();
  };

  return (
    <>
      <DashboardHeader title="Credits" subtitle="Beheer en koop credits om leads te claimen" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-success" />
              Huidig Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{balance}</div>
            <p className="text-sm text-muted-foreground mt-1">credits beschikbaar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Credits Aanvullen</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((p) => (
              <div
                key={p.credits}
                className={`p-4 rounded-lg border transition-all ${
                  p.popular ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold">{p.credits}</span>
                  {p.popular && <Badge className="bg-accent text-accent-foreground">Populair</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3">credits</p>
                <div className="text-lg font-semibold mb-3">€{p.price}</div>
                <Button className="w-full" onClick={() => buyDemo(p.credits, p.price)}>
                  Koop
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recente Transacties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : txs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nog geen transacties.
              </p>
            ) : (
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.amount > 0 ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowUp className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description ?? tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString("nl-BE")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.amount > 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">Saldo: {tx.balance_after}</p>
                    </div>
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

export default SupplierCreditsPage;
