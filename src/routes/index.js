//All Paths have the rootpath "/api".
import Tactic from '../model/tactic'
import Pattern from '../model/pattern'
import express from 'express'
import mongoose from 'mongoose'
import Mapping from '../model/mapping';

let router = express.Router();

//database connection
mongoose.connect('mongodb://localhost:27017');

router.route('/tactic')

    .get((req, res) => {
        Tactic.find((err, queryResult) => {
            if (err)
                res.send(err);
            else
                res.json(queryResult);
        });
    })

    .post((req, res) => {
        let saveTactic = new Tactic();
        saveTactic.name = req.body.name;
        saveTactic.info = req.body.info;
        saveTactic.mappingIds = req.body.mappingIds;
        saveTactic.childTacticIds = req.body.childTacticIds;
        saveTactic.save((err, savedObject) => {
            if (err)
                res.send(err);
            else
                res.json(savedObject);
        });
    });

router.route('/pattern')

    .get((req, res) => {

        Pattern.find((err, queryResult) => {
            if (err)
                res.send(err);
            else
                res.json(queryResult);
        });

    })

    .post((req, res) => {
        let savePattern = new Pattern();
        savePattern.name = req.body.name;
        savePattern.info = req.body.info;
        savePattern.mappingIds = req.body.mappingIds;
        savePattern.relatedPatternIds = req.body.relatedPatternIds;
        savePattern.save((err, savedObject) => {
            if (err)
                res.send(err);
            else
                res.json(savedObject);
        });
    });


router.route('/pattern/:pattern_id')
    .get((req,res)=>{
        Pattern.findById(req.params._id, (err, queryResult) => {
            if (err)
                res.send(err);
            else
                res.json(queryResult);
        });
    })

    .put((req,res)=>{

    });


router.route('/tactic/:tactic_id')
    .get((req,res)=>{
        Tactic.findById(req.params._id, (err, queryResult) => {
            if (err)
                res.send(err);
            else
                res.json(queryResult);
        });
    })
    .put((req,res)=>{
        //TODO Implement change single Tactic by id
    })

router.get('/mappingsByPatternId/:id',(req,res)=>{
   //TODO List of all mapped Tactics to given Pattern by ID
});

router.get('/mappingsByTacticId/:id',(req,res)=>{
   //TODO List of all mapped Patterns to given Tactic by ID
});

router.get('/relatedPatternFromId/:id',(req,res)=>{
    //TODO Get all related Patterns from given Pattern by ID
});


router.post('/mapping',checkExistingPattern, checkExistingTactic, (req,res)=>{
    let saveMapping = new Mapping();
    let patternId = req.body.patternId;
    let tacticId = req.body.tacticId;
    saveMapping.patternId = patternId;
    saveMapping.tacticId = tacticId;


});

function checkExistingTactic (req,res,next){
    let tacticId = req.body.tacticId;
    Tactic.count({_id: tacticId}, (err,count)=>{
        if(err){
            res.send(err);
        }else
        if(count <= 0){
            res.json({error:"Error, Tactic not found"});
        }else {
            next();
        }
    });
}

function checkExistingPattern (req,res,next) {
    let patternId = req.body.patternId;
    Pattern.count({_id: patternId}, (err,count)=>{
        if(err){
            res.send(err);
        }else
        if(count <= 0){
            res.json({error:"Error, Pattern not found"});
        }else {
            next();
        }
    });
}

export default router