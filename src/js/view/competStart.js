/**
 * VIEW pricetorank
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;(function(){
    var compet_status,    //用于判断比赛状态，显示对应的页面
        compet_id,     //用于首页跳转过来的大赛id
        app_no,
        auth_id;          
    App.competStartView.wrap({
        beforeRender : function(){
            //获取从首页传过来的参数
            //TODO
            return true;
        },
        ready : function(){
            //TODO
        },
        events : {
            'tap .download':'download'
        },
        download : function(){
            Util.download()
        },
        formatDate : function(date){    //将开赛的日期格式化
            var nyr = date.match(/(\d{4})\-(\d{2})\-(\d{2})/);
            return nyr[1]+"年"+nyr[2]+"月"+nyr[3]+"日";
        },
        queryStatus : function(){
            var that = this;
            Util.ajax({
                url : '/queryCompetInfo',
                async : false,
                data : {
                    compet_id : compet_id,
                    auth_id : auth_id
                },
                success : function(res){
                    competInfo = res.pageList[0];
                    compet_status = competInfo.compet_status;
                    is_join = competInfo.is_join>0?true:false;
                    that.showlist(compet_status,is_join);
                    that.queryList(compet_status);
                    auth_id = Util.getCookie('auth_id');
                    if(!is_join&&auth_id&&compet_id==sessionStorage.getItem('login_compet_id')){
                        that.competRegist();
                    }
                }
            })

        },
        getInfo : function(){//获取大赛信息
            var that = this;
            Util.ajax({
                url : '/getCompetInfo',
                async : false,
                data : {
                    compet_id : compet_id,
                    auth_id : auth_id //Util.storage.getItem('auth_id')
                },
                success : function(res){
                    if(res){
                        var competInfo = res.competInfoRes;
                        var list = res.listReward;
                        var banner = res.listBanner;
                        that.model.set({'competInfo' : competInfo})
                        if(competInfo){
                            $("#beginDate").html(that.formatDate(competInfo.compet_begin_time));
                            $("#endDate").html(that.formatDate(competInfo.compet_end_time));
                            $("#rules").html("<p>" + competInfo.compet_reward_content + "</p>");
                            // compet_status = competInfo.compet_status;
                        }
                        if(list){
                            $("#first-price").html(list[0].reward_content);
                            $("#second-price").html(list[1].reward_content);
                            $("#third-price").html(list[2].reward_content);
                            $("#firstnum").html(list[0].quantity);
                            $("#secondnum").html(list[1].quantity);
                            $("#thirdnum").html(list[2].quantity);
                        }
                        if(banner && banner.length){
                            $("#competImg").attr("src", banner[0].banner_path);
                        } else {
                            $("#competImg").attr("src", "");
                        }
                    }
                }

            })

        },

        getWinnerList : function(){  //获取获奖名单
            Util.ajax({
                url : '/queryCompetWinners',          //大赛的接口
                data : {
                    'compet_id' : compet_id,
                    'pageSize' : '100'
                },                 //大赛的Id
                success : function(res){
                    var rewardlist = res.pageList;
                    /*$.map(rewardlist,function(v){
                             return v.income_ratio = (Math.round(parseFloat(v.income_ratio) * 10000) / 100).toFixed(2);
                         })*/
                    if(rewardlist){
                        $('#hjmd-list').html(template('temp_hjmdlist', {list : rewardlist || []}));
                    }
                }
            })
        },

        getRank : function(){ //获取赛场排行，判断第一条个人数据是否存在
            Util.ajax({
                url : '/qryProfitRank',
                data : {
                    'profit_period' : '3',
                    'compet_id' : compet_id,
                    'apply_no' : app_no
                },
                success : function(res){
                    if(res){
                      /*$.map(res,function(v){
                             return v.income_ratio = ((parseFloat(v.income_ratio) * 10000)/ 100).toFixed(2);
                         })*/
                        $('#ranking-list').html(template('temp_ranklist', {
                            list : res || []
                        }));
                    }
                }
            })
        },
        competRegist : function(){     //登录（注册）报名
            var competInfo = this.model.get('competInfo');
            sessionStorage.setItem('login_compet_id',Util.getUrlParam('compet_id'))
            if(Util.checkLogin(location.href, Util.isApp())){
                competInfo.auth_id = Util.getCookie('auth_id');
                var data = _.pick(competInfo, ['compet_id', 'businsys_no', 'app_no', 'auth_id']);
                data.apply_no = data.app_no;
                Util.ajax({
                    url : '/addCompetRegistInfo',
                    data : data,
                    success : function(res){
                        if(res){
                            $(".black_shield").show();
                            Util._showAlert("报名成功,即将跳往账户页面!");
                            var _timer = function call(){
                                var url = location.href.replace(/#.*\?/, "#account?");
                                location.replace(url);
                            }
                            setTimeout(_timer,1500);
                        }
                    }
                })
            }
        },
        showlist : function(is_end,is_join){   /*该方法用于判断展示获奖名单还是排行榜页面 */
            var app_share = Util.getUrlParam("from_nb");
            $("#btn").removeClass("download regist");
            if(is_end == 3){//大赛已经结束
                var content = "获奖名单";
                var txt = app_share?"点击下载":"比赛已结束";
                $(".listName").html(content);
                $(".ui-btnno").html(txt);       //未报名
                app_share?$("#btn").addClass("ui-btnroll download"):$("#btn").removeClass("ui-btnroll regist");          //修改按钮的背景色
                $(".rankinglist").hide();
                $(".rankingthead").hide();
                $(".hjmdlist").show();
            } else if(!is_join || !tel_bool){
                var content = "排行榜";
                var txt = app_share?"点击下载":"立即报名";
                $(".listName").html(content);       //tab名称做切换
                $(".ui-btnno").html(txt);       //未报名，显示按钮我要报名
                app_share?$("#btn").addClass("ui-btnroll download"):$("#btn").addClass("ui-btnroll regist");          //修改按钮的背景色
                $(".hjmdlist").hide();
                $(".rankingthead").show();
                $(".rankinglist").show();
            }else{
                /*$(".black_shield").show();
                Util._showAlert("您已报过名,即将跳转至账户页!");
                var _timer = function call(){
                }
                setTimeout(_timer,1500);*/
                var url = location.href.replace(/#.*\?/, "#account?");
                location.replace(url)
            }
        },
        queryList : function(is_end){  //判断应该做哪个请求
                var that = this;
                if(is_end==3){
                  that.getWinnerList();
                }else{
                  that.getRank();
                  clearInterval(_.timer);
                  _.timer = setInterval(function(){
                    that.getRank();
                }, 300000)
              }
        },
        afterRender : function(){
            var that = this;
            compet_id = Util.getUrlParam("compet_id");
            app_no = Util.getUrlParam("app_no");
            auth_id = Util.getCookie("auth_id");
            Util.competShare(Util.getUrlParam('compet_id'));
            Util.isApp()&&Util.listenApp();
           //模板方法
            template.helper('formatRatio', function(data){
                var num;
                if(isNaN(data) || data === ''){
                    num = '--';
                }
                else {
                    num = ((parseFloat(data) * 10000) / 100).toFixed(2);
                }
                return num;
            });
            that.getInfo(); 
            that.queryStatus();
            that.showlist(compet_status);
            //在safari中打开直接下载
            if(Util.getUrlParam("from_nb")&&Util.clientType()=="safari"){
                that.download();
            }
            //切换tab
            $("ul.comp_nav li").die().live('tap', function(e){
                var $this = $(this), cls = 'active';
                var index = $this.index();      //获得点击时的tab页下标
                if(index == 0){
                    //判断是排行还是获奖名单，show对应的div(对应的下面的button样式改掉)
                    that.showlist(compet_status,is_join);
                    $(".innerRules").hide();
                }
                else {
                    //展示比赛规则
                    $(".hjmdlist,.rankinglist,.rankingthead").hide();
                    $(".innerRules").show();
                }
                if(!$this.hasClass(cls)){
                    $this.addClass(cls).siblings('li').removeClass(cls);
                }
                e.preventDefault();
            })//die解绑之前绑定的事件
            $(".listName").parent("li").trigger("tap")
            //点击按钮“立即报名”
            $('#competStart .regist').die().live('tap', function(){
                that.competRegist();
            })
        }
    });
})();
      