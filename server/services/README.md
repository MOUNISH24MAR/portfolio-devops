# Server Services Layer

This directory contains the business logic and analytical engine services for the Garment Portfolio backend. By separating logic from the routes, we ensure higher maintainability, testability, and performance through concurrency.

## Directories

### [adminAnalytics](./adminAnalytics)
The core analytical engine powering the Administrative Dashboard. It aggregates data from multiple MongoDB collections to provide real-time operational insights.

| File | Description |
| :--- | :--- |
| `analyticsService.js` | **The Coordinator.** Orchestrates all analytical domains using `Promise.all` for concurrent execution. Includes a 60-second in-memory cache to optimize performance and reduce DB load. |
| `kpiService.js` | **Top-level Metrics.** Calculates primary KPIs: Total Employees, Active Projects, Total Export Value, and Pending Verifications. |
| `financialAnalytics.js` | **Monetary Intelligence.** Performs numeric aggregation on revenue, expenses, and profit to provide monthly financial trends and margin analysis. |
| `exportAnalytics.js` | **Global Trade Logic.** Tracks regional export distributions and provides data-driven buyer contribution metrics by aggregating linked export values. |
| `governanceAnalytics.js` | **Administrative Control.** Normalizes submission statuses across different collections (Submissions/Companies) and produces a unified queue for pending approvals. |
| `staffingAnalytics.js` | **Human Capital Insights.** Analyzes workforce distribution by department and tracks long-term staffing trends. |
| `auditAnalytics.js` | **System Transparency.** Processes the activity log to generate transaction heatmaps and rich metadata-driven audit reports. |

## Design Principles

1.  **Concurrency First**: Every service is designed to run its queries in parallel whenever possible to minimize API response times.
2.  **Data Determinism**: Placeholder or simulated logic is strictly forbidden. Every metric is derived from actual records in MongoDB.
3.  **Modular Domains**: Each analytical domain (Financial, Staffing, etc.) is isolated in its own file to prevent "God Objects" and simplify debugging.
4.  **Standardized Output**: All services return data structures optimized for frontend charting libraries (primarily Recharts), ensuring consistent keys like `name`, `value`, and `date`.
