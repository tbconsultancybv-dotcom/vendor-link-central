import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, User } from "lucide-react";
import {
  Contract,
  daysUntilAction,
  formatEuro,
  getUrgency,
  shortStatusText,
  urgencyColor,
  urgencyLabel,
} from "@/lib/contractUtils";

interface Props {
  contract: Contract;
}

const ContractCard = ({ contract }: Props) => {
  const urgency = getUrgency(contract);
  const days = daysUntilAction(contract);

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={urgencyColor(urgency)} variant="secondary">
              {urgencyLabel(urgency)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {days >= 0 ? `nog ${days} dagen` : `${Math.abs(days)} dagen geleden`}
            </span>
          </div>
          <h3 className="font-semibold text-foreground truncate">{contract.supplier_name}</h3>
          <p className="text-sm text-muted-foreground truncate">{contract.name}</p>
          <p className="text-sm font-medium text-foreground mt-2">{shortStatusText(contract)}</p>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>{formatEuro(contract.yearly_cost)}/jaar</span>
            {contract.responsible_name && (
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" /> {contract.responsible_name}
              </span>
            )}
          </div>
        </div>

        <Link to={`/app/contract/${contract.id}`}>
          <Button variant="outline" size="sm" className="gap-1 shrink-0">
            Bekijk <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ContractCard;
