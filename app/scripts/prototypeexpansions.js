'use strict';

ArrayBuffer.prototype.subarray = function (offset, length) {
	var sub = new ArrayBuffer(length);
	var subView = new Int8Array(sub);
	var thisView = new Int8Array(this);
	for (var i = 0; i < length; i++) {
		subView[i] = thisView[offset + i];
	}
	return sub;
};