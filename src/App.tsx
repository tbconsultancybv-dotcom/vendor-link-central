import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import Notifications from "./pages/Notifications";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import SupplierDashboard from "./pages/SupplierDashboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/contracts" element={<Contracts />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/documents" element={<Documents />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/categories" element={<Categories />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/supplier" element={<SupplierDashboard />} />
            <Route path="/supplier/*" element={<SupplierDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
