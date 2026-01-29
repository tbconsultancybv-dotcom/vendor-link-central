import { FileText, AlertTriangle, Euro, TrendingDown } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import ContractList from "@/components/dashboard/ContractList";
import UpcomingAlerts from "@/components/dashboard/UpcomingAlerts";
import CostOverview from "@/components/dashboard/CostOverview";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <DashboardHeader 
          title="Dashboard" 
          subtitle="Welkom terug! Hier is je contractoverzicht."
          showAddButton
          addButtonLabel="Nieuw Contract"
        />

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Actieve Contracten"
              value={47}
              change="+3 deze maand"
              changeType="neutral"
              icon={FileText}
              iconColor="text-primary"
            />
            <StatsCard
              title="Actie Vereist"
              value={5}
              change="2 kritiek"
              changeType="negative"
              icon={AlertTriangle}
              iconColor="text-warning"
            />
            <StatsCard
              title="Maandkosten"
              value="€12.450"
              change="+€320 vs vorige maand"
              changeType="negative"
              icon={Euro}
              iconColor="text-foreground"
            />
            <StatsCard
              title="Gerealiseerde Besparing"
              value="€3.200"
              change="+15% dit kwartaal"
              changeType="positive"
              icon={TrendingDown}
              iconColor="text-success"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contract List - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ContractList />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <UpcomingAlerts />
              <CostOverview />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
