// netlify/functions/gs-proxy.js
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors() };
  }
  const GAS_EXEC_URL = process.env.GAS_EXEC_URL;
  if (!GAS_EXEC_URL) return respond(500, { ok:false, error:'Missing GAS_EXEC_URL' });

  const url = new URL(GAS_EXEC_URL);
  const qs = event.queryStringParameters || {};
  Object.keys(qs).forEach(k => url.searchParams.set(k, qs[k]));

  const init = { method: event.httpMethod, headers: {} };
  if (event.httpMethod === 'POST') {
    init.headers['Content-Type'] = 'application/json';
    init.body = event.body;
  }

  const r = await fetch(url.toString(), init);
  const text = await r.text();
  return { statusCode: r.status, headers: { ...cors(), 'Content-Type':'application/json' }, body: text };
};
function cors(){ return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};}
function respond(status, body){ return { statusCode: status, headers: { ...cors(), 'Content-Type':'application/json' }, body: JSON.stringify(body) }; }
