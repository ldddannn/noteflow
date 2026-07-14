import json
from flask import jsonify


def success(data=None, message="success", code=200):
    """统一成功响应"""
    return jsonify({"code": code, "message": message, "data": data}), code


def error(message="error", code=400, data=None):
    """统一错误响应"""
    return jsonify({"code": code, "message": message, "data": data}), code


def format_validation_errors(messages: dict) -> str:
    """将 Marshmallow 校验错误 dict 转为可读字符串

    {"username": ["不能为空"], "email": ["邮箱格式不正确"]}
    → "username: 不能为空; email: 邮箱格式不正确"
    """
    parts = []
    for field, msgs in messages.items():
        parts.append(f"{field}: {', '.join(msgs)}")
    return "; ".join(parts)
