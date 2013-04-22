//text/cache-manifest .manifest has to be returned from server to do offline stuff

HOST = null; // localhost
PORT = 8001;
var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require('querystring'),
    exec = require('child_process').exec;

var server = http.createServer(function (req, res) {

  if (req.method == 'GET') {
    // console.log("GET");
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);
    //console.log(filename);
    fs.exists(filename, function (exists) {
      if(!exists) {
        console.log("FILE NOT FOUND");
        res.writeHead(404, { "Content-Type": "text/plain"});
        res.end("Not Found");
      }
      fs.readFile(filename, function (err, data) {
          // console.log(filename);
          if(err) {
              console.log("ERROR READING FILE");
              return;
          }
          //javascript header check
          if(filename.indexOf('.html', filename.length - '.html'.length) !== -1){
              // console.log("HTML biiiaaatch");
              res.writeHead(200, {"Content-Type": "text/html"});
          }else if(filename.indexOf('.js', filename.length - '.js'.length) !== -1){
              // console.log('yay js');
              res.writeHead(200, {"Content-Type": "application/javascript"});
          }else if(filename.indexOf('.css', filename.length - '.css'.length) !== -1){
              // console.log("CSS");
              res.writeHead(200, {"Content-Type": "text/css"});
          }else{
              // console.log('none of the above files');
              // res.writeHead(500, {"Content-Type": "text/plain"});
              // res.end(err + "\n");
              res.writeHead(200);
          }

          // console.log("sdfsadf");
          // res.writeHead(200);
          res.write(data, "binary");
          res.end();
      });
    });
  }else if(req.method == 'POST'){
    // console.log("POST POST POST");
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {

      var POST = qs.parse(body);
      var obj = eval("(" + body + ")");

      console.log(obj);
      var rCMD = "res=\"hello from the browser\";";
      // console.log(rCMD);
      function puts(error, stdout, stderr) { sys.puts(stdout);}

      var cVal = obj.events[1].label;
      exec("osascript -e 'tell app \"R64\" to cmd \"res=\\\""+cVal+" is the label of the first segment\\\"\"'", puts);
    });

}
});
listen = function (port, host) {
  server.listen(port, host);
  sys.puts("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};
listen(Number(PORT), HOST);