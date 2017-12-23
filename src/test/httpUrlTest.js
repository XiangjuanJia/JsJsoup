var http = require('request-promise'); 

var Jsoup = require('../JsJsoup');
var jsoup = new Jsoup();

var express = require('express');
var app = express();
//http get请求
app.get('/test', function (req, res) {

    http('http://sc.chinaz.com/tag_tupian/maozuo_8.html').then(function(htmlStr){
         //dom 
        var jsDocument = jsoup.parseDocument(htmlStr);
        res.send(jsDocument.html());
        console.log(jsDocument.html());
        debugger;
    });
});

var server = app.listen(8080, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
