/**
 * VIEW ranking
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;(function(){
    var timer;
    App.rankingView.wrap({
        beforeRender : function(){
            //TODO
            return true;
        },
        ready : function(){

            //TODO
        },
        afterRender : function(){
            var that=this,
                app_no = Util.getUrlParam("app_no"),
                businsys_no = Util.getUrlParam("businsys_no"),
                compet_id = Util.getUrlParam("compet_id"),
                auth_id = Util.getCookie("auth_id");


            Util.competShare(compet_id);
            that.getRank(app_no,businsys_no,compet_id,auth_id,3);
            that.getPersonal(app_no,businsys_no,compet_id,auth_id,3);
            $('ul.ranking_nav li:last-child').addClass('active').siblings('li').removeClass('active');
            $('ul.ranking_nav li').on('tap', function(){
                var $this = $(this), cls = 'active';
                var text = $this.text().trim();
                var te = text.substring(0, text.length - 2);
                // $('#changepartp').text(te);
                $('#rank_class').text(te);         //切换排名情况
                if(!$this.hasClass(cls)){
                    $this.addClass(cls).siblings('li').removeClass(cls);

                    //五分钟刷新一次排行榜
                    clearInterval(timer);
                    that.getRank(app_no,businsys_no,compet_id,auth_id,$this.index() + 1);
                    that.getPersonal(app_no,businsys_no,compet_id,auth_id,$this.index() + 1);
                    timer = setInterval(function(){
                        that.getRank(app_no,businsys_no,compet_id,auth_id,$this.index() + 1);
                        that.getPersonal(app_no,businsys_no,compet_id,auth_id,$this.index() + 1);
                    }, 300000)
                }
            })
            //TODO
        },
        getRank : function(app_no,businsys_no,compet_id,auth_id,params){
            /**/
            //获取赛场排行
             Util.ajax({
                 url: '/qryProfitRank',
                 data: {
                     "profit_period":params,
                     "businsys_no":businsys_no,
                     "apply_no":app_no,
                     "compet_id":compet_id,
                     "auth_id":auth_id
                 },
                 success: function(res){
                     if(res){
                         /*$.map(res,function(v){
                             return v.income_ratio = (Math.round(parseFloat(v.income_ratio) * 10000) / 100).toFixed(2);
                         })*/
                         if(res[0].profit_rank<100){
                             res.splice(res[0].profit_rank,0,res[0]);
                         }
                         var html = template('tpl_ranklist',{"list":res.slice(1)});
                         $('.ranking_acc tbody').html(html);
                     }

                 }
             })
        },
        getPersonal : function(app_no,businsys_no,compet_id,auth_id,params){
            //获取个人排行信息
            Util.ajax({
                 url: '/qryPersonalProfitRank',
                 data: {
                     "profit_period":params,
                     "businsys_no":businsys_no,
                     "compet_id":compet_id,
                     "apply_no":app_no,
                     "auth_id":auth_id
                 },
                 success: function(res){
                     if(res){
                         $(".ranking_pai .syl").removeClass("syl_z syl_k")
                         var src=res.avatar?res.avatar:"images/tx_1.png";
                         $(".txt h3").text(res.user_name);//昵称
                         $(".ranking_pai img").attr("src",src);//头像
                         $(".txt em").text(res.profit_rank);//个人排行
                         $("#total_rank").text(res.user_num);//总人数
                         $(".ranking_pai .syl").text(Util.float_percent(res.income_ratio,"2"));//收益率
                         if(res.income_ratio !=0){
                              res.income_ratio>0?$(".ranking_pai .syl").addClass("syl_z"):$(".ranking_pai .syl").addClass("syl_k");
                         }/*else{//收益率=0时显示为黑色
                              $(".ranking_pai .syl").addClass("syl_b");
                         }*/
                     }else{
                         $(".txt h3").text("--")
                         $(".txt p").text("尚无排名")
                     }
                 }
             })
        },
        afterUnRender : function(){
            clearInterval(timer);
        }
    });
    template.helper('float_format', function(v){
        return  (parseFloat(v)*100).toFixed(2)+ "%";
    })
})(Zepto);
      