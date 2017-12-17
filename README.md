 ### JsJsoup
JsJsoup 是一款javascript 的HTML解析器，可直接解析 \HTML文本内容。它提供了一套非常省力的API，可通过DOM的操作方法来取出和操作数据。

### 解析和遍历一个HTML文档
```javascript
   var  html = "<html><head><title>First parse</title></head>"
 + "<body><p>Parsed HTML into a doc.</p></body></html>";
  
    var jsDocument = jsoup.parseDocument(html);
```
jsDocument继承Element。一旦你得到jSDocument，你可以调用它相关的方法获取Element，或者Elements元素集合。
### Element的主要属性及方法
 +  node 当前元素的子节点，类型：[]
 + attrs 当前元素的属性集合，类型：{}。把一个元素的所有属性值都存放到此对象中，如class，style，id ,src等。
 + tag 当前元素的标签名。如'div'。
 + comment html元素的注释
 + eleText html元素的文本值
 +  getElementById（id）:通过id获取元素，返回是唯一的Element。
 + text（）：获取当前元素的文本值。
 + html（）：获取当前元素及其子元素的HTML片段。
 + getAttr（key）:获取当前元素的以key为键的属性值。
 + getAllElements（this）:获取当前元素及其所有的子元素，返回是Elements。
 + getElementsByTag（tag）:获取元素集合通过tag名，返回是Elements。
 

