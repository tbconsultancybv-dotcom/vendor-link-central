import { Outlet } from "react-router-dom";
import SupplierSidebar from "@/components/supplier/SupplierSidebar";

const SupplierLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <SupplierSidebar />
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default SupplierLayout;
