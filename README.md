### JsJsoup
JsJsoup 是一款javascript 的HTML解析器，可直接解析某个URL地址、HTML文本内容。它提供了一套非常省力的API，可通过DOM，CSS以及类似于jQuery的操作方法来取出和操作数据。

### 解析和遍历一个HTML文档
```javascript
   var  html = "<html><head><title>First parse</title></head>"
  + "<body><p>Parsed HTML into a doc.</p></body></html>";
  
    var jsDocument = jsoup.parseDocument(html);
```
### 主要包括一些API

