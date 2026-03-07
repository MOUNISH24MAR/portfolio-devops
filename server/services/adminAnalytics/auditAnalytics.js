const Activity = require("../../models/Activity");

const getAuditAnalytics = async () => {
    const [heatmap, recent] = await Promise.all([
        Activity.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": -1 } },
            { $limit: 30 }
        ]),
        Activity.find()
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .limit(15)
    ]);

    return {
        heatmap: heatmap.map(h => ({ date: h._id, count: h.count })),
        recentActivity: recent.map(act => ({
            _id: act._id,
            entityType: act.entityType,
            action: act.action,
            actionType: act.actionType,
            userId: {
                _id: act.userId?._id,
                username: act.userId?.username
            },
            createdAt: act.createdAt,
            changeSummary: act.changeSummary || act.details
        }))
    };
};

module.exports = { getAuditAnalytics };
