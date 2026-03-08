const fs = require('fs');
const path = require('path');
const Export = require('../../models/Export');
const Financial = require('../../models/Financial');
const Employee = require('../../models/Employee');
const Project = require('../../models/Project');

const DATASET_DIR = path.join(__dirname, '../../ml-datasets');

/**
 * Ensures the dataset directory exists
 */
const ensureDirExists = () => {
    if (!fs.existsSync(DATASET_DIR)) {
        fs.mkdirSync(DATASET_DIR, { recursive: true });
        console.log(`[ML-Service] Created directory: ${DATASET_DIR}`);
    }
};

/**
 * Extracts historical data from MongoDB and saves it to JSON files
 */
const extractMLDatasets = async () => {
    ensureDirExists();
    const extractionResults = {
        success: true,
        files: [],
        timestamp: new Date().toISOString(),
        details: {}
    };

    try {
        console.log('[ML-Service] Initializing data extraction protocol...');

        // 1. EXTRACT EXPORTS DATA
        const exportsData = await Export.find({ submissionStatus: 'Approved' })
            .select('region country category volume value year createdAt -_id')
            .lean();
        const exportsPath = path.join(DATASET_DIR, 'exports_dataset.json');
        fs.writeFileSync(exportsPath, JSON.stringify(exportsData, null, 2));
        extractionResults.files.push('exports_dataset.json');
        extractionResults.details.exports = exportsData.length;

        // 2. EXTRACT FINANCIAL DATA
        const financialData = await Financial.find({ submissionStatus: 'Approved' })
            .select('revenue expenses profit growthIndicator year costCategories -_id')
            .lean();
        const financialPath = path.join(DATASET_DIR, 'financial_dataset.json');
        fs.writeFileSync(financialPath, JSON.stringify(financialData, null, 2));
        extractionResults.files.push('financial_dataset.json');
        extractionResults.details.financial = financialData.length;

        // 3. EXTRACT EMPLOYEE DATA
        const employeeData = await Employee.find({ submissionStatus: 'Approved' })
            .select('employeeId department role joiningDate status -_id')
            .lean();
        const employeePath = path.join(DATASET_DIR, 'employee_dataset.json');
        fs.writeFileSync(employeePath, JSON.stringify(employeeData, null, 2));
        extractionResults.files.push('employee_dataset.json');
        extractionResults.details.employees = employeeData.length;

        // 4. EXTRACT PROJECT DATA
        const projectsRaw = await Project.find({ submissionStatus: 'Approved' })
            .select('projectId department status startDate assignedEmployees -_id')
            .lean();
        
        // Transform projects to include assignedEmployees count
        const projectData = projectsRaw.map(p => ({
            projectId: p.projectId,
            department: p.department,
            status: p.status,
            startDate: p.startDate,
            assignedEmployeesCount: Array.isArray(p.assignedEmployees) ? p.assignedEmployees.length : 0
        }));

        const projectPath = path.join(DATASET_DIR, 'project_dataset.json');
        fs.writeFileSync(projectPath, JSON.stringify(projectData, null, 2));
        extractionResults.files.push('project_dataset.json');
        extractionResults.details.projects = projectData.length;

        console.log('[ML-Service] Extraction complete. Datasets pushed to storage.');
        return extractionResults;

    } catch (err) {
        console.error('[ML-Service] Extraction failure:', err);
        throw new Error(`Data extraction failed: ${err.message}`);
    }
};

module.exports = {
    extractMLDatasets
};
