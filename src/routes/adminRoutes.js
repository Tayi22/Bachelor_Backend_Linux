// import 'babel-polyfill';
// import Tactic from '../model/tactic'
// import Pattern from '../model/pattern'
// import express from 'express'
// import mongoose from 'mongoose';
// import Mapping from '../model/mapping';
// import async from 'async';
// import Bluebird from 'bluebird';
// import JSONConverter from '../middleware/JSONConverter';
// import helper from '../middleware/helper';
// import User from '../model/user';

const Tactic = require('../model/tactic');
const Pattern = require('../model/pattern');
const express = require('express');
const mongoose = require('mongoose');
const Mapping = require('../model/mapping');
const async = require('async');
const Bluebird = require('bluebird');
const JSONConverter = require('../middleware/JSONConverter');
const helper = require('../middleware/helper');
const User = require('../model/user');

let router = express.Router();

//========== Patterns ==========//

router.post('/patterns',(req,res)=> {
	//TODO Copy from index.js and adjust for ember.js
	let savePattern = new Pattern();

	//Look through all three methods how you can pass params in express.
	let name = req.body.pattern.name || req.params.name || req.query['name'] || null;
	let info = req.body.pattern.info || req.params.info || req.query['info'] || null;

	if (!name || !info)return res.json(JSONConverter.convertJSONError("No Params set or ParamNames wrong",400));

	savePattern.name = name;
	savePattern.info = info;

	if (req.body.relatedPatternIds === undefined)
		req.body.relatedPatternIds = [];

	savePattern.relatedPatternIds = [];

	// execute the tasks synchronously:
	async.series([
		// add relatedPatternIds to the savedPattern if they exist and also add the savePattern to the relatedPatterns
		function (callback) {
			let index = 0;
			async.whilst(
				function testCondition() {
					return index < req.body.relatedPatternIds.length;
				},
				function iteration(callback) {
					//execute queries synchronously
					Pattern.findByIdAndUpdate(req.body.relatedPatternIds[index], {$push: {relatedPatternIds: savePattern._id}}, (err, updateObject) => {
						// if the relatedPatternId from the request is found in the db,
						// it is added to savePattern
						if (!err && updateObject !== null) {

							//format relatedPatternId from post request as Object id
							const relatedPatternObjectId = mongoose.Types.ObjectId(req.body.relatedPatternIds[index]);

							// save the relatedPatternId to savePattern
							savePattern.relatedPatternIds.push(relatedPatternObjectId);
						}
						//increment and call the next iteration of the loop via callback
						index++;
						callback();
					});
				},
				// callback function from async.whilst is called when the testCondition fails
				function () {
					// callback from async.series is called to start the next function of async.series
					callback();
				}
			);
		},
		// save savePattern to database
		function (callback) {
			savePattern.save((err, savedObject) => {
				if (err)
					res.json(JSONConverter.convertJSONError(err));
				else
					res.json(JSONConverter.convertJSONObject('pattern', savedObject));
				callback();
			});
		}
	]);
});


router.delete('/patterns/:pattern_id',(req,res)=>{

	mongoose.Promise = Bluebird;

	//if somewhere an error occurs, this String is filled with the data.
	let errorString = "";
	let returnDoc;

	//This is the ID of the Pattern that needs to be deleted in die related Patterns
	let patternId = req.body.pattern_id || req.params.pattern_id || req.query['pattern_id'] || null;

	if (!patternId) res.status(400).json(JSONConverter.convertJSONError("Wrong Params, pattern_id not found",400));

	//Without this Mongo would find the right Pattern, it Changes the String to an ObjectID.
	var patternObjectId = mongoose.Types.ObjectId(patternId);
	let promise = Pattern.findById({_id : patternId}).exec();
	promise.then(function(doc){
		if (doc.length === 0) return res.status(404).json(JSONConverter.convertJSONError("No pattern found", 404));
		returnDoc = doc;
		let relatedPatternArray = doc.relatedPatternIds;
		let promiseRelatedPatternArray = relatedPatternArray.map((item) =>{
			return new Bluebird((resolve,reject)=>{

				patternObjectId = mongoose.Types.ObjectId(patternObjectId);
				Pattern.findByIdAndUpdate(item, {$pull: {relatedPatternIds: patternObjectId}},(err,result)=>{
					if (err) {
						reject(err);
					}
					console.log(result);
					resolve();
				});
			});
		});
		//Loop through the complete array and wait for all Querys to be finished.
		Bluebird.all(promiseRelatedPatternArray)
			.catch((err)=>{
				errorString += "Error: " + err + " ";
			});
		//Delete all Mappings related to this Pattern.
		let mappingIdArray = doc.mappingIds;
		let mappingIdArrayPromise = mappingIdArray.map((item)=>{
			return helper.deleteMapping(item.toString());
		});
		Bluebird.all(mappingIdArrayPromise).catch((reject)=>{
			errorString += "Error: " + reject + " ";
		})
		//Delete the Pattern itself.
	}).then(()=>{
		Pattern.findById(patternObjectId.toString()).remove((err)=>{
			if(err) errorString += "Error: " + err.message + " ";
			res.json(JSONConverter.convertJSONObject("pattern", returnDoc));
		});
	});
});

//========== Tactics ==========//

router.delete('/tactics/:tactic_id',helper.checkExistingTactic,(req,res)=>{

	//Get the tacticId from all possible sources.
	let tacticId = req.params.tactic_id || req.body.tactic_id || req.query['tactic_id'];

	//Return if the variable tacticId is not set right.
	if (!tacticId) return res.json(JSONConverter.convertJSONError("tactic_id param not found",404));

	let mainPromise = Tactic.findById(tacticId).exec();
	mainPromise.then((doc)=> {
		if (doc.childTacticIds.isEmpty()) return res.status(400).json(JSONConverter.convertJSONError("Remove childtactics first",404));
		


	});
})

router.post('/tactics',(req,res)=>{
	let saveTactic = new Tactic();
	saveTactic.name = req.body.name;
	saveTactic.info = req.body.info;

	//if the new tactic is no root tactic
	//new tactic is added as child tactic to the parent tactic
	if (req.body.parentTacticId !== undefined) {
		saveTactic.parentTacticId = req.body.parentTacticId;
		Tactic.findByIdAndUpdate(saveTactic.parentTacticId, {$push: {childTacticIds: saveTactic._id}}).exec();
	}
	else {
		saveTactic.parentTacticId = "";
	}

	//in case the new tactic is no root tactic and there is an array of child tactics,
	// the array of child tactics is removed from parents child tactics,
	if (req.body.childTacticIds !== undefined) {
		saveTactic.childTacticIds = req.body.childTacticIds;
		if (saveTactic.parentTacticId !== "") {
			Tactic.findByIdAndUpdate(saveTactic.parentTacticId, {$pullAll: {childTacticIds: saveTactic.childTacticIds}}).exec();
		}
	}
	else {
		saveTactic.childTacticIds = [];
	}

	saveTactic.save((err, savedObject) => {
		if (err)
			res.send(err);
		else
			res.json(savedObject);
	});
})
//========== Mappings ==========//

router.delete('/mappings',helper.checkExistingMapping,(req,res)=>{
	//TODO Copy from index.js and adjust for ember.js
})

//========= User =========//

router.get('/users', (req,res)=>{
	User.find((err, queryResult) => {
		if (err)
			res.json(JSONConverter.convertJSONError(err));
		else
			res.json(JSONConverter.convertJSONArray("users",queryResult));
	});
})

router.get('/users/:user_id',(req,res)=>{
	let userId = req.params.user_id || req.body.user_id || '';
	User.findById(userId,(err,result)=>{
		//If error occurs, send back the error.
		if (err) res.json(JSONConverter.convertJSONError(err));
		//If no User with Id is found, return User not found error.
		else if (!result) res.json(JSONConverter.convertJSONError("User not found",404));
		else res.json(JSONConverter.convertJSONObject("user",result));

	})
})


//========== Private Functions ==========//
//This functions are used by the REST Methods to work on the data.

module.exports = router;
