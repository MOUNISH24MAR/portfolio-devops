import { API_BASE_URL } from "../config";
import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Shield,
  BarChart3,
  Layers,
  ShoppingBag,
  DollarSign,
  Activity as ActivityIcon,
  Search,
  ChevronRight,
  Cpu,
  Clock,
  ExternalLink,
  Download,
  X,
  FileText,
  Target,
  Zap,
  ShieldAlert,
  Info,
  CheckCircle2
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import "./admin_css/AdminMaster.css";

const COLORS = ['#2e2e2c', '#5c5c58', '#8c8c88', '#b5b5b1', '#d1d1cd', '#1f1f1d'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [analyzingChart, setAnalyzingChart] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
      if (!res.ok) throw new Error("Synchronization failure with core node.");

      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAnalyzeGraph = async (chartType, data, title, elementId) => {
    try {
      setAnalyzingChart(chartType);
      setIsAnalysisLoading(true);

      // Capture chart snapshot
      let snapshot = null;
      const element = document.getElementById(elementId);
      if (element) {
        // We use onclone to temporarily hide anything we don't want in the snapshot
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 3, // Even higher quality for reports
          logging: false,
          useCORS: true,
          onclone: (clonedDoc) => {
            // Hard hide any buttons or extra UI in the cloned element
            const buttons = clonedDoc.querySelectorAll('.analyze-btn, .card-actions');
            buttons.forEach(btn => btn.style.display = 'none');
          }
        });
        snapshot = canvas.toDataURL("image/png");
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/analyze-graph`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ chartType, data, title })
      });

      if (!res.ok) throw new Error("Intelligence Core unreachable.");
      const result = await res.json();
      setAnalysisResult({ ...result, title, chartType, snapshot });
    } catch (err) {
      console.error(err);
      alert("Analysis failed: " + err.message);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const renderDetailedReport = (text) => {
    if (!text) return null;

    const sectionMapping = {
      'CURRENT_STATUS': { label: 'Current Status', icon: <Target size={18} />, class: 'status' },
      'OBSERVED_TREND': { label: 'Observed Trend', icon: <Zap size={18} />, class: 'trend' },
      'CRITICAL_SIGNALS': { label: 'Critical Signals', icon: <ShieldAlert size={18} />, class: 'critical' },
      'WHY_HAPPENING': { label: 'Why This is Happening', icon: <Info size={18} />, class: 'why' },
      'ADMIN_ACTIONS': { label: 'What the Admin Should Do', icon: <CheckCircle2 size={18} />, class: 'actions' }
    };

    const parts = text.split('SECTION:');
    return parts.map((part, idx) => {
      if (!part.trim()) return null;
      const firstLineBreak = part.indexOf('\n');
      const key = part.substring(0, firstLineBreak).trim();
      const content = part.substring(firstLineBreak).trim();
      const config = sectionMapping[key];

      if (!config) return <p key={idx}>{part}</p>;

      return (
        <div key={idx} className={`analysis-section-block ${config.class}`}>
          <div className="section-block-header">
            {config.icon}
            <h4>{config.label}</h4>
          </div>
          <div className="section-block-content">
            {content.split('\n').map((line, lidx) => (
              <p key={lidx}>{line}</p>
            ))}
          </div>
        </div>
      );
    });
  };

  const downloadAnalysis = (type) => {
    if (!analysisResult) return;

    if (type === 'text') {
      const element = document.createElement("a");
      const file = new Blob([analysisResult.downloadReport], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Analysis_${analysisResult.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (type === 'doc') {
      // Create a rich HTML document for DOC export
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Analysis Report</title></head>
        <body style="font-family: Arial, sans-serif;">
          <h1 style="text-align: center;">ADMINISTRATIVE ANALYSIS REPORT</h1>
          <p><strong>Title:</strong> ${analysisResult.title}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <hr/>
          ${analysisResult.snapshot ? `<h3>Graph Snapshot:</h3><img src="${analysisResult.snapshot}" style="width: 100%; max-width: 600px;" />` : ''}
          <div style="white-space: pre-wrap; margin-top: 20px;">
            ${analysisResult.downloadReport.split('--------------------------------------------------')[1] || analysisResult.downloadReport}
          </div>
        </body>
        </html>
      `;
      const element = document.createElement("a");
      const file = new Blob([htmlContent], { type: 'application/msword' });
      element.href = URL.createObjectURL(file);
      element.download = `Analysis_${analysisResult.title.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (type === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("ADMINISTRATIVE ANALYSIS REPORT", 20, 20);
      doc.setFontSize(12);
      doc.text(`Title: ${analysisResult.title}`, 20, 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 37);
      doc.line(20, 42, 190, 42);

      let yOffset = 50;

      if (analysisResult.snapshot) {
        // Calculate image aspect ratio to fit in PDF
        const imgProps = doc.getImageProperties(analysisResult.snapshot);
        const pdfWidth = doc.internal.pageSize.getWidth() - 40;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(analysisResult.snapshot, 'PNG', 20, yOffset, pdfWidth, pdfHeight);
        yOffset += pdfHeight + 20;
      }

      const reportBody = analysisResult.downloadReport.split('--------------------------------------------------')[1] || analysisResult.downloadReport;
      const splitText = doc.splitTextToSize(reportBody, 170);
      doc.text(splitText, 20, yOffset);
      doc.save(`Analysis_${analysisResult.title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  if (loading) return <div className="admin-loading">Synchronizing with Core Nodes...</div>;
  if (error || !stats) return <div className="admin-error">Alert: {error || "Core Node Offline"}</div>;

  // Responsive chart configuration
  const chartMargins = isMobile
    ? { top: 10, right: 10, left: -20, bottom: 5 }
    : { top: 20, right: 30, left: 0, bottom: 5 };

  const axisFontSize = isMobile ? 10 : 12;
  const legendFontSize = isMobile ? 10 : 12;

  return (
    <div className="admin-content-wrapper">

      {/* HEADER */}
      <header className="dashboard-control-bar">
        <div className="control-info">
          <h1>Universal Intelligence Dashboard</h1>
          <p>Global node status: <span style={{ color: 'var(--admin-success)' }}>Operational</span></p>
        </div>
      </header>

      {/* 1. TOP SUMMARY (KPI CARDS) */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <Users size={isMobile ? 16 : 18} />
            <span style={{ color: 'var(--admin-success)', fontSize: '0.75rem' }}>+4%</span>
          </div>
          <div className="kpi-value">{stats?.kpis?.totalEmployees}</div>
          <div className="kpi-label">Staff Strength</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><Database size={isMobile ? 16 : 18} /></div>
          <div className="kpi-value">{stats?.kpis?.activeProjects}</div>
          <div className="kpi-label">Active Deployments</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><AlertCircle size={isMobile ? 16 : 18} color="var(--admin-warning)" /></div>
          <div className="kpi-value">{stats?.kpis?.pendingVerifications}</div>
          <div className="kpi-label">Pending Verifications</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><ActivityIcon size={isMobile ? 16 : 18} color="var(--admin-accent)" /></div>
          <div className="kpi-value">₹{stats?.kpis?.totalExportsValue?.toLocaleString('en-IN')}</div>
          <div className="kpi-label">Export Valuation</div>
        </div>
      </div>

      {/* 2. GOVERNANCE & APPROVALS (DONUT) */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Governance & Submission Protocol</h2>
          <p>Verification distribution across the management hierarchy.</p>
        </div>
        <div className="charts-grid" style={!isMobile ? { gridTemplateColumns: 'minmax(300px, 1fr) 2fr' } : {}}>
          <div className="chart-card">
            <div className="card-actions">
              <h3>Submission Status Distribution</h3>
              <button
                className="analyze-btn"
                onClick={() => handleAnalyzeGraph('submissions', stats?.approvalData?.statusDist || [], 'Submission Status Distribution', 'graph-submissions')}
                disabled={isAnalysisLoading}
              >
                <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'submissions' ? 'Processing...' : 'View Analysis'}
              </button>
            </div>
            <div id="graph-submissions" style={{ width: '100%', height: isMobile ? 240 : 260, minHeight: isMobile ? 240 : 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.approvalData?.statusDist || []}
                    innerRadius={isMobile ? 50 : 60}
                    outerRadius={isMobile ? 70 : 80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats?.approvalData?.statusDist?.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: axisFontSize }} />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: legendFontSize }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Domain</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Protocol</th>
                </tr>
              </thead>
              <tbody>
                {stats?.auditData?.recent?.filter(a => a.action === 'Submitted').slice(0, 4).map(sub => (
                  <tr key={sub._id}>
                    <td>{sub.userId?.username}</td>
                    <td>{sub.entityType}</td>
                    <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${sub.status?.toLowerCase() || 'pending'}`}>
                        {sub.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      {sub.status !== 'Approved' && (
                        <button
                          className="view-btn"
                          onClick={() => window.location.href = sub.isCompany ? '/admin/company-approvals' : '/admin/approvals'}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!stats?.auditData?.recent?.some(a => a.action === 'Submitted') && (
                  <tr>
                    <td colSpan="5" align="center" style={{ padding: '40px' }}>
                      Queue empty. All nodes synchronized.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS PERFORMANCE (LINE CHARTS) */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Strategic Performance Trend</h2>
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="card-actions">
              <h3>Revenue vs Expenses (USD)</h3>
              <button
                className="analyze-btn"
                onClick={() => handleAnalyzeGraph('financial', stats?.financialData?.trend || [], 'Revenue vs Expenses', 'graph-financial')}
                disabled={isAnalysisLoading}
              >
                <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'financial' ? 'Processing...' : 'View Analysis'}
              </button>
            </div>
            <div id="graph-financial" style={{ width: '100%', height: isMobile ? 250 : 320, minHeight: isMobile ? 250 : 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.financialData?.trend || []} margin={chartMargins}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--admin-text-secondary)"
                    fontSize={axisFontSize}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    stroke="var(--admin-text-secondary)"
                    fontSize={axisFontSize}
                  />
                  <Tooltip contentStyle={{ fontSize: axisFontSize }} />
                  <Legend wrapperStyle={{ fontSize: legendFontSize }} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2e2e2c"
                    strokeWidth={isMobile ? 1.5 : 2}
                    dot={{ r: isMobile ? 3 : 4 }}
                    activeDot={{ r: isMobile ? 5 : 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#c92a2a"
                    strokeWidth={isMobile ? 1.5 : 2}
                    strokeDasharray="5 5"
                    dot={{ r: isMobile ? 2 : 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <div className="card-actions">
              <h3>Export Valuation Growth</h3>
              <button
                className="analyze-btn"
                onClick={() => handleAnalyzeGraph('exports', stats?.supplyChainData?.exportTrend || [], 'Export Valuation Growth', 'graph-exports')}
                disabled={isAnalysisLoading}
              >
                <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'exports' ? 'Processing...' : 'View Analysis'}
              </button>
            </div>
            <div id="graph-exports" style={{ width: '100%', height: isMobile ? 250 : 320, minHeight: isMobile ? 250 : 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.supplyChainData?.exportTrend || []} margin={chartMargins}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--admin-text-secondary)"
                    fontSize={axisFontSize}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    stroke="var(--admin-text-secondary)"
                    fontSize={axisFontSize}
                  />
                  <Tooltip contentStyle={{ fontSize: axisFontSize }} />
                  <Line
                    type="stepAfter"
                    dataKey="value"
                    stroke="var(--admin-success)"
                    strokeWidth={isMobile ? 2 : 3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STAFFING & SUPPLY CHAIN (BARS) */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Operational Capacity</h2>
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="card-actions">
              <h3>Human Capital by Department</h3>
              <button
                className="analyze-btn"
                onClick={() => handleAnalyzeGraph('staffing', stats?.staffingData?.deptDist || [], 'Staffing Distribution', 'graph-workforce')}
                disabled={isAnalysisLoading}
              >
                <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'staffing' ? 'Processing...' : 'View Analysis'}
              </button>
            </div>
            <div id="graph-workforce" style={{ width: '100%', height: isMobile ? 250 : 300, minHeight: isMobile ? 250 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.staffingData?.deptDist || []} margin={chartMargins}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--admin-text-secondary)"
                    fontSize={axisFontSize}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 70 : 30}
                  />
                  <YAxis
                    stroke="var(--admin-text-secondary)"
                    fontSize={axisFontSize}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ fontSize: axisFontSize }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--admin-accent)"
                    radius={[0, 0, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <div className="card-actions">
              <h3>Raw Material Critical Inventory</h3>
              <button
                className="analyze-btn"
                onClick={() => handleAnalyzeGraph('inventory', stats?.supplyChainData?.stock || [], 'Inventory Status', 'graph-inventory')}
                disabled={isAnalysisLoading}
              >
                <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'inventory' ? 'Processing...' : 'View Analysis'}
              </button>
            </div>
            <div id="graph-inventory" style={{ width: '100%', height: isMobile ? 250 : 300, minHeight: isMobile ? 250 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.supplyChainData?.stock || []}
                  layout="vertical"
                  margin={isMobile
                    ? { top: 10, right: 20, left: 10, bottom: 5 }
                    : { top: 20, right: 30, left: 20, bottom: 5 }
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-subtle)"
                    horizontal={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="var(--admin-text-secondary)"
                    fontSize={isMobile ? 9 : 11}
                    width={isMobile ? 80 : 120}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#5c5c58"
                    radius={[0, 4, 4, 0]}
                  />
                  <Tooltip contentStyle={{ fontSize: axisFontSize }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BUYERS & DESTINATIONS (PIE/DONUT) */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Global Connectivity</h2>
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="card-actions">
              <h3>Regional Export Distribution</h3>
              <button
                className="analyze-btn"
                onClick={() => handleAnalyzeGraph('regions', stats?.supplyChainData?.exports || [], 'Regional Export distribution', 'graph-regions')}
                disabled={isAnalysisLoading}
              >
                <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'regions' ? 'Processing...' : 'View Analysis'}
              </button>
            </div>
            <div id="graph-regions" style={{ width: '100%', height: isMobile ? 250 : 300, minHeight: isMobile ? 250 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.supplyChainData?.exports || []}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats?.supplyChainData?.exports?.map((e, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: axisFontSize }} />
                  <Legend
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    layout={isMobile ? "horizontal" : "vertical"}
                    wrapperStyle={{ fontSize: legendFontSize }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <div className="card-actions">
              <h3>Major Buyer Contribution</h3>
              <button
                className="analyze-btn"
                onClick={() => handleAnalyzeGraph('buyers', stats?.buyerData?.contribution || [], 'Buyer Contribution Analysis', 'graph-buyers')}
                disabled={isAnalysisLoading}
              >
                <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'buyers' ? 'Processing...' : 'View Analysis'}
              </button>
            </div>
            <div id="graph-buyers" style={{ width: '100%', height: isMobile ? 250 : 300, minHeight: isMobile ? 250 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.buyerData?.contribution || []}
                    innerRadius={isMobile ? 50 : 60}
                    outerRadius={isMobile ? 75 : 90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats?.buyerData?.contribution?.map((e, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: axisFontSize }} />
                  <Legend
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    layout={isMobile ? "horizontal" : "vertical"}
                    wrapperStyle={{ fontSize: legendFontSize }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEURAL ACTIVITY HEATMAP */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Neural Node Audit</h2>
        </div>
        <div className="chart-card" style={{ padding: isMobile ? '20px' : '40px' }}>
          <div className="card-actions">
            <h3>System Transaction Heatmap (Last 30 Cycles)</h3>
            <button
              className="analyze-btn"
              onClick={() => handleAnalyzeGraph('heatmap', stats?.auditData?.heatmap || [], 'System Load Analysis', 'graph-heatmap')}
              disabled={isAnalysisLoading}
            >
              <Cpu size={14} /> {isAnalysisLoading && analyzingChart === 'heatmap' ? 'Processing...' : 'View Analysis'}
            </button>
          </div>
          <div id="graph-heatmap" style={{ width: '100%', height: isMobile ? 150 : 120, minHeight: isMobile ? 150 : 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[... (stats?.auditData?.heatmap || [])].reverse()}
                margin={chartMargins}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-subtle)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  fontSize={isMobile ? 8 : 10}
                  stroke="var(--text-tertiary)"
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 50 : 30}
                />
                <Tooltip contentStyle={{ fontSize: axisFontSize }} />
                <Area
                  type="step"
                  dataKey="count"
                  stroke="#2b8a3e"
                  fill="#2b8a3e"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-table-container" style={{ marginTop: isMobile ? '24px' : '40px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Action</th>
                  <th>Node</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats?.auditData?.recent?.slice(0, 8).map(act => (
                  <tr key={act._id}>
                    <td style={{ fontWeight: 600 }}>{act.entityType}</td>
                    <td>
                      <span style={{
                        color: act.action.includes('Approved')
                          ? 'var(--admin-success)'
                          : act.action.includes('Rejected')
                            ? 'var(--admin-danger)'
                            : 'var(--admin-accent)',
                        fontWeight: 700
                      }}>
                        {act.action}
                      </span>
                    </td>
                    <td>{act.userId?.username}</td>
                    <td>{new Date(act.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>



      {/* 8. ANALYSIS MODAL / PANEL */}
      {analysisResult && (
        <div className="analysis-overlay">
          <div className="analysis-card anime-fade-in">
            <div className="analysis-header">
              <div className="title-block">
                <Cpu className="ai-icon" size={24} />
                <div>
                  <h2>Intelligence Report</h2>
                  <p>{analysisResult.title}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setAnalysisResult(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="analysis-content">
              {analysisResult.snapshot && (
                <div className="analysis-snapshot-section">
                  <h3><BarChart3 size={16} /> Reference Node Data</h3>
                  <div className="snapshot-container">
                    <img src={analysisResult.snapshot} alt="Graph Snapshot" />
                  </div>
                </div>
              )}

              <div className="summary-section">
                <h3><ActivityIcon size={16} /> Key Indicators</h3>
                <div className="summary-bullets">
                  {analysisResult?.summary?.map((s, i) => (
                    <div key={i} className="summary-item">
                      <ChevronRight size={14} />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detailed-section">
                {renderDetailedReport(analysisResult.detailedReport)}
              </div>

              <div className="download-actions">
                <p>Export insights to external node:</p>
                <div className="btn-group">
                  <button onClick={() => downloadAnalysis('pdf')} className="download-btn pdf">
                    <Download size={14} /> PDF
                  </button>
                  <button onClick={() => downloadAnalysis('doc')} className="download-btn doc">
                    <Download size={14} /> DOC
                  </button>
                  <button onClick={() => downloadAnalysis('text')} className="download-btn txt">
                    <Download size={14} /> Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;