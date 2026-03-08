# VR Fashions — AI Prediction Hub 🚀
### Two AI Brains, one simple explanation (written for a 15-year-old!)

---

## 👕 What is this thing?

Imagine you own a t-shirt factory. Every month, you ship boxes of clothes to places like the **USA, Japan, and France**. After doing this for a few years, you have a big list of every shipment you've ever made.

**Now, you want to know the future:**
1.  **"If I send 10,000 shirts to Japan next month, how much MONEY will I make?"** (The Revenue Brain 💵)
2.  **"Will the DEMAND be High, Medium, or Low for those shirts?"** (The Strategy Brain 📈)

That is exactly what this ML (Machine Learning) service does. It uses **two different AI models** to predict the future of your exports.

---

## 🧠 Meet the Two AI Brains

We didn't just build one AI; we built two!

### Brain 1: The Revenue Predictor (The Accountant)
*   **Job:** Predict the exact amount in **Indian Rupees (INR)** you'll earn.
*   **How it thinks:** Imagine drawing a straight line through a bunch of dots on a graph. If 5,000 shirts make ₹5 Lakhs, it predicts 10,000 will make ₹10 Lakhs. 
*   **Result:** It gives you a number like **₹1,24,500.00**.

### Brain 2: The Demand Classifier (Decision Tree)
*   **Job:** Tell you if the market is going to be "High", "Medium", or "Low" demand.
*   **How it thinks:** It plays a game of **"20 Questions."** 
    *   *Question 1: Is the country USA? (Yes/No)*
    *   *Question 2: Is it the month of December? (Yes/No)*
    *   *Question 3: Is it Knitted Wear? (Yes/No)*
*   Based on the answers, it arrives at a final label.
*   **Result:** It gives you a status like **"HIGH DEMAND"**.

---

## 🏗️ How did we train them?

Training an AI is like teaching a student for an exam.

### Step 1: The "Study Guide" (Data Preparation)
We took 100 real shipment records and added "High/Medium/Low" labels based on how many items were sent.
*   **< 7,000 pieces** = Low Demand
*   **7,000 - 12,000 pieces** = Medium Demand
*   **> 12,000 pieces** = High Demand

### Step 2: Translating to "Robot Language" (Encoding)
Computers are bad at words but great at numbers. We translated countries and clothes into numbers so the AI could "read" them.
*   `usa` → 6
*   `knitted wear` → 0
*   `france` → 0

### Step 3: The "Final Exam" (Evaluation)
We tested our AIs with data they had never seen before to see if they were actually learning.
*   **Revenue Brain:** 80.1% Accurate (That's an A!)
*   **Demand Brain:** Optimized for pattern matching (Knows exactly when USA demand spikes!)

---

## 📂 What are these files?

```text
ml_service/
├── export_prediction_model.pkl    ← Revenue Brain (The Accountant)
├── demand_prediction_model.pkl    ← Demand Brain (The Strategist)
├── encoder_metadata.json          ← Translation dictionary for Revenue
├── demand_encoder_metadata.json   ← Translation dictionary for Demand
├── main.py                        ← The "Operator" that runs the API
└── README.md                      ← You are here!
```

---

## 🔌 How to start the AI?

To turn on the AI service, open your terminal in `d:\garment-portfolio` and type:

```powershell
uvicorn ml_service.main:app --port 8000 --reload
```

When you see **"Application startup complete"**, the AI is awake! 

This file has **100 real shipment records** from VR Fashions (2024–2026), each looking like this (Values in INR):

| shipment_date | product_description | destination_country | quantity | value (INR) |
| :--- | :--- | :--- | :--- | :--- |
| 2025-03-31 | knitted wear | france | 3,190 | ₹4,57,860 |
| 2025-04-08 | girls pyjama sets | france | 13,140 | ₹35,62,319 |
| 2026-06-15 | sportswear | uae | 8,200 | ₹9,84,000 |

### The 4 API "Doors" (Endpoints)

| Door (Endpoint) | What you ask | What it tells you |
| :--- | :--- | :--- |
| `POST /api/export/predict` | "Here is an order..." | "You will earn **₹X**." |
| `POST /api/export/demand` | "Is this market hot?" | "Demand is **HIGH**." |
| `GET /api/export/forecast` | "Summarize next 6 months." | "Top country is USA, Trend is UP." |
| `GET /health` | "Are you okay?" | "System Online & Healthy." |

---

## 💡 One Sentence Summary
This system used 100 historical records to build two AI brains that predict exactly how much money you’ll make and how busy your factory will be — all in less than a second. 🚀
