var fs = require("fs");

var Jsoup = require('../JsJsoup');
var jsoup = new Jsoup();

var express = require('express');
var app = express();
//http get请求
app.get('/test', function (req, res) {    
    var data = fs.readFileSync('tt.html');
    
    var content = data.toString();
    var jsDocument = jsoup.parseDocument(content);
    console.log(jsDocument.html());
});

var server = app.listen(8080, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
