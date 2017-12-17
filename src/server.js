var http = require('http');
var fs = require("fs");
var Jsoup = require('./JsJsoup');
var jsoup = new Jsoup();

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\n');
   

    var data = fs.readFileSync('tt.html');
    debugger;
    var content = data.toString();
    var jsDocument = jsoup.parseDocument(content);
    debugger;
    console.log(jsDocument.text());
    console.log(jsDocument.html());
    var idEle = jsDocument.getElementById("id2");
    debugger;
    console.log(idEle.text());
    
    var classEle = jsDocument.getElementsByClass('id1');
    debugger;
	 
}).listen(8888);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');