// Theme toggle for results page
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const currentTheme = localStorage.getItem('theme') || 'light-mode';
    document.body.className = currentTheme;
    updateThemeButton();

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode');
        
        const newTheme = document.body.className;
        localStorage.setItem('theme', newTheme);
        updateThemeButton();
    });

    function updateThemeButton() {
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
        } else {
            themeToggle.textContent = '🌙';
        }
    }
}

// Results display
document.addEventListener('DOMContentLoaded', function() {
    const results = JSON.parse(localStorage.getItem('optimizationResults'));
    const loadingMessage = document.getElementById('loadingMessage');
    const resultsContent = document.getElementById('resultsContent');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!results) {
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'block';
        return;
    }
    
    // Simulate loading for better UX
    setTimeout(() => {
        loadingMessage.style.display = 'none';
        resultsContent.style.display = 'block';
        displayResults(results);
    }, 1000);
});

function displayResults(results) {
    console.log('Displaying results:', results);
    
    // Update summary cards
    document.getElementById('totalDistance').textContent = `${results.total_distance} km`;
    document.getElementById('estimatedTime').textContent = `${results.estimated_time} min`;
    document.getElementById('effectiveRange').textContent = `${results.effective_range || results.total_distance * 1.2} km`;
    document.getElementById('algorithmUsed').textContent = getAlgorithmName(results.algorithm);
    
    // Display route sequence
    const routeSequence = document.getElementById('routeSequence');
    routeSequence.innerHTML = '';
    
    if (results.optimized_route && results.optimized_route.length > 0) {
        results.optimized_route.forEach((customer, index) => {
            const routeItem = document.createElement('div');
            routeItem.className = 'route-item';
            routeItem.innerHTML = `
                <div class="route-number">${index + 1}</div>
                <div class="route-details">
                    <strong>${customer.name || `Customer ${index + 1}`}</strong>
                    <div>${customer.address || 'Address not specified'}</div>
                </div>
            `;
            routeSequence.appendChild(routeItem);
        });
    } else {
        routeSequence.innerHTML = '<div class="route-item">No route data available</div>';
    }
}

function getAlgorithmName(algorithm) {
    const algorithmNames = {
        'SA': 'Simulated Annealing',
        'GA': 'Genetic Algorithm',
        'ACO': 'Ant Colony Optimization',
        'PSO': 'Particle Swarm Optimization'
    };
    return algorithmNames[algorithm] || algorithm || 'Unknown Algorithm';
}

function navigateToMap() {
    const results = JSON.parse(localStorage.getItem('optimizationResults'));
    
    if (!results || !results.optimized_route || results.optimized_route.length === 0) {
        alert('No route data available for navigation.');
        return;
    }
    
    // For demo purposes, we'll use Google Maps with the first customer's address
    const firstCustomer = results.optimized_route[0];
    const address = encodeURIComponent(firstCustomer.address || 'Bangalore, India');
    
    // Using Google Maps (free tier allows limited requests)
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`;
    
    window.open(mapsUrl, '_blank');
}

function goHome() {
    window.location.href = 'home.html';
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('optimizationResults');
    window.location.href = 'index.html';
}