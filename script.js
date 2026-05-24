const API_URL = "https://dcbattery-power01.dionisius535.workers.dev";

async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    document.getElementById("voltage").innerText = data.voltage + " V";
    document.getElementById("current").innerText = data.current + " A";
    document.getElementById("power").innerText = data.power + " W";
    document.getElementById("energy").innerText = data.energy + " kWh";

  } catch (err) {
    console.log("Fetch error:", err);
  }
}

setInterval(fetchData, 2000);
fetchData();
