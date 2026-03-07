const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Export = require('../models/Export');
const RawMaterial = require('../models/RawMaterial');
const Financial = require('../models/Financial');
const Submission = require('../models/Submission');
const Approval = require('../models/Approval');
const Media = require('../models/Media');
const Update = require('../models/Update');
const Buyer = require('../models/Buyer');

const DB_URI = "mongodb://127.0.0.1:27017/garment-portfolio";

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log("MongoDB Connected for Seeding...");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const departments = ['Production', 'Quality Control', 'Design', 'Logistics', 'Administration'];
const regions = ['European Union', 'North America', 'Middle East', 'East Asia', 'Oceania'];
const countries = {
    'European Union': ['Germany', 'France', 'Italy', 'Netherlands'],
    'North America': ['USA', 'Canada'],
    'Middle East': ['UAE', 'Saudi Arabia', 'Qatar'],
    'East Asia': ['Japan', 'South Korea'],
    'Oceania': ['Australia']
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
    await connectDB();

    // Clear existing data
    console.log("Cleaning Database...");
    await User.deleteMany({});
    await Activity.deleteMany({});
    await Company.deleteMany({});
    await Employee.deleteMany({});
    await Project.deleteMany({});
    await Export.deleteMany({});
    await RawMaterial.deleteMany({});
    await Financial.deleteMany({});
    await Submission.deleteMany({});
    await Approval.deleteMany({});
    await Media.deleteMany({});
    await Update.deleteMany({});
    await Buyer.deleteMany({});

    // 1. Create Users
    console.log("Creating Users...");
    const admin = await User.create({
        username: "admin",
        password: "adminpassword",
        role: "ADMIN",
        name: "Supreme Administrator"
    });

    const managers = [];
    const managerNames = ["John Operations", "Sarah Design", "Mike Logistics", "Elena Finance"];
    for (let name of managerNames) {
        const mgr = await User.create({
            username: name.split(' ')[0].toLowerCase(),
            password: "managerpassword",
            role: "MANAGER",
            name: name
        });
        managers.push(mgr);
    }

    // 2. Create Company
    console.log("Creating Company Profile...");
    await Company.create({
        name: "VR Fashions",
        description: "Established in 2016 by Mohan Raj and Renugadevi, VR Fashions is a 100% export-oriented factory based in Tirupur. We specialize in high-quality knitted garments including T-shirts, tops, sweatshirts, pajama sets, and nightwear for men, ladies, and kids, producing 50,000 pieces per month.",
        location: "85, 86, Vivekanandha Nagar, Kovilvali, Dharapuram Road, Tirupur-641606",
        establishedYear: 2016,
        status: 'APPROVED',
        version: 1,
        submittedBy: admin._id,
        approvedBy: admin._id,
        approvedAt: new Date()
    });    // 4. Seeding Buyers
    console.log("Generating Buyers...");
    const realBuyers = [
        { name: "SAHINLER", region: "European Union", country: "France" },
        { name: "VRF CORP", region: "North America", country: "USA" },
        { name: "TOKYO RETAIL", region: "East Asia", country: "Japan" }
    ];
    const buyerDocs = [];
    for (let buyer of realBuyers) {
        const b = await Buyer.create({
            name: buyer.name,
            region: buyer.region,
            country: buyer.country,
            industry: "Importer / Retailer",
            relationshipDuration: "Multiple years",
            orderFrequency: "High",
            managerId: managers[0]._id,
            submissionStatus: 'Approved'
        });
        buyerDocs.push(b);
    }

    // 3. Generate Time-Series Data (Oct 2024 to Dec 2025)
    console.log("Generating 15 months of operational data...");
    const months = [];
    for (let i = 15; i >= 0; i--) {
        const d = new Date(2025, 12 - i, 1);
        months.push(d);
    }

    for (const d of months) {
        const year = d.getFullYear();
        const monthIndex = d.getMonth();
        const manager = managers[getRandomInt(0, managers.length - 1)];
        const buyer = buyerDocs[getRandomInt(0, buyerDocs.length - 1)];

        // --- EXPORTS ---
        const preferredRegions = ['European Union', 'North America'];
        const region = buyer.region;
        const country = buyer.country;
        let seasonalMultiplier = (monthIndex >= 9) ? 1.4 : (monthIndex <= 2 ? 1.2 : 0.9);
        const volume = Math.floor(getRandomInt(5000, 15000) * seasonalMultiplier);
        const value = Math.floor(volume * getRandomInt(8, 12));

        await Export.create({
            region, country, category: 'Knitted Wear', volume, value, year,
            buyerId: buyer._id,
            managerId: manager._id, submissionStatus: 'Approved', createdAt: d
        });

        // --- FINANCIALS ---
        const revenue = value + getRandomInt(5000, 20000);
        let expenseDeviancy = (monthIndex === 10 || monthIndex === 5) ? 1.05 : 0.8;
        const expenses = Math.floor(revenue * expenseDeviancy);
        const profit = revenue - expenses;

        await Financial.create({
            revenueRange: `${revenue - 5000}-${revenue + 5000}`,
            profitRange: `${profit - 2000}-${profit + 2000}`,
            revenue,
            expenses,
            profit,
            growthIndicator: getRandomInt(-2, 12),
            costCategories: [
                { name: 'Production', amount: Math.floor(expenses * 0.6) },
                { name: 'Admin', amount: Math.floor(expenses * 0.4) }
            ],
            year, managerId: manager._id, submissionStatus: 'Approved', createdAt: d
        });

    }

    // 5. Create Active Submissions (fixed schema issues)
    console.log("Creating approval workflow submissions...");
    const subTypes = ['Employee', 'Project', 'RawMaterial'];
    const statuses = ['Approved', 'PendingApproval', 'Rejected', 'Draft'];

    for (let i = 0; i < 20; i++) {
        const mgr = managers[getRandomInt(0, managers.length - 1)];
        const type = subTypes[getRandomInt(0, subTypes.length - 1)];
        const status = statuses[getRandomInt(0, 3)];

        let entity;
        if (type === 'Employee') {
            entity = await Employee.create({
                employeeId: `EMP-${getRandomInt(1000, 9999)}`,
                fullName: `Staff Member ${i}`,
                email: `staff${i}@vrfashions.in`,
                phone: `+91 ${getRandomInt(7000, 9999)}${getRandomInt(1000, 9999)}`,
                department: departments[getRandomInt(0, departments.length - 1)],
                role: 'Production Staff',
                joiningDate: new Date(),
                managerId: mgr._id,
                submissionStatus: status
            });
        } else if (type === 'Project') {
            entity = await Project.create({
                projectId: `PRJ-2026-${i}`,
                name: `Client Contract ${i}`,
                department: departments[getRandomInt(0, departments.length - 1)],
                startDate: new Date(),
                managerId: mgr._id,
                submissionStatus: status
            });
        } else {
            entity = await RawMaterial.create({
                materialType: 'Organic Cotton',
                source: 'Domestic',
                supplier: 'Cotton India',
                quantity: getRandomInt(500, 2000),
                costRange: 'Stable',
                year: 2026,
                managerId: mgr._id,
                submissionStatus: status
            });
        }

        if (status !== 'Draft') {
            const sub = await Submission.create({
                managerId: mgr._id,
                entityType: type,
                entityId: entity._id,
                dataSnapshot: entity.toObject(),
                status: status === 'PendingApproval' ? 'Pending' : status,
            });

            if (status === 'Approved' || status === 'Rejected') {
                await Approval.create({
                    submissionId: sub._id,
                    adminId: admin._id,
                    action: status,
                    comments: status === 'Approved' ? "Criteria met." : "Inconsistent data values.",
                });

                await Activity.create({
                    userId: admin._id,
                    action: status,
                    actionType: status === 'Approved' ? 'VERIFY' : 'REJECT',
                    entityId: entity._id,
                    entityType: type,
                    details: `${status} ${type} record`,
                    changeSummary: `Administrative ${status.toLowerCase()} for ${type} node: ${entity.id || entity.projectId || entity.employeeId}`
                });
            } else {
                await Activity.create({
                    userId: mgr._id,
                    action: 'Submitted',
                    actionType: 'CREATE',
                    entityId: entity._id,
                    entityType: type,
                    details: `Submitted ${type} for approval`,
                    changeSummary: `New ${type} record queued for verification: ${entity.id || entity.projectId || entity.employeeId}`
                });
            }
        }
    }

    console.log("Seeding Completed Successfully!");
    process.exit(0);
};

seed();
