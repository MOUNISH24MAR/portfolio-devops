const { getKPIs } = require("./kpiService");
const { getStaffingAnalytics } = require("./staffingAnalytics");
const { getFinancialAnalytics } = require("./financialAnalytics");
const { getSupplyChainAnalytics } = require("./exportAnalytics");
const { getGovernanceAnalytics } = require("./governanceAnalytics");
const { getAuditAnalytics } = require("./auditAnalytics");

// Simple in-memory cache
let cache = {
    data: null,
    timestamp: 0
};
const CACHE_DURATION = 60 * 1000; // 60 seconds

const getDashboardStats = async (forceRefresh = false) => {
    const now = Date.now();
    
    if (!forceRefresh && cache.data && (now - cache.timestamp) < CACHE_DURATION) {
        console.log("Returning cached dashboard stats");
        return cache.data;
    }

    console.log("Fetching fresh dashboard stats...");
    
    const [
        kpis,
        staffing,
        financial,
        supplyChain,
        governance,
        audit
    ] = await Promise.all([
        getKPIs(),
        getStaffingAnalytics(),
        getFinancialAnalytics(),
        getSupplyChainAnalytics(),
        getGovernanceAnalytics(),
        getAuditAnalytics()
    ]);

    const dashboardStats = {
        kpis,
        approvalData: governance.approvalData,
        staffingData: staffing,
        projectData: supplyChain.projectData,
        supplyChainData: supplyChain.supplyChainData,
        financialData: financial,
        buyerData: supplyChain.buyerData,
        auditData: {
            heatmap: audit.heatmap,
            recent: [...governance.unifiedQueue, ...audit.recentActivity].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        }
    };

    cache = {
        data: dashboardStats,
        timestamp: now
    };

    return dashboardStats;
};

module.exports = { getDashboardStats };
