# Garment Portfolio & AI Dashboard

A multi-layered high-performance garment export portfolio with an integrated **Executive AI Dashboard**. This project features real-time data visualization, predictive analytics for export revenue, and strategic market demand classification.

---

## 🚀 Key Features

*   **Executive Insights**: High-level KPI monitoring (Turnover, Market Heat, Velocity Accuracy).
*   **Export AI Insights**: AI-driven predictive engine for forecasting export values and demand levels.
*   **Product Governance**: Centralized management of product collections with real-time sync.
*   **Correspondence Node**: Streamlined portal for managing global inquiries.
*   **Strategic Intelligence**: Automated reports with executive narratives and actionable recommendations.

---

## 🏗️ Project Architecture

The project is structured as a mono-repository with three core services:

1.  **/client**: React frontend (Vite) styled with advanced executive themes.
2.  **/server**: Node.js backend using Express and MongoDB.
3.  **/ml_service**: Python-based ML prediction engine using FastAPI.

---

## 💻 Tech Stack

- **Frontend**: React, Recharts, Lucide-React, CSS (Premium Dashboards).
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **AI/ML**: Python, FastAPI, Scikit-learn, Pandas, Joblib.

---

## 📦 Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.10+](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/) (running locally or via Atlas)

### 2. Backend Server (Node.js)
```bash
cd server
npm install
node server.js
```

### 3. Frontend Client (React)
```bash
cd client
npm install
npm run dev
```

### 4. ML Prediction Service (Python)
```bash
cd ml_service
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

---

## 📊 ML Intelligence Breakdown

- **Revenue Engine**: Uses Linear Regression to forecast export valuations in **INR (₹)** based on global destination, product type, and quantity.
- **Demand Classifier**: Uses a Decision Tree model to categorize market heat (High/Medium/Low) for strategic resource allocation.
- **Data Pipeline**: Python scripts (`train_export_model.py`, `train_demand_model.py`) automate data cleaning and model training from raw exports.

---

## 🛡️ License

© 2026 Garment Portfolio v2.4. Designed for Executive Strategic Planning.
