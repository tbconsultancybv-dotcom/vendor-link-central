import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  contractName: string;
  supplier: string;
  daysLeft: number;
  action: "renew" | "cancel" | "review";
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    contractName: "Koffiemachines Service",
    supplier: "CoffeePro",
    daysLeft: 12,
    action: "review"
  },
  {
    id: "2",
    contractName: "Kantoorprinters Onderhoud",
    supplier: "PrintTech B.V.",
    daysLeft: 45,
    action: "renew"
  },
  {
    id: "3",
    contractName: "Schoonmaakdiensten",
    supplier: "CleanMax",
    daysLeft: 60,
    action: "review"
  }
];

const getAlertColor = (daysLeft: number) => {
  if (daysLeft <= 14) return "border-destructive bg-destructive/5";
  if (daysLeft <= 30) return "border-warning bg-warning/5";
  return "border-accent bg-accent/5";
};

const getIconColor = (daysLeft: number) => {
  if (daysLeft <= 14) return "text-destructive";
  if (daysLeft <= 30) return "text-warning";
  return "text-accent";
};

const UpcomingAlerts = () => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <h3 className="font-semibold text-foreground">Aankomende Deadlines</h3>
      </div>

      <div className="p-4 space-y-3">
        {mockAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.daysLeft)}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-foreground">{alert.contractName}</h4>
                <p className="text-sm text-muted-foreground">{alert.supplier}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getIconColor(alert.daysLeft)}`}>
                <Calendar className="w-4 h-4" />
                <span>{alert.daysLeft} dagen</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="default">
                Actie ondernemen
                <ArrowRight className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost">
                Later
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <a href="/dashboard/notifications" className="text-sm text-primary hover:underline flex items-center gap-1">
          Alle meldingen bekijken
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default UpcomingAlerts;
