// Signed cookie session without dependencies (HMAC-SHA256).
const crypto = require('crypto');
const SECRET = process.env.SESSION_SECRET;
const hmac = p => crypto.createHmac('sha256', SECRET).update(p).digest('base64url');

function sign(data) {
  const p = Buffer.from(JSON.stringify(data)).toString('base64url');
  return p + '.' + hmac(p);
}
function verify(token) {
  if (!token || !SECRET) return null;
  const [p, s] = token.split('.');
  if (!p || !s) return null;
  const good = hmac(p);
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return null;
  try {
    const d = JSON.parse(Buffer.from(p, 'base64url').toString());
    return d.exp > Date.now() ? d : null;
  } catch { return null; }
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(a => a[0]).map(([k, ...v]) => [k, v.join('=')]));
}
const cookie = (name, val, maxAge) => `${name}=${val}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
module.exports = { sign, verify, cookies, cookie };
