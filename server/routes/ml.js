const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Proxy to ML Service: Forecast
router.get("/forecast", auth, async (req, res) => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/api/export/forecast`);
        res.json(response.data);
    } catch (err) {
        console.error("ML Service Error (Forecast):", err.message);
        res.status(502).json({ msg: "ML Service is unavailable or returned an error." });
    }
});

// Proxy to ML Service: Predict Export Revenue
router.post("/predict", auth, async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/api/export/predict`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error("ML Service Error (Predict):", err.message);
        res.status(502).json({ msg: "ML Service prediction rejected." });
    }
});

// Proxy to ML Service: Predict Market Demand
router.post("/demand", auth, async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/api/export/demand`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error("ML Service Error (Demand):", err.message);
        res.status(502).json({ msg: "ML Service demand analysis failure." });
    }
});

module.exports = router;
