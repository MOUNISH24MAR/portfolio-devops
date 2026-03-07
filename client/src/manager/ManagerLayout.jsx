import { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import {
  Menu, X, LayoutDashboard, Building2, Users,
  Briefcase, FileText, Globe, DollarSign,
  Image, Newspaper, LogOut, ChevronRight, Package
} from "lucide-react";
import "./mang_css/ManagerLayout.css";

const ManagerLayout = () => {
  const { company } = useCompany();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      end={to === "/manager/dashboard"}
      onClick={() => setSidebarOpen(false)}
    >
      <Icon size={18} />
      <span>{label}</span>
      {/* <ChevronRight size={14} className="arrow" /> */}
    </NavLink>
  );

  return (
    <div className="manager-layout">
      {/* Top Bar */}
      <header className="manager-topbar">
        <div className="topbar-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} color="var(--text-primary)" />
          </button>
          <div className="app-brand">
            <span className="brand-name">{company?.name || "V R fashions"}</span>
            <span className="brand-divider">|</span>
            <span className="brand-context">Manager Portal</span>
          </div>
        </div>
        <div className="topbar-right">
          <div className="user-profile">
            <div className="avatar">{username ? username[0].toUpperCase() : 'M'}</div>
            <span className="username">{username || 'Manager'}</span>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`manager-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button onClick={() => setSidebarOpen(false)} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="nav-group">
            <div className="group-label">Dashboard</div>
            <NavItem to="/manager/dashboard" icon={LayoutDashboard} label="Overview" />
          </div>

          <div className="nav-group">
            <div className="group-label">Organization</div>
            <NavItem to="/manager/company" icon={Building2} label="Company Profile" />
            <NavItem to="/manager/employees" icon={Users} label="Employee Directory" />
          </div>

          <div className="nav-group">
            <div className="group-label">Operations</div>
            <NavItem to="/manager/projects" icon={Briefcase} label="Projects" />
            <NavItem to="/manager/reports" icon={FileText} label="Ops Reports" />
            <NavItem to="/manager/raw-materials" icon={Package} label="Raw Materials" />
          </div>

          <div className="nav-group">
            <div className="group-label">Business</div>
            <NavItem to="/manager/buyers" icon={Users} label="Buyers" />
            <NavItem to="/manager/exports" icon={Globe} label="Exports" />
            <NavItem to="/manager/financials" icon={DollarSign} label="Financials" />
          </div>

          <div className="nav-group">
            <div className="group-label">Content</div>
            <NavItem to="/manager/media" icon={Image} label="Media Assets" />
            <NavItem to="/manager/updates" icon={Newspaper} label="News & Updates" />
            <NavItem to="/manager/products" icon={Package} label="Product Catalogue" />
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="manager-main">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
