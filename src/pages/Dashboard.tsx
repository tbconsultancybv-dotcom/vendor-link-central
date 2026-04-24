import { useNavigate } from "react-router-dom";
import { FileText, AlertTriangle, Euro, TrendingDown } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import ContractList from "@/components/dashboard/ContractList";
import UpcomingAlerts from "@/components/dashboard/UpcomingAlerts";
import CostOverview from "@/components/dashboard/CostOverview";
import { useContracts } from "@/hooks/useContracts";
import { useNotifications } from "@/hooks/useNotifications";

const Dashboard = () => {
  const navigate = useNavigate();
  const { contracts, isLoading } = useContracts();
  const { notifications } = useNotifications();

  // Calculate stats
  const activeContracts = contracts.filter((c) => c.status === "active" || c.status === "expiring").length;
  const actionRequired = notifications.filter((n) => !n.is_actioned && (n.priority === "high" || n.priority === "critical")).length;
  const monthlyTotal = contracts.reduce((sum, c) => sum + c.monthly_cost, 0);
  const expiringContracts = contracts.filter((c) => c.status === "expiring").length;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <DashboardHeader 
          title="Dashboard" 
          subtitle="Welkom terug! Hier is je contractoverzicht."
          showAddButton
          addButtonLabel="Nieuw Contract"
          onAddClick={() => navigate("/dashboard/contracts")}
        />

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Actieve Contracten"
              value={isLoading ? "..." : activeContracts}
              change={`${expiringContracts} verlopen binnenkort`}
              changeType={expiringContracts > 0 ? "negative" : "neutral"}
              icon={FileText}
              iconColor="text-primary"
            />
            <StatsCard
              title="Actie Vereist"
              value={isLoading ? "..." : actionRequired}
              change={actionRequired > 0 ? "Bekijk notificaties" : "Alles onder controle"}
              changeType={actionRequired > 0 ? "negative" : "positive"}
              icon={AlertTriangle}
              iconColor="text-warning"
            />
            <StatsCard
              title="Maandkosten"
              value={isLoading ? "..." : `€${monthlyTotal.toLocaleString("nl-NL")}`}
              change="Totaal alle contracten"
              changeType="neutral"
              icon={Euro}
              iconColor="text-foreground"
            />
            <StatsCard
              title="Potentiële Besparing"
              value="€-"
              change="Publiceer contracten op marktplaats"
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
