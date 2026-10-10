// Step 2: Discord sends the user back here with ?code=...
const { sign, cookies, cookie } = require('../../lib/session');

module.exports = async (req, res) => {
  const q = new URL(req.url, process.env.SITE_URL).searchParams;
  const code = q.get('code'), state = q.get('state');
  if (!code || !state || state !== cookies(req).oauth_state) { res.statusCode = 400; return res.end('Invalid state'); }
  try {
    const tr = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SITE_URL + '/api/auth/callback',
      }),
    });
    const t = await tr.json();
    if (!t.access_token) throw new Error('no token');
    const u = await (await fetch('https://discord.com/api/users/@me', { headers: { Authorization: 'Bearer ' + t.access_token } })).json();
    // Avatar: hash -> CDN link. Animated avatars start with "a_" and are gifs. No avatar -> default one.
    const avatar = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(u.id) >> 22n) % 6n)}.png`;
    const session = sign({ id: u.id, username: u.username, name: u.global_name || u.username, avatar, exp: Date.now() + 30 * 864e5 });
    res.setHeader('Set-Cookie', [cookie('session', session, 30 * 86400), cookie('oauth_state', '', 0)]);
    res.writeHead(302, { Location: '/' });
    res.end();
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end('Discord login failed');
  }
};
