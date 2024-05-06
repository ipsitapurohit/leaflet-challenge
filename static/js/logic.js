document.addEventListener("DOMContentLoaded", function() {
    // Create a map centered on the US
    const map = L.map('map').setView([37.7749, -122.4194], 4);

    // Add OpenStreetMap tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Function to calculate marker radius based on earthquake magnitude
    function getMarkerRadius(magnitude) {
      return Math.sqrt(magnitude) * 5;
    }
    
    // Function to calculate marker color based on earthquake depth
    function getMarkerColor(depth) {
      if (depth >= -10 && depth < 10) {
        return '#00ff00'; // green for depth between -10 and 10 km
      } else if (depth >= 10 && depth < 30) {
        return '#ffff00'; // yellow for depth between 10 and 30 km
      } else if (depth >= 30 && depth < 50) {
        return '#ffa500'; // light orange for depth between 30 and 50 km
      } else if (depth >= 50 && depth < 70) {
        return '#ff8c00'; // dark orange for depth between 50 and 70 km
      } else if (depth >= 70 && depth < 90) {
        return '#ff4500'; // more dark orange for depth between 70 and 90 km
      } else {
        return '#ff0000'; // red for depth 90 km and above
      }
    }

    // Add legend to the map
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend-box');
      const labels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
      const colors = ['#00ff00', '#ffff00', '#ffa500', '#ff8c00', '#ff4500', '#ff0000'];

      let legendHTML = '<div class="legend-title"></div>';

      // Loop through depth ranges and generate legend HTML with colors
      for (let i = 0; i < labels.length; i++) {
        legendHTML += 
          '<div class="legend-item">' +
            '<div class="legend-color" style="background-color:' + colors[i] + ';"></div>' +
            '<div class="legend-label">' + labels[i] + '</div>' +
          '</div>';
      }
      div.innerHTML = legendHTML;
      return div;
    };

    legend.addTo(map);

    // Fetch earthquake data from USGS GeoJSON feed
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
      .then(response => response.json())
      .then(data => {
        // Loop through each earthquake feature
        data.features.forEach(feature => {
          const coords = feature.geometry.coordinates;
          const mag = feature.properties.mag;
          const depth = coords[2];
          const title = feature.properties.title;

          // Create circle marker for each earthquake
          const marker = L.circleMarker([coords[1], coords[0]], {
            radius: getMarkerRadius(mag),
            fillColor: getMarkerColor(depth),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map);

          // Bind popup to each marker showing earthquake details
          marker.bindPopup(`<b>${title}</b><br>Magnitude: ${mag}<br>Depth: ${depth} km`).openPopup();
        });
      })
      .catch(error => {
        // Error handling for failed data fetch
        console.error('Error fetching earthquake data:', error);
      });
});
