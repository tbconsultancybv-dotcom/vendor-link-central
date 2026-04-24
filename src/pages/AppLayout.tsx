import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus, LogOut } from "lucide-react";

const AppLayout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/app" className="text-xl font-bold">BivaroX</Link>
            <nav className="flex items-center gap-1">
              <NavLink
                to="/app"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </span>
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app/upload">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Contract toevoegen
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.email}
            </span>
            <Button size="sm" variant="ghost" onClick={handleSignOut} aria-label="Uitloggen">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
