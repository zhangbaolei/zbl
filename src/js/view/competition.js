/**
 * VIEW competition
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;(function(){
    var swiper,
        isFirst = false;  // 初始化swiper
    App.competitionView.wrap({
        beforeRender : function(){
            var that = this;
            that.getCompetList();
            return true;
        },
        ready : function(){
            //TODO
        },
        afterRender : function(){
            var that = this;
            !isFirst && that.getCompetBanner(), isFirst = true;
            swiper && swiper.startAutoplay();
            Util.replaceAuthId();
            Util.competShare("-1");
            //隔5分钟刷新一次大赛首页数据
            clearInterval(_.timer);
            _.timer = setInterval(function(){
                that.getCompetList();
            }, 300000)
            //Util.isApp()&&that.contact();
            if(Util.isApp()){
                document.addEventListener('deviceready', function () {
                    that.addListener();
                })
            }
        },
        addListener : function(){
            var that = this
            hybrid.core.addHybridEventListener("contactUs", that.popShow);
        },
        afterUnRender : function(){
            swiper.stopAutoplay();
        },
        events : {
            "tap .header-rightText" : "popShow",
            "tap .close" : 'popClose'
        },
        popShow : function(){
            $('.cb_popup_bg').show();
            $('.black_shield').show();
        },
        popClose : function(){
            $('.cb_popup_bg').hide();
            $('.black_shield').hide();
        },
        //获取比赛的banner
        getCompetBanner : function(){
            Util.ajax({
                url : '/queryCompetBanner',
                //data: {compet_id: Util.getUrlParam('compet_id') || '10001'},
                success : function(res){
                    //填充banner
                    $('.swiper-wrapper').html(banner_tpl({list : res || []}));
                    /*var banner_url = $('#competition .ssbb ul li a')[0].getAttribute('href');
                    !$('#competition .banner a[href]').attr('href')&&$('#competition .banner a[href]').attr('href',banner_url);
                    */
                    //防止swiper重复初始化
                    if(swiper !== undefined){
                        swiper.destroy();
                    }
                    swiper = new Swiper('.swiper-container', {
                        pagination : '.swiper-pagination',
                        autoplay : 5000,
                        paginationClickable : true,    //  点击分页器的点可触发滑动
                        autoplayDisableOnInteraction : false  //手动滑动后还可以触发自动滚动
                        /*observer:true,
                         observeParents:true,
                         onSlideChangeEnd: function(swiper){
                         swiper.update();
                         }*/
                    });


                    // swiperflag = true;
                }
            })
        },
        //获取比赛列表
        getCompetList : function(){
            Util.ajax({
                url : '/queryCompetInfo',
                data : {
                    inner_send_companyid : inner_send_companyid,
                    auth_id : Util.getCookie('auth_id')//||Util.getUrlParam('auth_id')
                },
                success : function(res){
                    //res.pagination
                    //填充列表
                    $('.ss_list').html(compet_tpl({list : res.pageList || []}));
                }
            })
        }
    });

    var banner_tpl = _.template('\
  <%_.each(list,function(row){%>\
    <div class="swiper-slide">\
    <a href="<%=row.banner_url%>">\
    <img src="<%=row.banner_path%>" alt="" width="100%">\
    </a>\
    </div>\
    <%})%>');
    var compet_tpl = _.template('\
  <%var arrStatus = ["", ["未开赛", "#competNoStart","#competNoStart"], ["比赛中", "#competStart", "#account"], ["已结束","#competStart","#competStart"] ]%>\
  <%var authId = Util.getCookie(\'auth_id\')?"&auth_id="+ Util.getCookie(\'auth_id\'):"" %>\
  <%var target = "openweb" %>\
  <%_.each(list,function(row){%>\
    <%var status = arrStatus[row.compet_status]%>\
    <li class="clearfix">\
    <a href="?<%=target%><%=status[row.is_join > 0 && tel_bool ? 2:1]%>?compet_id=<%=row.compet_id%>&app_no=<%=row.app_no%>&businsys_no=<%=row.businsys_no%><%=authId%>"  onfocus="this.blur();">\
    <div class="pic">\
    <img src="<%=row.compet_logo%>" />\
    <div class="status"><%=status[0]%></div>\
    </div>\
    <div class="txt">\
    <h3><%=row.compet_name%>\
    <%if(row.is_hot > 0){%><i class="bq bq3">热门</i><%}%>\
    <%if(row.is_add > 0){%><i class="bq">新增</i><%}%>\
    <%if(row.is_join > 0){%><i class="bq bq2">已参加</i><%}%>\
    </h3>\
    <p>参与人数<em class="num"><%=row.person_num%></em></p>\
    <p>比赛时间<em class="num"><%=row.compet_begin_time.substring(0,10)%>至<%=row.compet_end_time.substring(0,10)%></em></p>\
    </div>\
    </a>\
    </li>\
    <%})%>');
})();
