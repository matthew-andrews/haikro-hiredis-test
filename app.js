/*jshint node:true*/
'use strict';

var express = require('express');
var cors = require('cors');
var app = module.exports = express();
var Flags = require('./models/flags');
var bodyParser = require('body-parser');
var FlagAlreadyExistsError = require('./errors/flag-already-exists');
var InvalidFlagPropertyError = require('./errors/invalid-flag-property');

require('es6-promise').polyfill();

var cacheControl = function(req, res, next) {
	res.set('Cache-Control', 'no-cache');
	next();
};

var flagSuccess = function(res) {
	return function(flag) {
		res.status(200);
		res.json(flag);
	};
};

var auth = function(req, res, next) {
	next();
};

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

app.use(cacheControl);

app.get('/__gtg', function(req, res) {
	res.status(200).end();
});

app.get('/', function(req, res) {
	res.redirect(301, 'https://github.com/Financial-Times/next-feature-flags-api/');
});

// get a list of all flags
app.get('/:namespace', cors(), function(req, res, next) {
	var flag = new Flags(req.params.namespace);
	flag.get()
		.then(function(flagset) {
			res.json(flagset.flags);
		})
		.catch(function() {
			res.json([]);
		})
		.catch(next);
});

// get a single flag
app.get('/:namespace/:flag', cors(), function(req, res, next) {
	var flag = new Flags(req.params.namespace);
	flag.get()
		.then(function(flags) {
			res.json(flags[req.params.flag] || {});
		})
	.catch(function(err) {
		res.json([]);
		throw err;
	})
	.catch(next);
});

// create a flag
app.post('/:namespace', auth, function(req, res, next) {
	var flag = new Flags(req.params.namespace);
	flag.create(req.body)
		.then(function(flag) {
			res.status(201);
			res.json(flag);
		})
		.catch(next);
});

// delete a flag
app.delete('/:namespace/:flag', auth, function(req, res, next) {
	var flag = new Flags(req.params.namespace);
	flag.delete(req.params.flag)
		.then(flagSuccess(res))
		.catch(next);
});

// edit a flag
app.put('/:namespace/:flag', auth, function(req, res, next) {
	var flag = new Flags(req.params.namespace);
	flag.update(req.params.flag, req.body)
		.then(flagSuccess(res))
		.catch(next);
});

// toggle a flag on and off
var toggleOn = function(req, res, next) {
	var flag = new Flags(req.params.namespace);
	flag.toggle(req.params.flag, true)
		.then(flagSuccess(res))
		.catch(next);
};

var toggleOff = function(req, res, next) {
	var flag = new Flags(req.params.namespace);
	flag.toggle(req.params.flag, false)
		.then(flagSuccess(res))
		.catch(next);
};

app.put('/:namespace/:flag/on', auth, toggleOn);
app.put('/:namespace/:flag/off', auth, toggleOff);

// GET is here as an interim solution to enable non devs to edit flag state
app.get('/:namespace/:flag/on', auth, toggleOn);
app.get('/:namespace/:flag/off', auth, toggleOff);

app.use(function(err, req, res, next) {
	if (err instanceof FlagAlreadyExistsError) {
		res.status(409).json('Error:' + err.toString());
	} else if (err instanceof InvalidFlagPropertyError) {
		res.status(400).json('Error:' + err.toString());
	} else {
		next(err);
	}
});

var port = process.env.PORT || 5050;

app.listen(port, function() {
	console.log('Listening on ' + port);
});
