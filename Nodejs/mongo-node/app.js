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
  obj.db = (obj.db || 'test');

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
  /* Connect to the DB and auth */
  require('mongodb').connect(mongourl, function(err, conn){
    conn.collection('ips', function(err, coll){
      /* Simple object to insert: ip address and date */
      object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date() };

      /* Insert the object then print in response */
      /* Note the _id has been created */
      coll.insert( object_to_insert, {safe:true}, function(err){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(JSON.stringify(object_to_insert));
        res.end('\n');
      });
    });
  });
}


var print_visits = function(req, res){
/* Connect to the DB and auth */
require('mongodb').connect(mongourl, function(err, conn){
    conn.collection('ips', function(err, coll){
        coll.find({}, {sort:[['_id','desc']]}, function(err, cursor){
            cursor.toArray(function(err, items){
		var countt = 0;
                res.writeHead(200, {'Content-Type': 'text/plain'});
                for(i=0; i<items.length;i++){
                    res.write(JSON.stringify(items[i]) + "\n");
		    countt = countt + 1;
                }
                res.end("Total Count=" + JSON.stringify(countt) + "\n");
            });
        });
    });
});
}


/*var print_grp_visits = function(req, res){
// Connect to the DB and auth 
require('mongodb').connect(mongourl, function(err, conn){
    conn.collection('ips', function(err, coll){
        coll.aggregate([{ $group: { _id: "$ts",
									count: { $sum: 1 } } },
						{ $match: { count: { $gt: 0 } } }], function(err, result){
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(result) + "\n");
			})
    });
});
}*/

/*var print_grp_visits = function(req, res){
// Connect to the DB and auth 
require('mongodb').connect(mongourl, function(err, conn){
    conn.ips.aggregate([{ $group: { _id: "$ts",
									count: { $sum: 1 } } },
						{ $match: { count: { $gt: 0 } } }], function(err, result){
						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.write(JSON.stringify(result) + "\n");
			})
});
}*/


http.createServer(function (req, res) {
  /*res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write(mongourl+'\n');
  res.write(JSON.stringify(mongo)+'\n\n');
  res.write(JSON.stringify(process.env.VCAP_SERVICES)+'\n');
  res.end('Hello World\n');
  record_visit(req, res);*/

  params = require('url').parse(req.url);
    if(params.pathname === '/history') {
        print_visits(req, res);
		//print_grp_visits(req, res);
    }
    else{
        record_visit(req, res);
    }

}).listen(port, host);