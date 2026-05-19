/**
 * 性能分析模块
 * 2.2.5 业务客流分析
 * 2.2.6 网络质量分析
 * 2.2.7 通滤波类分析
 * 2.2.8 用户数分析
 */

// ============================================================
// 工具：安全HTML转义
// ============================================================
function _ph(v) { return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ============================================================
// 1. 业务客流分析
// ============================================================
EnhancePages._btCity = '';
EnhancePages._btBiz  = '';
EnhancePages._btDate = '2026-05-17';

EnhancePages.renderBizTraffic = function (container) {
    var self = this;
    var cities = JilinData.cities;

    SeededRandom.reset(20260517);

    // 时段客流（0-23h）
    var hourLabels = [], todayData = [], yesterdayData = [];
    for (var h = 0; h < 24; h++) {
        hourLabels.push((h < 10 ? '0' : '') + h + ':00');
        var base = (h >= 8 && h <= 22) ? SeededRandom.int(18000, 95000) : SeededRandom.int(2000, 18000);
        todayData.push(base);
        yesterdayData.push(Math.round(base * (0.86 + SeededRandom.next() * 0.22)));
    }

    // TOP10 热点应用
    var appNames = ['抖音','腾讯视频','爱奇艺','王者荣耀','快手','哔哩哔哩','和平精英','腾讯会议','微信视频','百度网盘'];
    var appCnts  = appNames.map(function() { return SeededRandom.int(40000, 260000); });
    var appPairs = appNames.map(function(n,i){ return {name:n,cnt:appCnts[i]}; }).sort(function(a,b){return b.cnt-a.cnt;});

    // 各地市明细
    var cityRows = cities.map(function(c, ci) {
        SeededRandom.reset(c.charCodeAt(0)*31+20260517);
        var tu   = SeededRandom.int(80000, 650000);
        var au   = Math.round(tu * (0.62 + SeededRandom.next() * 0.22));
        var down = SeededRandom.float(1.2, 18.5, 2);
        var up   = SeededRandom.float(0.3, 4.5, 2);
        var peak = SeededRandom.int(8000, 85000);
        var rtt  = SeededRandom.float(8.0, 28.0, 1);
        var sc   = peak > 60000 ? 'status-error' : (peak > 40000 ? 'status-warning' : 'status-normal');
        return '<tr>' +
            '<td><strong>' + c + '</strong></td>' +
            '<td>' + (tu/10000).toFixed(2) + ' 万</td>' +
            '<td><span style="color:#2b7de9;font-weight:600;">' + (au/10000).toFixed(2) + ' 万</span></td>' +
            '<td>' + down + ' TB</td><td>' + up + ' TB</td>' +
            '<td><span class="' + sc + '">' + (peak/1000).toFixed(1) + ' Gbps</span></td>' +
            '<td>' + rtt + ' ms</td></tr>';
    }).join('');

    var cityOpts = '<option value="">全部地市</option>' + cities.map(function(c){
        return '<option value="'+c+'"'+(c===self._btCity?' selected':'')+'>'+c+'</option>';
    }).join('');
    var bizTypes = ['全部','视频','游戏','在线办公','网站/下载'];
    var bizOpts  = bizTypes.map(function(b){
        return '<option value="'+b+'"'+(b===(self._btBiz||'全部')?' selected':'')+'>'+b+'</option>';
    }).join('');

    container.innerHTML =
        '<div class="page-content">' +
        // KPI 卡
        '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:8px;">' +
        '<div class="wo-stat-card"><div class="wo-stat-value">227.9<span style="font-size:11px;font-weight:400;">万</span></div><div class="wo-stat-label">用户总数</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#2b7de9;">154.2<span style="font-size:11px;font-weight:400;">万</span></div><div class="wo-stat-label">有流量用户</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">98.6<span style="font-size:11px;font-weight:400;">TB</span></div><div class="wo-stat-label">下行总流量</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">22.4<span style="font-size:11px;font-weight:400;">TB</span></div><div class="wo-stat-label">上行总流量</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">428.5<span style="font-size:11px;font-weight:400;">G</span></div><div class="wo-stat-label">峰值带宽</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">12.8<span style="font-size:11px;font-weight:400;">ms</span></div><div class="wo-stat-label">平均时延</div></div>' +
        '</div>' +
        // 查询栏
        '<div class="remote-panel"><div class="remote-panel-title">业务聚类分析（DPI-XDR接入 · 按用户、应用大小类、时段等维度KQI指标聚类分）</div>' +
        '<div class="remote-form">' +
        '<div class="form-group"><label class="form-label">地市</label><select class="form-select" id="btCityF" onchange="EnhancePages._btCity=this.value;EnhancePages.renderBizTraffic(document.getElementById(\'page-biz-traffic\'))">'+cityOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">业务类型</label><select class="form-select" id="btBizF" onchange="EnhancePages._btBiz=this.value;EnhancePages.renderBizTraffic(document.getElementById(\'page-biz-traffic\'))">'+bizOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">统计日期</label><input class="form-input" type="date" id="btDateI" value="'+self._btDate+'"></div>' +
        '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
        '<button class="btn btn-primary" onclick="EnhancePages._btDate=document.getElementById(\'btDateI\').value;EnhancePages.renderBizTraffic(document.getElementById(\'page-biz-traffic\'))">查询</button>' +
        '<button class="btn" onclick="EnhancePages._btCity=\'\';EnhancePages._btBiz=\'\';EnhancePages.renderBizTraffic(document.getElementById(\'page-biz-traffic\'))">重置</button>' +
        '<button class="btn" onclick="Modal.toast(\'客流报告已导出\',\'success\')">导出报告</button>' +
        '</div></div></div>' +
        // 图表双列
        '<div style="display:grid;grid-template-columns:3fr 2fr;gap:8px;margin-bottom:8px;">' +
        '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">全天时段客流趋势（在线用户数 · 今日 vs 昨日）</span></div><div class="chart-container" id="btHourChart"></div></div>' +
        '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">TOP10 热点应用（日流量次数）</span></div><div class="chart-container" id="btAppChart"></div></div>' +
        '</div>' +
        // 明细表
        '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">各地市业务流量明细</div>' +
        '<table class="data-table"><thead><tr><th>地市</th><th>用户总数</th><th>有流量用户</th><th>下行流量</th><th>上行流量</th><th>峰值带宽</th><th>平均时延</th></tr></thead>' +
        '<tbody>'+cityRows+'</tbody></table></div></div>';

    setTimeout(function () {
        var d1 = document.getElementById('btHourChart');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['btHourChart'] = c1;
            c1.setOption({
                tooltip: { trigger: 'axis' },
                legend: { data: ['今日','昨日'], bottom: 0, textStyle: { fontSize: 10 } },
                grid: { top: 20, right: 20, bottom: 40, left: 60 },
                xAxis: { type:'category', data: hourLabels, axisLabel: { fontSize: 9, interval: 2 } },
                yAxis: { type:'value', name:'在线用户', splitLine:{lineStyle:{color:'#f0f2f5'}},
                    axisLabel: { formatter: function(v){ return (v/10000).toFixed(0)+'万'; }, fontSize: 10 } },
                series: [
                    { name:'今日', type:'line', data: todayData, smooth:true, symbol:'none',
                      lineStyle:{width:2,color:'#2b7de9'}, areaStyle:{color:'rgba(43,125,233,0.1)'} },
                    { name:'昨日', type:'line', data: yesterdayData, smooth:true, symbol:'none',
                      lineStyle:{width:1.5,type:'dashed',color:'#aaa'} }
                ]
            });
            window.addEventListener('resize', function(){ c1.resize(); });
        }
        var d2 = document.getElementById('btAppChart');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['btAppChart'] = c2;
            var clrs = ['#2b7de9','#27ae60','#f39c12','#9b59b6','#e74c3c','#1abc9c','#e67e22','#3498db','#8e44ad','#c0392b'];
            var revApps = appPairs.slice().reverse();
            c2.setOption({
                tooltip: { trigger:'axis', formatter: function(p){ return p[0].name+'<br/>'+(p[0].value/10000).toFixed(1)+'万次'; } },
                grid: { top:10, right:70, bottom:10, left:75 },
                yAxis: { type:'category', data: revApps.map(function(a){return a.name;}), axisLabel:{fontSize:11} },
                xAxis: { type:'value', axisLabel:{formatter:function(v){return (v/10000).toFixed(0)+'万';},fontSize:9} },
                series: [{ type:'bar',
                    data: revApps.map(function(a,i){ return {value:a.cnt,itemStyle:{color:clrs[revApps.length-1-i]}}; }),
                    barWidth:'55%',
                    label:{show:true,position:'right',formatter:function(p){return (p.value/10000).toFixed(1)+'万';},fontSize:10} }]
            });
            window.addEventListener('resize', function(){ c2.resize(); });
        }
    }, 50);
};


// ============================================================
// 2. 网络通断分析（用户粒度）
// ============================================================
EnhancePages._nqCity      = '';
EnhancePages._nqDisconn   = '';   // 中断次数过滤：''全部 '1-3' '4-9' '10+'
EnhancePages._nqDuration  = '';   // 时长过滤：''全部 '<1' '1-5' '5-30' '30+'
EnhancePages._nqDate      = '2026-05-17';
EnhancePages._nqPage      = 1;

EnhancePages.renderNetQuality = function (container) {
    var self = this;
    var cities = JilinData.cities;
    SeededRandom.reset(20260517 + 2);

    // ---- 生成用户粒度中断记录（模拟3A数据）----
    var accounts = JilinData.ceiUserRecords || [];
    var oltDevs  = JilinData.oltDevices || [];
    SeededRandom.reset(20260517 + 20);
    var userRows = [];
    for (var i = 0; i < 120; i++) {
        var acc   = accounts[i % accounts.length] || {};
        var city  = acc.city || SeededRandom.pick(cities);
        var olt   = SeededRandom.pick(oltDevs.filter(function(o){ return o.city === city; }) || oltDevs);
        var discCnt     = SeededRandom.int(1, 18);
        var totalMin    = SeededRandom.int(discCnt * 2, discCnt * 60);
        var maxSingleMin= SeededRandom.int(Math.ceil(totalMin / discCnt), Math.min(totalMin, 180));
        var reconRate   = SeededRandom.float(70, 99.5, 1);
        var bras        = (JilinData.brasDevices || []).filter(function(b){ return b.city === city; })[0];
        userRows.push({
            account:    acc.account || ('JL2025' + String(i+1).padStart(4,'0')),
            city:       city,
            olt:        olt ? olt.id.split('-').slice(0,5).join('-') : (city + '-OLT-01'),
            bras:       bras ? bras.name.split('-').slice(0,4).join('-') : (city + '-BRAS-01'),
            discCnt:    discCnt,
            totalMin:   totalMin,
            maxSingle:  maxSingleMin,
            reconRate:  reconRate,
            lastTime:   '2026-05-17 ' + String(SeededRandom.int(0,23)).padStart(2,'0') + ':' + String(SeededRandom.int(0,59)).padStart(2,'0')
        });
    }

    // 筛选
    var cityFilter = self._nqCity;
    var discFilter = self._nqDisconn;
    var durFilter  = self._nqDuration;
    var filtered = userRows.filter(function(r) {
        if (cityFilter && r.city !== cityFilter) return false;
        if (discFilter === '1-3'  && !(r.discCnt >= 1  && r.discCnt <= 3))  return false;
        if (discFilter === '4-9'  && !(r.discCnt >= 4  && r.discCnt <= 9))  return false;
        if (discFilter === '10+'  && r.discCnt < 10) return false;
        if (durFilter  === '<1'   && r.totalMin >= 60) return false;
        if (durFilter  === '1-5'  && !(r.totalMin >= 60 && r.totalMin < 300))   return false;
        if (durFilter  === '5-30' && !(r.totalMin >= 300 && r.totalMin < 1800)) return false;
        if (durFilter  === '30+'  && r.totalMin < 1800) return false;
        return true;
    });
    filtered.sort(function(a,b){ return b.discCnt - a.discCnt; });

    // 分页
    var pageSize = 15, page = self._nqPage || 1;
    var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(page, totalPages);
    var pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

    var tableRows = pageRows.map(function(r) {
        var discCls = r.discCnt >= 10 ? 'status-error' : (r.discCnt >= 4 ? 'status-warning' : 'status-normal');
        var durH = (r.totalMin / 60).toFixed(1);
        var maxH = (r.maxSingle / 60).toFixed(1);
        var recCls = r.reconRate < 80 ? 'status-error' : (r.reconRate < 90 ? 'status-warning' : 'status-normal');
        return '<tr>' +
            '<td>' + r.account + '</td>' +
            '<td>' + r.city + '</td>' +
            '<td style="font-size:10px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + r.olt + '</td>' +
            '<td><span class="' + discCls + '">' + r.discCnt + ' 次</span></td>' +
            '<td>' + durH + ' h</td>' +
            '<td>' + maxH + ' h</td>' +
            '<td><span class="' + recCls + '">' + r.reconRate + '%</span></td>' +
            '<td style="font-size:11px;">' + r.lastTime + '</td>' +
            '<td><a style="color:#2b7de9;cursor:pointer;" onclick="EnhancePages.showNqUserDetail(\'' + r.account + '\',' + JSON.stringify(r) + ')">详情</a></td>' +
            '</tr>';
    }).join('') || '<tr><td colspan="9" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

    // 分布数据（中断次数区间）
    var discBuckets = [0,0,0,0]; // 1-3, 4-9, 10-14, 15+
    var durBuckets  = [0,0,0,0]; // <1h, 1-5h, 5-30h, 30+h
    userRows.forEach(function(r) {
        if (r.discCnt  <= 3) discBuckets[0]++;
        else if(r.discCnt <= 9) discBuckets[1]++;
        else if(r.discCnt <=14) discBuckets[2]++;
        else discBuckets[3]++;

        var h = r.totalMin / 60;
        if (h < 1) durBuckets[0]++;
        else if(h < 5) durBuckets[1]++;
        else if(h < 30) durBuckets[2]++;
        else durBuckets[3]++;
    });

    // 近7日趋势
    var dayLabels = ['05-11','05-12','05-13','05-14','05-15','05-16','05-17'];
    SeededRandom.reset(20260517 + 21);
    var affectedUsersTrend = dayLabels.map(function(){ return SeededRandom.int(3500, 8200); });
    var avgDurTrend        = dayLabels.map(function(){ return SeededRandom.float(0.8, 3.5, 1); });

    // KPI
    var totalAffected = filtered.length;
    var avgDisc  = filtered.length ? (filtered.reduce(function(s,r){return s+r.discCnt;},0)/filtered.length).toFixed(1) : 0;
    var avgDurH  = filtered.length ? (filtered.reduce(function(s,r){return s+r.totalMin;},0)/filtered.length/60).toFixed(1) : 0;
    var avgRecon = filtered.length ? (filtered.reduce(function(s,r){return s+r.reconRate;},0)/filtered.length).toFixed(1) : 0;

    // 下拉选项
    var cityOpts = '<option value="">全部地市</option>' + cities.map(function(c){
        return '<option value="'+c+'"'+(c===self._nqCity?' selected':'')+'>'+c+'</option>';
    }).join('');
    var discOpts = [{v:'',l:'全部次数'},{v:'1-3',l:'1-3次'},{v:'4-9',l:'4-9次'},{v:'10+',l:'10次以上'}].map(function(o){
        return '<option value="'+o.v+'"'+(o.v===self._nqDisconn?' selected':'')+'>'+o.l+'</option>';
    }).join('');
    var durOpts = [{v:'',l:'全部时长'},{v:'<1',l:'<1小时'},{v:'1-5',l:'1-5小时'},{v:'5-30',l:'5-30小时'},{v:'30+',l:'30小时以上'}].map(function(o){
        return '<option value="'+o.v+'"'+(o.v===self._nqDuration?' selected':'')+'>'+o.l+'</option>';
    }).join('');

    container.innerHTML =
        '<div class="page-content">' +
        // KPI
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + totalAffected + '<span style="font-size:11px;font-weight:400;"> 户</span></div><div class="wo-stat-label">通断用户数</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + avgDisc + '<span style="font-size:11px;font-weight:400;"> 次</span></div><div class="wo-stat-label">人均中断次数</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">' + avgDurH + '<span style="font-size:11px;font-weight:400;"> h</span></div><div class="wo-stat-label">人均中断时长</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + avgRecon + '<span style="font-size:11px;font-weight:400;"> %</span></div><div class="wo-stat-label">平均重连成功率</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#2b7de9;">' + discBuckets[2]+discBuckets[3] + '<span style="font-size:11px;font-weight:400;"> 户</span></div><div class="wo-stat-label">高频中断用户(≥10次)</div></div>' +
        '</div>' +
        // 查询栏
        '<div class="remote-panel"><div class="remote-panel-title">网络通断分析（接入3A数据 · 用户粒度中断时长、中断次数统计与分布分析）</div>' +
        '<div class="remote-form">' +
        '<div class="form-group"><label class="form-label">地市</label><select class="form-select" id="nqCityF" onchange="EnhancePages._nqCity=this.value;EnhancePages._nqPage=1;EnhancePages.renderNetQuality(document.getElementById(\'page-net-quality\'))">'+cityOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">中断次数</label><select class="form-select" id="nqDiscF" onchange="EnhancePages._nqDisconn=this.value;EnhancePages._nqPage=1;EnhancePages.renderNetQuality(document.getElementById(\'page-net-quality\'))">'+discOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">中断时长</label><select class="form-select" id="nqDurF" onchange="EnhancePages._nqDuration=this.value;EnhancePages._nqPage=1;EnhancePages.renderNetQuality(document.getElementById(\'page-net-quality\'))">'+durOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">统计日期</label><input class="form-input" type="date" id="nqDateI" value="'+self._nqDate+'"></div>' +
        '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
        '<button class="btn btn-primary" onclick="EnhancePages._nqDate=document.getElementById(\'nqDateI\').value;EnhancePages._nqPage=1;EnhancePages.renderNetQuality(document.getElementById(\'page-net-quality\'))">查询</button>' +
        '<button class="btn" onclick="EnhancePages._nqCity=\'\';EnhancePages._nqDisconn=\'\';EnhancePages._nqDuration=\'\';EnhancePages._nqPage=1;EnhancePages.renderNetQuality(document.getElementById(\'page-net-quality\'))">重置</button>' +
        '<button class="btn" onclick="Modal.toast(\'通断报告已导出\',\'success\')">导出</button>' +
        '</div></div></div>' +
        // 图表区（左：分布，右：趋势）
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">' +
        '<div class="chart-card" style="min-height:270px;"><div class="chart-card-header"><span class="chart-title">中断次数分布（用户数）</span></div><div class="chart-container" id="nqDiscDistChart"></div></div>' +
        '<div class="chart-card" style="min-height:270px;"><div class="chart-card-header"><span class="chart-title">中断时长分布（用户数）</span></div><div class="chart-container" id="nqDurDistChart"></div></div>' +
        '<div class="chart-card" style="min-height:270px;"><div class="chart-card-header"><span class="chart-title">近7日通断用户数趋势</span></div><div class="chart-container" id="nqTrendChart"></div></div>' +
        '</div>' +
        // 用户明细表
        '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">' +
        '用户粒度通断明细（共 ' + filtered.length + ' 条，第' + page + '/' + totalPages + '页）' +
        '<span style="font-size:12px;font-weight:400;color:#999;margin-left:8px;">· 按中断次数降序</span>' +
        '<span style="float:right;">' +
        (page>1?'<a style="color:#2b7de9;cursor:pointer;margin-right:8px;" onclick="EnhancePages._nqPage='+(page-1)+';EnhancePages.renderNetQuality(document.getElementById(\'page-net-quality\'))">上一页</a>':'') +
        (page<totalPages?'<a style="color:#2b7de9;cursor:pointer;" onclick="EnhancePages._nqPage='+(page+1)+';EnhancePages.renderNetQuality(document.getElementById(\'page-net-quality\'))">下一页</a>':'') +
        '</span></div>' +
        '<table class="data-table"><thead><tr><th>用户账号</th><th>地市</th><th>归属OLT</th><th>中断次数</th><th>累计时长</th><th>最长单次</th><th>重连成功率</th><th>最近中断时间</th><th>操作</th></tr></thead>' +
        '<tbody>' + tableRows + '</tbody></table></div></div>';

    setTimeout(function(){
        // 中断次数分布柱图
        var d1 = document.getElementById('nqDiscDistChart');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['nqDiscDistChart'] = c1;
            c1.setOption({
                tooltip:{trigger:'axis',formatter:function(p){return p[0].name+'<br/>用户数：'+p[0].value+'户';}},
                grid:{top:20,right:20,bottom:35,left:50},
                xAxis:{type:'category',data:['1-3次','4-9次','10-14次','15+次'],axisLabel:{fontSize:10}},
                yAxis:{type:'value',name:'用户数(户)',splitLine:{lineStyle:{color:'#f0f2f5'}},axisLabel:{fontSize:10}},
                series:[{type:'bar',data:[
                    {value:discBuckets[0],itemStyle:{color:'#27ae60'}},
                    {value:discBuckets[1],itemStyle:{color:'#f39c12'}},
                    {value:discBuckets[2],itemStyle:{color:'#e67e22'}},
                    {value:discBuckets[3],itemStyle:{color:'#e74c3c'}}
                ],barWidth:'55%',label:{show:true,position:'top',fontSize:10}}]
            });
            window.addEventListener('resize',function(){c1.resize();});
        }
        // 中断时长分布
        var d2 = document.getElementById('nqDurDistChart');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['nqDurDistChart'] = c2;
            c2.setOption({
                tooltip:{trigger:'axis',formatter:function(p){return p[0].name+'<br/>用户数：'+p[0].value+'户';}},
                grid:{top:20,right:20,bottom:35,left:50},
                xAxis:{type:'category',data:['<1小时','1-5小时','5-30小时','30小时+'],axisLabel:{fontSize:10}},
                yAxis:{type:'value',name:'用户数(户)',splitLine:{lineStyle:{color:'#f0f2f5'}},axisLabel:{fontSize:10}},
                series:[{type:'bar',data:[
                    {value:durBuckets[0],itemStyle:{color:'#5b8ff9'}},
                    {value:durBuckets[1],itemStyle:{color:'#f39c12'}},
                    {value:durBuckets[2],itemStyle:{color:'#e67e22'}},
                    {value:durBuckets[3],itemStyle:{color:'#e74c3c'}}
                ],barWidth:'55%',label:{show:true,position:'top',fontSize:10}}]
            });
            window.addEventListener('resize',function(){c2.resize();});
        }
        // 近7日趋势
        var d3 = document.getElementById('nqTrendChart');
        if (d3) {
            var c3 = echarts.init(d3); App.chartInstances['nqTrendChart'] = c3;
            c3.setOption({
                tooltip:{trigger:'axis'},
                legend:{data:['通断用户数','人均时长(h)'],bottom:0,textStyle:{fontSize:9}},
                grid:{top:20,right:40,bottom:40,left:50},
                xAxis:{type:'category',data:dayLabels,axisLabel:{fontSize:9}},
                yAxis:[
                    {type:'value',name:'用户数',splitLine:{lineStyle:{color:'#f0f2f5'}},axisLabel:{fontSize:9}},
                    {type:'value',name:'h',splitLine:{show:false},axisLabel:{fontSize:9}}
                ],
                series:[
                    {name:'通断用户数',type:'bar',data:affectedUsersTrend,barWidth:'45%',itemStyle:{color:'rgba(91,143,249,0.7)'}},
                    {name:'人均时长(h)',type:'line',yAxisIndex:1,data:avgDurTrend,smooth:true,
                     lineStyle:{width:2,color:'#e74c3c'},symbol:'circle',symbolSize:5}
                ]
            });
            window.addEventListener('resize',function(){c3.resize();});
        }
    }, 50);
};

EnhancePages.showNqUserDetail = function (account, row) {
    if (typeof row === 'string') { try { row = JSON.parse(row); } catch(e) { row = {}; } }
    SeededRandom.reset(account.charCodeAt(0)*17+20260517);
    var events = [];
    for (var i=0; i<(row.discCnt||5); i++) {
        var startH = SeededRandom.int(0,22);
        var durM   = SeededRandom.int(2, 120);
        var succ   = SeededRandom.next() > 0.12 ? '重连成功' : '重连失败';
        events.push('<tr><td>2026-05-17 '+String(startH).padStart(2,'0')+':'+String(SeededRandom.int(0,59)).padStart(2,'0')+'</td>' +
            '<td>'+durM+' 分钟</td>' +
            '<td>'+SeededRandom.pick(['dying-gasp','光功率低','设备重启','链路抖动','PON口异常'])+'</td>' +
            '<td><span class="'+(succ==='重连成功'?'status-normal':'status-error')+'">'+succ+'</span></td></tr>');
    }
    Modal.show('通断详情 - ' + account,
        '<div style="margin-bottom:8px;font-size:12px;color:#666;">归属OLT：<strong>'+(row.olt||'-')+'</strong> &nbsp;|&nbsp; 地市：<strong>'+(row.city||'-')+'</strong></div>' +
        '<table class="data-table"><thead><tr><th>中断时间</th><th>持续时长</th><th>中断原因</th><th>处置结果</th></tr></thead><tbody>'+events.join('')+'</tbody></table>',
        '<button class="btn btn-primary" onclick="Modal.close()">关闭</button>' +
        '<button class="btn" onclick="Modal.toast(\'已发起质差工单\',\'success\');Modal.close()">发起工单</button>',
        '680px');
};





// ============================================================
// 3. 通滤波类分析
// ============================================================
EnhancePages._faDevice  = 'OLT';
EnhancePages._faCity    = '';
EnhancePages._faSeverity= '';

EnhancePages.renderFilterAnalysis = function (container) {
    var self = this;
    var cities = JilinData.cities;
    SeededRandom.reset(20260517 + 5);

    // 生成滤波告警列表
    var dimDevices = {
        'OLT':  (JilinData.oltDevices||[]).slice(0,30),
        'BRAS': (JilinData.brasDevices||[]).slice(0,15),
        '小区':  cities.map(function(c,i){ return {id:'小区-'+c+'-'+SeededRandom.int(1,50),city:c}; })
    };
    var devList = dimDevices[self._faDevice] || dimDevices['OLT'];
    var filtered = self._faCity ? devList.filter(function(d){return d.city===self._faCity;}) : devList;

    var alertRows = filtered.slice(0,25).map(function(dev, idx) {
        SeededRandom.reset(idx * 7919 + 20260517);
        var discCnt   = SeededRandom.int(2, 180);
        var userCnt   = SeededRandom.int(10, 3000);
        var duration  = SeededRandom.float(0.5, 48.0, 1);
        var reconRate = SeededRandom.float(72, 99, 1);
        var sev = discCnt > 100 ? '高' : (discCnt > 40 ? '中' : '低');
        if (self._faSeverity && sev !== self._faSeverity) return '';
        var sevCls = sev === '高' ? 'status-error' : (sev === '中' ? 'status-warning' : 'status-normal');
        var period = '2026-05-17 ' + SeededRandom.int(0,22) + ':00~' + SeededRandom.int(1,23) + ':59';
        return '<tr>' +
            '<td style="font-size:11px;">' + (dev.id||dev.name||'-') + '</td>' +
            '<td>' + (dev.city||'-') + '</td>' +
            '<td><span style="color:#e74c3c;font-weight:600;">'+discCnt+'</span></td>' +
            '<td>'+userCnt+'</td>' +
            '<td>'+duration+' h</td>' +
            '<td>'+reconRate+'%</td>' +
            '<td><span class="'+sevCls+'">'+sev+'</span></td>' +
            '<td style="font-size:11px;">'+period+'</td>' +
            '<td><a style="color:#2b7de9;cursor:pointer;" onclick="Modal.toast(\'已生成质差月报\',\'success\')">输出月报</a></td>' +
            '</tr>';
    }).filter(Boolean).join('');

    // 散点数据（断线次数 vs 影响用户数）
    SeededRandom.reset(20260517 + 6);
    var scatterData = [];
    for (var i=0;i<50;i++) {
        scatterData.push([SeededRandom.int(1,180), SeededRandom.int(5,2500), SeededRandom.pick(['OLT','BRAS','小区'])]);
    }

    var cityOpts = '<option value="">全部地市</option>'+cities.map(function(c){
        return '<option value="'+c+'"'+(c===self._faCity?' selected':'')+'>'+c+'</option>';
    }).join('');
    var devOpts = ['OLT','BRAS','小区'].map(function(d){
        return '<option value="'+d+'"'+(d===self._faDevice?' selected':'')+'>'+d+'维度</option>';
    }).join('');
    var sevOpts = '<option value="">全部等级</option>'+['高','中','低'].map(function(s){
        return '<option value="'+s+'"'+(s===self._faSeverity?' selected':'')+'>'+s+'</option>';
    }).join('');

    container.innerHTML =
        '<div class="page-content">' +
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
        '<div class="wo-stat-card"><div class="wo-stat-value">'+filtered.slice(0,25).length+'</div><div class="wo-stat-label">分析设备数</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">'+filtered.slice(0,25).filter(function(_,i){return i<8;}).length+'</div><div class="wo-stat-label">高频中断设备</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">4,823</div><div class="wo-stat-label">累计中断次数</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">38,640</div><div class="wo-stat-label">受影响用户次</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">91.2%</div><div class="wo-stat-label">平均重连成功率</div></div>' +
        '</div>' +
        '<div class="remote-panel"><div class="remote-panel-title">通滤波聚类分析（按小区、OLT、BRAS等维度进行中断次数聚类，输出质差日报/周报/月报）</div>' +
        '<div class="remote-form">' +
        '<div class="form-group"><label class="form-label">分析维度</label><select class="form-select" id="faDimF" onchange="EnhancePages._faDevice=this.value;EnhancePages.renderFilterAnalysis(document.getElementById(\'page-filter-analysis\'))">'+devOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">地市</label><select class="form-select" id="faCityF" onchange="EnhancePages._faCity=this.value;EnhancePages.renderFilterAnalysis(document.getElementById(\'page-filter-analysis\'))">'+cityOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">严重等级</label><select class="form-select" id="faSevF" onchange="EnhancePages._faSeverity=this.value;EnhancePages.renderFilterAnalysis(document.getElementById(\'page-filter-analysis\'))">'+sevOpts+'</select></div>' +
        '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
        '<button class="btn btn-primary" onclick="EnhancePages.renderFilterAnalysis(document.getElementById(\'page-filter-analysis\'))">重新分析</button>' +
        '<button class="btn" onclick="EnhancePages._faCity=\'\';EnhancePages._faSeverity=\'\';EnhancePages.renderFilterAnalysis(document.getElementById(\'page-filter-analysis\'))">重置</button>' +
        '<button class="btn" onclick="Modal.toast(\'质差月报已生成\',\'success\')">批量输出月报</button>' +
        '</div></div></div>' +
        '<div style="margin-bottom:8px;padding:10px 12px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:4px;font-size:12px;color:#c0392b;">' +
        '<strong>滤波说明：</strong>系统自动对各'+self._faDevice+'设备进行滑动窗口滤波，过滤偶发抖动，保留真实中断事件；' +
        '当单设备24h内中断次数 &gt; 40次判定为<strong>中</strong>，&gt; 100次判定为<strong>高</strong>。' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
        '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">中断次数 vs 影响用户数（散点）</span></div><div class="chart-container" id="faScatterChart"></div></div>' +
        '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">高频中断设备 TOP10</span></div><div class="chart-container" id="faTopChart"></div></div>' +
        '</div>' +
        '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">'+self._faDevice+'维度中断聚类明细（按中断次数降序）</div>' +
        '<table class="data-table"><thead><tr><th>设备ID</th><th>地市</th><th>中断次数</th><th>影响用户</th><th>持续时长</th><th>重连成功率</th><th>严重等级</th><th>发生时段</th><th>操作</th></tr></thead>' +
        '<tbody>'+(alertRows||'<tr><td colspan="9" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>')+'</tbody></table></div></div>';

    setTimeout(function(){
        // 散点图
        var d1 = document.getElementById('faScatterChart');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['faScatterChart'] = c1;
            c1.setOption({
                tooltip:{formatter:function(p){return '中断:'+p.value[0]+'次<br/>影响:'+p.value[1]+'用户';}},
                grid:{top:20,right:20,bottom:40,left:55},
                xAxis:{type:'value',name:'中断次数',splitLine:{lineStyle:{color:'#f0f2f5'}},nameTextStyle:{fontSize:10}},
                yAxis:{type:'value',name:'影响用户',splitLine:{lineStyle:{color:'#f0f2f5'}},nameTextStyle:{fontSize:10}},
                series:[{type:'scatter',data:scatterData.map(function(d){return [d[0],d[1]];}),
                    symbolSize:function(d){return Math.min(6+d[0]/12,20);},
                    itemStyle:{color:'#2b7de9',opacity:0.7}}]
            });
            window.addEventListener('resize',function(){c1.resize();});
        }
        // TOP10柱图
        var d2 = document.getElementById('faTopChart');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['faTopChart'] = c2;
            SeededRandom.reset(20260517+7);
            var topDevs=[]; for(var i=0;i<10;i++) topDevs.push({name:self._faDevice+'-TOP'+(i+1),val:SeededRandom.int(40,180)});
            topDevs.sort(function(a,b){return a.val-b.val;});
            c2.setOption({
                tooltip:{trigger:'axis'},
                grid:{top:10,right:60,bottom:10,left:90},
                yAxis:{type:'category',data:topDevs.map(function(d){return d.name;}),axisLabel:{fontSize:9}},
                xAxis:{type:'value',axisLabel:{fontSize:9}},
                series:[{type:'bar',data:topDevs.map(function(d){
                    return {value:d.val,itemStyle:{color:d.val>100?'#e74c3c':(d.val>60?'#f39c12':'#5b8ff9')}};
                }),barWidth:'55%',label:{show:true,position:'right',fontSize:9}}]
            });
            window.addEventListener('resize',function(){c2.resize();});
        }
    },50);
};


// ============================================================
// 4. 用户数分析
// ============================================================
EnhancePages._ucCity   = '';
EnhancePages._ucDim    = 'city';
EnhancePages._ucPeriod = 'day';

EnhancePages.renderUserCountAnalysis = function (container) {
    var self = this;
    var cities = JilinData.cities;
    SeededRandom.reset(20260517 + 10);

    // 近7日全省用户数趋势
    var dayLabels = ['05-11','05-12','05-13','05-14','05-15','05-16','05-17'];
    var totalArr=[], activeArr=[], dpiActiveArr=[];
    dayLabels.forEach(function(){
        var t = SeededRandom.float(365.0, 366.5, 2);
        var a = SeededRandom.float(215.0, 228.0, 2);
        var d = SeededRandom.float(210.0, 226.0, 2);
        totalArr.push(t); activeArr.push(a); dpiActiveArr.push(d);
    });

    // 各地市用户数明细
    var cityRows = cities.map(function(c) {
        SeededRandom.reset(c.charCodeAt(0)*53+20260517);
        var dist = JilinData.cityGatewayDistribution[c] || {};
        var gw   = dist.gateway   || SeededRandom.float(5, 80, 2);
        var agw  = dist.activeGateway || SeededRandom.float(4, 78, 2);
        var usr  = dist.users     || SeededRandom.float(8, 130, 2);
        var dpi  = dist.activeDpi || SeededRandom.float(5, 80, 2);
        var ratio= (dpi / usr * 100).toFixed(1);
        var mom  = (SeededRandom.next() > 0.5 ? '+' : '-') + SeededRandom.float(0.1, 2.5, 2) + '%';
        var momCls = mom[0]==='+' ? 'color:#27ae60;' : 'color:#e74c3c;';
        return '<tr><td><strong>'+c+'</strong></td>' +
            '<td>'+gw.toFixed(2)+' 万</td>' +
            '<td>'+agw.toFixed(2)+' 万</td>' +
            '<td>'+usr.toFixed(2)+' 万</td>' +
            '<td><span style="color:#2b7de9;font-weight:600;">'+dpi.toFixed(2)+' 万</span></td>' +
            '<td>'+ratio+'%</td>' +
            '<td><span style="'+momCls+'font-weight:600;">'+mom+'</span></td>' +
            '<td><a style="color:#2b7de9;cursor:pointer;" onclick="EnhancePages.showUcCityTrend(\''+c+'\')">趋势</a></td></tr>';
    }).join('');

    // 当日全省KPI
    var kwTotal = 365.2, kwActive = 215.6, kwDpi = 227.9, kwRatio = 67.3;
    var mom1 = '+0.12%', mom2 = '+0.38%';

    var cityOpts = '<option value="">全部地市</option>'+cities.map(function(c){
        return '<option value="'+c+'"'+(c===self._ucCity?' selected':'')+'>'+c+'</option>';
    }).join('');
    var dimOpts = [{v:'city',l:'地市维度'},{v:'district',l:'区县维度'},{v:'olt',l:'OLT维度'},{v:'bras',l:'BRAS维度'}].map(function(d){
        return '<option value="'+d.v+'"'+(d.v===self._ucDim?' selected':'')+'>'+d.l+'</option>';
    }).join('');
    var periodOpts = ['day','week','month'].map(function(p){
        var l = p==='day'?'天':p==='week'?'周':'月';
        return '<option value="'+p+'"'+(p===self._ucPeriod?' selected':'')+'>'+l+'</option>';
    }).join('');

    container.innerHTML =
        '<div class="page-content">' +
        '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:8px;">' +
        '<div class="wo-stat-card"><div class="wo-stat-value">'+kwTotal+'<span style="font-size:11px;font-weight:400;">万</span></div><div class="wo-stat-label">用户总数</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#2b7de9;">'+kwActive+'<span style="font-size:11px;font-weight:400;">万</span></div><div class="wo-stat-label">有流量网关</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">'+kwDpi+'<span style="font-size:11px;font-weight:400;">万</span></div><div class="wo-stat-label">DPI有流量</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">'+kwRatio+'%</div><div class="wo-stat-label">活跃率</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;font-size:16px;">'+mom1+'</div><div class="wo-stat-label">用户数环比</div></div>' +
        '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;font-size:16px;">'+mom2+'</div><div class="wo-stat-label">活跃用户环比</div></div>' +
        '</div>' +
        '<div class="remote-panel"><div class="remote-panel-title">用户数分析（按地市/区县/OLT/BRAS维度统计用户规模与活跃度趋势）</div>' +
        '<div class="remote-form">' +
        '<div class="form-group"><label class="form-label">地市</label><select class="form-select" id="ucCityF" onchange="EnhancePages._ucCity=this.value;EnhancePages.renderUserCountAnalysis(document.getElementById(\'page-user-count-analysis\'))">'+cityOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">分析维度</label><select class="form-select" id="ucDimF" onchange="EnhancePages._ucDim=this.value;EnhancePages.renderUserCountAnalysis(document.getElementById(\'page-user-count-analysis\'))">'+dimOpts+'</select></div>' +
        '<div class="form-group"><label class="form-label">时间粒度</label><select class="form-select" id="ucPeriodF" onchange="EnhancePages._ucPeriod=this.value;EnhancePages.renderUserCountAnalysis(document.getElementById(\'page-user-count-analysis\'))">'+periodOpts+'</select></div>' +
        '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
        '<button class="btn btn-primary" onclick="EnhancePages.renderUserCountAnalysis(document.getElementById(\'page-user-count-analysis\'))">查询</button>' +
        '<button class="btn" onclick="EnhancePages._ucCity=\'\';EnhancePages.renderUserCountAnalysis(document.getElementById(\'page-user-count-analysis\'))">重置</button>' +
        '<button class="btn" onclick="Modal.toast(\'用户数报告已导出\',\'success\')">导出</button>' +
        '</div></div></div>' +
        '<div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-bottom:8px;">' +
        '<div class="chart-card" style="min-height:290px;"><div class="chart-card-header"><span class="chart-title">近7日用户数趋势（万）</span></div><div class="chart-container" id="ucTrendChart"></div></div>' +
        '<div class="chart-card" style="min-height:290px;"><div class="chart-card-header"><span class="chart-title">用户活跃度分布</span></div><div class="chart-container" id="ucPieChart"></div></div>' +
        '</div>' +
        '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">各地市用户规模明细</div>' +
        '<table class="data-table"><thead><tr><th>地市</th><th>网关总数</th><th>有流量网关</th><th>用户总数</th><th>DPI活跃用户</th><th>活跃率</th><th>环比</th><th>操作</th></tr></thead>' +
        '<tbody>'+cityRows+'</tbody></table></div></div>';

    setTimeout(function(){
        // 趋势折线
        var d1 = document.getElementById('ucTrendChart');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['ucTrendChart'] = c1;
            c1.setOption({
                tooltip:{trigger:'axis'},
                legend:{data:['用户总数','有流量网关','DPI活跃'],bottom:0,textStyle:{fontSize:10}},
                grid:{top:20,right:20,bottom:40,left:55},
                xAxis:{type:'category',data:dayLabels,axisLabel:{fontSize:10}},
                yAxis:{type:'value',name:'万',splitLine:{lineStyle:{color:'#f0f2f5'}},axisLabel:{fontSize:10}},
                series:[
                    {name:'用户总数',type:'line',data:totalArr,smooth:true,lineStyle:{width:2,color:'#2b7de9'},symbol:'circle',symbolSize:5},
                    {name:'有流量网关',type:'line',data:activeArr,smooth:true,lineStyle:{width:2,color:'#27ae60'},symbol:'circle',symbolSize:5},
                    {name:'DPI活跃',type:'line',data:dpiActiveArr,smooth:true,lineStyle:{width:2,color:'#f39c12'},symbol:'circle',symbolSize:5}
                ]
            });
            window.addEventListener('resize',function(){c1.resize();});
        }
        // 活跃度饼图
        var d2 = document.getElementById('ucPieChart');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['ucPieChart'] = c2;
            c2.setOption({
                tooltip:{trigger:'item',formatter:'{b}: {c}万 ({d}%)'},
                legend:{bottom:0,textStyle:{fontSize:10}},
                series:[{type:'pie',radius:['35%','62%'],center:['50%','45%'],
                    data:[
                        {name:'DPI活跃',value:227.9,itemStyle:{color:'#2b7de9'}},
                        {name:'网关有流量',value:215.6,itemStyle:{color:'#27ae60'}},
                        {name:'无流量用户',value:137.3,itemStyle:{color:'#e0e4e8'}}
                    ],
                    label:{fontSize:10},itemStyle:{borderRadius:4}}]
            });
            window.addEventListener('resize',function(){c2.resize();});
        }
    }, 50);
};

EnhancePages.showUcCityTrend = function (city) {
    SeededRandom.reset(city.charCodeAt(0)+20260517+100);
    var days = ['05-11','05-12','05-13','05-14','05-15','05-16','05-17'];
    var dist = JilinData.cityGatewayDistribution[city] || {users:10};
    var base = dist.users;
    var trend = days.map(function(){ return parseFloat((base * (0.98 + SeededRandom.next()*0.04)).toFixed(2)); });
    Modal.show('用户数趋势 - '+city,
        '<div class="chart-container" id="ucCityTrendChart" style="height:260px;"></div>',
        '<button class="btn btn-primary" onclick="Modal.close()">关闭</button>','560px');
    setTimeout(function(){
        var d = document.getElementById('ucCityTrendChart');
        if (d) {
            var c = echarts.init(d);
            c.setOption({
                tooltip:{trigger:'axis'},
                grid:{top:20,right:20,bottom:30,left:55},
                xAxis:{type:'category',data:days},
                yAxis:{type:'value',name:'万',axisLabel:{fontSize:10}},
                series:[{type:'line',data:trend,smooth:true,lineStyle:{width:2,color:'#2b7de9'},
                    areaStyle:{color:'rgba(43,125,233,0.1)'},symbol:'circle',symbolSize:5,
                    label:{show:true,position:'top',fontSize:9,formatter:function(p){return p.value+'万';}}}]
            });
        }
    },100);
};
