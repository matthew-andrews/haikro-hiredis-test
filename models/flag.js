'use strict';
var InvalidFlagPropertyError = require('../errors/invalid-flag-property');


var validateName = function(name) {
	if (typeof name === 'string' && /^[a-z][0-9a-z]+$/i.test(name)) {
		return name;
	}
	throw new InvalidFlagPropertyError('`name` must be a camel case string containing only letters and numbers and beginning with a letter');
};

var validateDescription = function(description) {
	if (typeof description === 'string' && description.length > 19) {
		return description;
	}

	throw new InvalidFlagPropertyError('`description` must be a string at least 20 letters long');
};

var validateExpiry = function(expiry) {
	var d = new Date(expiry);
	if (isNaN(d.getTime()) || d.getTime() < (new Date()).getTime()) {
		throw new InvalidFlagPropertyError('`expiry` must be a valid datetime string for a future date');
	}
	return d.toISOString();
};

var validateState = function(state) {
	if (typeof state !== 'boolean') {
		throw new InvalidFlagPropertyError('`safeState` must be a boolean value');
	}
	return state;
};

function Flag(flag, allowState) {
	this.name = validateName(flag.name);
	this.description = validateDescription(flag.description);
	this.safeState = validateState(flag.safeState);
	this.expiry = validateExpiry(flag.expiry);
	if (allowState) {
		this.state = !!flag.state;
	} else {
		if (flag.state !== undefined) {
			throw new InvalidFlagPropertyError('`state` should not be set explicitly. It will automatically be given an initial state equal to `safeState`');
		}
		this.state = this.safeState;
	}
}

Flag.prototype.update = function(props) {
	if (props.name !== undefined) {
		throw new InvalidFlagPropertyError('`name` cannot be changed. If absolutely necessary create a new flag and delete this one');
	}
	if (props.description !== undefined) {
		this.description = validateDescription(props.description);
	}
	if (props.safeState !== undefined) {
		this.safeState = validateState(props.safeState);
	}
	if (props.expiry !== undefined) {
		this.expiry = validateExpiry(props.expiry);
	}
	if (props.state !== undefined) {
		throw new InvalidFlagPropertyError('`state` should not be set explicitly. It should be set using e.g. /production/flagName/on,  /production/flagName/off');
	}
};

Flag.prototype.isSwitchedOn = function() {
	return !!this.state;
};

Flag.prototype.isSwitchedOff = function() {
	return !!!this.state;
};

Flag.prototype.isPastSellByDate = function() {
	return (new Date() - this.expiry) > 0;
};

module.exports = Flag;
