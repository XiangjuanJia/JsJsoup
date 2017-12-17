function Jsoup() {
	 
    //html默认的空元素 
	const INLINE_ELES = ['br','meta','hr','link','input','img','!DOCTYPE'];
	//html元素属性名
	const HTML_ARR_NAMES = ['accesskey','class','contenteditable','contextmenu','dir','draggable',
	'dropzone','hidden','lang','spellcheck','style','tabindex','title','translate','name','src','href','type','id'];

	//html单一属性名。就可以没有值
	const HTML_SINGLE_ARR = ['html','controls','autoplay']

	const HTML_ARR = {'class':[' '],'style':{},'id':'','title':'','style':'','name':'','src':'','href':'','type':'','coords':[',']};

	//html 顶级元素
	const TOP_ELE_NAME = '#root';
	var test = 'var';
    //解析文本文档
	this.parseDocument=function(documentStr) {
		var index = documentStr.indexOf("<");
		var end = documentStr.indexOf(">",index);
		//定义栈用来存放解析元素
		var stack = [];
		var headEmptyEle = createElement("#root",'','');
		//初始化栈
		stack.push(headEmptyEle);

        //html元素对象
		var element = {};

		//存放Html元素的文本值
		var texts = [];
		while(index !== -1) {
			/**
			 * 处理不合法的html代码 如< div>hi<div>
			 * 要把< div>当做文本来处理
			*/
			if (documentStr.charAt(index+1) ===' ') {
				texts.push(documentStr.substring(index,end));
				index = documentStr.indexOf("<",end);
				if (index !== -1) {
				    texts.push(documentStr.substring(end+1,index));
				}
				//更新元素的文本
				var topEle = stack[stack.length-1];
				topEle.eleText = topEle.eleText + texts.join('');
				end = documentStr.indexOf(">",index);
			}
			else {
				var tag = documentStr.substring(index+1,end);
				var text = "";
				index = documentStr.indexOf("<",end);
				if (index !== -1) {
					text = documentStr.substring(end+1,index);
				}
				//处理元素属性
				parseAttr(tag,stack,text);
				end = documentStr.indexOf(">",index);
			}
			
		}
		 //弹出栈顶元素
		 return stack.shift();
		  
	};

	function createEmptyElement() {
		return createElement('',' ','');
	}

	//创建元素
	 function createElement(tag,text,attrStr) {
		var ele = {};
		ele.node = [];
		ele.attrs = {};
		//ele.class=[];
		ele.tag = tag.trim();
		//ele.style = {};
		ele.title = '';
		//ele.id = '';
		ele.comment = '';//html 代码注释
		ele.eleText = text.trim();
		
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
		ele.attr = function(key) {
			return _attr(this,key);
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


	function _text(node) {
		var result = [];
		var stack = [];
		stack.push(node);
		while (stack.length > 0) {
			var tNode = stack.pop();
			if (tNode.tag !=='style' && tNode.tag !=='script') {
				result.push(tNode.eleText+' ');
			}
			 
			var nodes = tNode.node;
			for (var i = nodes.length-1;i >= 0;i--) {
				stack.push(nodes[i]);
			}
		}
		return  result.join('');
	};

	function _html(node) {
		return _htmlRec(node,-1);
	}

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
			result.push(levelStr);
			result.push('<');
			result.push (ele.tag);
			if (tag.toUpperCase() ==='!DOCTYPE') {
				generateHtmlAttrStr(ele,result);
				result.push('>\n');
			}
			else {
				generateHtmlAttrStr(ele,result);
				result.push('/>\n');
			}
			
		} else if (tag === TOP_ELE_NAME) {
			//顶级根元素不作处理
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
		for (var i = 0;i<nodes.length;i++) {
			result.push(_htmlRec(nodes[i],level));
		}
		
		if (tag === TOP_ELE_NAME) {
			//顶级根元素不作处理
		}
		//如果不是内联元素
		else if (!isInline(tag)) {
			generateHtmlTextStr(ele,result,levelStr+'\t');
			result.push(levelStr + '</' + ele.tag +'>\n');
		}
		//console.log(result);
		return result.join('');
	}

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

	function _attr(node,key) {
		var v = node[key];
		if (isArray (v)) {
			v = v.join('');
		}
		else if (isObject(v)) {
			var result = '';
			for (var key in v) {
				result = result + key+':' + v[key] + ';';
			}
			v = result.substring(0,result.length-1);
		}
		return v;
	};

	 
	//解析属性
	function parseAttr(str,stack,text) {

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
			element =  createElement(tag,text,attrStr);
			var tempNode = stack[stack.length-1];
			tempNode.node.push(element);
			//如果不是空元素，则压入栈顶
			if (!INLINE_ELES.contains(tag)) {
				stack.push(element);
			}
		} else {
			//存放结束标记符
			var tag = '';
			//判断结束标签里是否包含空字符
			var index = str.indexOf(' ');
			if (index !== -1) {
				tag = str.substring(0,index);
			}
			//说明书写规范
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

			stack.splice(matchIndex,stack.length - matchIndex);
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
    		if (char ==='=') {
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