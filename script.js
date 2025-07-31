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

    map.setCenter({ lat: latitude, lng: longitude });

    if (window.currentMarker) {
        window.currentMarker.remove();
    }

    const marker = new mappls.Marker({
        map: map,
        position: { lat: latitude, lng: longitude },
        title: "Selected Location"
    });

    // Save reference to current marker globally
    window.currentMarker = marker;
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

    // Titles
    document.getElementById("weat").innerText = `Weather Information : ${city}`;

    // Store Celsius in dataset
    ["temp", "fl", "temp1", "fl1"].forEach(id => {
        document.getElementById(id).dataset.celsius = id.includes("fl") ? feels_like : temp;
    });

    // Unit toggle
    const isCelsius = !isFahrenheitToggled();
    updateTemperatureDisplay(isCelsius);

    // --- Weather data for BIG TABLE and SMALL TABLE ---

    // City
    document.getElementById("city1").innerText = city; // Corrected for Big Table
    document.getElementById("city1_small").innerText = city;

    // Date
    document.getElementById("date1").innerText = date; // Corrected for Big Table
    document.getElementById("date1_small").innerText = date;

    // Weather Info (Description)
    document.getElementById("wi").innerText = weatherdes;
    document.getElementById("wi1").innerText = weatherdes;

    // Humidity
    document.getElementById("humi").innerText = `${humidity}%`;
    document.getElementById("humi1").innerText = `${humidity}%`;

    // Pressure
    document.getElementById("press").innerText = `${pressure} hPa`;
    document.getElementById("press1").innerText = `${pressure} hPa`;

    // Visibility
    document.getElementById("visi").innerText = `${visibility} Km`;
    document.getElementById("visi1").innerText = `${visibility} Km`;

    // Wind Speed
    document.getElementById("ws").innerText = `${windSpeed} m/s`;
    document.getElementById("ws1").innerText = `${windSpeed} m/s`;

    // Sunrise
    document.getElementById("sr").innerText = sunrise;
    document.getElementById("sr1").innerText = sunrise;

    // Sunset
    document.getElementById("ss").innerText = sunset;
    document.getElementById("ss1").innerText = sunset;

    // Country Code
    document.getElementById("cc").innerText = country;
    document.getElementById("cc1").innerText = country;

    document.getElementById("city-input").value = '';
}

// Add an initial weather fetch when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Load saved theme or detect system preference
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        toggle = 1; // Set to light so changedisplay() switches to dark
        changedisplay();
    } else if (savedTheme === "light") {
        // Light mode
        toggle = 0;
        document.querySelector('body').style.backgroundColor = "rgb(233, 239, 236)";
        document.querySelector('body').style.color = "black";
        darkbtn.textContent = "☀️";
    } else {
        // No saved preference - detect system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            toggle = 1;
            changedisplay();
        } else {
            toggle = 0;
            document.querySelector('body').style.backgroundColor = "rgb(233, 239, 236)";
            document.querySelector('body').style.color = "black";
            darkbtn.textContent = "☀️";
            localStorage.setItem("theme", "light");
        }
    }
    // This will ensure the tables are populated when the page first loads.
    fetchWeatherByCity("Kolkata");
});

// === CONVERSION HELPERS ===
function celsiusToFahrenheit(c) { return (c * 9 / 5) + 32; }
function fahrenheitToCelsius(f) { return (f - 32) * 5 / 9; }

// === TOGGLE CELSIUS/FAHRENHEIT DISPLAY ===
function updateTemperatureDisplay(isCelsius) {
    const elements = ["temp", "fl", "temp1", "fl1"];
    elements.forEach(id => {
        const el = document.getElementById(id);
        const c = parseFloat(el.dataset.celsius);
        if (isCelsius) {
            el.innerText = `${c.toFixed(1)}°C`;
        } else {
            const f = celsiusToFahrenheit(c);
            el.innerText = `${f.toFixed(1)}°F`;
        }
    });
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

    const aqiBigElement = document.getElementById("aqi_big");
    if (aqiBigElement) { // Always good to check if element exists before setting innerText
        aqiBigElement.innerText = label;
    }

    // ✅ Health suggestion based on AQI
    let healthMessage = "";
    switch (aqi) {
        case 1:
            healthMessage = "Air quality is good. No health risk.";
            break;
        case 2:
            healthMessage = "Air quality is fair. Sensitive people should take precautions.";
            break;
        case 3:
            healthMessage = "Moderate risk for sensitive groups. Limit prolonged outdoor exertion.";
            break;
        case 4:
            healthMessage = "Poor air quality. General public may experience discomfort.";
            break;
        case 5:
            healthMessage = "Very poor. Avoid outdoor activities if possible.";
            break;
        default:
            healthMessage = "Air quality data unavailable.";
    }

    // Insert this message into the DOM (You must add a tag with id="aqi-message" in HTML)
    const messageElement = document.getElementById("aqi-message");
    if (messageElement) {
        messageElement.innerText = healthMessage;
    }

    // Existing pollutant values
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
    document.getElementById("forecast-section").style.display = "block";

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

 
  
    const ctx = document.getElementById('tempLineChart').getContext('2d');

    const chartLabels = forecast.map(day => new Date(day.dt * 1000).toLocaleDateString());
    const maxTempValues = forecast.map(day => isCelsius ? day.temp.max : (day.temp.max * 9/5 + 32));
    const minTempValues = forecast.map(day => isCelsius ? day.temp.min : (day.temp.min * 9/5 + 32));

    // Destroy previous chart if it exists
    if (window.tempChart) {
        window.tempChart.destroy();
    }

    window.tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Max Temp',
                    data: maxTempValues,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Min Temp',
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
                    text: '7-Day Temperature Trend',
                    color: toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: `Temperature (${isCelsius ? '°C' : '°F'})`,
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
    // Corrected: Use city1 from the main table
    const city = document.getElementById("city1").textContent;
    const temperature = document.getElementById("temp").textContent;
    const description = document.getElementById("wi").textContent;
    const aqi = document.getElementById("aqi").textContent; // This will get the AQI from the span in pollution-info

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
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText).then(() => {
            alert("Copied to clipboard!");
        });
    }
};