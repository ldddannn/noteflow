from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models import User
from app.schemas.auth import (
    RegisterSchema,
    LoginSchema,
    UpdateProfileSchema,
    UpdatePasswordSchema,
)
from app.utils.response import success, error, format_validation_errors

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """用户注册"""
    try:
        data = RegisterSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    # 检查账号是否已存在
    if User.query.filter_by(account=data["account"]).first():
        return error("账号已存在", 409)

    # 检查邮箱是否已存在
    if User.query.filter_by(email=data["email"]).first():
        return error("邮箱已被注册", 409)

    user = User(
        account=data["account"],
        username=data["username"],
        email=data["email"],
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    return success(message="注册成功", code=201)


@auth_bp.route("/login", methods=["POST"])
def login():
    """用户登录"""
    try:
        data = LoginSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    user = User.query.filter_by(account=data["account"]).first()
    if not user or not user.check_password(data["password"]):
        return error("账号或密码错误", 401)

    access_token = create_access_token(identity=str(user.id))

    return success(
        data={
            "access_token": access_token,
            "user": user.to_dict(),
        },
        message="登录成功",
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """获取当前用户信息"""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return error("用户不存在", 404)

    return success(data=user.to_dict())


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """修改个人资料"""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return error("用户不存在", 404)

    try:
        data = UpdateProfileSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    if "username" in data:
        user.username = data["username"]
    if "avatar" in data:
        user.avatar = data["avatar"]

    db.session.commit()
    return success(data=user.to_dict(), message="修改成功")


@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def update_password():
    """修改密码"""
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return error("用户不存在", 404)

    try:
        data = UpdatePasswordSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    if not user.check_password(data["old_password"]):
        return error("原密码错误", 400)

    user.set_password(data["new_password"])
    db.session.commit()
    return success(message="密码修改成功")
