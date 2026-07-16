from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.models import Note, Todo
from app.utils.response import success

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    """仪表盘统计：笔记总数、待办总数、已完成数、笔记分类统计"""
    user_id = int(get_jwt_identity())

    note_count = Note.query.filter_by(user_id=user_id).count()
    todo_count = Todo.query.filter_by(user_id=user_id).count()
    done_count = Todo.query.filter_by(user_id=user_id, status="done").count()

    tag_stats = (
        Note.query.filter_by(user_id=user_id)
        .with_entities(Note.tag, func.count(Note.tag))
        .group_by(Note.tag)
        .all()
    )

    return success(
        data={
            "note_count": note_count,
            "todo_count": todo_count,
            "done_count": done_count,
            "completion_rate": round((done_count / todo_count) * 100) if todo_count > 0 else 0,
            "tag_stats": [{"tag": t[0] or "未分类", "count": t[1]} for t in tag_stats],
        }
    )
