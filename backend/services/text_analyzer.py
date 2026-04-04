def analyze_text(text):
    if not text:
        return {
            "stigma_score": 0.0,
            "emotion": "neutral",
            "detected_barriers": []
        }

    text = text.lower().strip()

    stigma_score = 0.0
    emotion = "neutral"
    detected_barriers = []

    stigma_phrases = [
        "do not feel comfortable",
        "don't feel comfortable",
        "ashamed",
        "shame",
        "embarrassed",
        "judged",
        "judge",
        "stigma",
        "scared",
        "afraid",
        "uncomfortable"
    ]

    financial_phrases = [
        "can't afford",
        "cannot afford",
        "no insurance",
        "expensive",
        "cost",
        "money"
    ]

    if any(phrase in text for phrase in stigma_phrases):
        stigma_score = 0.9
        emotion = "fear/shame"
        detected_barriers.append("stigma")

    if any(phrase in text for phrase in financial_phrases):
        detected_barriers.append("financial")

    return {
        "stigma_score": stigma_score,
        "emotion": emotion,
        "detected_barriers": detected_barriers
    }