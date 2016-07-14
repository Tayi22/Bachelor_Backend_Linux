//All Paths have the rootpath "/api".
import tacticModel from '../model/tactics';
import express from 'express';

let router = express.Router();

router.route('/tactic')
    .get((req, res) => {
        //TODO Implement get all Tactics
    })
    .post((req, res) => {
        //TODO Implement save a Tactic
    });

router.route('/pattern')
    .get((req, res) => {
        //TODO Implement get all Patterns
    })
    .post((req, res) => {
        //TODO IMplement save a Pattern
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

