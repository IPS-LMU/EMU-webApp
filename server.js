//text/cache-manifest .manifest has to be returned from server to do offline stuff

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
  //console.log(filename);
  fs.exists(filename, function (exists) {
    if(!exists) {
      res.writeHead(404, { "Content-Type": "text/plain"});
      res.end("Not Found");
    }
    fs.readFile(filename, function (err, data) {
        if(err) {
          //javascript header check
          if(filename.indexOf('.js', filename.length - '.js'.length) !== -1){
            //console.log('yay js');
            res.writeHead(500, {"Content-Type": "text/javascript"});
            res.end(err + "\n");
          }else{
            //console.log('nay js');
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.end(err + "\n");
          }
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