const Export = require("../../models/Export");
const RawMaterial = require("../../models/RawMaterial");
const Project = require("../../models/Project");

const getSupplyChainAnalytics = async () => {
    const [materialStock, exportDestinations, exportTrend, buyerContrib] = await Promise.all([
        RawMaterial.aggregate([
            { $match: { submissionStatus: 'Approved' } },
            { $group: { _id: "$materialType", quantity: { $sum: "$quantity" } } }
        ]),
        Export.aggregate([
            { $match: { submissionStatus: 'Approved' } },
            { $group: { _id: "$region", value: { $sum: "$value" } } }
        ]),
        Export.aggregate([
            { $match: { submissionStatus: 'Approved' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    value: { $sum: "$value" }
                }
            },
            { $sort: { "_id": 1 } }
        ]),
        // Data-driven buyer contribution: Sum of all export values per buyer
        Export.aggregate([
            { $match: { submissionStatus: 'Approved' } },
            {
                $lookup: {
                    from: 'buyers',
                    localField: 'buyerId',
                    foreignField: '_id',
                    as: 'buyerInfo'
                }
            },
            { $unwind: '$buyerInfo' },
            { 
                $group: { 
                    _id: '$buyerInfo.name', 
                    totalValue: { $sum: '$value' } 
                } 
            },
            { $sort: { totalValue: -1 } }
        ])
    ]);

    const projectStatusDist = await Project.aggregate([
        { $match: { submissionStatus: 'Approved' } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return {
        supplyChainData: {
            stock: materialStock.map(m => ({ name: m._id, quantity: m.quantity })),
            exports: exportDestinations.map(e => ({ name: e._id, value: e.value })),
            exportTrend: exportTrend.map(t => ({ date: t._id, value: t.value }))
        },
        buyerData: {
            contribution: buyerContrib.map(b => ({ name: b._id, value: b.totalValue }))
        },
        projectData: {
            statusDist: projectStatusDist.map(p => ({ name: p._id, value: p.count }))
        }
    };
};

module.exports = { getSupplyChainAnalytics };
