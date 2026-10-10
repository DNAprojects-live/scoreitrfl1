// Step 3: user gives a Roblox username, we return a code to put into the profile "About".
const crypto = require('crypto');
const { sign, verify, cookies, cookie } = require('../../lib/session');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const s = verify(cookies(req).session);
  if (!s) { res.statusCode = 401; return res.end('{"error":"not logged in"}'); }
  const name = String((req.body && req.body.username) || '').trim();
  if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) { res.statusCode = 400; return res.end('{"error":"Invalid Roblox username."}'); }
  try {
    const r = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [name], excludeBannedUsers: true }),
    });
    const u = ((await r.json()).data || [])[0];
    if (!u) { res.statusCode = 404; return res.end('{"error":"Roblox user not found."}'); }
    const code = 'SCORE-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const pending = sign({ did: s.id, rid: u.id, name: u.name, code, exp: Date.now() + 10 * 60 * 1000 });
    res.setHeader('Set-Cookie', cookie('rbx_pending', pending, 600));
    res.end(JSON.stringify({ code, name: u.name }));
  } catch (e) { console.error(e); res.statusCode = 500; res.end('{"error":"Roblox is unreachable. Try again."}'); }
};
