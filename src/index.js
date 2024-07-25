// Function to update recently searched cities in local storage
function updateRecentCities(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    // Remove city if already exists to maintain uniqueness
    recentCities = recentCities.filter(item => item !== city);

    // Add city to the beginning of the array
    recentCities.unshift(city);

    // Limit recentCities array to 5 items
    if (recentCities.length > 5) {
        recentCities = recentCities.slice(0, 5);
    }

    // Update local storage
    localStorage.setItem('recentCities', JSON.stringify(recentCities));

    // Update dropdown menu
    updateRecentCitiesDropdown();
}

// Function to update dropdown menu with recently searched cities
function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const dropdown = document.getElementById('recentCitiesDropdown');

    // Clear previous options
    dropdown.innerHTML = '<option value="">Recently Searched Cities</option>';

    // Add recent cities to the dropdown
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        dropdown.appendChild(option);
    });
}

async function getWeather(location) {
    const apiKey = 'e28b2a3e5dbb6215c04594cb3d890f1d'; // Replace with your OpenWeatherMap API key
    let endpoint;

    if (location === 'current') {
        // Get current location using geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {
                const { latitude, longitude } = position.coords;
                endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
                fetchWeatherData(endpoint, 'Current Location'); // Pass 'Current Location' as location

                // Clear selected option in dropdown
                const dropdown = document.getElementById('recentCitiesDropdown');
                dropdown.value = ''; // Clear selected value
            }, error => {
                console.error('Error getting geolocation:', error);
                alert('Error getting geolocation. Please try again or enter a city name.');
            });
        } else {
            console.log('Geolocation is not supported by this browser.');
            alert('Geolocation is not supported by this browser. Please enter a city name.');
        }
    } else {
        // Search by city name
        endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;
        fetchWeatherData(endpoint, location); // Pass location to fetchWeatherData
    }
}
