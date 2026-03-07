const Submission = require("../../models/Submission");
const Company = require("../../models/Company");

const getGovernanceAnalytics = async () => {
    const [subStatusDist, compStatusDist, pendingSubs, pendingComps, recentCompCompanies, recentApprovedCompanies] = await Promise.all([
        Submission.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Company.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Submission.find({ status: "Pending" }).populate('managerId', 'username').sort({ createdAt: -1 }),
        Company.find({ status: "PENDING" }).populate('submittedBy', 'username').sort({ createdAt: -1 }),
        Submission.find({ status: { $ne: "Pending" } }).populate('managerId', 'username').sort({ createdAt: -1 }).limit(10),
        Company.find({ status: 'APPROVED' }).populate('submittedBy', 'username').sort({ updatedAt: -1 }).limit(5)
    ]);

    // Normalize Status Distributions
    const statusMap = {};
    [...subStatusDist, ...compStatusDist].forEach(item => {
        let status = item._id;
        // Normalize status strings
        if (status === 'PENDING') status = 'Pending';
        if (status === 'APPROVED') status = 'Approved';
        if (status === 'REJECTED') status = 'Rejected';
        if (status === 'PendingApproval') status = 'Pending';
        
        if (status !== 'DRAFT' && status !== 'Draft') {
            statusMap[status] = (statusMap[status] || 0) + item.count;
        }
    });

    const formattedDist = Object.keys(statusMap).map(name => ({ name, value: statusMap[name] }));

    // Entity Distribution
    const entityDist = await Submission.aggregate([
        { $match: { status: 'Approved' } },
        { $group: { _id: "$entityType", count: { $sum: 1 } } }
    ]);
    const approvedCompCount = await Company.countDocuments({ status: 'APPROVED' });
    if (approvedCompCount > 0) entityDist.push({ _id: 'Company', count: approvedCompCount });

    // Normalized Submission Queue
    const formatSub = (sub) => ({
        _id: sub._id,
        userId: sub.managerId,
        entityType: sub.entityType,
        createdAt: sub.createdAt,
        action: 'Submitted',
        status: sub.status || 'Pending'
    });

    const formatComp = (comp) => ({
        _id: comp._id,
        userId: comp.submittedBy,
        entityType: 'Company',
        createdAt: comp.createdAt,
        action: comp.status === 'PENDING' ? 'Submitted' : comp.status,
        status: comp.status === 'PENDING' ? 'Pending' : (comp.status === 'APPROVED' ? 'Approved' : 'Rejected'),
        isCompany: true
    });

    const queue = [
        ...pendingSubs.map(formatSub),
        ...pendingComps.map(formatComp),
        ...recentCompCompanies.map(formatSub),
        ...recentApprovedCompanies.map(formatComp)
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
        approvalData: {
            statusDist: formattedDist,
            entityDist: entityDist.map(a => ({ name: a._id, value: a.count }))
        },
        unifiedQueue: queue
    };
};

module.exports = { getGovernanceAnalytics };
