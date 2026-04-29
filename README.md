# 🚗 AutoVal — Car Price Predictor

A portfolio-ready full-stack ML app with a **FastAPI backend** (scikit-learn Gradient Boosting) and a **React frontend** (dark UI).

---

## 📁 Project Structure

```
car-price-predictor/
├── backend/
│   ├── requirements.txt
│   ├── train_model.py      # Run once to generate the ML model
│   ├── main.py             # FastAPI app
│   └── models/             # Auto-created after training
│       ├── car_price_model.joblib
│       ├── encoders.joblib
│       └── meta.json
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx / App.module.css
        ├── index.css
        ├── hooks/usePredict.js
        └── components/
            ├── PredictionForm.jsx / .module.css
            └── ResultCard.jsx / .module.css
```

---

## 🚀 Quick Start

### 1 — Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the model (generates models/ folder)
python train_model.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API is now live at: http://localhost:8000
Swagger docs: http://localhost:8000/docs

---

### 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend is now live at: http://localhost:5173

---

## 🔌 API Endpoints

| Method | Endpoint   | Description                       |
|--------|------------|-----------------------------------|
| GET    | /          | Health check                      |
| GET    | /meta      | Returns valid options per field   |
| POST   | /predict   | Returns estimated car price       |

### POST /predict — Request Body

```json
{
  "brand": "Toyota",
  "fuel": "Petrol",
  "transmission": "Automatic",
  "body_type": "Sedan",
  "year": 2020,
  "km_driven": 50000,
  "engine_size": 2.0,
  "previous_owners": 1
}
```

### Response

```json
{
  "predicted_price": 18500,
  "price_range": { "low": 17020, "high": 19980 },
  "confidence": "high",
  "currency": "USD"
}
```

---

## 🏗️ Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| ML Model  | scikit-learn Gradient Boosting Regressor    |
| Backend   | FastAPI + Pydantic + Uvicorn                |
| Frontend  | React 18 + Vite + CSS Modules               |
| Fonts     | Syne (headings) + DM Mono (code)            |

---

## 📦 Build for Production

```bash
# Frontend build
cd frontend && npm run build

# Serve backend on custom host/port
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🌟 Features

- ⚡ Instant predictions via REST API
- 🎨 Dark UI with animated number counter
- 📊 Price range estimate (±8%)
- 🔧 Fully validated Pydantic schemas
- 📱 Responsive design

---

*Built with FastAPI + React + scikit-learn*
