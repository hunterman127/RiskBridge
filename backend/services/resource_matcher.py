import json
import os

def load_resources():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "..", "data", "resources.json")

    with open(file_path) as f:
        return json.load(f)

def filter_resources(language=None, cost=None, telehealth=None, anonymous=None):
    resources = load_resources()
    filtered = []

    for r in resources:
        if language and language not in r["language"]:
            continue
        if cost and r["cost"] != cost:
            continue
        if telehealth is not None and r["telehealth"] != telehealth:
            continue
        if anonymous is not None and r["anonymous"] != anonymous:
            continue

        filtered.append(r)

    return filtered