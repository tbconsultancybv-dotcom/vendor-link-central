import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  BarChart3, 
  Users, 
  Settings,
  Building2,
  Upload,
  HelpCircle,
  LogOut,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Contracten", href: "/dashboard/contracts" },
  { icon: Tag, label: "Categorieën", href: "/dashboard/categories" },
  { icon: Bell, label: "Notificaties", href: "/dashboard/notifications" },
  { icon: BarChart3, label: "Rapportages", href: "/dashboard/reports" },
  { icon: Building2, label: "Leveranciers", href: "/dashboard" },
  { icon: Upload, label: "Documenten", href: "/dashboard/documents" },
  { icon: Users, label: "Team", href: "/dashboard" },
];

const bottomItems = [
  { icon: Settings, label: "Instellingen", href: "/dashboard/settings" },
  { icon: HelpCircle, label: "Help", href: "/dashboard" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-foreground">BivaroX</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground"
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
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground"
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

export default Sidebar;
