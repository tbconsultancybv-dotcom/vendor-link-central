import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, FileText, Calendar, CreditCard } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const leads = [
  {
    id: 1,
    company: "TechCorp B.V.",
    location: "Amsterdam",
    contractType: "IT Services",
    contractValue: "€2.500/maand",
    expiresIn: "30 dagen",
    status: "new",
    creditsRequired: 5,
  },
  {
    id: 2,
    company: "Bouwgroep Nederland",
    location: "Rotterdam",
    contractType: "Telecom",
    contractValue: "€1.800/maand",
    expiresIn: "45 dagen",
    status: "new",
    creditsRequired: 4,
  },
  {
    id: 3,
    company: "Retail Plus B.V.",
    location: "Utrecht",
    contractType: "Printing Services",
    contractValue: "€950/maand",
    expiresIn: "60 dagen",
    status: "contacted",
    creditsRequired: 0,
  },
  {
    id: 4,
    company: "LogiTrans",
    location: "Eindhoven",
    contractType: "Fleet Management",
    contractValue: "€4.200/maand",
    expiresIn: "21 dagen",
    status: "appointment",
    creditsRequired: 0,
  },
  {
    id: 5,
    company: "MediCare Group",
    location: "Den Haag",
    contractType: "IT Infrastructure",
    contractValue: "€3.100/maand",
    expiresIn: "14 dagen",
    status: "new",
    creditsRequired: 6,
  },
];

const statusConfig = {
  new: { label: "Nieuw", variant: "default" as const, className: "bg-accent text-accent-foreground" },
  contacted: { label: "Gecontacteerd", variant: "secondary" as const, className: "bg-primary/10 text-primary" },
  appointment: { label: "Afspraak", variant: "default" as const, className: "bg-success/20 text-success" },
  won: { label: "Gewonnen", variant: "default" as const, className: "bg-success text-success-foreground" },
  lost: { label: "Verloren", variant: "destructive" as const, className: "bg-destructive/20 text-destructive" },
};

const LeadList = () => {
  const [leadData, setLeadData] = useState(leads);
  const { toast } = useToast();

  const handleClaimLead = (leadId: number, credits: number) => {
    setLeadData(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: "contacted", creditsRequired: 0 }
          : lead
      )
    );
    toast({
      title: "Lead geclaimd!",
      description: `${credits} credits zijn afgeschreven. Je kunt nu contact opnemen.`,
    });
  };

  const handleScheduleAppointment = (leadId: number) => {
    setLeadData(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: "appointment" }
          : lead
      )
    );
    toast({
      title: "Afspraak ingepland",
      description: "De klant ontvangt een bevestiging per e-mail.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Beschikbare Leads</CardTitle>
        <Button variant="outline" size="sm">Alle Leads</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leadData.map((lead) => {
            const status = statusConfig[lead.status as keyof typeof statusConfig];
            
            return (
              <div
                key={lead.id}
                className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{lead.company}</h3>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {lead.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {lead.contractType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Vervalt in {lead.expiresIn}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground">
                      Geschatte waarde: {lead.contractValue}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {lead.status === "new" && (
                    <Button 
                      size="sm"
                      onClick={() => handleClaimLead(lead.id, lead.creditsRequired)}
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Claim ({lead.creditsRequired} credits)
                    </Button>
                  )}
                  {lead.status === "contacted" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleScheduleAppointment(lead.id)}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Plan Afspraak
                    </Button>
                  )}
                  {lead.status === "appointment" && (
                    <Button size="sm" variant="success">
                      Bekijk Details
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadList;
