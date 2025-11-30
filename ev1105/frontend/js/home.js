// Tab functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Activate selected button
    event.target.classList.add('active');
}

// Customer management
function addCustomer() {
    const customerFields = document.getElementById('customerFields');
    const customerRow = document.createElement('div');
    customerRow.className = 'customer-row';
    customerRow.innerHTML = `
        <input type="text" placeholder="Customer Name" class="customer-name">
        <input type="text" placeholder="Address" class="customer-address">
        <button class="btn-remove" onclick="removeCustomer(this)">×</button>
    `;
    customerFields.appendChild(customerRow);
}

function removeCustomer(button) {
    button.parentElement.remove();
}

// File upload handling
document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
    
    // Load user info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && document.getElementById('userVehicleNumber')) {
        document.getElementById('userVehicleNumber').textContent = `Welcome, ${user.vehicle_number}`;
    }
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // In a real implementation, you would parse the CSV/Excel file here
        alert(`File "${file.name}" uploaded successfully!`);
        // For demo purposes, we'll add some sample customers
        addSampleCustomers();
    }
}

function addSampleCustomers() {
    const sampleCustomers = [
        { name: "Customer 1", address: "Address 1" },
        { name: "Customer 2", address: "Address 2" },
        { name: "Customer 3", address: "Address 3" }
    ];
    
    const customerFields = document.getElementById('customerFields');
    customerFields.innerHTML = '';
    
    sampleCustomers.forEach(customer => {
        const customerRow = document.createElement('div');
        customerRow.className = 'customer-row';
        customerRow.innerHTML = `
            <input type="text" class="customer-name" value="${customer.name}">
            <input type="text" class="customer-address" value="${customer.address}">
            <button class="btn-remove" onclick="removeCustomer(this)">×</button>
        `;
        customerFields.appendChild(customerRow);
    });
}

// Route optimization
async function optimizeRoute() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login first.');
        return;
    }
    
    // Collect customer data
    const customerRows = document.querySelectorAll('.customer-row');
    const customerData = [];
    
    customerRows.forEach(row => {
        const name = row.querySelector('.customer-name').value;
        const address = row.querySelector('.customer-address').value;
        
        if (name && address) {
            customerData.push({
                name: name,
                address: address
            });
        }
    });
    
    if (customerData.length === 0) {
        alert('Please add at least one customer.');
        return;
    }
    
    const optimizationData = {
        vehicle_number: user.vehicle_number,
        algorithm: document.getElementById('algorithmSelect').value,
        customer_data: customerData,
        battery_percentage: parseFloat(document.getElementById('batteryPercentage').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        load_carry: parseFloat(document.getElementById('loadCarry').value),
        vehicle_range: user.vehicle_range
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(optimizationData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store results and redirect to results page
            localStorage.setItem('optimizationResults', JSON.stringify(data));
            window.location.href = 'results.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Optimization error:', error);
        alert('Optimization failed. Please try again.');
    }
}