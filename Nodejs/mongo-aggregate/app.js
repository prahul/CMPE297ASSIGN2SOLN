if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-2.0'][0]['credentials'];
}
else{
  var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"db"
  }
}

var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test111');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);


var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');



var record_visit = function(req, res){
  // Connect to the DB and auth 
  require('mongodb').connect(mongourl, function(err, conn){
    conn.collection('ips', function(err, coll){
      // Simple object to insert: ip address and date 
      object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date() };

      // Insert the object then print in response 
      // Note the _id has been created 
      coll.insert( object_to_insert, {safe:true}, function(err,result){
        
		coll.aggregate([{ $group: { _id: "$ts",
									count: { $sum: 1 } } },
						{ $match: { count: { $gt: 0 } } }], function(err, result){
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(result) + "\n");
						
						console.log(result);

						});	
	  
	  });
    });
  });
}


/*var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;

var db = new Db('example1Db',new Server('localhost', 27017), {safe:false});

var record_visit = function(req, res){
	db.open(function(err, db) {
	  // Create a collection
	  db.createCollection('test12', function(err, collection) {
	    //Create object tp insert
		object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date() };
		// Insert the docs
		collection.insert(object_to_insert, {safe:true}, function(err, result) {

		  // Execute aggregate, notice the pipeline is expressed as an Array
		  collection.aggregate([{ $group: { _id: "$ts",
									count: { $sum: 1 } } },
						{ $match: { count: { $gt: 0 } } }], function(err, result){
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(result) + "\n");
						db.close();

						});		  
		 });
		});
	 });
}*/


http.createServer(function (req, res) {

  /*params = require('url').parse(req.url);
  if(params.pathname === '/history') {
      print_visits(req, res);
	//print_grp_visits(req, res);
   }else{
        record_visit(req, res);
   }*/

  record_visit(req, res);
  //res.writeHead(200, {'Content-Type': 'text/plain'});
  //res.end('Hello World\n');
}).listen(port, host);



/*var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;

// Some docs for insertion
var docs = [{
    title : "this is my title", author : "bob", posted : new Date() ,
    pageViews : 5, tags : [ "fun" , "good" , "fun" ], other : { foo : 5 },
    comments : [
      { author :"joe", text : "this is cool" }, { author :"sam", text : "this is bad" }
    ]}];

var db = new Db('exampleDb',new Server('localhost', 27017), {safe:false});
db.open(function(err, db) {
  // Create a collection
  db.createCollection('test11', function(err, collection) {
    // Insert the docs
    collection.insert(docs, {safe:true}, function(err, result) {

      // Execute aggregate, notice the pipeline is expressed as an Array
      collection.aggregate([
          { $project : {
            author : 1,
            tags : 1
          }},
          { $unwind : "$tags" },
          { $group : {
            _id : {tags : "$tags"},
            authors : { $addToSet : "$author" }
          }}
        ], function(err, result) {
          console.dir(result);
          db.close();
      });
    });
  });
});

var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(port, host);*/

/*var mongo = require('mongodb'),
  ReplSet = mongo.ReplSet,
  ReadPreference = mongo.ReadPreference,
  Db = mongo.Db;

// Replica configuration
var replSet = new ReplSet( [
    new mongo.Server( "localhost", 27017),
    new mongo.Server( "localhost", 27018),
    new mongo.Server( "localhost", 27019)
  ], {rs_name: "foo"}
);

// Instantiate a new db object
var db = new Db('exampleDb', replSet, {readPreference: ReadPreference.SECONDARY_PREFERRED}, {safe:false});
db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});

var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(port, host);*/

/*var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');

var mongo = {"hostname":"localhost","port":27017,"username":"","password":"","name":"","db":"db"};


var db = require('mongodb').connect("mongodb://localhost:27017/db");

//var db = new Db('mydb', new Server('localhost', 27017, {}));

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(port, host);*/

