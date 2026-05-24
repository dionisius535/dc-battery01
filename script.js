async function fetchData() {
  const res = await fetch("https://dcbattery-power01.dionisius535.workers.dev/");
  const data = await res.json();

  // update text UI
  document.getElementById("voltage").innerText = data.voltage;
  document.getElementById("current").innerText = data.current;
  document.getElementById("power").innerText = data.power;
  document.getElementById("energy").innerText = data.energy;
  document.getElementById("frequency").innerText = data.frequency;

  // SIMPLE chart fallback (single point)
  chart.data.labels.push(new Date().toLocaleTimeString());

  chart.data.datasets[0].data.push(data.voltage);
  chart.data.datasets[1].data.push(data.current);
  chart.data.datasets[2].data.push(data.power);

  // limit memory (important)
  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(d => d.data.shift());
  }

  chart.update();
}
