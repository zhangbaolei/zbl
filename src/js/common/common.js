/**
 * Created by zhangbl13213 on 2016-08-23.
 */
;
(function($) {
    window.toURL;
    window.nb_bool = false;
    window.tel_bool = true;
    window.inner_send_companyid = 10002;

    document.addEventListener('deviceready', function () {
        addListener()
        nb_bool = Util.isApp();
        nb_bool && hybrid.core.execMethod('getAllCode', '',
            function(result){
                //alert(JSON.stringify(result));
                if(result){
                    if(result.auth_id){
                        var auth_id =result.auth_id;
                        Util.setCookie('auth_id',auth_id,'1');
                    }else{
                        Util.delCookie('auth_id');
                    }
                    if(!result.phone_number){
                        window.tel_bool = false;
                    }
                    //=========测试用
                    //Util.setCookie('auth_id',"A000000000724894",'1');
                    window.inner_send_companyid = 10002;
                    Util.forIndexInit()
                }
            }
        );
    });
    function addListener(){
        hybrid.core.addHybridEventListener("isLogin",function(param){
            var result = param;
            if(result.auth_id){
                var auth_id =result.auth_id;
                Util.setCookie('auth_id',auth_id,'1');
            }else{
                Util.delCookie('auth_id');
                Util.delCookie('token');
            }
            //触发首页数据请求，刷新数据
            App.competitionView.afterRender();
            App.competStartView.afterRender();
            App.competNoStartView.afterRender();

            if(!result.phone_number){
                window.tel_bool = false;
            }else{
                window.tel_bool = true;
            }
        });
    };
    window.Util = window.Util || {
        /*是否在App中*/
        isApp: function(){
            var agent = navigator.userAgent.toLowerCase();
        if(agent && /fwv/i.test(agent)){
                return true;
        }else{
                return false
            }
        },
        /*获取链接地址上的参数*/
        getUrlParam : function(name){
            var reg = new RegExp("(\\?|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.href.substr(1).match(reg);
            if (r!=null  && r != 'undefined') return r[2]; return "";
        },
        setCookie: function (c_name,value,expiredays) {
            var exdate=new Date();
            exdate.setDate(exdate.getDate()+expiredays);
            document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+";path=/;domain=10.26.200.134";
            //=========测试用
           // document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString())+";path=/;domain="+location.hostname;
        },
        getCookie: function (name){
            var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
            if(arr=document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        },
        delCookie: function (name){
             Util.setCookie(name, "", -1);
        },
        listenApp: function(){
            hybrid.core.addHybridEventListener("isLogin",function(param){
                var result = param;
                if(result.auth_id){
                    var auth_id =result.auth_id;
                    Util.setCookie('auth_id',auth_id,'1');
                }else{
                    Util.delCookie('auth_id');
                }
                if(!result.phone_number){
                    window.tel_bool = false;
                }else{
                    window.tel_bool = true;
                }
            });
        },
    /*小数转成百分数 isneed表示是否需要百分号*/
        float_percent : function(num,isNeed){
            var num = num.toString();
            if(num){
                var num = parseFloat(num);

                if(isNeed == '1'){
                    return ((num*100).toFixed(2) );
                }else{
                    return ((num*100).toFixed(2)+ "%");
                }
            }else{
                return "---"
            }
        },

        ajax:function (options){
            var data = options.data || {};
            try{
                var _options_ = Util.getStorageObj('_options_'),
                    public_params = Util.getStorageObj('public_params');
                if(public_params){
                    var arr = ['sendercomp_id', 'targetcomp_id'];
                    !data.apply_no && arr.push('apply_no');

                    for (var i = 0, l = arr.length; i < l; i++) {
                        var key = arr[i];
                        if(typeof data == 'string'){
                            data+='&'+key+'='+public_params[key];
                        } else {
                            data[key] = public_params[key]
                        }
                    }
                }
            }catch (e){
                console.warn(e);
            }
            if(window.navigator.onLine){
                //是否属于交易的接口
                var reqUrl = options.isTrade ? _options_.url : toURL;
                try{
                    $.ajax({
                    // url:options.url + "?random=" + Math.random(),
                    type:/*"get"*/options.type || "post",
                    url:/*"/test"*/reqUrl+options.url + ".json?random=" + Math.random(),
                    dataType:"json",
                    async : (options.async != undefined) ? options.async : true,
                    data : data,
                    context: Util,
                    timeout:10000,
                    beforeSend:function(request){
                        if(options.beforeSend){
                            options.beforeSend(request);
                        }
                        //var token = _options_ && _options_.token;
                        var token = Util.getCookie("token");
                        options.isTrade && token && request.setRequestHeader('authorization', token);
                    },
                    success : function(result) {
                        if(result.error_code== "20304068") //不提示错误，未开启模拟, 请先开启模拟
                            return;
                        if(result.error_code || result.error_code == ""){

                            if(result.error_code== "20301000"){
                                /*获取用户信息失败的情况*/
                                //2016-7-7 zhangbl 会话失效，不提示登录。改成前端免密重登
                                /*error_tip_login("用户登录失效，请<a id='tip_login'>重新登录</a>");*/

                                //that.send_no_pwd_code_n(free_login_code);
                                this._showAlert(result.error_info);
                            }else if(result.error_code == "20300003" && result.error_info=="访问令牌无效或已过期"){
                                this.getToken(_options_);//重新请求token
                            }else if(options.error){
                                options.error(result);
                            }else{
                                this._callException(result);
                            }
                        }else{
                            this._callSuccess(options.success, result);
                        }
                    },
                    error:function (XMLHttpRequest, textStatus, errorThrown){
                        if(options.flag){

                        }else{
                            if(XMLHttpRequest.readyState == 4 && (XMLHttpRequest.status == "200" || textStatus == "OK")){
                                this._callError(options.error,XMLHttpRequest.responseText);
                            }else if(XMLHttpRequest.readyState == 0 && (XMLHttpRequest.status == "0" || textStatus == "timeout")){
                                this._showAlert("网络不稳定，请检查网络");
                            }else if(textStatus == "abort"){
                                if(!window.navigator.onLine){
                                    this._showAlert("网络不稳定，请检查网络");
                                }
                            }else{
                                this._showAlert("调用数据失败，请稍后再试。");
                            }
                        }
                    },
                    complete: function(response){
                        if(options.complete){
                            options.complete(response);
                        }
                    }
                });
                }catch (e){

                }
            }else{
                this._showAlert("网络不稳定，请检查网络");
            }

        },
        /*异常处理*/
        _callException:function (result){
        //        defaults.alertNode.find("span").html(result);
            this._showAlert(result.error_info);
        },
        /*成功处理*/
        _callSuccess:   function (success,result){
            if(success){
                success(result.data);
            }
        },
            /*错误处理*/
        _callError: function (error,errorMessage){
            if(error){
                error(errorMessage);
            }else{
                this._showAlert(errorMessage);
            }
        },
            /*出现警告*/
        _showAlert:function (obj){
            //$("body").append(obj.message)
            this.error_tip(obj);
        },
        /*异常提示*/
        error_tip : function(message){
            $(".error_div").remove();
           // $(".black_shield").show();

            var str ="";
            if($(".black_shield").length>0){
                str = "<div class='error_div'><div class='error_tip_content'>"+message+"</div><a name='close_error' class='error_close'></a></div>";
            }else{
                str = "<div class='black_shield'><div class='error_div'><div class='error_tip_content'>"+message+"</div><a name='close_error'class='error_close'></a></div></div>";
            }
            $("body").append(str);
            $('html,body').animate({scrollTop: '0px'}, 100);//因为页面很长，有纵向滚动条，先让页面滚动到最顶端，然后禁止滑动事件，这样可以使遮罩层锁住整个屏幕
            $('.black_shield,.error_div').bind("touchmove",function(e){
                e.preventDefault();
            });
            function fadeout(){
                 $('.error_div').addClass('animated fadeInDown');
                 setTimeout("$('.error_div,.black_shield').addClass('animated fadeOut')",1500);      //1.5秒钟后报错信息消失
                  $('.error_div，.black_shield').css("display","none");
            }
            fadeout();      //将报错提示隐藏，否则点击本周排行时会发生点击不了的状况
             //setTimeout(dispear,1000);
            $("a[name='close_error']").bind("click",function(){
                $(".error_div").remove();
                $(".black_shield").hide();
            });
        },
        send_no_pwd_code_n : function(no_pwd_code){
            var r = false;
            this.ajax({
                url:"/user/freeLogin",
                async:false,
                data:{
                    operate_system:this.osType(),
                    browser:this.clientType(),
                    resolution:this.getScreen(),
                    free_login_code:no_pwd_code
                },
                success:function (result){
                    r =true;
                },
                error:function(result){
                    if(result.error_code == '10190505'){
                        this.error_tip_login("您的账户已在别处登录，请<a id='tip_login'>重新登录</a>");
                    }else{
                        this.error_tip_login("用户登录失效，请<a id='tip_login'>重新登录</a>");
                    }
                }
            });
            return r;
        },
        getScreen : function(){
            return "高："+window.screen.height+"px;宽："+window.screen.width+"px";
        },
        //判断操作系统
        osType:function () {
            var u = navigator.userAgent;
            var osType = "";

            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
                osType = "Android";
            } else if (u.indexOf('iPhone') > -1) {//苹果手机
                osType = "iOS";
            } else if (u.indexOf('Windows Phone') > -1) {//winphone手机
                osType = "winPhone";
            }else {
                osType = "others"
            }
            return osType;
        },
        //判断浏览器类型
        clientType : function() {
            var clientType="";
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.indexOf("micromessenger") != -1){
                clientType="wechat";//微信客户端
            }else if(ua.indexOf("qqbrowser") != -1){
                clientType="qqbrowser";//qq浏览器（此处未区分手机客户端和pc客户端）
            }else if(ua.indexOf("qq/") != -1){
                clientType="qq";//qq客户端
            }else if(ua.indexOf("qzone") != -1){
                clientType="qzone";//qq空间客户端
            }else if(ua.indexOf("safari") != -1){
                clientType="safari";//safari
            }else{
                clientType="else";
            }
            return clientType;
        },
        /*异常提示*/
        error_tip_login : function(message){
            $(".error_div").remove();
            $(".black_shield").show();
            var str ="";
            if($(".black_shield").length>0){
                str = "<div class='error_div'><div class='error_tip_content'><p>"+message+"</p></div></div>";
            }else{
                str = "<div class='black_shield'><div class='error_div'><div class='error_tip_content'><p>"+message+"</p></div></div></div>";
            }
            $("body").append(str);
            $('.error_div').addClass('animated fadeInDown');
            setTimeout("$('.error_div,.black_shield').addClass('animated fadeOut')",1500);      //1.5秒钟后报错信息消失
            $('.error_div，.black_shield').css("display","none");
            $('html,body').animate({scrollTop: '0px'}, 100);//因为页面很长，有纵向滚动条，先让页面滚动到最顶端，然后禁止滑动事件，这样可以使遮罩层锁住整个屏幕
            $('.black_shield,.error_div').bind("touchmove",function(e){
                e.preventDefault();
            });
        },
        /*千分位*/
        num_format : function (num) {
            var num = num.toString();
            if(num){
                var num = parseFloat(num);
                return (num.toFixed(2) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
            }else{
                return '---';
            }
        },
        storage: sessionStorage, //localStorage or sessionStorage
        getStorageObj: function(key){
            var val = Util.storage.getItem(key);
            return val ? JSON.parse(val) : '';
        },
        /*2016-8-3 add by xujb*/
        forIndexInit: function (){
            //Util.listenApp();

            var storage = this.storage,
                open_id = this.getUrlParam('open_id')||this.getCookie('open_id'),
                auth_id = this.getUrlParam('auth_id')||this.getCookie('auth_id');
            /**
             * 仅做参考 以config为准
             * _options_ {token:'',url: '',data:{},token_url: '',apply_no: '',sendercomp_id: '',targetcomp_id: '', compet_url}
             */

            //加载light js-sdk
           /* LIGHT.require(["config"], function(config){
                config.request(function(data){*/
            LightSDK.config.get(function(data){
                window.inner_send_companyid = data.inner_send_companyid || 10002;
                if(open_id && auth_id){
                    storage.removeItem('_options_');
                    //storage.removeItem('auth_id');
                    //storage.removeItem('open_id');
                    //改用cookie;
                    Util.delCookie("auth_id");
                    Util.delCookie("open_id");
                    //toURL = "/ftrade.front/ftrade"
                } else {
                    //获取存储的变量
                    var _options_ = JSON.parse(storage.getItem('_options_') || "{}"),
                        dt = _options_.data;

                    var params = {},
                        isNeedReq = ( auth_id && auth_id != Util.getCookie("auth_id") )
                            || ( open_id && open_id != Util.getCookie("open_id") )
                            || ((auth_id||open_id) && !Util.getCookie("token"));

                    _.extend(_options_, data);
                    _options_.data = params;
                    if(Util.storage.getItem("new_auth_id")&&Util.storage.getItem("is_test")&&Util.getUrlParam("auth_id")){
                        params.auth_id = Util.storage.getItem("new_auth_id");
                        Util.setCookie("auth_id", Util.storage.getItem("new_auth_id"), "1");
                    }else{
                        auth_id && (params.auth_id = auth_id||Util.getCookie("auth_id"), Util.setCookie("auth_id",auth_id,"1")),
                        open_id && (params.open_id = open_id||Util.getCookie("open_id"), Util.setCookie("open_id",open_id,"1"));
                    }

                    params.user_source = data.user_source,
                    params.oauthprov_code = data.oauthprov_code;

                    if(data.secret){
                        _options_.authorization = encoder(data.key + ":" + data.secret);
                    }

                    storage.setItem('_options_', JSON.stringify(_options_));
                    if(isNeedReq){
                        Util.delCookie("token");
                        Util.getToken(_options_);
                    }
                }
                //设置公共参数 public_params
                var public_params = {},
                    arr = ['sendercomp_id', 'targetcomp_id','apply_no','trade_url','is_test'];
                for (var i = 0, k = arr.length; i < k; i++) {
                    var key = arr[i];
                    public_params[key] = data[key]
                }
                storage.setItem('public_params', JSON.stringify(public_params));

                toURL = data.compet_url;//默认请求地址
                App.start();
            });
        },
        /* add 2016-8-3 xujb 获取token*/
        isLoading :false,
        getToken:function (options){
            if(this.isLoading){
                return;
            }
            var storage = this.storage;
            options = options || JSON.parse(storage.getItem('_options_') || '');
            $.ajax({
                url: options.token_url,
                data: options.data,
                type:'post',
                async: false,
                beforeSend: function(req){
                    Util.isLoading = true
                    req.setRequestHeader('authorization', options.authorization);
                },
                success: function(result){
                    if(!result.success)
                        Util.error_tip(result.error_info);
                    else{
                        Util.setCookie("token",result.data.token,"1")
                        //options.token = result.data.token;
                        storage.setItem('_options_', JSON.stringify(options));
                        if(Util.storage.getItem("new_auth_id")&&Util.storage.getItem("is_test")&&!Util.getUrlParam("is_test")){
                            var b ;
                            location.href.replace(/(.*&|\?)auth_id=([^&]*)(&?.*)/, function($0, $1, $2, $3){
                                b =  $1 + "auth_id=" + Util.storage.getItem("new_auth_id") + "&is_test=222" + $3;
                                //    console.log($0+"----"+$1+"=----"+$2+"------"+$3)
                            })
                            location.href = b;
                        }
                    }
                    //防止重复请求
                    setTimeout(function(){
                        Util.isLoading = false;
                    }, 120000);
                }
            })

        },
        isInApp : function(){
            //判断是否在牛倍app
            return  nb_bool;
        },
        doRedrict : function(fName, param, reqV){
            hybrid.core.execMethod(fName, param);
        },
        checkLogin : function(url,isInNb){
            var that = this,
                storage = that.storage;
            //alert(isInNb)
            if(isInNb){
                if(!Util.getCookie("auth_id")){
                    hybrid.core.execMethod("openPage",{pageName:'nalogin',webAddress:'/app/login.html',redirect:url});
                }else{
                    if(tel_bool){
                        return true;
                    }else{
                        hybrid.core.execMethod("openPage",{pageName:'changePhone',status:'bangding',redirect:url});
                    }
                }
            }else{
                if(Util.getCookie("auth_id")){
                    return true;
                }
                if(url){
                    var callback_url = url;
                    var login_url = "https://light.hs.net/apps/xpassport/index.html?callback=" + encodeURIComponent(callback_url);
                    window.location.replace(login_url);
                }else{
                    return false;
                }
            }

        },
        replaceAuthId : function(data){
            var real_auth_id = Util.getUrlParam("auth_id")||Util.getCookie("auth_id"),
                is_test = Util.getStorageObj('public_params').is_test;
            //real_auth_id:true为已登录；is_test为测试环境的标志
            if(is_test && !Util.storage.getItem("is_test")){
                $("div.test-auth-id").css("display","block");
                $(".test-auth-id .set-auth").click(function(){
                    var new_auth_id = $(".test-auth-id input").val();
                    if(new_auth_id.length<10){
                        Util.error_tip('请输入正确的auth_id，不能为空');
                        return
                    }
                    /*var b ;
                    location.href.replace(/(.*&|\?)auth_id=([^&]*)(&?.*)/, function($0, $1, $2, $3){
                        b =  $1 + "auth_id=" + new_auth_id + "&is_test=222" + $3;
                        //    console.log($0+"----"+$1+"=----"+$2+"------"+$3)
                    })
                    location.href = b;*/
                    Util.storage.setItem("new_auth_id",new_auth_id);
                    Util.storage.setItem("is_test","222");
                    Util.delCookie("auth_id");
                    Util.delCookie("token");
                    location.href = location.href;
                    //Util.setCookie("auth_id", new_auth_id, "1");

                    $("div.test-auth-id").fadeOut(300);
                    if(Util.storage.getItem("new_auth_id")&&Util.storage.getItem("is_test")){
                        Util.error_tip("auth_id设置成功");
                    }

                });
                $(".test-auth-id .cancle-auth").click(function(){
                    $("div.test-auth-id").hide();
                })
            }
        },
        competShare : function(compet_id){
            var that =this,
                share_type = that.clientType()=="wechat"?"2":"1",
                title = "炒股大赛，没你不行！",
                logo = "images/appIcon.png",
                content = "认识牛人、锻炼操作、丰厚奖品，点我参赛，即可拥有！",
                link = location.href.replace(/(\?|&)auth_id=[^&]*(&)?/g, function(p0, p1, p2) {
                return p1 === '?' || p2 ? p1 : '';
            });
            that.ajax({
                url:'/queryCompetShare',          //大赛的接口
                data: {'compet_id':compet_id,'share_type':share_type},
                success: function(res){
                    if(share_type=="2"&&res[0]){//微信
                        var obj = {
                            title: res[0].title||title,
                            link: res[0].share_url||link,
                            imgUrl: res[0].share_logo||logo,
                            success: function (r) {
                                //alert('已分享');
                            },
                            cancel: function (r) {
                                //alert('已取消');
                            },
                            fail: function (r) {
                                alert(JSON.stringify(r));
                            }
                        }

                        that.share_wechat(obj);
                    }else{//其他
                        if(res[0]){
                            //$("title").text(res[0].title||title);
                            document.title = res[0].title||title
                            $("#cmpshare").attr("src",res[0].share_logo||logo);
                            $("meta[name='description']").attr("content",res[0].share_content||content);
                        }else{
                            that.defaultShare(title,logo,content)
                        }
                    }

                },
                error: function(){
                    that.defaultShare(title,logo,content)
                }
            })
        },
        share_wechat: function(obj){
            var that =this;
            that.ajax({
                url: "/weixin/sign",
                async: false,
                data: {
                    tenant_id: window.localStorage.getItem('tenant_id'),
                    redirectUri:window.location.href
                },
                success : function(res){
                    wx.config({
                        debug: false,
                        appId: 'wxddbff2e4793700fa',
                        timestamp: res.timestamp,
                        nonceStr: res.noncestr,
                        signature: res.signature,
                        jsApiList: [
                            'checkJsApi',
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'onMenuShareQZone'
                        ]
                    });
                    wx.ready(function () {
                        share(obj);
                    });
                    wx.error(function (res) {
                        alert('wx.error: '+JSON.stringify(res));
                    });
                }
            });
            function share(obj){
                if("wechat" != that.clientType()){
                    return ;
                }
                /*分享到朋友圈*/
                wx.onMenuShareTimeline(obj);
                /*分享给朋友*/
                wx.onMenuShareAppMessage(obj);
                /*分享QQ*/
                wx.onMenuShareQQ($.extend(obj,{desc:$("title").html()}));
                /*分享到腾讯微博*/
                wx.onMenuShareWeibo(obj);
                /*分享到QQ空间*/
                wx.onMenuShareQZone(obj);
            }
        },
        defaultShare: function(title,logo,content){
            $("title").text(title);
            $("#cmpshare").attr("src",logo);
            $("meta[name='description']").attr("content",content);
        },
        download: function(a){
            var that = this;
            if(that.osType()=="iOS"){
                if(that.clientType()=="wechat"){
                    //微信客户端
                    document.getElementById("tip_shield").style.display = "block";
                } else {
                    document.getElementById("tip_shield").style.display = "none";
                    window.location = "https://itunes.apple.com/cn/app/niu-bei-mian-fei-zhao-niu/id1067146725";
                }
            } else if(that.osType()=="Android"){
                window.location = "https://nbapp.hscloud.cn/down/FStock_prodV2_1.1.4_jiagu_sign.apk";
            }
        },
        /**
         * [getAnotherDay 获取距离某个日期的指定类型的某一天]
         * @param  {[type]} type     [类型]
         * @param  {[type]} num      [差值]
         * @param  {[type]} isFormat [是否需要格式化]
         * @param  {[Date]} startDay [指定日期]
         * @return {[type]}          [description]
         * getAnotherDay('date', -1, true) 获取昨天+格式化
         */
        getAnotherDay: function(type, num, isFormat, startDay){
            var _day = startDay || new Date();
            switch(type){
                case 'year':
                    _day = _day.setFullYear(_day.getFullYear() + num);
                    break;
                case 'month':
                    _day = _day.setMonth(_day.getMonth() + num);
                    break;
                case 'date':
                    _day = _day.setDate(_day.getDate() + num);
                    break;
            }
            _day = new Date(_day);
            return !isFormat ? _day : _day.format('yyyy-MM-dd');
        },
        formatDate: function(date, format){
            return date? new Date(date).format(format) : '';
        },
        formatCompetDate: function(date){
            var nyr = date.match(/(\d{4})\-(\d{2})\-(\d{2})/);
            return nyr[1]+"年"+nyr[2]+"月"+nyr[3]+"日";
        },
        diffDay: function(start, end){ //格式'2006-12-18', end可不传 默认为今天
            var arrSt = start.split('-'),
                arrEd = '',
                daySt = new Date(arrSt[0], arrSt[1]-1, arrSt[2]),
                dayEd = end? (arrEd = end.split('-'), new Date(arrEd[0], arrEd[1]-1, arrEd[2]) ) : new Date();
            return Math.ceil( (daySt - dayEd)/ 86400000 );
        },
        setTitle: function(){

        }
    };
})(Zepto);
/*使用方法
    var now = new Date();
    var nowStr = now.format("yyyy-MM-dd hh:mm:ss");
    //使用方法2:
    var testDate = new Date();
    var testStr = testDate.format("YYYY年MM月dd日hh小时mm分ss秒");
    alert(testStr);
    //示例：
    alert(new Date().format("yyyy年MM月dd日"));
    alert(new Date().format("MM/dd/yyyy"));
    alert(new Date().format("yyyyMMdd"));
    alert(new Date().format("yyyy-MM-dd hh:mm:ss"));
*/
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        //month
        "d+": this.getDate(),
        //day
        "h+": this.getHours(),
        //hour
        "m+": this.getMinutes(),
        //minute
        "s+": this.getSeconds(),
        //second
        "q+": Math.floor((this.getMonth() + 3) / 3),
        //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}
    //添加scrollTop的滚动
    $.fn.scrollTo =function(options){
        var defaults = {
            toT : 0,    //滚动目标位置
            durTime : 500,  //过渡动画时间
            delay : 30,     //定时器时间
            callback:null   //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop,    //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };

    /*加载hybrid*/
    var osType = Util.osType();
    var oHead = document.getElementsByTagName('head').item(0);
    var oScript = document.createElement("script");
    oScript.type = "text/javascript";
    if(Util.isApp())
        if (osType == "Android") {
            oScript.src = "js/lib/hybrid-API-android.js";
        } else if(osType == "iOS"){
            oScript.src = "js/lib/hybrid-API.js";
        }
    oHead.appendChild(oScript);