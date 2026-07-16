import os
from flask import Flask
from .config import config_map
from .extensions import db, migrate, jwt, init_cors
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
    init_cors(app)

    # 注册蓝图
    from .api import register_blueprints
    register_blueprints(app)

    # 注册全局错误处理
    register_error_handlers(app)

    # 配置日志
    setup_logging(app)

    return app
