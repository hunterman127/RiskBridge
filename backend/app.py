from flask import Flask, jsonify
from flask_cors import CORS
from routes.resources import resources_bp
from routes.risk import risk_bp
from routes.providers import providers_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(resources_bp)
app.register_blueprint(risk_bp)
app.register_blueprint(providers_bp)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "RiskBridge backend running"})

if __name__ == "__main__":
    app.run(debug=True)