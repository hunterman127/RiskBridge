# RiskBridge

Healthcare access risk prediction app for underserved communities.

## 🏆 Hackathon Winner

RiskBridge was awarded 1st place at Rutgers MTC Hackathon.

## 🚀 Features
- NLP-based stigma detection
- Risk scoring model
- Personalized resource matching
- Real-time provider lookup (NPPES API)

## Folder Structure

```
RiskBridge/
├── client/          # React + Vite + Tailwind CSS frontend
├── server/
│   ├── app.py       # Flask API
│   └── resources.json
├── .venv/           # Python virtual environment
└── package.json     # Root scripts (concurrently)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/analyze` | Emotion detection → stigma score |
| POST | `/risk-score` | Weighted risk score + resource matching |

### POST /analyze
```json
{ "text": "I feel hopeless and scared" }
```
Response:
```json
{ "emotion": "fear", "score": 0.92, "stigma_score": 0.736 }
```

### POST /risk-score
```json
{ "financial_risk": 8, "access_risk": 6, "social_risk": 5, "stigma_sensitive": true }
```
Response:
```json
{ "risk_score": 6.95, "risk_level": "medium", "resources": [...] }
```

## Dev Setup

The `.venv` is at the repo root. Dependencies are already installed.

## Run Commands

### Option A — Two terminals

**Terminal 1 (Flask backend, port 5000):**
```bash
.venv/Scripts/python server/app.py
```

**Terminal 2 (Vite frontend, port 5173):**
```bash
cd client && npm run dev
```

### Option B — Both servers at once (from repo root)

```bash
npm run dev
```

This uses `concurrently` to start both servers in a single terminal with color-coded output.

### Individual scripts
```bash
npm run dev:client   # Vite only
npm run dev:server   # Flask only
```
