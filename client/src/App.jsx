import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CompanyProvider } from "./context/CompanyContext";

import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Facilities from "./pages/Facilities";
import Exports from "./pages/Exports";
import Sustainability from "./pages/Sustainability";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";

import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminDashboard from "./admin/AdminDashboard";
import Users from "./admin/Users";
import Approvals from "./admin/Approvals";
import CompanyApprovals from "./admin/CompanyApprovals";
import AdminLayout from "./admin/AdminLayout";
import Insights from "./admin/Insights";
import Inquiries from "./admin/Inquiries";
import AdminProducts from "./admin/AdminProducts";
import ManagerLayout from "./manager/ManagerLayout";
import ManagerDashboard from "./manager/ManagerDashboard";
import CompanyManagement from "./manager/CompanyManagement";
import ProjectsManagement from "./manager/ProjectsManagement";
import EmployeeManagement from "./manager/EmployeeManagement";
import OperationsReportSubmission from "./manager/OperationsReportSubmission";
import MediaManagement from "./manager/MediaManagement";
import UpdatesManagement from "./manager/UpdatesManagement";
import ExportManagement from "./manager/operational/ExportManagement";
import RawMaterialManagement from "./manager/operational/RawMaterialManagement";
import BuyerManagement from "./manager/operational/BuyerManagement";
import FinancialManagement from "./manager/operational/FinancialManagement";
import ProductManagement from "./manager/ProductManagement";

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  return null;
}

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CompanyProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/exports" element={<Exports />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Auth Route */}
          <Route path="/login" element={<Login portalName="Internal Operations Portal" />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/approvals" element={<Approvals />} />
              <Route path="/admin/company-approvals" element={<CompanyApprovals />} />
              <Route path="/admin/insights" element={<Insights />} />
              <Route path="/admin/inquiries" element={<Inquiries />} />
              <Route path="/admin/products" element={<AdminProducts />} />
            </Route>
          </Route>

          {/* Protected Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route element={<ManagerLayout />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard portalName="Manager Dashboard" />} />
              <Route path="/manager/company" element={<CompanyManagement />} />
              <Route path="/manager/employees" element={<EmployeeManagement />} />
              <Route path="/manager/projects" element={<ProjectsManagement />} />
              <Route path="/manager/reports" element={<OperationsReportSubmission />} />
              <Route path="/manager/media" element={<MediaManagement />} />
              <Route path="/manager/updates" element={<UpdatesManagement />} />
              {/* New Operational Routes */}
              <Route path="/manager/exports" element={<ExportManagement />} />
              <Route path="/manager/raw-materials" element={<RawMaterialManagement />} />
              <Route path="/manager/buyers" element={<BuyerManagement />} />
              <Route path="/manager/financials" element={<FinancialManagement />} />
              <Route path="/manager/products" element={<ProductManagement />} />
            </Route>
          </Route>
        </Routes>
      </CompanyProvider>
    </BrowserRouter>
  );
}

export default App;