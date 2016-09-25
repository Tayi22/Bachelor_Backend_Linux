//Helper Functions for simple Tasks that are requiered at multiple Targets
// import 'babel-polyfill';
// import Mapping from '../model/mapping';
// import Tactic from '../model/tactic';
// import Pattern from '../model/pattern';
// import express from 'express'
// import mongoose from 'mongoose'
// import Bluebird from 'bluebird';
// import JSONConverter from '../middleware/JSONConverter';

const Mapping = require('../model/mapping');
const Tactic = require('../model/tactic');
const Pattern = require('../model/pattern');
const express = require('express');
const mongoose = require('mongoose');
const Bluebird = require('bluebird');
const JSONConverter = require('../middleware/JSONConverter');
const User = require('../model/user');

const helper = {

	filterInput(rawString){
		if(/[^a-zA-Z0-9]/.test(rawString))
		{
			return false
		}
		return true;
	},


	//Allows to check for an existing Pattern. If Pattern is not found the process is canceled and an errormessage is send.
	checkExistingPattern(req,res,next){
		let patternId = req.body.pattern_id;
		if (patternId === undefined) patternId = req.params.pattern_id;
		Pattern.count({_id: patternId}, (err,count)=>{
			if(err){
				res.json(JSONConverter.convertJSONError(err))
			}else
			if(count <= 0){
				res.json(JSONConverter.convertJSONError("Pattern not found",404));
			}else {
				next();
			}
		});
	},
	//See checkExistingPattern
	checkExistingTactic(req,res,next){
		let tacticId = req.body.tactic_id;
		if (tacticId === undefined) tacticId = req.params.tactic_id;
		Tactic.count({_id: tacticId}, (err,count)=>{
			if(err){
				res.json(JSONConverter.convertJSONError(err))
			}else
			if(count <= 0){
				res.json(JSONConverter.convertJSONError("Tactic not found",404));
			}else {
				next();
			}
		});
	},
	//See checkExistingPattern
	checkExistingMapping(req,res,next){
		let mappingId = req.body.mapping_id;
		if(mappingId === undefined) mappingId = req.params.mapping_id;
		Mapping.count({_id: mappingId}, (err,count)=>{
			if(err){res.status(500).send(err)}
			else if (count <= 0){
				res.status(404).json({error: "Error, Mapping not found"})
			}else{
				next();
			}
		});
	},

	deleteMapping(id){
	return new Bluebird(function(resolve,reject) {
		console.log("entered");
		mongoose.Promise = Bluebird;
		let mappingId = id;
		//Cast the String to an ObjectId so the ID is found in the mappingIds field.
		let mappingIdForPull = mongoose.Types.ObjectId(mappingId);
		let mappingPromise = Mapping.findById(mappingId).exec();
		mappingPromise.then((doc)=> {
			console.log("doc: " + doc);
			var promise = [];
			promise.push(Tactic.findByIdAndUpdate(doc.tacticId, { $pull: { mappingIds: mappingIdForPull } }).exec());
			promise.push(User.findByIdAndUpdate(doc.owner, { $pull: {ownedMappings: mappingIdForPull } }).exec());
			promise.push(Pattern.findByIdAndUpdate(doc.patternId, { $pull: { mappingIds: mappingIdForPull } }).exec());
			Bluebird.all(promise).then(function () {
				let deleteQuery = Mapping.findById(mappingId).remove((err)=> {
					if (err){
						console.log(e + "error 3 here");
						reject(err);
					} 
					else resolve(200);
				})
			}).catch(e=> {
				console.log(e + "error here");
				reject(e);
			});
		}).catch(e=> {
			console.log(e + "error 2 here");
			return reject(e);
		});
	});
}
};

module.exports = helper;
