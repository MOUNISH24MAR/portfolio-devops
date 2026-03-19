import { ML_PROXY_URL as ML_API } from "../config";
import { useState, useEffect } from "react";
import "./admin_css/AdminMaster.css";
import "./admin_css/AdminProducts.css";
import {
  BrainCircuit,
  TrendingUp,
  Globe,
  Package,
  RefreshCw,
  AlertCircle,
  Cpu,
  BarChart3,
  DollarSign,
  Target,
  Zap,
  TrendingDown,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

const ExportAIInsights = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customPrediction, setCustomPrediction] = useState(null);
  const [isRunningPrediction, setIsRunningPrediction] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    product_type: "knitted wear",
    destination_country: "usa",
    order_quantity: 10000,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchForecast();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => setIsMobile(window.innerWidth < 1024);


  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${ML_API}/forecast`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("ML service unreachable");
      const data = await res.json();
      setForecast(data);
    } catch (err) {
      setError("ML Prediction Service Offline. Start the FastAPI server: uvicorn ml_service.main:app --port 8000");
    } finally {
      setLoading(false);
    }
  };

  const runCustomPrediction = async () => {
    try {
      setIsRunningPrediction(true);
      
      // Fetch both revenue and demand concurrently
      const [revRes, demRes] = await Promise.all([
        fetch(`${ML_API}/predict`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(form),
        }),
        fetch(`${ML_API}/demand`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            product_type: form.product_type,
            destination_country: form.destination_country,
            month: form.month,
            year: form.year
          }),
        })
      ]);

      const revData = await revRes.json();
      const demData = await demRes.json();

      if (revData.predicted_value) {
        setCustomPrediction({
          ...revData,
          demand_level: demData.predicted_demand
        });
      }
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setIsRunningPrediction(false);
    }
  };

  // Prepare chart data
  const topCountriesData = forecast
    ? Object.entries(forecast.top_countries).map(([country, value]) => ({
        country: country.toUpperCase(),
        predicted: Math.round(value),
      }))
    : [];

  const topProductsData = forecast
    ? Object.entries(forecast.top_products).map(([product, value]) => ({
        product: product.replace(/\b\w/g, (l) => l.toUpperCase()),
        predicted: Math.round(value),
      }))
    : [];

  const monthlyTrendData = forecast
    ? forecast.monthly_trend.map((d) => ({
        label: `${d.year}-M${String(d.month).padStart(2, "0")}`,
        total: Math.round(d.total),
      }))
    : [];

  if (loading)
    return <div className="admin-loading">Initializing ML Prediction Engine...</div>;

  return (
    <div className="admin-content-wrapper">
      {/* HEADER */}
      <header className="dashboard-control-bar" style={{ 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        gap: '24px'
      }}>
        <div className="control-info">
          <h1 style={{ fontSize: isMobile ? '2rem' : '3.5rem' }}>Export AI Insights</h1>
          <p style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              ML Engine:{" "}
              <span style={{ color: error ? "var(--admin-danger)" : "var(--admin-success)" }}>
                {error ? "Offline" : "Online"}
              </span>
            </div>
            {forecast && (
              <span style={{ opacity: 0.6, fontSize: "0.7rem", textTransform: 'uppercase', letterSpacing: '1px' }}>
                Model: {forecast.model} · Accuracy: {(forecast.accuracy_r2 * 100).toFixed(1)}%
              </span>
            )}
          </p>
        </div>
        <div className="control-actions" style={{ width: isMobile ? '100%' : 'auto' }}>
          <button className="sync-btn" onClick={fetchForecast} style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
            <RefreshCw size={14} /> <span>Refresh Forecast</span>
          </button>
        </div>
      </header>

      {error ? (
        <div style={{ padding: "60px", textAlign: "center", opacity: 0.7 }}>
          <AlertCircle size={48} style={{ display: "block", margin: "0 auto 16px" }} />
          <p style={{ marginBottom: "16px" }}>{error}</p>
          <code style={{ background: "#f8f9fa", padding: "8px 16px", fontFamily: "monospace", fontSize: "0.85rem" }}>
            uvicorn ml_service.main:app --port 8000 --reload
          </code>
        </div>
      ) : (
        <>
          {/* KPI GRID */}
          <div className="admin-kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header"><BrainCircuit size={18} /></div>
              <div className="kpi-value">{forecast?.months_forecasted}</div>
              <div className="kpi-label">Months Forecasted</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header"><Globe size={18} color="var(--admin-accent)" /></div>
              <div className="kpi-value">{Object.keys(forecast?.top_countries || {}).length}</div>
              <div className="kpi-label">Countries Analyzed</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header"><Package size={18} color="var(--admin-warning)" /></div>
              <div className="kpi-value">{Object.keys(forecast?.top_products || {}).length}</div>
              <div className="kpi-label">Product Categories</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header"><TrendingUp size={18} color="var(--admin-success)" /></div>
              <div className="kpi-value">{(forecast?.accuracy_r2 * 100).toFixed(0)}%</div>
              <div className="kpi-label">Model Accuracy</div>
            </div>
          </div>

          {/* CHARTS ROW 1 */}
          <div className="charts-grid" style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
            {/* Top Countries Forecast */}
            <div className="chart-card">
              <div className="card-actions">
                <h3>Country Demand Forecast (6 mo)</h3>
                <div className="insights-badge" style={{ fontSize: "0.65rem", padding: "4px 10px" }}>
                  <Cpu size={10} style={{ marginRight: "4px" }} /> ML Powered
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topCountriesData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
                  <XAxis dataKey="country" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, "Predicted Value"]} />
                  <Bar dataKey="predicted" fill="#2e2e2c" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Product Category Forecast */}
            <div className="chart-card">
              <div className="card-actions">
                <h3>Product Category Demand</h3>
                <div className="insights-badge" style={{ fontSize: "0.65rem", padding: "4px 10px" }}>
                  <Cpu size={10} style={{ marginRight: "4px" }} /> ML Powered
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" horizontal={false} />
                  <XAxis type="number" fontSize={10} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <YAxis type="category" dataKey="product" fontSize={10} width={90} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, "Predicted"]} />
                  <Bar dataKey="predicted" fill="#e67e22" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MONTHLY TREND */}
          <div className="charts-grid" style={{ gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr" }}>
            <div className="chart-card">
              <div className="card-actions">
                <h3>Monthly Export Forecast Trend</h3>
                <div className="insights-badge" style={{ fontSize: "0.65rem", padding: "4px 10px" }}>
                  <Cpu size={10} style={{ marginRight: "4px" }} /> ML Powered
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
                  <XAxis dataKey="label" fontSize={10} />
                  <YAxis fontSize={10} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, "Predicted Value"]} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2e2e2c"
                    strokeWidth={2.5}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* CUSTOM PREDICTION PANEL */}
            <div className="chart-card" style={{ borderLeft: isMobile ? "none" : "2px solid var(--admin-accent)", borderTop: isMobile ? "2px solid var(--admin-accent)" : "none" }}>
              <div className="card-actions">
                <h3>Custom Prediction</h3>
                <Target size={16} />
              </div>
              <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.6 }}>Product Type</label>
                <select
                  value={form.product_type}
                  onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                  style={{ padding: "8px", border: "1px solid var(--admin-border)", fontSize: "0.85rem" }}
                >
                  <option value="knitted wear">Knitted Wear</option>
                  <option value="sportswear">Sportswear</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="nightwear">Nightwear</option>
                </select>

                <label style={{ fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.6 }}>Destination Country</label>
                <select
                  value={form.destination_country}
                  onChange={(e) => setForm({ ...form, destination_country: e.target.value })}
                  style={{ padding: "8px", border: "1px solid var(--admin-border)", fontSize: "0.85rem" }}
                >
                  {["usa", "japan", "france", "uae", "south korea", "qatar", "new zealand"].map((c) => (
                    <option key={c} value={c}>{c.toUpperCase()}</option>
                  ))}
                </select>

                <label style={{ fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.6 }}>Order Quantity (units)</label>
                <input
                  type="number"
                  value={form.order_quantity}
                  onChange={(e) => setForm({ ...form, order_quantity: parseInt(e.target.value) })}
                  style={{ padding: "8px", border: "1px solid var(--admin-border)", fontSize: "0.85rem" }}
                />

                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.75rem", opacity: 0.6 }}>Month</label>
                    <input type="number" min="1" max="12" value={form.month}
                      onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--admin-border)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.75rem", opacity: 0.6 }}>Year</label>
                    <input type="number" value={form.year}
                      onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                      style={{ width: "100%", padding: "8px", border: "1px solid var(--admin-border)" }} />
                  </div>
                </div>

                <button
                  onClick={runCustomPrediction}
                  disabled={isRunningPrediction}
                  className="sync-btn"
                  style={{ marginTop: "4px" }}
                >
                  {isRunningPrediction ? "Predicting..." : "Run Prediction"}
                </button>

                {customPrediction && (
                  <div style={{ 
                    marginTop: "20px", 
                    paddingTop: "20px", 
                    borderTop: "1px solid var(--admin-border)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.5, marginBottom: "8px", letterSpacing: "0.05em" }}>
                        Revenue Forecast (INR)
                      </div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "serif", color: "var(--admin-primary)" }}>
                        ₹{customPrediction.predicted_value.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.5, marginBottom: "8px", letterSpacing: "0.05em" }}>
                        Market Demand
                      </div>
                      <div style={{ 
                        fontSize: "1.5rem", 
                        fontWeight: 700, 
                        fontFamily: "serif",
                        color: 
                          customPrediction.demand_level === "High" ? "#2b8a3e" : 
                          customPrediction.demand_level === "Medium" ? "#e67e22" : "#e03131"
                      }}>
                        {customPrediction.demand_level?.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ gridColumn: "1 / span 2", marginTop: "8px" }}>
                       <div style={{ fontSize: "0.6rem", opacity: 0.4, textTransform: "uppercase" }}>
                        Engine: {customPrediction.model_used}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* INTELLIGENCE REPORT — Premium Dashboard Style */}
          <section className="dashboard-section" style={{ marginTop: "60px" }}>
            <div style={{ 
              background: "white", 
              borderRadius: "0", 
              border: "1px solid #000",
              boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
              overflow: "hidden"
            }}>
              {/* Report Header */}
              <div style={{ 
                background: "#000", 
                padding: isMobile ? "24px" : "32px 40px", 
                color: "#fff", 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between", 
                alignItems: isMobile ? 'flex-start' : "center",
                gap: isMobile ? '20px' : '0'
              }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                  <Cpu size={isMobile ? 24 : 32} style={{ color: "var(--admin-success)" }} />
                  <div>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.6, marginBottom: "4px" }}>
                      AI INTELLIGENCE REPORT
                    </div>
                    <h2 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontFamily: "serif", margin: 0, letterSpacing: "-0.5px" }}>
                      Strategic Demand Analysis
                    </h2>
                  </div>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : "right", opacity: 0.4 }}>
                  <div style={{ fontSize: "0.6rem", textTransform: "uppercase" }}>System Authorization</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>LEVEL 04 / COMPLIANT</div>
                </div>
              </div>

              <div style={{ padding: isMobile ? "20px" : "40px" }}>
                {/* Internal Intelligence KPIs (Mirroring Admin Dashboard style) */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: "16px", 
                  marginBottom: "40px" 
                }}>
                  <div style={{ background: "#fff", padding: "20px", border: "1px solid #eee" }}>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#999", marginBottom: "8px", letterSpacing: "1px" }}>6mo Projected Turnover</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "serif" }}>
                      ₹{forecast?.detailed_forecast?.reduce((acc, curr) => acc + curr.predicted_value, 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ background: "#fff", padding: "20px", border: "1px solid #eee" }}>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#999", marginBottom: "8px", letterSpacing: "1px" }}>High Heat Markets</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "serif", color: "var(--admin-warning)" }}>
                      {forecast?.detailed_forecast?.filter(f => f.predicted_demand === 'High').length} / {forecast?.detailed_forecast?.length}
                    </div>
                  </div>
                  <div style={{ background: "#fff", padding: "20px", border: "1px solid #eee" }}>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#999", marginBottom: "8px", letterSpacing: "1px" }}>Velocity Accuracy</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "serif", color: "var(--admin-success)" }}>
                      {(forecast?.accuracy_r2 * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div style={{ 
                  background: "#f8f9fa", 
                  padding: "24px 30px", 
                  borderLeft: "4px solid #000", 
                  marginBottom: "40px" 
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#666" }}>
                    <BrainCircuit size={14} /> Executive Narrative
                  </div>
                  <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#333", margin: 0 }}>
                    Synthesizing historical shipment velocity and multi-variate market signals. 
                    This report projects export capacity and demand heatmaps for the next 180-day cycle.
                  </p>
                </div>

                {/* Analysis Nodes */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px", marginBottom: "48px" }}>
                  {/* Revenue Node */}
                  <div style={{ background: "#ffffff", padding: "24px", border: "1px solid #eeeeee", transition: "all 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ width: "32px", height: "32px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                        <TrendingUp size={16} color="#166534" />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Financial Forecast Node</h4>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: "1.6", marginBottom: "20px" }}>
                      Utilizing high-precision Linear Regression to quantify absolute revenue flow. 
                      Monitors unit-price volatility across international nodes.
                    </p>
                    <div style={{ 
                      display: "flex", 
                      flexDirection: isMobile ? "column" : "row", 
                      gap: isMobile ? "12px" : "20px" 
                    }}>
                      <div>
                        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999" }}>Confidence Score</div>
                        <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700, color: "var(--admin-success)" }}>
                          {(forecast?.accuracy_r2 * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999" }}>Currency</div>
                        <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700 }}>INR</div>
                      </div>
                    </div>
                  </div>

                  {/* Demand Node */}
                  <div style={{ background: "#ffffff", padding: "24px", border: "1px solid #eeeeee", transition: "all 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ width: "32px", height: "32px", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                        <Target size={16} color="#991b1b" />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Market Heat Classifier</h4>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: "1.6", marginBottom: "20px" }}>
                      Decision Tree heuristic engine mapping quantitative volume to strategic urgency. 
                      Identifies saturation levels and shipping lane priority.
                    </p>
                    <div style={{ 
                      display: "flex", 
                      flexDirection: isMobile ? "column" : "row", 
                      gap: isMobile ? "12px" : "20px" 
                    }}>
                      <div>
                        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999" }}>Status</div>
                        <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700, color: "var(--admin-accent)" }}>OPTIMIZED</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999" }}>Node Type</div>
                        <div style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700 }}>CLASSIFIER</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intelligence Feed */}
                <div style={{ marginTop: "60px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ height: "1px", background: "#eee", flex: 1 }}></div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "3px", color: "#999" }}>
                      STRATEGIC MARKET INTELLIGENCE
                    </div>
                    <div style={{ height: "1px", background: "#eee", flex: 1 }}></div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                    {forecast?.detailed_forecast?.map((item, idx) => {
                      const demand = item.predicted_demand;
                      const isHigh = demand === "High";
                      const color = isHigh ? "#166534" : demand === "Medium" ? "#92400e" : "#991b1b";
                      const bg = isHigh ? "#f0fdf4" : demand === "Medium" ? "#fffbeb" : "#fef2f2";
                      
                      return (
                        <div key={idx} style={{ 
                          border: "1px solid #eeeeee", 
                          padding: "24px",
                          position: "relative",
                          transition: "transform 0.2s"
                        }}>
                          {isHigh && (
                            <div style={{ 
                              position: "absolute", top: "12px", right: "12px", 
                              background: "#000", color: "#fff", padding: "2px 8px", 
                              fontSize: "0.6rem", fontWeight: 800, borderRadius: "2px"
                            }}>
                              CRITICAL
                            </div>
                          )}
                          
                          <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "1px", color: "#999", marginBottom: "16px" }}>
                            {item.country} <span style={{ opacity: 0.3 }}>//</span> {item.product}
                          </div>

                          <div style={{ 
                            display: "flex", 
                            flexDirection: isMobile ? "column" : "row",
                            justifyContent: "space-between", 
                            alignItems: isMobile ? "flex-start" : "flex-end",
                            gap: isMobile ? "16px" : "0"
                          }}>
                            <div>
                              <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", marginBottom: "4px" }}>Demand Signal</div>
                              <div style={{ fontSize: isMobile ? "1.3rem" : "1.6rem", fontWeight: 800, color: color, fontFamily: "serif" }}>
                                {demand.toUpperCase()}
                              </div>
                            </div>
                            <div style={{ textAlign: isMobile ? "left" : "right" }}>
                              <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", marginBottom: "4px" }}>Revenue Projection</div>
                              <div style={{ fontSize: isMobile ? "1.1rem" : "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>
                                ₹{Math.round(item.predicted_value).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <div style={{ 
                            marginTop: "20px", padding: "12px", 
                            background: bg, border: `1px solid ${color}20`,
                            fontSize: "0.8rem", color: color, 
                            display: "flex", gap: "10px", alignItems: "flex-start" 
                          }}>
                            <Zap size={14} style={{ marginTop: "2px", flexShrink: 0 }} />
                            <div>
                              {demand === "High" ? "System recommends scaling production for this market node immediately." : 
                               demand === "Medium" ? "Performance is stable. Maintain current inventory allocation patterns." : 
                               "Low priority node. Reduce shipping overhead and optimize for cost."}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "32px", fontSize: "0.7rem", color: "#999", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                    <Activity size={10} style={{ marginRight: "6px" }} />
                    Note: Financial figures represent 6-month aggregate turnover in INR (₹). Training cycle validated via DecisionTree-Node-Export-01.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ExportAIInsights;
