import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load resources once at startup
RESOURCES_PATH = os.path.join(os.path.dirname(__file__), "resources.json")
with open(RESOURCES_PATH) as f:
    RESOURCES = json.load(f)

# Lazy-load the emotion pipeline to avoid slow startup
_emotion_pipeline = None


def get_emotion_pipeline():
    global _emotion_pipeline
    if _emotion_pipeline is None:
        from transformers import pipeline
        _emotion_pipeline = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=1,
        )
    return _emotion_pipeline


# Emotion → stigma tier mapping
_HIGH_STIGMA = {"fear", "shame", "disgust"}
_MED_STIGMA = {"sadness", "anger"}


def _stigma_score(emotion: str, confidence: float) -> float:
    """Map emotion + model confidence to a 0–1 stigma score within a tier band."""
    if emotion in _HIGH_STIGMA:
        return round(0.7 + confidence * 0.3, 4)   # 0.7–1.0
    if emotion in _MED_STIGMA:
        return round(0.4 + confidence * 0.3, 4)   # 0.4–0.7
    return round(confidence * 0.3, 4)              # 0.0–0.3 (joy/surprise/neutral)


@app.get("/")
def health():
    return jsonify({"status": "ok", "service": "RiskBridge API"})


@app.post("/analyze")
def analyze():
    """
    Body:    { "text": "..." }
    Returns: { "emotion": str, "confidence": float, "stigma_score": float }
    """
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    pipe = get_emotion_pipeline()
    result = pipe(text)[0]
    if isinstance(result, list):
        result = result[0]

    emotion = result["label"].lower()
    confidence = round(result["score"], 4)

    return jsonify({
        "emotion": emotion,
        "confidence": confidence,
        "stigma_score": _stigma_score(emotion, confidence),
    })


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def _archetype(financial: float, access: float, social: float) -> str:
    scores = {"financial": financial, "access": access, "social": social}
    dominant = max(scores, key=scores.get)
    vals = sorted(scores.values())
    if vals[2] - vals[0] <= 0.1:          # all within 0.1 of each other
        return "multi_barrier"
    archetypes = {
        "financial": "financially_constrained",
        "access": "geographically_isolated",
        "social": "socially_stigmatized",
    }
    return archetypes[dominant]


def _confidence_label(risk_score: float) -> str:
    dist = abs(risk_score - 0.5)
    if dist > 0.3:
        return "high"
    if dist > 0.15:
        return "medium"
    return "low"


def _match_resources(top_barriers: list, stigma_sensitive: bool) -> list:
    """Score and filter resources; return top 5."""
    barrier_set = set(top_barriers)
    results = []
    for r in RESOURCES:
        if stigma_sensitive and not r.get("anonymous", False):
            continue
        score = 0
        if "financial" in barrier_set and r.get("cost") in ("free", "sliding_scale"):
            score += 2
        if "access" in barrier_set and r.get("telehealth", False):
            score += 2
        if "social" in barrier_set and r.get("anonymous", False):
            score += 2
        results.append((score, r))

    results.sort(key=lambda x: x[0], reverse=True)
    return [r for _, r in results[:5]]


@app.post("/risk-score")
def risk_score():
    """
    Body: {
        no_insurance:       0|1,
        financial_stress:   0–4,
        employment_status:  0|1,

        no_transport:       0|1,
        past_delays:        0–4,
        rural:              0|1,

        stigma_score:       0.0–1.0,
        low_social_support: 0–4,
        language_barrier:   0|1,

        stigma_sensitive:   bool  (optional, default false)
    }
    Returns: {
        risk_score, risk_level, archetype, confidence,
        financial_risk, access_risk, social_risk,
        top_barriers[], resources[]
    }
    """
    data = request.get_json(silent=True) or {}

    # Financial sub-factors
    no_insurance      = float(data.get("no_insurance", 0))
    financial_stress  = float(data.get("financial_stress", 0))
    employment_status = float(data.get("employment_status", 0))

    # Access sub-factors
    no_transport = float(data.get("no_transport", 0))
    past_delays  = float(data.get("past_delays", 0))
    rural        = float(data.get("rural", 0))

    # Social sub-factors
    stigma_sc          = float(data.get("stigma_score", 0))
    low_social_support = float(data.get("low_social_support", 0))
    language_barrier   = float(data.get("language_barrier", 0))

    stigma_sensitive = bool(data.get("stigma_sensitive", False))

    # Sub-factor scores (each 0–1)
    financial_risk = _clamp(
        no_insurance * 0.4 +
        (financial_stress / 4) * 0.3 +
        employment_status * 0.3
    )
    access_risk = _clamp(
        no_transport * 0.4 +
        (past_delays / 4) * 0.3 +
        rural * 0.3
    )
    social_risk = _clamp(
        stigma_sc * 0.5 +
        (low_social_support / 4) * 0.3 +
        language_barrier * 0.2
    )

    # Composite risk score
    score = round(
        0.35 * financial_risk +
        0.30 * access_risk +
        0.35 * social_risk,
        4
    )

    if score >= 0.7:
        level = "high"
    elif score >= 0.3:
        level = "medium"
    else:
        level = "low"

    # Top barriers: sub-factors ≥ 0.4, sorted descending
    sub_factors = {
        "financial": financial_risk,
        "access": access_risk,
        "social": social_risk,
    }
    top_barriers = [
        k for k, v in sorted(sub_factors.items(), key=lambda x: x[1], reverse=True)
        if v >= 0.4
    ]

    return jsonify({
        "risk_score": score,
        "risk_level": level,
        "archetype": _archetype(financial_risk, access_risk, social_risk),
        "confidence": _confidence_label(score),
        "financial_risk": round(financial_risk, 4),
        "access_risk": round(access_risk, 4),
        "social_risk": round(social_risk, 4),
        "top_barriers": top_barriers,
        "resources": _match_resources(top_barriers, stigma_sensitive),
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
