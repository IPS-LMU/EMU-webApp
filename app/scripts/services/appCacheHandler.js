'use strict';

angular.module('emulvcApp')
	.service('Appcachehandler', function Appcachehandler($http) {
		// shared service object
		var sServObj = {};

		var cacheProperties = {
			filesDownloaded: 0,
			totalFiles: 0
		};

		function getTotalFiles() {
			// First, reset the total file count and download count.
			cacheProperties.filesDownloaded = 0;
			cacheProperties.totalFiles = 0;

			$http.get('manifest.appcache').success(function (content) {
				console.log(content);
				content = content.replace(
					new RegExp(
						'(NETWORK|FALLBACK):' +
						'((?!(NETWORK|FALLBACK|CACHE):)[\\w\\W]*)',
						'gi'
					),
					''
				);

				// Strip out all comments.
				content = content.replace(
					new RegExp('#[^\\r\\n]*(\\r\\n?|\\n)', 'g'),
					''
				);

				// Strip out the cache manifest header and
				// trailing slashes.
				content = content.replace(
					new RegExp('CACHE MANIFEST\\s*|\\s*$', 'g'),
					''
				);

				// Strip out extra line breaks and replace with
				// a hash sign that we can break on.
				content = content.replace(
					new RegExp('[\\r\\n]+', 'g'),
					'#'
				);

				// Get the total number of files.
				var totalFiles = content.split('#').length;

				// Store the total number of files. Here, we are
				// adding one for *THIS* file, which is cached
				// implicitly as it points to the manifest.
				cacheProperties.totalFiles = (totalFiles + 1);
				console.log("##########################");
				alert(cacheProperties.totalFiles);
			});

		}

		function handleProgressEvent() {
			// console.log(e);
		}

		function handleDownloadingEvent(e) {
			getTotalFiles();
		}


		var appCache = window.applicationCache;

		// bind evts
		appCache.addEventListener('progress', handleProgressEvent, false);

		appCache.addEventListener('downloading', handleDownloadingEvent, false);

		// appCache.update();


		sServObj.checkForNewVersion = function () {
			console.log('check for new version');
		};

		return sServObj;
	});