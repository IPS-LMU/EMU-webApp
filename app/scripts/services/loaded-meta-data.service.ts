import * as angular from 'angular';

class loadedMetaDataService{
	private Validationservice;
	
	private uniqSessionList;
	private bundleList;
	private curBndl;
	private demoDbName;
	private rendOptBndlList; // render optimized bundle list
	
	constructor(Validationservice){
		this.Validationservice = Validationservice;
		
		this.uniqSessionList = [];
		this.bundleList = [];
		this.curBndl = {} as any;
		this.demoDbName = '';
		this.rendOptBndlList = {} as any; // render optimized bundle list
	}
	
	private genUniqSessionList(bndlList) {
		var sList = [];
		var fistSes;
		bndlList.forEach((bndl, idx) => {
			sList[bndl.session] = {
				'collapsed': true
			};
			if (idx === 0) {
				fistSes = bndl.session;
			}
		});
		// open fist session up 
		sList[fistSes].collapsed = false;
		return sList;
	}
	
	private genRendOptBndlList(bndlList) {
		bndlList.forEach((bndl) => {
			if (this.rendOptBndlList[bndl.session] === undefined) {
				this.rendOptBndlList[bndl.session] = [];
			}
			this.rendOptBndlList[bndl.session].push(bndl);
		});
		return this.rendOptBndlList;
	}
	///////////////
	// bundleList
	
	/**
	* setter for bundleList
	* @returns validation result for bundle list
	*/
	public setBundleList(bList) {
		// validate
		var validRes = this.Validationservice.validateJSO('bundleListSchema', bList);
		if (validRes === true) {
			// set
			this.bundleList = bList;
			// generate uniqSessionList
			this.uniqSessionList = this.genUniqSessionList(this.bundleList);
			// generate render optimized bundlList
			this.rendOptBndlList = this.genRendOptBndlList(this.bundleList);
		}
		return validRes;
	};
	
	/**
	* getter for bundleList
	*/
	public getBundleList () {
		return this.bundleList;
	};
	
	/**
	* getter for rendOptBndlList
	*/
	public getRendOptBndlList() {
		return this.rendOptBndlList;
	};
	
	///////////
	// curBndl 
	
	/**
	* getter curBndl
	*/
	public getCurBndl() {
		return this.curBndl;
	};
	
	/**
	* setter curBndl
	*/
	public setCurBndl(bndl) {
		this.curBndl = bndl;
	};
	
	/**
	* remove BndlComment
	*/
	public setBndlComment(comment, key, index) {
		this.rendOptBndlList[key][index].comment = comment;
	};
	
	/**
	* setter BndlFinished
	*/
	public setBndlFinished(finished, key, index) {
		this.rendOptBndlList[key][index].finishedEditing = finished;
	};
	
	
	/**
	* getter curBndl name
	*/
	public getCurBndlName() {
		return this.curBndl.name;
	};
	
	/**
	* setter curBndl name
	*/
	public setCurBndlName(name) {
		this.curBndl.name = name;
	};
	
	///////////
	// timeAnchors
	
	/**
	* setter timeAnchors
	*/
	public setTimeAnchors(timeAnchors) {
		this.curBndl.timeAnchors = timeAnchors;
	};
	
	
	
	//////////////
	// demoDbName
	
	/**
	* setter demoDbName
	*/
	public setDemoDbName(name) {
		this.demoDbName = name;
	};
	
	/**
	* getter demoDbName
	*/
	public getDemoDbName() {
		return this.demoDbName;
	};
	
	
	///////////////////
	// uniqSessionList
	
	/**
	*
	*/
	public toggleCollapseSession(session) {
		// console.log(session);
		if(this.uniqSessionList[session] === undefined) {
			this.uniqSessionList[session] = {};
		}
		this.uniqSessionList[session].collapsed = !this.uniqSessionList[session].collapsed;
		// close all other sessions
		Object.keys(this.uniqSessionList).forEach((key) => {
			if (key !== session) {
				this.uniqSessionList[key].collapsed = true;
			}
		});
	};
	
	public openCollapseSession(session) {
		// console.log(session);
		this.uniqSessionList[session] = {};
		this.uniqSessionList[session].collapsed = false;
		// close all other sessions
		Object.keys(this.uniqSessionList).forEach((key) => {
			if (key !== session) {
				this.uniqSessionList[key].collapsed = true;
			}
		});
	};
	
	/**
	*
	*/
	// this.updateCollapseSessionState = function (text) {
	// 	angular.forEach(this.getBundleList(), (bundle) => {
	// 		if (bundle.name.indexOf(text)) {
	// 			uniqSessionList[bundle.session].collapsed = false;
	// 		} else {
	// 			uniqSessionList[bundle.session].collapsed = true;
	// 		}
	// 	});
	// };
	
	/**
	*
	*/
	public getSessionCollapseState(session) {
		if(this.uniqSessionList[session] === undefined) {
			return undefined;
		}
		else {
			return this.uniqSessionList[session].collapsed;
		}
	};
	
	
	///////////////////
	// other functions
	
	/**
	* reset all private vals to init state
	*/
	public resetToInitState() {
		this.uniqSessionList = [];
		this.bundleList = [];
		this.curBndl = {};
		this.rendOptBndlList = {};
	};
	
	
}

/**
* @ngdoc service
* @name emuwebApp.loadedMetaDataService
* @description
* # loadedMetaDataService
* Service in the emuwebApp.
*/
angular.module('emuwebApp')
.service('loadedMetaDataService', loadedMetaDataService);