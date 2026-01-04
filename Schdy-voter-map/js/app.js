const map = L.map('map').setView([42.8142, -73.9396], 13);

// Base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let districtStats = {};
let chart;

// Load CSV data
Papa.parse('data/district_data.csv', {
  download: true,
  header: true,
  complete: results => {
    results.data.forEach(row => {
      districtStats[row.District] = row;
    });
    loadDistricts();
  }
});

function loadDistricts() {
  fetch('data/districts.geojson')
    .then(r => r.json())
    .then(geojson => {
      L.geoJSON(geojson, {
        style: {
          color: '#333',
          weight: 1,
          fillOpacity: 0.6
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            showDistrict(feature.properties.District);
          });
        }
      }).addTo(map);
    });
}

function showDistrict(district) {
  const d = districtStats[district];
  const city = districtStats["CITY"];
  if (!d) return;

  document.getElementById('info').innerHTML = `
    <h2>District ${district}</h2>
    <p>Total Voters: ${d.TotalVoters}</p>
    <canvas id="chart"></canvas>
  `;

  const ctx = document.getElementById('chart');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Democratic', 'Republican', 'Other'],
      datasets: [
        {
          label: `District ${district}`,
          data: [d.Democratic, d.Republican, d.Other]
        },
        {
          label: 'Citywide',
          data: [city.Democratic, city.Republican, city.Other]
        }
      ]
    }
  });
}
