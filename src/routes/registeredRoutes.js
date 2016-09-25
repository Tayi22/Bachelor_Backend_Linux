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
	let name = req.body.name || req.params.name || req.query['name'] || null;
	let info = req.body.info || req.params.info || req.query['info'] || null;

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
					res.json(savedObject);
				callback();
			});
		}
	]);
});


//========== Tactics ==========//



//========== Users ==========//

router.get('/users/:userId', (req, res) => {
	const userId = req.params.userId

	if(!userId) return res.json(JSONConverter.convertJSONError('No Param',400));

	User.findById(userId, (err, userDoc) => {
		if(err) return res.json(JSONConverter.convertJSONError('Not found',404));
		let returnUser = {
			_id: userDoc._id,
			username: userDoc.username,
			ratedMappings: userDoc.ratedMappings,
			ownedMappings: userDoc.ownedMappings,
			ownedPatterns: userDoc.ownedPatters
		}
		console.log(returnUser);
		res.json(JSONConverter.convertJSONObject('user', returnUser));
	});
});


router.put('/users/:userId', (req, res) => {
	console.log('userId' + req.params.userId);
	User.findById(req.params.userId, (err, userDoc) => {
		if (err) return res.json(JSONConverter.convertJSONError('Not found',404));
		let newUser = req.body.user;
		if (newUser.ratedMappings) userDoc.ratedMappings = newUser.ratedMappings;
		if (newUser.ownedMappings) userDoc.ownedMappings = newUser.ownedMappings;
		if (newUser.ownedPatterns) userDoc.ownedPatterns = newUser.ownedPatterns;

		userDoc.save((err) => {
			if (err) return res.json(JSONConverter.convertJSONError("Servererror" + err,500));
			let returnUser = {
			_id: userDoc._id,
			username: userDoc.username,
			ratedMappings: userDoc.ratedMappings,
			ownedMappings: userDoc.ownedMappings,
			ownedPatterns: userDoc.ownedPatters
		}
		return res.json(JSONConverter.convertJSONObject('user', returnUser));
		});
	});
});


//========== Mappings ==========//


router.post('/mappings',helper.checkExistingPattern,helper.checkExistingTactic,(req,res)=>{

	//Import all required Params for the next steps or send an error back if some parameters are not set right.
	let patternId = req.body.pattern_id || req.params.pattern_id || req.query['pattern_id'] || null;
	let tacticId = req.body.tactic_id || req.params.tactic_id || req.query['tactic_id'] || null;
	let info = req.body.info || req.params.info || req.query['info'] || null;
	let userId = req.body.user_id || req.params.user_id || null;

	if (!patternId || !tacticId || !info || !userId) return res.json(JSONConverter.convertJSONError("Could not find pattern_id, tactic_id or info",400));


	Mapping.findOne({ 'patternId': patternId, 'tacticId': tacticId }, (err, result) => {

		if(result) return res.json(JSONConverter.convertJSONError('Mapping vorhanden',400));

		mongoose.Promise = Bluebird;
		let saveMapping = new Mapping();

		saveMapping.patternId = patternId;
		saveMapping.tacticId = tacticId;
		saveMapping.info = info;
		saveMapping.ratingNumb = 0;
		saveMapping.rating = 0;
		saveMapping.comments = [];
		saveMapping.owner = userId;
		let mappingId = saveMapping._id;

		var promise = [];
		promise.push(User.findByIdAndUpdate(userId, {$addToSet: {ownedMappings: mappingId}}).exec());
		promise.push(Tactic.findByIdAndUpdate(tacticId,{$addToSet: {mappingIds: mappingId}}).exec());
		promise.push(Pattern.findByIdAndUpdate(patternId,{$addToSet: {mappingIds: mappingId}}).exec());
		Bluebird.all(promise)
			.then(function() {
				saveMapping.save((err, result)=> {
					if (err) {
						res.json(JSONConverter.convertJSONError(err));
					} else res.json(JSONConverter.convertJSONObject("mapping",result));
				})
			})
			.catch(function(err){
				res.json(JSONConverter.convertJSONError(err));
			})
	})
})

router.put('/mappings/:mappingId', (req, res) => {
	Mapping.findById(req.params.mappingId, (err, mappingDoc) => {
		if (err) res.json(JSONConverter.convertJSONError("Mapping not found: " + err,404));

		const oldMapping = req.body.mapping;

		if(!oldMapping.patternId || !oldMapping.tacticId)return res.json(JSONConverter.convertJSONError("Inconsistend",400));

		if(oldMapping.info) mappingDoc.info = oldMapping.info;
		if(oldMapping.owner) mappingDoc.owner = oldMapping.owner;
		if(oldMapping.rating) mappingDoc.rating = oldMapping.rating;
		if(oldMapping.ratingNumb) mappingDoc.ratingNumb = oldMapping.ratingNumb;

		mappingDoc.save( (err) => {
			if (err) return res.json(JSONConverter.convertJSONError("Servererror" + err,500));
			res.json(JSONConverter.convertJSONObject('mapping',mappingDoc));
		});
	});
});

router.delete('/mappings/:mapping_id',(req,res) => {
	let promise = helper.deleteMapping(req.params.mapping_id);
	promise
		//If the resolve is set, then is triggered
		.then((resolve)=>{
			res.status(resolve).send();
		})
		// If the reject is set, catch is triggered
		.catch((reject)=>{
			console.log("rejected" + reject);
			res.status(500).send(reject);
		})
})

//========== Checker ==========//
//Helper Functions to check local storage of ember client.

router.get('/check',(req, res) => {
	const bool = true;
	console.log(JSONConverter.convertJSONObject('bool', bool));
	res.json(JSONConverter.convertJSONObject('bool', bool));
}); 


module.exports = router;
