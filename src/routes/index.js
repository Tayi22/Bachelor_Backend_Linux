//All Paths have the rootpath "/api".
import Tactic from '../model/tactics'
import Pattern from '../model/pattern'
import express from 'express'
import mongoose from 'mongoose'

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
        //TODO Implement save a Tactic

        let saveTactic = new Tactic();







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

router.get('/relatedPatternFromId(:id',(req,res)=>{
    //TODO Get all related Patterns from given Pattern by ID
});

export default router