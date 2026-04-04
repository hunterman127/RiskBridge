# debug.py
import json
from backend.services.risk_model import compute_risk_score

# Load resources directly
with open("resources.json", "r") as f:
    ALL_RESOURCES = json.load(f)

mock_risk_scores = {
    "final_score":    0.949,
    "financial_risk": 0.806,
    "access_risk":    0.567,
    "social_risk":    0.833,
    "risk_level":     "high"
}

print(f"Total resources: {len(ALL_RESOURCES)}\n")

for r in ALL_RESOURCES:
    reasons = []

    relevant = any(mock_risk_scores.get(tag, 0) >= r["threshold"] for tag in r["tags"])
    if not relevant:
        reasons.append(f"threshold not met (threshold={r['threshold']})")

    if not r.get("anonymous", False):
        reasons.append("not anonymous")

    if "spanish" not in r.get("languages", []):
        reasons.append("no spanish")

    if r.get("cost") != "free":
        reasons.append(f"cost is {r.get('cost')} not free")

    if not any(c in r.get("conditions", []) for c in ["diabetes", "hypertension"]):
        reasons.append("no matching conditions")

    if "26-40" not in r.get("age_groups", []):
        reasons.append("age group 26-40 not served")

    if r.get("region") not in ("rio_grande_valley", "statewide"):
        reasons.append(f"wrong region: {r.get('region')}")

    if reasons:
        print(f"BLOCKED  {r['name']}")
        for reason in reasons:
            print(f"         -> {reason}")
    else:
        print(f"MATCH    {r['name']}")

    print()