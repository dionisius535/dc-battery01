// functions/influx-debug.js
export async function onRequest(context) {
  const token = context.env.INFLUX_TOKEN;
  const has = !!token;
  const len = token ? token.length : 0;
  return new Response(JSON.stringify({
    ok: true,
    INFLUX_TOKEN_present: has,
    INFLUX_TOKEN_length: has ? len : 0
  }), { headers: { 'Content-Type': 'application/json' }});
}
