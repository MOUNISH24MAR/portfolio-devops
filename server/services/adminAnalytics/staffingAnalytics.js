const Employee = require("../../models/Employee");

const getStaffingAnalytics = async () => {
    const [deptStats, staffingTrend] = await Promise.all([
        Employee.aggregate([
            { $match: { submissionStatus: 'Approved' } },
            { $group: { _id: "$department", count: { $sum: 1 } } }
        ]),
        Employee.aggregate([
            { $match: { submissionStatus: 'Approved' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ])
    ]);

    return {
        deptDist: deptStats.map(d => ({ name: d._id, value: d.count })),
        trend: staffingTrend.map(t => ({ date: t._id, count: t.count }))
    };
};

module.exports = { getStaffingAnalytics };
