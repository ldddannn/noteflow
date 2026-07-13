from marshmallow import Schema, fields, validate


class RegisterSchema(Schema):
    username = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=80),
        error_messages={"required": "用户名不能为空"},
    )
    email = fields.Email(
        required=True,
        error_messages={"required": "邮箱不能为空", "invalid": "邮箱格式不正确"},
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        error_messages={"required": "密码不能为空"},
    )


class LoginSchema(Schema):
    username = fields.Str(
        required=True,
        error_messages={"required": "用户名不能为空"},
    )
    password = fields.Str(
        required=True,
        error_messages={"required": "密码不能为空"},
    )


class UpdateProfileSchema(Schema):
    username = fields.Str(validate=validate.Length(min=2, max=80))


class UpdatePasswordSchema(Schema):
    old_password = fields.Str(required=True, error_messages={"required": "原密码不能为空"})
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        error_messages={"required": "新密码不能为空"},
    )
