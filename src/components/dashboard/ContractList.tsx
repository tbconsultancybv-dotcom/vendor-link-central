import { FileText, Calendar, Euro, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Contract {
  id: string;
  name: string;
  supplier: string;
  category: string;
  endDate: string;
  monthlyAmount: number;
  status: "active" | "expiring" | "expired";
  daysUntilExpiry: number;
}

const mockContracts: Contract[] = [
  {
    id: "1",
    name: "Kantoorprinters Onderhoud",
    supplier: "PrintTech B.V.",
    category: "Printing",
    endDate: "2024-06-15",
    monthlyAmount: 450,
    status: "expiring",
    daysUntilExpiry: 45
  },
  {
    id: "2",
    name: "Telefonie & Internet",
    supplier: "TelecomNL",
    category: "Telecom",
    endDate: "2025-03-01",
    monthlyAmount: 1250,
    status: "active",
    daysUntilExpiry: 365
  },
  {
    id: "3",
    name: "Koffiemachines Service",
    supplier: "CoffeePro",
    category: "Facilities",
    endDate: "2024-04-30",
    monthlyAmount: 180,
    status: "expiring",
    daysUntilExpiry: 12
  },
  {
    id: "4",
    name: "EV Laadpalen Beheer",
    supplier: "ChargePoint NL",
    category: "Energie",
    endDate: "2025-12-31",
    monthlyAmount: 890,
    status: "active",
    daysUntilExpiry: 580
  },
  {
    id: "5",
    name: "IT Support & Onderhoud",
    supplier: "TechSupport Plus",
    category: "IT Services",
    endDate: "2024-02-28",
    monthlyAmount: 2100,
    status: "expired",
    daysUntilExpiry: -15
  },
];

const getStatusBadge = (status: Contract["status"], daysUntilExpiry: number) => {
  switch (status) {
    case "expiring":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {daysUntilExpiry} dagen
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          Verlopen
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
          Actief
        </Badge>
      );
  }
};

const ContractList = () => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recente Contracten</h3>
        <a href="/dashboard/contracts" className="text-sm text-primary hover:underline">
          Bekijk alle
        </a>
      </div>

      <div className="divide-y divide-border">
        {mockContracts.map((contract) => (
          <div 
            key={contract.id}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  contract.status === "expiring" && "bg-warning/10",
                  contract.status === "expired" && "bg-destructive/10",
                  contract.status === "active" && "bg-primary/10"
                )}>
                  <FileText className={cn(
                    "w-5 h-5",
                    contract.status === "expiring" && "text-warning",
                    contract.status === "expired" && "text-destructive",
                    contract.status === "active" && "text-primary"
                  )} />
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">{contract.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground">{contract.supplier}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {contract.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Euro className="w-4 h-4" />
                    <span className="font-medium text-foreground">{contract.monthlyAmount.toLocaleString('nl-NL')}</span>
                    <span>/maand</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Einddatum: {new Date(contract.endDate).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>

                {getStatusBadge(contract.status, contract.daysUntilExpiry)}

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractList;
