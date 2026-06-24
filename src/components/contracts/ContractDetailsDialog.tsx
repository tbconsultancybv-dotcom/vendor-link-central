import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Contract } from "@/hooks/useContracts";
import ContractDocuments from "./ContractDocuments";
import {
  Calendar,
  Euro,
  Mail,
  Phone,
  Building2,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface ContractDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}

const StatusBadge = ({ status }: { status: Contract["status"] }) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
          <CheckCircle className="w-3 h-3 mr-1" /> Actief
        </Badge>
      );
    case "expiring":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
          <AlertTriangle className="w-3 h-3 mr-1" /> Verloopt binnenkort
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          <Clock className="w-3 h-3 mr-1" /> Verlopen
        </Badge>
      );
    case "draft":
      return <Badge variant="outline">Concept</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground break-words">{value || "—"}</div>
    </div>
  </div>
);

const fmtDate = (d: string) => new Date(d).toLocaleDateString("nl-BE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const fmtEuro = (n: number) =>
  `€${n.toLocaleString("nl-BE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ContractDetailsDialog = ({ open, onOpenChange, contract }: ContractDetailsDialogProps) => {
  if (!contract) return null;

  const daysLeft = Math.ceil(
    (new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="text-xl">{contract.name}</DialogTitle>
              <DialogDescription>
                {contract.supplier_name}
                {contract.category && ` · ${contract.category.name}`}
              </DialogDescription>
            </div>
            <StatusBadge status={contract.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {contract.description && (
            <p className="text-sm text-muted-foreground">{contract.description}</p>
          )}

          {/* Looptijd & kosten */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Looptijd & kosten</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Startdatum" value={fmtDate(contract.start_date)} />
              <InfoRow
                icon={Calendar}
                label="Einddatum"
                value={
                  <span>
                    {fmtDate(contract.end_date)}
                    {daysLeft >= 0 ? (
                      <span className="text-muted-foreground font-normal"> ({daysLeft} dagen)</span>
                    ) : (
                      <span className="text-destructive font-normal"> ({Math.abs(daysLeft)} dagen verlopen)</span>
                    )}
                  </span>
                }
              />
              <InfoRow
                icon={Clock}
                label="Opzegtermijn"
                value={`${contract.termination_period_days} dagen`}
              />
              <InfoRow
                icon={RefreshCw}
                label="Verlenging"
                value={
                  contract.silent_renewal
                    ? `Stilzwijgend · ${contract.renewal_period_months} maanden`
                    : "Niet automatisch"
                }
              />
              <InfoRow icon={Euro} label="Maandkosten" value={fmtEuro(contract.monthly_cost)} />
              <InfoRow icon={Euro} label="Jaarkosten" value={fmtEuro(contract.yearly_cost)} />
              {contract.variable_costs && (
                <InfoRow icon={Euro} label="Variabele kosten" value={contract.variable_costs} />
              )}
            </div>
          </div>

          {(contract.division || contract.department || contract.category) && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground mb-3">Organisatie</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contract.category && (
                    <InfoRow icon={Tag} label="Categorie" value={contract.category.name} />
                  )}
                  {contract.division && (
                    <InfoRow icon={Building2} label="Divisie / vestiging" value={contract.division} />
                  )}
                  {contract.department && (
                    <InfoRow icon={Building2} label="Afdeling" value={contract.department} />
                  )}
                </div>
              </div>
            </>
          )}

          {(contract.contact_email || contract.contact_phone) && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground mb-3">Contact leverancier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contract.contact_email && (
                    <InfoRow
                      icon={Mail}
                      label="E-mail"
                      value={
                        <a
                          href={`mailto:${contract.contact_email}`}
                          className="text-primary hover:underline"
                        >
                          {contract.contact_email}
                        </a>
                      }
                    />
                  )}
                  {contract.contact_phone && (
                    <InfoRow icon={Phone} label="Telefoon" value={contract.contact_phone} />
                  )}
                </div>
              </div>
            </>
          )}

          {contract.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground mb-2">Notities</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contract.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          <ContractDocuments contractId={contract.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractDetailsDialog;
