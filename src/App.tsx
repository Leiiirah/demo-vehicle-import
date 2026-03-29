import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "./pages/Login";
import Index from "./pages/Index";
import VehiclesPage from "./pages/Vehicles";
import VehicleDetailPage from "./pages/VehicleDetail";

import SuppliersPage from "./pages/Suppliers";
import SupplierDetailPage from "./pages/SupplierDetail";
import PasseportsPage from "./pages/Passeports";
import PasseportDetailPage from "./pages/PasseportDetail";
import ClientsPage from "./pages/Clients";
import ClientDetailPage from "./pages/ClientDetail";
import DossiersPage from "./pages/Dossiers";
import DossierDetailPage from "./pages/DossierDetail";
import ConteneursPage from "./pages/Conteneurs";
import ConteneurDetailPage from "./pages/ConteneurDetail";
import ReportsPage from "./pages/Reports";
import SalesPage from "./pages/Sales";
import ClientSalesPage from "./pages/ClientSales";
import UsersPage from "./pages/Users";
import SettingsPage from "./pages/Settings";
import SearchPage from "./pages/Search";
import CaissePage from "./pages/Caisse";
import StockPage from "./pages/Stock";
import ModelsPage from "./pages/Models";
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
            <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetailPage /></ProtectedRoute>} />
            
            <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
            <Route path="/suppliers/:id" element={<ProtectedRoute><SupplierDetailPage /></ProtectedRoute>} />
            <Route path="/passeports" element={<ProtectedRoute><PasseportsPage /></ProtectedRoute>} />
            <Route path="/passeports/:id" element={<ProtectedRoute><PasseportDetailPage /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailPage /></ProtectedRoute>} />
            <Route path="/dossiers" element={<ProtectedRoute><DossiersPage /></ProtectedRoute>} />
            <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetailPage /></ProtectedRoute>} />
            <Route path="/conteneurs" element={<ProtectedRoute><ConteneursPage /></ProtectedRoute>} />
            <Route path="/conteneurs/:id" element={<ProtectedRoute><ConteneurDetailPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
            <Route path="/client-sales" element={<ProtectedRoute><ClientSalesPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/caisse" element={<ProtectedRoute><CaissePage /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />
            <Route path="/models" element={<ProtectedRoute><ModelsPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
