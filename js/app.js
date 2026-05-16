/**
 * 家宽网络质量分析平台 - 主应用逻辑 (增强版)
 * 城市切换时图表和表格数据真实联动变化
 */

var App = {
    currentPage: 'broadband-quality',
    currentContentTab: '用户',
    currentSubTab: '用户数',
    currentCity: '全省',
    currentTimeGranularity: '天',
    chartInstances: {},

    init: function() {
        this.bindSidebarToggle();
        this.bindQueryEvents();
        this.bindContentTabEvents();
        this.loadPage('broadband-quality');
    },

    bindSidebarToggle: function() {
        document.querySelectorAll('.menu-group-title').forEach(function(title) {
            if (title.getAttribute('data-page')) return;
            title.addEventListener('click', function() {
                var group = this.parentElement;
                var wasExpanded = group.classList.contains('expanded');
                document.querySelectorAll('.menu-group').forEach(function(g) { g.classList.remove('expanded'); });
                if (!wasExpanded) group.classList.add('expanded');
            });
        });
        var firstGroup = document.querySelector('.menu-group');
        if (firstGroup) firstGroup.classList.add('expanded');
    },

    bindQueryEvents: function() {
        document.querySelectorAll('.time-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.time-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                App.currentTimeGranularity = this.textContent.trim();
            });
        });
        document.querySelectorAll('.region-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.region-tab').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                App.currentCity = this.textContent.trim();
                App.updateSelectedTags();
                // 真实刷新数据
                App.refreshCharts();
            });
        });
        document.querySelectorAll('.biz-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.biz-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
            });
        });
        var queryBtn = document.getElementById('btnQuery');
        if (queryBtn) queryBtn.addEventListener('click', function() { App.refreshCharts(); });
        var resetBtn = document.getElementById('btnReset');
        if (resetBtn) resetBtn.addEventListener('click', function() { App.resetQuery(); });
    },

    bindContentTabEvents: function() {
        document.querySelectorAll('.content-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.content-tab').forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                App.currentContentTab = this.textContent.trim();
                App.loadContentTab(App.currentContentTab);
            });
        });
    },

    updateSelectedTags: function() {
        var container = document.getElementById('selectedTags');
        if (!container) return;
        container.innerHTML = '';
        [App.currentCity, App.currentTimeGranularity].forEach(function(t) {
            var tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = t + ' <span class="tag-close" onclick="this.parentElement.remove()">x</span>';
            container.appendChild(tag);
        });
    },

    // 获取当前城市数据
    _getCityData: function() {
        return JilinData.getCityTimeSeriesData(this.currentCity);
    },

    loadPage: function(page) {
        this.currentPage = page;
        document.querySelectorAll('.page-container').forEach(function(c) { c.classList.remove('active'); });
        var target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        var tabText = document.getElementById('activeTabText');
        var activeTab = document.getElementById('activeTab');
        if (page === 'home') {
            if (activeTab) activeTab.classList.remove('active');
            document.querySelectorAll('.tab-item').forEach(function(t) { t.classList.remove('active'); });
            var homeTab = document.querySelector('.tab-item[onclick*="home"]');
            if (homeTab) homeTab.classList.add('active');
        } else {
            if (activeTab) activeTab.classList.add('active');
        }

        if (page === 'broadband-quality') {
            this.loadContentTab('用户');
        } else if (page === 'home') {
            Pages.renderHome(target);
        }
    },

    loadContentTab: function(tab) {
        this.currentContentTab = tab;
        var chartArea = document.getElementById('chartsArea');
        if (!chartArea) return;
        if (tab === '用户') this.renderUserCharts(chartArea);
        else if (tab === '整体概况') this.renderOverviewContent(chartArea);
        else if (tab === '固关') this.renderGatewayContent(chartArea);
        else if (tab === 'OLT') this.renderOltContent(chartArea);
        else if (tab === 'BRAS') this.renderBrasContent(chartArea);
        else this.renderPlaceholderContent(chartArea, tab);
    },

    renderUserCharts: function(container) {
        var cityData = this._getCityData();
        container.innerHTML =
            '<div class="sub-tabs" style="margin:0 0 8px 0;padding:0;">' +
                '<button class="sub-tab active" onclick="App.switchSubTab(this,\'用户数\')">用户数</button>' +
            '</div>' +
            '<div class="charts-grid" style="flex:1;min-height:0;">' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">' + cityData.gatewayCount.title + '</span></div><div class="chart-container" id="chart1"></div></div>' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">' + cityData.activeGatewayCount.title + '</span></div><div class="chart-container" id="chart2"></div></div>' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">' + cityData.userCount.title + '</span></div><div class="chart-container" id="chart3"></div></div>' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">' + cityData.activeDpiUserCount.title + '</span></div><div class="chart-container" id="chart4"></div></div>' +
            '</div>';
        this.initBarChart('chart1', JilinData.dateRange.labels, cityData.gatewayCount.data);
        this.initBarChart('chart2', JilinData.dateRange.labels, cityData.activeGatewayCount.data);
        this.initBarChart('chart3', JilinData.dateRange.labels, cityData.userCount.data);
        this.initBarChart('chart4', JilinData.dateRange.labels, cityData.activeDpiUserCount.data);
    },

    renderOverviewContent: function(container) {
        var cityData = this._getCityData();
        var m = cityData.kpiMetrics;
        // 计算质差用户数
        var city = this.currentCity;
        var qualityUsers = city === '全省' ? JilinData.userQualityRecords : JilinData.userQualityRecords.filter(function(d) { return d.city === city; });
        var qualityUserCount = qualityUsers.length;
        var qualityActiveCount = qualityUsers.filter(function(d) { return d.status === '质差中'; }).length;
        // 工单闭环率
        var woData = city === '全省' ? JilinData.workOrderList : JilinData.workOrderList.filter(function(d) { return d.city === city; });
        var woTotal = woData.length;
        var woClosed = woData.filter(function(d) { return d.status === '已解决' || d.status === '已关闭'; }).length;
        var woCloseRate = woTotal > 0 ? (woClosed / woTotal * 100).toFixed(1) : 0;
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('宽带用户总数', m.totalBroadbandUsers, '万户', 0.3) +
                this.kpiCardHtml('活跃用户数', m.activeUsers, '万户', -0.2) +
                this.kpiCardHtml('总体CEI评分', m.totalCeiScore, '分', 0.5) +
                this.kpiCardHtml('业务CEI评分', m.businessCeiScore, '分', 0.3) +
                this.kpiCardHtml('通断CEI评分', m.networkCeiScore, '分', 0.2) +
                this.kpiCardHtml('质差用户数', qualityActiveCount, '户', -1.8) +
                this.kpiCardHtml('质差工单量', woTotal, '件', -2.1) +
                this.kpiCardHtml('工单闭环率', woCloseRate, '%', 1.5) +
            '</div>' +
            '<div class="charts-grid" style="flex:1;min-height:400px;">' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">CEI评分趋势（含通断CEI）</span></div><div class="chart-container" id="ceiChart"></div></div>' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">质差用户数/质差工单趋势</span></div><div class="chart-container" id="qualityTrendChart"></div></div>' +
            '</div>' +
            '<div class="charts-grid" style="min-height:300px;margin-top:8px;">' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">质差类型分布</span></div><div class="chart-container" id="qualityChart"></div></div>' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">质差应用数/工单闭环率趋势</span></div><div class="chart-container" id="woCloseChart"></div></div>' +
            '</div>';
        this.initCeiTrendChart('ceiChart');
        this.initQualityPieChart('qualityChart');
        this.initQualityTrendChart('qualityTrendChart');
        this.initWoCloseRateChart('woCloseChart');
    },

    renderGatewayContent: function(container) {
        var city = this.currentCity;
        var stats;
        if (city === '全省') {
            stats = JilinData.overviewTabs['固关'].metrics;
        } else {
            var dist = JilinData.cityGatewayDistribution[city];
            var ratio = dist ? dist.gateway / 216.39 : 0.1;
            stats = {
                total: parseFloat((216.39 * ratio).toFixed(2)),
                online: parseFloat((215.8 * ratio).toFixed(2)),
                offline: parseFloat((0.59 * ratio).toFixed(2)),
                abnormal: parseFloat((1.2 * ratio).toFixed(2))
            };
        }
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('网关总数', stats.total, '万', 0) +
                this.kpiCardHtml('在线网关', stats.online, '万', 0) +
                this.kpiCardHtml('离线网关', stats.offline, '万', 0) +
                this.kpiCardHtml('异常网关', stats.abnormal, '万', 0) +
            '</div>' +
            '<div class="chart-card" style="flex:1;min-height:300px;"><div class="chart-card-header"><span class="chart-title">' + (city === '全省' ? '各地市' : city) + '网关分布</span></div><div class="chart-container" id="gwDistChart"></div></div>';
        this.initCityBarChart('gwDistChart', 'gateway');
    },

    renderOltContent: function(container) {
        var city = this.currentCity;
        var filteredOlts = city === '全省' ? JilinData.oltDevices : JilinData.oltDevices.filter(function(d) { return d.city === city; });
        var s = {
            totalCount: filteredOlts.length,
            onlineCount: filteredOlts.filter(function(d) { return d.online; }).length,
            offlineCount: filteredOlts.filter(function(d) { return !d.online; }).length,
            abnormalCount: filteredOlts.filter(function(d) { return d.status === '告警'; }).length,
            overloadCount: filteredOlts.filter(function(d) { return d.cpuUsage > 80 || d.memUsage > 80; }).length
        };
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('OLT总数', s.totalCount, '台', 0) +
                this.kpiCardHtml('在线数', s.onlineCount, '台', 0) +
                this.kpiCardHtml('异常数', s.abnormalCount, '台', 0) +
                this.kpiCardHtml('过载数', s.overloadCount, '台', 0) +
            '</div>' +
            '<div class="chart-card" style="flex:1;min-height:300px;"><div class="chart-card-header"><span class="chart-title">' + (city === '全省' ? '' : city + ' ') + 'OLT设备健康度分布</span></div><div class="chart-container" id="oltChart"></div></div>';
        this.initOltChart('oltChart', filteredOlts);
    },

    renderBrasContent: function(container) {
        var city = this.currentCity;
        var filteredBras = city === '全省' ? JilinData.brasDevices : JilinData.brasDevices.filter(function(d) { return d.city === city; });
        var rows = '';
        filteredBras.forEach(function(d) {
            var cls = d.status === '正常' ? 'status-normal' : (d.status === '告警' ? 'status-warning' : 'status-error');
            rows += '<tr><td>' + d.name + '</td><td>' + d.city + '</td><td>' + d.model + '</td><td>' + d.users.toLocaleString() + '</td><td>' + d.ceiScore + '</td><td>' + d.uptime + '</td><td><span class="' + cls + '">' + d.status + '</span></td></tr>';
        });
        if (filteredBras.length === 0) {
            rows = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';
        }
        container.innerHTML =
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>BRAS名称</th><th>地市</th><th>型号</th><th>用户数</th><th>CEI评分</th><th>运行时间</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    },

    renderPlaceholderContent: function(container, tab) {
        var city = this.currentCity;
        if (tab === '传输') {
            this._renderTransmissionTab(container, city);
        } else if (tab === '终端') {
            this._renderTerminalTab(container, city);
        } else if (tab === '局端/线路') {
            this._renderLineTab(container, city);
        } else if (tab === '基础定界') {
            this._renderBasicDemarcation(container, city);
        } else if (tab === 'AI定界') {
            this._renderAiDemarcation(container, city);
        } else if (tab === '安市') {
            this._renderCityInstallTab(container, city);
        } else {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">--</div><div class="empty-text">' + tab + ' 模块开发中</div></div>';
        }
    },

    // 传输 tab
    _renderTransmissionTab: function(container, city) {
        SeededRandom.reset(20251202 + 100);
        var links = [];
        var types = ['OLT上行', 'BRAS上行', '城域骨干', '省际出口', 'CDN回源'];
        for (var i = 0; i < 20; i++) {
            var c = city === '全省' ? JilinData.cities[i % 10] : city;
            links.push({
                id: 'TL-' + String(i + 1).padStart(4, '0'),
                city: c,
                type: SeededRandom.pick(types),
                bandwidth: SeededRandom.pick(['1G', '10G', '40G', '100G']),
                utilization: SeededRandom.float(15, 92, 1),
                peakUtil: SeededRandom.float(60, 99, 1),
                latency: SeededRandom.float(1, 15, 1),
                packetLoss: SeededRandom.float(0, 0.5, 3),
                status: SeededRandom.next() > 0.12 ? '正常' : '告警'
            });
        }
        if (city !== '全省') links = links.filter(function(d) { return d.city === city; });
        var rows = links.map(function(r) {
            var cls = r.status === '正常' ? 'status-normal' : 'status-warning';
            var utilCls = r.utilization > 80 ? 'status-error' : (r.utilization > 60 ? 'status-warning' : 'status-normal');
            return '<tr><td>' + r.id + '</td><td>' + r.city + '</td><td>' + r.type + '</td><td>' + r.bandwidth + '</td><td><span class="' + utilCls + '">' + r.utilization + '%</span></td><td>' + r.peakUtil + '%</td><td>' + r.latency + 'ms</td><td>' + r.packetLoss + '%</td><td><span class="' + cls + '">' + r.status + '</span></td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('传输链路总数', links.length, '条', 0) +
                this.kpiCardHtml('平均利用率', (links.reduce(function(s, l) { return s + l.utilization; }, 0) / links.length).toFixed(1), '%', 1.2) +
                this.kpiCardHtml('高负载链路', links.filter(function(l) { return l.utilization > 80; }).length, '条', -0.5) +
                this.kpiCardHtml('告警链路', links.filter(function(l) { return l.status === '告警'; }).length, '条', 0) +
            '</div>' +
            '<div class="data-table-wrapper" style="flex:1;"><table class="data-table"><thead><tr><th>链路ID</th><th>地市</th><th>链路类型</th><th>带宽</th><th>利用率</th><th>峰值利用率</th><th>时延</th><th>丢包率</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        SeededRandom.reset(20251202);
    },

    // 终端 tab
    _renderTerminalTab: function(container, city) {
        SeededRandom.reset(20251202 + 200);
        var models = ['HG8245H', 'HG8546M', 'F663N', 'HS8145V5', 'HG8145X6', 'HN8346Q', 'HG8245W5'];
        var termStats = models.map(function(m) {
            return { model: m, count: SeededRandom.int(5000, 45000), onlineRate: SeededRandom.float(92, 99.5, 1), avgCei: SeededRandom.float(88, 95, 1), faultRate: SeededRandom.float(0.5, 5, 2) };
        });
        var rows = termStats.map(function(t) {
            var ceiCls = t.avgCei >= 93 ? 'status-normal' : (t.avgCei >= 91 ? 'status-warning' : 'status-error');
            return '<tr><td>' + t.model + '</td><td>' + t.count.toLocaleString() + '</td><td>' + t.onlineRate + '%</td><td><span class="' + ceiCls + '">' + t.avgCei + '</span></td><td>' + t.faultRate + '%</td></tr>';
        }).join('');
        var totalTerminals = termStats.reduce(function(s, t) { return s + t.count; }, 0);
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('终端总数', (totalTerminals / 10000).toFixed(1), '万台', 0.8) +
                this.kpiCardHtml('终端型号数', models.length, '种', 0) +
                this.kpiCardHtml('平均在线率', (termStats.reduce(function(s, t) { return s + t.onlineRate; }, 0) / termStats.length).toFixed(1), '%', 0.3) +
                this.kpiCardHtml('平均故障率', (termStats.reduce(function(s, t) { return s + t.faultRate; }, 0) / termStats.length).toFixed(2), '%', -0.2) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:260px;"><div class="chart-card-header"><span class="chart-title">终端型号分布</span></div><div class="chart-container" id="termPieChart"></div></div>' +
                '<div class="chart-card" style="min-height:260px;"><div class="chart-card-header"><span class="chart-title">各型号CEI评分</span></div><div class="chart-container" id="termBarChart"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>终端型号</th><th>数量</th><th>在线率</th><th>平均CEI</th><th>故障率</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        // 终端饼图
        var pd = document.getElementById('termPieChart');
        if (pd) {
            var c = echarts.init(pd); this.chartInstances['termPieChart'] = c;
            c.setOption({ tooltip: { trigger: 'item' }, series: [{ type: 'pie', radius: ['30%', '60%'], data: termStats.map(function(t) { return { name: t.model, value: t.count }; }), label: { fontSize: 10 } }] });
            window.addEventListener('resize', function() { c.resize(); });
        }
        var bd = document.getElementById('termBarChart');
        if (bd) {
            var c2 = echarts.init(bd); this.chartInstances['termBarChart'] = c2;
            c2.setOption({ grid: { top: 15, right: 20, bottom: 40, left: 40 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: models, axisLabel: { fontSize: 9, rotate: 30 } }, yAxis: { type: 'value', min: 86, max: 96 }, series: [{ type: 'bar', data: termStats.map(function(t) { return { value: t.avgCei, itemStyle: { color: t.avgCei >= 93 ? '#27ae60' : (t.avgCei >= 91 ? '#f39c12' : '#e74c3c') } }; }), barWidth: '50%' }] });
            window.addEventListener('resize', function() { c2.resize(); });
        }
        SeededRandom.reset(20251202);
    },

    // 局端/线路 tab
    _renderLineTab: function(container, city) {
        SeededRandom.reset(20251202 + 300);
        var issues = ['弱光', '高误码', '光衰增大', '线路老化', '接头氧化', '光纤弯折'];
        var lineStats = [];
        for (var i = 0; i < 15; i++) {
            var c = city === '全省' ? JilinData.cities[i % 10] : city;
            lineStats.push({
                id: 'LINE-' + String(i + 1).padStart(4, '0'),
                city: c,
                oltId: 'OLT-' + c.substr(0, 1) + '-' + String(SeededRandom.int(1, 20)).padStart(4, '0'),
                ponPort: 'GPON 0/' + SeededRandom.int(0, 7) + '/' + SeededRandom.int(0, 15),
                rxPower: SeededRandom.float(-28, -16, 2),
                distance: SeededRandom.float(0.5, 15, 1),
                issue: SeededRandom.pick(issues),
                affectedUsers: SeededRandom.int(1, 128),
                status: SeededRandom.pick(['正常', '告警', '异常'])
            });
        }
        if (city !== '全省') lineStats = lineStats.filter(function(d) { return d.city === city; });
        var rows = lineStats.map(function(r) {
            var rxCls = r.rxPower < -25 ? 'status-error' : (r.rxPower < -22 ? 'status-warning' : 'status-normal');
            return '<tr><td>' + r.id + '</td><td>' + r.city + '</td><td>' + r.oltId + '</td><td>' + r.ponPort + '</td><td><span class="' + rxCls + '">' + r.rxPower + ' dBm</span></td><td>' + r.distance + ' km</td><td>' + r.issue + '</td><td>' + r.affectedUsers + '</td><td>' + Pages.statusHtml(r.status) + '</td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('线路总数', lineStats.length, '条', 0) +
                this.kpiCardHtml('弱光线路', lineStats.filter(function(l) { return l.rxPower < -25; }).length, '条', -1.2) +
                this.kpiCardHtml('告警线路', lineStats.filter(function(l) { return l.status === '告警'; }).length, '条', 0) +
                this.kpiCardHtml('影响用户', lineStats.reduce(function(s, l) { return s + l.affectedUsers; }, 0), '户', -0.8) +
            '</div>' +
            '<div class="data-table-wrapper" style="flex:1;"><table class="data-table"><thead><tr><th>线路ID</th><th>地市</th><th>OLT</th><th>PON口</th><th>接收光功率</th><th>距离</th><th>问题类型</th><th>影响用户</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        SeededRandom.reset(20251202);
    },

    // 基础定界 tab
    _renderBasicDemarcation: function(container, city) {
        var cityData = this._getCityData();
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('家庭侧质差', 42, '%', -1.5) +
                this.kpiCardHtml('网络侧质差', 35, '%', 0.8) +
                this.kpiCardHtml('内容侧质差', 23, '%', 0.3) +
                this.kpiCardHtml('定界准确率', 94.2, '%', 1.2) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:300px;">' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">定界结果分布</span></div><div class="chart-container" id="bdPieChart"></div></div>' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">TOP5质差原因</span></div><div class="chart-container" id="bdBarChart"></div></div>' +
            '</div>';
        var pd = document.getElementById('bdPieChart');
        if (pd) {
            var c = echarts.init(pd); this.chartInstances['bdPieChart'] = c;
            c.setOption({ tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' }, series: [{ type: 'pie', radius: ['35%', '60%'], data: [{ name: '家庭侧', value: 42, itemStyle: { color: '#5b8ff9' } }, { name: '网络侧', value: 35, itemStyle: { color: '#f6bd16' } }, { name: '内容侧', value: 23, itemStyle: { color: '#5ad8a6' } }], label: { fontSize: 11 } }] });
            window.addEventListener('resize', function() { c.resize(); });
        }
        var bd = document.getElementById('bdBarChart');
        if (bd) {
            var c2 = echarts.init(bd); this.chartInstances['bdBarChart'] = c2;
            c2.setOption({ grid: { top: 10, right: 30, bottom: 20, left: 90 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'value' }, yAxis: { type: 'category', data: ['带宽不足', 'WiFi信号弱', '光衰过大', '设备故障', '线路老化'].reverse(), axisLabel: { fontSize: 11 } }, series: [{ type: 'bar', data: [356, 412, 698, 523, 856].reverse(), itemStyle: { color: '#5b8ff9' }, label: { show: true, position: 'right', fontSize: 10 } }] });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    },

    // AI定界 tab
    _renderAiDemarcation: function(container, city) {
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('AI定界准确率', 96.8, '%', 2.3) +
                this.kpiCardHtml('AI模型版本', 'v3.2', '', 0) +
                this.kpiCardHtml('今日AI定界', 1256, '次', 5.2) +
                this.kpiCardHtml('AI vs 基础提升', '+2.6', '%', 0) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;min-height:300px;">' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">AI定界 vs 基础定界准确率对比</span></div><div class="chart-container" id="aiCompChart"></div></div>' +
                '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">AI定界原因分布</span></div><div class="chart-container" id="aiReasonChart"></div></div>' +
            '</div>';
        var cd = document.getElementById('aiCompChart');
        if (cd) {
            var c = echarts.init(cd); this.chartInstances['aiCompChart'] = c;
            var labels = JilinData.dateRange.labels;
            var aiData = labels.map(function() { return parseFloat((94 + Math.random() * 4).toFixed(1)); });
            var baseData = labels.map(function() { return parseFloat((90 + Math.random() * 5).toFixed(1)); });
            c.setOption({ grid: { top: 30, right: 20, bottom: 30, left: 40 }, tooltip: { trigger: 'axis' }, legend: { data: ['AI定界', '基础定界'], top: 0, textStyle: { fontSize: 10 } }, xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 9 } }, yAxis: { type: 'value', min: 85, max: 100 }, series: [{ name: 'AI定界', type: 'line', data: aiData, smooth: true, itemStyle: { color: '#5b8ff9' } }, { name: '基础定界', type: 'line', data: baseData, smooth: true, lineStyle: { type: 'dashed' }, itemStyle: { color: '#bbb' } }] });
            window.addEventListener('resize', function() { c.resize(); });
        }
        var rd = document.getElementById('aiReasonChart');
        if (rd) {
            var c2 = echarts.init(rd); this.chartInstances['aiReasonChart'] = c2;
            c2.setOption({ tooltip: { trigger: 'item' }, series: [{ type: 'pie', radius: ['30%', '58%'], data: [{ name: '光路衰减', value: 28 }, { name: 'WiFi干扰', value: 22 }, { name: '设备老化', value: 18 }, { name: '带宽拥塞', value: 15 }, { name: 'CDN异常', value: 10 }, { name: '其他', value: 7 }], label: { fontSize: 10 } }] });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    },

    // 安市 tab (装维网格)
    _renderCityInstallTab: function(container, city) {
        SeededRandom.reset(20251202 + 400);
        var grids = [];
        var gridNames = city === '全省' ?
            ['长春南关网格', '长春朝阳网格', '吉林昌邑网格', '四平铁西网格', '延边延吉网格', '松原宁江网格', '白城洮北网格', '通化东昌网格', '白山浑江网格', '辽源龙山网格'] :
            [city + '一网格', city + '二网格', city + '三网格', city + '四网格', city + '五网格'];
        gridNames.forEach(function(name) {
            grids.push({
                name: name,
                users: SeededRandom.int(5000, 35000),
                engineers: SeededRandom.int(2, 8),
                pendingOrders: SeededRandom.int(0, 15),
                avgResponseTime: SeededRandom.float(0.5, 4, 1),
                satisfaction: SeededRandom.float(92, 99, 1)
            });
        });
        var rows = grids.map(function(g) {
            var satCls = g.satisfaction >= 96 ? 'status-normal' : (g.satisfaction >= 93 ? 'status-warning' : 'status-error');
            return '<tr><td>' + g.name + '</td><td>' + g.users.toLocaleString() + '</td><td>' + g.engineers + '</td><td>' + g.pendingOrders + '</td><td>' + g.avgResponseTime + 'h</td><td><span class="' + satCls + '">' + g.satisfaction + '%</span></td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="kpi-grid">' +
                this.kpiCardHtml('装维网格数', grids.length, '个', 0) +
                this.kpiCardHtml('装维人员', grids.reduce(function(s, g) { return s + g.engineers; }, 0), '人', 0) +
                this.kpiCardHtml('待处理工单', grids.reduce(function(s, g) { return s + g.pendingOrders; }, 0), '件', -3.2) +
                this.kpiCardHtml('平均响应时长', (grids.reduce(function(s, g) { return s + g.avgResponseTime; }, 0) / grids.length).toFixed(1), '小时', -5.1) +
            '</div>' +
            '<div class="data-table-wrapper" style="flex:1;"><table class="data-table"><thead><tr><th>网格名称</th><th>覆盖用户</th><th>装维人员</th><th>待处理工单</th><th>平均响应时长</th><th>满意度</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        SeededRandom.reset(20251202);
    },

    kpiCardHtml: function(label, value, unit, trend) {
        var trendClass = trend > 0 ? 'trend-up' : (trend < 0 ? 'trend-down' : '');
        var trendIcon = trend > 0 ? '&#9650;' : (trend < 0 ? '&#9660;' : '-');
        var trendText = trend !== 0 ? (Math.abs(trend) + '%') : '';
        return '<div class="kpi-card"><div class="kpi-card-label">' + label + '</div><div class="kpi-card-value">' + value + '<span class="unit">' + unit + '</span></div><div class="kpi-card-footer"><span class="kpi-card-trend ' + trendClass + '">' + trendIcon + ' ' + trendText + '</span></div></div>';
    },

    switchSubTab: function(el, tab) {
        document.querySelectorAll('.sub-tab').forEach(function(t) { t.classList.remove('active'); });
        el.classList.add('active');
        this.currentSubTab = tab;
    },

    initBarChart: function(containerId, labels, data) {
        var dom = document.getElementById(containerId);
        if (!dom) return;
        if (this.chartInstances[containerId]) this.chartInstances[containerId].dispose();
        var chart = echarts.init(dom);
        this.chartInstances[containerId] = chart;
        var maxVal = Math.max.apply(null, data), minVal = Math.min.apply(null, data);
        chart.setOption({
            grid: { top: 30, right: 20, bottom: 30, left: 50 },
            tooltip: { trigger: 'axis', textStyle: { fontSize: 11 } },
            xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 10, color: '#999' }, axisLine: { lineStyle: { color: '#e0e4e8' } }, axisTick: { show: false } },
            yAxis: { type: 'value', min: Math.floor(minVal - (maxVal - minVal) * 0.3), axisLabel: { fontSize: 10, color: '#999' }, splitLine: { lineStyle: { color: '#f0f2f5' } }, axisLine: { show: false }, axisTick: { show: false } },
            series: [{ type: 'bar', data: data.map(function(v, i) { return { value: v, itemStyle: { color: (i === data.length - 1 || v === maxVal) ? '#5b8ff9' : '#b8d4fe' } }; }), barWidth: '50%',
                label: { show: true, position: 'top', fontSize: 9, color: '#999', formatter: function(p) { if (p.dataIndex === data.length - 1 || p.value === minVal || p.value === maxVal) return p.value; return ''; } }
            }]
        });
        window.addEventListener('resize', function() { chart.resize(); });
    },

    initCeiTrendChart: function(containerId) {
        var dom = document.getElementById(containerId);
        if (!dom) return;
        var chart = echarts.init(dom); this.chartInstances[containerId] = chart;
        var cityData = this._getCityData();
        var d = cityData.ceiTrendData;
        chart.setOption({
            grid: { top: 30, right: 20, bottom: 30, left: 40 }, tooltip: { trigger: 'axis' },
            legend: { data: ['综合CEI', '业务CEI', '网络CEI'], top: 0, textStyle: { fontSize: 10 } },
            xAxis: { type: 'category', data: d.labels, axisLabel: { fontSize: 10, color: '#999' } },
            yAxis: { type: 'value', min: 88, max: 96, axisLabel: { fontSize: 10, color: '#999' }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
            series: [
                { name: '综合CEI', type: 'line', data: d.overall, smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#5b8ff9' } },
                { name: '业务CEI', type: 'line', data: d.business, smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#5ad8a6' } },
                { name: '网络CEI', type: 'line', data: d.network, smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#f6bd16' } }
            ]
        });
        window.addEventListener('resize', function() { chart.resize(); });
    },

    initQualityPieChart: function(containerId) {
        var dom = document.getElementById(containerId);
        if (!dom) return;
        var chart = echarts.init(dom); this.chartInstances[containerId] = chart;
        var cityData = this._getCityData();
        chart.setOption({
            tooltip: { trigger: 'item', formatter: '{b}: {c}件 ({d}%)' },
            series: [{ type: 'pie', radius: ['35%', '60%'], center: ['50%', '55%'], label: { fontSize: 10 },
                data: cityData.qualityIssueTypes.map(function(item) { return { name: item.type, value: item.count }; })
            }]
        });
        window.addEventListener('resize', function() { chart.resize(); });
    },

    initCityBarChart: function(containerId, metric) {
        var dom = document.getElementById(containerId);
        if (!dom) return;
        var chart = echarts.init(dom); this.chartInstances[containerId] = chart;
        var cities = [], values = [];
        var city = this.currentCity;
        if (city === '全省') {
            for (var c in JilinData.cityGatewayDistribution) { cities.push(c); values.push(JilinData.cityGatewayDistribution[c][metric]); }
        } else {
            // 单城市显示各指标对比
            var d = JilinData.cityGatewayDistribution[city];
            if (d) {
                cities = ['网关数', '有流量网关', '用户数', '有流量用户'];
                values = [d.gateway, d.activeGateway, d.users, d.activeDpi];
            }
        }
        chart.setOption({
            grid: { top: 20, right: 20, bottom: 40, left: 50 }, tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: cities, axisLabel: { fontSize: 10, rotate: 30 } },
            yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
            series: [{ type: 'bar', data: values, barWidth: '50%', itemStyle: { color: '#5b8ff9' } }]
        });
        window.addEventListener('resize', function() { chart.resize(); });
    },

    initOltChart: function(containerId, oltList) {
        var dom = document.getElementById(containerId);
        if (!dom) return;
        var chart = echarts.init(dom); this.chartInstances[containerId] = chart;
        var normalCount = 0, abnormalCount = 0, overloadCount = 0, offlineCount = 0;
        oltList.forEach(function(olt) {
            if (!olt.online) offlineCount++;
            else if (olt.cpuUsage > 80 || olt.memUsage > 80) overloadCount++;
            else if (olt.status === '告警') abnormalCount++;
            else normalCount++;
        });
        chart.setOption({
            tooltip: { trigger: 'item' },
            series: [{ type: 'pie', radius: ['40%', '65%'], center: ['50%', '55%'], label: { fontSize: 11 },
                data: [
                    { name: '正常', value: normalCount, itemStyle: { color: '#27ae60' } },
                    { name: '异常', value: abnormalCount, itemStyle: { color: '#f39c12' } },
                    { name: '过载', value: overloadCount, itemStyle: { color: '#e74c3c' } },
                    { name: '离线', value: offlineCount, itemStyle: { color: '#bdc3c7' } }
                ]
            }]
        });
        window.addEventListener('resize', function() { chart.resize(); });
    },

    // 质差用户数/工单趋势图
    initQualityTrendChart: function(containerId) {
        var dom = document.getElementById(containerId);
        if (!dom) return;
        var chart = echarts.init(dom); this.chartInstances[containerId] = chart;
        var labels = JilinData.dateRange.labels;
        SeededRandom.reset(20251202 + 500);
        var qualityUserData = labels.map(function() { return SeededRandom.int(120, 280); });
        var woData = labels.map(function() { return SeededRandom.int(150, 320); });
        SeededRandom.reset(20251202);
        chart.setOption({
            grid: { top: 35, right: 60, bottom: 30, left: 45 },
            tooltip: { trigger: 'axis' },
            legend: { data: ['质差用户数', '质差工单量'], top: 0, textStyle: { fontSize: 10 } },
            xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 9, color: '#999' } },
            yAxis: [
                { type: 'value', name: '质差用户', axisLabel: { fontSize: 9 }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
                { type: 'value', name: '工单量', axisLabel: { fontSize: 9 }, splitLine: { show: false } }
            ],
            series: [
                { name: '质差用户数', type: 'line', data: qualityUserData, smooth: true, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(231,76,60,0.2)' }, { offset: 1, color: 'rgba(231,76,60,0)' }] } }, lineStyle: { color: '#e74c3c', width: 2 }, itemStyle: { color: '#e74c3c' } },
                { name: '质差工单量', type: 'bar', yAxisIndex: 1, data: woData, itemStyle: { color: '#b8d4fe' }, barWidth: '40%' }
            ]
        });
        window.addEventListener('resize', function() { chart.resize(); });
    },

    // 工单闭环率/质差应用趋势图
    initWoCloseRateChart: function(containerId) {
        var dom = document.getElementById(containerId);
        if (!dom) return;
        var chart = echarts.init(dom); this.chartInstances[containerId] = chart;
        var labels = JilinData.dateRange.labels;
        SeededRandom.reset(20251202 + 600);
        var closeRateData = labels.map(function() { return SeededRandom.float(88, 97, 1); });
        var appCountData = labels.map(function() { return SeededRandom.int(5, 18); });
        SeededRandom.reset(20251202);
        chart.setOption({
            grid: { top: 35, right: 60, bottom: 30, left: 45 },
            tooltip: { trigger: 'axis' },
            legend: { data: ['工单闭环率', '质差应用数'], top: 0, textStyle: { fontSize: 10 } },
            xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 9, color: '#999' } },
            yAxis: [
                { type: 'value', name: '闭环率(%)', min: 80, max: 100, axisLabel: { fontSize: 9 }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
                { type: 'value', name: '应用数', axisLabel: { fontSize: 9 }, splitLine: { show: false } }
            ],
            series: [
                { name: '工单闭环率', type: 'line', data: closeRateData, smooth: true, lineStyle: { color: '#27ae60', width: 2 }, itemStyle: { color: '#27ae60' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(39,174,96,0.15)' }, { offset: 1, color: 'rgba(39,174,96,0)' }] } } },
                { name: '质差应用数', type: 'bar', yAxisIndex: 1, data: appCountData, itemStyle: { color: '#f6bd16' }, barWidth: '35%' }
            ]
        });
        window.addEventListener('resize', function() { chart.resize(); });
    },

    refreshCharts: function() { this.loadContentTab(this.currentContentTab); },

    resetQuery: function() {
        document.querySelectorAll('.time-btn').forEach(function(b, i) { b.classList.toggle('active', i === 0); });
        document.querySelectorAll('.region-tab').forEach(function(t, i) { t.classList.toggle('active', i === 0); });
        this.currentCity = '全省';
        this.currentTimeGranularity = '天';
        this.updateSelectedTags();
        this.refreshCharts();
    }
};

// --- Page to group mapping for breadcrumb ---
var PAGE_GROUP_MAP = {
    'broadband-quality': '全景视图', 'gis-view': '全景视图', 'kpi-view': '全景视图', 'con-analysis': '全景视图', 'pon-power': '全景视图', 'optical-test': '全景视图',
    'cei-query': '质量画像', 'cei-cluster': '质量画像', 'quality-model': '质量画像', 'user-quality': '质量画像', 'quality-cluster': '质量画像', 'biz-quality': '质量画像', 'biz-cluster': '质量画像',
    'ce-location': '质差定界定位', 'biz-cei-boundary': '质差定界定位', 'biz-cei-locate': '质差定界定位', 'conn-cei-boundary': '质差定界定位', 'conn-cei-locate': '质差定界定位', 'dpi-capture': '质差定界定位', 'quality-location': '质差定界定位',
    'ping-test': '远程操作', 'ont-power': '远程操作', 'gateway-restart': '远程操作',
    'work-order': '工单闭环', 'work-order-eval': '工单闭环',
    'user-management': '用户管理',
    'log-management': '系统管理', 'config-center': '系统管理',
    'home': '首页'
};
var PAGE_LABEL_MAP = {
    'broadband-quality': '宽带网络质量分析', 'gis-view': '宽带运营GIS视图', 'kpi-view': '宽带质量KPI视图', 'con-analysis': 'CON网络分析', 'pon-power': 'PON光功率异常管理', 'optical-test': '光路测试上下线',
    'cei-query': '用户和业务CEI查询', 'cei-cluster': 'CEI聚类分析', 'quality-model': '质差模型', 'user-quality': '用户质差', 'quality-cluster': '质差聚类质差', 'biz-quality': '业务质差', 'biz-cluster': '业务聚类质差',
    'ce-location': '用户/账号定界查询', 'biz-cei-boundary': '业务CEI定界', 'biz-cei-locate': '业务CEI定位', 'conn-cei-boundary': '通断CEI定界', 'conn-cei-locate': '通断CEI定位', 'dpi-capture': 'DPI-XDR明细查询', 'quality-location': '质差定界定位',
    'ping-test': 'PING测试', 'ont-power': 'ONT光功率查询', 'gateway-restart': '网关远程重启',
    'work-order': '质差工单及派单管理', 'work-order-eval': '质差工单后评估',
    'user-management': '用户账号管理',
    'log-management': '日志管理', 'config-center': '配置中心',
    'home': '运营驾驶舱'
};

PAGE_GROUP_MAP['quality-tags'] = PAGE_GROUP_MAP['quality-cluster'];
PAGE_GROUP_MAP['cluster-alert'] = PAGE_GROUP_MAP['quality-cluster'];
PAGE_GROUP_MAP['cei-comparison'] = PAGE_GROUP_MAP['work-order'];
PAGE_GROUP_MAP['quality-loop'] = PAGE_GROUP_MAP['work-order'];
PAGE_LABEL_MAP['quality-tags'] = '质差标签管理';
PAGE_LABEL_MAP['cluster-alert'] = '多维聚类告警';
PAGE_LABEL_MAP['cei-comparison'] = 'CEI改善对比';
PAGE_LABEL_MAP['quality-loop'] = '质差闭环全景';

function updateBreadcrumb(page) {
    var group = PAGE_GROUP_MAP[page] || '首页';
    var label = PAGE_LABEL_MAP[page] || page;
    var bcGroup = document.getElementById('bcGroup');
    var bcPage = document.getElementById('bcPage');
    if (bcGroup) bcGroup.textContent = group;
    if (bcPage) bcPage.textContent = label;
}

// --- Header live clock ---
function startHeaderClock() {
    var el = document.getElementById('headerClock');
    if (!el) return;
    function update() {
        var now = new Date();
        var y = now.getFullYear(), mo = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
        var h = String(now.getHours()).padStart(2,'0'), mi = String(now.getMinutes()).padStart(2,'0'), s = String(now.getSeconds()).padStart(2,'0');
        el.textContent = y + '-' + mo + '-' + d + ' ' + h + ':' + mi + ':' + s;
    }
    update();
    setInterval(update, 1000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    App.init();
    startHeaderClock();
    updateBreadcrumb('broadband-quality');
});
