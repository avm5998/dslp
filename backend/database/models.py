from .db import db

from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime, timezone
DEFAULT_FILES = ['Mall_Customers_clustering.csv', 'credit_card_default_classification.csv', 'house_price_prediction_regression.csv']

class User(db.Document):
    fullname = db.StringField()
    username = db.StringField(required=True, unique=True, min_length=3)
    email = db.EmailField(required=True, unique=True)
    password = db.StringField(required=True, min_length=6)
    files = db.ListField()
    profile_image = db.ImageField(thumbnail_size=(40, 40, False))
    last_logged_in = db.DateTimeField(default=datetime.now(timezone.utc), nullable=False)
    user_activity = db.DictField()
    user_bio = db.StringField()
    roles =  db.ListField()        
    def hash_password(self):
        self.password = generate_password_hash(self.password).decode('utf8')
    
    def check_password(self, password):
        return check_password_hash(self.password, password)


class TokenBlockList(db.Document):
    jti = db.StringField(nullable=False)
    created_at = db.DateTimeField(nullable=False)


# class Role(db.Document):
#     # id = db.Column(db.Integer(), primary_key=True)
#     name = db.Column(db.String(50), unique=True)