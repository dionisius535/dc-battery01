const YEAR = new Date().getFullYear();
document.getElementById('year').textContent = YEAR;
function formatTime(d){return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});}
function generateMockReading(prevPower = 50){
  const change = (Math.random() - 0.5) * 8;
  const power = Math.max(10, Math.round((prevPower + change) * 10) / 10);
  const voltage = Math.round((220 + (Math.random()-0.5) * 10) * 10) / 10;
  const current = Math.round((power * 1000 / voltage) * 10) / 10;
  const kwh = Math.round((Math.random() * 5 + power/10) * 10) / 10;
  return {power, voltage, current, kwh, ts: new Date()};
}
const powerCtx = document.getElementById('powerChart').getContext('2d');
const barCtx = document.getElementById('barChart').getContext('2d');
let powerLabels = []; let powerData = [];
for(let i=0;i<24;i++){
  powerLabels.push(new Date(Date.now() - (23 - i) * 60000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
  powerData.push( Math.round((40 + Math.random()*60) * 10) / 10);
}
const powerChart = new Chart(powerCtx, {
  type: 'line',
  data: {labels: powerLabels,datasets: [{label: 'Power (kW)',data: powerData,fill: true,tension: 0.25,borderWidth: 2,pointRadius: 2}]},
  options: {responsive:true,scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}
});
const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {labels: ['Line A','Line B','Line C','Line D'],datasets: [{label:'Energy (kWh)',data: [120, 80, 95, 60],barPercentage: 0.6}]},
  options: {responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
});
function updateKpis(reading, prev){
  document.getElementById('power').textContent = reading.power.toFixed(1);
  document.getElementById('voltage').textContent = reading.voltage.toFixed(1);
  document.getElementById('current').textContent = reading.current.toFixed(1);
  document.getElementById('kwh').textContent = reading.kwh.toFixed(1);
  const pdelta = prev ? Math.round(((reading.power - prev.power) / prev.power) * 100) : 0;
  document.getElementById('powerDelta').textContent = (pdelta >= 0 ? '+' : '') + pdelta + '%';
  document.getElementById('lastUpdate').textContent = formatTime(reading.ts);
}
function pushReading(reading){
  powerChart.data.labels.push(formatTime(reading.ts));
  powerChart.data.labels.shift();
  powerChart.data.datasets[0].data.push(reading.power);
  powerChart.data.datasets[0].data.shift();
  powerChart.update();
  barChart.data.datasets[0].data = barChart.data.datasets[0].data.map(v => Math.max(10, Math.round((v + (Math.random()-0.5)*6) * 10)/10));
  barChart.update();
}
let lastReading = generateMockReading(60);
updateKpis(lastReading);
setInterval(() => {
  const newR = generateMockReading(lastReading.power);
  pushReading(newR);
  updateKpis(newR, lastReading);
  lastReading = newR;
}, 4000);
