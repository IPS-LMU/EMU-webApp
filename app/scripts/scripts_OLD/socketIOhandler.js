sIOrequest =function(c){
	this.PROTOCOL='emu';
	this.CMD_REQ_UTTERANCES='req_utterances';
	this.protocol=this.PROTOCOL;
	this.cmd=c;
}
EmuLabeller.socketIOhandler = {

    init: function () {
        my = this;
        console.log("init sockets");
        this.DEFAULT_WS_URI="ws://localhost:7681/";
        this.wsUri = this.DEFAULT_WS_URI;
        this.retryInterval=10000;
        var db=$('#cmd_disconnect');
        db.css("display","inline"),
        db.css("visibility","visible");
        db.attr("disabled", "disabled");
        
        //this.privF=function(){
        //   this.onOpen=function(evt){
        //   console.log("ON OPEN");
           // this.stopTryConnect();
           // if(this.connectHandler){
           	   // this.connectHandler(evt);
           // } 
           // 
           // $('#cmd_disconnect').removeAttr("disabled"); 
           // var r=new sIOrequest('req_utterances');
	   // this.sendRequest(r);
	  // };
        // };
        // this.priv=new this.privF();
       
    },

    onConnect: function(ch){
    	this.connectHandler=ch;
    },
    
    onUtteranceList: function(eventHandler){
    	this.utteranceListHandler=eventHandler;	    
    },
    onDataLoad: function(eventHandler){
    	this.dataLoadHandler=eventHandler;	    
    },
    onDisconnect: function(dh){
    	this.disconnectHandler=dh;
    },
    startTryConnect: function(){
    	    var my=this;
    	  
    	     var d=$("#startupDialog");
    		    d.css('top','50%');
    		    d.css('opacity','1');
    		    d.css('visibility','visible');
    		    $("#cmd_cancelWebsocketWait").click(function(){
    		    	my.stopTryConnect();	    
    		    	my.hideModalDialog();
    		    }
    		    );
    		 this.connect();   
     //my.retryId=window.setInterval((function(self) {
    //	 return function() {
      //       self.connect();
       //  }
        // })(my),my.retryInterval);
    },
    
   hideModalDialog: function(){
    		var d=$("#startupDialog");
    		    d.css('top','50%');
    		    d.css('opacity','0');
    		    d.css('visibility','hidden');    
    },
    
    stopTryConnect: function(){
    	//window.clearInterval(this.retryId);
    	window.clearTimeout(this.retryId);
    	this.hideModalDialog();
    },
    
    
    connect: function(){
    	var my=this;
    	websocket = new WebSocket(my.wsUri);
       // websocket.onopen = function(evt) { my.priv.onOpen.call(my,evt); };
       websocket.onopen = function(evt) { my.onOpen(evt); };
        websocket.onclose = function(evt) { my.onClose(evt); };
        websocket.onmessage = function(evt) { my.onMessage(evt); };
        websocket.onerror = function(evt) { my.onError(evt); };
        
        console.log("try connect sockets"); 
        var disconnectButt=$('#cmd_disconnect');
    	disconnectButt.attr("disabled", "disabled");
    	   
    },
    
    
    requestDisconnect: function(){
    	    var r=new sIOrequest('disconnect');
    	    this.sendRequest(r);
    },
    
    onOpen: function(evt){
   	   console.log("ON OPEN");
           this.stopTryConnect();
           if(this.connectHandler){
           	   this.connectHandler(evt);
           } 
           
           $('#cmd_disconnect').removeAttr("disabled"); 
           var r=new sIOrequest('req_utterances');
	   this.sendRequest(r);
	   
    },
        
    onClose: function(evt){
    	$('#cmd_disconnect').attr("disabled", "disabled");
    	if(this.disconnectHandler){
    		this.disconnectHandler(evt);
    	}
        console.log("ON CLOSE");
        my.retryId=window.setTimeout((function(self) {
    	 return function() {
             self.connect();
         }
         })(my),my.retryInterval);
    },

    onMessage: function(evt){
    	    
    	var dType=typeof evt.data;
    	if(dType === 'string'){
    	console.log("ON MESSAGE");
        
        var response=JSON.parse(evt.data);
        var responseContent=response.responseContent;
        
        if(responseContent === 'utterance_list'){
        	
        var ul=response.data;
        console.log("Received utterance list:\n",ul);
        if(this.utteranceListHandler){
         this.utteranceListHandler(ul);
        }
        }else if(responseContent === 'audio'){
        	
           // var audioData=window.atob(response.data);
           var audioData=Base64Binary.decodeArrayBuffer(response.data);
           this.dataLoadHandler(0,audioData);
        }else if(responseContent === 'textGrid'){
        	
           
        //   var tgAsString=Base64Binary.decode(response.data);
         //  for (var i=0; i<unitArr.byteLength; i++) {
          //  myString += String.fromCharCode(unitArr[i])
       // }
       	var tgAsString=atob(response.data);
           this.dataLoadHandler(3,tgAsString);
        }
        }else{
        	console.log("ON MESSAGE with binary message (ERROR we do not use binary wrbsocket mode)");
        }
    },

    onError: function(evt){
    	var my=this;
        console.log("ON ERROR",evt);
    },
    doSend: function(message){
        websocket.send(message);
    },
    
    sendRequest: function(request){
    	var reqJSON=JSON.stringify(request);
	console.log("Sending: "+reqJSON);
	this.doSend(reqJSON);
    },
    
    loadUtterance: function(uttCode){
    	    // TODO load audio for now
    	 var r=new sIOrequest('req_audio');
    	 r.code=uttCode;
    	 this.sendRequest(r);
    }
    
    

};