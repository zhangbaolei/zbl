/**
 * VIEW account
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;(function(){
    var timer,light_url;
     var _ = {
        limit : 20,
        curShow : -1 //记录当前平仓按钮显示行 -1表示未显示
    };
    App.accountView.wrap({
        beforeRender : function(){
            this.op = {
                backgroundColor : 'white',
                legend : {
                    show : false
                },
                series : [
                    {
                        name : '访问来源',
                        type : 'pie',
                        animation : false,
                        center:['21%','50%'],
                        radius: ['53%', '80%'],
                        avoidLabelOverlap : false,
                        hoverAnimation : false,
                        selectedOffset : 0,
                        label : {
                            normal : {
                                show : false,
                                position : 'center'
                            },
                            emphasis : {
                                show : false
                            }
                        },
                        labelLine : {
                            normal : {
                                show : false
                            }
                        },
                        data : []
                    }
                ]
            };
            this.color_list = ["#FD6F60","#FE9A69","#FECC66","#5DA3DC"];
            //TODO
            return true;
        },
        ready: function(){
            //Util.checkLogin();
        },
        afterRender : function(){

            var that =this,
                app_no = Util.getUrlParam("app_no"),
                businsys_no = Util.getUrlParam("businsys_no"),
                compet_id = Util.getUrlParam("compet_id"),
                sendercomp_id = Util.getStorageObj('public_params').sendercomp_id,
                targetcomp_id = Util.getStorageObj('public_params').targetcomp_id,
                auth_id = Util.getCookie("auth_id");
            Util.competShare(compet_id);

            //$(document).ready(function(){
            that.query_position(app_no,auth_id,sendercomp_id,targetcomp_id);
            that.query_scatter(app_no,businsys_no,auth_id);
            that.getPersonal(app_no,businsys_no,compet_id,auth_id,3);

            timer = setInterval(function(){
                that.query_position(app_no,auth_id,sendercomp_id,targetcomp_id);
                that.query_scatter(app_no,businsys_no,auth_id);
                that.getPersonal(app_no,businsys_no,compet_id,auth_id,3);
            }, 60000)
            //})
            light_url = JSON.parse(sessionStorage.getItem("public_params")).trade_url;
            $(".head_title a[data-name]").bind("tap", function(){
                var name = $(this).attr("data-name");
                location.href = location.href.replace(/#.*\?/,"#"+name+"?") + "&hide_btm=hide";
            })
            /*功能行点击事件*/
            $(".funs_area li ").on("tap",function(){
                var name = $(this).find("a").attr("data-name"),
                    reBackUrl =window.location.href,
                    url = light_url+"?apply_no=NB,"+app_no+"&sendercomp_id="+sendercomp_id
                        +"&targetcomp_id="+targetcomp_id+"&auth_id="+auth_id+"&rebackurl="+encodeURIComponent(reBackUrl)+"#"+name;
                window.location.href = url;
            })
            //TODO
        },
        query_position : function(app_no,auth_id,si,ti){
            var that =this;
            Util.ajax({
                url:"/trade/qryBalance",
                data:{
                    "apply_no":"NB,"+app_no
                },
                success:function(result){
                    if(result){
                        var profit_rate = result.total_income_balance/(result.asset_balance-result.total_income_balance);
                        that.formatBalance(profit_rate,"#total_profit","2"); //累计收益率
                        that.formatBalance(result.total_income_balance,"#total_income");//浮动盈亏
                        that.formatBalance(result.total_day_income_balance||0,"#today_income"); //今日盈亏
                    //    $("#my_rank span").html(result.day_rank); //实时排名
                        $("#asset_balance").html(Util.num_format(result.asset_balance)); //总资产
                    }

                },
                isTrade :true
            });

            Util.ajax({
                url: "/trade/qryStockPosition",
                data: {
                    "apply_no":"NB,"+app_no,
                    "position_str":"",
                    "request_num": 100
                },
                success: function(res){
                    if(res){
                        var tmp = template('temp_list', {list: res || [], cur: $('.touched .code').attr("date-code")})
                        $('.ccyk tbody').html(tmp);
                    }

                    /*控制行情的显示隐藏*/
                    if(true){//!Util.isInApp()
                        $(".ccyk .b_or_s_or_h a.hq").remove();
                        $(".ccyk .b_or_s_or_h a").css("width","49%");
                    }
                    /*持仓行点击事件*/
                    $('#position_list').find("tr:not(.b_or_s_or_h)").unbind().bind("click",function(){
                        if($(this).hasClass("touched")){
                            $(this).removeClass("touched");
                            $(this).next().find("td").hide();
                        }else{
                            $("#position_list").find(".b_or_s_or_h").find("td").hide();
                            $(this).addClass("touched");
                            $(this).siblings(":not(.b_or_s_or_h)").removeClass("touched");
                            $("#position_list").find(".b_or_s_or_h").find("td").hide();
                            $(this).next().find("td").show();
                            var page_top=$("body").scrollTop()+document.documentElement.clientHeight;
                            var element_top=$(this).offset().top;
                            var element_height=$(this).offset().height;
                            var out_height=+ $(".ccyk .b_or_s_or_h td").css("height").replace(/px/,'');   //获取弹出的按钮高度
                            var distance=out_height+element_height+element_top-page_top;
                            if(distance>0){
                                _.curShow = $(this).hasClass("touched") ? ( $('body').scrollTo({ toT: $('body').scrollTop()+distance , durTime :200 }), $(this).index() / 2 ): -1;
                                }
                        }
                    })

                    /*买入、卖出、行情点击跳转*/
                    $("a.buy").unbind().bind("tap",function(){
                        var code  = $(this).parent("div").find("span[name='code']").html(),
                            reBackUrl =window.location.href,
                            url = light_url+"?tabName=buy&code="+code+"&apply_no=NB,"+app_no+"&sendercomp_id="+si
                                +"&targetcomp_id="+ti+"&auth_id="+auth_id+"&rebackurl="+encodeURIComponent(reBackUrl);
                        window.location.href = url;
                    })
                    $("a.sell").unbind().bind("tap",function(){
                        var code  = $(this).parent("div").find("span[name='code']").html(),
                            reBackUrl =window.location.href,
                            url = light_url+"?tabName=sell&code="+code+"&apply_no=NB,"+app_no+"&sendercomp_id="+si
                                +"&targetcomp_id="+ti+"&auth_id="+auth_id+"&rebackurl="+encodeURIComponent(reBackUrl);
                        window.location.href = url;
                    })

                    $("a.hq").unbind().bind("tap",function(){
                        var code  = $(this).parent("div").find("span[name='code']").html(),
                            arr = code.split('.');
                        if(Util.isApp()){
                            Util.doRedrict("openStockDetail", {stockCode: arr[0] ,CodeType: arr[1]});
                        }

                        /*  var reBackUrl =window.location.href;
                        window.location.href = "http://lkd48ebjj.lightyy.com/index.html?code="+code+"&rebackurl="+encodeURIComponent(reBackUrl);*/
                    })
                },
                isTrade :true
            })


        },
        formatBalance: function(a,b,c){
            $(b).html((a>0?"+":"") + (c>0?Util.float_percent(a,c):Util.num_format(a)));
            a==0?$(b).removeClass():(a>0?$(b).addClass("syl"):$(b).addClass("syl_k"));
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
                        $("#my_rank span").html(res.profit_rank||"--")
                    }
                }
            })
        },
        query_scatter : function(app_no,businsys_no,auth_id){
            var that = this;
            /*var data1 = {height:"70%",list:[{"color":"#FD6F60","industry":"银行","percent":"15%"},
                {"color":"#FE9A69","industry":"银行","percent":"35%"},
                {"color":"#FECC66","industry":"银行","percent":"50%"}]};
            this.show_list(data1);
            var data2 =[{"value":"0.2","itemStyle":{"normal":{"color":"#FD6F60" }},"name":"yh"},
                {"value":"0.2","itemStyle":{"normal":{"color":"#FE9A69" }},"name":"yh"},
                {"value":"0.2","itemStyle":{"normal":{"color":"#FECC66" }},"name":"yh"}];
            this.show_pie(data2);*/
            Util.ajax({
                url:"/qryPositionScatter",
                data:{
                    "apply_no":app_no,
                    "businsys_no":businsys_no,
                    "auth_id":auth_id
                },
                success:function(result){
                    //todo  没有持仓的情况
                    if(result && result.list && result.list.length >0){
                        var list = result.list;
                        $("#percent").html(Util.float_percent(result.position_percent,'1'));  //仓位百分比
                        var data = {height:"70%",list:[]};
                        var data_pie =[];
                        if(list.length > 1){
                            var num = (0.08*(list.length-2) +0.5)*100;
                            data.height = num+"%";
                        }

                        var obj_other;
                        for(var i=0;i<list.length;i++){
                            var obj_t ={};
                            var obj = list[i];
                            obj_t.value = parseFloat(obj.percent);
                            obj_t.name = obj.industry;
                            if(obj.industry == '现金'){
                                obj.color = "#68E4B3";
                                obj_t.itemStyle={
                                    normal:{
                                        color:obj.color
                                    }
                                };
                            }else{
                                obj.color = that.color_list[i];
                                obj_t.itemStyle={
                                    normal:{
                                        color:obj.color
                                    }
                                };
                            }
                            if(obj.industry == '其他'){
                                obj_other = obj;
                            }else{
                                data.list.push(obj);
                            }


                            data_pie.push(obj_t);
                        }

                        /*插入其他项 index=3;*/
                        if(obj_other){
                            data.list.splice(3,0,obj_other);
                        }

                        var cash_per  = result.cash_percent;
                        if(parseFloat(cash_per) > 0){
                            data.list.push({percent:cash_per,color:"#68E4B3",industry:"现金"});
                            data_pie.push({
                                value:cash_per,
                                name:"现金",
                                itemStyle:{
                                    normal:{
                                        color:"#68E4B3"
                                    }
                                }
                            });
                        }
                        that.show_list(data);
                        that.show_pie(data_pie);
                    }else{
                        /*展示现金饼图，图例*/
                        var cash_per  = result.cash_percent;
                        if(parseFloat(cash_per) > 0){
                            var list = result.list;
                            $("#percent").html(Util.float_percent(result.position_percent,'1'));  //仓位百分比
                            var data = {height:"70%",list:[]};
                            var data_pie =[];
                            data.list.push({percent:cash_per,color:"#68E4B3",industry:"现金"});
                            data_pie.push({
                                value:cash_per,
                                name:"现金",
                                itemStyle:{
                                    normal:{
                                        color:"#68E4B3"
                                    }
                                }
                            });
                        }

                        that.show_list(data);
                        that.show_pie(data_pie);
                        /*展示空的情况*/
                        that.show_no_position();
                    }
                }
            })
        },

        show_list : function(data){
            $.map(data.list,function(v){
                return v.percent = Util.float_percent(v.percent);
            })
            var html = template('legend_list', data);
            document.getElementById('legend_table').innerHTML = html;
        },
        show_pie :function(data){
            var myChart;
            $(".no-position").hide();
            $(".cookies").show();
            this.op.series[0].data = data;
            if(!myChart){
                myChart = echarts.init(document.getElementById('pie_e'));
            }
            myChart.setOption(this.op);
        },
        show_no_position : function(){
            $(".ccyk thead,.ccyk tbody").hide();
            $(".no-position").show();
        },
        afterUnRender : function(){
            clearInterval(timer);
        }
    });
    template.helper('delSuffix', function(v){
        /*去除.ss .sz*/
        return v.replace(/\..*$/, '');
    })
})();
      