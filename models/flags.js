'use strict';

var Flag = require('./flag');
var util = require('util');
var redis = require('./redis');
var db = redis();
var _ = require('lodash');
var util= require('util');
var format = util.format;
var FlagAlreadyExistsError = require('../errors/flag-already-exists');

var EventEmitter = require('events').EventEmitter;

require('es6-promise').polyfill();

/**
 * Represents a set of flags
 */
function Flags(namespace) {
	this.namespace = namespace;
}

util.inherits(Flags, EventEmitter);

/**
 * Retrieve all flags associated with a namespace
 */
Flags.prototype.get = function() {
	return db.get(this.namespace).then(function(flags) {
		if (flags) {
			flags = JSON.parse(flags);
			if (flags instanceof Array) {
				flags = {
					inherits: null,
					flags: flags
				};
			}
			return flags;
		}
		return {
			inherits: null,
			flags: []
		};
	});
};

/**
 * Persist the flags
 */
Flags.prototype.store = function(value) {
	db.set(this.namespace, JSON.stringify(value));
};

/**
 * Delete a flag
 */
Flags.prototype.delete = function(flag) {
	return this.get().then(function(flagset) {
		flagset.flags = _.filter(flagset.flags, function(item) {
			return (item.name !== flag);
		});
		this.store(flagset);
		return flagset;
	}.bind(this));
};

/**
 * Create a new flag
 */
Flags.prototype.create = function(data) {
	return this.get().then(function(flagset) {
		if (flagset.flags.some(function(flag) {
			return flag.name.toLowerCase() === data.name.toLowerCase();
		})) {
			throw new FlagAlreadyExistsError(format('A flag with the name %s (or maybe the same but with different capitalisation) already exists. Please choose a new name', data.name));
		}
		var flag = new Flag(data);
		flagset.flags.push(flag);
		this.store(flagset);
		this.emit('create', flag);
		return flag;
	}.bind(this), function(err) {
		setTimeout(function() {
			throw err;
		});
	});
};

/**
 * edit a flag
 */
Flags.prototype.update = function(name, data) {
	return this.get().then(function(flagset) {
		if (!name) {
			throw new Error(format('To edit a flag you must provide its name in the url e.g. /flagset/flagName', name));
		}
		var flagIndex;
		var flag = flagset.flags.filter(function(flag, index) {
			if (flag.name === name) {
				flagIndex = index;
				return true;
			}
		})[0];

		if (!flag) {
			throw new Error(format('No flag with the name %s exists', name));
		}
		flag = new Flag(flag, true);
		flag.update(data);
		flagset.flags.splice(flagIndex, 1, flag);
		this.store(flagset);
		this.emit('update', flag);
		return flag;
	}.bind(this));
};

/**
 * Update an existing flag
 */
Flags.prototype.toggle = function(name, state) {
	return this.get().then(function(flagset) {
		if (!name) {
			throw new Error(format('To edit a flag you must provide its name in the url e.g. /flagset/flagName', name));
		}
		var flagIndex;
		var flag = flagset.flags.filter(function(flag, index) {
			if (flag.name === name) {
				flagIndex = index;
				return true;
			}
		})[0];

		if (!flag) {
			throw new Error(format('No flag with the name %s exists', name));
		}

		flag.state = state;

		this.store(flagset);
		this.emit('toggle', flag);
		return flagset;
	}.bind(this));
};

module.exports = Flags;
