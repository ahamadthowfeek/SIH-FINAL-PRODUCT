import numpy as np
import random
import math
from scipy.spatial.distance import euclidean

class RouteOptimizer:
    def __init__(self, locations, battery_range, current_location=None):
        self.locations = locations
        self.battery_range = battery_range
        self.current_location = current_location or locations[0]
        self.n = len(locations)
        
    def distance_matrix(self):
        dist_matrix = np.zeros((self.n, self.n))
        for i in range(self.n):
            for j in range(self.n):
                if i != j:
                    dist_matrix[i][j] = euclidean(self.locations[i], self.locations[j])
        return dist_matrix
    
    def total_distance(self, route, dist_matrix):
        total = 0
        for i in range(len(route) - 1):
            total += dist_matrix[route[i]][route[i + 1]]
        # Return to start if it's a round trip
        if len(route) > 1:
            total += dist_matrix[route[-1]][route[0]]
        return total
    
    # Simulated Annealing
    def simulated_annealing(self, max_iter=1000, temp=1000, cooling_rate=0.95):
        if self.n <= 1:
            return [0], 0
            
        dist_matrix = self.distance_matrix()
        current_route = list(range(self.n))
        random.shuffle(current_route)
        current_distance = self.total_distance(current_route, dist_matrix)
        
        best_route = current_route.copy()
        best_distance = current_distance
        
        for i in range(max_iter):
            temp *= cooling_rate
            if temp < 1e-10:
                break
                
            # Generate neighbor by swapping two random cities
            new_route = current_route.copy()
            i1, i2 = random.sample(range(self.n), 2)
            new_route[i1], new_route[i2] = new_route[i2], new_route[i1]
            
            new_distance = self.total_distance(new_route, dist_matrix)
            
            # Accept worse solution with probability
            if new_distance < current_distance or random.random() < math.exp((current_distance - new_distance) / temp):
                current_route = new_route
                current_distance = new_distance
                
                if current_distance < best_distance:
                    best_route = current_route.copy()
                    best_distance = current_distance
        
        return best_route, best_distance
    
    # Genetic Algorithm
    def genetic_algorithm(self, pop_size=50, generations=100, mutation_rate=0.01):
        if self.n <= 1:
            return [0], 0
            
        dist_matrix = self.distance_matrix()
        
        def create_individual():
            individual = list(range(self.n))
            random.shuffle(individual)
            return individual
        
        def fitness(individual):
            return 1 / (self.total_distance(individual, dist_matrix) + 1e-10)
        
        # Initialize population
        population = [create_individual() for _ in range(pop_size)]
        
        for gen in range(generations):
            # Evaluate fitness
            fitnesses = [fitness(ind) for ind in population]
            
            # Selection
            selected = random.choices(population, weights=fitnesses, k=pop_size)
            
            # Crossover and mutation
            new_population = []
            for i in range(0, pop_size, 2):
                parent1, parent2 = selected[i], selected[i + 1]
                
                # Ordered crossover
                start, end = sorted(random.sample(range(self.n), 2))
                child1 = parent1[start:end]
                child2 = parent2[start:end]
                
                child1 += [gene for gene in parent2 if gene not in child1]
                child2 += [gene for gene in parent1 if gene not in child2]
                
                # Mutation
                if random.random() < mutation_rate:
                    i1, i2 = random.sample(range(self.n), 2)
                    child1[i1], child1[i2] = child1[i2], child1[i1]
                
                if random.random() < mutation_rate:
                    i1, i2 = random.sample(range(self.n), 2)
                    child2[i1], child2[i2] = child2[i2], child2[i1]
                
                new_population.extend([child1, child2])
            
            population = new_population
        
        # Find best individual
        best_individual = max(population, key=fitness)
        best_distance = self.total_distance(best_individual, dist_matrix)
        
        return best_individual, best_distance
    
    # Ant Colony Optimization
    def ant_colony_optimization(self, n_ants=10, n_iterations=100, alpha=1, beta=2, rho=0.5, Q=100):
        if self.n <= 1:
            return [0], 0
            
        dist_matrix = self.distance_matrix()
        pheromone = np.ones((self.n, self.n))
        
        best_route = None
        best_distance = float('inf')
        
        for iteration in range(n_iterations):
            all_routes = []
            all_distances = []
            
            for ant in range(n_ants):
                visited = [False] * self.n
                current_city = random.randint(0, self.n - 1)
                route = [current_city]
                visited[current_city] = True
                
                while len(route) < self.n:
                    probabilities = []
                    for next_city in range(self.n):
                        if not visited[next_city]:
                            prob = (pheromone[current_city][next_city] ** alpha) * \
                                   ((1 / (dist_matrix[current_city][next_city] + 1e-10)) ** beta)
                            probabilities.append((next_city, prob))
                    
                    if not probabilities:
                        break
                    
                    cities, probs = zip(*probabilities)
                    total_prob = sum(probs)
                    norm_probs = [p / total_prob for p in probs]
                    
                    next_city = random.choices(cities, weights=norm_probs)[0]
                    route.append(next_city)
                    visited[next_city] = True
                    current_city = next_city
                
                distance = self.total_distance(route, dist_matrix)
                all_routes.append(route)
                all_distances.append(distance)
                
                if distance < best_distance:
                    best_route = route
                    best_distance = distance
            
            # Update pheromones
            pheromone *= (1 - rho)  # Evaporation
            
            for route, distance in zip(all_routes, all_distances):
                for i in range(len(route) - 1):
                    pheromone[route[i]][route[i + 1]] += Q / distance
        
        return best_route or [0], best_distance if best_distance != float('inf') else 0
    
    # Particle Swarm Optimization
    def particle_swarm_optimization(self, n_particles=30, max_iter=100, w=0.7, c1=1.4, c2=1.4):
        if self.n <= 1:
            return [0], 0
            
        dist_matrix = self.distance_matrix()
        
        class Particle:
            def __init__(self, n):
                self.n = n
                self.position = list(range(n))
                random.shuffle(self.position)
                self.velocity = [random.uniform(-1, 1) for _ in range(n)]
                self.best_position = self.position.copy()
                self.best_score = self.total_distance(self.position)
            
            def total_distance(self, route):
                total = 0
                for i in range(len(route) - 1):
                    total += dist_matrix[route[i]][route[i + 1]]
                if len(route) > 1:
                    total += dist_matrix[route[-1]][route[0]]
                return total
            
            def update_velocity(self, global_best_position):
                for i in range(self.n):
                    r1, r2 = random.random(), random.random()
                    current_idx = self.position.index(i)
                    best_idx = self.best_position.index(i)
                    global_idx = global_best_position.index(i)
                    
                    cognitive = c1 * r1 * (best_idx - current_idx)
                    social = c2 * r2 * (global_idx - current_idx)
                    self.velocity[i] = w * self.velocity[i] + cognitive + social
            
            def update_position(self):
                # Create position based on velocity
                temp_pos = [(i, self.velocity[i]) for i in range(self.n)]
                temp_pos.sort(key=lambda x: x[1], reverse=True)
                self.position = [x[0] for x in temp_pos]
                
                current_score = self.total_distance(self.position)
                if current_score < self.best_score:
                    self.best_position = self.position.copy()
                    self.best_score = current_score
        
        particles = [Particle(self.n) for _ in range(n_particles)]
        global_best_position = min(particles, key=lambda p: p.best_score).best_position.copy()
        global_best_score = min(p.best_score for p in particles)
        
        for _ in range(max_iter):
            for particle in particles:
                particle.update_velocity(global_best_position)
                particle.update_position()
                
                if particle.best_score < global_best_score:
                    global_best_position = particle.best_position.copy()
                    global_best_score = particle.best_score
        
        return global_best_position, global_best_score