document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("musicToggleBtn");
    const popup = document.getElementById("musicPopup");
    const getMusicBtn = document.getElementById("getMusicBtn");
    const cityInput = document.getElementById("musicCityInput");
    const weatherInfo = document.getElementById("weatherInfo");
    const musicPlayer = document.getElementById("musicPlayer");

    // Toggle popup visibility
    toggleBtn.addEventListener("click", () => {
        popup.style.display = popup.style.display === "block" ? "none" : "block";
    });

    const songLibrary = {
        Clear: {
            hindi: [
                "https://www.youtube.com/embed/kXYiU_JCYtU",
                "https://www.youtube.com/embed/6T4-UKNpRX8"
            ],
            english: [
                "https://www.youtube.com/embed/CevxZvSJLk8",
                "https://www.youtube.com/embed/hT_nvWreIhg"
            ]
        },
        Clouds: {
            hindi: [
                "https://www.youtube.com/embed/jEBi_X0B3jk",
                "https://www.youtube.com/embed/TK4vTuq4zII"
            ],
            english: [
                "https://www.youtube.com/embed/pXRviuL6vMY",
                "https://www.youtube.com/embed/ktvTqknDobU"
            ]
        },
        Rain: {
            hindi: [
                "https://www.youtube.com/embed/FWyn45LYGhc",
                "https://www.youtube.com/embed/bEl_fqzTuEk"
            ],
            english: [
                "https://www.youtube.com/embed/eVTXPUF4Oz4",
                "https://www.youtube.com/embed/hLQl3WQQoQ0"
            ]
        },
        Snow: {
            hindi: [
                "https://www.youtube.com/embed/U5r8AzEWqk0",
                "https://www.youtube.com/embed/KrZHPOeOxQQ"
            ],
            english: [
                "https://www.youtube.com/embed/G7KNmW9a75Y",
                "https://www.youtube.com/embed/4P2GqhkpNj0"
            ]
        },
        Default: {
            hindi: [
                "https://www.youtube.com/embed/6T4-UKNpRX8"
            ],
            english: [
                "https://www.youtube.com/embed/CevxZvSJLk8"
            ]
        }
    };

    function createVideoThumbnail(embedUrl, label) {
        const videoId = embedUrl.split("/embed/")[1];
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

        return `
            <div style="text-align: center; margin-bottom: 10px;">
                <p><strong>${label}:</strong></p>
                <a href="${watchUrl}" target="_blank" style="text-decoration: none;">
                    <img src="${thumbnailUrl}" alt="${label} thumbnail" width="200" height="150" style="border-radius: 6px; border: 1px solid #ccc;">
                    <p style="margin-top: 5px; color: #0077cc;">Watch on YouTube</p>
                </a>
            </div>
        `;
    }

    getMusicBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (!city) {
            alert("Please enter a city name");
            return;
        }

        const apiKey = "a9597b9143bd10ce791e1b80c44d2d50";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.cod !== 200) {
                    weatherInfo.textContent = "City not found!";
                    musicPlayer.innerHTML = "";
                    return;
                }

                const condition = data.weather[0].main;
                const temperature = data.main.temp;

                weatherInfo.textContent = `${city} - ${condition}`;

                let songs = songLibrary[condition] || songLibrary["Default"];
                let song1 = songs.hindi[Math.floor(Math.random() * songs.hindi.length)];
                let song2 = songs.english[Math.floor(Math.random() * songs.english.length)];

                musicPlayer.innerHTML = `
                    ${createVideoThumbnail(song1, "Recommendation 1")}
                    ${createVideoThumbnail(song2, "Recommendation 2")}
                `;
            })
            .catch(err => {
                console.error(err);
                weatherInfo.textContent = "Error fetching weather!";
                musicPlayer.innerHTML = "";
            });
    });
});