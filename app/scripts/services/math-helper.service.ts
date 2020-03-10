import * as angular from 'angular';

class MathHelperService{
	
	constructor(){}
	
	/**
	* calculate the closest power of two that is
	* greater than the passed in number
	* @param num
	* @returns power of two value
	*/
	public calcClosestPowerOf2Gt(num) {
		var curExp = 0;
		
		while (Math.pow(2, curExp) < num) {
			curExp = curExp + 1;
		}
		
		return (Math.pow(2, curExp));
		
	};
	
	/**
	* round to n digits after decimal point
	* used to help display numbers with a given
	* precision
	* @param x number
	* @param n digits after decimal point
	* @returns rounded number
	*/
	public roundToNdigitsAfterDecPoint(x, n) {
		if (n < 1 || n > 14) {
			console.error('error in call of round function!!');
		}
		var e = Math.pow(10, n);
		var k = (Math.round(x * e) / e).toString();
		if (k.indexOf('.') === -1) {
			k += '.';
		}
		k += e.toString().substring(1);
		return parseFloat(k.substring(0, k.indexOf('.') + n + 1));
	};
	
	
}

/**
* @ngdoc service
* @name emuwebApp.mathHelperService
* @description
* # mathHelperService
* Service in the emuwebApp.
*/
angular.module('emuwebApp')
.service('MathHelperService', MathHelperService)