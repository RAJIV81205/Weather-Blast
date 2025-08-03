// Settings Page JavaScript - Settings Management and Theme Control

class SettingsManager {
    constructor() {
        this.settings = {
            tempUnit: 'celsius',
            windUnit: 'kmh',
            pressureUnit: 'hpa',
            weatherAlerts: true,
            airQualityAlerts: true,
            pushNotifications: false,
            notificationTiming: 30,
            theme: 'light',
            animations: true,
            compactMode: false,
            autoLocation: true,
            locationPrecision: 'medium',
            dataSharing: false,
            apiRefreshRate: 15,
            cacheSize: 25
        };
        this.init();
    }

    init() {
        // Load saved settings
        this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Apply initial theme
        this.applyTheme();
        
        // Update range display
        this.updateRangeDisplay();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('weatherBlastSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        
        // Apply settings to UI
        this.applySettingsToUI();
    }

    saveSettings() {
        localStorage.setItem('weatherBlastSettings', JSON.stringify(this.settings));
        console.log('Settings saved:', this.settings);
    }

    applySettingsToUI() {
        // Temperature unit
        const tempUnit = document.getElementById('temp-unit-setting');
        if (tempUnit) tempUnit.value = this.settings.tempUnit;
        
        // Wind unit
        const windUnit = document.getElementById('wind-unit-setting');
        if (windUnit) windUnit.value = this.settings.windUnit;
        
        // Pressure unit
        const pressureUnit = document.getElementById('pressure-unit-setting');
        if (pressureUnit) pressureUnit.value = this.settings.pressureUnit;
        
        // Weather alerts
        const weatherAlerts = document.getElementById('weather-alerts');
        if (weatherAlerts) weatherAlerts.checked = this.settings.weatherAlerts;
        
        // Air quality alerts
        const airQualityAlerts = document.getElementById('air-quality-alerts');
        if (airQualityAlerts) airQualityAlerts.checked = this.settings.airQualityAlerts;
        
        // Push notifications
        const pushNotifications = document.getElementById('push-notifications');
        if (pushNotifications) pushNotifications.checked = this.settings.pushNotifications;
        
        // Notification timing
        const notificationTiming = document.getElementById('notification-timing');
        if (notificationTiming) notificationTiming.value = this.settings.notificationTiming;
        
        // Theme
        const theme = document.getElementById('theme-setting');
        if (theme) theme.value = this.settings.theme;
        
        // Animations
        const animations = document.getElementById('animation-setting');
        if (animations) animations.checked = this.settings.animations;
        
        // Compact mode
        const compactMode = document.getElementById('compact-mode');
        if (compactMode) compactMode.checked = this.settings.compactMode;
        
        // Auto location
        const autoLocation = document.getElementById('auto-location');
        if (autoLocation) autoLocation.checked = this.settings.autoLocation;
        
        // Location precision
        const locationPrecision = document.getElementById('location-precision');
        if (locationPrecision) locationPrecision.value = this.settings.locationPrecision;
        
        // Data sharing
        const dataSharing = document.getElementById('data-sharing');
        if (dataSharing) dataSharing.checked = this.settings.dataSharing;
        
        // API refresh rate
        const apiRefreshRate = document.getElementById('api-refresh-rate');
        if (apiRefreshRate) apiRefreshRate.value = this.settings.apiRefreshRate;
        
        // Cache size
        const cacheSize = document.getElementById('cache-size');
        if (cacheSize) cacheSize.value = this.settings.cacheSize;
    }

    setupEventListeners() {
        // Temperature unit
        const tempUnit = document.getElementById('temp-unit-setting');
        if (tempUnit) {
            tempUnit.addEventListener('change', (e) => {
                this.settings.tempUnit = e.target.value;
                this.saveSettings();
                this.showSettingsSaved();
                this.updateWeatherDisplay();
            });
        }
        
        // Wind unit
        const windUnit = document.getElementById('wind-unit-setting');
        if (windUnit) {
            windUnit.addEventListener('change', (e) => {
                this.settings.windUnit = e.target.value;
                this.saveSettings();
                this.showSettingsSaved();
                this.updateWeatherDisplay();
            });
        }
        
        // Pressure unit
        const pressureUnit = document.getElementById('pressure-unit-setting');
        if (pressureUnit) {
            pressureUnit.addEventListener('change', (e) => {
                this.settings.pressureUnit = e.target.value;
                this.saveSettings();
                this.showSettingsSaved();
                this.updateWeatherDisplay();
            });
        }
        
        // Weather alerts
        const weatherAlerts = document.getElementById('weather-alerts');
        if (weatherAlerts) {
            weatherAlerts.addEventListener('change', (e) => {
                this.settings.weatherAlerts = e.target.checked;
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // Air quality alerts
        const airQualityAlerts = document.getElementById('air-quality-alerts');
        if (airQualityAlerts) {
            airQualityAlerts.addEventListener('change', (e) => {
                this.settings.airQualityAlerts = e.target.checked;
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // Push notifications
        const pushNotifications = document.getElementById('push-notifications');
        if (pushNotifications) {
            pushNotifications.addEventListener('change', (e) => {
                this.settings.pushNotifications = e.target.checked;
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // Notification timing
        const notificationTiming = document.getElementById('notification-timing');
        if (notificationTiming) {
            notificationTiming.addEventListener('change', (e) => {
                this.settings.notificationTiming = parseInt(e.target.value);
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // Theme
        const theme = document.getElementById('theme-setting');
        if (theme) {
            theme.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.saveSettings();
                this.applyTheme();
                this.showSettingsSaved();
            });
        }
        
        // Animations
        const animations = document.getElementById('animation-setting');
        if (animations) {
            animations.addEventListener('change', (e) => {
                this.settings.animations = e.target.checked;
                this.saveSettings();
                this.applyAnimationSettings();
                this.showSettingsSaved();
            });
        }
        
        // Compact mode
        const compactMode = document.getElementById('compact-mode');
        if (compactMode) {
            compactMode.addEventListener('change', (e) => {
                this.settings.compactMode = e.target.checked;
                this.saveSettings();
                this.applyCompactMode();
                this.showSettingsSaved();
            });
        }
        
        // Auto location
        const autoLocation = document.getElementById('auto-location');
        if (autoLocation) {
            autoLocation.addEventListener('change', (e) => {
                this.settings.autoLocation = e.target.checked;
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // Location precision
        const locationPrecision = document.getElementById('location-precision');
        if (locationPrecision) {
            locationPrecision.addEventListener('change', (e) => {
                this.settings.locationPrecision = e.target.value;
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // Data sharing
        const dataSharing = document.getElementById('data-sharing');
        if (dataSharing) {
            dataSharing.addEventListener('change', (e) => {
                this.settings.dataSharing = e.target.checked;
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // API refresh rate
        const apiRefreshRate = document.getElementById('api-refresh-rate');
        if (apiRefreshRate) {
            apiRefreshRate.addEventListener('input', (e) => {
                this.settings.apiRefreshRate = parseInt(e.target.value);
                this.updateRangeDisplay();
            });
            
            apiRefreshRate.addEventListener('change', (e) => {
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
        
        // Cache size
        const cacheSize = document.getElementById('cache-size');
        if (cacheSize) {
            cacheSize.addEventListener('change', (e) => {
                this.settings.cacheSize = parseInt(e.target.value);
                this.saveSettings();
                this.showSettingsSaved();
            });
        }
    }

    applyTheme() {
        const body = document.body;
        
        switch (this.settings.theme) {
            case 'light':
                body.style.background = '';
                body.style.color = '';
                break;
            case 'dark':
                body.style.background = 'linear-gradient(135deg, rgba(17, 34, 29, 0.7), rgba(22, 66, 60, 0.8))';
                body.style.color = 'rgb(233, 239, 236)';
                break;
            case 'auto':
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    body.style.background = 'linear-gradient(135deg, rgba(17, 34, 29, 0.7), rgba(22, 66, 60, 0.8))';
                    body.style.color = 'rgb(233, 239, 236)';
                } else {
                    body.style.background = '';
                    body.style.color = '';
                }
                break;
        }
    }

    applyAnimationSettings() {
        const body = document.body;
        if (this.settings.animations) {
            body.style.setProperty('--animation-speed', '1');
        } else {
            body.style.setProperty('--animation-speed', '0');
        }
    }

    applyCompactMode() {
        const body = document.body;
        if (this.settings.compactMode) {
            body.classList.add('compact-mode');
        } else {
            body.classList.remove('compact-mode');
        }
    }

    updateRangeDisplay() {
        const refreshRateValue = document.getElementById('refresh-rate-value');
        const apiRefreshRate = document.getElementById('api-refresh-rate');
        
        if (refreshRateValue && apiRefreshRate) {
            refreshRateValue.textContent = apiRefreshRate.value;
        }
    }

    showSettingsSaved() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, rgba(40, 167, 69, 0.9), rgba(40, 167, 69, 1));
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
                z-index: 2000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
            ">
                <i class="fas fa-check-circle"></i>
                Settings saved successfully!
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.firstElementChild.style.transform = 'translateX(0)';
        }, 100);
        
        // Slide out and remove
        setTimeout(() => {
            notification.firstElementChild.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
    
    updateWeatherDisplay() {
        // Update main toggle to match temperature unit setting
        const unitToggle = document.getElementById('unitToggle');
        if (unitToggle) {
            unitToggle.checked = this.settings.tempUnit === 'fahrenheit';
        }
        
        // Update temperature displays if function exists
        if (typeof updateTemperatureDisplay === 'function') {
            const isCelsius = this.settings.tempUnit === 'celsius';
            updateTemperatureDisplay(isCelsius);
        }
        
        // Update wind speed displays if they exist
        const windElements = document.querySelectorAll('[data-wind-ms]');
        windElements.forEach(element => {
            const windMs = parseFloat(element.dataset.windMs);
            if (!isNaN(windMs) && typeof convertWindSpeed === 'function') {
                element.textContent = convertWindSpeed(windMs);
            }
        });
        
        // Update pressure displays if they exist
        const pressureElements = document.querySelectorAll('[data-pressure-hpa]');
        pressureElements.forEach(element => {
            const pressureHpa = parseFloat(element.dataset.pressureHpa);
            if (!isNaN(pressureHpa) && typeof convertPressure === 'function') {
                element.textContent = convertPressure(pressureHpa);
            }
        });
    }
}

// Global functions for settings buttons
function clearWeatherCache() {
    if (confirm('Are you sure you want to clear the weather cache? This will remove all stored weather data.')) {
        localStorage.removeItem('weatherCache');
        localStorage.removeItem('locationCache');
        
        // Show success message
        alert('Weather cache cleared successfully!');
    }
}

function resetAllSettings() {
    if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
        localStorage.removeItem('weatherBlastSettings');
        
        // Reload the page to apply default settings
        window.location.reload();
    }
}

// Initialize settings manager when page loads
let settingsManager;

document.addEventListener('DOMContentLoaded', function() {
    settingsManager = new SettingsManager();
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (settingsManager.settings.theme === 'auto') {
                settingsManager.applyTheme();
            }
        });
    }
});
