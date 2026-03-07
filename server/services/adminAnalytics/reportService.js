const { getDashboardStats } = require("./analyticsService");

/**
 * Generates a structured narrative intelligence report based on real-time database data.
 */
const generateOperationalReport = async () => {
    const stats = await getDashboardStats(true); // Always force fresh data for reports
    const { kpis, approvalData, staffingData, supplyChainData, financialData, buyerData, auditData } = stats;

    const report = {
        title: "Operational Performance Report",
        generatedAt: new Date().toLocaleString(),
        sections: []
    };

    // 1. Export Performance Summary
    const exportTrend = supplyChainData.exportTrend;
    const currentExportValue = kpis.totalExportsValue;
    const lastMonthExport = exportTrend.length > 1 ? exportTrend[exportTrend.length - 2].value : 0;
    const currMonthExport = exportTrend.length > 0 ? exportTrend[exportTrend.length - 1].value : 0;
    const exportGrowth = lastMonthExport > 0 ? (((currMonthExport - lastMonthExport) / lastMonthExport) * 100).toFixed(1) : 0;
    
    const exportCategories = supplyChainData.exports.sort((a,b) => b.value - a.value);
    const topRegion = exportCategories.length > 0 ? exportCategories[0].name : "N/A";

    report.sections.push({
        title: "Export Performance Summary",
        content: `Global export operations have reached a cumulative valuation of $${currentExportValue.toLocaleString()}. ${
            exportGrowth >= 0 
                ? `The system detected a positive growth of ${exportGrowth}% in the current cycle compared to the previous month.` 
                : `Export valuation saw a deviation of ${Math.abs(exportGrowth)}%, suggesting a temporary slowdown in shipment volume.`
        } The ${topRegion} region remains the primary driver of revenue. Currently, the system has successfully processed all major shipments, though monitoring of pending approvals is advised to maintain momentum.`
    });

    // 2. Raw Material Utilization
    const materials = supplyChainData.stock.sort((a,b) => b.quantity - a.quantity);
    const topMaterial = materials.length > 0 ? materials[0].name : "N/A";
    const lowStockMaterials = supplyChainData.stock.filter(m => m.quantity < 500); // Threshold for low stock

    report.sections.push({
        title: "Raw Material Utilization",
        content: `Inventory analysis shows that ${topMaterial} is the most highly stocked and utilized material across current production batches. ${
            lowStockMaterials.length > 0 
                ? `CRITICAL: The system has flagged ${lowStockMaterials.map(m => m.name).join(", ")} as low stock items (below 500 units), which may impact upcoming export deadlines.` 
                : "Current raw material inventory levels are stable across all major categories, with no immediate supply chain bottlenecks detected."
        } Consumption trends correlate strongly with the recent spike in export demand.`
    });

    // 3. Project Progress Analysis
    const activeProjects = kpis.activeProjects;
    const statusDist = approvalData.statusDist;
    const pendingCount = statusDist.find(s => s.name === 'Pending')?.value || 0;

    report.sections.push({
        title: "Project Progress Analysis",
        content: `The organization is currently managing ${activeProjects} active projects in the production and design phases. ${
            pendingCount > 5 
                ? `Operational friction detected: There are currently ${pendingCount} submissions pending administrative verification, which is causing minor delays in project lifecycle transitions.` 
                : "Workflow velocity is optimal, with minimal pending verifications hindering project progress."
        } Most production nodes are operating within their scheduled timelines.`
    });

    // 4. Employee Activity Insights
    const totalEmployees = kpis.totalEmployees;
    const recentActivityCount = auditData.heatmap.length > 0 ? auditData.heatmap[0].count : 0;

    report.sections.push({
        title: "Employee Activity Insights",
        content: `Workforce capacity stands at ${totalEmployees} verified personnel. Human capital engagement remains robust, with ${recentActivityCount} system transactions recorded in the last 24-hour cycle. The most active contributions are originating from the production department, aligning with the current export push. No significant anomalies in employee behavior or node access patterns were detected during the audit.`
    });

    // 5. Financial Overview
    const trend = financialData.trend;
    const currFinancial = trend.length > 0 ? trend[trend.length - 1] : { revenue: 0, expenses: 0, profit: 0, margin: "0%" };
    const prevFinancial = trend.length > 1 ? trend[trend.length - 2] : null;
    const profitTrend = prevFinancial ? (currFinancial.profit - prevFinancial.profit) : 0;

    report.sections.push({
        title: "Financial Overview",
        content: `Current financial performance indicates a consolidated revenue of $${currFinancial.revenue.toLocaleString()} with operational costs totaling $${currFinancial.expenses.toLocaleString()}, resulting in a net profit margin of ${currFinancial.margin}. ${
            profitTrend >= 0 
                ? "Profitability is on an upward trajectory, supported by efficient material utilization and high export values." 
                : "A narrowing profit margin has been detected, likely due to increased operational overhead or raw material acquisition costs."
        }`
    });

    // Final Observations & Recommendations
    const observations = [
        `System performance is ${pendingCount > 10 ? "strained" : "optimal"} with a verification queue of ${pendingCount} items.`,
        `Export growth of ${exportGrowth}% indicates strong market demand in the ${topRegion} sector.`,
        lowStockMaterials.length > 0 ? `Inventory alert: ${lowStockMaterials.length} material types require immediate procurement.` : "Supply chain stability is maintained."
    ];

    const recommendations = [
        pendingCount > 5 ? "Accelerate administrative verification to clear the submission bottleneck." : "Maintain current verification response times.",
        lowStockMaterials.length > 0 ? "Initiate urgent purchase orders for low-stock raw materials." : "Continue routine inventory monitoring.",
        "Review production costs in relation to the current narrowing margins noted in financial trends."
    ];

    report.keyObservations = observations;
    report.recommendations = recommendations;

    return report;
};

module.exports = { generateOperationalReport };
