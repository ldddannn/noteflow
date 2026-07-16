from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def init_cors(app):
    origins = app.config.get("CORS_ORIGINS", "http://localhost:3000")
    CORS(app, resources={r"/api/*": {"origins": origins.split(",")}})
