from flask import jsonify
from .response import error


def register_error_handlers(app):
    """注册全局错误处理器"""

    @app.errorhandler(400)
    def bad_request(e):
        return error("请求参数有误", 400)

    @app.errorhandler(404)
    def not_found(e):
        return error("资源不存在", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error("请求方法不允许", 405)

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error(f"Internal Server Error: {e}")
        return error("服务器内部错误", 500)
