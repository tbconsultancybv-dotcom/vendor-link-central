import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Contract } from "@/hooks/useContracts";
import { Store, Users, Eye, Coins, AlertTriangle, Cpu, Shield } from "lucide-react";

interface PublishMarketplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  onPublish: (
    maxSuppliers: number,
    dataVisibilityLevel: number,
    deviceCount: number | null
  ) => void;
  isLoading?: boolean;
}

const visibilityLabels = {
  1: {
    label: "Basis",
    description:
      "Na claim ziet leverancier enkel bedrijfsnaam, contactpersoon, telefoon, e-mail en aantal toestellen.",
  },
  2: {
    label: "Premium",
    description:
      "Na claim ziet leverancier alle contractgegevens, behalve PDF contracten en facturen.",
  },
  3: {
    label: "Elite",
    description:
      "Na claim ziet leverancier alle gegevens, inclusief PDF contracten en facturen.",
  },
};

const PublishMarketplaceDialog = ({
  open,
  onOpenChange,
  contract,
  onPublish,
  isLoading,
}: PublishMarketplaceDialogProps) => {
  const [maxSuppliers, setMaxSuppliers] = useState(3);
  const [dataVisibility, setDataVisibility] = useState(1);
  const [deviceCount, setDeviceCount] = useState<string>("");

  useEffect(() => {
    if (open) {
      setDeviceCount(contract.device_count ? String(contract.device_count) : "");
      setMaxSuppliers(contract.max_suppliers || 3);
      setDataVisibility(contract.data_visibility_level || 1);
    }
  }, [open, contract]);

  const calculateCreditCost = () => {
    let baseCost = 5;
    if (maxSuppliers === 1) baseCost *= 3;
    else if (maxSuppliers === 2) baseCost *= 2;
    else if (maxSuppliers <= 3) baseCost *= 1.5;
    baseCost *= 1 + (dataVisibility - 1) * 0.5;
    return Math.ceil(baseCost);
  };

  const tier = visibilityLabels[dataVisibility as keyof typeof visibilityLabels];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Contract publiceren op marktplaats
          </DialogTitle>
          <DialogDescription>
            Vóór het claimen zien leveranciers enkel de provincie. Kies hieronder welk lead-pakket je
            aanbiedt zodra een leverancier de lead claimt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground">{contract.name}</h4>
            <p className="text-sm text-muted-foreground">
              {contract.supplier_name} • Einddatum:{" "}
              {new Date(contract.end_date).toLocaleDateString("nl-NL")}
            </p>
          </div>

          {/* Aantal toestellen */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Aantal toestellen
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="Bv. 25"
              value={deviceCount}
              onChange={(e) => setDeviceCount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Wordt aan de leverancier getoond na het claimen van de lead.
            </p>
          </div>

          {/* Number of Suppliers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Aantal leveranciers
              </Label>
              <Badge variant="secondary">{maxSuppliers}</Badge>
            </div>
            <Slider
              value={[maxSuppliers]}
              onValueChange={([value]) => setMaxSuppliers(value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minder leveranciers = exclusievere lead = hogere kosten per lead
            </p>
          </div>

          {/* Lead pakket */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Lead-pakket
              </Label>
              <Badge variant="secondary">{tier.label}</Badge>
            </div>
            <Slider
              value={[dataVisibility]}
              onValueChange={([value]) => setDataVisibility(value)}
              min={1}
              max={3}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Basis</span>
              <span>Premium</span>
              <span>Elite</span>
            </div>
            <p className="text-xs text-muted-foreground">{tier.description}</p>
          </div>

          {/* Credit Cost */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-medium">Geschatte kosten per claim</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {calculateCreditCost()} credits
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Je betaalt credits wanneer leveranciers de lead claimen. Hoger pakket = hogere lead-waarde.
            </p>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>
              Vóór het claimen is enkel de provincie zichtbaar. Pas na het claimen worden gegevens
              vrijgegeven volgens het gekozen pakket.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button
            onClick={() =>
              onPublish(
                maxSuppliers,
                dataVisibility,
                deviceCount ? Number(deviceCount) : null
              )
            }
            disabled={isLoading}
          >
            {isLoading ? "Publiceren..." : "Publiceren op marktplaats"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublishMarketplaceDialog;
