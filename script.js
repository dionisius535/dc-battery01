const API_URL =
  "https://dcbattery-power01.dionisius535.workers.dev";

const HISTORY_URL =
  "https://dcbattery-power01.dionisius535.workers.dev/history";

// =======================================
// POWER CHART
// =======================================

const powerCtx =
  document.getElementById("powerChart")
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

    animation: false,

    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// =======================================
// LOAD HISTORICAL DATA
// =======================================

async function loadHistory() {

  try {

    const res = await fetch(HISTORY_URL);

    const history = await res.json();

    console.log("HISTORY:", history);

    const labels = history.map(item =>
      new Date(item.time).toLocaleTimeString()
    );

    const powerData = history.map(item =>
      item.power
    );

    powerChart.data.labels = labels;

    powerChart.data.datasets[0].data =
      powerData;

    powerChart.update();

  } catch (err) {

    console.error("HISTORY ERROR:", err);
  }
}

// =======================================
// FETCH LIVE DATA
// =======================================

async function fetchData() {

  try {

    const response =
      await fetch(API_URL);

    const data =
      await response.json();

    console.log("LIVE:", data);

    // ==========================
    // UPDATE KPI VALUES
    // ==========================

    document.getElementById("voltage")
      .innerText =
      Number(data.voltage || 0)
      .toFixed(2);

    document.getElementById("current")
      .innerText =
      Number(data.current || 0)
      .toFixed(2);

    document.getElementById("power")
      .innerText =
      Number(data.power || 0)
      .toFixed(2);

    document.getElementById("energy")
      .innerText =
      Number(data.energy || 0)
      .toFixed(2);

    document.getElementById("frequency")
      .innerText =
      Number(data.frequency || 0)
      .toFixed(2);

    // ==========================
    // LAST UPDATE TIME
    // ==========================

    const now =
      new Date().toLocaleTimeString();

    document.getElementById(
      "lastUpdate"
    ).innerText = now;

    // ==========================
    // REALTIME CHART UPDATE
    // ==========================

    powerChart.data.labels.push(now);

    powerChart.data.datasets[0]
      .data.push(
        Number(data.power || 0)
      );

    // Keep last 50 points

    if (
      powerChart.data.labels.length > 50
    ) {

      powerChart.data.labels.shift();

      powerChart.data.datasets[0]
        .data.shift();
    }

    powerChart.update();

  } catch (err) {

    console.error(
      "FETCH ERROR:",
      err
    );
  }
}

// =======================================
// START SYSTEM
// =======================================

loadHistory();

fetchData();

setInterval(fetchData, 2000);
