from flask import Blueprint


def register_blueprints(app):
    """注册所有 API 蓝图"""
    # 后续各模块开发时取消注释
    # from .auth import auth_bp
    # from .notes import notes_bp
    # from .todos import todos_bp
    # from .stats import stats_bp
    # app.register_blueprint(auth_bp, url_prefix="/api/auth")
    # app.register_blueprint(notes_bp, url_prefix="/api/notes")
    # app.register_blueprint(todos_bp, url_prefix="/api/todos")
    # app.register_blueprint(stats_bp, url_prefix="/api/stats")

    @app.route("/api/health")
    def health():
        return {"code": 200, "message": "ok"}
