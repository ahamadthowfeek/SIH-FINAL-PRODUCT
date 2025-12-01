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
    
    try {
        // Create a Google Maps URL with all waypoints
        const waypoints = results.optimized_route.map(customer => {
            return encodeURIComponent(customer.address || 'Bangalore, India');
        });
        
        if (waypoints.length === 0) {
            alert('No valid addresses found for navigation.');
            return;
        }
        
        // For multiple waypoints, we need to use a different approach
        if (waypoints.length === 1) {
            // Single destination
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${waypoints[0]}&travelmode=driving`;
            window.open(mapsUrl, '_blank');
        } else {
            // Multiple destinations - create a route with waypoints
            const origin = waypoints[0];
            const destination = waypoints[waypoints.length - 1];
            const waypointsParam = waypoints.slice(1, -1).join('|');
            
            let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
            
            if (waypointsParam) {
                mapsUrl += `&waypoints=${waypointsParam}`;
            }
            
            window.open(mapsUrl, '_blank');
        }
        
    } catch (error) {
        console.error('Error creating maps URL:', error);
        alert('Error creating navigation route. Please try again.');
    }
}

function goHome() {
    window.location.href = 'home.html';
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('optimizationResults');
    window.location.href = 'index.html';
}

// Additional utility functions for enhanced functionality
function downloadRouteSummary() {
    const results = JSON.parse(localStorage.getItem('optimizationResults'));
    
    if (!results) {
        alert('No results to download.');
        return;
    }
    
    let summaryText = `EV Route Optimization Results\n`;
    summaryText += `================================\n\n`;
    summaryText += `Algorithm: ${getAlgorithmName(results.algorithm)}\n`;
    summaryText += `Total Distance: ${results.total_distance} km\n`;
    summaryText += `Estimated Time: ${results.estimated_time} minutes\n`;
    summaryText += `Effective Range: ${results.effective_range || results.total_distance * 1.2} km\n\n`;
    summaryText += `Optimized Route:\n`;
    summaryText += `================\n`;
    
    if (results.optimized_route && results.optimized_route.length > 0) {
        results.optimized_route.forEach((customer, index) => {
            summaryText += `${index + 1}. ${customer.name || `Customer ${index + 1}`}\n`;
            summaryText += `   Address: ${customer.address || 'Not specified'}\n\n`;
        });
    }
    
    // Create and download text file
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route-optimization-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function shareResults() {
    const results = JSON.parse(localStorage.getItem('optimizationResults'));
    
    if (!results) {
        alert('No results to share.');
        return;
    }
    
    const shareText = `EV Route Optimization Results:\n` +
                     `Distance: ${results.total_distance} km | ` +
                     `Time: ${results.estimated_time} min | ` +
                     `Algorithm: ${getAlgorithmName(results.algorithm)}`;
    
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: 'EV Route Optimization Results',
            text: shareText,
            url: window.location.href
        }).catch(error => {
            console.log('Error sharing:', error);
            copyToClipboard(shareText);
        });
    } else {
        // Fallback to clipboard
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Results copied to clipboard!');
    });
}

// Add event listeners for additional buttons if they exist
document.addEventListener('DOMContentLoaded', function() {
    // Add download button functionality if needed
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadRouteSummary);
    }
    
    // Add share button functionality if needed
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResults);
    }
});