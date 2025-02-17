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

async function fetchWeatherData(endpoint, location) { // Receive location parameter
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Clear previous weather cards
        document.getElementById('weatherCards').innerHTML = '';

        // Update searched city name
        document.getElementById('searchedCity').textContent = `Weather Forecast for ${location}`; // Set searched city name

        // Process forecast data (up to 5 days or available forecasts)
        for (let i = 0; i < Math.min(5, data.list.length); i++) {
            const forecast = data.list[i * 8]; // Fetching data for every 24 hours (8 forecasts per day)

            // Ensure forecast is defined
            if (forecast) {
                const date = new Date(forecast.dt_txt); // Assuming dt_txt is correctly formatted in ISO string

                // Get day of the week (Sun, Mon, etc.)
                const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                const dayOfMonth = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                // Determine weather condition for background image
                const weatherCondition = forecast.weather[0].main.toLowerCase();
                const backgroundImage = getBackgroundImage(weatherCondition);


                const weatherCard = `
<div class="max-w-md bg-white shadow-lg rounded-lg overflow-hidden weather-card transform transition-transform hover:scale-105">
<div class="weather-card-content relative group">
    <div class="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
         style="background-image: url('${backgroundImage}')">
    </div>
    <div class="py-4 px-6 relative z-10">
        <h2 class="text-xl font-bold mb-2">${dayOfWeek}, ${dayOfMonth}</h2>
        <div class="flex items-center mb-4">
            <div class="text-5xl font-bold mr-4">${Math.round(forecast.main.temp)}°C</div>
            <div class="inline-block">
                <i class="wi wi-owm-${forecast.weather[0].id} text-5xl text-gray-800"></i>
                <p class="ml-2">${forecast.weather[0].main}</p>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="detail-box bg-blue-100 p-4 rounded-lg transform transition-transform hover:scale-105">
                <p class="text-sm text-gray-600">Humidity</p>
                <p class="text-lg font-semibold">${forecast.main.humidity}%</p>
                <p class="text-gray-600">${forecast.weather[0].description}</p>
            </div>
            <div class="detail-box bg-green-100 p-4 rounded-lg transform transition-transform hover:scale-105">
                <p class="text-sm text-gray-600">Wind Speed</p>
                <p class="text-lg font-semibold">${forecast.wind.speed} m/s</p>
            </div>
        </div>
    </div>
</div>
</div>
`;

                document.getElementById('weatherCards').innerHTML += weatherCard;
            }
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching weather data. Please try again later.');
    } finally {
        // Enable search button and hide loading state
        document.getElementById('searchBtn').disabled = false;
    }
}

async function searchWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();

    if (city) {
        // Disable the search button and show loading state
        document.getElementById('weatherCards').innerHTML = '<p>Loading...</p>';
        document.getElementById('searchBtn').disabled = true;

        // Call getWeather to fetch data
        getWeather(city);

        // Update recently searched cities
        updateRecentCities(city);

        // Clear input field after search
        cityInput.value = '';
    } else {
        alert('Please enter a city name');
    }
}


// Function to handle selection from dropdown
document.getElementById('recentCitiesDropdown').addEventListener('change', function () {
    const selectedCity = this.value;
    if (selectedCity) {
        // Update weather for the selected city
        getWeather(selectedCity);
    }
});

// Validate input on search button click
document.getElementById('searchBtn').addEventListener('click', function () {
    searchWeather();
});

// Validate input on pressing Enter key in input field
document.getElementById('cityInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});
// Fetch weather for current location on button click
document.getElementById('currentLocationBtn').addEventListener('click', function () {
    // Show confirmation popup
    if (confirm("Allow this website to access your location?")) {
        // Disable the search button and show loading state
        document.getElementById('weatherCards').innerHTML = '<p>Loading...</p>';
        document.getElementById('searchBtn').disabled = true;

        // Call getWeather to fetch data for current location
        getWeather('current');
    } else {
        alert('Permission denied. Please enter a city name manually.');
    }
});


// Load weather for current location on page load
window.addEventListener('load', () => {
    // Function to ask for permission to access geolocation
    function askForLocationPermission() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        resolve(position.coords);
                    },
                    error => {
                        console.error('Error getting geolocation:', error);
                        reject(error);
                    }
                );
            } else {
                reject(new Error('Geolocation is not supported by this browser.'));
            }
        });
    }

    // Show confirmation popup
    if (confirm("Allow this website to access your location for accurate weather information?")) {
        // Disable the search button and show loading state
        document.getElementById('weatherCards').innerHTML = '<p>Loading...</p>';
        document.getElementById('searchBtn').disabled = true;

        // Attempt to get current location
        askForLocationPermission()
            .then(coords => {
                const { latitude, longitude } = coords;
                const apiKey = 'e28b2a3e5dbb6215c04594cb3d890f1d';
                const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

                // Call getWeather to fetch data for current location
                getWeather('current');
                updateRecentCitiesDropdown();
            })
            .catch(error => {
                console.error('Error getting location:', error);
                alert('Error getting geolocation. Fetching weather for a default location.');
                getWeather('New York'); // Example default location, or prompt for manual entry
                updateRecentCitiesDropdown();
            });
    } else {
        alert('Permission denied. Fetching weather for a default location.');
        getWeather('New York'); // Example default location, or prompt for manual entry
        updateRecentCitiesDropdown();
    }
});

// Function to get background image URL based on weather condition
function getBackgroundImage(weatherCondition) {
    switch (weatherCondition) {
        case 'thunderstorm':
            return 'https://cdn.pixabay.com/photo/2019/02/22/13/26/lightning-4013539_1280.jpg';
        case 'drizzle':
            return 'https://cdn.pixabay.com/photo/2019/10/30/21/44/gods-gift-4590622_1280.jpg';
        case 'rain':
            return 'https://cdn.pixabay.com/photo/2015/09/09/21/16/raindrops-933424_1280.jpg';
        case 'snow':
            return 'https://cdn.pixabay.com/photo/2017/12/02/17/47/wintry-2993370_1280.jpg';
        case 'clear':
            return 'https://cdn.pixabay.com/photo/2018/11/04/11/49/dawn-3793717_1280.jpg';
        case 'clouds':
            return 'https://cdn.pixabay.com/photo/2021/11/17/17/47/sky-6804245_1280.jpg';
        default:
            return 'https://cdn.pixabay.com/photo/2021/03/11/02/57/mountain-6086083_1280.jpg';
    }
}
