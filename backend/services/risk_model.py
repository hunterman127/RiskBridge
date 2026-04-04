# =============================================================
# risk_model.py
# Person 4 — Risk Model + Data Layer
# RiskBridge | Texas Healthcare Access Risk Prediction
# =============================================================

WEIGHTS = {
    "financial_risk": 0.40,
    "access_risk":    0.35,
    "social_risk":    0.25
}

CONDITION_WEIGHTS = {
    "diabetes":       0.12,
    "hypertension":   0.10,
    "asthma":         0.08,
    "heart_disease":  0.13,
    "depression":     0.09,
    "anxiety":        0.07,
    "copd":           0.10,
    "prenatal":       0.11,
    "substance_use":  0.10,
    "obesity":        0.06,
    "dental":         0.05
}


def normalize(value, min_val, max_val):
    if max_val == min_val:
        return 0.0
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


def classify_risk(score):
    if score >= 0.80:
        return "high"
    if score >= 0.40:
        return "medium"
    return "low"


def compute_financial_risk(inputs):
    income_score     = normalize(inputs.get("income_bracket", 3), 1, 5)
    insurance_score  = 0.0 if inputs.get("has_insurance", False) else 1.0
    employment_score = normalize(inputs.get("employment_status", 0), 0, 3)
    raw = ((1 - income_score) + insurance_score + (1 - employment_score)) / 3
    return round(raw, 3)


def compute_access_risk(inputs):
    distance_score  = normalize(inputs.get("distance_to_clinic_km", 0), 0, 50)
    transport_score = 0.0 if inputs.get("has_transport", False) else 1.0
    internet_score  = 0.0 if inputs.get("has_internet", False) else 1.0
    raw = (distance_score + transport_score + internet_score) / 3
    return round(raw, 3)


def compute_social_risk(inputs):
    isolation_score = normalize(inputs.get("social_support_level", 5), 1, 5)
    language_score  = 0.0 if inputs.get("speaks_primary_language", True) else 1.0
    stigma_score    = float(inputs.get("stigma_score", 0.0))
    raw = ((1 - isolation_score) + language_score + stigma_score) / 3
    return round(raw, 3)


def compute_condition_penalty(conditions):
    total = sum(CONDITION_WEIGHTS.get(c.lower(), 0.0) for c in conditions)
    return round(min(total, 0.25), 3)


def compute_risk_score(inputs):
    financial = compute_financial_risk(inputs)
    access    = compute_access_risk(inputs)
    social    = compute_social_risk(inputs)

    base_score = (
        financial * WEIGHTS["financial_risk"] +
        access    * WEIGHTS["access_risk"]    +
        social    * WEIGHTS["social_risk"]
    )

    conditions  = inputs.get("conditions", [])
    penalty     = compute_condition_penalty(conditions)
    final_score = round(min(1.0, base_score + penalty), 3)

    return {
        "final_score":       final_score,
        "financial_risk":    financial,
        "access_risk":       access,
        "social_risk":       social,
        "condition_penalty": penalty,
        "risk_level":        classify_risk(final_score),
        "age_group":         inputs.get("age_group", "unknown"),
        "region":            inputs.get("region", "unknown")
    }


# ----------------------------
# QUICK TEST — python risk_model.py
# ----------------------------
if __name__ == "__main__":
    test_input = {
        "income_bracket":          2,
        "has_insurance":           False,
        "employment_status":       1,
        "distance_to_clinic_km":   35,
        "has_transport":           False,
        "has_internet":            True,
        "social_support_level":    2,
        "speaks_primary_language": False,
        "stigma_score":            0.75,
        "conditions":              ["diabetes", "hypertension"],
        "age_group":               "26-40",
        "region":                  "rio_grande_valley"
    }

    result = compute_risk_score(test_input)
    print("=== RiskBridge Score Output ===")
    for key, value in result.items():
        print(f"  {key}: {value}")