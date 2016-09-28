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



//========== Tactics ==========//



//========== Users ==========//

router.get('/users/:userId', (req, res) => {
	const userId = req.params.userId

	if(!userId) return res.json(JSONConverter.convertJSONError('No Param',400));

	User.findById(userId, (err, userDoc) => {
		if (!userId) return res.status(404).json(JSONConverter.convertJSONError('Not found',404));
		if(err) return res.status(404).json(JSONConverter.convertJSONError('Not found',404));
		let returnUser = {
			_id: userDoc._id,
			username: userDoc.username,
			ratedMappings: userDoc.ratedMappings,
			ownedMappings: userDoc.ownedMappings,
			ownedPatterns: userDoc.ownedPatters
		}
		res.json(JSONConverter.convertJSONObject('user', returnUser));
	});
});


router.put('/users/:userId', (req, res) => {
	User.findById(req.params.userId, (err, userDoc) => {
		if (err) return res.status(404).json(JSONConverter.convertJSONError('Not found',404));
		let newUser = req.body.user;
		if (newUser.ratedMappings) userDoc.ratedMappings = newUser.ratedMappings;
		if (newUser.ownedMappings) userDoc.ownedMappings = newUser.ownedMappings;
		if (newUser.ownedPatterns) userDoc.ownedPatterns = newUser.ownedPatterns;

		userDoc.save((err) => {
			if (err) return res.status(500).json(JSONConverter.convertJSONError("Servererror" + err,500));
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


router.post('/mappings',(req,res)=>{
	const newMapping = req.body.mapping

	//Import all required Params for the next steps or send an error back if some parameters are not set right.
	const patternId = newMapping.patternId || req.params.patternId || req.query['patternId'] || null;
	let tacticId = newMapping.tacticId || req.params.tacticId || req.query['tacticId'] || null;
	let info = newMapping.info || req.params.info || req.query['info'] || null;
	let userId = newMapping.owner || req.params.owner || null;

	if (!patternId || !tacticId || !info || !userId) return res.status(422).json(JSONConverter.convertJSONError("Params malfunctioned",400));

	Mapping.findOne({ 'patternId': patternId, 'tacticId': tacticId }, (err, result) => {

		if(result) return res.status(400).json(JSONConverter.convertJSONError('Mapping vorhanden',400));

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

		if(!oldMapping.patternId || !oldMapping.tacticId)return res.status(400).json(JSONConverter.convertJSONError("Inconsistend",400));

		if(oldMapping.info) mappingDoc.info = oldMapping.info;
		if(oldMapping.owner) mappingDoc.owner = oldMapping.owner;
		if(oldMapping.rating) mappingDoc.rating = oldMapping.rating;
		if(oldMapping.ratingNumb) mappingDoc.ratingNumb = oldMapping.ratingNumb;

		mappingDoc.save( (err) => {
			if (err) return res.status(500).json(JSONConverter.convertJSONError("Servererror" + err,500));
			res.json(JSONConverter.convertJSONObject('mapping',mappingDoc));
		});
	});
});

router.delete('/mappings/:mapping_id',(req,res) => {
	let promise = helper.deleteMapping(req.params.mapping_id);
	promise
		//If the resolve is set, then is triggered
		.then((resolve)=>{
			res.status(200).send(JSONConverter.convertJSONObject("mapping", resolve));
		})
		// If the reject is set, catch is triggered
		.catch((reject)=>{
			res.status(500).send(reject);
		})
})

//========== Checker ==========//
//Helper Functions to check local storage of ember client. 


module.exports = router;
