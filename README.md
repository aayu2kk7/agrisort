# AgriSort - Smart Crop Pricing and Storage System

A farmer-centric web platform providing real-time crop pricing from multiple mandis, storage facility information, and market comparison tools.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript, Tailwind CSS
- **Backend:** Python, Flask, MySQL
- **Algorithms:** Quick Sort, Binary Search, Greedy Algorithm

## Features
- Dual role authentication (Farmer & Mandi Operator)
- Real-time crop pricing from multiple mandis
- Smart price comparison with Quick Sort (O(n log n))
- Fast crop search with Binary Search (O(log n))
- Optimal storage allocation using Greedy Algorithm
- Multi-language support (7 regional languages)
- RESTful APIs

## Installation
```bash
# Clone repository
git clone https://github.com/aayu2kk7/agrisort.git

# Navigate to project
cd agrisort

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run application
python run.py
```

## Project Structure
```
agrisort/
├── app/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── services/        # Algorithm implementations
│   └── utils/           # Helper functions
├── frontend/            # HTML, CSS, JS files
├── requirements.txt
└── run.py
```

## Algorithms Implemented
1. **Quick Sort** - O(n log n) time complexity for price sorting
2. **Binary Search** - O(log n) time complexity for crop search
3. **Greedy Algorithm** - Optimal storage facility allocation

## API Endpoints

### Authentication
- `POST /api/auth/register/farmer` - Register farmer
- `POST /api/auth/register/mandi-operator` - Register mandi operator
- `POST /api/auth/login` - User login

### Farmer Routes
- `GET /api/farmer/dashboard` - Farmer dashboard
- `GET /api/farmer/crop-prices` - Get crop prices
- `POST /api/farmer/compare-prices` - Compare prices across mandis
- `GET /api/farmer/storage-facilities` - Find storage facilities

### Mandi Operator Routes
- `POST /api/mandi-operator/mandis` - Create new mandi
- `POST /api/mandi-operator/mandis/{id}/prices` - Add/update crop prices
- `GET /api/mandi-operator/all-market-prices` - View all market prices

## License
MIT License