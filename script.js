const API_URL =
  "https://dcbattery-power01.dionisius535.workers.dev";

const HISTORY_URL =
  `${API_URL}/history`;

const DEVICES_URL =
  `${API_URL}/devices`;

const MAX_POINTS = 30;

// =====================================================
// TABS
// =====================================================

function showTab(tabId) {

  document
    .querySelectorAll(".tab-content")
    .forEach(tab => {

      tab.classList.remove(
        "active"
      );
    });

  document
    .getElementById(tabId)
    .classList.add("active");

  document
    .querySelectorAll(".tab-btn")
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );
    });

  event.target.classList.add(
    "active"
  );
}

window.showTab = showTab;

// =====================================================
// LABELS
// =====================================================

const labels = [];

// =====================================================
// CHARTS
// =====================================================

function createLineChart(id) {

  return new Chart(
    document.getElementById(id),
    {

      type: "line",

      data: {

        labels,

        datasets: []
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: false
      }
    }
  );
}

const voltageChart =
  createLineChart(
    "voltageChart"
  );

const currentChart =
  createLineChart(
    "currentChart"
  );

const frequencyChart =
  createLineChart(
    "frequencyChart"
  );

const powerChart =
  new Chart(
    document.getElementById(
      "powerChart"
    ),
    {

      type: "doughnut",

      data: {

        labels: [],

        datasets: [
          {
            data: []
          }
        ]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "75%",

        animation: false
      }
    }
  );

const energyChart =
  new Chart(
    document.getElementById(
      "energyChart"
    ),
    {

      type: "bar",

      data: {

        labels: [],

        datasets: [
          {
            label: "Energy",

            data: []
          }
        ]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: false
      }
    }
  );

const historyChart =
  new Chart(
    document.getElementById(
      "historyChart"
    ),
    {

      type: "line",

      data: {

        labels: [],

        datasets: [
          {
            label: "History",

            data: [],

            tension: 0.3
          }
        ]
      },

      options: {

  responsive: true,

  maintainAspectRatio: false,

  animation: false,

  interaction: {

    mode: "index",

    intersect: false
  },

  plugins: {

    tooltip: {

      enabled: true
    },

    legend: {

      display: true
    }
  },

  scales: {

    x: {

      ticks: {

            maxTicksLimit: 10
            }
          }
        }
      }
    }
  );

// =====================================================
// DATASETS
// =====================================================

const voltageDatasets = {};
const currentDatasets = {};
const frequencyDatasets = {};

function createDataset(label) {

  let color = "#3b82f6"; // blue

  if (label === "L1")
    color = "#3b82f6";

  if (label === "L2")
    color = "#22c55e";

  if (label === "L3")
    color = "#f59e0b";

  return {

    label,

    data: [],

    tension: 0.3,

    borderWidth: 2,

    borderColor: color,

    backgroundColor: color
  };
}

// =====================================================
// UPDATE LINE
// =====================================================

function updateLineChart(
  chart,
  datasetMap,
  device,
  value
) {

  if (
    !datasetMap[device]
  ) {

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

  chart.update();
}

// =====================================================
// PRELOAD
// =====================================================

async function preloadRealtimeHistory() {

  try {

    const fields = [
      "voltage",
      "current",
      "frequency"
    ];

    for (const field of fields) {

      const res =
        await fetch(
          `${HISTORY_URL}?range=-30s&field=${field}`
        );

      const data =
  await res.json();

const history =
  data.history || [];

      history.forEach(item => {

        const device =
          item.device.trim();

        const time =
          new Date(item.time)
          .toLocaleTimeString();

        if (
          !labels.includes(time)
        ) {

          labels.push(time);

          if (
            labels.length > MAX_POINTS
          ) {

            labels.shift();
          }
        }

        if (field === "voltage") {

          updateLineChart(
            voltageChart,
            voltageDatasets,
            device,
            item.value
          );
        }

        if (field === "current") {

          updateLineChart(
            currentChart,
            currentDatasets,
            device,
            item.value
          );
        }

        if (field === "frequency") {

          updateLineChart(
            frequencyChart,
            frequencyDatasets,
            device,
            item.value
          );
        }
      });
    }

  } catch (err) {

    console.error(
      "PRELOAD ERROR:",
      err
    );
  }
}

// =====================================================
// REALTIME
// =====================================================

async function fetchRealtime() {
  try {

    const res =
      await fetch(API_URL);

    const data =
      await res.json();

    document.getElementById(
      "lastUpdate"
    ).innerText =
      new Date()
      .toLocaleTimeString();

    const now =
      new Date()
      .toLocaleTimeString();

    labels.push(now);

    while (
      labels.length > MAX_POINTS
    ) {

      labels.shift();
    }

    // TABLE

    const tbody =
      document.getElementById(
        "deviceTableBody"
      );

    tbody.innerHTML = "";

    const powerLabels = [];
    const powerValues = [];

    const energyLabels = [];
    const energyValues = [];

    data.devices.forEach(device => {

      const dev =
        device.device.trim();

      // TABLE

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${dev}</td>
        <td>${device.status}</td>
        <td>${Number(device.voltage || 0).toFixed(2)}</td>
        <td>${Number(device.current || 0).toFixed(2)}</td>
        <td>${Number(device.power || 0).toFixed(2)}</td>
      `;

      tbody.appendChild(row);

      // POWER

      powerLabels.push(dev);

      powerValues.push(
        Number(device.power || 0)
      );

      // ENERGY

      energyLabels.push(dev);

      energyValues.push(
        Number(device.energy || 0)
      );

      // LINE CHARTS

      updateLineChart(
        voltageChart,
        voltageDatasets,
        dev,
        Number(device.voltage || 0)
      );

      updateLineChart(
        currentChart,
        currentDatasets,
        dev,
        Number(device.current || 0)
      );

      updateLineChart(
        frequencyChart,
        frequencyDatasets,
        dev,
        Number(device.frequency || 0)
      );
    });

    // POWER

    powerChart.data.labels =
  powerLabels;

powerChart.data.datasets[0]
  .data = powerValues;

powerChart.data.datasets[0]
  .backgroundColor = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b"
  ];

    powerChart.update();

    document.getElementById(
      "gaugePowerValue"
    ).innerText =
      Number(
        data.summary.total_power || 0
      ).toFixed(2);
// KPI

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
  Number(
    data.summary.total_devices || 0
  );
    // ENERGY

    energyChart.data.labels =
      energyLabels;

    energyChart.data.datasets[0]
      .data = energyValues;

    energyChart.update();

  } catch (err) {

    console.error(
      "FETCH ERROR:",
      err
    );
  }
}

// =====================================================
// DEVICES
// =====================================================

async function loadDevices() {

  try {

    const res =
      await fetch(
        DEVICES_URL
      );

    const devices =
      await res.json();

    const select =
      document.getElementById(
        "deviceSelect"
      );

    select.innerHTML = `
      <option value="all">
        All Devices
      </option>
    `;

    devices.forEach(device => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        device;

      option.innerText =
        device;

      select.appendChild(option);
    });

  } catch (err) {

    console.error(err);
  }
}

// =====================================================
// HISTORY
// =====================================================

async function loadHistory() {

  try {

    const range =
      document.getElementById(
        "rangeSelect"
      ).value;

    const field =
      document.getElementById(
        "fieldSelect"
      ).value;

    const device =
      document.getElementById(
        "deviceSelect"
      ).value;

    let url =
  `${HISTORY_URL}?field=${field}`;

if (range === "custom") 
{

  const start =
    document.getElementById(
      "startTime"
    ).value;

  const end =
    document.getElementById(
      "endTime"
    ).value;

  if (!start || !end) {

    alert(
      "Please select Start and End date"
    );

    return;
  }

  url +=
    `&start=${encodeURIComponent(
      new Date(start).toISOString()
    )}`;

  url +=
    `&end=${encodeURIComponent(
      new Date(end).toISOString()
    )}`;

} else {

  url += `&range=${range}`;
}

if (device !== "all") {

  url += `&device=${device}`;
}
// REV01
    const res =
    await fetch(url);

    const data =
    await res.json();

    const history =
    data.history || [];
    
    const values = history

document.getElementById(
  "historyAvg"
).innerText =
  Number(
    data.stats?.avg || 0
  ).toFixed(2);
document.getElementById(
  "historyPeak"
).innerText =
  Number(
    data.stats?.peakValue || 0
  ).toFixed(2);

document.getElementById(
  "historyPeakTime"
).innerText =
  data.stats?.peakTime
    ? new Date(
        data.stats.peakTime
      ).toLocaleString()
    : "-";


    // CHART
let chartData = history;

if (history.length > 500) {

  const step =
    Math.ceil(history.length / 500);

  chartData =
    history.filter(
      (_, index) =>
        index % step === 0
    );
}
historyChart.data.labels = [];

historyChart.data.datasets = [];

const deviceMap = {};

chartData.forEach(item => {

  const time =
    new Date(item.time)
      .toLocaleString();

  if (
    !historyChart.data.labels.includes(time)
  ) {

    historyChart.data.labels.push(time);
  }

  if (
    !deviceMap[item.device]
  ) {

    let color = "#3b82f6";

    if (item.device === "L2")
      color = "#22c55e";

    if (item.device === "L3")
      color = "#f59e0b";

    deviceMap[item.device] = {

      label: item.device,

      data: [],
    
      borderColor: color,
    
      backgroundColor: color,
    
      tension: 0.3,
    
      fill: false,
    
      pointRadius: 2,
    
      pointHoverRadius: 6,
    
      hitRadius: 20
    };
  }

  deviceMap[item.device]
    .data.push(item.value);
});

historyChart.data.datasets =
  Object.values(deviceMap);
historyChart.update();

    // TABLE

    const tbody =
      document.getElementById(
        "historyTableBody"
      );

    tbody.innerHTML = "";

    history.forEach(item => {

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>${new Date(item.time).toLocaleString()}</td>
        <td>${item.device}</td>
        <td>${item.field}</td>
        <td>${Number(item.value).toFixed(2)}</td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {

    console.error(
      "HISTORY ERROR:",
      err
    );
  }
}

// =====================================================
// CLOCK
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
// START
// =====================================================
document
  .getElementById("rangeSelect")
  .addEventListener("change", function () {

    const custom =
      this.value === "custom";

    document.getElementById(
      "startTime"
    ).style.display =
      custom ? "block" : "none";

    document.getElementById(
      "endTime"
    ).style.display =
      custom ? "block" : "none";
});
loadDevices();

preloadRealtimeHistory();

fetchRealtime();

loadHistory();

setInterval(
  fetchRealtime,
  3000
);
