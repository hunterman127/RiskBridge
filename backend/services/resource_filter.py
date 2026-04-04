# =============================================================
# resource_filter.py
# Person 4 — Risk Model + Data Layer
# RiskBridge | Texas Healthcare Access Risk Prediction
# =============================================================

import json
import os

# ----------------------------
# LOAD RESOURCE DATA
# ----------------------------
_current_dir   = os.path.dirname(os.path.abspath(__file__))
_resources_path = os.path.join(_current_dir, "..", "data", "resources.json")

with open(_resources_path, "r", encoding="utf-8") as f:
    ALL_RESOURCES = json.load(f)


# ----------------------------
# MAIN FILTER FUNCTION
# ----------------------------
def get_filtered_resources(risk_scores, filters):
    """
    Match and filter resources based on risk scores and user preferences.

    risk_scores: output dict from compute_risk_score() in risk_model.py
    filters: {
        "stigma_mode":     bool,      True = anonymous resources only
        "language":        str,       e.g. "spanish"
        "telehealth_only": bool,      True = only telehealth resources
        "cost":            str,       "free" | "sliding_scale" | "any"
        "conditions":      list[str], e.g. ["diabetes", "hypertension"]
        "age_group":       str,       e.g. "26-40"
        "region":          str        e.g. "rio_grande_valley"
    }
    """
    results = []

    for resource in ALL_RESOURCES:

        # FILTER 1: Risk threshold
        relevant = any(
            risk_scores.get(tag, 0) >= resource["threshold"]
            for tag in resource["tags"]
        )
        if not relevant:
            continue

        # FILTER 2: Stigma-sensitive mode — anonymous only
        if filters.get("stigma_mode", False) and not resource.get("anonymous", False):
            continue

        # FILTER 3: Language
        user_language = filters.get("language", "english").lower().strip()
        if user_language and user_language not in resource.get("languages", ["english"]):
            continue

        # FILTER 4: Telehealth only
        if filters.get("telehealth_only", False) and not resource.get("telehealth", False):
            continue

        # FILTER 5: Cost
        cost_pref = filters.get("cost", "any").lower()
        if cost_pref != "any" and resource.get("cost") != cost_pref:
            continue

        # FILTER 6: Conditions
        user_conditions     = [c.lower() for c in filters.get("conditions", [])]
        resource_conditions = [c.lower() for c in resource.get("conditions", [])]
        if user_conditions and not any(c in resource_conditions for c in user_conditions):
            continue

        # FILTER 7: Age group
        user_age = filters.get("age_group", "")
        if user_age and user_age not in resource.get("age_groups", []):
            continue

        # FILTER 8: Region — also allow statewide resources through
        user_region     = filters.get("region", "")
        resource_region = resource.get("region", "")
        if user_region and resource_region not in (user_region, "statewide"):
            continue

        results.append(resource)

    # Sort: condition match first → free cost → highest risk relevance
    user_conditions = [c.lower() for c in filters.get("conditions", [])]
    results.sort(key=lambda r: (
        not any(c in [x.lower() for x in r.get("conditions", [])] for c in user_conditions),
        r.get("cost") != "free",
        -max(risk_scores.get(tag, 0) for tag in r.get("tags", ["financial_risk"]))
    ))

    return results


# ----------------------------
# HELPER FUNCTIONS
# For Person 1's frontend dropdowns
# ----------------------------
def get_regions():
    return sorted(set(r.get("region") for r in ALL_RESOURCES))

def get_conditions():
    all_conditions = set()
    for r in ALL_RESOURCES:
        all_conditions.update(r.get("conditions", []))
    return sorted(all_conditions)

def get_languages():
    all_languages = set()
    for r in ALL_RESOURCES:
        all_languages.update(r.get("languages", []))
    return sorted(all_languages)


# ----------------------------
# QUICK TEST — python resource_filter.py
# ----------------------------
if __name__ == "__main__":
    from backend.services.risk_model import compute_risk_score

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

    scores = compute_risk_score(test_input)

    print("=== RiskBridge Score Output ===")
    for key, value in scores.items():
        print(f"  {key}: {value}")

    mock_filters = {
        "stigma_mode":     False,
        "language":        "spanish",
        "telehealth_only": False,
        "cost":            "any",
        "conditions":      ["diabetes", "hypertension"],
        "age_group":       "26-40",
        "region":          "rio_grande_valley"
    }

    matches = get_filtered_resources(scores, mock_filters)

    print(f"\n=== RiskBridge Resource Matches ({len(matches)} found) ===\n")
    for r in matches:
        print(f"  [{r['id']}] {r['name']} — {r['city']}, {r['state']}")
        print(f"        Cost: {r['cost']} | Telehealth: {r['telehealth']} | Anonymous: {r['anonymous']}")
        print(f"        Conditions: {', '.join(r.get('conditions', []))}")
        print()

    print("Regions available:   ", get_regions())
    print("Conditions available:", get_conditions())
    print("Languages available: ", get_languages())