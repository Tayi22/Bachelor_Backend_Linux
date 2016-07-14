//All Paths have the rootpath "/api".
import Tactic from '../model/tactics'
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
        //TODO Implement get all Patterns
    })
    .post((req, res) => {
        //TODO Implement save a Pattern
    });


router.route('/:pattern_id')
    .get((req,res)=>{
        //TODO Implement get single Pattern by id
    })
    .put((req,res)=>{
        //TODO Implement change single Pattern by id
    })


router.route('/:tactic_id')
    .get((req,res)=>{
        //TODO Implement get single Tactic by id
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


router.post('/mapping',(req,res)=>{
    let saveMapping = new Mapping();
    //TODO Check if Patterns with ID exist.
    saveMapping.patternId = req.body.patternId;
    saveMapping.tacticId = req.body.tacticId;
});

export default router