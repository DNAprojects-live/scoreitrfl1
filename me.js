// The site calls this on load to learn who is logged in.
const { verify, cookies } = require('../lib/session');

module.exports = (req, res) => {
  const s = verify(cookies(req).session);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (!s) { res.statusCode = 401; return res.end('{"error":"not logged in"}'); }
  const verified = (process.env.VERIFIED_IDS || '').split(',').map(x => x.trim()).includes(s.id); // blue check, by Discord ID
  res.end(JSON.stringify({ id: s.id, username: s.username, name: s.name, avatar: s.avatar, verified, roblox: s.roblox || null }));
};
