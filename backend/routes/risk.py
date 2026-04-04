from flask import Blueprint, request, jsonify
from services.risk_engine import compute_risk_score
from services.resource_matcher import filter_resources
from services.nppes_client import search_providers
from services.text_analyzer import analyze_text

risk_bp = Blueprint("risk", __name__)

@risk_bp.route("/risk-assessment", methods=["POST"])
def risk_assessment():
    data = request.get_json()

    financial_risk = data.get("financial_risk", 0)
    accessibility_risk = data.get("accessibility_risk", 0)
    text_input = data.get("text_input", "")
    text_analysis = analyze_text(text_input)

    stigma_score = data.get("stigma_score")
    if stigma_score is None:
        stigma_score = text_analysis["stigma_score"]

    language = data.get("language")
    telehealth = data.get("telehealth_preferred")
    anonymous = data.get("anonymous_preferred")

    state = data.get("state")
    city = data.get("city")
    taxonomy = data.get("taxonomy")

    risk_score, risk_level = compute_risk_score(
        stigma_score,
        financial_risk,
        accessibility_risk
    )

    resources = filter_resources(
        language=language,
        telehealth=telehealth,
        anonymous=anonymous
    )

    providers = []
    try:
        if state or city or taxonomy:
            providers = search_providers(
                state=state,
                city=city,
                taxonomy_desc=taxonomy
            )

            if city:
                providers = [
                    p for p in providers
                    if p.get("address", {}).get("city", "").lower() == city.lower()
                ]

            if state:
                providers = [
                    p for p in providers
                    if p.get("address", {}).get("state", "").lower() == state.lower()
                ]
    except Exception:
        providers = []

    return jsonify({
        "risk_score": risk_score,
        "risk_level": risk_level,
        "factors": {
            "stigma": stigma_score,
            "financial": financial_risk,
            "accessibility": accessibility_risk
        },
        "resources": resources,
        "providers": providers,
        "text_analysis": text_analysis
    })