import express from 'express';

let app = express();

//asdasdasdasdasdasd

app.disable('x-powered-by');


app.set('port',process.env.PORT || 3000);

app.get('/', function(req,res){
	res.send('Works');
});

app.listen(app.get('port'), function(){
	console.log('Express started');
});