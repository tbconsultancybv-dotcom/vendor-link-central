import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Building2, Video, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const appointments = [
  {
    id: 1,
    company: "TechComm BV",
    date: "2 Feb 2026",
    time: "10:00",
    type: "video",
    status: "confirmed",
    contact: "Jean Dupont",
  },
  {
    id: 2,
    company: "LogiTrans",
    date: "4 Feb 2026",
    time: "14:30",
    type: "physical",
    location: "Luik",
    status: "pending",
    contact: "Marie Dubois",
  },
  {
    id: 3,
    company: "Retail Plus BVBA",
    date: "6 Feb 2026",
    time: "11:00",
    type: "video",
    status: "confirmed",
    contact: "Pierre Martin",
  },
];

const statusConfig = {
  confirmed: { label: "Bevestigd", className: "bg-success/20 text-success" },
  pending: { label: "In afwachting", className: "bg-warning/20 text-warning" },
  cancelled: { label: "Geannuleerd", className: "bg-destructive/20 text-destructive" },
};

const AppointmentList = () => {
  const [appointmentData, setAppointmentData] = useState(appointments);
  const { toast } = useToast();

  const handleConfirm = (id: number) => {
    setAppointmentData(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: "confirmed" } : apt
      )
    );
    toast({
      title: "Afspraak bevestigd",
      description: "De klant ontvangt een bevestiging.",
    });
  };

  const handleReschedule = (id: number) => {
    toast({
      title: "Verzoek verzonden",
      description: "De klant kan een nieuw tijdstip kiezen.",
    });
  };

  const handleJoinMeeting = () => {
    toast({
      title: "Meeting starten...",
      description: "Je wordt doorgestuurd naar de videocall.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Komende Afspraken</CardTitle>
        <Button variant="outline" size="sm">Agenda Bekijken</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointmentData.map((appointment) => {
            const status = statusConfig[appointment.status as keyof typeof statusConfig];
            
            return (
              <div
                key={appointment.id}
                className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    {appointment.type === "video" ? (
                      <Video className="w-5 h-5 text-accent" />
                    ) : (
                      <MapPin className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{appointment.company}</h3>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {appointment.contact}
                      </span>
                    </div>
                    {appointment.type === "physical" && appointment.location && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        📍 {appointment.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {appointment.status === "pending" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReschedule(appointment.id)}
                      >
                        Verzetten
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleConfirm(appointment.id)}
                      >
                        Bevestigen
                      </Button>
                    </>
                  )}
                  {appointment.status === "confirmed" && appointment.type === "video" && (
                    <Button 
                      size="sm" 
                      variant="success"
                      onClick={handleJoinMeeting}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Join Meeting
                    </Button>
                  )}
                  {appointment.status === "confirmed" && appointment.type === "physical" && (
                    <Button size="sm" variant="outline">
                      Route Plannen
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

export default AppointmentList;
