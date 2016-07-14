import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import index from './routes/index';


express.set('views', path.join(__dirname,'views'));
express.set('view engine','jade');


express.use(logger('dev'));
express.use(bodyParser.json());
express.use(bodyParser.urlencoded({extended: true}));
express.use(cookieParser());
express.use(express.static('../public'));

express.use('/api', index); //Switch the name of the path if needed

