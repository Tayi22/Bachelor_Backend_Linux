var express = require('express');
var router = express.Router();
var Names = require('../model/names');


router.use(function(req,res,next){
  console.log("Anfrage erhalten");
  next();
})

router.post('/names',function(req,res){
  var name = new Names();
  name.name = req.body.name;

  name.save(function(err){
    if(err) res.send(err);

    res.json({message: "Created"})
  });
});

router.get('/names',function(req,res){
  /*Names.find({name: 'Richard'}, function(err, allNames){
    if(err) res.send(err);

    res.json(allNames);
  });*/

  Names.find().where({ name : "Richard"}).exec(function(err, allNames){
    if(err) res.send(err);

    res.json(allNames);
  });
});

router.get('/names/:name_id',function(req,res){
  
});
module.exports = router;
