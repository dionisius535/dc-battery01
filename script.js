// script.js – runs in the browser
async function updateData() {
  try {
    // Call the Cloudflare Function
    const res = await fetch('/influx');
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    // Update the HTML spans
    document.getElementById('power').textContent   = data.power?.toFixed(1)   ?? '--';
    document.getElementById('energy').textContent  = data.energy?.toFixed(2)  ?? '--';
    document.getElementById('current').textContent = data.current?.toFixed(2) ?? '--';
    document.getElementById('voltage').textContent = data.voltage?.toFixed(1) ?? '--';
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// Refresh every 5 seconds
setInterval(updateData, 5000);
updateData();
