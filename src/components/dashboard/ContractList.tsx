import { Link } from "react-router-dom";
import { FileText, Calendar, Euro, AlertTriangle, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContracts, Contract } from "@/hooks/useContracts";

const getStatusBadge = (status: Contract["status"], endDate: string) => {
  const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  switch (status) {
    case "expiring":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {daysUntilExpiry}d
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
  const { contracts, isLoading } = useContracts();

  // Show first 5 contracts
  const displayContracts = contracts.slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recente Contracten</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          Contracten laden...
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recente Contracten</h3>
        </div>
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">Nog geen contracten toegevoegd</p>
          <Button asChild>
            <Link to="/dashboard/contracts">
              <Plus className="w-4 h-4 mr-2" />
              Eerste contract toevoegen
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recente Contracten</h3>
        <Link to="/dashboard/contracts" className="text-sm text-primary hover:underline">
          Bekijk alle
        </Link>
      </div>

      <div className="divide-y divide-border">
        {displayContracts.map((contract) => (
          <Link 
            key={contract.id}
            to="/dashboard/contracts"
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group block"
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
                    <span className="text-sm text-muted-foreground">{contract.supplier_name}</span>
                    {contract.category && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {contract.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Euro className="w-4 h-4" />
                    <span className="font-medium text-foreground">
                      {contract.monthly_cost.toLocaleString("nl-NL")}
                    </span>
                    <span>/maand</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Einddatum: {new Date(contract.end_date).toLocaleDateString("nl-NL")}</span>
                  </div>
                </div>

                {getStatusBadge(contract.status, contract.end_date)}

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ContractList;
