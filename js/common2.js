/**
 * Ǯׯ��
 * @affect JS\JQ��Ч
 * @date 2013-11-26
 * @version $V1.0$
 */
if ($.browser.version < 7) {
		window.location.href="/updateBrowsers.html"; 
	}
/*ȫ�ֱ���*/
window.webrootUrl = "/themes/soonmes_qzw_v2/";
window.GlobalUrl ={};
GlobalUrl.webroot =  "/themes/soonmes_qzw/";
GlobalUrl.fcIndex =  "/franchisee/index.html?fid=";
GlobalUrl.typeSelect =  "/tl/typeSelect.html?fid=";
GlobalUrl.detail =  "/ti/detail.html?borrowId=";
window.TimeLimit={};
TimeLimit.hlq="���꼴��";
// �����;
window.borrowUsage = {
	"11001": {"title": "��Ӫ��;����", "desc": "Ϊ˽Ӫ��ҵ�������Ľ���Ʒ������������ҵ����ʽ���ת��ȼü֮����", "iconType": "ico_business"}, 
	"11002": {"title": "������;����", "desc": "Ϊ����ײ������ƵĽ���Ʒ��������ʵ���򳵵������������Ʒ�ʡ�", "iconType": "ico_car"},
	"11003": {"title": "������;����", "desc": "Ϊ��н�ײ������ƵĽ���Ʒ��������ʵ���򷿵������������Ʒ�ʡ�", "iconType": "ico_purchase"},
	"11004": {"title": "װ����;����", "desc": "Ϊ��н�ײ������ƵĽ���Ʒ��������ʵ��װ�޵������������Ʒ�ʡ�", "iconType": "ico_decorate"},
	"11005": {"title": "Ӧ����;����", "desc": "Ϊ��ҵ�͸��˶��ƵĽ���Ʒ��������ʵ���ʽ������ѵ����⡣", "iconType": "ico_emergency"},
	"11006": {"title": "��ѧ��;����", "desc": "Ϊƶ����ͥ��ѧ�������ƵĽ���Ʒ��������˳�������ѧҵ��", "iconType": "ico_omics"},
	"11007": {"title": "������;����", "desc": "�������͵Ľ���Ʒ������������С����ʽ���ת��", "iconType": "ico_other"}
};

Date.prototype.format=function(fmt) {     
    var o = {     
    "M+" : this.getMonth()+1, //�·�     
    "d+" : this.getDate(), //��     
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //Сʱ     
    "H+" : this.getHours(), //Сʱ     
    "m+" : this.getMinutes(), //��     
    "s+" : this.getSeconds(), //��     
    "q+" : Math.floor((this.getMonth()+3)/3), //����     
    "S" : this.getMilliseconds() //����     
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
/*��Ч����*/
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
	//--------------------------------------------------�����ض�����

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