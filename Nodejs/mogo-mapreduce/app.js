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

var resdata;

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

var mapFunction1 = function() {
                       emit(this.ts, this.countdt);
                   };

var reduceFunction1 = function(keyTs, valuesCounts) {
                          return Array.sum(valuesCounts);
                      };
					  
var callBackMR = function(err, coll){
	//console.log(coll);
	coll.find({}, {}, function(err, cursor){
            cursor.toArray(function(err, items){
			     resdata.writeHead(200, {'Content-Type': 'text/plain'});
				for(i=0; i<items.length;i++){
						console.log(items[i]);
						resdata.write(JSON.stringify(items[i]) + "\n");
				}
				resdata.end("END " +  "\n");
            });
      });
}


var record_visit = function(req, res){
  // Connect to the DB and auth 
  require('mongodb').connect(mongourl, function(err, conn){
    conn.collection('ips1', function(err, coll){
      // Simple object to insert: ip address and date 
	  var abc = new Date();
	  var dts = abc.getDate() + '/' + (abc.getMonth() + 1) + '/' + abc.getFullYear();
	  
      //object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date(), 'countdt': 1 };
		object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': dts, 'countdt': 1 };
      // Insert the object then print in response 
      // Note the _id has been created 
      coll.insert( object_to_insert, {safe:true}, function(err,result){

	  coll.mapReduce(
                     mapFunction1,
                     reduceFunction1,
                     { out: "map_reduce_example" },
					 callBackMR
                   );

	  
	  
        
		/*coll.aggregate([{ $group: { _id: "$ts",
									count: { $sum: 1 } } },
						{ $match: { count: { $gt: 0 } } }], function(err, result){
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(result) + "\n");

						});	*/
	  
	  });
    });
  });
}


var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;

var db = new Db('example1Db',new Server('localhost', 27017), {safe:false});

var record_mrvisit = function(req, res){
	db.open(function(err, db) {
	  // Create a collection
	  db.createCollection('test121', function(err, collection) {
	    //Create object tp insert
		object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date(), 'countdt': 1 };
		// Insert the docs
		collection.insert(object_to_insert, {safe:true}, function(err, result) {
		
		//Execute mapreduce function
		collection.mapReduce(
                     mapFunction1,
                     reduceFunction1,
                     { out: "map_reduce_example" });
					 db.close();

		  /*// Execute aggregate, notice the pipeline is expressed as an Array
		  collection.aggregate([{ $group: { _id: "$ts",
									count: { $sum: 1 } } },
						{ $match: { count: { $gt: 0 } } }], function(err, result){
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(result) + "\n");
						db.close();

						});*/
		 });
		});
	 });
}


http.createServer(function (req, res) {

  /*params = require('url').parse(req.url);
  if(params.pathname === '/history') {
      print_visits(req, res);
	//print_grp_visits(req, res);
   }else{
        record_visit(req, res);
   }*/
  resdata = res;
  record_visit(req, res);
  
  //record_mrvisit(req, res);
  
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

