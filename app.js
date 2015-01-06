var express = require('express');
var app = express();

var redis = require("then-redis");
var db = redis.createClient('redis://localhost:6379');

app.get('/', function(req, res) {
	db.set('matt', 'andrews')
		.then(function() {
			return db.get('matt');
		})
		.then(function(result) {
			res.status(200).send(result);
		})
		.catch(function(err) {
			res.status(500).send(err);
		});
});


app.listen(process.env.PORT || 5050);
