import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Building2,
  CreditCard,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/supplier" },
  { icon: Users, label: "Leads", href: "/supplier/leads" },
  { icon: Calendar, label: "Afspraken", href: "/supplier/appointments" },
  { icon: CreditCard, label: "Credits", href: "/supplier/credits" },
  { icon: BarChart3, label: "Statistieken", href: "/supplier/stats" },
  { icon: MessageSquare, label: "Reviews", href: "/supplier/reviews" },
  { icon: Building2, label: "Bedrijfsprofiel", href: "/supplier/profile" },
];

const bottomItems = [
  { icon: Settings, label: "Instellingen", href: "/supplier/settings" },
  { icon: HelpCircle, label: "Help", href: "/supplier/help" },
];

const SupplierSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src="/bivaro-logo.png" alt="Bivaro" className="h-8 w-auto" />
          <div>
            <span className="text-xl font-bold text-foreground">Bivaro</span>
            <span className="block text-xs text-muted-foreground">Leverancier Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/supplier" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        <Link 
          to="/" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          Uitloggen
        </Link>
      </div>
    </aside>
  );
};

export default SupplierSidebar;
