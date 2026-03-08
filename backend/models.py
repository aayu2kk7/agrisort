from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False) # In real app, use hash
    role = db.Column(db.String(20), nullable=False) # 'farmer' or 'operator'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }

class Mandi(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    operator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationship
    prices = db.relationship('CropPrice', backref='mandi', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'operator_id': self.operator_id
        }

class CropPrice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    crop = db.Column(db.String(50), nullable=False)
    variety = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(20), default=datetime.now().strftime('%Y-%m-%d'))
    trend = db.Column(db.String(10), default='up') # up/down
    mandi_id = db.Column(db.Integer, db.ForeignKey('mandi.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'crop': self.crop,
            'variety': self.variety,
            'price': self.price,
            'date': self.date,
            'trend': self.trend,
            'market': self.mandi.name, # Include mandi name in response
            'mandi_id': self.mandi_id
        }
