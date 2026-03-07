import { useState } from "react";
import { useNavigate, Outlet, NavLink, Link } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  ExternalLink,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
  Database,
  TrendingUp,
  MessageSquare,
  Package
} from "lucide-react";
import "./admin_css/AdminLayout.css";

const AdminLayout = () => {
  const { company } = useCompany();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(['core']); // Default open
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin Agent";

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleGroup = (group) => {
    setExpandedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const NavItem = ({ to, icon: Icon, label, end = false }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      onClick={() => setSidebarOpen(false)}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="admin-layout">
      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="admin-brand">
            <span className="brand-logo">{company?.name ? company.name.split(' ').map(n => n[0]).join('').toUpperCase() : "VR"}</span>
            <span className="brand-divider">|</span>
            <span className="brand-context">Admin Intelligence</span>
          </div>
        </div>
        <div className="topbar-right">
          <div className="admin-user-profile">
            <div className="avatar">{username.charAt(0).toUpperCase()}</div>
            <span className="username">{username}</span>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="logo" onClick={() => setSidebarOpen(false)}>
            {company?.name ? company.name.toUpperCase() : "V R FASHIONS"}
          </Link>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-group ${expandedGroups.includes('core') ? 'expanded' : ''}`}>
            <div className="nav-label" onClick={() => toggleGroup('core')}>
              <span>Core Monitoring</span>
              <ChevronRight className="group-arrow" size={14} />
            </div>
            <div className="group-content">
              <NavItem to="/admin" icon={LayoutDashboard} label="Executive Insights" end />
              <NavItem to="/admin/insights" icon={TrendingUp} label="Operational Insights" />
              <NavItem to="/admin/approvals" icon={ShieldCheck} label="Governance & Approvals" />
              <NavItem to="/admin/company-approvals" icon={Database} label="Company Profiling" />
              <NavItem to="/admin/users" icon={Users} label="Management Directory" />
              <NavItem to="/admin/inquiries" icon={MessageSquare} label="Contact Inquiries" />
              <NavItem to="/admin/products" icon={Package} label="Product collections" />
            </div>
          </div>

          <div className={`nav-group ${expandedGroups.includes('external') ? 'expanded' : ''}`}>
            <div className="nav-label" onClick={() => toggleGroup('external')}>
              <span>External Control</span>
              <ChevronRight className="group-arrow" size={14} />
            </div>
            <div className="group-content">
              <a href="/" target="_blank" className="nav-item">
                <ExternalLink size={18} />
                <span>Public Portfolio</span>
              </a>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
