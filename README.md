# AgriSort - Smart Agricultural Platform

AgriSort is a comprehensive agricultural price and storage management platform designed for Indian farmers. It leverages modern web technologies and efficient algorithms to provide real-time insights, intelligent comparisons, and optimal storage solutions.

## Features

### 1. Real-time Price Dashboard
- Displays live crop prices from various mandis.
- Auto-refreshes every 5 minutes.
- Visual trend indicators (Up/Down).

### 2. Intelligent Price Comparison
- **Algorithms**: Quick Sort, Merge Sort, Heap Sort.
- Compares markets based on Price, Distance, and Profit Margin.
- Highlights best options for farmers.

### 3. Smart Search
- **Algorithm**: Binary Search (O(log n)).
- Instant search for crops and markets.
- Search history and autocomplete.

### 4. Storage Facility Finder
- **Algorithm**: Greedy Allocation Strategy.
- **Algorithm**: Dijkstra's Shortest Path for Road Distance.
- Scores facilities based on Proximity, Cost, Availability, and Rating.
- Interactive map integration.

### 5. Multi-language Support
- Supports English, Hindi, Punjabi, and more.
- Seamless language switching.

### 6. Authentication & Operator Dashboard (New)
- **Role-based Auth**: Separate logins for Farmers and Mandi Operators.
- **Operator Dashboard**: Add new Mandis and update crop prices.
- **Database**: SQLite integration for persistent data.

## Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript (ES6 Modules).
- **Backend**: Python (Flask), SQLAlchemy (SQLite).
- **Maps**: Leaflet.js (OpenStreetMap).

## Setup Instructions

1. **Backend Setup**:
   ```bash
   cd backend
   pip install flask flask-cors flask-sqlalchemy
   python app.py
   ```
   The API will run at `http://localhost:5000`.

2. **Frontend Setup**:
   - Open `frontend/login.html` to start.
   - Use `frontend/index.html` for direct Farmer access (if logged in).

## Algorithm Complexity

- **Quick Sort**: O(n log n) average - Used for general sorting.
- **Merge Sort**: O(n log n) stable - Used for large datasets.
- **Binary Search**: O(log n) - Used for fast retrieval.
- **Greedy Strategy**: O(n log n) - Used for optimal resource allocation.
- **Dijkstra's Algorithm**: O(E + V log V) - Used for shortest path calculation in road networks.
