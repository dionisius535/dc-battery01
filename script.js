const API_URL =
  "https://dcbattery-power01.dionisius535.workers.dev";

const HISTORY_URL =
  "https://dcbattery-power01.dionisius535.workers.dev/history";

const DEVICE_URL =
  "https://dcbattery-power01.dionisius535.workers.dev/devices";

// =====================================================
// CHART BUFFERS
// =====================================================

const MAX_POINTS = 60;

let labels = [];

const voltageDatasets = {};
const currentDatasets = {};
const frequencyDatasets = {};

const energyData = [];
const energyLabels = [];

// =====================================================
// POWER GAUGE
// =====================================================

const powerChart = new Chart(
  document.getElementById("powerChart"),
  {

    type: "doughnut",

    data: {

      labels: [],

      datasets: [
        {
          data: [],

          borderWidth: 2
        }
      ]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      animation: false,

      cutout: "75%",

      plugins: {

        legend: {

          position: "bottom",

          labels: {
            color: "white"
          }
        }
      }
    }
  }
);

// =====================================================
// VOLTAGE CHART
// =====================================================

const voltageChart = new Chart(
  document.getElementById("voltageChart"),
  {

    type: "line",

    data: {
      labels,
      datasets: []
    },

    options: {
      responsive: true,
      animation: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  }
);

// =====================================================
// CURRENT CHART
// =====================================================

const currentChart = new Chart(
  document.getElementById("currentChart"),
  {

    type: "line",

    data: {
      labels,
      datasets: []
    },

    options: {
      responsive: true,
      animation: false
    }
  }
);

// =====================================================
// FREQUENCY CHART
// =====================================================

const frequencyChart = new Chart(
  document.getElementById("frequencyChart"),
  {

    type: "line",

    data: {
      labels,
      datasets: []
    },

    options: {
      responsive: true,
      animation: false
    }
  }
);

// =====================================================
// ENERGY BAR CHART
// =====================================================

const energyChart = new Chart(
  document.getElementById("energyChart"),
  {

    type: "bar",

    data: {

      labels: [],

      datasets: [
        {
          label: "Energy (kWh)",

          data: []
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
  }
);

// =====================================================
// CREATE DATASET IF NOT EXIST
// =====================================================

function createDataset(name) {

  return {
    label: name,
    data: [],
    tension: 0.3,
    borderWidth: 2
  };
}

// =====================================================
// UPDATE MULTILINE CHART
// =====================================================

function updateLineChart(
  chart,
  datasetMap,
  device,
  value
) {

  if (!datasetMap[device]) {

    datasetMap[device] =
      createDataset(device);

    chart.data.datasets.push(
      datasetMap[device]
    );
  }

  datasetMap[device]
    .data.push(value);

  while (
    datasetMap[device]
      .data.length > MAX_POINTS
  ) {

    datasetMap[device]
      .data.shift();
  }
}

// =====================================================
// UPDATE DEVICE TABLE
// =====================================================

function updateDeviceTable(devices) {

  const tbody =
    document.getElementById(
      "deviceTableBody"
    );

  tbody.innerHTML = "";

  devices.forEach(device => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${device.device}</td>
      <td>${device.status}</td>
      <td>${Number(device.voltage || 0).toFixed(2)}</td>
      <td>${Number(device.current || 0).toFixed(2)}</td>
      <td>${Number(device.power || 0).toFixed(2)}</td>
    `;

    tbody.appendChild(row);
  });
}

// =====================================================
// FETCH REALTIME DATA
// =====================================================

async function fetchRealtime() {

  try {

    const res =
      await fetch(API_URL);

    const data =
      await res.json();

    console.log(data);
// ======================================
// POWER GAUGE
// ======================================

const powerLabels = [];

const powerValues = [];

data.devices.forEach(device => {

  powerLabels.push(
    device.device
  );

  powerValues.push(
    Number(device.power || 0)
  );
});

powerChart.data.labels =
  powerLabels;

powerChart.data.datasets[0]
  .data = powerValues;

powerChart.update();

// CENTER VALUE

document.getElementById(
  "gaugePowerValue"
).innerText =
  Number(
    data.summary.total_power || 0
  ).toFixed(2);
    // ======================================
    // UPDATE KPI
    // ======================================

    document.getElementById(
      "totalPower"
    ).innerText =
      Number(
        data.summary.total_power || 0
      ).toFixed(2);

    document.getElementById(
      "totalEnergy"
    ).innerText =
      Number(
        data.summary.total_energy || 0
      ).toFixed(2);

    document.getElementById(
      "totalDevices"
    ).innerText =
      data.summary.total_devices;

    // ======================================
    // LABELS
    // ======================================

    const now =
      new Date()
      .toLocaleTimeString();

    if (
  !labels.includes(now)
) {

  labels.push(now);
}

while (
  labels.length > MAX_POINTS
) {

  labels.shift();
}

    // ======================================
    // DEVICE LOOP
    // ======================================

    energyChart.data.labels = [];
    energyChart.data.datasets[0]
      .data = [];

    data.devices.forEach(device => {

      // VOLTAGE

      updateLineChart(
        voltageChart,
        voltageDatasets,
        device.device,
        Number(device.voltage || 0)
      );

      // CURRENT

      updateLineChart(
        currentChart,
        currentDatasets,
        device.device,
        Number(device.current || 0)
      );

      // FREQUENCY

      updateLineChart(
        frequencyChart,
        frequencyDatasets,
        device.device,
        Number(device.frequency || 0)
      );

      // ENERGY BAR

      energyChart.data.labels.push(
        device.device
      );

      energyChart.data.datasets[0]
        .data.push(
          Number(device.energy || 0)
        );
    });

    // ======================================
    // UPDATE CHARTS
    // ======================================

    voltageChart.update();

    currentChart.update();

    frequencyChart.update();

    energyChart.update();

    // ======================================
    // UPDATE DEVICE TABLE
    // ======================================

    updateDeviceTable(
      data.devices
    );

    // ======================================
    // LAST UPDATE
    // ======================================

    document.getElementById(
      "lastUpdate"
    ).innerText = now;

  } catch (err) {

    console.error(
      "REALTIME ERROR:",
      err
    );
  }
}

// =====================================================
// HISTORY GRAPH
// =====================================================

async function loadHistory() {

  try {

    const res =
      await fetch(
        `${HISTORY_URL}?range=-1h&field=power`
      );

    const history =
      await res.json();

    console.log(
      "HISTORY:",
      history
    );

  } catch (err) {

    console.error(
      "HISTORY ERROR:",
      err
    );
  }
}

// =====================================================
// START
// =====================================================
// =====================================================
// LIVE CLOCK
// =====================================================

function updateClock() {

  const now =
    new Date();

  document.getElementById(
    "liveDate"
  ).innerText =
    now.toLocaleDateString();

  document.getElementById(
    "liveClock"
  ).innerText =
    now.toLocaleTimeString();
}

setInterval(
  updateClock,
  1000
);

updateClock();
// =====================================================
// PRELOAD LAST 1 MINUTE
// =====================================================

async function preloadRealtimeHistory() {

  try {

    const res =
      await fetch(
        `${HISTORY_URL}?range=-1m&field=voltage`
      );

    const voltageHistory =
      await res.json();

    const currentRes =
      await fetch(
        `${HISTORY_URL}?range=-45s&field=current`
      );

    const currentHistory =
      await currentRes.json();

    const freqRes =
      await fetch(
        `${HISTORY_URL}?range=-45s&field=frequency`
      );

    const freqHistory =
      await freqRes.json();

    // =========================================
    // VOLTAGE
    // =========================================

    voltageHistory.forEach(item => {

      const time =
        new Date(item.time)
        .toLocaleTimeString();

      if (!labels.includes(time)) {
      labels.push(time);
      }

      if (
        !voltageDatasets[
          item.device
        ]
      ) {

        voltageDatasets[
          item.device
        ] = createDataset(
          item.device
        );

        voltageChart.data.datasets.push(
          voltageDatasets[
            item.device
          ]
        );
      }

      voltageDatasets[
        item.device
      ].data.push(item.value);
    });

    // =========================================
    // CURRENT
    // =========================================

    currentHistory.forEach(item => {

      if (
        !currentDatasets[
          item.device
        ]
      ) {

        currentDatasets[
          item.device
        ] = createDataset(
          item.device
        );

        currentChart.data.datasets.push(
          currentDatasets[
            item.device
          ]
        );
      }

      currentDatasets[
        item.device
      ].data.push(item.value);
    });

    // =========================================
    // FREQUENCY
    // =========================================

    freqHistory.forEach(item => {

      if (
        !frequencyDatasets[
          item.device
        ]
      ) {

        frequencyDatasets[
          item.device
        ] = createDataset(
          item.device
        );

        frequencyChart.data.datasets.push(
          frequencyDatasets[
            item.device
          ]
        );
      }

      frequencyDatasets[
        item.device
      ].data.push(item.value);
    });
labels.sort((a, b) => {

  return (
    new Date(`1970/01/01 ${a}`) -
    new Date(`1970/01/01 ${b}`)
  );
});
    voltageChart.update();

    currentChart.update();

    frequencyChart.update();

  } catch (err) {

    console.error(
      "PRELOAD ERROR:",
      err
    );
  }
}
preloadRealtimeHistory();
fetchRealtime();
loadHistory();

setInterval(
  fetchRealtime,
  1000
);
