var express = require('express');
var app = express();

var thenRedis = require("then-redis");


app.get('/', function(req, res) {
	res.send(thenRedis);
});


app.listen(process.env.PORT || 5050);
