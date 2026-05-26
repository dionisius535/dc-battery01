const API_URL =
  "https://dcbattery-power01.dionisius535.workers.dev/";

// =========================
// POWER CHART
// =========================

const powerCtx = document
  .getElementById("powerChart")
  .getContext("2d");

const powerChart = new Chart(powerCtx, {
  type: "line",

  data: {
    labels: [],
    datasets: [
      {
        label: "Power (W)",
        data: [],
        borderWidth: 2,
        tension: 0.3
      }
    ]
  },

  options: {
    responsive: true,
    animation: false
  }
});

// =========================
// MULTI CHART
// =========================

const multiCtx = document
  .getElementById("multiChart")
  .getContext("2d");

const multiChart = new Chart(multiCtx, {
  type: "line",

  data: {
    labels: [],

    datasets: [
      {
        label: "Voltage (V)",
        data: [],
        borderWidth: 2,
        tension: 0.3
      },

      {
        label: "Current (A)",
        data: [],
        borderWidth: 2,
        tension: 0.3
      }
    ]
  },

  options: {
    responsive: true,
    animation: false
  }
});

// =========================
// FETCH DATA
// =========================

async function fetchData() {

  try {

    const response = await fetch(API_URL);

    const data = await response.json();

    console.log("LIVE:", data);

    // =========================
    // UPDATE UI
    // =========================

    document.getElementById("voltage").innerText =
      Number(data.voltage || 0).toFixed(2);

    document.getElementById("current").innerText =
      Number(data.current || 0).toFixed(2);

    document.getElementById("power").innerText =
      Number(data.power || 0).toFixed(2);

    document.getElementById("energy").innerText =
      Number(data.energy || 0).toFixed(2);

    document.getElementById("frequency").innerText =
      Number(data.frequency || 0).toFixed(2);

    // =========================
    // UPDATE TIME
    // =========================

    const now = new Date().toLocaleTimeString();

    document.getElementById("lastUpdate").innerText = now;

    // =========================
    // POWER CHART
    // =========================

    powerChart.data.labels.push(now);

    powerChart.data.datasets[0].data.push(
      Number(data.power || 0)
    );

    // =========================
    // MULTI CHART
    // =========================

    multiChart.data.labels.push(now);

    multiChart.data.datasets[0].data.push(
      Number(data.voltage || 0)
    );

    multiChart.data.datasets[1].data.push(
      Number(data.current || 0)
    );

    // =========================
    // LIMIT GRAPH
    // =========================

    if (powerChart.data.labels.length > 20) {

      powerChart.data.labels.shift();

      powerChart.data.datasets[0].data.shift();
    }

    if (multiChart.data.labels.length > 20) {

      multiChart.data.labels.shift();

      multiChart.data.datasets.forEach(ds => ds.data.shift());
    }

    // =========================
    // REFRESH CHARTS
    // =========================

    powerChart.update();

    multiChart.update();

  } catch (err) {

    console.error("FETCH ERROR:", err);
  }
}

// =========================
// START
// =========================

fetchData();

setInterval(fetchData, 2000);
