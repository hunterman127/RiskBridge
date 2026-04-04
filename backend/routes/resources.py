from flask import Blueprint, request, jsonify
from services.resource_matcher import filter_resources

resources_bp = Blueprint("resources", __name__)

@resources_bp.route("/resources", methods=["GET"])
def get_resources():
    language = request.args.get("language")
    cost = request.args.get("cost")
    
    telehealth = request.args.get("telehealth")
    anonymous = request.args.get("anonymous")

    if telehealth is not None:
        telehealth = telehealth.lower() == "true"
    if anonymous is not None:
        anonymous = anonymous.lower() == "true"

    results = filter_resources(language, cost, telehealth, anonymous)

    return jsonify(results)