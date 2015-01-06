"use strict";
module.exports = InvalidFlagProperty;

function InvalidFlagProperty(err) {
	this._err = err;
}

InvalidFlagProperty.prototype.toString = function() {
	return this._err;
};
