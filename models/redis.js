/*jshint node:true*/
'use strict';

var redis = require('then-redis');

/**
 * Returns a single instance of a Redis client for use in other modules.
 */
module.exports = function() {

	var auth = 'redis://localhost:6379';

	if (process.env.REDISTOGO_URL) {
		auth = process.env.REDISTOGO_URL;
	}

	return redis.createClient(auth);

};
