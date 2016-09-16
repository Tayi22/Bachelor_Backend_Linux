// import http from 'http';
// import app from '../app';
// import logger from 'morgan';

const http = require('http');
const app = require('../app');
const logger = require('morgan');

app.use(logger('dev'));



app.server = http.createServer(app);

var port = process.env.PORT || '3000';
app.set('port', port);

app.listen(port);


console.log("server running on " + port);


// export default app;
module.exports = app;





