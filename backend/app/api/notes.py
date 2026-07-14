from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models import Note
from app.schemas.note import NoteSchema
from app.utils.response import success, error, format_validation_errors

notes_bp = Blueprint("notes", __name__)


@notes_bp.route("", methods=["GET"])
@jwt_required()
def list_notes():
    """获取当前用户的笔记列表（按更新时间倒序）"""
    user_id = int(get_jwt_identity())
    notes = (
        Note.query
        .filter_by(user_id=user_id)
        .order_by(Note.updated_at.desc())
        .all()
    )
    return success(data=[n.to_dict() for n in notes])


@notes_bp.route("", methods=["POST"])
@jwt_required()
def create_note():
    """创建笔记"""
    user_id = int(get_jwt_identity())

    try:
        data = NoteSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    note = Note(
        title=data["title"],
        content=data["content"],
        tag=data.get("tag"),
        user_id=user_id,
    )
    db.session.add(note)
    db.session.commit()

    return success(data=note.to_dict(), message="创建成功", code=201)


@notes_bp.route("/<int:note_id>", methods=["GET"])
@jwt_required()
def get_note(note_id):
    """获取单条笔记"""
    user_id = int(get_jwt_identity())
    note = db.session.get(Note, note_id)

    if not note:
        return error("笔记不存在", 404)
    if note.user_id != user_id:
        return error("无权访问", 403)

    return success(data=note.to_dict())


@notes_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required()
def update_note(note_id):
    """更新笔记"""
    user_id = int(get_jwt_identity())
    note = db.session.get(Note, note_id)

    if not note:
        return error("笔记不存在", 404)
    if note.user_id != user_id:
        return error("无权访问", 403)

    try:
        data = NoteSchema().load(request.get_json() or {})
    except ValidationError as e:
        return error(format_validation_errors(e.messages), 400)

    note.title = data["title"]
    note.content = data["content"]
    note.tag = data.get("tag")
    db.session.commit()

    return success(data=note.to_dict(), message="更新成功")


@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    """删除笔记"""
    user_id = int(get_jwt_identity())
    note = db.session.get(Note, note_id)

    if not note:
        return error("笔记不存在", 404)
    if note.user_id != user_id:
        return error("无权访问", 403)

    db.session.delete(note)
    db.session.commit()

    return success(message="删除成功")
