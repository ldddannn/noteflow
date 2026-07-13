from flask import jsonify


def success(data=None, message="success", code=200):
    """统一成功响应"""
    return jsonify({"code": code, "message": message, "data": data}), code


def error(message="error", code=400, data=None):
    """统一错误响应"""
    return jsonify({"code": code, "message": message, "data": data}), code
