const { cookie } = require('../lib/session');
module.exports = (req, res) => {
  res.setHeader('Set-Cookie', cookie('session', '', 0));
  res.writeHead(302, { Location: '/' });
  res.end();
};
