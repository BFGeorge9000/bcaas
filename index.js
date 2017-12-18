// Requirements
var express = require('express');
var yamljs  = require('yamljs');

var names = yamljs.load('names.yml')
var normalizedNames = {
  "first": normalizeSplits(names.first),
  "last": normalizeSplits(names.last)
}

// Routing
var app = express();

app.get('/', function(request, response){
  var benewho = {
    "first_name": firstName(),
    "last_name": lastName(),
    "times_seen": timesSeen(),
    "first_seen_on": new Date(),
    "last_seen_on": new Date()
  }

  response.json(benewho);
});

app.listen(3000, function(){
  console.log('Server started on Port 3000. Listening...');
});

// Utility functions
function firstName(){
  return completeOrSplit(normalizedNames.first);
}

function lastName(){
  return completeOrSplit(normalizedNames.last);
}

function timesSeen(){
  //TODO: persist new names to a DB and report "sightings" here
  return 1;
}

function normalizeSplits(dataSet){
  // This gives the "split" names a better chance of bring chosen in completeOrSplit() 
  var splitCount = dataSet.splits.front.length + dataSet.splits.back.length
  for(i = 0; i < splitCount; i++){
    dataSet.completes.push("split");    
  }
  return dataSet;
}

function completeOrSplit(nameSet){
  var name = randomFrom(nameSet["completes"])
  if(name == "split"){
    name = randomFrom(nameSet["splits"]["front"]) + "-" + randomFrom(nameSet["splits"]["back"]);
  }
  return name;
}

function randomFrom(array){
  return array[Math.floor((Math.random() * array.length) + 1)];
}

