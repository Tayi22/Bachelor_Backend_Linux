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



//========== Mappings ==========//


router.post('/mappings',helper.checkExistingPattern,helper.checkExistingTactic,(req,res)=>{
	mongoose.Promise = Bluebird;
	let saveMapping = new Mapping();

	//Import all required Params for the next steps or send an error back if some parameters are not set right.
	let patternId = req.body.pattern_id || req.params.pattern_id || req.query['pattern_id'] || null;
	let tacticId = req.body.tactic_id || req.params.tactic_id || req.query['tactic_id'] || null;
	let info = req.body.info || req.params.info || req.query['info'] || null;

	if (!patternId || !tacticId || !info) return res.json(JSONConverter.convertJSONError("Could not find pattern_id, tactic_id or info",400));

	saveMapping.patternId = patternId;
	saveMapping.tacticId = tacticId;
	saveMapping.info = info;
	saveMapping.ratingNumb = 0;
	saveMapping.rating = 0;
	saveMapping.comments = [];
	let mappingId = saveMapping._id;
	var promise = [];
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

//========== Ratings and Comments on Mappings ==========//

router.post('/mappings/comments',(req,res)=>{

	//Gather all neccasary variables from the Request object
	let comment = req.body.comment || req.params.comment || req.query['comment'] || null;
	let mappingId = req.body.mapping_id || req.params.mapping_id || req.query['mapping_id'] || null;
	let user = req.headers['x-key'] || null;

	//Check if variables are set.
	if (!comment || !mappingId ) return res.json(JSONConverter.convertJSONError("Param rating or mapping_id not found",400));

	if(!user) return res.json(JSONConverter.convertJSONError("User not set in header"),400);

	res.send(200);
	//TODO Finish.
})

router.post('/mappings/ratings',(req,res)=>{


	//Gather all neccasary variables from the Request object
	let rating = req.body.rating || req.params.rating || req.query['rating'] || null;
	let mappingId = req.body.mapping_id || req.params.mapping_id || req.query['mapping_id'] || null;
	let user = req.headers['x-key'] || null;

	//Check if variables are set.
	if (!rating || !mappingId ) return res.json(JSONConverter.convertJSONError("Param rating or mapping_id not found",400));

	if(!user) return res.json(JSONConverter.convertJSONError("User not set in header"),400);

	//Find the right Mapping
	Mapping.findById(mappingId, (err,mappingDoc)=>{
		if (err) return res.json(JSONConverter.convertJSONError(err));

		//Find the right User.
		User.findOne({username : user},(err,userDoc)=>{
			if (err) return res.json(JSONConverter.convertJSONError(err));

			//He only can rate once so the mapping ID is added to his data.
			if (userDoc.mappingIds.contains(mappingId)) return res.json(JSONConverter.convertJSONError("Allready rated",403));

			try {
				mappingDoc.addRating(rating);
				userDoc.mappingIds.push(mappingId);
				mappingDoc.save();
				userDoc.save();

				return res.send(200);

			}catch(e){
				return res.json(JSONConverter.convertJSONError(e));
			}
		})

	});
})

module.exports = router;
