import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, Plus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

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
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

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
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/dashboard/notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Add Button */}
          {showAddButton && (
            <Button onClick={onAddClick}>
              <Plus className="w-4 h-4" />
              {addButtonLabel}
            </Button>
          )}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {getUserInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Ingelogd</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Mijn profiel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Uitloggen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
