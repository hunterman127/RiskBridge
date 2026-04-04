# RiskBridge

**Healthcare access risk prediction app for underserved communities in Texas, focused on primary care access.**

---

## Stack
- **client/** → React + Vite + Tailwind CSS  
- **server/** → Flask + flask-cors + HuggingFace transformers  

---

## Key Concepts
- **Risk score** = weighted sum of `financial_risk`, `access_risk`, `stigma_score`  
- **Stigma-sensitive mode** = toggle that filters to anonymous resources only  
- **/analyze** → NLP emotion detection → `stigma_score`  
- **/risk-score** → final weighted score + resource matching  

**Target Population:**  
- Underprivileged Texans facing **primary care access barriers**  
  - Financial: uninsured, underinsured, low-income individuals  
  - Geographic: rural or underserved urban areas with limited clinic availability  
  - Social/cultural: stigma around visiting clinics or discussing health issues  
- Underprivileged = combination of **financial, geographic, and social barriers**, not just poverty alone  

---

## Rules
- Never add auth or login  
- Keep everything client-side renderable with no backend → graceful fallback  
- Mobile-first responsive  
- All resource data lives in `server/resources.json`  

---

## End-to-End Workflow Example

### 1. User Access / Onboarding
- User opens the app (web or mobile)  
- Optional intro screen explains:  
  > “This tool helps you find primary care resources in Texas while respecting your privacy”  
- No login required (privacy-first design)  

---

### 2. Collect Inputs

#### Structured Questions
| Question | Type | Options / Scale | Purpose |
|----------|------|----------------|---------|
| Do you currently have health insurance? | Radio | Yes / No / Partial coverage | Determines financial risk |
| How far is the nearest clinic you could visit? | Slider | 0–100 miles | Access/logistical barrier |
| Do you prefer in-person or telehealth appointments? | Radio | In-person / Telehealth / Either | Access + resource matching |
| Are you comfortable sharing your identity with a provider? | Radio | Yes / No / Only Anonymous | Stigma-sensitive mode |
| Do you have a preferred language for care? | Checklist | English / Spanish / Other | Language filtering |

#### Free-Text Question
> “Please describe any concerns or barriers you face when trying to see a primary care provider.”

**Claude / Hugging Face Processing:**
- Detect **emotional tone**: fear, shame, anxiety, stress  
- Detect **hidden barriers**: stigma, financial, access/logistical, cultural  
- Convert to **quantitative scores (0–1)**

**Example Output:**
```json
{
  "emotion": "shame",
  "confidence": 0.91,
  "stigma_score": 0.91,
  "financial_risk": true,
  "access_risk": 0.7
}
3. Risk Scoring
risk_score = 0.4*stigma_score + 0.3*financial_risk + 0.3*access_risk0–0.3 → Low barrier
0.3–0.7 → Medium barrier
0.7–1 → High barrier

4. Personalized Resource Recommendation

Resource Data Example (resources.json):

[
  {
    "name": "Texas Health & Human Services - Telehealth",
    "type": "telehealth",
    "cost": "free",
    "language": ["English", "Spanish"],
    "anonymous": true,
    "region": "Statewide"
  },
  {
    "name": "Community Health Centers of Texas",
    "type": "primary_care",
    "cost": "sliding_scale",
    "language": ["English", "Spanish"],
    "anonymous": false,
    "region": "Rural TX"
  },
  {
    "name": "MDLive Primary Care",
    "type": "telehealth",
    "cost": "low_cost",
    "language": ["English"],
    "anonymous": false,
    "region": "Statewide"
  },
  {
    "name": "211 Texas - Health Navigation",
    "type": "helpline",
    "cost": "free",
    "language": ["English", "Spanish"],
    "anonymous": true,
    "region": "Statewide"
  }
]Example End-to-End:

User inputs:
Insurance: No
Distance: 50 miles
Prefers telehealth: Yes
Free text: “I don’t feel comfortable going to clinics because I can’t afford it.”
AI detects:
{
  "emotion": "fear",
  "stigma_score": 0.85,
  "financial_risk": true,
  "access_risk": 0.6
}
Risk Score = 0.82 → High barrier
Top Recommendations:
Texas Health & Human Services - Telehealth
211 Texas - Health Navigation
MDLive Primary Care

Provides prioritized, privacy-respecting, low-cost primary care options in Texas.

5. (Optional) Data Layer / Analytics
Phase 1: Store locally for development/testing
Phase 2: Supabase anonymized storage (risk_score, stigma_score, financial_risk, timestamp)
Aggregate insights:
% users facing stigma
Most common emotional signals
Average risk score by demographic
6. Feedback Loop
Users can optionally give feedback:

“Was this primary care resource helpful?”

Improves future model prioritization and resource recommendations
Notes on Texas & Primary Care Focus
Texas: large rural population and high uninsured rate
Primary care is limited in rural/underserved counties → ideal for RiskBridge
Underprivileged = low-income, uninsured, rural or socially stigmatized Texans

