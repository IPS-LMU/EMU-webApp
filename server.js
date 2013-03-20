HOST = null; // localhost
PORT = 8001;
var sys = require("sys"),  
    http = require("http"),  
    url = require("url"),  
    path = require("path"),  
    fs = require("fs");
var server = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname; 
  var filename = path.join(process.cwd(), uri);  
  fs.exists(filename, function (exists) { 
    if(!exists) {  
      res.writeHead(404, { "Content-Type": "text/plain"});
      res.end("Not Found");
    }
    fs.readFile(filename, function (err, data) {    
        if(err) {  
            res.writeHead(500, {"Content-Type": "text/plain"});  
            res.end(err + "\n");    
            return;
        }
        res.writeHead(200); 
        res.write(data, "binary");
        res.end();
    });
  });
});
listen = function (port, host) {
  server.listen(port, host);
  sys.puts("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};
listen(Number(PORT), HOST);