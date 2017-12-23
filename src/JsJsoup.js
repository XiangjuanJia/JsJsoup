function Jsoup() {
	
	var http = require('request-promise'); 
	var fs = require("fs");
	

    //html默认的不需要关闭标签的元素 
	const INLINE_ELES = ['br','meta','hr','link','input','img','!DOCTYPE','frame','#text','#comment'];
	//html元素属性名
	const HTML_ARR_NAMES = ['accesskey','class','contenteditable','contextmenu','dir','draggable',
	'dropzone','hidden','lang','spellcheck','style','tabindex','title','translate','name','src','href','type','id'];

	//html单一属性名。就可以没有值
	const HTML_SINGLE_ARR = ['html','controls','autoplay']

	const HTML_ARR = {'class':[' '],'style':{},'id':'','title':'','style':'','name':'','src':'','href':'','type':'','coords':[','],
	'cols':[','],'rows':[','],'content':''};

	//html 顶级元素
	const TOP_ELE_NAME = '#root';

	//注释元素开始
	const COMMENT_TAG_STAR = '!--';
	const COMMENT_TAG_END = '--';

	//解析文档通过http的get请求
	this.parseDocumentFromHttpGet = function (url) {
		//get 请求外网  
		return http(url);

	};

	//解析html文档从文件中
	this.parseDocumentFromFile = function(fileName) {
		var data = fs.readFileSync(fileName);
		var content = data.toString();
		return this.parseDocument(content);
	};

    //解析文本文档
	this.parseDocument = function(documentStr) {
		var index = documentStr.indexOf("<");
		var end = documentStr.indexOf(">",index);
		//定义栈用来存放解析元素
		var stack = [];
		var headEmptyEle = createDocumentElement(TOP_ELE_NAME);
		//初始化栈
		stack.push(headEmptyEle);

        //html元素对象
		var element = {};

		while(index !== -1) {
			/**
			 * 处理不合法的html代码 如< div>hi<div>
			 * 要把< div>当做文本来处理
			*/
			if (documentStr.charAt(index+1) ===' ') {
				//存放Html元素的文本值
				var texts = [];

				texts.push(documentStr.substring(index,end+1));
				index = documentStr.indexOf("<",end);
				if (index !== -1) {
				    texts.push(documentStr.substring(end+1,index));
				}
				//更新元素的文本
				var topEle = stack[stack.length-1];
				var textStr = texts.join('').trim();
				topEle.eleText = topEle.eleText + textStr;

				//添加到文本节点中
				if (textStr !=='') {
					var textNode = createTextNode(textStr);
					textNode.pNode = topEle;
					topEle.node.push(textNode);
				}

				end = documentStr.indexOf(">",index);
				 
			}
			else {
				//合法的文本，创建数组传递索引
				var indexArr = [index];
				//处理文档中含有注释元素
				var commentStr = processComment(documentStr,indexArr);
				//含有元素注释
				if (commentStr !== '') {
					var topEle = stack[stack.length-1];
					topEle.node.push(createCommentNode(commentStr.trim()));
					 
					//更新结束位置
					end = indexArr[0];
					var text = "";
					//获取注释元素后的text文本
					index = documentStr.indexOf("<",end);
					if (index !== -1) {
						text = documentStr.substring(end+1,index);
						topEle.eleText = topEle.eleText + text;
						text = text.trim();
						if (text !=='') {
							var textNode = createTextNode(text);
							textNode.pNode = topEle;
							topEle.node.push(textNode);
						}
						
					}
					end = documentStr.indexOf(">",index);
				}
				//如果没有注释元素
				else {
				    /**
				     * 读取 <div id="di" >中的文本
				     * div id = "di" 
				     */
					var str = documentStr.substring(index+1,end);
					var text = "";
					index = documentStr.indexOf("<",end);
					if (index !== -1) {
						text = documentStr.substring(end+1,index);
					}
					//处理元素属性
					parseAttr(str,stack,text);
					end = documentStr.indexOf(">",index);
				}
				
			}
			
		}
		 //弹出栈顶元素
		 return stack.shift();
		  
	};

	//处理注释元素
	function processComment(documentStr,indexArr) {
		var index = indexArr[0];
		if (documentStr.length >= 3) {
			var beginStr = documentStr.substring(index +1,index+4);
			index = index + 4;
			var texts = [];
			 
			if (beginStr === COMMENT_TAG_STAR) {
				 
				for (var i = index;i < documentStr.length;i ++) {
					if (documentStr.charAt(i) ==='>') {
						if (texts.length >= 2) {
							var textLength = texts.length - 1;
							var end = texts[textLength]+texts[textLength-1];
							if (end === COMMENT_TAG_END) {
								texts.pop();
								texts.pop();
								indexArr[0] = i;
								return texts.join('');
							}
						}
						else {
							texts.push(documentStr.charAt(i));
						}
					}
					texts.push(documentStr.charAt(i));
				}

				return texts.join('');
			}
		}
		return '';
	};

	
    //创建空元素
	function createEmptyElement() {
		return _createElement('',' ','');
	};

	//创建文档元素
	function createDocumentElement(tag) {
		var ele = Object(_createElement(tag,'',''));
		ele.title = function() {
			return _title(this);
		};

		ele.body = function() {
			return _body(this);
		};
		//获取head元素
		ele.head = function() {
			return _head(this);
		};

		//设置文本的title值
		ele.setTitle = function(text) {
			return _setTitle(this,text);
		};

		//获取文档的charset值
		ele.charset = function() {
			return _charset(this);
		};

		//创建一个以tag为内容的标签
		ele.createElement = function(tag) {
			return _createElement(tag,'','');
		};

 
	   return ele;
	};

	//创建文本节点元素
	function createTextNode(textStr) {
		var ele =  _createElement('',' ','');
		ele.tag = '#text';
		ele.eleText = textStr;
		return ele;
	};

	//创建html文本注释元素
	function createCommentNode(textStr) {
		var ele = _createElement('','','');
		ele.tag = '#comment';
		ele.eleText = textStr;
		return ele;
	};
	//创建html的!doctype元素
	function createDocTypeNode(textStr) {
		var ele = _createElement('','','');
		ele.tag = '!DOCTYPE';
		ele.attrs[textStr] = null;
		return ele;
	};

	//创建元素
	 function _createElement(tag,text,attrStr) {
	 	var ele = {};
		ele.node = [];
		ele.attrs = {};
		//ele.class=[];
		ele.tag = tag.trim();
	  
		ele.eleText = text.trim();

		//当前元素的父节点
		ele.pNode = {};
		
		//通过id查询元素
		ele.getElementById = function(id) {
           return  _getElementById(id,this);
		};

        //获取当前元素的文本值
		ele.text = function () {
			return _text(this);
		};

        //获取此元素及其子元素的html
		ele.html = function() {
			return _html(this);
		};

		//获取当前元素的属性值
		ele.getAttr = function(key) {
			return _getAttr(this,key);
		};

		//获取当前元素的所有元素
		ele.getAllElements = function() {
			return _getAllElements(this);
		};
		//获取元素通过tag
		ele.getElementsByTag = function (tag) {
			return _getElementsByTag(this,tag);
		};

		//获取元素通过类名
		ele.getElementsByClass = function (className) {
			return _getElementsByClass(this,className);
		};

		//通过属性名获取元素
		ele.getElementsByAttribute = function(key) {
			return _getElementsByAttribute(this,key);
		};

		//给元素添加类名
		ele.addClass = function(className) {
			_addClass(this,className);
		};

		//设置元素的属性值
		ele.attr = function(key,value) {
			_attr(this,key,value);
		};

		//获取当前元素的子元素
		ele.children = function () {
			return _children(this);
		};

		//检测一个元素是否包含某个属性
		ele.hasAttr = function (key) {
			return _hasAttr(this,key);
		};
 
		generateEle(attrStr,ele);
	   return ele;
	};

	function _getElementById(id,node) {
		if (id === node.id) {
				return node;
		}
		else {
			var queue = [];
			queue.push(node);
			while (queue.length > 0) {
				var tempNode = queue.shift();
				var nodes = tempNode.node;
				for (var i = 0;i < nodes.length;i++) {
					if (nodes[i].attrs.hasOwnProperty('id')) {
						if (id === nodes[i].attrs['id']) {
							return nodes[i];
						}
					}
					queue.push(nodes[i]);
				}
			}
			return createEmptyElement();
		}
		
	};

	function _getElementsByTag(node,tag) {

		var elements = [];
		var stack = [];
		stack.push(node);
		while (stack.length > 0) {
			var tNode = stack.pop();
			if (tag === tNode.tag) {
			 	elements.push(tNode);
			}
			var nodes = tNode.node;
			for (var i = nodes.length-1;i >= 0;i--) {
				stack.push(nodes[i]);
			}
		}
		return elements;
	};

	function _getElementsByClass(node,className) {
		var elements = [];
		var stack = [];
		stack.push(node);
		while (stack.length > 0) {
			var tNode = stack.pop();
			if (tNode.attrs.hasOwnProperty('class')) {
				if (tNode.attrs['class'].contains(className)) {
					elements.push(tNode);
				}
			}
			 
			var nodes = tNode.node;
			for (var i = nodes.length-1;i >= 0;i--) {
				stack.push(nodes[i]);
			}
		}
		return elements;
	};

	//通过属性名获取元素
	function _getElementsByAttribute(node,key) {
		var elements = [];
		var stack = [];
		stack.push(node);
		while (stack.length > 0) {
			var tNode = stack.pop();
			if (tNode.attrs.hasOwnProperty(key)) {
				elements.push(tNode);
			}
			 
			var nodes = tNode.node;
			for (var i = nodes.length-1;i >= 0;i--) {
				stack.push(nodes[i]);
			}
		}
		return elements;
	};

	//元素的文本值
	function _text(node) {
		var result = [];
		var stack = [];
		stack.push(node);
		while (stack.length > 0) {
			var tNode = stack.pop();
			if (tNode.tag !=='#root') {
				if (tNode.tag ==='#text' && tNode.pNode.tag !=='style' && tNode.pNode.tag !=='script') {
					//过滤注释元素的文本
					if(tNode.tag !=='#comment') {
						result.push(tNode.eleText+' ');
						//debugger;
					}
					
				}
			}
			
			var nodes = tNode.node;
			for (var i = nodes.length-1;i >= 0;i--) {
				stack.push(nodes[i]);
			}
		}
		return  result.join('');
	};

	//设置文档的title值
	function _setTitle(node,text) {
		var titleEles = node.getElementsByTag('title');
		if (titleEles.length > 0) {
			titleEles[0].eleText = text;
		}
	};

	function _charset(node) {
		var metaEles = node.getElementsByTag('meta');
		for (var i = 0; i < metaEles.length; i++) {
			if (metaEles[i].hasAttr('charset')) {
				return metaEles[i].getAttr('charset');
			}
			else if (metaEles[i].hasAttr('content')) {
				var eleV = metaEles[i].getAttr('content');
				var index = eleV.indexOf(';');
				if (index !== -1) {
					var temV = eleV.split(';');
					var charsetV = temV[1];
					var equalIndex = charsetV.indexOf('=');
					if (equalIndex !== -1) {
						return charsetV.split('=')[1];
					}
				}
			}
		}
		return '';
	}

	function _html(node) {
		return _htmlRec(node,-1);
	};

    /**
     *递归的遍历Html元素。
     * level是元素的层级
     */
	function _htmlRec(ele,level) {
		var result = [];
		 
		var tag = ele.tag;
		var levelStr = _eleLevel(level);
		//解决内联元素
		if (isInline(tag)) {
			if (tag === '#text') {
				if (ele.eleText.trim() !=='') {
					result.push(levelStr);
					result.push(ele.eleText+'\n');
				}
			}
			else if (tag === '#comment') {
				result.push(levelStr);
				result.push('<!-- ');
				result.push(ele.eleText);
				result.push(' -->\n');
			}
			else {
				result.push(levelStr);
				result.push('<');
				result.push (ele.tag);
				if (tag.toUpperCase() ==='!DOCTYPE') {
					generateHtmlAttrStr(ele,result);
					result.push('>\n');
				}
				else {
					generateHtmlAttrStr(ele,result);
					result.push('>\n');
				}
			}
			
		} else if (tag === TOP_ELE_NAME) {
			//顶级根元素不作处理 #root
		} else {
			//处理块元素
			result.push(levelStr);
			result.push('<');
			result.push (ele.tag);
			generateHtmlAttrStr(ele,result);
			result.push('>\n');
		}

		var nodes = ele.node;
		level = level +1;
		 
		for (var i = 0;i< nodes.length;i++) {
			result.push(_htmlRec(nodes[i],level));
		}
		
		if (tag === TOP_ELE_NAME) {
			//顶级根元素不作处理
		}
	 
		//如果不是内联元素
		else if (!isInline(tag)) {
			// generateHtmlTextStr(ele,result,levelStr+'\t');
			result.push(levelStr + '</' + ele.tag +'>\n');
		}
		//console.log(result);
		return result.join('');
	};

    //获取标签文本
	function _title(node) {
		var queue = [];
		queue.push(node);
		while (queue.length > 0) {
			var tempNode = queue.shift();
			var nodes = tempNode.node;
			for (var i = 0;i < nodes.length;i++) {
				if (nodes[i].tag === 'title') {
					return nodes[i].eleText;
				}
				queue.push(nodes[i]);
			}
		}
	};

	function _addClass(node,className) {
		if (node.attrs.hasOwnProperty('class')) {
			node.attrs['class'].push(className);
		} else {
			var classS = [];
			classS.push(className);
			node.attrs['class'] = classS;
		}
	}

	//获取body元素
	function _body(node) {
		var bodys = node.getElementsByTag('body');
		if (bodys.length > 0) {
			return bodys[0];
		}
		return createEmptyElement();
	};

	//获取head元素
	function _head(node) {
		var bodys = node.getElementsByTag('head');
		if (bodys.length > 0) {
			return bodys[0];
		}
		return createEmptyElement();
	};

    //生成html属性字符串
	function generateHtmlAttrStr(node,result) {
		for (var key in node.attrs) {
			var attrV = node.attrs[key];

			//处理数组类型
			if (isArray(attrV) && attrV.length > 0) {
				var splitChar = HTML_ARR[key][0];
				result.push(' ');
				result.push(key);
				result.push('=');
				result.push('"');
				result.push(attrV.join(splitChar));
				result.push('"');
			} 

			//处理字符类型
			else if (isStr(attrV) && attrV !=='') {
				result.push(' ');
				result.push(key);
				result.push('=');
				result.push('"');
				result.push(attrV);
				result.push('"');
			}
			//处理对象类型
			else if (isObject(attrV)) {
				result.push(' ');
				result.push(key);
				result.push('=');
				result.push('"');
				for (var k in attrV) {
					result.push(k);
					result.push(': ');
					result.push(attrV[k]);
					result.push(";");
				}
				result.pop(';');
			}
			//处理单一属性
			else if (attrV === null) {
				result.push(' ');
				result.push(key);
			}
			
		}
	};

	 //生成html元素的文本字符串
	function generateHtmlTextStr(node,result,levelStr) {
		if (node.eleText !== '') {
			result.push(levelStr + node.eleText +'\n');
		}
	}

	function _eleLevel(v) {
		var result = [];
		for(var i= 0;i < v;i++) {
			result.push('\t');
		}
		return result.join('');
	}

	function _getAllElements(node) {
		var result = [];
		var stack = [];
		stack.push(node);
		while (stack.length > 0) {
			var tNode = stack.pop();
			result.push(tNode);
			var nodes = tNode.node;
			for (var i = nodes.length-1;i >= 0;i--) {
				stack.push(nodes[i]);
			}
		}
		return result;
	};

	function _getAttr(node,key) {
		if (node.attrs.hasOwnProperty(key)) {
			var nodeV = node.attrs[key];
			if (isArray(nodeV)) {
				var splitChar = HTML_ARR[key][0];
				return nodeV.join(splitChar);
			}
			else if (isObject(nodeV)) {
				var result = '';
				for (var key in nodeV) {
					result = result + key+':' + nodeV[key] + ';';
				}
				result = result.substring(0,result.length-1);
				return result;
			}
			return nodeV;
		}
	};

	function _hasAttr (node,key) {
		if (node.attrs.hasOwnProperty(key)) {
			return true;
		}
		return false;
	};

	//获取当前元素的子元素
	function _children(node) {
		return node.node;
	}

	//添加元素的属性简直对
	function _attr(node,key,value) {
		if (node.attrs.hasOwnProperty(key)) {
			var eleType = HTML_ARR[key];
			//处理数组
			if (isArray(eleType)) {
				if (!node.attrs[key].contains(value)) {
					node.attrs[key].push(value);
				}
			}
			//处理对象
			else if (isObject(eleType)) {
				//TODO
			}
			else {
				node.attrs[key] =value;
			}
		}
		else {
			var eleType = HTML_ARR[key];
			//处理数组
			if (isArray(eleType)) {
				var eleArrs = [];
				eleArrs.push(value);
				node.attrs[key] = eleArrs;
			}
			//处理对象
			else if (isObject(eleType)) {
				//TODO
			}
			else {
				node.attrs[key] =value;
			}
		}
	};

	 
	//解析属性
	function parseAttr(str,stack,text) {
		//处理单元素:如<br/> .<br>
		if (str !== null && str.charAt(str.length-1) ==='/') {
			str = str.substring(0,str.length-1);
			 
		}

		//处理元素的开始标签
		if (str.charAt(0) !== '/') {
			//以空字符串分隔
			var index = str.indexOf(' ');
			var start = 0;
			var element = {};
			var id = '';
			var tag = '';
			var attrStr = '';//属性字符串
			if (index !== -1) {
				tag = str.substring(start,index);
				attrStr = str.substring(index,str.length);
			} else {
				tag = str;
			}
			 
			if (tag ==='!DOCTYPE') {
				element = createDocTypeNode(attrStr);
				var tempNode = stack[stack.length-1];
				tempNode.node.push(element);
				//如果不是空元素，则压入栈顶
				if (!INLINE_ELES.contains(tag)) {
					stack.push(element);
				}
			}
			else {
				element =  _createElement(tag,text,attrStr);
				text = text.trim();
				if (text !=='') {
					var textNode = createTextNode(text);
					textNode.pNode = element;
					element.node.push(textNode);
				}
				var tempNode = stack[stack.length-1];
				element.pNode = tempNode;
				tempNode.node.push(element);
				//如果不是空元素，则压入栈顶
				if (!INLINE_ELES.contains(tag)) {
					stack.push(element);
				}
			}
			
		}

		//处理元素的结束标签
		 else {
			//存放结束标记符
			var tag = '';
			//判断结束标签里是否包含空字符
			var index = str.indexOf(' ');
			if (index !== -1) {
				tag = str.substring(0,index);
			}
			//说明html书写规范
			else {
				tag = str.substring(1,str.length);
				//console.log(tag);
			}
			var topEle = stack[stack.length-1];
			//console.log("top ele eleText is " + topEle.tag);
			//如果关闭标签匹配，则弹出元素
			//记录匹配元素的开始值
			var matchIndex = stack.length;
			for (var k = stack.length-1;k >= 0;k--) {
				if (stack[k].tag === tag) {
					matchIndex = k;
					break;
				}
			}
			
			//从匹配的元素开始依次弹出元素
			stack.splice(matchIndex,stack.length - matchIndex);
			//如果有text文本，则进行添加
			text = text.trim();
			if (text !=='') {
				var textNode = createTextNode(text);
				var ele = stack[stack.length-1];
				textNode.pNode = ele;
				ele.node.push(textNode);
			}
		}
	};

    //判断一个元素是否是内联元素
	function isInline(tag) {
		if (INLINE_ELES.contains(tag)) {
			return true;
		}
		return false;
	};

	function convertArrStr(arr) {
		var s = "";
		for (var i = 0;i < arr.length;i++) {
			s = s + arr[i];
		}
		return s;
	};

	Array.prototype.contains = function (obj) {  
	    var i = this.length;  
	    while (i--) {  
	        if (this[i] === obj) {  
	            return true;  
	        }  
	    }  
	    return false;  
    };

    function isObject(obj) {
    	if (Object.prototype.toString.call(obj)==='[object Object]') {
    		return true;
    	} else {
    		return false;
    	}
    };

    /**
    * 为元素赋值
      <audio controls muted>
      <input type=text>
      <input type='text' id = "text" >
      <input title = 'dd"sdfsf"' >
    */
    function generateEle(attrStr,element) {
    	 
    	//定义栈存放进出元素
    	var stack = [];
    	//值开始 
    	var vBeginValue = '';

    	var key = '';

    	for (var i = 0; i < attrStr.length ;i++) {
    		var char = attrStr[i];
    		if (char ==='=' && vBeginValue === '') {
    			//key结束，解析出key
    			key = stack.join('');
    			key = key.trim();
    			stack = [];
    			 
    		}
    		else if (char ==='"' || char ==="'") {
    			if (vBeginValue === '') {
    				vBeginValue = char;
    			} else if (vBeginValue === char) {
    				vBeginValue = '';
    				//值结束，解析出value;
    				value = stack.join('');
    				value = value.trim();
    				stack = [];
    				 
    				if (HTML_ARR.hasOwnProperty(key)) {
    					var eleV = HTML_ARR[key];
    					//处理普通字符串
    					if (isStr(eleV)) {
    						//element[key] = value; 
    						element.attrs[key] = value;
    						 
    					} else if (isArray(eleV)) {
    						element.attrs[key] = filterArr(value,eleV[0]);
    						//element[key] = filterArr(value);
    					} else if (isObject(eleV)) {
    						var obj = {};
    						var styleSplits = value.split(';');
							for (var k = 0;k < styleSplits.length;k ++) {
								var styleComma = styleSplits[k].split(':');
								obj[styleComma[0]] = styleComma[1].trim();
							}
							//element[key] = obj;
							element.attrs[key] = obj;
    					}
    				} else {
    					//所有的未知属性统一作为字符串处理
    					element.attrs[key] = value;
    					if (key === undefined) {
    						debugger;
    					}
    				}
    				// //回复到原始值
    				 key = '';
    			}
    			else {
    				stack.push(attrStr[i]);
    			}
    		}
    		else {
    			if (key !=='' && attrStr[i] ===' ' && vBeginValue === '') {
    				if (stack.join('').trim().length > 0) {
    					element.attrs[key] = stack.join('');
    					key = '';
    					stack = [];
    				}
    			}
    			else {
    				stack.push(attrStr[i]);
    			}
    			
    		}
    	}

        //处理没有引号的属性值
    	if (stack.length > 0) {
    		var v = stack.join('');
    		var vs = v.split(' ');
    		for (var i = 0;i < vs.length ;i ++) {
    			if (vs[i] !== '') {
    				element.attrs[vs[i]] = null;
    			}
    		}
    	}
    	//debugger;
    };

    /**
    *是否是数组
    */
    function isArray(attr) {
    	return attr instanceof Array;
    };

    /**
     * 是否是字符串
     */
    function isStr(attr) {
    	if (typeof attr ==='string') {
    		return true;
    	} else {
    		return false;
    	}
    };

    /**
     *移除空字符
    */
    function filterArr(eleV,splitChar) {
    	var values = eleV.split(splitChar);
    	var results = [];
    	for (var i = 0; i < values.length; i++) {
    		if(values[i] !== '') {
    			results.push(values[i]);
    		}
    	}
    	return results;
    };
    
};


//var jsoup = new Jsoup();
module.exports = Jsoup;