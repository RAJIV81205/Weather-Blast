// === GLOBAL VARIABLES & API KEYS ===
const apiKey = 'b2dfbfbe3ac672e26e6ebd9896d88453';
const geoAPI = '9dce3653693f423692f3c937b3cc0e6d';
const opt = { timeStyle: 'short', hour12: true };

let map;
let lastForecastData = null;
let toggle = 1;

// === NAVBAR FUNCTIONALITY ===
function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    const originalHomeContent = document.getElementById('original-home-content');
    if (sectionName === 'home') {
        originalHomeContent.style.display = 'block';
    } else {
        originalHomeContent.style.display = 'none';
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) targetSection.classList.add('active');
    }
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) activeLink.classList.add('active');
    if (sectionName === 'news') loadWeatherNews();
    else if (sectionName === 'alerts') loadWeatherAlerts();
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('mobile-open');
}

// === WEATHER NEWS & ALERTS ===
async function loadWeatherNews() {
    const newsGrid = document.getElementById('news-grid');
    newsGrid.innerHTML = '<div class="news-card"><h3>Loading weather news...</h3></div>';
    const newsData = [
        { title: "Severe Thunderstorm Warning", description: "Heavy rainfall expected.", time: "2 hours ago" },
        { title: "Heat Wave Advisory", description: "Temperatures to reach 40°C.", time: "4 hours ago" },
        { title: "Air Quality Alert", description: "Poor air quality detected.", time: "6 hours ago" }
    ];
    newsGrid.innerHTML = '';
    newsData.forEach(news => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `<h3>${news.title}</h3><p>${news.description}</p><small>🕒 ${news.time}</small>`;
        newsGrid.appendChild(card);
    });
}

async function loadWeatherAlerts() {
    const alertsList = document.getElementById('alerts-list');
    const alertsData = [
        { type: "warning", title: "Heavy Rain", description: "Next 6 hours", time: "Active now" },
        { type: "info", title: "Temperature Drop", description: "Drop by 10°C tonight", time: "Tonight" }
    ];
    alertsList.innerHTML = '';
    alertsData.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = `alert-card ${alert.type}`;
        alertCard.innerHTML = `
            <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <div><h4>${alert.title}</h4><p>${alert.description}</p><small>${alert.time}</small></div>
        `;
        alertsList.appendChild(alertCard);
    });
}

function filterAlerts(type) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// === FAVORITES FUNCTIONALITY ===
let weatherUpdateCount = 0;

function updateFavoriteStats() {
    const favoriteCards = document.querySelectorAll('.favorite-card');
    const realCards = Array.from(favoriteCards).filter(card => !card.classList.contains('sample'));
    document.getElementById('total-favorites').textContent = realCards.length;
    let recent = '--';
    if (realCards.length > 0) {
        recent = realCards[realCards.length - 1].querySelector('h4').textContent.trim();
    }
    document.getElementById('recent-favorite').textContent = recent;
    document.getElementById('weather-updates').textContent = weatherUpdateCount;
}

function addFavoriteLocation() {
    const input = document.getElementById('favorite-input');
    const location = input.value.trim();
    if (location) {
        const favoritesList = document.getElementById('favorites-list');
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <div class="favorite-info"><h4>${location}</h4><p>Loading weather...</p></div>
            <div class="favorite-actions">
                <button onclick="loadFavoriteWeather('${location}')"><i class="fas fa-eye"></i></button>
                <button onclick="removeFavorite('${location}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        favoritesList.appendChild(card);
        input.value = '';
        updateFavoriteStats();
        loadFavoriteWeather(location);
    }
}

function removeFavorite(location) {
    if (confirm(`Remove ${location} from favorites?`)) {
        const favoriteCards = document.querySelectorAll('.favorite-card');
        favoriteCards.forEach(card => {
            const locationName = card.querySelector('h4').textContent;
            if (locationName === location) card.remove();
        });
        updateFavoriteStats();
    }
}

function loadFavoriteWeather(location) {
    showSection('home');
    document.getElementById('city-input').value = location;
    getWeatherByCity();
    weatherUpdateCount++;
    updateFavoriteStats();
}

// === MAP INITIALIZATION ===
function initMap() {
    map = new mappls.Map("map", { center: [28.6138954, 77.2090057] });
}

function centerMap(data) {
    const latitude = data.coord.lat;
    const longitude = data.coord.lon;
    map = new mappls.Map("map", { center: [latitude, longitude] });
}

window.onload = initMap; // Initialize Map on load

// === AUTOCOMPLETE LOCATION ===
function autoComplete() {
    const input = document.getElementById('city-input').value;
    if (input.length <= 2) {
        document.getElementById("suggestion-box").style.display = "none";
        return;
    }
    getSuggestion(input);
    document.getElementById("suggestion-box").style.display = "flex";
}

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
        .catch(err => console.log('error', err));
}

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
        }
    });
}

// === BACK TO TOP FUNCTIONALITY ===
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

// === INITIAL PAGE LOAD SETUP ===
document.addEventListener('DOMContentLoaded', function() {
    showSection('home');
    updateFavoriteStats();
    const settings = getSettings();
    const isCelsius = settings.tempUnit === 'celsius';
    const unitToggle = document.getElementById('unitToggle');
    if (unitToggle) unitToggle.checked = !isCelsius;
    updateTemperatureDisplay(isCelsius);
});

// === FETCH WEATHER & AIR POLLUTION ===
function getWeatherByCity() {
    const city = document.getElementById("city-input").value;
    if (!city) return alert("PLEASE ENTER CITY NAME");
    fetchWeatherByCity(city);
}

function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            fetchWeatherByCoordinates(lat, lon);
            centerMap({ coord: { lat, lon } });
        }, () => alert("Unable to retrieve your location."));
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function fetchWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(res => res.ok ? res.json() : Promise.reject('City not found'))
        .then(data => fetchAdditionalData(data))
        .catch(err => {
            console.error(err);
            fetchLatLon(city);
        });
}

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
            alert("Invalid location. Try again.");
        });
}

function fetchWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(res => res.json())
        .then(data => fetchAdditionalData(data))
        .catch(err => console.error(err));
}

function fetchAdditionalData(data) {
    const { name, sys, main, weather, wind, visibility, coord } = data;

    // Update Top Weather Panel
    document.getElementById('temperature').textContent = main.temp + '°C';
    document.getElementById('weather-description').textContent = weather[0].description;
    document.getElementById('city-name').textContent = `${name}, ${sys.country}`;
    document.getElementById('humidity').textContent = main.humidity + '%';
    document.getElementById('wind-speed').textContent = wind.speed + ' km/h';
    document.getElementById('pressure').textContent = main.pressure + ' hPa';
    document.getElementById('visibility').textContent = (visibility / 1000).toFixed(1) + ' km';
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    // Update Date & Time
    const now = new Date();
    document.getElementById('date-time').textContent = now.toLocaleString();

    // Update Big Table
    document.getElementById('date').textContent = now.toLocaleDateString();
    document.getElementById('city').textContent = name;
    document.getElementById('temp').textContent = main.temp + '°C';
    document.getElementById('fl').textContent = main.feels_like + '°C';
    document.getElementById('humi').textContent = main.humidity + ' %';
    document.getElementById('press').textContent = (main.pressure / 1013.25).toFixed(2) + ' atm';
    document.getElementById('visi').textContent = (visibility / 1000).toFixed(1) + ' Km';
    document.getElementById('ws').textContent = wind.speed + ' m/s';
    document.getElementById('cc').textContent = sys.country;
    document.getElementById('wi').textContent = weather[0].main;

    // Update Small Table
    document.getElementById('date1').textContent = now.toLocaleDateString();
    document.getElementById('city1').textContent = name;
    document.getElementById('temp1').textContent = main.temp + '°C';
    document.getElementById('fl1').textContent = main.feels_like + '°C';
    document.getElementById('humi1').textContent = main.humidity + ' %';
    document.getElementById('press1').textContent = (main.pressure / 1013.25).toFixed(2) + ' atm';
    document.getElementById('visi1').textContent = (visibility / 1000).toFixed(1) + ' Km';
    document.getElementById('ws1').textContent = wind.speed + ' m/s';
    document.getElementById('cc1').textContent = sys.country;
    document.getElementById('wi1').textContent = weather[0].main;

    // Continue fetching UV, Air Pollution & Forecast
    fetchUvData(coord.lat, coord.lon);
    fetchPollution(coord.lat, coord.lon);
    getWeatherForecast(coord.lat, coord.lon);
    centerMap(data);
}


function fetchUvData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    return fetch(url).then(res => res.json());
}

function fetchPollution(lat, lon) {
    const pollurl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetch(pollurl)
        .then(response => response.json())
        .then(data => displayPollution(data))
        .catch(error => console.error('Error fetching pollution info', error));
}

function displayWeather(data, uvdata) {
    const { temp, feels_like, humidity, pressure } = data.main;
    const visibility = data.visibility / 1000;
    const windSpeed = data.wind.speed;
    const date = new Date(data.dt * 1000).toLocaleDateString();
    const weatherdes = data.weather[0].main;
    const { country } = data.sys;
    const city = data.name;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', opt);
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', opt);

    document.getElementById("weat").innerText = `Weather Information : ${city}`;
    document.getElementById("air").innerText = `Air Pollution : ${city}`;

    const tempElements = ["temp", "fl", "temp1", "fl1"];
    tempElements.forEach(id => {
        document.getElementById(id).dataset.celsius = id.includes("fl") ? feels_like : temp;
    });

    ["ws", "ws1"].forEach(id => document.getElementById(id).dataset.windMs = windSpeed);
    ["press", "press1"].forEach(id => document.getElementById(id).dataset.pressureHpa = pressure);

    const settings = getSettings();
    updateTemperatureDisplay(settings.tempUnit === 'celsius');

    ["wi", "wi1"].forEach(id => document.getElementById(id).innerText = weatherdes);
    ["date", "date1"].forEach(id => document.getElementById(id).innerText = date);
    ["city", "city1"].forEach(id => document.getElementById(id).innerText = city);
    ["humi", "humi1"].forEach(id => document.getElementById(id).innerText = `${humidity}%`);
    ['bigUV','smallUV'].forEach(id => document.getElementById(id).innerText = `${uvdata.value}`);
    ["visi", "visi1"].forEach(id => document.getElementById(id).innerText = `${visibility} Km`);
    ["sr", "sr1"].forEach(id => document.getElementById(id).innerText = sunrise);
    ["ss", "ss1"].forEach(id => document.getElementById(id).innerText = sunset);
    ["cc", "cc1"].forEach(id => document.getElementById(id).innerText = country);

    ["press", "press1"].forEach(id => document.getElementById(id).innerText = convertPressure(pressure));
    ["ws", "ws1"].forEach(id => document.getElementById(id).innerText = convertWindSpeed(windSpeed));

    document.getElementById("city-input").value = '';
}

function displayPollution(data) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    const aqiLabel = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const label = aqiLabel[aqi - 1] || "Unknown";
    document.getElementById("aqi").innerText = label;
    document.getElementById("aqi1").innerText = label;

    const pollutionMetrics = ["co", "no", "no2", "o3", "so2", "pm2_5", "pm10", "nh3"];
    pollutionMetrics.forEach(metric => {
        const value = components[metric];
        const idLabel = metric === 'pm2_5' ? 'pm2.5' : metric;
        document.getElementById(idLabel).innerText = `${value} μg/m3`;
        document.getElementById(idLabel + "1").innerText = `${value} μg/m3`;
    });
}

// === UNIT CONVERSIONS & TOGGLES ===
function getSettings() {
    const savedSettings = localStorage.getItem('weatherBlastSettings');
    return savedSettings ? JSON.parse(savedSettings) : { tempUnit: 'celsius', windUnit: 'kmh', pressureUnit: 'hpa' };
}

function convertTemperature(tempC, targetUnit = null) {
    const unit = targetUnit || getSettings().tempUnit;
    return unit === 'fahrenheit' ? `${((tempC * 9/5) + 32).toFixed(1)}°F` : `${tempC.toFixed(1)}°C`;
}

function convertWindSpeed(speedMs, targetUnit = null) {
    const unit = targetUnit || getSettings().windUnit;
    if (unit === 'mph') return `${(speedMs * 2.237).toFixed(1)} mph`;
    if (unit === 'kmh') return `${(speedMs * 3.6).toFixed(1)} km/h`;
    return `${speedMs.toFixed(1)} m/s`;
}

function convertPressure(pressureHpa, targetUnit = null) {
    const unit = targetUnit || getSettings().pressureUnit;
    if (unit === 'mb') return `${pressureHpa.toFixed(1)} mb`;
    if (unit === 'inhg') return `${(pressureHpa * 0.02953).toFixed(2)} inHg`;
    return `${pressureHpa.toFixed(1)} hPa`;
}

function updateTemperatureDisplay(forceCelsius = null) {
    const isCelsius = forceCelsius !== null ? forceCelsius : getSettings().tempUnit === 'celsius';
    const tempElements = document.querySelectorAll('[data-celsius]');
    tempElements.forEach(el => {
        const tempC = parseFloat(el.dataset.celsius);
        if (!isNaN(tempC)) el.textContent = convertTemperature(tempC, isCelsius ? 'celsius' : 'fahrenheit');
    });
    if (lastForecastData) showWeatherForecast(lastForecastData);
}

// === FORECAST FUNCTIONALITY ===
function getWeatherForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            lastForecastData = data;
            showWeatherForecast(data);
        })
        .catch(error => console.error('Error fetching Forecast', error));
}

function showWeatherForecast(data) {
    const forecast = data.daily.slice(0, 8);
    const opt = { hour: '2-digit', minute: '2-digit' };

    const rows = {
        dates: forecast.map(day => `<th>${new Date(day.dt * 1000).toLocaleDateString()}</th>`).join(""),
        maxTemps: forecast.map(day => `<td>${convertTemperature(day.temp.max)}</td>`).join(""),
        minTemps: forecast.map(day => `<td>${convertTemperature(day.temp.min)}</td>`).join(""),
        sunrises: forecast.map(day => `<td>${new Date(day.sunrise * 1000).toLocaleTimeString('en-US', opt)}</td>`).join(""),
        sunsets: forecast.map(day => `<td>${new Date(day.sunset * 1000).toLocaleTimeString('en-US', opt)}</td>`).join(""),
        summaries: forecast.map(day => `<td>${day.weather[0].description}</td>`).join(""),
        icons: forecast.map(day => `<td><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"></td>`).join("")
    };

    document.getElementById("forecast").style.display = "block";
    document.getElementById("forecast-table").innerHTML = `
        <tr><th>Date</th>${rows.dates}</tr>
        <tr><th>Max-Temperature</th>${rows.maxTemps}</tr>
        <tr><th>Min-Temperature</th>${rows.minTemps}</tr>
        <tr><th>Sunrise</th>${rows.sunrises}</tr>
        <tr><th>Sunset</th>${rows.sunsets}</tr>
        <tr><th>Summary</th>${rows.summaries}</tr>
        <tr><th>Icon</th>${rows.icons}</tr>
    `;
}

// === DARK MODE TOGGLE ===
const darkbtn = document.getElementById('dark-mode');
darkbtn.addEventListener('click', function() {
    if (toggle) {
        document.body.style.backgroundColor = "rgba(17, 34, 29, 0.7)";
        document.body.style.color = "rgb(233, 239, 236)";
        darkbtn.textContent = "🌙";
        toggle = 0;
    } else {
        document.body.style.backgroundColor = "rgb(233, 239, 236)";
        document.body.style.color = "black";
        darkbtn.textContent = "☀️";
        toggle = 1;
    }
});


// ======= PART TO APPEND INTO script.js ======= //

// --- Simplified Weather Fetch Function ---
function getWeatherByCitySimple() {
  const city = document.getElementById("city-input").value;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('temperature').textContent = data.main.temp + ' °C';
      document.getElementById('weather-description').textContent = data.weather[0].description;
      document.getElementById('city-name').textContent = data.name + ', ' + data.sys.country;
      document.getElementById('humidity').textContent = data.main.humidity + '%';
      document.getElementById('wind-speed').textContent = data.wind.speed + ' km/h';
      document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
      document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
      document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      const now = new Date();
      document.getElementById('date-time').textContent = now.toLocaleString();

      // Call simplified hourly forecast
      getHourlyForecastSimple(data.coord.lat, data.coord.lon);
    })
    .catch(err => alert("City not found or API error"));
}

// --- Simplified Hourly Forecast Function ---
function getHourlyForecastSimple(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const forecastList = data.list.slice(0, 8); // Next 24 hours (8 intervals)
      const hourlyContainer = document.querySelector('.hourly-forecast-list');
      hourlyContainer.innerHTML = '';

      forecastList.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = item.main.temp + ' °C';
        const humidity = item.main.humidity + '%';
        const wind = item.wind.speed + ' km/h';
        const icon = item.weather[0].icon;

        const card = document.createElement('div');
        card.classList.add('hour-card');
        card.innerHTML = `
          <span class="hour-time">${time}</span>
          <img src="https://openweathermap.org/img/wn/${icon}.png" class="hour-icon" />
          <div class="hour-temp">${temp}</div>
          <div class="hour-wind">Wind: ${wind}</div>
          <div class="hour-humidity">Humidity: ${humidity}</div>
        `;
        hourlyContainer.appendChild(card);
      });
    });
}

// --- Forecast Tabs Switching ---
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".forecast-tabs .tab");
  const forecastList = document.querySelector(".hourly-forecast-list");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const selectedTab = tab.textContent.trim();
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      forecastList.innerHTML = "";
      for (let i = 1; i <= 4; i++) {
        forecastList.innerHTML += `
          <div class="hour-card">
            <span class="hour-time">${selectedTab} ${i * 3}AM</span>
            <div class="hour-icon">🌤️</div>
            <div class="hour-temp">${15 + i}°</div>
            <div class="hour-wind">Wind: ${10 + i} km/h</div>
            <div class="hour-humidity">Humidity: ${50 + i}%</div>
          </div>`;
      }
    });
  });
});

// ======= END OF APPENDED PART =======