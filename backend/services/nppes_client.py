import requests

BASE_URL = "https://npiregistry.cms.hhs.gov/api/"

def search_providers(state=None, city=None, taxonomy_desc=None, limit=5):
    params = {
        "version": "2.1",
        "limit": limit
    }

    if state:
        params["state"] = state
    if city:
        params["city"] = city
    if taxonomy_desc:
        params["taxonomy_description"] = taxonomy_desc

    response = requests.get(BASE_URL, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    results = data.get("results", [])

    providers = []

    for p in results:
        basic = p.get("basic", {})
        addresses = p.get("addresses", [])

        practice_address = None
        for addr in addresses:
            if addr.get("address_purpose") == "LOCATION":
                practice_address = addr
                break

        providers.append({
            "name": basic.get("name") or (
                f"{basic.get('first_name', '')} {basic.get('last_name', '')}".strip()
            ),
            "credential": basic.get("credential"),
            "enumeration_type": p.get("enumeration_type"),
            "address": {
                "line1": practice_address.get("address_1") if practice_address else None,
                "city": practice_address.get("city") if practice_address else None,
                "state": practice_address.get("state") if practice_address else None,
                "postal_code": practice_address.get("postal_code") if practice_address else None,
                "telephone": practice_address.get("telephone_number") if practice_address else None
            }
        })

    return providers