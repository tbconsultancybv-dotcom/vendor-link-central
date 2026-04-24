import { useState } from "react";
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
import { Contract } from "@/hooks/useContracts";
import { Store, Users, Eye, Coins, AlertTriangle } from "lucide-react";

interface PublishMarketplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  onPublish: (maxSuppliers: number, dataVisibilityLevel: number) => void;
  isLoading?: boolean;
}

const PublishMarketplaceDialog = ({
  open,
  onOpenChange,
  contract,
  onPublish,
  isLoading,
}: PublishMarketplaceDialogProps) => {
  const [maxSuppliers, setMaxSuppliers] = useState(3);
  const [dataVisibility, setDataVisibility] = useState(1);

  // Calculate credit cost based on settings
  const calculateCreditCost = () => {
    let baseCost = 5;
    
    // Fewer suppliers = higher cost
    if (maxSuppliers === 1) baseCost *= 3;
    else if (maxSuppliers === 2) baseCost *= 2;
    else if (maxSuppliers <= 3) baseCost *= 1.5;
    
    // More visibility = higher cost
    baseCost *= 1 + (dataVisibility - 1) * 0.5;
    
    return Math.ceil(baseCost);
  };

  const visibilityLabels = {
    1: { label: "Basis", description: "Alleen categorie en einddatum zichtbaar" },
    2: { label: "Medium", description: "Inclusief geschatte kosten en leveranciersnaam" },
    3: { label: "Volledig", description: "Alle contractgegevens zichtbaar voor leveranciers" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Contract publiceren op marktplaats
          </DialogTitle>
          <DialogDescription>
            Stel in hoeveel leveranciers je wilt vergelijken en welke informatie zij mogen zien.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contract Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground">{contract.name}</h4>
            <p className="text-sm text-muted-foreground">
              {contract.supplier_name} • Einddatum: {new Date(contract.end_date).toLocaleDateString("nl-NL")}
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

          {/* Data Visibility */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Data zichtbaarheid
              </Label>
              <Badge variant="secondary">
                {visibilityLabels[dataVisibility as keyof typeof visibilityLabels].label}
              </Badge>
            </div>
            <Slider
              value={[dataVisibility]}
              onValueChange={([value]) => setDataVisibility(value)}
              min={1}
              max={3}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {visibilityLabels[dataVisibility as keyof typeof visibilityLabels].description}
            </p>
          </div>

          {/* Credit Cost Summary */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <span className="font-medium">Geschatte kosten</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {calculateCreditCost()} credits
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Je betaalt credits wanneer leveranciers de lead claimen. Meer data = hogere lead waarde.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>
              Na publicatie kunnen leveranciers jouw contract bekijken en een offerte aanvragen. 
              Je ontvangt een melding voor elke nieuwe aanvraag.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button 
            onClick={() => onPublish(maxSuppliers, dataVisibility)}
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
