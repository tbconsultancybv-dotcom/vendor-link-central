import { Users, Calendar, Star, CreditCard, TrendingUp, MessageSquare } from "lucide-react";
import SupplierSidebar from "@/components/supplier/SupplierSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import LeadList from "@/components/supplier/LeadList";
import AppointmentList from "@/components/supplier/AppointmentList";
import CreditsOverview from "@/components/supplier/CreditsOverview";
import PerformanceStats from "@/components/supplier/PerformanceStats";

const SupplierDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <SupplierSidebar />
      
      <main className="ml-64">
        <DashboardHeader 
          title="Leverancier Dashboard" 
          subtitle="Welkom terug! Hier is je lead- en afspraakenoverzicht."
          showAddButton
          addButtonLabel="Profiel Bewerken"
        />

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Actieve Leads"
              value={23}
              change="+5 deze week"
              changeType="positive"
              icon={Users}
              iconColor="text-primary"
            />
            <StatsCard
              title="Geplande Afspraken"
              value={8}
              change="3 deze week"
              changeType="neutral"
              icon={Calendar}
              iconColor="text-accent"
            />
            <StatsCard
              title="Gemiddelde Rating"
              value="4.8"
              change="+0.2 vs vorige maand"
              changeType="positive"
              icon={Star}
              iconColor="text-warning"
            />
            <StatsCard
              title="Beschikbare Credits"
              value={47}
              change="15 gebruikt deze maand"
              changeType="neutral"
              icon={CreditCard}
              iconColor="text-success"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead List - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <LeadList />
              <AppointmentList />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <CreditsOverview />
              <PerformanceStats />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;
