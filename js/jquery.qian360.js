/**
 * 钱庄网Qian360
 * @affect  Qian360插件库
 * @date    2014-04-02
 * @version $V1.0$
 */
/*
插件环境：jQuery1.7.2
版本编号：140402
[功能表]
0- Tab选项卡
1- Slide焦点图
2- Equal等高
3- Odevity隔行变色
4- 兼容HTML5-placeholder属性
5- RollTo滚动跳转
6- Pop弹出层
7- 兼容IE6的Fixed
8- Keep滚动悬停
9- ImgLoad图片预加载
10-BoxShadow盒子阴影兼容
11-Cookie存储
12-Md5加密
13-页码插件
14-alert提示框
15-autoMail邮箱自动补全
16-isSubmit防表单重复提交
17-filterHtml过滤Html标签
18-字数统计
19-post提交数据并跳转
*/
;(function($) {
	/*=0 tab选项卡*/
	$.extend({
		tab: function(value) {
			var o = {
				oTab: "#tab", //tab选项卡的容器（父级）
				sTabChildren: "a", //tab选项卡
				oTabMain: "#tabMain", //tab内容区的容器（父级）
				sTabMainChildren: "ul", //tab内容区
				sClass: "current", //选中样式
				sEvent: "click", //tab选项卡切换的触发事件
				iStart: 0, //最先显示的选项卡
				fnAdditional: "" //追加方法
			}
			o = $.extend(o, value);
			function fnTabShow() { //显示当前的tab并改变class
				$(o.oTab).children(o.sTabChildren).eq(o.iStart).addClass(o.sClass).siblings(o.sTabChildren).removeClass(o.sClass);
				$(o.oTabMain).children(o.sTabMainChildren).eq(o.iStart).show().siblings(o.sTabMainChildren).hide();
			}
			fnTabShow();
			$(o.oTab).children(o.sTabChildren).bind(o.sEvent, function() {
				o.iStart = $(this).index();
				$(this).addClass(o.sClass).siblings(o.sTabChildren).removeClass(o.sClass);
				fnTabShow();
				o.fnAdditional && o.fnAdditional();
			});
			o.fnAdditional && o.fnAdditional();
		}
	});
	/*=1 Slide焦点图*/
	$.extend({
		slide: function(value) {
			var o = {
				oSlide: "#slideImage", //焦点图内容容器
				oSlideChildren: "li", //焦点图内容
				oSlideList: "#slideList", //焦点图列表容器
				oSlideListChildren: "a", //焦点图列表
				sClass: "current", //选中样式
				sEvent: "mouseenter", //焦点图切换的触发事件
				bAuto: true, //需要自动切换吗
				iSpeed: 3000, //自动切换的速度
				iNumber: 0, //首先显示的图片编号
				bDrChoose: true, //是否淡入淡出
				ichangeSpeed: 1000, //渐变速度
				bHover: true, //是否启动鼠标移入时停止切换
				fnAdditional: "" //追加方法
			}
			o = $.extend(o, value);
			var iLength = $(o.oSlide).children(o.oSlideChildren).length, //焦点图个数
				iSlideFloor; //渐变在底部的图片
			function fnShow() { //显示焦点图
				$(o.oSlide).children(o.oSlideChildren).eq(o.iNumber).show().siblings(o.oSlideChildren).hide();
			}

			function fnDian() { //切换点的状态
				$(o.oSlideList).children(o.oSlideListChildren).eq(o.iNumber).addClass(o.sClass).siblings(o.oSlideListChildren).removeClass(o.sClass);
			}
			fnShow(); //执行初始化-图
			fnDian(); //执行初始化-点
			function fnQh() { //焦点图切换
				fnDian();
				if ($(o.oSlide).children(o.oSlideChildren).length > 1) {
					if (o.bDrChoose) {
						$(o.oSlide).children(o.oSlideChildren).eq(iSlideFloor)
							.css("z-index", 1).show()
							.end().stop(true, true).eq(o.iNumber)
							.css("z-index", 2).fadeIn(o.ichangeSpeed, fnShow);
					} else {
						$(o.oSlide).children(o.oSlideChildren).hide().eq(o.iNumber).show();
					}
				}
				o.fnAdditional && o.fnAdditional();
			}

			function fnEvent() { //挂载事件
				$(o.oSlideList).children(o.oSlideListChildren).bind(o.sEvent, function() {
					var oThis=$(this);
					setTimeout(function(){
						iSlideFloor = o.iNumber;
						o.iNumber = oThis.index();
						fnQh();
					},500);
				})
			}
			if (o.bAuto) { //是否自动切换
				var bTime;
				function fnAuto() {
					iSlideFloor = o.iNumber;
					o.iNumber++;
					if (o.iNumber >= iLength) {
						o.iNumber = 0;
					}
					fnQh();
				};
				bTime = setInterval(fnAuto, o.iSpeed);
				fnEvent();
				if (o.bHover) {
					$(o.oSlideList).children(o.oSlideListChildren)
						.hover(function() {
							clearTimeout(bTime);
						}, function() {
							bTime = setInterval(fnAuto, o.iSpeed);
						})
				};
			} else {
				fnEvent();
			}
		}
	});
	/*=2 Equal等高*/
	$.fn.extend({
		equal: function(value) {
			var objEqual = {
				oEqualSon: new Array("aside", "article"), 		//需要匹配高度的元素数组
				fnAdditional: "" 											//追加方法
			}
			objEqual = $.extend(objEqual, value);
			var oThis = $(this), 											//匹配元素的容器
				iMax = objEqual.oEqualSon[0], 								//假设第一个元素为最大(高)
				iNextHeight; 												//下一个元素的高度
			for (var i = 1, j = objEqual.oEqualSon.length; i < j; i++) { 	//计算最大(高)的值的元素
				iNextHeight = parseInt(oThis.find(objEqual.oEqualSon[i]).height());
				if (parseInt(oThis.find(iMax).height()) < iNextHeight) {
					iMax = objEqual.oEqualSon[i];
				}
			}
			iHeight = parseInt(oThis.find(iMax).height()); 					//获取最大(高)的值
			for (var i = 0, j = objEqual.oEqualSon.length; i < j; i++) { 	//给所有元素分配这个高度
				oThis.find(objEqual.oEqualSon[i]).css({
					"min-height":iHeight
				})
			}
			objEqual.fnAdditional && objEqual.fnAdditional();
			return oThis;
		}
	});
	/*=3 Odevity隔行变色*/
	$.fn.extend({
		odevity: function(value) {
			var o = {
				oChange: "tr", //需要被匹配的元素
				iBase: 2, //基数
				bZero: true, //是否从1开始计数,否则从0开始
				sClass: "even", //应用的class
				bStrict: false //是否严格模式，为true时必须是子元素，为flase时可以为孙元素
			}
			var oThis = $(this);
			o = $.extend(o, value);
			var oChange = o.bStrict ? oThis.children(o.oChange) : oThis.find(o.oChange), //滚动元素的集合
				iLength = oChange.length, //需要被匹配元素的个数
				iZero = o.bZero ? o.iBase - 1 : 0; //余数	
			for (var i = 0; i <= iLength; i++) {
				if (i % o.iBase == iZero) {
					oChange.eq(i).addClass(o.sClass)
				}
			}
			return oThis;
		}
	});
	/*=4 虚拟placeholder*/
	$.fn.extend({
		occupied: function(fn) {
			if ($.browser.msie && !($.browser.version == "10.0")) { //兼容ie10以下
				$(this).children("input:text").each(function() {
					var oThis = $(this);
					if (oThis.val() == "") {
						oThis.val(oThis.attr("placeholder"));
						oThis.css("color", "#666");
						oThis.focus(function() {
							if (oThis.val() == oThis.attr("placeholder")) {
								oThis.val("");
								oThis.css("color", "");
							}
						})
					}
					oThis.blur(function() {
						if (oThis.val() == "") {
							oThis.val(oThis.attr("placeholder"));
							oThis.css("color", "#666");
						}
					});
				});
				$(this).children("input:password").each(function() {
					var oThis = $(this),
						oThisParent = oThis.parent(),
						sPlaceholder = oThis.attr("placeholder"),
						sClass = oThis.attr("class"),
						oPassWord;
                    oThis.after('<input type="text" placeholder="' + sPlaceholder + '" class="' + sClass + '" />');
					oPassWord = oThis.next();
					oThis.detach();
					oPassWord.val(sPlaceholder).css("color", "#666");
					oPassWord.focus(function() {
						$(this).after(oThis);
						$(this).detach();
						oThis[0].focus();
					});
					oThis.blur(function() {
						if (oThis.val() == "") {
							oThis.after(oPassWord);;
							oThis.detach();
							oPassWord.val(sPlaceholder).css("color", "#666");
						}
					});
				});
			}
			if ($.browser.version == "10.0" || $.browser.mozilla) { //兼容ie10和ff
				$(this).children("input[placeholder]").each(function() {
					oInput = $(this);
					oInput.css("color", "#666")
						.keydown(function() {
							$(this).css("color", "");
						}).blur(function() {
							if ($(this).val() == "") {
								$(this).css("color", "#666");
							}
						});
				});
			}
			fn&&fn();
			return $(this);
		}
	});
	/*=5 rollTo滚动跳转*/
	$.fn.extend({
		rollTo: function(value) {
			var o = {
				oFinish: "body",	//要滚动到的元素
				sSpeed: "0",		//滚动速度
				bMonitor: false, 	//是否楼层监听
				sClass: "current",	//楼层监听时需要添加的样式
				iBias:0,			//偏差调节
				fnAdditional: ""	//追加方法
			}
			o = $.extend(o, value);
			var oThis = $(this),
				targetOffset = parseInt($(o.oFinish).offset().top+o.iBias);
			oThis.click(function() {
				$("html,body").stop(true, true).animate({
					scrollTop: targetOffset
				}, o.sSpeed);
				o.sSpeed == 0 && $("body").stop(true, true);
				o.fnAdditional && o.fnAdditional();
			});
			if (o.bMonitor) {
				$(window).bind("scroll load", function(event) {
					if ($(this).scrollTop() >= targetOffset) {
						oThis.addClass(o.sClass).siblings().removeClass(o.sClass);
					}
				});
			}
			return $(this);
		}
	});
	/*=6 Pop弹出层*/
	$.fn.extend({
		pop: function(value) {
			var o = {
				bBefore: true, 		//是否允许触发弹出层
				sTitle: "", 		//弹出层标题
				bAutoClose:false,	//是否自动关闭
				iCloseTime:3,		//几秒关闭
				iWidth: "", 		//宽度
				iHeight: "", 		//高度
				iSrc: "", 			//iframe地址
				sContent: "", 		//不是iframe,采用html输出
				bShade: true, 		//是否有遮罩
				oTrigger: "", 		//触发弹出的对象(用于回调函数取对象)
				bShadeClose: true,	//是否点遮罩关闭
				bNull:true,			//是否事件没绑定直接弹出
				fnInit: "",			//弹出前触发函数
				fnAfterInit:"",		//弹出后触发函数
				fnClose: ""			//关闭触发函数
			}
			o = $.extend(o, value);
			var oThis = $(this); //触发弹出层的元素
			if (o.bBefore) {
				var oPop, 	//弹出窗对象
					oShade, //遮罩元素对象
					oClose; //关闭按钮对象
				function fnShade() { //判断点遮罩是否关闭
					if (o.bShadeClose) {
						oShade.bind("click", function() {
							oPop.remove();
							o.bShade && oShade.remove();
							o.fnClose && o.fnClose();
						});
					}
				}
				function fnPop() {
					var sHtmlPop = "";
					if (o.fnInit) {
						o.bBefore = (o.fnInit)();
						if(!o.bBefore){
							return false;
						}
					}
					sHtmlPop += '<div id="qui_pop" class="qui_pop">';
					if (o.sTitle) {
						sHtmlPop += '<div class="tit clearfix">';
						sHtmlPop += '<h4>'+o.sTitle+'</h4>';
						if (o.bAutoClose) {
							sHtmlPop += '<span>( <em id="popCloseTime">'+o.iCloseTime+'</em> 秒后自动关闭)</span>';
						}
						sHtmlPop += '<a href="javascript:;" title="关闭" id="pop_close"></a>';
						sHtmlPop += '</div>';
					}
					sHtmlPop += '<div class="conts"></div>';
					sHtmlPop += '</div>';
					$("#qui_pop,#qui_shade").remove();
					$("body").append(sHtmlPop);
					oPop = $("#qui_pop");
					oClose = $("#pop_close");
					//是否是iframe弹出窗
					if (o.iWidth) {
						oPop.css({
							width: o.iWidth,
							marginLeft: -o.iWidth / 2
						});
					}
					if (o.iHeight) {
						oPop.css({
							height: o.iHeight,
							marginTop: -o.iHeight / 2
						});
					}
					if (o.iSrc) {
						oPop.find(".conts").append('<iframe src="" frameborder="0"></iframe>');
						oPop.find("iframe")
							.css({
								height: parseInt(oPop.height())
							})
							.attr("src", o.iSrc);
					} else {
						oPop.find(".conts")
							.append(o.sContent)
							.css({
								height: parseInt(oPop.height())
							});
					}
					//是否要遮罩
					if (o.bShade) {
						var sShade = '<div id="qui_shade" class="qui_shade"></div>';
						$("body").append(sShade);
						oShade = $("#qui_shade");
						oShade.css({
							"opacity": 0.4
						});
						fnShade();
					}
					oClose.bind("click", function() {
						oPop.remove();
						o.bShade && oShade.remove();
						o.fnClose &&  o.fnClose();
					});
					o.fnAfterInit && o.fnAfterInit();
					//自动关闭
					if(o.bAutoClose){
						setInterval(function() {
							o.iCloseTime--;
							if (o.iCloseTime > 0) {
								$("#popCloseTime").html(o.iCloseTime);
							} else {
								oClose.click();
							}
						}, 1000);
					}
				}
				if (oThis[0] || !o.bNull) {
					oThis.bind("click", function() {
						o.oTrigger = $(this);
						fnPop();
					});
				} else {
					fnPop();
				}
			}
		}
	});
	$.extend({
		pop: { //iframe内部关闭弹出框
			close: function(fn) {
				fn&&fn();
				var oWindow = $(parent.document);
				oWindow.find("#qui_shade").remove();
				oWindow.find("#qui_pop").remove()
					.find("iframe").attr("src", "");
			},
			iframeSrc: function(value, tit, width, height) {
				var oWindow = $(parent.document),
					oPop = oWindow.find("#qui_pop");
				if (width || height) {
					oPop.css({
						width: width,
						height: height,
						marginTop: -height / 2,
						marginLeft: -width / 2
					});
					if (height) {
						oPop.find("iframe").css({
							height: height - 40
						});
					}
				}
				if (tit) {
					oPop.find(".tit h4").html(tit);
				}
				oPop.find("iframe").attr("src", value);
			}
		}
	});
	/*=7 虚拟Fixed*/
	$.fn.extend({
		fixed: function(value) {
			var o = {
				iTop: 0, //指定距离顶部的高度
				fnAdditional: "" //追加方法
			}
			o = $.extend(o, value);
			if ($.browser.version == "6.0") {
				var oThis = $(this);
				$("body").attr("style", "_background-image: url(about:blank);_background-attachment: fixed;");
				oThis.css("position", "absolute");
				(o.iTop === 0) && (o.iTop = oThis.offset().top);
				$(window).scroll(function() {
					oThis.css("top", o.iTop + $(this).scrollTop());
					o.fnAdditional && o.fnAdditional();
				});
				o.fnAdditional && o.fnAdditional();
			}
		}
	});
	/*=8 Keep滚动悬停*/
	$.fn.extend({
		keep: function(fn1,fn2) {
			var oThis = $(this),
				iTop = oThis.offset().top,
				iLeft = oThis.offset().left;
			$(window).bind("scroll load", function() {
				if ($(window).scrollTop() >= iTop) {
					if ($.browser.version !== "6.0") {
						oThis.css({
							"position": "fixed",
							"top": 0,
							"left": iLeft
						});
					} else {
						$("body").attr("style", "_background-image: url(about:blank);_background-attachment: fixed;");
						function fnPosition() {
							if ($(this).scrollTop() > iTop) {
								oThis.css({
									"position": "absolute",
									"top": $(this).scrollTop() - iTop
								});
							} else {
								oThis.css({
									"position": "absolute",
									"top": 0
								});
							}
						}
						fnPosition();
					}
					fn1 && fn1();
				} else {
					oThis.attr("style", "");
					fn2 && fn2();
				}
			});
		}
	});
	/*=9 imgLoad图片预加载*/
	$.fn.extend({
		imgLoad: function(options) {
			var defaults = {
				attr: "data-url",
				container: $(window),
				callback: $.noop
			};
			var params = $.extend({}, defaults, options || {});
			params.cache = [];
			$(this).each(function() {
				var node = this.nodeName.toLowerCase(),
					url = $(this).attr(params["attr"]);
				//重组
				var data = {
					obj: $(this),
					tag: node,
					url: url
				};
				params.cache.push(data);
			});
			var callback = function(call) {
				if ($.isFunction(params.callback)) {
					params.callback.call(call.get(0));
				}
			};
			//动态显示数据
			var loading = function() {
				var contHeight = params.container.height();
				if ($(window).get(0) === window) {
					contop = $(window).scrollTop();
				} else {
					contop = params.container.offset().top;
				}
				$.each(params.cache, function(i, data) {
					var o = data.obj,
						tag = data.tag,
						url = data.url,
						post, posb;
					if (o) {
						post = o.offset().top - contop, post + o.height();
						if ((post >= 0 && post < contHeight) || (posb > 0 && posb <= contHeight)) {
							if (url) {
								//在浏览器窗口内
								if (tag === "img") {
									//图片，改变src
									callback(o.attr("src", url));
								} else {
									o.load(url, {}, function() {
										callback(o);
									});
								}
							} else {
								// 无地址，直接触发回调
								callback(o);
							}
							data.obj = null;
						}
					}
				});
			};
			//事件触发
			//加载完毕即执行
			loading();
			//滚动执行
			params.container.bind("scroll", loading);
		}
	});
	/*=10 boxShadow盒子阴影兼容*/
	$.fn.extend({
		boxShadow: function(xOffset, yOffset, blurRadius, shadowColor) {
			if (!$.browser.msie) return;
			return this.each(function() {
				$(this).css({
					position: "relative",
					zoom: 1,
					zIndex: "2"
				});
				$(this).parent().css({
					position: "relative"
				});
				var div = document.createElement("div");
				$(this).parent().append(div);
				var _top, _left, _width, _height;
				if (blurRadius != 0) {
					$(div).css("filter", "progid:DXImageTransform.Microsoft.Blur(pixelRadius=" + (blurRadius) + ",enabled='true')");
					if ($.browser.version == "8.0")
						_top = yOffset - blurRadius - 5;
					else
						_top = yOffset - blurRadius - 1;
					_left = xOffset - blurRadius - 1;
					_width = $(this).outerWidth() + 1;
					_height = $(this).outerHeight() + 1;
				} else {
					_top = yOffset;
					_left = xOffset;
					_width = $(this).outerWidth();
					_height = $(this).outerHeight();
				}
				$(div).css({
					top: _top,
					left: _left,
					width: _width,
					height: _height,
					background: shadowColor,
					position: "absolute",
					zIndex: 1
				});
			});
		}
	});
	/*=11 cookie存储*/
	$.extend({
		cookie: function(name, value, options) {
			if (typeof value != 'undefined') { // name and value given, set cookie
				options = options || {};
				if (value === null) {
					value = '';
					options.expires = -1;
				}
				var expires = '';
				if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
					var date;
					if (typeof options.expires == 'number') {
						date = new Date();
						date.setTime(date.getTime() + (options.expires * 1000));
					} else {
						date = options.expires;
					}
					expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
				}
				var path = options.path ? '; path=' + options.path : '';
				var domain = options.domain ? '; domain=' + options.domain : '';
				var secure = options.secure ? '; secure' : '';
				document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
			} else { // only name given, get cookie
				var cookieValue = null;
				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = jQuery.trim(cookies[i]);
						// Does this cookie string begin with the name we want?
						if (cookie.substring(0, name.length + 1) == (name + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
							break;
						}
					}
				}
				return cookieValue;
			}
		}
	});
	/*=12 Md5加密*/
	$.extend({
		md5: function(a) {
			function b(a, b) {
				var c = (a & 65535) + (b & 65535);
				return (a >> 16) + (b >> 16) + (c >> 16) << 16 | c & 65535
			}

			function c(a, c, d, f, k, o) {
				a = b(b(c, a), b(f, o));
				return b(a << k | a >>> 32 - k, d)
			}

			function d(a, b, d, f, k, o, g) {
				return c(b & d | ~b & f, a, b, k, o, g)
			}

			function f(a, b, d, f, k, o, g) {
				return c(b & f | d & ~f, a, b, k, o, g)
			}

			function k(a, b, d, f, k, o, g) {
				return c(d ^ (b | ~f), a, b, k, o, g)
			}

			return function(a) {
				var b = "",
					c, d;
				for (d = 0; d < a.length; d += 1) c = a.charCodeAt(d), b += "0123456789abcdef".charAt(c >>> 4 & 15) + "0123456789abcdef".charAt(c & 15);
				return b
			}(function(a) {
				var e = unescape(encodeURIComponent(a)),
					m, a = [];
				a[(e.length >> 2) - 1] = void 0;
				for (m = 0; m < a.length; m += 1) a[m] = 0;
				for (m = 0; m < 8 * e.length; m += 8) a[m >> 5] |= (e.charCodeAt(m / 8) & 255) << m % 32;
				e = 8 * e.length;
				a[e >> 5] |= 128 << e % 32;
				a[(e + 64 >>> 9 << 4) + 14] = e;
				for (var p, n, o, g = 1732584193, h = -271733879, i = -1732584194, j = 271733878, e = 0; e < a.length; e += 16) m = g, p = h, n = i, o = j, g = d(g, h, i, j, a[e], 7, -680876936), j = d(j, g, h, i, a[e + 1], 12, -389564586), i = d(i, j, g, h, a[e + 2], 17, 606105819), h = d(h, i, j, g, a[e + 3], 22, -1044525330), g = d(g, h, i, j, a[e + 4], 7, -176418897), j = d(j, g, h, i, a[e + 5], 12, 1200080426), i = d(i, j, g, h, a[e + 6], 17, -1473231341), h = d(h, i, j, g, a[e + 7], 22, -45705983), g = d(g, h, i, j, a[e + 8], 7, 1770035416), j = d(j, g, h, i, a[e + 9], 12, -1958414417), i = d(i, j, g, h, a[e + 10], 17, -42063), h = d(h, i, j, g, a[e + 11], 22, -1990404162), g = d(g, h, i, j, a[e + 12], 7, 1804603682), j = d(j, g, h, i, a[e + 13], 12, -40341101), i = d(i, j, g, h, a[e + 14], 17, -1502002290), h = d(h, i, j, g, a[e + 15], 22, 1236535329), g = f(g, h, i, j, a[e + 1], 5, -165796510), j = f(j, g, h, i, a[e + 6], 9, -1069501632), i = f(i, j, g, h, a[e + 11], 14, 643717713), h = f(h, i, j, g, a[e], 20, -373897302), g = f(g, h, i, j, a[e + 5], 5, -701558691), j = f(j, g, h, i, a[e + 10], 9, 38016083), i = f(i, j, g, h, a[e + 15], 14, -660478335), h = f(h, i, j, g, a[e + 4], 20, -405537848), g = f(g, h, i, j, a[e + 9], 5, 568446438), j = f(j, g, h, i, a[e + 14], 9, -1019803690), i = f(i, j, g, h, a[e + 3], 14, -187363961), h = f(h, i, j, g, a[e + 8], 20, 1163531501), g = f(g, h, i, j, a[e + 13], 5, -1444681467), j = f(j, g, h, i, a[e + 2], 9, -51403784), i = f(i, j, g, h, a[e + 7], 14, 1735328473), h = f(h, i, j, g, a[e + 12], 20, -1926607734), g = c(h ^ i ^ j, g, h, a[e + 5], 4, -378558), j = c(g ^ h ^ i, j, g, a[e + 8], 11, -2022574463), i = c(j ^ g ^ h, i, j, a[e + 11], 16, 1839030562), h = c(i ^ j ^ g, h, i, a[e + 14], 23, -35309556), g = c(h ^ i ^ j, g, h, a[e + 1], 4, -1530992060), j = c(g ^ h ^ i, j, g, a[e + 4], 11, 1272893353), i = c(j ^ g ^ h, i, j, a[e + 7], 16, -155497632), h = c(i ^ j ^ g, h, i, a[e + 10], 23, -1094730640), g = c(h ^ i ^ j, g, h, a[e + 13], 4, 681279174), j = c(g ^ h ^ i, j, g, a[e], 11, -358537222), i = c(j ^ g ^ h, i, j, a[e + 3], 16, -722521979), h = c(i ^ j ^ g, h, i, a[e + 6], 23, 76029189), g = c(h ^ i ^ j, g, h, a[e + 9], 4, -640364487), j = c(g ^ h ^ i, j, g, a[e + 12], 11, -421815835), i = c(j ^ g ^ h, i, j, a[e + 15], 16, 530742520), h = c(i ^ j ^ g, h, i, a[e + 2], 23, -995338651), g = k(g, h, i, j, a[e], 6, -198630844), j = k(j, g, h, i, a[e + 7], 10, 1126891415), i = k(i, j, g, h, a[e + 14], 15, -1416354905), h = k(h, i, j, g, a[e + 5], 21, -57434055), g = k(g, h, i, j, a[e + 12], 6, 1700485571), j = k(j, g, h, i, a[e + 3], 10, -1894986606), i = k(i, j, g, h, a[e + 10], 15, -1051523), h = k(h, i, j, g, a[e + 1], 21, -2054922799), g = k(g, h, i, j, a[e + 8], 6, 1873313359), j = k(j, g, h, i, a[e + 15], 10, -30611744), i = k(i, j, g, h, a[e + 6], 15, -1560198380), h = k(h, i, j, g, a[e + 13], 21, 1309151649), g = k(g, h, i, j, a[e + 4], 6, -145523070), j = k(j, g, h, i, a[e + 11], 10, -1120210379), i = k(i, j, g, h, a[e + 2], 15, 718787259), h = k(h, i, j, g, a[e + 9], 21, -343485551), g = b(g, m), h = b(h, p), i = b(i, n), j = b(j, o);
				a = [g, h, i, j];
				m = "";
				for (e = 0; e < 32 * a.length; e += 8) m += String.fromCharCode(a[e >> 5] >>> e % 32 & 255);
				return m
			}(a));
		}
	});
	/*=13 页码插件*/
	$.extend({
		paging: function(fn) {
			var iPageTotal, //ajax传回的总页数
				iPage = 1, //当前页编码
				sHtml = ""; //节点拼接
			fnCurrent();
			function fnCurrent() {
				var sHtml = "";
				iPage = parseInt(iPage);
				iPageTotal = fn(iPage);
				$("#paging").html('<a class="no_link btn back" href="javascript:;">上一页</a> <a class="no_link btn next" href="javascript:;">下一页</a>');
				if(iPageTotal<=1){
					$("#paging").hide();
				}else{
					$("#paging").show();
				}
				if (iPageTotal > 10) {
					if (iPage < 5) {
						for (var i = 1; i <= 5; i++) {
							if (iPage == i) {
								sHtml += '<a class="current" href="javascript:;" data-page="' + i + '">' + i + '</a>';
							} else {
								sHtml += '<a href="javascript:;" data-page="' + i + '">' + i + '</a>';
							}
						}
						sHtml += '<a class="no_link" href="javascript:;" data-page="">…</a>';
						sHtml += '<a href="javascript:;" data-page="' + iPageTotal + '">' + iPageTotal + '</a>';
					} else if (iPage >= 5 && iPage <= iPageTotal - 4) {
						sHtml += '<a href="javascript:;" data-page="1">1</a>';
						sHtml += '<a href="javascript:;" data-page="2">2</a>';
						sHtml += '<a class="no_link" href="javascript:;" data-page="">…</a>';
						sHtml += '<a href="javascript:;" data-page="' + (iPage - 2) + '">' + (iPage - 2) + '</a>';
						sHtml += '<a href="javascript:;" data-page="' + (iPage - 1) + '">' + (iPage - 1) + '</a>';
						sHtml += '<a class="current" href="javascript:;" data-page="' + iPage + '">' + iPage + '</a>';
						sHtml += '<a href="javascript:;" data-page="' + (iPage + 1) + '">' + (iPage + 1) + '</a>';
						sHtml += '<a href="javascript:;" data-page="' + (iPage + 2) + '">' + (iPage + 2) + '</a>';
						sHtml += '<a class="no_link" href="javascript:;" data-page="">…</a>';
						sHtml += '<a href="javascript:;" data-page="' + (iPageTotal - 1) + '">' + (iPageTotal - 1) + '</a>';
						sHtml += '<a href="javascript:;" data-page="' + iPageTotal + '">' + iPageTotal + '</a>';
					} else {
						sHtml += '<a href="javascript:;" data-page="1">1</a>';
						sHtml += '<a href="javascript:;" data-page="2">2</a>';
						sHtml += '<a href="javascript:;" data-page="3">3</a>';
						sHtml += '<a class="no_link" href="javascript:;" data-page="">…</a>';
						for (var i = 4; i >= 0; i--) {
							if (iPage == (iPageTotal - i)) {
								sHtml += '<a class="current" href="javascript:;" data-page="' + (iPageTotal - i) + '">' + (iPageTotal - i) + '</a>';
							} else {
								sHtml += '<a href="javascript:;" data-page="' + (iPageTotal - i) + '">' + (iPageTotal - i) + '</a>';
							}
						}
					}
				} else {
					for (var i = 1; i <= iPageTotal; i++) {
						if (i == iPage) {
							sHtml += '<a class="current" href="javascript:;" data-page="' + i + '">' + i + '</a>';
						} else {
							sHtml += '<a href="javascript:;" data-page="' + i + '">' + i + '</a>';
						}
					}
				}
				$("#paging .back").after(sHtml);
				if (iPage == 1) {
					$("#paging .back").addClass("no_btn");
				} else if (iPage == iPageTotal) {
					$("#paging .next").addClass("no_btn");
				} else {
					$("#paging .back,#paging .next").removeClass("no_btn");
				}
			}
			$("#paging").undelegate().delegate("a:not('.no_link')", "click", function() {
				iPage = $(this).attr("data-page");
				fnCurrent();
			});
			$("#paging").delegate(".next", "click", function() {
				if (iPage < iPageTotal) {
					iPage++;
					fnCurrent();
				}
			});
			$("#paging").delegate(".back", "click", function() {
				if (iPage > 1) {
					iPage--;
					fnCurrent();
				}
			});
		}
	});
	/*=14 alert提示框*/
	$.extend({
		alert:function(val,tit,fn) {
			var o = {
				sTit:"提示",				//标题
				sVal:"", 					//内容
				bBtn:true, 					//是否显示按钮
				fnAdditional: ""			//关闭后执行的回调
			}
			if(typeof val=="object"){
				o = $.extend(o, val);
			}else{
				o.sTit=tit||"提示";
				o.sVal=val;
				o.fnAdditional=fn;
			}

			$('#qui_pop,#qui_shade').remove();
			$().pop({
				sTitle: o.sTit,					//标题
				iWidth: "inherit",						//宽度
				iHeight: "inherit",						//高度
				bShadeClose:o.bBtn,						//是否点遮罩关闭
				sContent: o.bBtn?'<div class="alert_info">' + o.sVal + '</div><div class="alert_operation"><a class="ok_btn" id="alertOk" href="javascript:;" title="确认">确&nbsp;&nbsp;认</a></div>':'<div class="alert_info">' + o.sVal + '</div>',
				fnClose:o.fnAdditional							//关闭时回调
			});
			$("#qui_pop").css({
				"min-width": "380px",
				"max-width": "600px",
				"min-height": "150px"
			});
			$("#qui_pop").css({
				marginTop: -parseInt($("#qui_pop").height()),
				marginLeft: -parseInt($("#qui_pop").width()) / 2
			});
			if(o.bBtn){
				$("#alertOk").click(function(){
					$("#pop_close").click();
				}).focus();
				$("#pop_close").hide();
			}
		}
	});
	/*=15 autoMail邮箱自动补全*/
	$.fn.extend({
		autoMail: function(options) {
			var opts = $.extend({}, $.fn.autoMail.defaults, options);
			var $this = $(this);
			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
			var $mailBox = $('<div id="mailBox"></div>');
			$('body').append($mailBox);
			//设置高亮li
			function setEmailLi(index) {
				$('#mailBox li').removeClass('cmail').eq(index).addClass('cmail');
			}
			//初始化邮箱列表
			var emails = o.emails;
			var init = function(input) {
				//取消浏览器自动提示
				input.attr('autocomplete', 'off');
				//添加提示邮箱列表
				if (input.val() != "") {
					// var emailList = '<p>请选择邮箱类型</p><ul>';
					var emailList = '<li>' + input.val() + '</li>';
					for (var i = 0; i < emails.length; i++) {
						emailList += '<li>' + input.val() + '@' + emails[i] + '</li>';
					}
					emailList += '</ul>';
					$mailBox.html(emailList).show(0);
				} else {
					$mailBox.hide(0);
				}
				//添加鼠标事件
				$('#mailBox li').hover(function() {
					$('#mailBox li').removeClass('cmail');
					$(this).addClass('cmail');
				}, function() {
					$(this).removeClass('cmail');
				}).click(function() {
					input.val($(this).html());
					input.blur();
					$mailBox.hide(0);
				});
			}
			//调整位置
			$(window).bind("load ready resize", function() {
				var top = $this.offset().top + $this.height() + 6;
				var left = $this.offset().left;
				$mailBox.css({
					top: top,
					left: left,
					width: $this.width()
				});
			}).load();
			//当前高亮下标
			var eindex = -1;
			//监听事件
			$this.focus(function() {
				if ($this.val().indexOf('@') == -1) {
					init($this);
				} else {
					$mailBox.hide(0);
				}
			}).blur(function() {
				setTimeout(function() {
					$mailBox.hide(0);
				}, 1000);
			}).keyup(function(event) {
				if ($this.val().indexOf('@') == -1) {
					//上键
					if (event.keyCode == 40) {
						eindex++;
						if (eindex >= $('#mailBox li').length) {
							eindex = 0;
						}
						setEmailLi(eindex);
						//下键
					} else if (event.keyCode == 38) {
						eindex--;
						if (eindex < 0) {
							eindex = $('#mailBox li').length - 1;
						}
						setEmailLi(eindex);
						//回车键
					} else if (event.keyCode == 13) {
						if (eindex >= 0) {
							$this.val($('#mailBox li').eq(eindex).html());
							$mailBox.hide(0);
						}
					} else {
						eindex = -1;
						init($this);
					}
				} else {
					$mailBox.hide(0);
				}
				//如果在表单中，防止回车提交
			}).keydown(function(event) {
				if (event.keyCode == 13) {
					return false;
				}
			});
		}
	});
	/*=16 isSubmit防表单重复提交*/
	$.fn.extend({
		isSubmit:function(state,str){
			var oThis = $(this);
			if(state){
				$(this).unbind(".isSubmit").removeAttr("disabled", "disabled").html(str).val(str);
			}else{
				oThis.attr("disabled", "disabled").html(str).val(str)
				.bind("click.isSubmit",function(event) {
					event.stopPragation();
					event.preventDefault();
				});
			}
		}
	})
	/*=17 filterHtml过滤Html标签*/
	$.extend({
		filterHtml:function(str){
	    str = str.replace(/<script[^>]*?>.*?<\/script>/g, "")
			.replace(/<(.[^>]*)>/g, "")
			.replace(/([\r\n])[\s]+/g, "")
			.replace(/-->/g, "")
			.replace(/<!--.*/g, "")
			.replace(/&(quot|#34);/g, "\"")
			.replace(/&(amp|#38);/g, "&")
			.replace(/&(lt|#60);/g, "<")
			.replace(/&(gt|#62);/g, ">")
			.replace(/&(nbsp|#160);/g, " ")
			.replace(/&(iexcl|#161);/g, "\xa1")
			.replace(/&(cent|#162);/g, "\xa2")
			.replace(/&(pound|#163);/g, "\xa3")
			.replace(/&(copy|#169);/g, "\xa9")
			.replace(/&ldquo;/g, "“")
			.replace(/&rdquo;/g, "”")
			.replace(/&#(\d+);/g, "")
			.replace(/&mdash;/g, "—")
	        .replace(/</g, "")
			.replace(/>/g, "")
	        .replace(/\r\n/g, "");
	        return str;
		}
	})
	/*=18 字数统计*/
    $.fn.extend({
        count:function(value){
            var o={
                oRelated:"",                //显示当前字数
                iMax:0,                     //最大字数
                bBreak:true,                //超出是否截断
                fnAdditional:""             //追加函数
            }
            o=$.extend(o,value);
            var oThis=$(this)[0],
                oRelated=$(o.oRelated)[0],
                iMax=o.iMax;
            function fnCount(){
                iCount=oThis.value.length;
                oRelated && (oRelated.innerHTML=iCount);
                if(o.bBreak&&iCount>=iMax){
                    oThis.value =oThis.value.substring(0,iMax);
                    oRelated && (oRelated.innerHTML=iMax);
                }
                o.fnAdditional && o.fnAdditional();
            }
            oThis.onkeyup=oThis.onchange=fnCount;
        }
    });
    /*=19 post提交数据并跳转*/
	$.extend({
		postSkip: function(url, args) {
			var form = $("<form method='post'></form>");
			form.attr({
				"action": url
			});
			for (arg in args) {
				var input = $("<input type='hidden'>");
				input.attr({
					"name": arg
				});
				input.val(args[arg]);
				form.append(input);
			}
			$("body").append(form).hide();
			form.submit();
		}
	});
})(jQuery);