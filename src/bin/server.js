import http from 'http';
import app from '../app';

app.server = http.createServer(app);

var port = process.env.PORT || '3000';
app.set('port', port);

app.listen(port);


export default app;





