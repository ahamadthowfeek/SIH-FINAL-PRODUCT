// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
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

// EV Data Management
let evData = {};

async function loadEVData() {
    try {
        const response = await fetch('http://localhost:5000/api/ev-data');
        evData = await response.json();
        populateCompanies();
    } catch (error) {
        console.error('Error loading EV data:', error);
    }
}

function populateCompanies() {
    const companySelect = document.getElementById('company');
    companySelect.innerHTML = '<option value="">Select Company</option>';
    
    for (const company in evData) {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companySelect.appendChild(option);
    }
}

function loadModels() {
    const companySelect = document.getElementById('company');
    const modelSelect = document.getElementById('model');
    const yearSelect = document.getElementById('year');
    const batteryCapacity = document.getElementById('batteryCapacity');
    const vehicleRange = document.getElementById('vehicleRange');
    
    const selectedCompany = companySelect.value;
    
    // Reset
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    batteryCapacity.textContent = '- kWh';
    vehicleRange.textContent = '- km';
    
    if (selectedCompany && evData[selectedCompany]) {
        for (const model in evData[selectedCompany]) {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        }
    }
    
    // Populate years
    yearSelect.innerHTML = '<option value="">Select Year</option>';
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2010; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Update specs when model is selected
document.addEventListener('DOMContentLoaded', function() {
    const modelSelect = document.getElementById('model');
    if (modelSelect) {
        modelSelect.addEventListener('change', updateVehicleSpecs);
    }
    
    if (document.getElementById('company')) {
        loadEVData();
    }
});

function updateVehicleSpecs() {
    const companySelect = document.getElementById('company');
    const modelSelect = document.getElementById('model');
    const batteryCapacity = document.getElementById('batteryCapacity');
    const vehicleRange = document.getElementById('vehicleRange');
    
    const selectedCompany = companySelect.value;
    const selectedModel = modelSelect.value;
    
    if (selectedCompany && selectedModel && evData[selectedCompany] && evData[selectedCompany][selectedModel]) {
        const specs = evData[selectedCompany][selectedModel];
        batteryCapacity.textContent = `${specs.battery_capacity} kWh`;
        vehicleRange.textContent = `${specs.range} km`;
    }
}

// Login Functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const vehicleNumber = document.getElementById('vehicleNumber').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vehicle_number: vehicleNumber })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'home.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const formData = {
        vehicle_number: document.getElementById('vehicleNumber').value,
        company: document.getElementById('company').value,
        model: document.getElementById('model').value,
        year: parseInt(document.getElementById('year').value),
        battery_capacity: parseFloat(evData[document.getElementById('company').value]?.[document.getElementById('model').value]?.battery_capacity || 0),
        vehicle_range: parseFloat(evData[document.getElementById('company').value]?.[document.getElementById('model').value]?.range || 0)
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Account created successfully! Please login.');
            window.location.href = 'index.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}