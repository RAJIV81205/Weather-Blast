// Home Page JavaScript - Location Notifications and UI Enhancements

class LocationNotificationSystem {
    constructor() {
        this.isNotificationVisible = false;
        this.notificationTimeout = null;
        this.init();
    }

    init() {
        // Create notification container
        this.createNotificationContainer();
        
        // Monitor location changes
        this.startLocationMonitoring();
        
        // Show initial notification after page load
        setTimeout(() => {
            this.showLocationNotification();
        }, 3000);
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'locationNotificationContainer';
        container.className = 'location-notification-container';
        
        container.innerHTML = `
            <div class="location-notification" id="locationNotification">
                <div class="notification-header">
                    <div class="notification-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="notification-title">Location Update</div>
                    <button class="notification-close" onclick="locationNotificationSystem.hideLocationNotification()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-content">
                    <div class="location-info">
                        <div class="current-location">
                            <i class="fas fa-location-arrow"></i>
                            <span id="notificationLocationText">Detecting your location...</span>
                        </div>
                        <div class="weather-preview">
                            <div class="temp-preview">
                                <span id="notificationTemp">--°</span>
                                <span id="notificationCondition">Loading...</span>
                            </div>
                            <div class="weather-icon">
                                <i id="notificationWeatherIcon" class="fas fa-cloud"></i>
                            </div>
                        </div>
                    </div>
                    <div class="notification-actions">
                        <button class="action-btn primary" onclick="locationNotificationSystem.updateLocation()">
                            <i class="fas fa-sync-alt"></i> Update
                        </button>
                        <button class="action-btn secondary" onclick="locationNotificationSystem.hideLocationNotification()">
                            <i class="fas fa-check"></i> Got it
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Add CSS styles
        this.addNotificationStyles();
    }

    addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .location-notification-container {
                position: fixed;
                top: 130px;
                left: -450px;
                z-index: 1500;
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .location-notification-container.show {
                left: 20px;
            }
            
            .location-notification {
                width: 280px;
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.95) 0%, 
                    rgba(248, 250, 252, 0.9) 100%);
                border: 2px solid rgba(22, 66, 60, 0.2);
                border-radius: 20px;
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                overflow: hidden;
                position: relative;
            }
            
            .location-notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, 
                    transparent, 
                    rgba(106, 156, 137, 0.1), 
                    transparent);
                animation: notificationShimmer 3s infinite;
            }
            
            @keyframes notificationShimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .notification-header {
                background: linear-gradient(135deg, 
                    rgba(106, 156, 137, 0.1) 0%, 
                    rgba(106, 156, 137, 0.05) 100%);
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                border-bottom: 2px solid rgba(22, 66, 60, 0.1);
            }
            
            .notification-icon {
                background: linear-gradient(135deg, 
                    rgba(106, 156, 137, 0.9) 0%, 
                    rgba(106, 156, 137, 1) 100%);
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2em;
                animation: iconPulse 2s infinite;
            }
            
            @keyframes iconPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .notification-title {
                flex: 1;
                color: rgba(22, 66, 60, 1);
                font-size: 1.2em;
                font-weight: 700;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: rgba(108, 117, 125, 0.7);
                font-size: 1.2em;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: all 0.3s ease;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                background: rgba(108, 117, 125, 0.1);
                color: rgba(108, 117, 125, 1);
                transform: rotate(90deg);
            }
            
            .notification-content {
                padding: 20px;
            }
            
            .location-info {
                margin-bottom: 20px;
            }
            
            .current-location {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                color: rgba(22, 66, 60, 1);
                font-weight: 600;
            }
            
            .current-location i {
                color: rgba(106, 156, 137, 1);
                animation: locationPulse 3s infinite;
            }
            
            @keyframes locationPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            .weather-preview {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, 
                    rgba(106, 156, 137, 0.08) 0%, 
                    rgba(106, 156, 137, 0.03) 100%);
                padding: 15px;
                border-radius: 12px;
                border: 1px solid rgba(106, 156, 137, 0.1);
            }
            
            .temp-preview {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .temp-preview span:first-child {
                font-size: 1.8em;
                font-weight: 700;
                color: rgba(22, 66, 60, 1);
            }
            
            .temp-preview span:last-child {
                font-size: 0.9em;
                color: rgba(108, 117, 125, 0.8);
                text-transform: capitalize;
            }
            
            .weather-icon {
                font-size: 2.5em;
                color: rgba(106, 156, 137, 1);
                animation: weatherIconFloat 4s infinite ease-in-out;
            }
            
            @keyframes weatherIconFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
            
            .notification-actions {
                display: flex;
                gap: 10px;
            }
            
            .action-btn {
                flex: 1;
                padding: 12px 16px;
                border: none;
                border-radius: 10px;
                font-size: 0.95em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .action-btn.primary {
                background: linear-gradient(135deg, 
                    rgba(106, 156, 137, 0.9) 0%, 
                    rgba(106, 156, 137, 1) 100%);
                color: white;
                box-shadow: 0 5px 15px rgba(106, 156, 137, 0.3);
            }
            
            .action-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(106, 156, 137, 0.4);
            }
            
            .action-btn.secondary {
                background: linear-gradient(135deg, 
                    rgba(108, 117, 125, 0.1) 0%, 
                    rgba(108, 117, 125, 0.05) 100%);
                color: rgba(108, 117, 125, 1);
                border: 1px solid rgba(108, 117, 125, 0.2);
            }
            
            .action-btn.secondary:hover {
                background: linear-gradient(135deg, 
                    rgba(108, 117, 125, 0.2) 0%, 
                    rgba(108, 117, 125, 0.1) 100%);
                transform: translateY(-1px);
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .location-notification-container {
                    left: -400px;
                }
                
                .location-notification-container.show {
                    left: 10px;
                }
                
                .location-notification {
                    width: 350px;
                }
                
                .notification-header {
                    padding: 15px;
                }
                
                .notification-content {
                    padding: 15px;
                }
            }
            
            /* Dark Mode Support */
            body[style*="rgba(17, 34, 29, 0.7)"] .location-notification {
                background: linear-gradient(135deg, rgba(17, 34, 29, 0.95), rgba(22, 66, 60, 0.9));
                border-color: rgba(233, 239, 236, 0.3);
                color: rgb(233, 239, 236);
            }
            
            body[style*="rgba(17, 34, 29, 0.7)"] .notification-header {
                background: linear-gradient(135deg, rgba(22, 66, 60, 0.3), rgba(17, 34, 29, 0.6));
                border-bottom-color: rgba(233, 239, 236, 0.2);
            }
            
            body[style*="rgba(17, 34, 29, 0.7)"] .notification-title,
            body[style*="rgba(17, 34, 29, 0.7)"] .current-location {
                color: rgb(233, 239, 236);
            }
            
            body[style*="rgba(17, 34, 29, 0.7)"] .temp-preview span:first-child {
                color: rgb(233, 239, 236);
            }
            
            body[style*="rgba(17, 34, 29, 0.7)"] .temp-preview span:last-child {
                color: rgba(233, 239, 236, 0.7);
            }
            
            body[style*="rgba(17, 34, 29, 0.7)"] .weather-preview {
                background: linear-gradient(135deg, rgba(106, 156, 137, 0.2), rgba(106, 156, 137, 0.1));
                border-color: rgba(233, 239, 236, 0.2);
            }
            
            body[style*="rgba(17, 34, 29, 0.7)"] .action-btn.secondary {
                background: linear-gradient(135deg, rgba(233, 239, 236, 0.1), rgba(233, 239, 236, 0.05));
                color: rgba(233, 239, 236, 0.9);
                border-color: rgba(233, 239, 236, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    showLocationNotification() {
        const container = document.getElementById('locationNotificationContainer');
        if (container && !this.isNotificationVisible) {
            container.classList.add('show');
            this.isNotificationVisible = true;
            
            // Auto-hide after 10 seconds
            this.notificationTimeout = setTimeout(() => {
                this.hideLocationNotification();
            }, 10000);
            
            // Update with current location data
            this.updateLocationData();
        }
    }

    hideLocationNotification() {
        const container = document.getElementById('locationNotificationContainer');
        if (container && this.isNotificationVisible) {
            container.classList.remove('show');
            this.isNotificationVisible = false;
            
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }
        }
    }

    updateLocationData() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    this.fetchLocationWeather(lat, lon);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    this.setDefaultLocationData();
                }
            );
        } else {
            this.setDefaultLocationData();
        }
    }

    fetchLocationWeather(lat, lon) {
        // In a real app, this would fetch from a weather API
        // For now, simulate with sample data
        const sampleData = {
            location: 'Current Location',
            temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
            condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Clear'][Math.floor(Math.random() * 4)],
            icon: 'fas fa-sun'
        };
        
        this.updateNotificationDisplay(sampleData);
    }

    setDefaultLocationData() {
        const defaultData = {
            location: 'Location not available',
            temperature: '--',
            condition: 'Unknown',
            icon: 'fas fa-question-circle'
        };
        
        this.updateNotificationDisplay(defaultData);
    }

    updateNotificationDisplay(data) {
        const locationText = document.getElementById('notificationLocationText');
        const temp = document.getElementById('notificationTemp');
        const condition = document.getElementById('notificationCondition');
        const icon = document.getElementById('notificationWeatherIcon');
        
        if (locationText) locationText.textContent = data.location;
        if (temp) temp.textContent = data.temperature + '°C';
        if (condition) condition.textContent = data.condition;
        if (icon) icon.className = data.icon;
    }

    updateLocation() {
        // Trigger location update
        const locationText = document.getElementById('notificationLocationText');
        const temp = document.getElementById('notificationTemp');
        const condition = document.getElementById('notificationCondition');
        
        if (locationText) locationText.textContent = 'Updating location...';
        if (temp) temp.textContent = '--°';
        if (condition) condition.textContent = 'Loading...';
        
        // Simulate update delay
        setTimeout(() => {
            this.updateLocationData();
        }, 1500);
    }

    startLocationMonitoring() {
        // Check for location changes every 5 minutes
        setInterval(() => {
            if (this.isNotificationVisible) {
                this.updateLocationData();
            }
        }, 300000); // 5 minutes
    }
}

// Initialize location notification system when page loads
let locationNotificationSystem;

document.addEventListener('DOMContentLoaded', function() {
    locationNotificationSystem = new LocationNotificationSystem();
});
