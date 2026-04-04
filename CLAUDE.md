# RiskBridge

Healthcare access risk prediction app for underserved communities.

## Stack
- client/ → React + Vite + Tailwind CSS
- server/ → Flask + flask-cors + HuggingFace transformers

## Key concepts
- Risk score = weighted sum of financial_risk, access_risk, social_risk (see app.py)
- Stigma-sensitive mode = toggle that filters to anonymous resources only
- /analyze → NLP emotion detection → stigma_score
- /risk-score → final weighted score + resource matching

## Rules
- Never add auth or login
- Keep everything client-side renderable with no backend = graceful fallback
- Mobile-first responsive
- All resource data lives in server/resources.json