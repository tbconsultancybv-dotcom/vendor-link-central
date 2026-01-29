import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonLabel?: string;
}

const DashboardHeader = ({ 
  title, 
  subtitle, 
  showAddButton = false, 
  onAddClick,
  addButtonLabel = "Toevoegen"
}: DashboardHeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Zoeken..." 
              className="pl-9 w-64 bg-background"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>

          {/* Add Button */}
          {showAddButton && (
            <Button onClick={onAddClick}>
              <Plus className="w-4 h-4" />
              {addButtonLabel}
            </Button>
          )}

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
