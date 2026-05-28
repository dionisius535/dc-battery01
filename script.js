const API_URL =
  "https://dcbattery-power01.dionisius535.workers.dev";

const HISTORY_URL =
  "https://dcbattery-power01.dionisius535.workers.dev/history";

const DEVICE_URL =
  "https://dcbattery-power01.dionisius535.workers.dev/devices";

// =====================================================
// GLOBALS
// =====================================================

const MAX_POINTS = 30;

let labels = [];

// =====================================================
// DATASETS
// =====================================================

const voltageDatasets = {};
const currentDatasets = {};
const frequencyDatasets = {};

// =====================================================
// CREATE DATASET
// =====================================================

function createDataset(label) {

  return {

    label,

    data: [],

    tension: 0.3,

    borderWidth: 2
  };
}

// =====================================================
// TAB SWITCHING
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

  document
    .querySelectorAll(".tab-btn")
    .forEach(btn => {

      if (
        btn.getAttribute("onclick")
          .includes(tabId)
      ) {

        btn.classList.add(
          "active"
        );
      }
    });
}

window.showTab = showTab;

// =====================================================
// CHART FACTORY
// =====================================================

function createLineChart(canvasId) {

  return new Chart(
    document.getElementById(canvasId),
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

// =====================================================
// CHARTS
// =====================================================

const voltageChart =
  createLineChart("voltageChart");

const currentChart =
  createLineChart("currentChart");

const frequencyChart =
  createLineChart("frequencyChart");

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

// =====================================================
// ENERGY CHART
// =====================================================

const energyChart = new Chart(
  document.getElementById("energyChart"),
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

// =====================================================
// HISTORY CHART
// =====================================================

const historyChart = new Chart(
  document.getElementById("historyChart"),
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
// UPDATE LINE CHART
// =====================================================

function updateLineChart(
  chart,
  datasetMap,
  device,
  value
) {

  device = device.trim();

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

  chart.update();
}

// =====================================================
// PRELOAD HISTORY
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
// FETCH REALTIME
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

    // =========================================
    // TABLE
    // =========================================

    const tbody =
      document.getElementById(
        "deviceTableBody"
      );

    tbody.innerHTML = "";

    // =========================================
    // POWER
    // =========================================

    const powerLabels = [];

    const powerValues = [];

    // =========================================
    // ENERGY
    // =========================================

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

      // CHARTS
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
// LOAD DEVICES
// =====================================================

async function loadDevices() {

  try {

    const res =
      await fetch(API_URL);

    const data =
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

    data.devices.forEach(device => {

      if (
        device.status === "online"
      ) {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          device.device;

        option.innerText =
          device.device;

        select.appendChild(option);
      }
    });

  } catch (err) {

    console.error(err);
  }
}

// =====================================================
// CUSTOM RANGE
// =====================================================

document
  .getElementById(
    "rangeSelect"
  )
  .addEventListener(
    "change",
    function () {

      const custom =
        this.value === "custom";

      document
        .getElementById(
          "startTime"
        )
        .style.display =
          custom
            ? "block"
            : "none";

      document
        .getElementById(
          "endTime"
        )
        .style.display =
          custom
            ? "block"
            : "none";
    }
  );

// =====================================================
// LOAD HISTORY
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

    if (range !== "custom") {

      url += `&range=${range}`;
    }

    if (range === "custom") {

      const start =
        document.getElementById(
          "startTime"
        ).value;

      const end =
        document.getElementById(
          "endTime"
        ).value;

      url += `&start=${start}`;

      url += `&end=${end}`;
    }

    if (device !== "all") {

      url += `&device=${device}`;
    }

    const res =
      await fetch(url);

    const history =
      await res.json();

    // GRAPH
    const graphLabels = [];

    const graphValues = [];

    history.forEach(item => {

      graphLabels.push(
        new Date(item.time)
        .toLocaleString()
      );

      graphValues.push(item.value);
    });

    historyChart.data.labels =
      graphLabels;

    historyChart.data.datasets[0]
      .label = field;

    historyChart.data.datasets[0]
      .data = graphValues;

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
