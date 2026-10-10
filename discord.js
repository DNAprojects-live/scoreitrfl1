// Step 1: send the user to Discord.
const crypto = require('crypto');
const { cookie } = require('../../lib/session');

module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex'); // protects against forged callbacks
  const url = new URL('https://discord.com/oauth2/authorize');
  url.search = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SITE_URL + '/api/auth/callback',
    scope: 'identify',
    state,
    
  });
  res.setHeader('Set-Cookie', cookie('oauth_state', state, 600));
  res.writeHead(302, { Location: url.toString() });
  res.end();
};
