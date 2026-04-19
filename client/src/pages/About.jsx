import { useCompany } from "../context/CompanyContext";
import "./page_css/About.css";
import ScrollAnimatedSection from "../components/ScrollAnimatedSection";

function About() {
  const { company } = useCompany();
  return (
    <div className="about">
      {/* Page Header */}
      <section className="section-light about-header">
        <div className="container">
          <ScrollAnimatedSection animation="animate-fade-in-up">
            <h1 className="page-title">{company?.name || "V R fashions."}</h1>
            <p className="page-subtitle">
              {company?.description?.substring(0, 100)}...
            </p>
            <div className="section-divider"></div>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-muted company-story">
        <div className="container">
          <div className="story-content">
            <ScrollAnimatedSection animation="animate-fade-in-left">
              <div className="story-text">
                <h2>Our History</h2>
                <div className="section-divider"></div>
                <p>
                  Established in {company?.establishedYear || "2016"} by Mounish Raj and Renugadevi, {company?.name || "VR Fashions"} began its journey
                  with 40 sets of machinery in Kovilvali, Tirupur.
                </p>
                <p>
                  Today, we operate as a 100% export-oriented factory, specializing in high-quality
                  knitted garments. Our relentless focus on quality and timely delivery has
                  secured long-standing partnerships with major importers in France and the USA.
                </p>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="animate-fade-in-right">
              <div className="story-stats">
                <div className="story-stat">
                  <span className="stat-value">{company?.establishedYear || "2016"}</span>
                  <span className="stat-text">Established</span>
                </div>
                <div className="story-stat">
                  <span className="stat-value">25Y</span>
                  <span className="stat-text">Leadership Depth</span>
                </div>
                <div className="story-stat">
                  <span className="stat-value">100</span>
                  <span className="stat-text">Planned Machines (2026)</span>
                </div>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission & Vision - DARK SECTION */}
      <section className="section-dark mission-vision">
        <div className="container">
          <div className="mv-grid">
            <ScrollAnimatedSection animation="animate-fade-in-up" delay={1}>
              <div className="mv-card">
                <div className="mv-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>
                  To manufacture and export premium quality garments that exceed
                  international standards while maintaining sustainable and ethical
                  practices.
                </p>
              </div>
            </ScrollAnimatedSection>

            <ScrollAnimatedSection animation="animate-fade-in-up" delay={2}>
              <div className="mv-card">
                <div className="mv-icon">👁️</div>
                <h3>Our Vision</h3>
                <p>
                  To be recognized globally as the most trusted and innovative garment
                  manufacturer, setting industry benchmarks in quality and sustainability.
                </p>
              </div>
            </ScrollAnimatedSection>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-muted core-values">
        <div className="container">
          <ScrollAnimatedSection animation="animate-fade-in-up">
            <h2 className="section-title">Core Principles</h2>
            <p className="section-subtitle">
              The values that define our craftsmanship
            </p>
            <div className="section-divider" style={{ margin: "0 auto 60px" }}></div>

            <div className="values-grid">
              <div className="value-item"><h4>Quality</h4><p>Uncompromising commitment to excellence.</p></div>
              <div className="value-item"><h4>Integrity</h4><p>Conducting business with total transparency.</p></div>
              <div className="value-item"><h4>Innovation</h4><p>Embracing new technologies at every scale.</p></div>
              <div className="value-item"><h4>Sustainability</h4><p>Committed to eco-friendly manufacturing.</p></div>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>

      {/* Certifications */}
      <section className="section-light certifications">
        <div className="container">
          <ScrollAnimatedSection animation="animate-scale-in">
            <h2 className="section-title">Certifications & Compliance</h2>
            <div className="cert-grid">
              <div className="cert-card"><div className="cert-badge-large">SA8000</div><p>Social Accountability</p></div>
              <div className="cert-card"><div className="cert-badge-large">SEDEX</div><p>Ethical Trade</p></div>
              <div className="cert-card"><div className="cert-badge-large">DISNEY</div><p>Facility & Merchandise</p></div>
              <div className="cert-card"><div className="cert-badge-large">BSCI</div><p>Business Social Compliance</p></div>
              <div className="cert-card"><div className="cert-badge-large">GOTS</div><p>Organic Textile Standard</p></div>
              <div className="cert-card"><div className="cert-badge-large">GRS</div><p>Global Recycled Standard</p></div>
            </div>
          </ScrollAnimatedSection>
        </div>
      </section>
    </div>
  );
}

export default About;