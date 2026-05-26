const API_URL =
  "https://dcbattery-power01.dionisius535.workers.dev/";

// =======================
// POWER CHART
// =======================

const powerCtx =
  document.getElementById("powerChart").getContext("2d");

const powerChart = new Chart(powerCtx, {
  type: "line",

  data: {
    labels: [],

    datasets: [
      {
        label: "Power (W)",
        data: [],
        tension: 0.3
      }
    ]
  },

  options: {
    responsive: true,

    animation: false,

    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// =======================
// MULTI CHART
// =======================

const multiCtx =
  document.getElementById("multiChart").getContext("2d");

const multiChart = new Chart(multiCtx, {
  type: "line",

  data: {
    labels: [],

    datasets: [
      {
        label: "Voltage (V)",
        data: [],
        tension: 0.3
      },

      {
        label: "Current (A)",
        data: [],
        tension: 0.3
      }
    ]
  },

  options: {
    responsive: true,

    animation: false,

    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// =======================
// FETCH DATA
// =======================

async function fetchData() {

  try {

    const res = await fetch(API_URL);

    const data = await res.json();

    console.log("LIVE DATA:", data);

    // =======================
    // UPDATE TEXT UI
    // =======================

    document.getElementById("voltage").innerText =
      data.voltage != null
        ? Number(data.voltage).toFixed(2)
        : "--";

    document.getElementById("current").innerText =
      data.current != null
        ? Number(data.current).toFixed(2)
        : "--";

    document.getElementById("power").innerText =
      data.power != null
        ? Number(data.power).toFixed(2)
        : "--";

    document.getElementById("energy").innerText =
      data.energy != null
        ? Number(data.energy).toFixed(2)
        : "--";

    document.getElementById("frequency").innerText =
      data.frequency != null
        ? Number(data.frequency).toFixed(2)
        : "--";

    // =======================
    // UPDATE TIME
    // =======================

    const now = new Date().toLocaleTimeString();

    document.getElementById("lastUpdate").innerText = now;

    // =======================
    // UPDATE POWER CHART
    // =======================

    powerChart.data.labels.push(now);

    powerChart.data.datasets[0].data.push(data.power);

    // =======================
    // UPDATE MULTI CHART
    // =======================

    multiChart.data.labels.push(now);

    multiChart.data.datasets[0].data.push(data.voltage);

    multiChart.data.datasets[1].data.push(data.current);

    // =======================
    // LIMIT TO LAST 24 POINTS
    // =======================

    if (powerChart.data.labels.length > 24) {

      powerChart.data.labels.shift();

      powerChart.data.datasets[0].data.shift();
    }

    if (multiChart.data.labels.length > 24) {

      multiChart.data.labels.shift();

      multiChart.data.datasets.forEach(dataset => {
        dataset.data.shift();
      });
    }

    // =======================
    // REFRESH CHARTS
    // =======================

    powerChart.update();

    multiChart.update();

  } catch (err) {

    console.error("FETCH ERROR:", err);
  }
}

// =======================
// AUTO REFRESH
// =======================

fetchData();

setInterval(fetchData, 2000);
