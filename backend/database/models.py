from .db import db

from flask_bcrypt import generate_password_hash, check_password_hash


class User(db.Document):
    fullname = db.StringField()
    username = db.StringField(required=True, unique=True, min_length=3)
    email = db.EmailField(required=True, unique=True)
    password = db.StringField(required=True, min_length=6)
    files = db.ListField()
    profile_image = db.ImageField(thumbnail_size=(40, 40, False))
    # movies = db.ListField(db.ReferenceField('Movie', reverse_delete_rule=db.PULL))
         
    def hash_password(self):
        self.password = generate_password_hash(self.password).decode('utf8')
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
