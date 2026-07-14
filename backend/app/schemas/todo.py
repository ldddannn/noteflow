from marshmallow import Schema, fields, validate


class TodoSchema(Schema):
    """创建待办校验"""
    title = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=200),
        error_messages={"required": "标题不能为空"},
    )


class TodoUpdateSchema(Schema):
    """更新待办校验"""
    title = fields.Str(validate=validate.Length(min=1, max=200))
    status = fields.Str(validate=validate.OneOf(["pending", "done"]))
