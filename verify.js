// Step 4: read the Roblox profile description, compare with the code, link accounts.
const { sign, verify, cookies, cookie } = require('../../lib/session');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const c = cookies(req);
  const s = verify(c.session), p = verify(c.rbx_pending);
  if (!s) { res.statusCode = 401; return res.end('{"error":"not logged in"}'); }
  if (!p || p.did !== s.id) { res.statusCode = 400; return res.end('{"error":"No active code. Start again."}'); }
  try {
    const r = await fetch(`https://users.roblox.com/v1/users/${p.rid}`);
    const d = (await r.json()).description || '';
    if (!d.includes(p.code)) { res.statusCode = 400; return res.end('{"error":"Code not found in your Roblox description. Save your profile and try again."}'); }
    const session = sign({ ...s, roblox: { id: p.rid, name: p.name }, exp: Date.now() + 30 * 864e5 });
    res.setHeader('Set-Cookie', [cookie('session', session, 30 * 86400), cookie('rbx_pending', '', 0)]);
    const verified = (process.env.VERIFIED_IDS || '').split(',').map(x => x.trim()).includes(s.id);
    res.end(JSON.stringify({ id: s.id, username: s.username, name: s.name, avatar: s.avatar, verified, roblox: { id: p.rid, name: p.name } }));
  } catch (e) { console.error(e); res.statusCode = 500; res.end('{"error":"Roblox is unreachable. Try again."}'); }
};
