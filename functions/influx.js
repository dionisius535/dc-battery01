// functions/influx.js – Cloudflare Pages Function
export async function onRequest(context) {
  const token = context.env.INFLUX_TOKEN;

  // Edit these lines to match your Influx settings
  const org = "6c070a87699f1929";         // your org ID
  const bucket = "Smart Power Meter IOT"; // ✅ your bucket name
  const measurement = "power_data";       // <-- change if your measurement differs

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1m)
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> filter(fn: (r) => r._field =~ /power|energy|current|voltage/)
      |> last()
  `;

  const resp = await fetch("http://34.44.226.83:8086/api/v2/query?org=" + org, {
    method: "POST",
    headers: {
      "Authorization": "Token " + token,
      "Content-Type": "application/vnd.flux",
      "Accept": "application/csv"
    },
    body: fluxQuery
  });

  if (!resp.ok) {
    return new Response(await resp.text(), { status: resp.status });
  }

  const csv = await resp.text();
  const data = {};

  csv.split("\n").forEach(line => {
    const cols = line.split(",");
    const field = cols[7];          // _field column
    const value = parseFloat(cols[6]); // _value column
    if (field && !isNaN(value)) data[field] = value;
  });

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
