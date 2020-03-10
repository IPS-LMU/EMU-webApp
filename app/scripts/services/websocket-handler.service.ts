import * as angular from 'angular';

class Websockethandler{
	private $q;
	private $rootScope;
	private $location;
	private $timeout;
	private HistoryService;
	private Ssffparserservice;
	private ConfigProviderService;
	private viewState;
	private Wavparserservice;
	private Soundhandlerservice
	private Espsparserservice;
	private uuid;
	private Binarydatamaniphelper;
	private Ssffdataservice;
	private modalService;
	
	// Keep all pending requests here until they get responses
	private callbacks;
	
	// empty promise object to be resolved when connection is up
	private conPromise;
	
	private connected;
	
	// Create our websocket object with the address to the websocket
	public ws;

	constructor($q, $rootScope, $location, $timeout, HistoryService, Ssffparserservice, ConfigProviderService, viewState, Wavparserservice, Soundhandlerservice, Espsparserservice, uuid, Binarydatamaniphelper, Ssffdataservice, modalService){
		this.$q = $q;
		this.$rootScope = $rootScope;
		this.$location = $location;
		this.$timeout = $timeout;
		this.HistoryService = HistoryService;
		this.Ssffparserservice = Ssffparserservice;
		this.ConfigProviderService = ConfigProviderService;
		this.viewState = viewState;
		this.Wavparserservice = Wavparserservice;
		this.Soundhandlerservice = Soundhandlerservice;
		this.Espsparserservice = Espsparserservice;
		this.uuid = uuid;
		this.Binarydatamaniphelper = Binarydatamaniphelper;
		this.Ssffdataservice = Ssffdataservice;
		this.modalService = modalService;
		
		// Keep all pending requests here until they get responses
		this.callbacks = {} as any;
		
		// empty promise object to be resolved when connection is up
		this.conPromise = {} as any;
		
		this.connected = false;
		
		// Create our websocket object with the address to the websocket
		this.ws = {} as any;
		
	}
	
	
	////////////////////////////
	// ws function
	
	private listener(data) {
		var messageObj = data;
		// console.log('Received data from websocket: ', messageObj);
		// If an object exists with callbackID in our callbacks object, resolve it
		if (this.callbacks.hasOwnProperty(messageObj.callbackID)) {
			// console.log(callbacks[messageObj.callbackID]);
			// console.log('resolving callback: ' + messageObj.type + ' Nr.: ' + messageObj.callbackID);
			switch (messageObj.type) {
				case 'getESPSfile':
				alert('espsfile');
				//handleReceivedESPS(messageObj.fileName, messageObj.data);
				break;
				case 'getSSFFfile':
				alert('ssfffile');
				//handleReceivedSSFF(messageObj.fileName, messageObj.data);
				break;
			}
			
			// resolve promise with data only
			if (messageObj.status.type === 'SUCCESS') {
				this.$rootScope.$apply(this.callbacks[messageObj.callbackID].cb.resolve(messageObj.data));
			} else {
				// show protocol error and disconnect from server
				this.closeConnect();
				this.$rootScope.$broadcast('resetToInitState');
				this.$rootScope.$apply(this.modalService.open('views/error.html', 'Communication error with server! Error message is: ' + messageObj.status.message));
			}
			
			delete this.callbacks[messageObj.callbackID];
		} else {
			if(typeof messageObj.status === 'undefined'){
				this.modalService.open('views/error.html', 'Just got JSON message from server that the EMU-webApp does not know how to deal with! This is not allowed!');
			}
			else if (messageObj.status.type === 'ERROR:TIMEOUT') {
				// do nothing
			} else {
				this.modalService.open('views/error.html', 'Received invalid messageObj.callbackID that could not be resolved to a request! This should not happen and indicates a bad server response! The invalid callbackID was: ' + messageObj.callbackID);
			}
		}
	}
	
	// This creates a new callback ID for a request
	private getCallbackId() {
		var newUUID = this.uuid.new();
		return newUUID;
	}
	
	// broadcast on open
	private wsonopen(message) {
		this.connected = true;
		this.$rootScope.$apply(this.conPromise.resolve(message));
	}
	
	private wsonmessage(message) {
		try{
			var jsonMessage = angular.fromJson(message.data);
			this.listener(jsonMessage);
		}catch(e){
			this.modalService.open('views/error.html', 'Got non-JSON string as message from server! This is not allowed! The message was: ' + message.data + ' which caused the angular.fromJson error: ' + e).then(() => {
				this.closeConnect();
				this.$rootScope.$broadcast('resetToInitState');
			});
			
		}
	}
	
	private wsonerror(message) {
		console.error('WEBSOCKET ERROR!!!!!');
		this.$rootScope.$apply(this.conPromise.resolve(message));
	}
	
	private wsonclose(message) {
		if (!message.wasClean && this.connected) {
			this.modalService.open('views/error.html', 'A non clean disconnect to the server occurred! This probably means that the server is down. Please check the server and reconnect!').then(() => {
				this.$rootScope.$broadcast('connectionDisrupted');
			});
		}
		this.connected = false;
		// console.log('WEBSOCKET closed!!!!!');
	}
	
	private sendRequest(request) {
		var defer = this.$q.defer();
		var callbackId = this.getCallbackId();
		this.callbacks[callbackId] = {
			time: new Date(),
			cb: defer
		};
		request.callbackID = callbackId;
		this.ws.send(angular.toJson(request));
		// timeout request if not answered
		this.$timeout(() => {
			var tOutResp = {
				'callbackID': callbackId,
				'status': {
					'type': 'ERROR:TIMEOUT',
					'message': 'Sent request of type: ' + request.type + ' timed out after ' + this.ConfigProviderService.vals.main.serverTimeoutInterval + 'ms!  Please check the server...'
				}
			};
			this.listener(tOutResp);
		}, this.ConfigProviderService.vals.main.serverTimeoutInterval);
		
		return defer.promise;
	}
	
	
	///////////////////////////////////////////
	// public api
	public initConnect (url) {
		var defer = this.$q.defer();
		try{
			this.ws = new WebSocket(url);
			this.ws.onopen = this.wsonopen.bind(this);
			this.ws.onmessage = this.wsonmessage.bind(this);
			this.ws.onerror = this.wsonerror.bind(this);
			this.ws.onclose = this.wsonclose.bind(this);
		}catch (err){
			return this.$q.reject('A malformed websocket URL that does not start with ws:// or wss:// was provided.');
		}
		
		this.conPromise = defer;
		return defer.promise;
	};
	
	//
	public isConnected () {
		return this.connected;
	};
	
	// close connection with ws
	public closeConnect() {
		if (this.isConnected()) {
			this.ws.onclose = function () {
			};
			this.ws.close();
		}
		else {
			// console.log('WEBSOCKET ERROR: was not connected!');
		}
	};
	
	////////////////////////////
	// EMU-webApp protocol begins here
	//
	
	// ws getProtocol
	public getProtocol() {
		var request = {
			type: 'GETPROTOCOL'
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	// ws getProtocol
	public getDoUserManagement() {
		var request = {
			type: 'GETDOUSERMANAGEMENT'
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	// ws logOnUser
	public logOnUser(name, pwd) {
		var request = {
			type: 'LOGONUSER',
			userName: name,
			pwd: pwd
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	// ws getConfigFile
	public getDBconfigFile() {
		var request = {
			type: 'GETGLOBALDBCONFIG'
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	// ws getBundleList
	public getBundleList() {
		var request = {
			type: 'GETBUNDLELIST'
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	// ws  getBundle
	public getBundle(name, session) {
		
		var request = {
			type: 'GETBUNDLE',
			name: name,
			session: session
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	// ws  saveBundle
	public saveBundle(bundleData) {
		
		var request = {
			type: 'SAVEBUNDLE',
			data: bundleData
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	// ws  saveConfiguration
	public saveConfiguration(configData) {
		
		var request = {
			type: 'SAVEDBCONFIG',
			data: configData
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};		
	
	
	// ws  disconnecting
	public disconnectWarning() {
		var request = {
			type: 'DISCONNECTWARNING'
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	
	// ws  GetDoEditDBConfig
	public getDoEditDBConfig() {
		var request = {
			type: 'GETDOEDITDBCONFIG'
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	
	// ws  editDBConfig with subtype and data
	public editDBConfig(subtype, data) {
		var request = {
			type: 'EDITDBCONFIG',
			subtype: subtype,
			data: data
		};
		// Storing in a variable for clarity on what sendRequest returns
		var promise = this.sendRequest(request);
		return promise;
	};
	
	//
	// EMU-webApp protocol ends here
	////////////////////////////
}

angular.module('emuwebApp')
.service('Websockethandler', Websockethandler);