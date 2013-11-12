/**
small static file webserver aimed at fomant correction purposes...

@author Raphael Winkelmann
*/

// require needed modules
var b64 = require("base64-arraybuffer");
var open = require('open');
var sys = require("sys"),
	my_http = require("http"),
	path = require("path"),
	url = require("url"),
	filesys = require("fs");

var path2webApp = "../app/";


my_http.createServer(function(request, response) {
	if (request.method === 'POST') {
		console.log('################ new POST request ##################');

		var body = '';
		request.on('data', function(data) {
			body += data;
		});
		request.on('end', function() {

			var POST = JSON.parse(body);

			if (POST.method === 'saveUttList') {
				var outputFilename = path2webApp + 'testData/' + POST.username + '.json';

				filesys.writeFile(outputFilename, JSON.stringify(POST.data, null, 2), function(err) {
					if (err) {
						console.log('ERROR while saving uttList')
						console.log(err);
					} else {
						console.log("uttList saved");
						response.writeHeader(204);
						response.end();
					}
				});
			}
			if (POST.method === 'saveSSFFfile') {
				console.log(POST.data.length);
				// var binData = toBuffer(POST.data);
				// var arrBuf = THREE.Base64.toArrayBuffer(POST.data);
				// console.log(binData);
				// arrBuf = b64.decode(POST.data);

				var view = new Buffer(POST.data, 'base64');
				console.log(view);
				filesys.writeFile('/Users/raphaelwinkelmann/Desktop/node.fms', view, function(err) {
					if (err) {
						console.log('ERROR while saving uttList')
						console.log(err);
					} else {
						console.log("ssffFile saved");
						response.writeHeader(204);
						response.end();
					}
				});
			}

		});

	} else {
		var curUrl = url.parse(request.url, true);
		var my_path = url.parse(request.url).pathname;
		var full_path = path.join(path2webApp, my_path);
		console.log(full_path)

		filesys.exists(full_path, function(exists) {
			if (!exists) {
				response.writeHeader(404, {
					"Content-Type": "text/plain"
				});
				response.write("404 Not Found\n");
				response.end();
			} else {
				if (request.url === '/') {
					my_path = url.parse(request.url + 'index.html').pathname;
					full_path = path.join(path2webApp, my_path);
				}
				filesys.readFile(full_path, "binary", function(err, file) {
					if (err) {
						response.writeHeader(500, {
							"Content-Type": "text/plain"
						});
						response.write(err + "\n");
						response.end();

					} else {
						var splPath = full_path.split('.');
						var ext = splPath[splPath.length - 1];
						// console.log(ext);
						switch (ext) {
							case 'js':
								response.writeHeader(200, {
									"Content-Type": "text/javascript"
								});
								response.write(file, "binary");
								break;
							case 'css':
								response.writeHeader(200, {
									"Content-Type": "text/css"
								});
								response.write(file, "binary");
								break;

							default:
								response.writeHeader(200);
								response.write(file, "binary");

						}
						response.end();
					}

				});
			}
		});
	}
}).listen(8080);
sys.puts("Server Running on 8080");


// open('/http://localhostfdsgh8080/index.html');