import os
from flask import Flask
from flask_jwt_extended import JWTManager
from .config import config_map
from .extensions import db, migrate, jwt, cors
from .utils.errors import register_error_handlers
from .logging_config import setup_logging


def create_app(config_name=None):
    """Flask 应用工厂"""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors_origins = os.getenv("CORS_ORIGINS", "*")
    cors.init_app(app, resources={r"/api/*": {"origins": cors_origins.split(",")}})

    # JWT 错误处理
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"code": 401, "message": "token已过期"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"code": 401, "message": "token无效"}, 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return {"code": 401, "message": "缺少token"}, 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return {"code": 401, "message": "token已被撤销"}, 401

    # 注册蓝图
    from .api import register_blueprints
    register_blueprints(app)

    # 注册全局错误处理
    register_error_handlers(app)

    # 配置日志
    setup_logging(app)

    return app
