import { Link } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import "./compo_css/Footer.css";

function Footer() {
  const { company } = useCompany();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">{company?.name || "V R fashions"}</h3>
          <p className="footer-description">
            {company?.description || "100% Export Oriented Garment Factory. Specializing in premium knitted garments for global markets."}
          </p>
          <div className="footer-certifications">
            <span className="cert-badge">SA8000</span>
            <span className="cert-badge">GOTS</span>
            <span className="cert-badge">GRS</span>
            <span className="cert-badge">BSCI</span>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/facilities">Facilities</Link></li>
            <li><Link to="/sustainability">Sustainability</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Our Services</h4>
          <ul className="footer-links">
            <li><Link to="/exports">Global Exports</Link></li>
            <li><a href="#custom">Custom Manufacturing</a></li>
            <li><a href="#quality">Quality Assurance</a></li>
            <li><a href="#logistics">Logistics Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact Info</h4>
          <ul className="footer-contact">
            <li>📧 vmr@vrfashions.in</li>
            <li>📞 +91 98947 61456</li>
            <li>📍 85, 86, VIVEKANANDHA NAGAR, KOVILVALI, TIRUPUR-641606</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} {company?.name || "V R fashions"}. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#privacy">Privacy Policy</a>
          <span>•</span>
          <a href="#terms">Terms of Service</a>
          <span>•</span>
          <a href="#sitemap">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;