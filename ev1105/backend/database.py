import sqlite3
import json
from datetime import datetime

class Database:
    def __init__(self):
        self.init_db()
    
    def init_db(self):
        conn = sqlite3.connect('ev_route.db')
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_number TEXT UNIQUE NOT NULL,
                company TEXT NOT NULL,
                model TEXT NOT NULL,
                year INTEGER NOT NULL,
                battery_capacity REAL NOT NULL,
                vehicle_range REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Routes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS routes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_number TEXT NOT NULL,
                algorithm TEXT NOT NULL,
                customer_data TEXT NOT NULL,
                battery_percentage REAL NOT NULL,
                temperature REAL NOT NULL,
                load_carry REAL NOT NULL,
                optimized_route TEXT NOT NULL,
                total_distance REAL NOT NULL,
                estimated_time REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_user(self, user_data):
        conn = sqlite3.connect('ev_route.db')
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (vehicle_number, company, model, year, battery_capacity, vehicle_range)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                user_data['vehicle_number'],
                user_data['company'],
                user_data['model'],
                user_data['year'],
                user_data['battery_capacity'],
                user_data['vehicle_range']
            ))
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()
    
    def get_user(self, vehicle_number):
        conn = sqlite3.connect('ev_route.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE vehicle_number = ?', (vehicle_number,))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                'id': user[0],
                'vehicle_number': user[1],
                'company': user[2],
                'model': user[3],
                'year': user[4],
                'battery_capacity': user[5],
                'vehicle_range': user[6]
            }
        return None
    
    def save_route(self, route_data):
        conn = sqlite3.connect('ev_route.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO routes (vehicle_number, algorithm, customer_data, battery_percentage, 
                              temperature, load_carry, optimized_route, total_distance, estimated_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            route_data['vehicle_number'],
            route_data['algorithm'],
            json.dumps(route_data['customer_data']),
            route_data['battery_percentage'],
            route_data['temperature'],
            route_data['load_carry'],
            json.dumps(route_data['optimized_route']),
            route_data['total_distance'],
            route_data['estimated_time']
        ))
        
        conn.commit()
        route_id = cursor.lastrowid
        conn.close()
        
        return route_id