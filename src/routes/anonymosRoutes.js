// import 'babel-polyfill';
// import jwt from 'jwt-simple';
// import Tactic from '../model/tactic'
// import Pattern from '../model/pattern'
// import express from 'express'
// import mongoose from 'mongoose';
// import Mapping from '../model/mapping';
// import JSONConverter from '../middleware/JSONConverter';
// import secret from '../config/secret';
// import User from '../model/user';
// import Bluebird from 'bluebird';

const jwt = require('jwt-simple');
const Tactic = require('../model/tactic');
const Pattern = require('../model/pattern');
const express = require('express');
const mongoose = require('mongoose');
const Mapping = require('../model/mapping');
const JSONConverter = require('../middleware/JSONConverter');
const secret = require('../config/secret');
const User = require('../model/user');
const Bluebird = require('bluebird');

let router = express.Router();

//========== LOGIN ==========//
//Sends back a Token for a registered User so he can access the Methods in registeredRoutes.
//Needs to helper functions genToken and expiresIn to operate.

function genToken(){
	var expires = expiresIn(1); //Sets the expirationtime to one Day (time not final)
	//Token is generated through jwt. Its saves the expiration time and hashes it with a secret which is capsuled from the method.
	var token = jwt.encode({
		exp : expires
	}, secret());

	//Returns the token, the expired time and the user who generated it.
	return {
		token: token,
		expires: expires,
	}
}
/*
 Returns a future Date with numDays in the future.
 */
function expiresIn(numDays){
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}
//Uncomment if you need a new admin for testing.

router.post("/makeAdmin",(req,res)=>{
	var newUser = new User();
	newUser.username = "admin";
	newUser.password = "thisIsAdminPW1337";
	newUser.role = "admin";
	newUser.token = new Object();
	newUser.token.token = 'DEFAULT';
	newUser.token.expires = 'DEFAULT';
	newUser.ownedMappings = new Array();
	newUser.ownedPatterns = new Array();
	newUser.save((err, result)=>{
		if (err) res.json(err);
		res.json(result);
	})
})


router.post("/login",(req,res)=> {
	//Retrive username and password from body or set it empty.
	//TODO Change this if querys are needed for EmberJS.
	var username = req.body.username || '';
	var password = req.body.password || '';

	//Check if the username, password is set right
	if (username == '' || password == '') {
		res.status(401);
		res.json({errors : {
			"status": 401,
			"message": "Invalid credentials"
		}});
		return;
	}

	//Set Bluebird for mongoose default Promise library.
	mongoose.Promise = Bluebird;
	var promise = User.findOne({'username' : username}).exec();
	promise.then((user)=>{
		//If no user is found, retun an errormessage.
		if (!user){
			res.json(JSONConverter.convertJSONError("Username or Password wrong"));
			return;
		}
		//Validate the password if its the right password, send exactly the same Errormessage as above if Password doesnt check.
		user.validatePassword(password,(err, isMatch)=>{
			if(err) res.json(JSONConverter.convertJSONError(err));
			else if(isMatch){
				//Build the User that should be return only with neccasary Props.
				let token = genToken();
				user.token = token;
				let returnUser = {
					id: user.id,
					username: user.username,
					token : {
						token: user.token.token,
						expires : user.token.expires
					},
					comments : user.comments,
					ratedMappings: user.ratedMappings
				};
				user.save();
				res.json(JSONConverter.convertJSONObject("user", returnUser));
			}else
			{
				res.json(JSONConverter.convertJSONError("Username or Password wrong"));
			}
		});
	})
});

//========== Patterns ==========//
//The Following Methods are alle GET Methods that returns an array of patterns or a single pattern
//If an id is needed, its always <name>_id in params/body.

//GET Method to retrieve all patterns that are saved to the db.
router.get('/patterns', (req,res) => {

	const queryParams = req.query;
	if (Object.keys(queryParams).length === 0) {

  Pattern.find((err, queryResult) => {
  	if (err)
  		res.json(JSONConverter.convertJSONError(err));
			else
			//console.log({}.toString.call(queryResult).split(' ')[1].slice(0, -1).toLowerCase());
				res.json(JSONConverter.convertJSONArray("pattern", queryResult));
		});
	}

	else if ("patternId" in queryParams){
		//Get all related Patterns and send it back to the caller.
		getRelatedPattern(queryParams,res);
	}

	else{
		res.json(JSONConverter.convertJSONError("Query not avaiable", 404));
	}
});


//GET Method to retrieve a single Pattern by Id.
router.get("/patterns/:pattern_id",(req,res)=>{
	Pattern.findById(req.params.pattern_id, (err, queryResult) => {
		if (err)
			res.json(JSONConverter.convertJSONError(err));
		else
			res.json(JSONConverter.convertJSONObject("pattern",queryResult));
	});
});

//========== Tactics ==========//
//The Following Methods are alle GET Methods that returns an array of tactics or a single tactic
//If an id is needed, its always <name>_id in params/body.

router.get('/tactics', (req, res) => {

  if (req.query['filter']) {
    Tactic.find((err, result) => {
    	if (err) return json.status(404).json(JSONConverter.convertJSONError(err));
      const filteredArray = result.filter((item) => {
        if (!item.childTacticIds.length > 0) return true;
        return false;
      });
      return res.status(200).json(JSONConverter.convertJSONArray('tactics', filteredArray));
    });
    return;
	}

	console.log("got here");
	Tactic.find((err, queryResult) => {
		if (err)
			return res.json(JSONConverter.convertJSONError(err));
		else
			return res.json(JSONConverter.convertJSONArray("tactics",queryResult));
	});
});

router.get("/tactics/:tactic_id",(req,res)=>{
  
 	Tactic.findById(req.params.tactic_id, (err, queryResult) => {
		if (err)
			res.json(JSONConverter.convertJSONError(err));
		else
			res.json(JSONConverter.convertJSONObject("tactic",queryResult));
	});
});

//========== Mappings ==========//
//The Following Methods are alle GET Methods that returns an array of mappings or a single mapping
//If an id is needed, its always <name>_id in params/body.

//GET method for queries. delegates the request to a function depending on the query params
router.get("/mappings", (req, res) => {
	const queryParams = req.query;

	//if it is a request without query, this method returns all entries of mappings
	if (Object.keys(queryParams).length === 0){
		Mapping.find((err, queryResult)=> {
			if (err)
				res.json(JSONConverter.convertJSONError(err));
			else
				res.json(JSONConverter.convertJSONArray('mappings', queryResult));
		});
	}

	//Query: getMappingsByPatternId
	else if ('patternId' in queryParams) {
		getMappingsByPatternId(queryParams, req, res);
	}

	//Query: getMappingsByTacticId
	else if('tacticId' in queryParams){
		getMappingsByTacticId(queryParams,res);
	}

	// if query params dont match, send back an error msg
	else {
		res.json(JSONConverter.convertJSONError("query not avaiable"));
}

});


router.get("/mappings/:mapping_id",(req,res)=>{
	Mapping.findById(req.params.mapping_id, (err, queryResult) => {
		if (err)
			res.json(JSONConverter.convertJSONError(err));
		else
			if(queryResult == null) queryResult='{}';
			res.json(JSONConverter.convertJSONObject("mapping",queryResult));
	});
});


// ========== Users =========== //
//Get and Post für Users here

router.post("/users",(req,res) => {
	//TODO Change to the right req Params
	let username = req.body.username || req.params.username || req.query['username'] || null;
	let password = req.body.password || req.params.password || req.query['password'] || null;

	if(!username || !password)
	{
		return res.json(JSONConverter.convertJSONError("No Params set or ParamNames wrong",400));
	}

	if( /[^a-zA-Z0-9]/.test( username ) ) return res.json(JSONConverter.convertJSONError("Only alphanumeric",400))
       

	User.findOne({ 'username' : username }, (err,user)=> {
		if(!user) {
			let user = new User();
			user.username = username;
			user.password = password;
			user.role = "user";
			user.token = new Object();
			user.token.token = 'DEFAULT';
			user.token.expires = 'DEFAULT';
			user.ownedMappings = new Array();
			user.ownedPatterns = new Array();

			user.save((err,result)=>{
				if (err){
					res.json(JSONConverter.convertJSONError(err))
				}

				res.json({
					"status" : 200,
					"message" : "user created"
				})
			})
		}else res.json(JSONConverter.convertJSONError('User vorhanden'))
	});
});

//query functions

function getMappingsByPatternId (queryParams, req, res) {
	//query for mappings with patternId
	Mapping.find({patternId: queryParams.patternId}, (err, result) => {

		//If an error occurs, send back the error
		if (err) res.json(JSONConverter.convertJSONError(err));

		//If Mappings are found, then send back the mappings.
		else res.json(JSONConverter.convertJSONArray('mappings',result));
	});
}

function getMappingsByTacticId(queryParams,res){
	Mapping.find({tacticId: queryParams.tacticId}, (err,result)=>{

		//If an error occurs, send back the error
		if(err) res.json(JSONConverter.convertJSONError(err));

		//If Mappings are found, then send back the mappings.
		else res.json(JSONConverter.convertJSONArray('mappings',result));
	})
}

function getRelatedPattern(queryParams,res){
	Pattern.findOne({_id : queryParams.patternId}, (err,result)=>{

		//If an error occurs, send back the error
		if (err) res.json(JSONConverter.convertJSONError(err));

		//If the pattern doesn´t exist, send back 404 - Pattern not found error
		else if (!result) res.json(JSONConverter.convertJSONError("Pattern not found",404));

		//If pattern is found, start a new query and get all Patterns from the relatedPatternIds Array aka idArray.
		else{
			let idArray = result.relatedPatternIds;
			Pattern.find({
				_id : {$in : idArray}
			//Callback after Query is finished:
			},(err,result)=>{
				if (err) res.json(JSONConverter.convertJSONError(err));
				else res.json(JSONConverter.convertJSONArray("patterns",result));
			})
		}
	})
}

module.exports = router;
