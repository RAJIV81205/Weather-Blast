// Alert Panel JavaScript - Weather Alerts Notification System

class AlertPanel {
    constructor() {
        this.isVisible = false;
        this.alerts = [];
        this.currentLocationWeather = null;
        this.hasLocationPermission = false;
        this.userLocation = null;
        this.init();
    }

    init() {
        // Create alert panel HTML structure
        this.createAlertPanel();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check location permission and start monitoring
        this.checkLocationPermission();
    }

    createAlertPanel() {
        const alertPanel = document.createElement('div');
        alertPanel.className = 'alert-panel';
        alertPanel.id = 'alertPanel';
        
        alertPanel.innerHTML = `
            <div class="alert-panel-header">
                <div class="alert-panel-title">
                    <i class="fas fa-exclamation-triangle"></i>
                    Weather Alerts
                </div>
                <button class="alert-close-btn" onclick="alertPanel.hidePanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="alert-panel-content" id="alertPanelContent">
                <div class="alert-empty">
                    <i class="fas fa-cloud-sun"></i>
                    <h3>No Active Alerts</h3>
                    <p>All clear! We'll notify you of any weather warnings in your area.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(alertPanel);
    }

    setupEventListeners() {
        // Click outside to close
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('alertPanel');
            if (this.isVisible && panel && !panel.contains(e.target)) {
                // Don't close if clicking on alerts navbar item
                if (!e.target.closest('#alertsLink')) {
                    this.hidePanel();
                }
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hidePanel();
            }
        });

        // Prevent panel from closing when clicking inside
        document.getElementById('alertPanel')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    showPanel() {
        const panel = document.getElementById('alertPanel');
        if (panel) {
            panel.classList.add('show');
            this.isVisible = true;
        }
    }

    hidePanel() {
        const panel = document.getElementById('alertPanel');
        if (panel) {
            panel.classList.remove('show');
            this.isVisible = false;
        }
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    addAlert(alert) {
        this.alerts.unshift(alert); // Add to beginning
        this.renderAlerts();
        
        // Show panel when new alert is added
        if (!this.isVisible) {
            this.showPanel();
        }
    }

    removeAlert(alertId) {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this.renderAlerts();
    }

    renderAlerts() {
        const content = document.getElementById('alertPanelContent');
        if (!content) return;

        // Check if geolocation is available and permission is granted
        if (!navigator.geolocation) {
            content.innerHTML = `
                <div class="alert-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Geolocation Not Supported</h3>
                    <p>Your browser doesn't support location services. We can't provide location-based weather alerts.</p>
                </div>
            `;
            return;
        }

        // Check if we have location permission
        if (!this.hasLocationPermission) {
            content.innerHTML = `
                <div class="alert-empty">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>Location Permission Required</h3>
                    <p>Please allow location access to receive weather alerts for your area.</p>
                    <button class="setting-button" onclick="alertPanel.requestLocationPermission()">
                        <i class="fas fa-location-arrow"></i> Allow Location Access
                    </button>
                </div>
            `;
            return;
        }

        if (this.alerts.length === 0) {
            content.innerHTML = `
                <div class="alert-empty">
                    <i class="fas fa-cloud-sun"></i>
                    <h3>No Active Alerts</h3>
                    <p>All clear! We'll notify you of any weather warnings in your area.</p>
                </div>
            `;
            return;
        }

        content.innerHTML = this.alerts.map(alert => `
            <div class="alert-item ${alert.severity}" onclick="alertPanel.viewAlertDetails('${alert.id}')">
                <div class="alert-header">
                    <div class="alert-type">${alert.type}</div>
                    <div class="alert-time">${this.formatTime(alert.time)}</div>
                </div>
                <div class="alert-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${alert.location}
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-severity ${alert.severity}">${alert.severity}</div>
            </div>
        `).join('');
    }

    checkLocationPermission() {
        this.hasLocationPermission = false;
        
        if (navigator.geolocation) {
            // Try to get current position to check permission
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Permission granted
                    this.hasLocationPermission = true;
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    this.startLocationMonitoring();
                    this.renderAlerts();
                },
                (error) => {
                    // Permission denied or error
                    this.hasLocationPermission = false;
                    console.log('Geolocation permission denied or error:', error);
                    this.renderAlerts();
                },
                {
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            this.renderAlerts();
        }
    }

    requestLocationPermission() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Permission granted
                    this.hasLocationPermission = true;
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    this.startLocationMonitoring();
                    this.renderAlerts();
                },
                (error) => {
                    // Permission still denied
                    this.hasLocationPermission = false;
                    console.log('Geolocation permission denied:', error);
                    
                    // Show error message to user
                    const content = document.getElementById('alertPanelContent');
                    if (content) {
                        content.innerHTML = `
                            <div class="alert-empty">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h3>Location Access Denied</h3>
                                <p>Location access was denied. Please enable location services in your browser settings to receive weather alerts.</p>
                                <div style="margin-top: 15px; font-size: 0.9em; color: #666;">
                                    <strong>How to enable:</strong><br>
                                    • Click the location icon in your browser's address bar<br>
                                    • Select "Allow" for location access<br>
                                    • Refresh the page and try again
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000
                }
            );
        }
    }

    startLocationMonitoring() {
        if (!this.hasLocationPermission || !this.userLocation) {
            return;
        }

        // Check for weather alerts every 15 minutes
        setInterval(() => {
            this.checkLocationWeather();
        }, 900000); // 15 minutes
        
        // Initial check
        this.checkLocationWeather();
    }

    checkLocationWeather() {
        if (!this.hasLocationPermission || !this.userLocation) {
            return;
        }

        // Fetch real weather alerts for the user's location
        this.fetchLocationWeather(this.userLocation.lat, this.userLocation.lon);
    }

    fetchLocationWeather(lat, lon) {
        // In a real application, you would call a weather API here
        // For example: National Weather Service API, OpenWeatherMap, etc.
        
        // This is where you would implement real weather alert fetching
        // Example API call structure:
        /*
        fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`)
            .then(response => response.json())
            .then(data => {
                if (data.features && data.features.length > 0) {
                    data.features.forEach(alertFeature => {
                        const alert = this.parseWeatherServiceAlert(alertFeature);
                        if (alert) {
                            this.addAlert(alert);
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching weather alerts:', error);
            });
        */
        
        console.log(`Checking weather alerts for location: ${lat}, ${lon}`);
        // No fake alerts - only real data would be processed here
    }

    // Method to parse real weather service alerts
    parseWeatherServiceAlert(alertFeature) {
        try {
            const properties = alertFeature.properties;
            
            return {
                id: properties.id || `alert_${Date.now()}`,
                type: properties.event || 'Weather Alert',
                severity: this.mapSeverity(properties.severity),
                location: properties.areaDesc || 'Your Area',
                message: properties.headline || properties.description || 'Weather alert for your area',
                time: new Date(properties.sent || Date.now()),
                expires: new Date(properties.expires || Date.now() + 4 * 60 * 60 * 1000)
            };
        } catch (error) {
            console.error('Error parsing weather alert:', error);
            return null;
        }
    }

    // Map weather service severity levels to our system
    mapSeverity(severity) {
        const severityMap = {
            'Extreme': 'severe',
            'Severe': 'severe',
            'Moderate': 'warning',
            'Minor': 'watch',
            'Unknown': 'advisory'
        };
        
        return severityMap[severity] || 'advisory';
    }

    viewAlertDetails(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            // In a real app, this might open a detailed view or modal
            console.log('Viewing alert details:', alert);
            
            // For now, just highlight the alert
            const alertElement = event.currentTarget;
            alertElement.style.transform = 'scale(1.02)';
            setTimeout(() => {
                alertElement.style.transform = '';
            }, 200);
        }
    }

    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} min ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Clean up expired alerts
    cleanupExpiredAlerts() {
        const now = new Date();
        this.alerts = this.alerts.filter(alert => alert.expires > now);
        this.renderAlerts();
    }
}

// Initialize alert panel when page loads
let alertPanel;

document.addEventListener('DOMContentLoaded', function() {
    alertPanel = new AlertPanel();
    
    // Clean up expired alerts every hour
    setInterval(() => {
        alertPanel.cleanupExpiredAlerts();
    }, 3600000); // 1 hour
});

// Global function for navbar alerts link
function toggleAlerts() {
    if (alertPanel) {
        alertPanel.togglePanel();
    }
}
