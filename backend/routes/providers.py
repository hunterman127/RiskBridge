from flask import Blueprint, request, jsonify
from services.nppes_client import search_providers

providers_bp = Blueprint("providers", __name__)

@providers_bp.route("/providers", methods=["GET"])
def get_providers():
    state = request.args.get("state")
    city = request.args.get("city")
    taxonomy = request.args.get("taxonomy")

    try:
        providers = search_providers(
            state=state,
            city=city,
            taxonomy_desc=taxonomy
        )
        return jsonify(providers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500