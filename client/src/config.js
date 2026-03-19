/**
 * Central configuration for API endpoints.
 * Switches between local development and production URLs automatically.
 */

// Toggle this based on your deployment stage
const isProduction = import.meta.env.PROD;

// Backend API Base URL
// Replace with your actual Render URL when deploying
export const API_BASE_URL = isProduction 
    ? "https://your-backend.onrender.com" 
    : "http://localhost:5000";

// Note: ML calls are now proxied through the backend for security and simplicity.
// Direct ML_URL (8000) is no longer used by the frontend.
export const ML_PROXY_URL = `${API_BASE_URL}/api/ml`;
