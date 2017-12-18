var http = require('http');
var fs = require("fs");
var Jsoup = require('./JsJsoup');
var jsoup = new Jsoup();

var express = require('express');
var app = express();
 
app.get('/test', function (req, res) {

    var html = jsoup.parseDocumentByHttpGet('http://sc.chinaz.com/tag_tupian/maozuo_8.html').then(function(htmlStr){

        var jsDocument = jsoup.parseDocument(htmlStr);
        console.log(jsDocument.html());
        var containeEle = jsDocument.getElementById('container');
        var imgEles = containeEle.getElementsByTag('img');
        for (var i = 0;i < imgEles.length;i ++) {
            console.log(imgEles[i].getAttr('src2'));
        }
         debugger;
    });
   
    // var data = fs.readFileSync('tt.html');
    
    // var content = data.toString();
    // var jsDocument = jsoup.parseDocument(content);
   
    // var bodyEle = jsDocument.body();
    // var frameSetEle = bodyEle.getElementById('frameset1');
    // var frameChild = frameSetEle.children();
    // frameSetEle.addClass('hahah');
    // frameSetEle.attr('cols','34');
    // frameSetEle.attr('key','nnn');
    // console.log(frameSetEle.getAttr('cols'));
    // var actionEle = jsDocument.getElementsByAttribute('action');
    // console.log(jsDocument.html());
    // debugger;
    // console.log(jsDocument.title());
    // debugger;
    // console.log(jsDocument.text());
    // console.log(jsDocument.html());
    // var idEle = jsDocument.getElementById("id2");
    // debugger;
    // console.log(idEle.text());
    
    // var classEle = jsDocument.getElementsByClass('id1');
    res.send('Hello World');
})
 
var server = app.listen(8080, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})

// http.createServer(function (request, response) {
//     response.writeHead(200, {'Content-Type': 'text/plain'});

//    response.end('service started\n');
   

   
//     // debugger;
//     console.log('test');
	 
// }).listen(8888);

// 终端打印如下信息
//console.log('Server running at http://127.0.0.1:8888/');