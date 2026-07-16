from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models import Todo
from app.schemas.todo import TodoSchema, TodoUpdateSchema
from app.utils.response import success, error, format_validation_errors

todos_bp = Blueprint("todos", __name__)


@todos_bp.route("", methods=["GET"])
@jwt_required()
def list_todos():
    """获取当前用户的待办列表，支持 ?status=pending|done 过滤"""
    user_id = int(get_jwt_identity())
    query = Todo.query.filter_by(user_id=user_id)

    status = request.args.get("status")
    if status in ("pending", "done"):
        query = query.filter_by(status=status)

    todos = query.order_by(Todo.order.asc(), Todo.created_at.desc()).all()
    return success(data=[t.to_dict() for t in todos])


@todos_bp.route("", methods=["POST"])
@jwt_required()
def create_todo():
    """创建待办"""
    user_id = int(get_jwt_identity())

    try:
        data = TodoSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    max_order = Todo.query.filter_by(user_id=user_id).with_entities(db.func.max(Todo.order)).scalar() or 0
    todo = Todo(title=data["title"], user_id=user_id, order=max_order + 1)
    db.session.add(todo)
    db.session.commit()

    return success(data=todo.to_dict(), message="创建成功", code=201)


@todos_bp.route("/<int:todo_id>", methods=["GET"])
@jwt_required()
def get_todo(todo_id):
    """获取单条待办"""
    user_id = int(get_jwt_identity())
    todo = db.session.get(Todo, todo_id)

    if not todo:
        return error("待办不存在", 404)
    if todo.user_id != user_id:
        return error("无权访问", 403)

    return success(data=todo.to_dict())


@todos_bp.route("/<int:todo_id>", methods=["PUT"])
@jwt_required()
def update_todo(todo_id):
    """更新待办（标题/状态/排序）"""
    user_id = int(get_jwt_identity())
    todo = db.session.get(Todo, todo_id)

    if not todo:
        return error("待办不存在", 404)
    if todo.user_id != user_id:
        return error("无权访问", 403)

    try:
        data = TodoUpdateSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    if "title" in data:
        todo.title = data["title"]
    if "status" in data:
        todo.status = data["status"]
    if "order" in data:
        todo.order = data["order"]

    db.session.commit()
    return success(data=todo.to_dict(), message="更新成功")


@todos_bp.route("/reorder", methods=["POST"])
@jwt_required()
def reorder_todos():
    """批量更新待办排序"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or "order" not in data:
        return error("缺少排序数据", 400)

    try:
        for idx, todo_id in enumerate(data["order"]):
            todo = db.session.get(Todo, todo_id)
            if todo and todo.user_id == user_id:
                todo.order = idx + 1
        db.session.commit()
        return success(message="排序更新成功")
    except Exception as e:
        db.session.rollback()
        return error("排序更新失败", 500)


@todos_bp.route("/<int:todo_id>", methods=["DELETE"])
@jwt_required()
def delete_todo(todo_id):
    """删除待办"""
    user_id = int(get_jwt_identity())
    todo = db.session.get(Todo, todo_id)

    if not todo:
        return error("待办不存在", 404)
    if todo.user_id != user_id:
        return error("无权访问", 403)

    db.session.delete(todo)
    db.session.commit()

    return success(message="删除成功")