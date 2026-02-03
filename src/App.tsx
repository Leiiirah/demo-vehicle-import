import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VehiclesPage from "./pages/Vehicles";
import CostCalculatorPage from "./pages/Calculator";
import SuppliersPage from "./pages/Suppliers";
import SupplierDetailPage from "./pages/SupplierDetail";
import ClientsPage from "./pages/Clients";
import ReportsPage from "./pages/Reports";
import SalesPage from "./pages/Sales";
import UsersPage from "./pages/Users";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/calculator" element={<CostCalculatorPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
