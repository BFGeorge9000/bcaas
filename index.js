// Requirements
var express = require('express');
var yamljs  = require('yamljs');
var mongo   = require('mongodb').MongoClient;

mongo.connect(process.env.MONGODB_URI, function(err, client) {

  if(err){
    console.log(err);
  }

  // Load and normalize name-part data from YAML
  var names = yamljs.load('names.yml')
  var normalizedNames = {
    "first": normalizeSplits(names.first),
    "last": normalizeSplits(names.last)
  }

  // Routing
  var app = express();

  app.get('/', function(request, response){
    var newName = {
      'first_name': firstName(),
      'last_name': lastName(),
      'last_seen_on': new Date()
    }

    var db = client.db(process.env.MONGODB_NAME);
    var names = db.collection('names');

    names.insert(newName);
    names.find({first_name: newName.first_name, last_name: newName.last_name})
         .sort({last_seen_on: 1})
         .toArray(function(err, sightings){

          if(err){
            console.log(err);
          }

          var nameSummary = {
            'first_name': newName.first_name,
            'last_name': newName.last_name,
            'times_seen': sightings.length,
            'first_seen_on': sightings[0].last_seen_on,
            'last_seen_on': newName.last_seen_on
            
          }
          response.json(nameSummary);
        })
  });

  var listenPort = process.env.PORT || 3000

  app.listen(listenPort, function(){
    console.log('Server started on Port ' + listenPort + '. Listening...');
  });

  // Utility functions
  function firstName(){
    return completeOrSplit(normalizedNames.first);
  }

  function lastName(){
    return completeOrSplit(normalizedNames.last);
  }

  function normalizeSplits(dataSet){
    // This gives the "split" names a better chance of being chosen in completeOrSplit() 
    var splitCount = dataSet.splits.front.length + dataSet.splits.back.length;
    
    for(i = 0; i < splitCount; i++){
      dataSet.completes.push("split");    
    }
    return dataSet;
  }

  function completeOrSplit(nameSet){
    var name = randomFrom(nameSet.completes);
    if(name == "split"){
      name = randomFrom(nameSet.splits.front) + "-" + randomFrom(nameSet.splits.back);
    }
    return name[0].toUpperCase() + name.substring(1);
  }

  function randomFrom(dataSet){
    return dataSet[Math.floor(Math.random() * dataSet.length)];
  }
})