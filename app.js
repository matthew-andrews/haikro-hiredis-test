var express = require('express');
var app = express();

var hiredis = require("hiredis");
var reader = new hiredis.Reader();


app.get('/', function(req, res) {

	// Data comes in
	reader.feed("$12\r\nendtoendtest\r\n");

	// Reply comes out
	res.send(reader.get()); // => "hello"
});


app.listen(process.env.PORT || 5050);
