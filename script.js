// === API KEYS ===
const apiKey = 'a9597b9143bd10ce791e1b80c44d2d50'; // OpenWeatherMap API key
const geoAPI = '2783701aa79748f9b21e86f7ca361dd4'; // GeoApify API key
const opt = { timeStyle: 'short', hour12: true }; // Time formatting options

let map; // Global map object

// === Check Toggle State ===
function isFahrenheitToggled() {
    const toggle = document.getElementById("unitToggle");
    return toggle && toggle.checked;
}

// === INITIALIZE DEFAULT MAP ===
function initMap() {
    map = new mappls.Map("map", {
        center: [28.6138954, 77.2090057] // Default to New Delhi
    });
}
window.onload = initMap;

// === RE-CENTER MAP TO SPECIFIC LOCATION ===
function initMap1(data) {
    const latitude = data.coord.lat;
    const longitude = data.coord.lon;
    map = new mappls.Map("map", { center: [latitude, longitude] });
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

// === FETCH WEATHER FOR CITY ===
function getWeatherByCity() {
    const city = document.getElementById("city-input").value;
    if (!city) return alert("PLEASE ENTER CITY NAME");
    fetchWeatherByCity(city);
}

// === FETCH WEATHER FOR CURRENT LOCATION ===
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            fetchWeatherByCoordinates(lat, lon);
            initMap1({ coord: { lat, lon } });
        }, () => alert("Unable to retrieve your location."));
    } else {
        alert("Geolocation is not supported by this browser.");
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
        .then(data => displayWeather(data))
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
            alert("Invalid location. Try again.");
        });
}

// === GET WEATHER FROM LAT/LON ===
function fetchWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            displayWeather(data);
            initMap1(data);
        })
        .catch(err => console.error(err));
}

// === DISPLAY WEATHER DETAILS IN UI ===
function displayWeather(data) {
    const { temp, feels_like, humidity, pressure } = data.main;
    const visibility = data.visibility / 1000;
    const windSpeed = data.wind.speed;
    const date = new Date(data.dt * 1000).toLocaleDateString();
    const weatherdes = data.weather[0].main;
    const { country } = data.sys;
    const city = data.name;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', opt);
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', opt);
    const { lat, lon } = data.coord;

    fetchPollution(lat, lon);
    getWeatherForecast(lat, lon);

    document.getElementById("weat").innerText = `Weather Information : ${city}`;
    document.getElementById("air").innerText = `Air Pollution : ${city}`;

    // Store base Celsius temp in dataset
    ["temp", "fl", "temp1", "fl1"].forEach(id => {
        document.getElementById(id).dataset.celsius = id.includes("fl") ? feels_like : temp;
    });

    // Detect toggle and update unit display
    const isCelsius = !isFahrenheitToggled();
    updateTemperatureDisplay(isCelsius);

    // Update UI (non-temperature)
    ["wi", "wi1"].forEach(id => document.getElementById(id).innerText = weatherdes);
    ["date", "date1"].forEach(id => document.getElementById(id).innerText = date);
    ["city", "city1"].forEach(id => document.getElementById(id).innerText = city);
    ["humi", "humi1"].forEach(id => document.getElementById(id).innerText = `${humidity}%`);
    ["press", "press1"].forEach(id => document.getElementById(id).innerText = `${pressure} hPa`);
    ["visi", "visi1"].forEach(id => document.getElementById(id).innerText = `${visibility} Km`);
    ["ws", "ws1"].forEach(id => document.getElementById(id).innerText = `${windSpeed} m/s`);
    ["sr", "sr1"].forEach(id => document.getElementById(id).innerText = sunrise);
    ["ss", "ss1"].forEach(id => document.getElementById(id).innerText = sunset);
    ["cc", "cc1"].forEach(id => document.getElementById(id).innerText = country);

    document.getElementById("city-input").value = '';
}

// === CONVERSION HELPERS ===
function celsiusToFahrenheit(c) { return (c * 9 / 5) + 32; }
function fahrenheitToCelsius(f) { return (f - 32) * 5 / 9; }

// === TOGGLE CELSIUS/FAHRENHEIT DISPLAY ===

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

// Forecast display with °C ⇄ °F toggle support
function getWeatherForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            showWeatherForecast(data);
        })
        .catch(error => {
            console.error('Error fetching Forecast', error);
        });
}

function convertTemp(temp, isCelsius) {
    return isCelsius ? `${temp.toFixed(1)} °C` : `${((temp * 9/5) + 32).toFixed(1)} °F`;
}

function showWeatherForecast(data) {
    const isCelsius = !document.getElementById('unitToggle').checked;
    const forecast = data.daily.slice(0, 8);
    const opt = { hour: '2-digit', minute: '2-digit' };

    const dates = forecast.map(day => `<th>${new Date(day.dt * 1000).toLocaleDateString()}</th>`).join("");
    const maxTemps = forecast.map(day => `<td>${convertTemp(day.temp.max, isCelsius)}</td>`).join("");
    const minTemps = forecast.map(day => `<td>${convertTemp(day.temp.min, isCelsius)}</td>`).join("");
    const sunrises = forecast.map(day => `<td>${new Date(day.sunrise * 1000).toLocaleTimeString('en-US', opt)}</td>`).join("");
    const sunsets = forecast.map(day => `<td>${new Date(day.sunset * 1000).toLocaleTimeString('en-US', opt)}</td>`).join("");
    const summaries = forecast.map(day => `<td>${day.weather[0].description}</td>`).join("");
    const icons = forecast.map(day => `<td class = "icons-block"><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"></td>`).join("");

    document.getElementById("forecast").style.display = "block";
    document.getElementById("forecast-table").innerHTML = `
        <tr><th>Date</th>${dates}</tr>
        <tr><th>Max-Temperature</th>${maxTemps}</tr>
        <tr><th>Min-Temperature</th>${minTemps}</tr>
        <tr><th>Sunrise</th>${sunrises}</tr>
        <tr><th>Sunset</th>${sunsets}</tr>
        <tr><th>Summary</th>${summaries}</tr>
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
}

// Dark-mode toggle
const darkbtn = document.getElementById('dark-mode');
let toggle = 1;
function changedisplay() {
    if (toggle == 1) {
        // dark mode styling
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
        localStorage.setItem("theme", "dark"); 
        toggle = 0;
    } else {
        // light mode styling
        document.querySelector('body').style.backgroundColor = "rgb(233, 239, 236)";
        document.querySelector('body').style.color = "black";
        darkbtn.textContent = "☀️";
        document.querySelectorAll("table, th, td").forEach(el => {
            el.style.border = "1px solid rgba(22, 66, 60, 1)";
            el.style.color = "rgba(22, 66, 60, 1)";
        });
        localStorage.setItem("theme", "light"); 
        toggle = 1;
    }
}

darkbtn.addEventListener('click', changedisplay);

// Check for saved theme in localStorage and apply on load
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        toggle = 1; // important to allow toggling later
        changedisplay();
    } else if (savedTheme === "light") {
        toggle = 0;
        changedisplay();
    }
});


// Temperature toggle listener
function updateTemperatureDisplay(isCelsius) {
    const tempElements = document.querySelectorAll('[data-celsius]');
    tempElements.forEach(element => {
        const tempC = parseFloat(element.dataset.celsius);
        const displayTemp = isCelsius ? `${tempC.toFixed(1)}°C` : `${((tempC * 9/5) + 32).toFixed(1)}°F`;
        element.textContent = displayTemp;
    });

    const currentTemp = parseFloat(document.getElementById('temp').dataset.celsius);
    const feelsLikeTemp = parseFloat(document.getElementById('fl').dataset.celsius);
    document.getElementById('temp').textContent = isCelsius ? `${currentTemp}°C` : `${(currentTemp * 9/5 + 32).toFixed(1)}°F`;
    document.getElementById('fl').textContent = isCelsius ? `${feelsLikeTemp}°C` : `${(feelsLikeTemp * 9/5 + 32).toFixed(1)}°F`;

    // Refresh forecast with updated unit
    if (lastForecastData) {
        showWeatherForecast(lastForecastData);
    }
}

// Save forecast data globally for reuse
let lastForecastData = null;

// Wrap fetch to save forecast
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

// Temperature unit toggle listener
const unitToggle = document.getElementById('unitToggle');
unitToggle.addEventListener('change', function () {
    const isCelsius = !this.checked;
    updateTemperatureDisplay(isCelsius);
});

// Scroll to top button
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

//added share button 
const shareBtn = document.getElementById("shareBtn");
shareBtn.style.display = "inline-block"; // show the button

shareBtn.onclick = async () => {
    const city = document.getElementById("city").textContent;
    const temperature = document.getElementById("temp").textContent;
    const description = document.getElementById("wi").textContent;
    const aqi = document.getElementById("aqi").textContent;

    const shareText = `📍 ${city}\n🌡️ Temp: ${temperature}\n🌤️ ${description}\n🌫️ AQI: ${aqi}\nShared via Weather Blast`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: "Weather Update",
                text: shareText,
            });
        } catch (err) {
            console.error("Share failed:", err);
        }
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert("Copied to clipboard!");
        });
    }
};



