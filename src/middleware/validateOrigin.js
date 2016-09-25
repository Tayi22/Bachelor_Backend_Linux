const url = require('url');

module.exports = function(req, res, next) {
  const ref = req.headers.referer;
  if (ref) {
    const urlParse = url.parse(ref);
    if(urlParse && urlParse.host === 'localhost:4200') return next();
    else res.send(403, 'Invalid Origin');
  } else {
    res.send(403, 'Invalid Origin');
  }
}