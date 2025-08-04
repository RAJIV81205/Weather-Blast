const API_KEY = 'b2dfbfbe3ac672e26e6ebd9896d88453'; // Replace with your actual OpenWeatherMap API key

function getWeatherByCity() {
  const city = document.getElementById("city-input").value;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('temperature').textContent = data.main.temp + '°C';
      document.getElementById('weather-description').textContent = data.weather[0].description;
      document.getElementById('city-name').textContent = data.name + ', ' + data.sys.country;
      document.getElementById('humidity').textContent = data.main.humidity + '%';
      document.getElementById('wind-speed').textContent = data.wind.speed + ' km/h';
      document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
      document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
      document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      // Also update the time
      const now = new Date();
      document.getElementById('date-time').textContent = now.toLocaleString();

      // Call forecast function
      getHourlyForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => alert("City not found or API error"));
}

function getHourlyForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const forecastList = data.list.slice(0, 8); // Next 24 hours (8 intervals of 3 hrs)
      const hourlyContainer = document.querySelector('.hourly-forecast-list');
      hourlyContainer.innerHTML = '';

      forecastList.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = item.main.temp + '°C';
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

// Handle forecast tab switching (Today, Tomorrow, 10 Days, Monthly)
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".forecast-tabs .tab");
  const forecastList = document.querySelector(".hourly-forecast-list");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const selectedTab = tab.textContent.trim();

      // Always update active tab
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Clear old forecast and render dummy forecast
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
