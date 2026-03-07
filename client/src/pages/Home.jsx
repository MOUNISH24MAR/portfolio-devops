import { Link } from "react-router-dom";
import ScrollAnimatedSection from "../components/ScrollAnimatedSection";
import { useCompany } from "../context/CompanyContext";
import "./page_css/Home.css";
import "../styles/scrollAnimations.css";

function Home() {
  const { company } = useCompany();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="section section-light hero">
        <div className="container">
          <div className="hero-grid">
            <ScrollAnimatedSection animation="animate-fade-in-left">
              <div className="hero-content">
                <span className="hero-label">The Foundation</span>
                <h1 className="hero-title">
                  {company?.name || "V R fashions"}
                </h1>
                <p className="hero-tagline">
                  {company?.tagline || "Precision in Knitted Garments."}
                </p>
                <p className="hero-subtitle">
                  {company ? company.description : "Premier manufacturer of cotton-related apparel, specialized in banian cloth, specialty collections, and custom designed t-shirts."}
                </p>
                <div className="hero-cta">
                  <Link to="/products" className="btn btn-primary">Our Collection</Link>
                  <Link to="/about" className="btn btn-secondary">The Story</Link>
                </div>
              </div>
            </ScrollAnimatedSection>
            <div className="hero-visual">
              <img src="/vr.jpeg" alt="V R fashions Facility" className="hero-img" />
              <div className="visual-block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section section-muted philosophy">
        <div className="container">
          <ScrollAnimatedSection animation="animate-fade-in-up">
            <div className="editorial-header">
              <h2 className="section-title">01 / Philosophy</h2>
              <div className="section-divider"></div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h3>Global Export Focus</h3>
                <p>Establishing strong trade routes with Sahinler (France) and VRF Corp (USA).</p>
              </div>
              <div className="feature-card">
                <h3>Product Specialization</h3>
                <p>Expertise in T-shirts, Tops, Sweatshirts, Pajama sets, and Nightwear for all age groups.</p>
              </div>
              <div className="feature-card">
                <h3>Vast Industry Insight</h3>
                <p>Led by founders with 25 years of experience in the textile ecosystem of Tirupur.</p>
              </div>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Stats Block */}
      <section className="section section-dark statistics">
        <div className="container">
          <ScrollAnimatedSection animation="animate-scale-in">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">10+</span>
                <span className="stat-label">Years of Expertise</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K</span>
                <span className="stat-label">Monthly Pieces</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Export Oriented</span>
              </div>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section section-light final-cta">
        <div className="container">
          <ScrollAnimatedSection animation="animate-fade-in-up">
            <div className="cta-box">
              <h2 className="section-title">Initiate a Project</h2>
              <p>Partner with {company?.name || "V R fashions"} for industry-leading knitted garment manufacturing.</p>
              <Link to="/contact" className="btn btn-primary btn-large">Request Partnership</Link>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>
    </div>
  );
}

export default Home;
