// === API KEYS ===
const apiKey = 'a9597b9143bd10ce791e1b80c44d2d50'; // OpenWeatherMap API key
const geoAPI = '2783701aa79748f9b21e86f7ca361dd4'; // GeoApify API key
const opt = { timeStyle: 'short', hour12: true }; // Time formatting options

let map; // Global map object
let isUserSearch = false; // For auto scrolling
let currentLanguage = 'en'; // Default language

// === LANGUAGE SWITCHER ===
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
  
  // Update static text
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = translations[lang][key] || element.textContent;
  });

  // Update placeholder text
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = translations[lang][key] || element.placeholder;
  });

  // Update dynamic content if available
  if (document.getElementById('city1').textContent !== 'City') {
    const city = document.getElementById('city1').textContent;
    document.getElementById('weat').textContent = `${translations[lang]['weather_info']} : ${city}`;
  }

  // Update recent searches
  renderRecentSearches();

  // Update forecast if data exists
  if (lastForecastData) {
    showWeatherForecast(lastForecastData);
  }

  // Update chart if it exists
  if (window.tempChart) {
    const isCelsius = !document.getElementById('unitToggle').checked;
    window.tempChart.options.plugins.title.text = translations[lang]['temp_trend'];
    window.tempChart.options.scales.y.title.text = `Temperature (${isCelsius ? '°C' : '°F'})`;
    window.tempChart.update();
  }
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
  const savedLanguage = localStorage.getItem('language') || 'en';
  document.getElementById('language-switcher').value = savedLanguage;
  setLanguage(savedLanguage);
});

// Language switcher event listener
document.getElementById('language-switcher').addEventListener('change', (e) => {
  setLanguage(e.target.value);
});

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
    title: translations[currentLanguage]['location']
  });

  window.currentMarker = marker;
}

// Scrollable page 
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
  if (!city) return alert(translations[currentLanguage]['alert_no_city']);
  isUserSearch = true;
  fetchWeatherByCity(city);
}

// === FETCH WEATHER FOR CURRENT LOCATION ===
function getWeatherByLocation() {
  if (navigator.geolocation) {
    isUserSearch = true;
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      fetchWeatherByCoordinates(lat, lon);
      initMap1({ coord: { lat, lon } });
    }, () => alert(translations[currentLanguage]['alert_no_geolocation']));
  } else {
    alert(translations[currentLanguage]['alert_no_browser_support']);
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
      alert(translations[currentLanguage]['alert_invalid_location']);
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

  // Titles
  document.getElementById("weat").innerText = `${translations[currentLanguage]['weather_info']} : ${city}`;

  // Store Celsius in dataset
  ["temp", "fl", "temp1", "fl1"].forEach(id => {
    document.getElementById(id).dataset.celsius = id.includes("fl") ? feels_like : temp;
  });

  // Unit toggle
  const isCelsius = !isFahrenheitToggled();
  updateTemperatureDisplay(isCelsius);

  // --- Weather data for BIG TABLE and SMALL TABLE ---
  document.getElementById("city1").innerText = city;
  document.getElementById("city1_small").innerText = city;
  document.getElementById("date1").innerText = date;
  document.getElementById("date1_small").innerText = date;
  document.getElementById("wi").innerText = weatherdes;
  document.getElementById("wi1").innerText = weatherdes;
  document.getElementById("humi").innerText = `${humidity}%`;
  document.getElementById("humi1").innerText = `${humidity}%`;
  document.getElementById("press").innerText = `${pressure} hPa`;
  document.getElementById("press1").innerText = `${pressure} hPa`;
  document.getElementById("visi").innerText = `${visibility} Km`;
  document.getElementById("visi1").innerText = `${visibility} Km`;
  document.getElementById("ws").innerText = `${windSpeed} m/s`;
  document.getElementById("ws1").innerText = `${windSpeed} m/s`;
  document.getElementById("sr").innerText = sunrise;
  document.getElementById("sr1").innerText = sunrise;
  document.getElementById("ss").innerText = sunset;
  document.getElementById("ss1").innerText = sunset;
  document.getElementById("cc").innerText = country;
  document.getElementById("cc1").innerText = country;

  document.getElementById("city-input").value = '';
  if (isUserSearch) {
    scrollToWeatherInfo();
    isUserSearch = false;
  }
}

window.addEventListener('beforeunload', function () {
  window.scrollTo(0, 0);
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
  document.getElementById("aqi_big").innerText = label;

  const healthMessage = translations[currentLanguage][`aqi_${label.toLowerCase().replace(' ', '_')}`] || translations[currentLanguage]['aqi_unknown'];
  document.getElementById("aqi-message").innerText = healthMessage;

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
      lastForecastData = data;
      showWeatherForecast(data);
    })
    .catch(error => {
      console.error('Error fetching Forecast', error);
    });
}

function convertTemp(temp, isCelsius) {
  return isCelsius ? `${temp.toFixed(1)} °C` : `${((temp * 9/5) + 32).toFixed(1)} °F`;
}

// Categories grouping together weather descriptions
const weatherKeywords = {
  clear: ['clear', 'sunny'],
  clouds: ['cloud', 'overcast'],
  rain: ['rain', 'drizzle', 'shower'],
  snow: ['snow', 'sleet'],
  thunderstorm: ['thunderstorm', 'thunder'],
  atmosphere: ['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'tornado']
};

// Assign category to weather description
function extractWeatherInfo(weatherMain = '') {
  const main = weatherMain.toLowerCase();
  for (const [category, keywords] of Object.entries(weatherKeywords)) {
    if (keywords.some(keyword => main.includes(keyword))) {
      return category;
    }
  }
  return 'clear';
}

// Function to give note randomly
function giveNotes(weatherMain = '') {
  const category = extractWeatherInfo(weatherMain);
  const notes = [
    translations[currentLanguage][`${category}_0`],
    translations[currentLanguage][`${category}_1`],
    translations[currentLanguage][`${category}_2`]
  ];
  const randomIdx = Math.floor(Math.random() * notes.length);
  return notes[randomIdx];
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
  const icons = forecast.map(day => `<td class="icons-block"><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"></td>`).join("");
  const noteForUser = forecast.map(day => `<td class="notes"><p class="notes-txt">${giveNotes(day.weather[0].main)}</p></td>`).join("");

  document.getElementById("forecast").style.display = "block";
  document.getElementById("forecast-section").style.display = "block";

  document.getElementById("forecast-table").innerHTML = `
    <tr><th>${translations[currentLanguage]['date']}</th>${dates}</tr>
    <tr><th>${translations[currentLanguage]['temperature']}</th>${maxTemps}</tr>
    <tr><th>${translations[currentLanguage]['temperature']}</th>${minTemps}</tr>
    <tr><th>${translations[currentLanguage]['sunrise']}</th>${sunrises}</tr>
    <tr><th>${translations[currentLanguage]['sunset']}</th>${sunsets}</tr>
    <tr><th>${translations[currentLanguage]['weather_info_col']}</th>${summaries}</tr>
    <tr><th>${translations[currentLanguage]['something_for_you']}<br>(hover to unlock)</th>${noteForUser}</tr>
    <tr><th>${translations[currentLanguage]['icon']}</th>${icons}</tr>
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

  if (window.tempChart) {
    window.tempChart.destroy();
  }

  window.tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: translations[currentLanguage]['temperature'],
          data: maxTempValues,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: translations[currentLanguage]['temperature'],
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
          text: translations[currentLanguage]['temp_trend'],
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
  if (window.tempChart) {
    window.tempChart.options.plugins.legend.labels.color = toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)';
    window.tempChart.options.plugins.title.color = toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)';
    window.tempChart.options.scales.y.title.color = toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)';
    window.tempChart.options.scales.y.ticks.color = toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)';
    window.tempChart.options.scales.x.ticks.color = toggle === 0 ? 'white' : 'rgba(22, 66, 60, 1)';
    window.tempChart.update();
  }
}

darkbtn.addEventListener('click', changedisplay);

// Check for saved theme in localStorage and apply on load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    toggle = 1;
    changedisplay();
  } else if (savedTheme === "light") {
    toggle = 0;
    changedisplay();
  }
  fetchWeatherByCity("Kolkata");
});

// Save forecast data globally for reuse
let lastForecastData = null;

// Temperature unit toggle listener
const unitToggle = document.getElementById('unitToggle');
unitToggle.addEventListener('change', function () {
  const isCelsius = !this.checked;
  updateTemperatureDisplay(isCelsius);
  if (lastForecastData) {
    showWeatherForecast(lastForecastData);
  }
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

// Share button
const shareBtn = document.getElementById("shareBtn");
shareBtn.style.display = "inline-block";

shareBtn.onclick = async () => {
  const city = document.getElementById("city1").textContent;
  const temperature = document.getElementById("temp").textContent;
  const description = document.getElementById("wi").textContent;
  const aqi = document.getElementById("aqi").textContent;

  const shareText = `📍 ${city}\n🌡️ ${translations[currentLanguage]['temperature']}: ${temperature}\n🌤️ ${description}\n🌫️ ${translations[currentLanguage]['aqi']}: ${aqi}\n${translations[currentLanguage]['shared_via']}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: translations[currentLanguage]['weather_info'],
        text: shareText,
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert(translations[currentLanguage]['alert_copied']);
    });
  }
};

// SHOW RECENT SEARCHES
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
    recentList.innerHTML = `<li>${translations[currentLanguage]['no_recent_searches']}</li>`;
    return;
  }

  recentList.innerHTML = recent
    .map(item => `<li class="recent-item" tabindex="0" role="button">${item}</li>`)
    .join('');

  document.querySelectorAll('.recent-item').forEach(el => {
    el.onclick = () => {
      searchInput.value = el.innerText;
      getWeatherByCity();
    };
  });
}

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (!query) return alert(translations[currentLanguage]['alert_no_city']);
  updateRecentSearches(query);
});

resetBtn.addEventListener('click', () => {
  localStorage.removeItem('recentSearches');
  renderRecentSearches();
});

window.addEventListener('DOMContentLoaded', renderRecentSearches);