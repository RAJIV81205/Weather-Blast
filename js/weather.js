// let map;     // global map instance
// let marker;  // global marker

// Called automatically via callback=initMap in the script tag
function initMap() {
    map = new Mappls.Map('map', {
        center: [28.6139, 77.2090], // Default: New Delhi
        zoom: 5
    });
}

// Call this when a user searches for a city (now uses Mappls SDK, not fetch)
function updateMapWithCity(city) {
  const apiKey = 'a9ba6e316849b4c62fe0c23d2ab10945';
  const url = `https://atlas.mappls.com/api/places/geocode?address=${encodeURIComponent(city)}&key=${apiKey}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const result = data?.copResults?.[0];
      if (!result || !result.latitude || !result.longitude) {
        alert("Location not found!");
        return;
      }
      const lat = parseFloat(result.latitude);
      const lng = parseFloat(result.longitude);
      updateMapLocation(lat, lng);
    })
    .catch(err => {
      console.error('Mappls geocode error:', err);
      alert("Error fetching location.");
    });
}


// Call this when using current location (lat/lng)
function updateMapWithCoordinates(lat, lng) {
    if (isNaN(lat) || isNaN(lng)) {
        alert("Invalid coordinates!");
        return;
    }
    updateMapLocation(lat, lng);
}

// Core logic to update center + marker
function updateMapLocation(lat, lng) {
    if (!map) {
        console.error("Map is not initialized.");
        return;
    }

    map.setView({ center: [lat, lng], zoom: 10 });

    // Remove previous marker if exists
    if (marker) {
        marker.remove();  // Mappls Marker has .remove()
    }

    // Add new marker
    marker = new Mappls.Marker([lat, lng]).addTo(map);
}
