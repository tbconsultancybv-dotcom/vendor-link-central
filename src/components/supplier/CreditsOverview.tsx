import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const creditPackages = [
  { id: 1, credits: 10, price: "€99", popular: false },
  { id: 2, credits: 25, price: "€225", popular: true },
  { id: 3, credits: 50, price: "€400", popular: false },
];

const CreditsOverview = () => {
  const [credits, setCredits] = useState(47);
  const [showPackages, setShowPackages] = useState(false);
  const { toast } = useToast();

  const handleBuyCredits = (packageCredits: number, price: string) => {
    setCredits(prev => prev + packageCredits);
    setShowPackages(false);
    toast({
      title: "Credits toegevoegd!",
      description: `${packageCredits} credits zijn toegevoegd aan je account.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-success" />
          Credits Overzicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Credits */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Beschikbaar</span>
            <span className="text-2xl font-bold text-foreground">{credits}</span>
          </div>
          <Progress value={(credits / 100) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {credits > 20 ? "Je hebt voldoende credits" : "Overweeg credits aan te vullen"}
          </p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Deze maand</span>
            </div>
            <span className="text-lg font-semibold text-foreground">15</span>
            <span className="text-xs text-muted-foreground"> gebruikt</span>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Conversie</span>
            </div>
            <span className="text-lg font-semibold text-foreground">34%</span>
          </div>
        </div>

        {/* Buy Credits */}
        {!showPackages ? (
          <Button 
            className="w-full" 
            variant="hero"
            onClick={() => setShowPackages(true)}
          >
            Credits Aanvullen
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Kies een pakket:</p>
            {creditPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleBuyCredits(pkg.credits, pkg.price)}
                className={`w-full p-3 rounded-lg border text-left transition-all hover:border-accent ${
                  pkg.popular 
                    ? "border-accent bg-accent/5" 
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground">{pkg.credits} credits</span>
                    {pkg.popular && (
                      <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                        Populair
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-foreground">{pkg.price}</span>
                </div>
              </button>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => setShowPackages(false)}
            >
              Annuleren
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsOverview;
