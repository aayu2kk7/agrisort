from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Mandi, CropPrice
import os

app = Flask(__name__)
CORS(app)

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///agrisort.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize DB
with app.app_context():
    db.create_all()
    # Seed if empty
    if not User.query.first():
        # Demo users
        farmer = User(username='farmer', password='123', role='farmer')
        operator = User(username='operator', password='123', role='operator')
        db.session.add(farmer)
        db.session.add(operator)
        db.session.commit()
        
        # Demo Mandis
        mandis_data = [
            {'name': 'Azadpur Mandi', 'location': 'Delhi'},
            {'name': 'Ghazipur Mandi', 'location': 'Delhi'},
            {'name': 'Okhla Mandi', 'location': 'Delhi'},
            {'name': 'Narela Mandi', 'location': 'Delhi'},
            {'name': 'Najafgarh Mandi', 'location': 'Delhi'},
            {'name': 'Keshopur Mandi', 'location': 'Delhi'},
            {'name': 'Shahdara Mandi', 'location': 'Delhi'}
        ]
        
        mandis = []
        for m_data in mandis_data:
            m = Mandi(name=m_data['name'], location=m_data['location'], operator_id=operator.id)
            db.session.add(m)
            mandis.append(m)
        db.session.commit()
        
        # Demo Crops
        crops = [
            {'name': 'Wheat', 'variety': 'Common', 'base': 2100},
            {'name': 'Rice', 'variety': 'Basmati', 'base': 3200},
            {'name': 'Maize', 'variety': 'Hybrid', 'base': 1850},
            {'name': 'Potato', 'variety': 'Agra Red', 'base': 850},
            {'name': 'Onion', 'variety': 'Nasik', 'base': 1400},
            {'name': 'Tomato', 'variety': 'Hybrid', 'base': 1200},
            {'name': 'Mustard', 'variety': 'Black', 'base': 4500},
            {'name': 'Cotton', 'variety': 'Long Staple', 'base': 6000},
            {'name': 'Sugarcane', 'variety': 'Co-0238', 'base': 350},
            {'name': 'Barley', 'variety': 'Malt', 'base': 1600}
        ]
        
        import random
        prices = []
        for mandi in mandis:
            for crop in crops:
                # Randomize price slightly per mandi
                variation = random.randint(-100, 100)
                price_val = crop['base'] + variation
                
                p = CropPrice(
                    crop=crop['name'], 
                    variety=crop['variety'], 
                    price=price_val, 
                    mandi_id=mandi.id
                )
                prices.append(p)
        
        db.session.add_all(prices)
        db.session.commit()

# --- Auth Routes ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username exists'}), 400
    
    user = User(username=data['username'], password=data['password'], role=data['role'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict())

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if user:
        return jsonify(user.to_dict())
    return jsonify({'error': 'Invalid credentials'}), 401

# --- Operator Routes ---

@app.route('/api/operator/mandi', methods=['POST'])
def create_mandi():
    data = request.json
    # In real app, verify operator_id from token/session
    mandi = Mandi(name=data['name'], location=data['location'], operator_id=data['operator_id'])
    db.session.add(mandi)
    db.session.commit()
    return jsonify(mandi.to_dict())

@app.route('/api/operator/mandi/<int:operator_id>', methods=['GET'])
def get_operator_mandis(operator_id):
    mandis = Mandi.query.filter_by(operator_id=operator_id).all()
    return jsonify([m.to_dict() for m in mandis])

@app.route('/api/operator/price', methods=['POST'])
def add_price():
    data = request.json
    price = CropPrice(
        crop=data['crop'],
        variety=data['variety'],
        price=data['price'],
        mandi_id=data['mandi_id']
    )
    db.session.add(price)
    db.session.commit()
    return jsonify(price.to_dict())

# --- Public Routes ---

@app.route('/api/prices')
def get_prices():
    prices = CropPrice.query.all()
    return jsonify([p.to_dict() for p in prices])

@app.route('/api/storage')
def get_storage():
    # Still using mock for storage as it wasn't requested to be DB-backed explicitly, 
    # but we can update if needed. Keeping it simple for now.
    import random
    types = ['Warehouse', 'Cold Storage', 'Silo', 'Open Yard']
    facilities = []
    for i in range(10):
        facilities.append({
            'id': i + 1,
            'name': f"AgriStore {random.choice(['North', 'South', 'East', 'West'])} {i+1}",
            'type': random.choice(types),
            'capacity': random.randint(1000, 5000),
            'available': random.randint(100, 900),
            'rate': random.randint(50, 200),
            'distance': random.randint(5, 50),
            'rating': round(random.uniform(3.5, 5.0), 1),
            'coordinates': {'lat': 28.7 + random.uniform(-0.1, 0.1), 'lng': 77.1 + random.uniform(-0.1, 0.1)}
        })
    return jsonify(facilities)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
