/**
 * VIEW competNoStart
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;(function(){
    App.competNoStartView.wrap({
        beforeRender : function(){
            //TODO
            return true;
        },
        ready : function(){
            //TODO
        },
        afterRender : function(){
            var that = this;
            Util.competShare(Util.getUrlParam('compet_id'));
            that.getCompetInfo();
            that.queryCompetInfo();
            //在safari中打开直接下载
            if(Util.getUrlParam("from_nb")&&Util.clientType()=="safari"){
                that.download();
            }

        },
        events : {
            'tap .regeist' : 'competRegist',
            'tap .download':'download'
        },
        download : function(){
            Util.download()
        },
        afterUnRender : function(){
        },
        getCompetInfo : function(){
            var that = this;
            Util.ajax({
                url : '/getCompetInfo',
                data : {
                    compet_id : Util.getUrlParam('compet_id'),
                    auth_id : Util.getCookie('auth_id')
                },
                success : function(res){
                    if(res){
                        var banner = res.listBanner && res.listBanner[0] || [],
                            competInfo = res.competInfoRes;
                        $('#noStart_banner').html(banner_tpl({obj : competInfo, banner : banner.banner_path}));
                        $('#noStart_reward').html(reward_tpl({list : res.listReward}));
                        $('#noStart_rule').html("<p>" + competInfo.compet_reward_content + "</p>");
                    }
                }
            })
        },
        queryCompetInfo : function(){
            var that = this;
            Util.ajax({
                url : '/queryCompetInfo',
                data : {
                    compet_id : Util.getUrlParam('compet_id'),
                    auth_id : Util.getCookie('auth_id')
                },
                success : function(res){
                    if(res.pageList && res.pageList[0]){
                        competInfo = res.pageList[0];
                        that.model.set({'competInfo' : competInfo});
                        var is_start = competInfo.compet_status;
                        $('#competNoStart .bottom_btn').show();
                        /*1. 是否分享 2. 是否登录3. 是否报名 */
                        //if(isShare) $('.bottom_btn').html('<a href="" class="ui-btn">App下载</a>');
                        if(Util.getUrlParam("from_nb")){
                            $('#competNoStart .bottom_btn').html('<a class="ui-btn download">点击下载</a>');
                        }else{
                            if(Util.checkLogin() ){
                                if(competInfo.is_join > 0){
                                    if(is_start == 2){
                                        $('#competNoStart .bottom_btn').hide();
                                    } else {
                                        $('#competNoStart .bottom_btn').html('<p>已报名，距开赛' + (competInfo.begin_days || 0) + '天</p>');
                                    }
                                }else{
                                    if(Util.getUrlParam('compet_id')==sessionStorage.getItem('login_compet_id')){
                                        that.competRegist();
                                    }else{
                                        $('#competNoStart .bottom_btn').html('<a class="ui-btn regeist">立即报名</a>');
                                    }
                                }

                            } else {
                                $('#competNoStart .bottom_btn').html('<a class="ui-btn regeist">立即报名</a>');
                            }
                        }
                        if(Util.getUrlParam('hide_btm')){
                             $('#competNoStart .bottom_btn').hide();
                        }
                    }
                }
            })
        },
        competRegist : function(){
            sessionStorage.setItem('login_compet_id',Util.getUrlParam('compet_id'));
            if(Util.checkLogin(location.href, Util.isApp())){
                var competInfo = this.model.get('competInfo');
                competInfo.auth_id = Util.getCookie('auth_id');
                var data = _.pick(competInfo, ['compet_id', 'send_companyid', 'businsys_no', 'target_companyid', 'app_no', 'auth_id']);
                data.apply_no = data.app_no;
                Util.ajax({
                    url : '/addCompetRegistInfo',
                    data : data,
                    success : function(res){
                        $('#competNoStart .bottom_btn').html('<p>已报名，距开赛' + (competInfo.begin_days || 0) + '天</p>');
                    }
                })
            }
        }
    });

    var banner_tpl = _.template('\
      <img src="<%=banner%>" alt="<%=obj.compet_name%>" width="100%"/>\
      <div class="bottom">\
        <p>比赛时间：<%=Util.formatCompetDate(obj.compet_begin_time, "yyyy年MM月dd日")%>\
        - <%=Util.formatCompetDate(obj.compet_end_time, "yyyy年MM月dd日")%></p>\
      </div>\
  ');

    var reward_tpl = _.template('<%_.each(list,function(row, index){%>\
    <li>\
      <img src="images/num<%=index+1%>.png" />\
      <p><%=row.reward_name+" x"+row.quantity%></p>\
      <em><%=row.reward_content%></em>\
    </li>\
  <%})%>');
})();
      