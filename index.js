var express = require('express');
var app = express();
var mongo = require('mongodb');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongodbUrl = "mongodb://10.64.2.11:27017/ysdndb";

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(require('body-parser').urlencoded({ extended: true }));

app.use(express.static(__dirname + '/dist'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

mongo.MongoClient.connect(mongodbUrl, function(err, db) {
	db.collection('ysdnlog').find({ }, {tailable:true, awaitdata:true, numberOfRetries:-1}).each(function(err, doc) {
		io.sockets.emit('new', JSON.stringify(doc));
		console.log("mongotail:" + JSON.stringify(doc));
	});
});

app.get('/', function(req, res){
	res.render('signIn');
});

app.get('/display', function(req, res){
	res.render('display');
});

app.get('/students', function(req, res){
  mongo.MongoClient.connect(mongodbUrl, function(err, db) {
	getstudent(db, function(result) {
		if(result == null) { return res.json('{ }'); }
		return res.json(result);
	});
  });
});

app.post('/choose', function(req, res, next){
  var student = req.body.student;
  var challenge = -1;

  if(req.body.challenge.substring(9) === "1") { challenge = 1; } 
  else if(req.body.challenge.substring(9) === "2") { challenge = 2; }
  
  console.log(student);
  console.log(challenge);

  mongo.MongoClient.connect(mongodbUrl, function(err, db) {
	getgroup(db, challenge, function(result) {
		var group = result.font;
		setstudent(db, student, group, challenge, function(result) {
			setgroup(db, student, challenge, group, function(r) {
				if(r.result.ok) {
					var name = student.first + " " + student.last;
					return res.json( { "name": name, "challenge": challenge, "group": group, "s_id": student._id } );
				} else { return res.json( { } ); }	
			});
		});
	});
  });
});

app.get('/board', function(req, res){
	return res.render("board");
});

app.get('/groups', function(req, res){
  mongo.MongoClient.connect(mongodbUrl, function(err, db) {
	getgroups(db, function(result) {
		if(result == null) { return res.json('{ }'); }
		return res.json(result);
	});
  });
});

var getstudent = function(db, callback) {
   db.collection('students').find( { "matched": false }).toArray(function(err, doc) {
	if(doc == null) { return callback(null); } 
	else { return callback(doc); }
   });
}

var setstudent = function(db, student, group, challenge, callback) {
   db.collection('students').updateOne( { "email": student.email }, { $set: { "challenge": challenge, "group": group, "matched": true } }, function(err, doc) {
	if(doc == null) { return callback(false); } 
	else { return callback(true); }
   });
}

var setgroup = function(db, student, challenge, group, callback) {
   var fn = student.first + " " + student.last;
   db.collection('groups').updateOne( { "font": group }, { $set: { "challenge": challenge }, $inc: { "scount": 1 }, $push: { "members": fn } }, function(err, doc) {
	db.collection('ysdnlog').insertOne( { "name": fn, "group":group, "challenge": challenge }, function(err, result) {
		callback(result);
	});
   });
}

var getgroup = function(db, challenge, callback) {
   console.log("Choosing...");
   db.collection('groups').find( { "challenge": challenge, "scount": 1 }).toArray(function(err, doc) {
	if(doc.length == 0) { 
		console.log("No existing group of Challenge" + challenge + ". Finding empty groups.");
   		db.collection('groups').find( {"scount": 0 }).toArray(function(err, doc) {
			if(doc.length == 0) {
				console.log("No empty groups. Forcing full group.");
				db.collection('groups').find( { "challenge" : challenge, "scount": 2 }).toArray(function(err, doc) {
					var rand = Math.floor(Math.random() * (doc.length - 1));
					return callback(doc[rand]); 
				});
			}
			else {
				var rand = Math.floor(Math.random() * (doc.length - 1));
				return callback(doc[rand]); 
			}
		});
	} 
	else { 
		console.log("Found!");
		var rand = Math.floor(Math.random() * (doc.length - 1));
		return callback(doc[rand]); 
	}
   });
}

var getgroups = function(db, callback) {
   db.collection('groups').find().toArray(function(err, doc) {
	if(doc == null) { return callback(null); } 
	else { return callback(doc); }
   });
}

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
