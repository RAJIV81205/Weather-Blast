// === API KEYS ===
const apiKey = 'a9597b9143bd10ce791e1b80c44d2d50'; // OpenWeatherMap API key
const geoAPI = '2783701aa79748f9b21e86f7ca361dd3'; // GeoApify API key
const opt = { timeStyle: 'short', hour12: true }; // Time formatting options

let map; // Global map object

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
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    if (sectionName === 'news') {
        loadWeatherNews();
    } else if (sectionName === 'alerts') {
        loadWeatherAlerts();
    }
}

// === MOBILE MENU FUNCTIONALITY ===
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-open');
}

// === WEATHER NEWS FUNCTIONALITY ===
async function loadWeatherNews() {
    const newsGrid = document.getElementById('news-grid');
    newsGrid.innerHTML = '<div class="news-card"><h3>Loading weather news...</h3></div>';
    
    try {
        const newsData = [
            {
                title: "Severe Thunderstorm Warning",
                description: "Heavy rainfall and strong winds expected in the northeastern regions.",
                time: "2 hours ago",
                type: "warning"
            },
            {
                title: "Heat Wave Advisory",
                description: "Temperatures expected to reach 40°C in central areas. Stay hydrated.",
                time: "4 hours ago",
                type: "advisory"
            },
            {
                title: "Air Quality Alert",
                description: "Poor air quality detected due to dust storms. Limit outdoor activities.",
                time: "6 hours ago",
                type: "alert"
            }
        ];
        
        newsGrid.innerHTML = '';
        newsData.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.innerHTML = `
                <h3>${news.title}</h3>
                <p>${news.description}</p>
                <small>🕒 ${news.time}</small>
            `;
            newsGrid.appendChild(newsCard);
        });
    } catch (error) {
        newsGrid.innerHTML = '<div class="news-card"><h3>Error loading news</h3><p>Please try again later.</p></div>';
    }
}

// === WEATHER ALERTS FUNCTIONALITY ===
async function loadWeatherAlerts() {
    const alertsList = document.getElementById('alerts-list');
    
    const alertsData = [
        {
            type: "warning",
            title: "Heavy Rain Warning",
            description: "Expect heavy rainfall for the next 6 hours. Avoid traveling if possible.",
            time: "Active now"
        },
        {
            type: "info",
            title: "Temperature Drop",
            description: "Temperature will drop by 10°C tonight. Dress warmly.",
            time: "Starting tonight"
        }
    ];
    
    alertsList.innerHTML = '';
    alertsData.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = `alert-card ${alert.type}`;
        alertCard.innerHTML = `
            <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <div>
                <h4>${alert.title}</h4>
                <p>${alert.description}</p>
                <small>${alert.time}</small>
            </div>
        `;
        alertsList.appendChild(alertCard);
    });
}

// === FILTER ALERTS FUNCTIONALITY ===
function filterAlerts(type) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    console.log('Filtering alerts by:', type);
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
        const favoriteCard = document.createElement('div');
        favoriteCard.className = 'favorite-card';
        favoriteCard.innerHTML = `
            <div class="favorite-info">
                <h4>${location}</h4>
                <p>Loading weather...</p>
            </div>
            <div class="favorite-actions">
                <button onclick="loadFavoriteWeather('${location}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="removeFavorite('${location}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        favoritesList.appendChild(favoriteCard);
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
            if (locationName === location) {
                card.remove();
            }
        });
        updateFavoriteStats();
    }
}

function loadFavoriteWeather(location) {
    console.log('Loading weather for:', location);
    showSection('home');
    document.getElementById('city-input').value = location;
    getWeatherByCity();
    weatherUpdateCount++;
    updateFavoriteStats();
}

// === BACK TO TOP FUNCTIONALITY ===
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

// === Initialize on page load ===
document.addEventListener('DOMContentLoaded', function() {
    showSection('home');
    updateFavoriteStats();
});

// === Check Toggle State ===
function isFahrenheitToggled() {
    const toggle = document.getElementById("unitToggle");
    return toggle && toggle.checked;
}

// === INITIALIZE DEFAULT MAP ===
function initMap() {
    map = new mappls.Map("map", {
        center: [28.6138954, 77.2090057]
    });
}
window.onload = initMap;

// === RE-CENTER MAP TO SPECIFIC LOCATION ===
function initMap1(data) {
    const latitude = data.coord.lat;
    const longitude = data.coord.lon;

    map = new mappls.Map("map", {
        center: [latitude, longitude],
        zoom: 10
    });

    map.addListener('load', () => {
        new mappls.Marker({
            map: map,
            position: {
                lat: latitude,
                lng: longitude
            },
            title: data.name || "Selected Location"
        });
    });
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
        .catch(err => console.log('error', err));
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
        }
    });
}

// === SHOW LOADER ===
function showLoader() {
    document.getElementById('search-loader').style.display = 'block';
}
function hideLoader() {
    document.getElementById('search-loader').style.display = 'none';
}

// === FETCH WEATHER FOR CITY ===
function getWeatherByCity() {
    const city = document.getElementById("city-input").value;
    if (!city) return alert("PLEASE ENTER CITY NAME");
    showLoader();
    fetchWeatherByCity(city);
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
            hideLoader();
            displayWeather(data);
        })
        .catch(err => {
            hideLoader();
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
            hideLoader();
            fetchWeatherByCoordinates(lat, lon);
        })
        .catch(err => {
            hideLoader();
            console.error(err);
            alert("Invalid location. Try again.");
        });
}

// === GET WEATHER FROM LAT/LON ===
function fetchWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            hideLoader();
            displayWeather(data);
            initMap1(data);
        })
        .catch(err => {
            hideLoader();
            console.error(err);
        });
}

// === CONVERT DEGREES TO CARDINAL DIRECTION ===
function degreesToCardinal(deg) {
    const directions = [
        { label: 'N', range: [348.75, 11.25] },
        { label: 'NNE', range: [11.25, 33.75] },
        { label: 'NE', range: [33.75, 56.25] },
        { label: 'ENE', range: [56.25, 78.75] },
        { label: 'E', range: [78.75, 101.25] },
        { label: 'ESE', range: [101.25, 123.75] },
        { label: 'SE', range: [123.75, 146.25] },
        { label: 'SSE', range: [146.25, 168.75] },
        { label: 'S', range: [168.75, 191.25] },
        { label: 'SSW', range: [191.25, 213.75] },
        { label: 'SW', range: [213.75, 236.25] },
        { label: 'WSW', range: [236.25, 258.75] },
        { label: 'W', range: [258.75, 281.25] },
        { label: 'WNW', range: [281.25, 303.75] },
        { label: 'NW', range: [303.75, 326.25] },
        { label: 'NNW', range: [326.25, 348.75] }
    ];
    deg = deg % 360;
    for (const dir of directions) {
        const [min, max] = dir.range;
        if (deg >= min && deg < max || (min > max && (deg >= min || deg < max))) {
            return dir.label;
        }
    }
    return 'N';
}

// === UPDATE COMPASS DISPLAY ===
function updateCompass(windDeg) {
    const arrow = document.getElementById('compass-arrow');
    const directionLabel = document.getElementById('compass-direction');
    if (arrow && directionLabel) {
        arrow.style.transform = `rotate(${windDeg}deg)`;
        const cardinal = degreesToCardinal(windDeg);
        directionLabel.textContent = `Direction: ${cardinal} (${Math.round(windDeg)}°)`;
    }
}

// === DISPLAY WEATHER DETAILS IN UI ===
function displayWeather(data) {
    const { temp, feels_like, humidity, pressure } = data.main;
    const visibility = data.visibility / 1000;
    const windSpeed = data.wind.speed;
    const windDeg = data.wind.deg;
    const date = new Date(data.dt * 1000).toLocaleDateString();
    const weatherdes = data.weather[0].main;
    const { country } = data.sys;
    const city = data.name;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', opt);
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', opt);
    const { lat, lon } = data.coord;

    fetchPollution(lat, lon);
    getWeatherForecast(lat, lon); 

    updateCompass(windDeg);

    document.getElementById("weat").innerText = `Weather Information : ${city}`;
    document.getElementById("air").innerText = `Air Pollution : ${city}`;

    ["temp", "fl", "temp1", "fl1"].forEach(id => {
        document.getElementById(id).dataset.celsius = id.includes("fl") ? feels_like : temp;
    });
    
    ["ws", "ws1"].forEach(id => {
        const element = document.getElementById(id);
        element.dataset.windMs = windSpeed;
    });
    
    ["press", "press1"].forEach(id => {
        const element = document.getElementById(id);
        element.dataset.pressureHpa = pressure;
    });

    const settings = getSettings();
    const isCelsius = settings.tempUnit === 'celsius';
    updateTemperatureDisplay(isCelsius);

    ["wi", "wi1"].forEach(id => document.getElementById(id).innerText = weatherdes);
    ["date", "date1"].forEach(id => document.getElementById(id).innerText = date);
    ["city", "city1"].forEach(id => document.getElementById(id).innerText = city);
    ["humi", "humi1"].forEach(id => document.getElementById(id).innerText = `${humidity}%`);
    ["visi", "visi1"].forEach(id => document.getElementById(id).innerText = `${visibility} Km`);
    ["sr", "sr1"].forEach(id => document.getElementById(id).innerText = sunrise);
    ["ss", "ss1"].forEach(id => document.getElementById(id).innerText = sunset);
    ["cc", "cc1"].forEach(id => document.getElementById(id).innerText = country);
    
    ["press", "press1"].forEach(id => document.getElementById(id).innerText = convertPressure(pressure));
    ["ws", "ws1"].forEach(id => document.getElementById(id).innerText = convertWindSpeed(windSpeed));

    document.getElementById("city-input").value = '';
    document.querySelector(".weather-info-header").scrollIntoView({ behavior: "smooth" });
}

// === UNIT CONVERSION UTILITIES ===
function getSettings() {
    const savedSettings = localStorage.getItem('weatherBlastSettings');
    if (savedSettings) {
        return JSON.parse(savedSettings);
    }
    return {
        tempUnit: 'celsius',
        windUnit: 'kmh',
        pressureUnit: 'hpa'
    };
}

function convertTemperature(tempC, targetUnit = null) {
    const settings = getSettings();
    const unit = targetUnit || settings.tempUnit;
    
    if (unit === 'fahrenheit') {
        return `${((tempC * 9/5) + 32).toFixed(1)}°F`;
    }
    return `${tempC.toFixed(1)}°C`;
}

function convertWindSpeed(speedMs, targetUnit = null) {
    const settings = getSettings();
    const unit = targetUnit || settings.windUnit;
    
    switch(unit) {
        case 'mph':
            return `${(speedMs * 2.237).toFixed(1)} mph`;
        case 'kmh':
            return `${(speedMs * 3.6).toFixed(1)} km/h`;
        default:
            return `${speedMs.toFixed(1)} m/s`;
    }
}

function convertPressure(pressureHpa, targetUnit = null) {
    const settings = getSettings();
    const unit = targetUnit || settings.pressureUnit;
    
    switch(unit) {
        case 'mb':
            return `${pressureHpa.toFixed(1)} mb`;
        case 'inhg':
            return `${(pressureHpa * 0.02953).toFixed(2)} inHg`;
        default:
            return `${pressureHpa.toFixed(1)} hPa`;
    }
}

// === CONVERSION HELPERS ===
function celsiusToFahrenheit(c) { return (c * 9 / 5) + 32; }
function fahrenheitToCelsius(f) { return (f - 32) * 5 / 9; }

// === TOGGLE CELSIUS/FAHRENHEIT DISPLAY ===
function updateTemperatureDisplay(forceCelsius = null) {
    const settings = getSettings();
    const isCelsius = forceCelsius !== null ? forceCelsius : (settings.tempUnit === 'celsius');
    
    const unitToggle = document.getElementById('unitToggle');
    if (unitToggle) {
        unitToggle.checked = !isCelsius;
    }
    
    const elements = ["temp", "fl", "temp1", "fl1"];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.dataset.celsius) {
            const c = parseFloat(el.dataset.celsius);
            el.innerText = convertTemperature(c, isCelsius ? 'celsius' : 'fahrenheit');
        }
    });
    
    const tempElements = document.querySelectorAll('[data-celsius]');
    tempElements.forEach(element => {
        const tempC = parseFloat(element.dataset.celsius);
        if (!isNaN(tempC)) {
            element.textContent = convertTemperature(tempC, isCelsius ? 'celsius' : 'fahrenheit');
        }
    });
    
    if (lastForecastData) {
        showWeatherForecast(lastForecastData);
    }
}
// === FETCH POLLUTION DATA ===
function fetchPollution(lat, lon) {
    const pollurl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetch(pollurl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayPollution(data);
        })
        .catch(error => {
            console.error('Error fetching pollution info', error);
        });
}

// Display pollution data
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
        const label = metric === 'pm2_5' ? 'pm2.5' : metric;
        document.getElementById(label).innerText = `${value} μg/m3`;
        document.getElementById(label + "1").innerText = `${value} μg/m3`;
    });
}

// Save forecast data globally for reuse
let lastForecastData = null;

// === FORECAST & UV INDEX DATA ===
function getWeatherForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            lastForecastData = data;
            showWeatherForecast(data);
        })
        .catch(error => {
            console.error('Error fetching Forecast', error);
        });
}

function convertTemp(temp, isCelsius = null) {
    const settings = getSettings();
    const useCelsius = isCelsius !== null ? isCelsius : (settings.tempUnit === 'celsius');
    return convertTemperature(temp, useCelsius ? 'celsius' : 'fahrenheit');
}

//Adding an object for notes 
const notes = {
    clear: ["Sun’s out, shades on! Don’t forget sunscreen 😎", "Perfect day for an ice cream or a long walk 🍦🚶‍♀️", "Clear skies and good vibes ahead 🌞✨"],
    clouds: ["Clouds are having a meeting up there! ☁️", "Still a great day to be outdoors — maybe a light jacket?", "Sky's wearing a gray sweater today! 🌫️"],
    rain: ["Don’t forget your umbrella — it's nature’s splash party ☔💃", "Perfect day for pakoras and Netflix 🍲🎬", "Tiny droplets, big cozy vibes!"],
    snow: ["Snowball fights or hot cocoa? Or both? ☕❄️", "Snowflakes are saying hello! ❄️👋", "Winter wonderland loading... ⛄❄️"],
    thunderstorm: ["⚡ Dramatic skies incoming! Stay safe and unplug if needed.", "A good day to stay in and watch the show from your window 🎭", "It's Thor's bowling night! ⚡🎳"],
    atmosphere: ["Dreamy, soft-focus day! 🌫️✨", "It’s one of those days… where the air's got secrets. Stay curious, stay indoors if needed! 🔮🌪️", "Atmospheric trickery afoot! The skies are casting illusions — step carefully, seer of weather 👁️️🗨️🌫️"]
}

//categories grouping together weather desc 
const weatherKeywords = {
    clear: ['clear', 'sunny'], clouds: ['cloud', 'overcast'], rain: ['rain', 'drizzle', 'shower'], snow: ["snow", "sleet"], thunderstorm: ['thunderstorm', 'thunder'], atmosphere: ['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'tornado']
}

//assign category to weather desc info
function extractWeatherInfo(weatherMain = ''){
    const main = weatherMain.toLowerCase();
    for(const [category, keywords] of Object.entries(weatherKeywords)){
        if(keywords.some(keyword=>main.includes(keyword))){
            return category;
        }
    }
    return 'clear';
}

//function to give note randomly
function giveNotes(weatherMain = ''){
    const category = extractWeatherInfo(weatherMain);
    const note = notes[category];

    const randomIdx = Math.floor(Math.random()*note.length);
    return note[randomIdx];
}

function showWeatherForecast(data) {
    const settings = getSettings();
    const isCelsius = settings.tempUnit === 'celsius';
    const forecast = data.daily.slice(0, 8);
    const opt = { hour: '2-digit', minute: '2-digit' };
    
    const currentUVIndex = data.current.uvi;
    ['bigUV','smallUV'].forEach(id => document.getElementById(id).innerText = `${currentUVIndex}`);

    const dates = forecast.map(day => `<th>${new Date(day.dt * 1000).toLocaleDateString()}</th>`).join("");
    const maxTemps = forecast.map(day => `<td>${convertTemp(day.temp.max, isCelsius)}</td>`).join("");
    const minTemps = forecast.map(day => `<td>${convertTemp(day.temp.min, isCelsius)}</td>`).join("");
    const sunrises = forecast.map(day => `<td>${new Date(day.sunrise * 1000).toLocaleTimeString('en-US', opt)}</td>`).join("");
    const sunsets = forecast.map(day => `<td>${new Date(day.sunset * 1000).toLocaleTimeString('en-US', opt)}</td>`).join("");
    const summaries = forecast.map(day => `<td>${day.weather[0].description}</td>`).join("");
    const icons = forecast.map(day => `<td><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"></td>`).join("");
    const noteForUser = forecast.map(day => `<td class = "notes"><p class="notes-txt">${giveNotes(day.weather[0].main)}</p></td>`).join("");


    document.getElementById("forecast").style.display = "block";
    document.getElementById("forecast-table").innerHTML = `
        <tr><th>Date</th>${dates}</tr>
        <tr><th>Max-Temperature</th>${maxTemps}</tr>
        <tr><th>Min-Temperature</th>${minTemps}</tr>
        <tr><th>Sunrise</th>${sunrises}</tr>
        <tr><th>Sunset</th>${sunsets}</tr>
        <tr><th>Summary</th>${summaries}</tr>
        <tr><th>Something for you!<br>(hover to unlock)</th>${noteForUser}</tr>
        <tr><th>Icon</th>${icons}</tr>
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

    console.log("weather1 = ", data.daily[0].weather[0].main);  //just for debug purpose

    applyWeatherTheme(extractWeatherInfo(data.daily[0].weather[0].main));

}

// Dark-mode toggle
const darkbtn = document.getElementById('dark-mode');
let toggle = 1;
function changedisplay() {
    if (toggle) {
        document.querySelector('body').style.backgroundColor = "rgba(17, 34, 29, 0.7)";
        document.querySelector('body').style.color = "rgb(233, 239, 236)";
        darkbtn.textContent = "🌙";
        document.querySelectorAll("table, th, td").forEach(el => {
            el.style.border = "1px solid rgb(233, 239, 236)";
            el.style.color = "rgb(233, 239, 236)";
        });
        document.querySelector('.forecasttable').querySelectorAll('th').forEach(et => {
            et.style.color = "rgba(17, 34, 29, 0.7)";
        });
        toggle = 0;
    } else {
        document.querySelector('body').style.backgroundColor = "rgb(233, 239, 236)";
        document.querySelector('body').style.color = "black";
        darkbtn.textContent = "☀️";
        document.querySelectorAll("table, th, td").forEach(el => {
            el.style.border = "1px solid rgba(22, 66, 60, 1)";
            el.style.color = "black";
        });
        toggle = 1;
    }
}
darkbtn.addEventListener('click', changedisplay);

//-------------------theme changer

// Simple Weather-Based Themes
const weatherThemes = {
    clear: {
        background: "url('images/clearsky.gif') center / cover",
        filter: "blur(10px)",
        thColor: "#ff9a27ff",
        thTxtColor: "white",
        textColor: "#8B4513",
        cardBg: "rgba(253, 255, 157, 0.5)"
    },
    rain: {
        background: "url('images/rain1.gif')",
        filter: "blur(0px)",
        thColor: "rgba(70, 131, 180, 1)",
        thTxtColor: "white",
        textColor: "black",
        cardBg: "rgba(70, 130, 180, 0.3)"
    },
    snow: {
        background: "url('images/snowy.gif') center / cover",
        filter: "blur(3px)",
        thColor: "#191970c7",
        thTxtColor: "white",
        textColor: "#191970",
        cardBg: "rgba(255, 255, 255, 0.9)"
    },
    clouds: {
        background: "url('images/clouds.jpg') center / cover",
        filter: "blur(5px)",
        thColor: "rgba(151, 151, 151, 1)",
        thTxtColor: "white",
        textColor: "black",
        cardBg: "rgba(214, 213, 213, 0.32)"
    },
    thunderstorm: {
        background: "url('images/thunder.gif') center / cover",
        filter: "blur(5px)",
        thColor: "rgba(76, 0, 130, 1)",
        thTxtColor: "white",
        textColor: "#FFD700",
        cardBg: "rgba(75, 0, 130, 0.4)"
    },
    atmosphere: {
        background: "url('images/clearsky.gif') center / cover",
        filter: "blur(5px)",
        thColor: "rgba(255, 255, 190, 1)",
        thTxtColor: "white",
        textColor: "black",
        cardBg: "rgba(245, 245, 220, 0.8)"
    }
};

function applyWeatherTheme(weatherType) {
    const theme = weatherThemes[weatherType] || weatherThemes.clear;
    
    // Apply background
    document.body.style.background = theme.background;
    document.body.style.backdropFilter = theme.filter;
    document.body.style.color = theme.textColor;
    
    // Apply to cards and tables
    document.querySelectorAll('.card, table, td').forEach(el => {
        el.style.background = theme.cardBg;
        el.style.color = theme.textColor;
        el.style.border = `1px solid ${theme.textColor}`;
    });
    document.querySelectorAll('th').forEach(el => {
        el.style.background = theme.thColor;
        el.style.color = theme.thTxtColor;
        el.style.border = `1px solid ${theme.textColor}`;
    });
    
    // Apply to buttons (except theme control buttons)
    document.querySelectorAll('button:not(#dark-mode):not(#theme)').forEach(btn => {
        btn.style.background = theme.textColor;
        btn.style.color = theme.background.split(' ')[0].replace('linear-gradient(to right, ', '');
    });

    // Apply to compass container
    document.querySelectorAll('.compass-container, .compass-dial, .compass-arrow').forEach(el => {
        el.style.background = theme.cardBg;
        el.style.color = theme.textColor;
        el.style.border = `1px solid ${theme.textColor}`;
    });
}

//---------------------------------


// Temperature toggle listener
function updateTemperatureDisplay(isCelsius) {
    const settings = getSettings();
    const useCelsius = isCelsius !== undefined ? isCelsius : (settings.tempUnit === 'celsius');
    
    const tempElements = document.querySelectorAll('[data-celsius]');
    tempElements.forEach(element => {
        const tempC = parseFloat(element.dataset.celsius);
        if (!isNaN(tempC)) {
            element.textContent = convertTemperature(tempC, useCelsius ? 'celsius' : 'fahrenheit');
        }
    });

    const currentTemp = parseFloat(document.getElementById('temp')?.dataset.celsius);
    const feelsLikeTemp = parseFloat(document.getElementById('fl')?.dataset.celsius);
    
    if (!isNaN(currentTemp)) {
        document.getElementById('temp').textContent = convertTemperature(currentTemp, useCelsius ? 'celsius' : 'fahrenheit');
    }
    if (!isNaN(feelsLikeTemp)) {
        document.getElementById('fl').textContent = convertTemperature(feelsLikeTemp, useCelsius ? 'celsius' : 'fahrenheit');
    }

    if (lastForecastData) {
        showWeatherForecast(lastForecastData);
    }
}

const unitToggle = document.getElementById('unitToggle');
if (unitToggle) {
    unitToggle.addEventListener('change', function () {
        const isCelsius = !this.checked;
        const settings = getSettings();
        settings.tempUnit = isCelsius ? 'celsius' : 'fahrenheit';
        localStorage.setItem('weatherBlastSettings', JSON.stringify(settings));
        
        updateTemperatureDisplay(isCelsius);
        
        const tempUnitSetting = document.getElementById('temp-unit-setting');
        if (tempUnitSetting) {
            tempUnitSetting.value = settings.tempUnit;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const settings = getSettings();
    const isCelsius = settings.tempUnit === 'celsius';
    
    if (unitToggle) {
        unitToggle.checked = !isCelsius;
    }
    
    updateTemperatureDisplay(isCelsius);
});

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

window.addEventListener("beforeunload", function () {
    window.scrollTo(0, 0);
});

let lastSearchQuery = '';

function getWeatherByCity() {
    const city = document.getElementById("city-input").value;
    if (!city) {
        alert("PLEASE ENTER CITY NAME");
        return;
    }
    lastSearchQuery = city;
    showLoader();
    fetchWeatherByCity(city);
}

function getWeatherByLocation() {
    lastSearchQuery = 'current_location';
    showLoader();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                hideLoader();
                console.error("Geolocation error:", error);
                alert("Could not get your location. Please enter a city manually.");
            }
        );
    } else {
        hideLoader();
        alert("Geolocation is not supported by your browser.");
    }
}

function refreshWeatherData() {
    if (lastSearchQuery === 'current_location') {
        getWeatherByLocation();
    } else if (lastSearchQuery) {
        fetchWeatherByCity(lastSearchQuery);
    } else {
        alert("Please enter a location and search, or use your current location, before refreshing. 🔄");
    }
}

// ==============================
// === Share Button Functionality ===
// ==============================

const shareButton = document.getElementById('shareButton');
if (shareButton) {
    shareButton.addEventListener('click', shareWeather);
}

function shareWeather() {
    if (navigator.share) {
        const city = document.getElementById('city')?.innerText;
        const temp = document.getElementById('temp')?.innerText;
        const weatherInfo = document.getElementById('wi')?.innerText;

        let shareText = "Check out the weather on Weather-Blast!";
        
        if (city && temp && weatherInfo && city !== 'City' && temp !== '0°C') {
            shareText = `Current weather in ${city}: ${temp}, ${weatherInfo}. Check it out on Weather-Blast!`;
        } else {
            alert("No weather data to share yet. Please search for a location first.");
            return;
        }

        const pageUrl = window.location.href;
        
        const combinedText = `${shareText} ${pageUrl}`;

        navigator.share({
            title: 'Weather-Blast',
            text: combinedText
        })
        .then(() => console.log('Successfully shared weather data'))
        .catch((error) => console.error('Error sharing weather data:', error));
    } else {
        alert("Sharing is not supported on this browser. You can manually copy the URL to share.");
        console.log('Web Share API not supported on this browser.');
    }
}