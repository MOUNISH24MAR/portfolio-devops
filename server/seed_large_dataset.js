const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Project = require('./models/Project');
const Export = require('./models/Export');
const Financial = require('./models/Financial');
const Buyer = require('./models/Buyer');

require('dotenv').config();

const DB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/garment-portfolio";

const departments = ['Production', 'Quality Control', 'Design', 'Logistics', 'Administration'];
const regions = ['European Union', 'North America', 'Middle East', 'East Asia', 'Oceania'];
const countriesMap = {
    'European Union': ['Germany', 'France', 'Italy', 'Netherlands', 'Spain', 'Belgium'],
    'North America': ['USA', 'Canada', 'Mexico'],
    'Middle East': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'],
    'East Asia': ['Japan', 'South Korea', 'Taiwan'],
    'Oceania': ['Australia', 'New Zealand']
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedLargeDataset = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log("Connected to MongoDB for Large Dataset Seeding...");

        const admin = await User.findOne({ role: 'ADMIN' });
        const managers = await User.find({ role: 'MANAGER' });

        if (!admin || managers.length === 0) {
            console.error("Admin or Managers not found. Please run seed.js first.");
            process.exit(1);
        }

        // 1. EXTEND BUYERS
        console.log("Extending Buyers...");
        let buyerDocs = await Buyer.find({});
        if (buyerDocs.length < 10) {
            for (let i = 0; i < 7; i++) {
                const region = getRandom(regions);
                const country = getRandom(countriesMap[region]);
                const b = await Buyer.create({
                    name: `Global Buyer ${i + 4}`,
                    region,
                    country,
                    industry: "Retail Conglomerate",
                    relationshipDuration: `${getRandomInt(1, 5)} years`,
                    orderFrequency: getRandom(['Low', 'Medium', 'High']),
                    managerId: getRandom(managers)._id,
                    submissionStatus: 'Approved'
                });
                buyerDocs.push(b);
            }
        }

        // 2. GENERATE EXPORTS (Aim for 100 total)
        console.log("Injecting high-volume Export data...");
        const currentExports = await Export.countDocuments({ submissionStatus: 'Approved' });
        const targetExports = 100;
        const neededExports = targetExports - currentExports;

        if (neededExports > 0) {
            for (let i = 0; i < neededExports; i++) {
                const buyer = getRandom(buyerDocs);
                const manager = getRandom(managers);
                const year = getRandom([2024, 2025, 2026]);
                const month = getRandomInt(0, 11);
                const day = getRandomInt(1, 28);
                const date = new Date(year, month, day);
                
                let seasonalMultiplier = (month >= 9) ? 1.4 : (month <= 2 ? 1.2 : 0.9);
                const volume = Math.floor(getRandomInt(4000, 18000) * seasonalMultiplier);
                const value = Math.floor(volume * getRandomInt(7, 14));

                await Export.create({
                    region: buyer.region,
                    country: buyer.country,
                    category: getRandom(['Knitted Wear', 'Sportswear', 'Outerwear', 'Nightwear']),
                    volume,
                    value,
                    year,
                    buyerId: buyer._id,
                    managerId: manager._id,
                    submissionStatus: 'Approved',
                    createdAt: date
                });
            }
            console.log(`Added ${neededExports} Approved Export records.`);
        }

        // 3. GENERATE FINANCIALS (Aim for 30 total)
        console.log("Injecting Financial data...");
        const currentFin = await Financial.countDocuments({ submissionStatus: 'Approved' });
        const targetFin = 30;
        const neededFin = targetFin - currentFin;

        if (neededFin > 0) {
            for (let i = 0; i < neededFin; i++) {
                const manager = getRandom(managers);
                const year = getRandom([2024, 2025, 2026]);
                const month = getRandomInt(0, 11);
                const date = new Date(year, month, 15);
                
                const revenue = getRandomInt(100000, 500000);
                const expenses = Math.floor(revenue * (getRandomInt(70, 95) / 100));
                const profit = revenue - expenses;

                await Financial.create({
                    revenueRange: `${revenue - 10000}-${revenue + 10000}`,
                    profitRange: `${profit - 5000}-${profit + 5000}`,
                    revenue,
                    expenses,
                    profit,
                    growthIndicator: getRandomInt(-5, 15),
                    costCategories: [
                        { name: 'Production', amount: Math.floor(expenses * 0.55) },
                        { name: 'Labor', amount: Math.floor(expenses * 0.25) },
                        { name: 'Logistics', amount: Math.floor(expenses * 0.15) },
                        { name: 'Admin', amount: Math.floor(expenses * 0.05) }
                    ],
                    year,
                    managerId: manager._id,
                    submissionStatus: 'Approved',
                    createdAt: date
                });
            }
            console.log(`Added ${neededFin} Approved Financial records.`);
        }

        // 4. GENERATE EMPLOYEES (Aim for 40 total)
        console.log("Injecting Workforce data...");
        const currentEmp = await Employee.countDocuments({ submissionStatus: 'Approved' });
        const targetEmp = 40;
        const neededEmp = targetEmp - currentEmp;

        if (neededEmp > 0) {
            for (let i = 0; i < neededEmp; i++) {
                const manager = getRandom(managers);
                const dept = getRandom(departments);
                const roles = {
                    'Production': ['Sewing Operator', 'Cutting Specialist', 'Ironing Staff'],
                    'Quality Control': ['QI Auditor', 'Final Inspector'],
                    'Design': ['Pattern Maker', 'Fashion Designer'],
                    'Logistics': ['Dispatch Manager', 'Warehouse Helper'],
                    'Administration': ['Clerk', 'Accountant']
                };

                await Employee.create({
                    employeeId: `EMP-${getRandomInt(1000, 9999)}`,
                    fullName: `Staff Node ${i + currentEmp}`,
                    email: `staff.node${i + currentEmp}@vrfashions.in`,
                    phone: `+91 ${getRandomInt(6000, 9999)}${getRandomInt(1000, 9999)}`,
                    department: dept,
                    role: getRandom(roles[dept]),
                    joiningDate: new Date(2023, getRandomInt(0, 11), getRandomInt(1, 28)),
                    status: 'Active',
                    managerId: manager._id,
                    submissionStatus: 'Approved'
                });
            }
            console.log(`Added ${neededEmp} Approved Employee records.`);
        }

        // 5. GENERATE PROJECTS (Aim for 15 total)
        console.log("Injecting Project data...");
        const currentPrj = await Project.countDocuments({ submissionStatus: 'Approved' });
        const targetPrj = 15;
        const neededPrj = targetPrj - currentPrj;

        if (neededPrj > 0) {
            for (let i = 0; i < neededPrj; i++) {
                const manager = getRandom(managers);
                const dept = getRandom(departments);
                const startYear = getRandom([2024, 2025]);
                const startMonth = getRandomInt(0, 11);
                
                // Get some random employees for assignment
                const randomEmps = await Employee.find({ department: dept }).limit(getRandomInt(2, 5));
                const empIds = randomEmps.map(e => e._id);

                await Project.create({
                    projectId: `PRJ-${startYear}-${getRandomInt(100, 999)}`,
                    name: `Global Order Alpha-${i}`,
                    department: dept,
                    description: `Automated production line project for ${dept} specialization.`,
                    startDate: new Date(startYear, startMonth, 1),
                    status: getRandom(['Proposed', 'In Progress', 'Completed', 'On Hold']),
                    assignedEmployees: empIds,
                    managerId: manager._id,
                    submissionStatus: 'Approved'
                });
            }
            console.log(`Added ${neededPrj} Approved Project records.`);
        }

        console.log("Dataset augmentation successful. All nodes synchronized.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
};

seedLargeDataset();
