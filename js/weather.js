let map;     // global map instance
let marker;  // global marker

// Called automatically via callback=initMap in the script tag
function initMap() {
    map = new Mappls.Map('map', {
        center: [28.6139, 77.2090], // Default center (New Delhi)
        zoom: 5
    });
}

// Call this when a user searches for a city
function updateMapWithCity(city) {
    const apiKey = 'a9ba6e316849b4c62fe0c23d2ab10945'; // your REST key

    fetch(`https://atlas.mappls.com/api/places/geocode?address=${encodeURIComponent(city)}&key=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            if (data?.copResults?.length > 0) {
                const result = data.copResults[0];
                const lat = parseFloat(result.latitude);
                const lng = parseFloat(result.longitude);
                updateMapLocation(lat, lng);
            } else {
                alert("Location not found!");
            }
        })
        .catch(err => {
            console.error('Mappls geocode error:', err);
        });
}

// Call this when using current location (lat/lng)
function updateMapWithCoordinates(lat, lng) {
    updateMapLocation(lat, lng);
}

// Core logic to update center + marker
function updateMapLocation(lat, lng) {
    if (!map) return;

    map.setView({ center: [lat, lng], zoom: 10 });

    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = new Mappls.Marker([lat, lng]).addTo(map);
    }
}
