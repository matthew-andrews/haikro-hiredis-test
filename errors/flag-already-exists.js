"use strict";
module.exports = FlagAlreadyExists;

function FlagAlreadyExists(err) {
	this._err = err;
}

FlagAlreadyExists.prototype.toString = function() {
	return this._err;
};
