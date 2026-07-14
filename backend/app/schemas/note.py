from marshmallow import Schema, fields, validate


class NoteSchema(Schema):
    """创建/更新笔记校验"""
    title = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=200),
        error_messages={"required": "标题不能为空"},
    )
    content = fields.Str(
        required=True,
        error_messages={"required": "内容不能为空"},
    )
    tag = fields.Str(
        validate=validate.Length(max=50),
        allow_none=True,
    )
