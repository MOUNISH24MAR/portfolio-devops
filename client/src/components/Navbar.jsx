import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import "./compo_css/Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { company } = useCompany();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <span className="logo-text">{company?.name || "V R fashions"}</span>
          <span className="logo-tagline">Excellence in Knitted Garments</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Overlay */}
        <div
          className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
          onClick={closeMobileMenu}
        />

        {/* Navigation Menu */}
        <ul className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMobileMenu}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/products"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMobileMenu}
            >
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/facilities"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMobileMenu}
            >
              Facilities
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/exports"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMobileMenu}
            >
              Exports
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/sustainability"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMobileMenu}
            >
              Sustainability
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/testimonials"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={closeMobileMenu}
            >
              Testimonials
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "nav-link nav-link-cta active" : "nav-link nav-link-cta")}
              onClick={closeMobileMenu}
            >
              Contact Us
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
