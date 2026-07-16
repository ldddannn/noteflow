from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import Note, Todo
from app.utils.response import success

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    """仪表盘统计：笔记总数、待办总数、已完成数"""
    user_id = int(get_jwt_identity())

    note_count = Note.query.filter_by(user_id=user_id).count()
    todo_count = Todo.query.filter_by(user_id=user_id).count()
    done_count = Todo.query.filter_by(user_id=user_id, status="done").count()

    return success(
        data={
            "note_count": note_count,
            "todo_count": todo_count,
            "done_count": done_count,
        }
    )
