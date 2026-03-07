const Financial = require("../../models/Financial");

const getFinancialAnalytics = async () => {
    // True numeric aggregation from the database
    const financialTrend = await Financial.aggregate([
        { $match: { submissionStatus: 'Approved' } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                revenue: { $sum: "$revenue" },
                expenses: { $sum: "$expenses" },
                profit: { $sum: "$profit" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    return {
        trend: financialTrend.map(f => ({
            date: f._id,
            revenue: f.revenue,
            expenses: f.expenses,
            profit: f.profit,
            margin: f.revenue > 0 ? ((f.profit / f.revenue) * 100).toFixed(1) + "%" : "0%"
        }))
    };
};

module.exports = { getFinancialAnalytics };
