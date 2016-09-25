// import jwt from 'jwt-simple';
// import secret from '../config/secret';
// import User from '../model/user';
// import Bluebird from 'bluebird';
// import mongoose from 'mongoose';

const jwt = require('jwt-simple');
const secret = require('../config/secret');
const User = require('../model/user');
const Bluebird = require('bluebird');
const mongoose = require('mongoose');
const JSONConverter = require('../middleware/JSONConverter');

function validateUser(username,token){

	return new Bluebird((resolve)=>{
		let promise = User.findOne({'username' : username}).exec();
		promise.then((user) => {
			if(user.token.token === token) resolve(user);
			else resolve(null);
		})
	})
}

module.exports = function(req,res,next){

	if(req.method == 'OPTIONS') return next();
	//Check weather the token is in body, query or in the header and set the variable "token".
	let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || (req.headers['x-access-token']);

	//Check weather the key is in body, query or in the header and sets the variable. The key should be the username.
	let key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

	//If both variables are set
	if(token && key){
		try {
			let decoded = jwt.decode(token, secret());
			if (decoded.exp <= Date.now()) {
				//If token is expired.
				res.json(
					JSONConverter.convertJSONError("Token expired",400)
				);
				return;
			}

			//Authorize User

			let userPromise = validateUser(key,token);
			userPromise.then((user)=> {
				if (user) {
					//If there is an "admin" in the url, check if the user is an admin to authorized
					//If there is an /user in the url, check if the user exists
					if ((req.url.indexOf('admin') >= 0 && user.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/user/') >= 0)) {
						next()
					} else {
						//User is not an admin
						res.json(
							JSONConverter.convertJSONError("unauthorized" + err,403)
						);
						return;
					}
				} else {
					//No user with this name exists
					res.json(JSONConverter.convertJSONError("Invalid user",400));
					return;
				}
			});
			}catch (err){
				res.json(JSONConverter.convertJSONError("Invalid user",400));
			}
	}else {
		res.json(JSONConverter.convertJSONError("Invalid params",400));
		return;
	}
};
