// === API KEYS ===
const apiKey = 'a9597b9143bd10ce791e1b80c44d2d50'; // OpenWeatherMap API key
const geoAPI = '2783701aa79748f9b21e86f7ca361dd4'; // GeoApify API key
const opt = { timeStyle: 'short', hour12: true }; // Time formatting options

let map; // Global map object
let isUserSearch = false; // For auto scrolling
let lastForecastData = null; // Store forecast data for unit toggle

// === Check Toggle State ===
function isFahrenheitToggled() {
    const toggle = document.getElementById("unitToggle");
    return toggle && toggle.checked;
}

// === INITIALIZE MAP (No default location) ===
function initMap() {
    map = new mappls.Map("map", {}); // Initialize map without center
}

// === RE-CENTER MAP TO SPECIFIC LOCATION ===
function initMap1(data) {
    const latitude = data.coord.lat;
    const longitude = data.coord.lon;

    if (!map) {
        map = new mappls.Map("map", {
            center: { lat: latitude, lng: longitude }
        });
    } else {
        map.setCenter({ lat: latitude, lng: longitude });
    }

    if (window.currentMarker) {
        window.currentMarker.remove();
    }

    const marker = new mappls.Marker({
        map: map,
        position: { lat: latitude, lng: longitude },
        title: translations[currentLanguage]["Selected Location"] || "Selected Location"
    });

    window.currentMarker = marker;
}

// === SCROLL TO WEATHER INFO ===
function scrollToWeatherInfo() {
    const weatherSection = document.getElementById("weat");
    if (weatherSection) {
        weatherSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// === AUTOCOMPLETE LOCATION INPUT ===
function autoComplete() {
    const input = document.getElementById('city-input').value;
    if (input.length <= 2) {
        document.getElementById("suggestion-box").style.display = "none";
        return;
    }
    getSuggestion(input);
    document.getElementById("suggestion-box").style.display = "flex";
}

// === FETCH LOCATION SUGGESTIONS FROM GEOAPIFY ===
function getSuggestion(input) {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&apiKey=${geoAPI}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const suggestions = data.features.slice(0, 5).map(feature => ({
                address: feature.properties.address_line1,
                state: feature.properties.state,
                country: feature.properties.country,
            }));
            updateSuggestions(suggestions);
        })
        .catch(err => console.log('Error fetching suggestions:', err));
}

function animateTemperature(element, start, end, unit, duration = 800) {
    const stepTime = 20; 
    const steps = Math.floor(duration / stepTime);
    let currentStep = 0;
    const diff = end - start;

    if (Math.round(start) === Math.round(end)) {
        element.textContent = `${end.toFixed(1)}${unit}`;
        return;
    }

    const timer = setInterval(() => {
        currentStep++;
        const newValue = start + (diff * currentStep) / steps;
        element.textContent = `${newValue.toFixed(1)}${unit}`;
        if (currentStep >= steps) {
            element.textContent = `${end.toFixed(1)}${unit}`;
            clearInterval(timer);
        }
    }, stepTime);
}

// === POPULATE AUTOCOMPLETE SUGGESTIONS ===
function updateSuggestions(suggestions) {
    const suggestionBox = document.getElementById("suggestion-box");
    suggestions.forEach((suggestion, index) => {
        const el = document.getElementById(`suggestion-${index}`);
        if (el) {
            el.innerText = `${suggestion.address}, ${suggestion.state}, ${suggestion.country}`;
            el.onclick = () => {
                document.getElementById("city-input").value = `${suggestion.address}, ${suggestion.state}`;
                suggestionBox.style.display = "none";
            };
            el.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    document.getElementById("city-input").value = `${suggestion.address}, ${suggestion.state}`;
                    suggestionBox.style.display = "none";
                    getWeatherByCity();
                }
            };
        }
    });
}

// === FETCH WEATHER FOR CITY ===
function getWeatherByCity() {
    const city = document.getElementById("city-input").value;
    if (!city) {
        showError('error-message', translations[currentLanguage]["Please enter a city name"] || 'Please enter a city name');
        return;
    }
    isUserSearch = true;
    showLoading(true);
    fetchWeatherByCity(city);
}

// === FETCH WEATHER FOR CURRENT LOCATION ===
function getWeatherByLocation() {
    if (navigator.geolocation) {
        isUserSearch = true;
        showLoading(true);
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            fetchWeatherByCoordinates(lat, lon);
            initMap1({ coord: { lat, lon } });
        }, () => {
            showError('error-message', translations[currentLanguage]["Unable to retrieve your location."] || 'Unable to retrieve your location.');
            showLoading(false);
        });
    } else {
        showError('error-message', translations[currentLanguage]["Geolocation is not supported by this browser."] || 'Geolocation is not supported by this browser.');
    }
}

// === GET WEATHER FROM CITY NAME ===
function fetchWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error('City not found');
            return res.json();
        })
        .then(data => {
            fetchNearbyCities(data.coord.lat, data.coord.lon, city);
            getUvData(data)
            showLoading(false);
        })
        .catch(err => {
            console.error(err);
            fetchLatLon(city);
        });
}

// === GET LAT/LON FROM CITY NAME ===
function fetchLatLon(city) {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${city}&format=json&apiKey=${geoAPI}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.results || !data.results.length) throw new Error("No results");
            const lat = data.results[0].lat;
            const lon = data.results[0].lon;
            fetchWeatherByCoordinates(lat, lon);
        })
        .catch(err => {
            console.error(err);
            showError('error-message', translations[currentLanguage]["Invalid location. Try again."] || 'Invalid location. Try again.');
            showLoading(false);
        });
}

// === GET WEATHER FROM LAT/LON ===
function fetchWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            getUvData(data)
            fetchNearbyCities(lat, lon, data.name);
            showLoading(false);
        })
        .catch(err => {
            console.error(err);
            showError('error-message', translations[currentLanguage]["Failed to fetch weather data."] || 'Failed to fetch weather data.');
            showLoading(false);
        });
}
// === GET UVINDEX FROM LAT/LON ===
function getUvData(data) {
  const url = `https://api.openweathermap.org/data/2.5//uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`;
  fetch(url)
    .then((res) => res.json())
    .then((uv) => {
    displayWeather(data,uv)
    });
}
// === DISPLAY WEATHER DETAILS IN UI ===
function displayWeather(data,uv) {
    const { temp, feels_like, humidity, pressure } = data.main;
    const visibility = data.visibility / 1000;
    const windSpeed = data.wind.speed;
    const windDeg = data.wind.deg;
    const windArrow = getWindDirectionArrow(windDeg);
    const date = new Date(data.dt * 1000).toLocaleDateString();
    const weatherdes = data.weather[0].main;
    const { country } = data.sys;
    const city = data.name;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', opt);
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', opt);
    const { lat, lon } = data.coord;
    initMap1(data);
    fetchPollution(lat, lon);
    getWeatherForecast(lat, lon);

    // Titles
    document.getElementById("weat").innerText = `${translations[currentLanguage]["Weather Information"] || "Weather Information"}: ${city}`;

    // Store Celsius in dataset
    ["temp", "fl", "temp1", "fl1"].forEach(id => {
        document.getElementById(id).dataset.celsius = id.includes("fl") ? feels_like : temp;
    });

    // Unit toggle
    const isCelsius = !isFahrenheitToggled();
    updateTemperatureDisplay(isCelsius);

    // Weather data for BIG TABLE and SMALL TABLE
    document.getElementById("city1").innerText = city;
    document.getElementById("city1_small").innerText = city;
    document.getElementById("date1").innerText = date;
    document.getElementById("date1_small").innerText = date;
    document.getElementById("wi").innerText = weatherdes;
    document.getElementById("wi1").innerText = weatherdes;
    document.getElementById("humi").innerText = `${humidity}%`;
    document.getElementById("humi1").innerText = `${humidity}%`;
    document.getElementById("bigUV").innerText = `${uv.value}`;
    document.getElementById("smallUV").innerText = `${uv.value}`;
    document.getElementById("press").innerText = `${pressure} hPa`;
    document.getElementById("press1").innerText = `${pressure} hPa`;
    document.getElementById("visi").innerText = `${visibility} Km`;
    document.getElementById("visi1").innerText = `${visibility} Km`;
    document.getElementById("ws").innerText = `${windSpeed} m/s ${windArrow}`;
    document.getElementById("ws1").innerText = `${windSpeed} m/s ${windArrow}`;
    document.getElementById("sr").innerText = sunrise;
    document.getElementById("sr1").innerText = sunrise;
    document.getElementById("ss").innerText = sunset;
    document.getElementById("ss1").innerText = sunset;
    document.getElementById("cc").innerText = country;
    document.getElementById("cc1").innerText = country;

    document.getElementById("city-input").value = '';
    updateRecentSearches(city);
    if (isUserSearch) {
        scrollToWeatherInfo();
        isUserSearch = false;
    }
}

// === FETCH NEARBY CITIES ===
async function fetchNearbyCities(lat, lon, currentCity) {
    showLoading(true, 'nearby-loading');
    const url = `https://api.geoapify.com/v2/places?categories=populated_place.city&filter=circle:${lon},${lat},50000&limit=5&apiKey=${geoAPI}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch nearby cities');
        const data = await res.json();
        const cities = data.features
            .map(feature => ({
                name: feature.properties.city || feature.properties.name,
                lat: feature.properties.lat,
                lon: feature.properties.lon
            }))
            .filter(city => city.name && city.name.toLowerCase() !== currentCity.toLowerCase())
            .slice(0, 4);
        if (cities.length === 0) {
            showError('nearby-error', translations[currentLanguage]["No nearby cities found."] || 'No nearby cities found.');
            return;
        }
        fetchNearbyCitiesData(cities, currentCity);
    } catch (err) {
        console.error('Error fetching nearby cities:', err);
        showError('nearby-error', translations[currentLanguage]["Failed to load nearby cities."] || 'Failed to load nearby cities.');
        showLoading(false, 'nearby-loading');
    }
}

// === FETCH WEATHER AND AQI FOR NEARBY CITIES ===
async function fetchNearbyCitiesData(cities, currentCity) {
    const isCelsius = !isFahrenheitToggled();
    const container = document.querySelector('.nearby-cities-container');
    container.innerHTML = '';
    container.classList.remove('cities-2', 'cities-3', 'cities-4');
    container.classList.add(`cities-${cities.length}`);
    
    for (const city of cities) {
        try {
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
            const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}`;
            
            const [weatherRes, pollutionRes] = await Promise.all([
                fetch(weatherUrl).then(res => res.json()),
                fetch(pollutionUrl).then(res => res.json())
            ]);

            const temp = weatherRes.main.temp;
            const icon = weatherRes.weather[0].icon;
            const aqi = pollutionRes.list[0].main.aqi;
            const aqiLabel = [translations[currentLanguage]["Good"] || "Good", translations[currentLanguage]["Fair"] || "Fair", translations[currentLanguage]["Moderate"] || "Moderate", translations[currentLanguage]["Poor"] || "Poor", translations[currentLanguage]["Very Poor"] || "Very Poor"][aqi - 1] || "Unknown";
            const isCurrentCity = city.name.toLowerCase() === currentCity.toLowerCase();

            const card = document.createElement('div');
            card.className = `nearby-city-card aqi-${aqi} ${isCurrentCity ? 'current-city' : ''}`;
            card.tabIndex = 0;
            card.setAttribute('aria-label', `${translations[currentLanguage]["Weather for"] || "Weather for"} ${city.name}: ${isCelsius ? temp.toFixed(1) : celsiusToFahrenheit(temp).toFixed(1)} ${isCelsius ? '°C' : '°F'}, AQI ${aqiLabel}`);
            card.innerHTML = `
                <h3>${city.name}${isCurrentCity ? ` (${translations[currentLanguage]["Current"] || "Current"})` : ''}</h3>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weatherRes.weather[0].description}">
                <p>${translations[currentLanguage]["Temperature"] || "Temperature"}: <span class="nearby-temp" data-celsius="${temp}">${isCelsius ? temp.toFixed(1) : celsiusToFahrenheit(temp).toFixed(1)}${isCelsius ? '°C' : '°F'}</span></p>
                <p class="aqi-value" data-tooltip="AQI ${aqiLabel}: ${getAQIDescription(aqi)}">AQI: ${aqiLabel} (${aqi})</p>
            `;
            card.onclick = () => {
                document.getElementById('city-input').value = city.name;
                getWeatherByCity();
            };
            card.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('city-input').value = city.name;
                    getWeatherByCity();
                }
            };
            container.appendChild(card);
        } catch (err) {
            console.error(`Error fetching data for ${city.name}:`, err);
        }
    }
    showLoading(false, 'nearby-loading');
}

// === AQI DESCRIPTION FOR TOOLTIPS ===
function getAQIDescription(aqi) {
    switch (aqi) {
        case 1: return translations[currentLanguage]["Air quality is good. No health risk."] || "Air quality is good. No health risk.";
        case 2: return translations[currentLanguage]["Air quality is fair. Sensitive people should take precautions."] || "Air quality is fair. Sensitive people should take precautions.";
        case 3: return translations[currentLanguage]["Moderate risk for sensitive groups. Limit prolonged outdoor exertion."] || "Moderate risk for sensitive groups. Limit prolonged outdoor exertion.";
        case 4: return translations[currentLanguage]["Poor air quality. General public may experience discomfort."] || "Poor air quality. General public may experience discomfort.";
        case 5: return translations[currentLanguage]["Very poor. Avoid outdoor activities if possible."] || "Very poor. Avoid outdoor activities if possible.";
        default: return translations[currentLanguage]["Air quality data unavailable."] || "Air quality data unavailable.";
    }
}

// === LOADING AND ERROR HANDLING ===
function showLoading(show, elementId = 'loading') {
    document.getElementById(elementId).style.display = show ? 'flex' : 'none';
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.innerText = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

// === CONVERSION HELPERS ===
function celsiusToFahrenheit(c) { return (c * 9 / 5) + 32; }
function fahrenheitToCelsius(f) { return (f - 32) * 5 / 9; }

// === TOGGLE CELSIUS/FAHRENHEIT DISPLAY ===
function updateTemperatureDisplay(isCelsius) {
    const elements = ["temp", "fl", "temp1", "fl1"];
    elements.forEach(id => {
        const el = document.getElementById(id);
        const c = parseFloat(el.dataset.celsius);
        let displayed = el.textContent;
        let oldVal = parseFloat(displayed);
        if (isNaN(oldVal)) oldVal = c;
        let newVal, unit;
        if (isCelsius) {
            newVal = c;
            unit = "°C";
        } else {
            newVal = celsiusToFahrenheit(c);
            unit = "°F";
        }
        animateTemperature(el, oldVal, newVal, unit);
    });

    // Update nearby cities temperatures
    document.querySelectorAll('.nearby-temp').forEach(el => {
        const c = parseFloat(el.dataset.celsius);
        el.innerText = isCelsius ? `${c.toFixed(1)}°C` : `${celsiusToFahrenheit(c).toFixed(1)}°F`;
    });
}

// === FETCH POLLUTION DATA ===
function fetchPollution(lat, lon) { 
    const pollurl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetch(pollurl)
        .then(response => response.json())
        .then(data => {
            displayPollution(data);
        })
        .catch(error => {
            console.error('Error fetching pollution info:', error);
            showError('error-message', translations[currentLanguage]["Failed to load air pollution data."] || 'Failed to load air pollution data.');
        });
}

// === DISPLAY POLLUTION DATA ===
function displayPollution(data) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    const aqiLabel = [
        translations[currentLanguage]["Good"] || "Good",
        translations[currentLanguage]["Fair"] || "Fair",
        translations[currentLanguage]["Moderate"] || "Moderate",
        translations[currentLanguage]["Poor"] || "Poor",
        translations[currentLanguage]["Very Poor"] || "Very Poor"
    ];
    const label = aqiLabel[aqi - 1] || "Unknown";
    document.getElementById("aqi").innerText = label;
    document.getElementById("aqi1").innerText = label;
    document.getElementById("aqi_big").innerText = label;

    const healthMessage = getAQIDescription(aqi);
    document.getElementById("aqi-message").innerText = healthMessage;

    const pollutionMetrics = ["co", "no", "no2", "o3", "so2", "pm2_5", "pm10", "nh3"];
    pollutionMetrics.forEach(metric => {
        const value = components[metric];
        const label = metric === 'pm2_5' ? 'pm2.5' : metric;
        document.getElementById(label).innerText = `${value} μg/m3`;
        document.getElementById(label + "1").innerText = `${value} μg/m3`;
    });
}

// === FORECAST DISPLAY ===
function getWeatherForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            lastForecastData = data;
            showWeatherForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
            showError('error-message', translations[currentLanguage]["Failed to load weather forecast."] || 'Failed to load weather forecast.');
        });
}

function convertTemp(temp, isCelsius) {
    return isCelsius ? `${temp.toFixed(1)} °C` : `${((temp * 9/5) + 32).toFixed(1)} °F`;
}

// === WEATHER NOTES ===
const notes = {
    clear: [
        translations[currentLanguage]["Sun’s out, shades on! Don’t forget sunscreen 😎"] || "Sun’s out, shades on! Don’t forget sunscreen 😎",
        translations[currentLanguage]["Perfect day for an ice cream or a long walk 🍦🚶‍♀️"] || "Perfect day for an ice cream or a long walk 🍦🚶‍♀️",
        translations[currentLanguage]["Clear skies and good vibes ahead 🌞✨"] || "Clear skies and good vibes ahead 🌞✨"
    ],
    clouds: [
        translations[currentLanguage]["Clouds are having a meeting up there! ☁️"] || "Clouds are having a meeting up there! ☁️",
        translations[currentLanguage]["Still a great day to be outdoors — maybe a light jacket?"] || "Still a great day to be outdoors — maybe a light jacket?",
        translations[currentLanguage]["Sky's wearing a gray sweater today! 🌫️"] || "Sky's wearing a gray sweater today! 🌫️"
    ],
    rain: [
        translations[currentLanguage]["Don’t forget your umbrella — it's nature’s splash party ☔💃"] || "Don’t forget your umbrella — it's nature’s splash party ☔💃",
        translations[currentLanguage]["Perfect day for pakoras and Netflix 🍲🎬"] || "Perfect day for pakoras and Netflix 🍲🎬",
        translations[currentLanguage]["Tiny droplets, big cozy vibes!"] || "Tiny droplets, big cozy vibes!"
    ],
    snow: [
        translations[currentLanguage]["Snowball fights or hot cocoa? Or both? ☕❄️"] || "Snowball fights or hot cocoa? Or both? ☕❄️",
        translations[currentLanguage]["Snowflakes are saying hello! ❄️👋"] || "Snowflakes are saying hello! ❄️👋",
        translations[currentLanguage]["Winter wonderland loading... ⛄❄️"] || "Winter wonderland loading... ⛄❄️"
    ],
    thunderstorm: [
        translations[currentLanguage]["⚡ Dramatic skies incoming! Stay safe and unplug if needed."] || "⚡ Dramatic skies incoming! Stay safe and unplug if needed.",
        translations[currentLanguage]["A good day to stay in and watch the show from your window 🎭"] || "A good day to stay in and watch the show from your window 🎭",
        translations[currentLanguage]["It's Thor's bowling night! ⚡🎳"] || "It's Thor's bowling night! ⚡🎳"
    ],
    atmosphere: [
        translations[currentLanguage]["Dreamy, soft-focus day! 🌫️✨"] || "Dreamy, soft-focus day! 🌫️✨",
        translations[currentLanguage]["It’s one of those days… where the air's got secrets. Stay curious, stay indoors if needed! 🔮🌪️"] || "It’s one of those days… where the air's got secrets. Stay curious, stay indoors if needed! 🔮🌪️",
        translations[currentLanguage]["Atmospheric trickery afoot! The skies are casting illusions — step carefully, seer of weather 👁️‍🗨️🌫️"] || "Atmospheric trickery afoot! The skies are casting illusions — step carefully, seer of weather 👁️‍🗨️🌫️"
    ]
};

const weatherKeywords = {
    clear: ['clear', 'sunny'], clouds: ['cloud', 'overcast'], rain: ['rain', 'drizzle', 'shower'], snow: ["snow", "sleet"], thunderstorm: ['thunderstorm', 'thunder'], atmosphere: ['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'tornado']
};

function extractWeatherInfo(weatherMain = '') {
    const main = weatherMain.toLowerCase();
    for (const [category, keywords] of Object.entries(weatherKeywords)) {
        if (keywords.some(keyword => main.includes(keyword))) {
            return category;
        }
    }
    return 'clear';
}

function giveNotes(weatherMain = '') {
    const category = extractWeatherInfo(weatherMain);
    const note = notes[category];
    const randomIdx = Math.floor(Math.random() * note.length);
    return note[randomIdx];
}

// === SHOW WEATHER FORECAST ===
function showWeatherForecast(data) {
    const isCelsius = !document.getElementById('unitToggle').checked;
    if (data.alerts && data.alerts.length > 0) {
        displayWeatherAlerts(data.alerts);
    } else {
        hideWeatherAlerts();
    }
    const forecast = data.daily.slice(0, 8);
    const opt = { hour: '2-digit', minute: '2-digit' };

    const dates = forecast.map(day => `<th>${new Date(day.dt * 1000).toLocaleDateString()}</th>`).join("");
    const maxTemps = forecast.map(day => `<td>${convertTemp(day.temp.max, isCelsius)}</td>`).join("");
    const minTemps = forecast.map(day => `<td>${convertTemp(day.temp.min, isCelsius)}</td>`).join("");
    const sunrises = forecast.map(day => `<td>${new Date(day.sunrise * 1000).toLocaleTimeString('en-US', opt)}</td>`).join("");
    const sunsets = forecast.map(day => `<td>${new Date(day.sunset * 1000).toLocaleTimeString('en-US', opt)}</td>`).join("");
    const summaries = forecast.map(day => `<td>${day.weather[0].description}</td>`).join("");
    const icons = forecast.map(day => `<td class="icons-block"><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"></td>`).join("");
    const noteForUser = forecast.map(day => `<td class="notes"><p class="notes-txt">${giveNotes(day.weather[0].main)}</p></td>`).join("");

    document.getElementById("forecast").style.display = "block";
    document.getElementById("forecast-section").style.display = "block";

    document.getElementById("forecast-table").innerHTML = `
        <tr><th>${translations[currentLanguage]["Date"] || "Date"}</th>${dates}</tr>
        <tr><th>${translations[currentLanguage]["Max-Temperature"] || "Max-Temperature"}</th>${maxTemps}</tr>
        <tr><th>${translations[currentLanguage]["Min-Temperature"] || "Min-Temperature"}</th>${minTemps}</tr>
        <tr><th>${translations[currentLanguage]["Sunrise"] || "Sunrise"}</th>${sunrises}</tr>
        <tr><th>${translations[currentLanguage]["Sunset"] || "Sunset"}</th>${sunsets}</tr>
        <tr><th>${translations[currentLanguage]["Summary"] || "Summary"}</th>${summaries}</tr>
        <tr><th>${translations[currentLanguage]["Something for you!"] || "Something for you!"}<br>${translations[currentLanguage]["(hover to unlock)"] || "(hover to unlock)"}</th>${noteForUser}</tr>
        <tr><th>${translations[currentLanguage]["Icon"] || "Icon"}</th>${icons}</tr>
    `;

    if (toggle === 0) {
        document.querySelector('.forecasttable').querySelectorAll('th').forEach(et => {
            et.style.color = "rgba(17, 34, 29, 0.7)";
        });
        document.querySelector('.forecasttable').querySelectorAll('td').forEach(ed => {
            ed.style.color = "rgb(233, 239, 236)";
        });
        document.querySelectorAll('.forecasttable td, .forecasttable th').forEach(el => {
            el.style.border = "1px solid rgb(233, 239, 236)";
        });
    }

    function displayWeatherAlerts(alerts) {
        const alertBox = document.getElementById("weather-alert-box");
        alertBox.innerHTML = '';

        alerts.forEach(alert => {
            const alertEl = document.createElement("div");
            alertEl.className = "alert-card";
            alertEl.innerHTML = `
                <div class="alert-header">
                    ⚠️ ${alert.event}
                    <button class="close-btn" onclick="this.parentElement.parentElement.style.display='none'" aria-label="${translations[currentLanguage]["Close alert"] || "Close alert"}">×</button>
                </div>
                <div class="alert-body">
                    <p><strong>${translations[currentLanguage]["From"] || "From"}:</strong> ${new Date(alert.start * 1000).toLocaleString()}</p>
                    <p><strong>${translations[currentLanguage]["To"] || "To"}:</strong> ${new Date(alert.end * 1000).toLocaleString()}</p>
                    <p><strong>${translations[currentLanguage]["Description"] || "Description"}:</strong><br>${alert.description.replace(/\n/g, '<br>')}</p>
                    <p><strong>${translations[currentLanguage]["Source"] || "Source"}:</strong> ${alert.sender_name}</p>
                </div>
            `;
            alertBox.appendChild(alertEl);
        });

        alertBox.style.display = "block";
    }

    function hideWeatherAlerts() {
        const alertBox = document.getElementById("weather-alert-box");
        alertBox.innerHTML = "";
        alertBox.style.display = "none";
    }
    
    const ctx = document.getElementById('tempLineChart').getContext('2d');
    const chartLabels = forecast.map(day => new Date(day.dt * 1000).toLocaleDateString());
    const maxTempValues = forecast.map(day => isCelsius ? day.temp.max : (day.temp.max * 9/5 + 32));
    const minTempValues = forecast.map(day => isCelsius ? day.temp.min : (day.temp.min * 9/5 + 32));

    if (window.tempChart) {
        window.tempChart.destroy();
    }

    window.tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: translations[currentLanguage]["Max Temp"] || 'Max Temp',
                    data: maxTempValues,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: translations[currentLanguage]["Min Temp"] || 'Min Temp',
                    data: minTempValues,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)'
                    }
                },
                title: {
                    display: true,
                    text: translations[currentLanguage]["7-Day Temperature Trend"] || '7-Day Temperature Trend',
                    color: toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: `${translations[currentLanguage]["Temperature"] || 'Temperature'} (${isCelsius ? '°C' : '°F'})`,
                        color: toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)'
                    },
                    ticks: {
                        color: toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)'
                    }
                },
                x: {
                    ticks: {
                        color: toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)'
                    }
                }
            }
        }
    });
}

// === DARK MODE TOGGLE ===
const darkbtn = document.getElementById('dark-mode');
let toggle = 1;
function changedisplay() {
    if (toggle == 1) {
        document.querySelector('body').style.backgroundColor = "rgba(17, 34, 29, 0.7)";
        document.querySelector('body').style.color = "rgb(233, 239, 236)";
        darkbtn.textContent = "🌙";
        document.querySelectorAll("table, th, td").forEach(el => {
            el.style.border = "1px solid rgb(233, 239, 236)";
            el.style.color = "rgb(233, 239, 236)";
        });
        document.querySelector('.forecasttable')?.querySelectorAll('th').forEach(et => {
            et.style.color = "rgba(17, 34, 29, 0.7)";
        });
        document.querySelectorAll('.nearby-city-card').forEach(card => {
            card.style.color = "rgb(233, 239, 236)";
            card.style.border = "1px solid rgb(233, 239, 236)";
        });
        localStorage.setItem("theme", "dark"); 
        toggle = 0;
    } else {
        document.querySelector('body').style.backgroundColor = "rgb(233, 239, 236)";
        document.querySelector('body').style.color = "black";
        darkbtn.textContent = "☀️";
        document.querySelectorAll("table, th, td").forEach(el => {
            el.style.border = "1px solid rgba(22, 66, 60, 1)";
            el.style.color = "rgba(22, 66, 60, 1)";
        });
        document.querySelectorAll('.nearby-city-card').forEach(card => {
            card.style.color = "rgba(22, 66, 60, 1)";
            card.style.border = "1px solid rgba(22, 66, 60, 1)";
        });
        localStorage.setItem("theme", "light"); 
        toggle = 1;
    }
}

darkbtn.addEventListener('click', changedisplay);

// === LOAD SAVED THEME ===
document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        toggle = 1;
        changedisplay();
    } else if (savedTheme === "light") {
        toggle = 0;
        changedisplay();
    }
    renderRecentSearches();
});

// === WIND DIRECTION ===
function getWindDirectionArrow(deg) {
    if (deg >= 337.5 || deg < 22.5) return '↑ N';
    if (deg >= 22.5 && deg < 67.5) return '↗ NE';
    if (deg >= 67.5 && deg < 112.5) return '→ E';
    if (deg >= 112.5 && deg < 157.5) return '↘ SE';
    if (deg >= 157.5 && deg < 202.5) return '↓ S';
    if (deg >= 202.5 && deg < 247.5) return '↙ SW';
    if (deg >= 247.5 && deg < 292.5) return '← W';
    if (deg >= 292.5 && deg < 337.5) return '↖ NW';
    return '❓';
}

// === TEMPERATURE UNIT TOGGLE ===
const unitToggle = document.getElementById('unitToggle');
unitToggle.addEventListener('change', function () {
    const isCelsius = !this.checked;
    updateTemperatureDisplay(isCelsius);
    if (lastForecastData) {
        showWeatherForecast(lastForecastData); 
    }
});

// === SCROLL TO TOP ===
window.onscroll = function () {
    const btn = document.getElementById("backToTopBtn");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.style.display = "flex";
    } else {
        btn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// === SHARE BUTTON ===
const shareBtn = document.getElementById("shareBtn");
shareBtn.style.display = "inline-block";

shareBtn.onclick = async () => {
    const city = document.getElementById("city1").textContent;
    const temperature = document.getElementById("temp").textContent;
    const description = document.getElementById("wi").textContent;
    const aqi = document.getElementById("aqi").textContent;

    const shareText = `${translations[currentLanguage]["📍"] || "📍"} ${city}\n${translations[currentLanguage]["🌡️ Temp"] || "🌡️ Temp"}: ${temperature}\n${translations[currentLanguage]["🌤️"] || "🌤️"} ${description}\n${translations[currentLanguage]["🌫️ AQI"] || "🌫️ AQI"}: ${aqi}\n${translations[currentLanguage]["Shared via Weather Blast"] || "Shared via Weather Blast"}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: translations[currentLanguage]["Weather Update"] || "Weather Update",
                text: shareText,
            });
        } catch (err) {
            console.error("Share failed:", err);
        }
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert(translations[currentLanguage]["Copied to clipboard!"] || "Copied to clipboard!");
        });
    }
};

// === RECENT SEARCHES ===
const searchInput = document.getElementById('city-input');
const searchBtn = document.querySelector('button[onclick="getWeatherByCity()"]');
const recentList = document.getElementById('recent-list');
const resetBtn = document.getElementById('reset-searches-btn');

function updateRecentSearches(newSearch) {
    let recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recent = recent.filter(item => item.toLowerCase() !== newSearch.toLowerCase());
    recent.unshift(newSearch);
    if (recent.length > 5) recent = recent.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
    renderRecentSearches();
}

function renderRecentSearches() {
    const recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (recent.length === 0) {
        recentList.innerHTML = `<li data-translate>${translations[currentLanguage]["No recent searches yet."] || "No recent searches yet."}</li>`;
        return;
    }

    recentList.innerHTML = recent
        .map(item => `<li class="recent-item" tabindex="0" role="button" aria-label="${translations[currentLanguage]["Search weather for"] || "Search weather for"} ${item}">${item}</li>`)
        .join('');

    document.querySelectorAll('.recent-item').forEach(el => {
        el.onclick = () => {
            searchInput.value = el.innerText;
            getWeatherByCity();
        };
        el.onkeydown = (e) => {
            if (e.key === 'Enter') {
                searchInput.value = el.innerText;
                getWeatherByCity();
            }
        };
    });
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) {
        showError('error-message', translations[currentLanguage]["Please enter a city name"] || 'Please enter a city name');
        return;
    }
    updateRecentSearches(query);
});

resetBtn.addEventListener('click', () => {
    localStorage.removeItem('recentSearches');
    renderRecentSearches();
});