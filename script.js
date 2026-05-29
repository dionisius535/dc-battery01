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

        animation: false
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

  return {

    label,

    data: [],

    tension: 0.3,

    borderWidth: 2
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

      const history =
        await res.json();

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

    if (
      range !== "custom"
    ) {

      url += `&range=${range}`;
    }

    if (
      device !== "all"
    ) {

      url += `&device=${device}`;
    }

    const res =
      await fetch(url);

    const history =
      await res.json();

    // CHART

    historyChart.data.labels = [];

    historyChart.data.datasets[0]
      .data = [];

    history.forEach(item => {

      historyChart.data.labels.push(
        new Date(item.time)
        .toLocaleString()
      );

      historyChart.data.datasets[0]
        .data.push(item.value);
    });

    historyChart.data.datasets[0]
      .label = field;

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

loadDevices();

preloadRealtimeHistory();

fetchRealtime();

loadHistory();

setInterval(
  fetchRealtime,
  1000
);
