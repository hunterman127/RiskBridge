def compute_risk_score(stigma_score, financial_risk, accessibility_risk):
    # simple weighted model
    risk_score = (
        0.4 * stigma_score +
        0.3 * financial_risk +
        0.3 * accessibility_risk
    )

    # clamp between 0–1
    risk_score = max(0, min(1, risk_score))

    # classify
    if risk_score < 0.3:
        level = "low"
    elif risk_score < 0.7:
        level = "medium"
    else:
        level = "high"

    return risk_score, level