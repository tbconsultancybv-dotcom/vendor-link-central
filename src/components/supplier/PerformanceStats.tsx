import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Users, CheckCircle } from "lucide-react";

const stats = [
  {
    label: "Totaal Leads",
    value: "156",
    change: "+12%",
    icon: Users,
    positive: true,
  },
  {
    label: "Conversieratio",
    value: "34%",
    change: "+5%",
    icon: TrendingUp,
    positive: true,
  },
  {
    label: "Gewonnen Deals",
    value: "53",
    change: "+8",
    icon: CheckCircle,
    positive: true,
  },
];

const ratings = [
  { label: "Communicatie", value: 4.9 },
  { label: "Service", value: 4.7 },
  { label: "Prijs/Kwaliteit", value: 4.6 },
  { label: "Algemeen", value: 4.8 },
];

const PerformanceStats = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-warning" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Rating */}
        <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${star <= 4 ? "fill-warning text-warning" : "text-warning/30"}`} 
              />
            ))}
          </div>
          <div className="text-2xl font-bold text-foreground">4.8</div>
          <p className="text-xs text-muted-foreground">Gebaseerd op 47 reviews</p>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-3">
          {ratings.map((rating) => (
            <div key={rating.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{rating.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-warning rounded-full"
                    style={{ width: `${(rating.value / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-8">{rating.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-3">Dit kwartaal</p>
          <div className="space-y-2">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{stat.value}</span>
                  <span className={`text-xs ${stat.positive ? "text-success" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceStats;
