from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from database import Database
from algorithms import RouteOptimizer

app = Flask(__name__)
CORS(app)
db = Database()

# Load EV data
with open('ev_data.json', 'r') as f:
    EV_DATA = json.load(f)

@app.route('/api/ev-data', methods=['GET'])
def get_ev_data():
    return jsonify(EV_DATA)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    success = db.create_user(data)
    if success:
        return jsonify({'message': 'User created successfully'}), 201
    else:
        return jsonify({'error': 'Vehicle number already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = db.get_user(data['vehicle_number'])
    if user:
        return jsonify({'message': 'Login successful', 'user': user}), 200
    else:
        return jsonify({'error': 'Invalid vehicle number'}), 401

@app.route('/api/optimize', methods=['POST'])
def optimize_route():
    data = request.json
    
    # Extract data
    algorithm = data['algorithm']
    customer_data = data['customer_data']
    battery_percentage = data['battery_percentage']
    vehicle_range = data['vehicle_range']
    
    # Convert locations to coordinates (for demo, using random coordinates)
    locations = []
    for customer in customer_data:
        # In real implementation, use geocoding API to convert addresses to coordinates
        lat = customer.get('lat', np.random.uniform(12.8, 13.2))
        lng = customer.get('lng', np.random.uniform(77.5, 77.7))
        locations.append((lat, lng))
    
    # Calculate effective range based on battery percentage and load
    effective_range = vehicle_range * (battery_percentage / 100)
    load_factor = 1 - (data['load_carry'] / 1000) * 0.1  # 10% reduction per 100kg
    effective_range *= load_factor
    temperature_factor = 1 - (max(0, data['temperature'] - 25) / 100) * 0.2  # 20% reduction above 25°C
    effective_range *= temperature_factor
    
    # Initialize optimizer
    optimizer = RouteOptimizer(locations, effective_range)
    
    # Select algorithm
    if algorithm == 'SA':
        route, distance = optimizer.simulated_annealing()
    elif algorithm == 'GA':
        route, distance = optimizer.genetic_algorithm()
    elif algorithm == 'ACO':
        route, distance = optimizer.ant_colony_optimization()
    elif algorithm == 'PSO':
        route, distance = optimizer.particle_swarm_optimization()
    else:
        return jsonify({'error': 'Invalid algorithm'}), 400
    
    # Check if route is feasible
    if distance > effective_range:
        return jsonify({'error': 'Route exceeds vehicle range. Please reduce number of customers or charge battery.'}), 400
    
    # Calculate estimated time (assuming average speed of 30 km/h)
    estimated_time = (distance / 30) * 60  # in minutes
    
    # Prepare optimized customer order
    optimized_customers = [customer_data[i] for i in route]
    
    # Save to database
    route_data = {
        'vehicle_number': data['vehicle_number'],
        'algorithm': algorithm,
        'customer_data': customer_data,
        'battery_percentage': battery_percentage,
        'temperature': data['temperature'],
        'load_carry': data['load_carry'],
        'optimized_route': optimized_customers,
        'total_distance': distance,
        'estimated_time': estimated_time
    }
    
    route_id = db.save_route(route_data)
    
    return jsonify({
        'route_id': route_id,
        'optimized_route': optimized_customers,
        'total_distance': round(distance, 2),
        'estimated_time': round(estimated_time, 2),
        'effective_range': round(effective_range, 2)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)