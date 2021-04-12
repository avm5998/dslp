from .db import db

from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime, timezone

class User(db.Document):
    fullname = db.StringField()
    username = db.StringField(required=True, unique=True, min_length=3)
    email = db.EmailField(required=True, unique=True)
    password = db.StringField(required=True, min_length=6)
    files = db.ListField()
    profile_image = db.ImageField(thumbnail_size=(40, 40, False))
    last_logged_in = db.DateTimeField(default=datetime.now(timezone.utc), nullable=False)
    user_activity = db.DictField()
         
    def hash_password(self):
        self.password = generate_password_hash(self.password).decode('utf8')
    
    def check_password(self, password):
        return check_password_hash(self.password, password)


class TokenBlockList(db.Document):
    jti = db.StringField(nullable=False)
    created_at = db.DateTimeField(nullable=False)