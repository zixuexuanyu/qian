/**
 * 钱庄网
 * @affect JS\JQ特效
 * @date 2013-11-26
 * @version $V1.0$
 */
if ($.browser.version < 7) {
		window.location.href="/updateBrowsers.html"; 
	}
/*全局变量*/
window.webrootUrl = "/themes/soonmes_qzw_v2/";
window.GlobalUrl ={};
GlobalUrl.webroot =  "/themes/soonmes_qzw/";
GlobalUrl.fcIndex =  "/franchisee/index.html?fid=";
GlobalUrl.typeSelect =  "/tl/typeSelect.html?fid=";
GlobalUrl.detail =  "/ti/detail.html?borrowId=";
window.TimeLimit={};
TimeLimit.hlq="售完即还";
// 借款用途
window.borrowUsage = {
	"11001": {"title": "经营用途贷款", "desc": "为私营企业量身打造的借款产品，帮助您的企业解决资金周转的燃眉之急。", "iconType": "ico_business"}, 
	"11002": {"title": "购车用途贷款", "desc": "为白领阶层量身定制的借款产品，帮助您实现买车的需求提高生活品质。", "iconType": "ico_car"},
	"11003": {"title": "购房用途贷款", "desc": "为工薪阶层量身定制的借款产品，帮助您实现买房的需求提高生活品质。", "iconType": "ico_purchase"},
	"11004": {"title": "装修用途贷款", "desc": "为工薪阶层量身定制的借款产品，帮助您实现装修的需求提高生活品质。", "iconType": "ico_decorate"},
	"11005": {"title": "应急用途贷款", "desc": "为企业和个人定制的借款产品，帮助您实现资金筹款困难等问题。", "iconType": "ico_emergency"},
	"11006": {"title": "助学用途贷款", "desc": "为贫困家庭的学生量身定制的借款产品，帮助您顺利的完成学业。", "iconType": "ico_omics"},
	"11007": {"title": "其它用途贷款", "desc": "其他类型的借款产品，帮助您短期小额的资金周转。", "iconType": "ico_other"}
};

Date.prototype.format=function(fmt) {     
    var o = {     
    "M+" : this.getMonth()+1, //月份     
    "d+" : this.getDate(), //日     
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时     
    "H+" : this.getHours(), //小时     
    "m+" : this.getMinutes(), //分     
    "s+" : this.getSeconds(), //秒     
    "q+" : Math.floor((this.getMonth()+3)/3), //季度     
    "S" : this.getMilliseconds() //毫秒     
    };     
    var week = {     
    "0" : "\u65e5",     
    "1" : "\u4e00",     
    "2" : "\u4e8c",     
    "3" : "\u4e09",     
    "4" : "\u56db",     
    "5" : "\u4e94",     
    "6" : "\u516d"    
    };     
    if(/(y+)/.test(fmt)){     
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));     
    }     
    if(/(E+)/.test(fmt)){     
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);     
    }     
    for(var k in o){     
        if(new RegExp("("+ k +")").test(fmt)){     
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));     
        }     
    }     
    return fmt;     
} 
/*特效代码*/
$(function(){
	$(window).bind("load resize", function() {
		if (document.documentElement.clientWidth > 1230) {
			$("body").addClass("full");
			$(".no_full").show();
		} else {
			$("body").removeClass("full");
			$(".no_full").hide();
		}
	});
	//--------------------------------------------------【返回顶部】

	var iHeight=$(window).height();
	$(window).bind('scroll', function(event) {
		if ($(window).scrollTop() >= iHeight / 2) {
			$("#quickfloat .top").removeClass('js_hide');
		} else {
			$("#quickfloat .top").addClass('js_hide');
		}
	});
	$("#quickfloat .top").rollTo({
		sSpeed: 500
	});
	
});
$(window).load(function(){
	
});