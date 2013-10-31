'use strict';

angular.module('emulvcApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice) {
		// shared service object
		var sServObj = {};

		/**
		 *
		 */
		sServObj.httpGetLabelJson = function(filePath) {
			$http.get(filePath).success(function(data) {
				console.log(data);
				$rootScope.$broadcast('newlyLoadedLabelJson', data);
			});
		};

		/**
		 * 
		 */
		sServObj.httpGetTextGrid = function(filePath) {
			$http.get(filePath).success(function(data) {
				var labelJSO = Textgridparserservice.toJSO(data)
				// console.log(labelJSO);
				$rootScope.$broadcast('newlyLoadedLabelJson', labelJSO);
			});
		};

		/**
		 *
		 */
		sServObj.httpGetAudioFile = function(filePath) {
			// var my = this;
			$http.get(filePath, {
				responseType: 'arraybuffer'
			}).success(function(data) {
				var wavJSO = Wavparserservice.wav2jso(data);
				$rootScope.$broadcast('newlyLoadedAudioFile', wavJSO, filePath.replace(/^.*[\\\/]/, ''));
			}).
			error(function(data, status) {
				console.log('Request failed with status: ' + status);
			});
		};
		
		sServObj.findTimeOfMinSample = function() {
		    return 0.000000; // maybe needed at some point...
		};
		
		sServObj.findTimeOfMaxSample = function() {
		    return viewState.curViewPort.bufferLength / Soundhandlerservice.wavJSO.SampleRate;
		};

		/**
		 *
		 */
		sServObj.httpGetSSFFfile = function(filePath) {
			$http.get(filePath, {
				responseType: 'arraybuffer'
			}).success(function(data) {
				var ssffJso = Ssffparserservice.ssff2jso(data);
				ssffJso.fileURL = document.URL + filePath;
				$rootScope.$broadcast('newlyLoadedSSFFfile', ssffJso, filePath.replace(/^.*[\\\/]/, ''));
			});
		};
		
		/**
		* converts the internal tiers format returned from tierHandler.getTiers
		* to a string containing a TextGrid file
		*/
		sServObj.TextGrid = function(tiers) {
            var l1 = "File type = \"ooTextFile\"";
            var l2 = "Object class = \"TextGrid\"";
            var tG = "";
            var nl = "\n";
            var t = "\t";

            // writing header infos
            tG = tG + l1 + nl + l2 + nl + nl;
            tG = tG + "xmin = " + sServObj.findTimeOfMinSample() + nl;
            tG = tG + "xmax = " + sServObj.findTimeOfMaxSample() + nl;
            tG = tG + "tiers? <exists>" + nl;
            tG = tG + "size = " + $('#HandletiersCtrl').scope().getTierLength() + nl;
            tG = tG + "item []:" + nl;
            var tierNr = 0;
            $("#HandletiersCtrl tier").each(function(index) {
                var curTier = $('#HandletiersCtrl').scope().getTier($(this).attr("id"));
                //write tier items
                tierNr = tierNr + 1;
                tG = tG + t + "item [" + tierNr + "]:" + nl;
                if (curTier.type == "seg") {
                    tG = tG + t + t + 'class = "IntervalTier"' + nl;
                } else if (curTier.type == "point") {
                    tG = tG + t + t + 'class = "TextTier"' + nl;
                }
                tG = tG + t + t + 'name = "' + curTier.TierName + '"' + nl;
                tG = tG + t + t + "xmin = " + sServObj.findTimeOfMinSample() + nl;
                tG = tG + t + t + "xmax = " + sServObj.findTimeOfMaxSample() + nl;
                if (curTier.type == "seg") {
                    tG = tG + t + t + "intervals: size = " + curTier.events.length + nl;
                } else if (curTier.type == "point") {
                    tG = tG + t + t + "points: size = " + curTier.events.length + nl;
                }
                for (var j = 0; j < curTier.events.length; j++) {
                    var evtNr = j + 1;
                    if (curTier.type == "seg") {
                        tG = tG + t + t + t + "intervals [" + evtNr + "]:" + nl;
                        if (curTier.events[j].startSample !== 0) {
                            tG = tG + t + t + t + t + "xmin = " + ((curTier.events[j].startSample) / Soundhandlerservice.wavJSO.SampleRate + ((1 / Soundhandlerservice.wavJSO.SampleRate) / 2)) + nl;
                        } else {
                            tG = tG + t + t + t + t + "xmin = " + 0 + nl;
                        }
                        if (j < curTier.events.length - 1) {
                            tG = tG + t + t + t + t + "xmax = " + ((curTier.events[j].startSample + curTier.events[j].sampleDur + 1) / Soundhandlerservice.wavJSO.SampleRate + ((1 / Soundhandlerservice.wavJSO.SampleRate) / 2)) + nl;
                        } else {
                            tG = tG + t + t + t + t + "xmax = " + sServObj.findTimeOfMaxSample() + nl;
                        }
    
                        tG = tG + t + t + t + t + 'text = "' + curTier.events[j].label + '"' + nl;
                    } else if (curTier.type == "point") {
                        tG = tG + t + t + t + "points[" + evtNr + "]:" + nl;
                        tG = tG + t + t + t + t + "time = " + curTier.events[j].startSample / Soundhandlerservice.wavJSO.SampleRate + nl;
                        tG = tG + t + t + t + t + 'mark = "' + curTier.events[j].label + '"' + nl;
                    }
                }
            });
            return (tG);
    };	


		return sServObj;
	});    