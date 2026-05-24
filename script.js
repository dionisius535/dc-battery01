const API_URL = "https://dcbattery-power01.dionisius535.workers.dev";

async function updateDashboard() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    document.getElementById("voltage").innerText = data.voltage ?? 0;
    document.getElementById("current").innerText = data.current ?? 0;
    document.getElementById("power").innerText = data.power ?? 0;
    document.getElementById("kwh").innerText = data.energy ?? 0;

    document.getElementById("lastUpdate").innerText =
      new Date().toLocaleTimeString();

  } catch (err) {
    console.log("Dashboard error:", err);
  }
}

setInterval(updateDashboard, 2000);
updateDashboard();
