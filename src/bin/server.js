// import http from 'http';
// import app from '../app';
// import logger from 'morgan';

const http = require('http');
const https = require('https');
const fs = require('fs');

const filter = require('content-filter');
const bodyParser = require('body-parser');

const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

const app = require('../app');
const logger = require('morgan');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(filter());

app.disable('x-powered-by');

//app.server = http.createServer(app);

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443, '10.0.0.8');
console.log('https server running on port 8443');


//var port = process.env.PORT || '3000';
//app.set('port', port);

//app.listen(port, '10.0.0.4');


//console.log("server running on " + port);

// export default app;
module.exports = app;





