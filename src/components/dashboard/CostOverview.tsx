import { TrendingUp, TrendingDown } from "lucide-react";

interface CostCategory {
  name: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  color: string;
}

const categories: CostCategory[] = [
  { name: "IT Services", amount: 4200, percentage: 34, trend: "up", color: "bg-primary" },
  { name: "Telecom", amount: 2500, percentage: 20, trend: "down", color: "bg-accent" },
  { name: "Facilities", amount: 1800, percentage: 15, trend: "stable", color: "bg-success" },
  { name: "Energie", amount: 1400, percentage: 11, trend: "up", color: "bg-warning" },
  { name: "Overig", amount: 2550, percentage: 20, trend: "down", color: "bg-muted-foreground" },
];

const CostOverview = () => {
  const totalCost = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Kostenoverzicht per Categorie</h3>
        <p className="text-sm text-muted-foreground mt-1">Maandelijkse kosten</p>
      </div>

      <div className="p-4">
        {/* Total */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Totale maandkosten</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            €{totalCost.toLocaleString('nl-NL')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-3 rounded-full overflow-hidden flex mb-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`${cat.color} first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${cat.percentage}%` }}
            />
          ))}
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                <span className="text-sm text-foreground">{cat.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  €{cat.amount.toLocaleString('nl-NL')}
                </span>
                {cat.trend === "up" && (
                  <TrendingUp className="w-4 h-4 text-destructive" />
                )}
                {cat.trend === "down" && (
                  <TrendingDown className="w-4 h-4 text-success" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostOverview;
