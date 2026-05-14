/**
 * 数据源适配层 - 自动检测后端可用性
 * 后端在线时走REST API（真实数据库），离线时降级到本地JilinData/DataStore
 */
var DataSource = {
    _mode: 'local',  // 'api' | 'local'
    _checked: false,
    _apiReady: false,

    // 初始化：检测后端是否可用
    init: async function() {
        if (this._checked) return;
        this._checked = true;
        try {
            var resp = await fetch(API.baseUrl + '/cities', { signal: AbortSignal.timeout(2000) });
            if (resp.ok) {
                var data = await resp.json();
                if (data && data.code === 200 && data.data && data.data.length > 0) {
                    this._mode = 'api';
                    this._apiReady = true;
                    console.log('%c[DataSource] 后端API已连接，使用数据库模式', 'color:#27ae60;font-weight:bold;');
                    this._showModeIndicator('数据库模式');
                    return;
                }
            }
        } catch(e) { /* 后端不可用 */ }
        this._mode = 'local';
        console.log('%c[DataSource] 后端未启动，使用本地演示数据', 'color:#f39c12;font-weight:bold;');
        this._showModeIndicator('本地演示模式');
    },

    isApiMode: function() { return this._mode === 'api'; },

    _showModeIndicator: function(text) {
        var el = document.getElementById('dataModeIndicator');
        if (!el) {
            el = document.createElement('div');
            el.id = 'dataModeIndicator';
            el.style.cssText = 'position:fixed;bottom:10px;right:10px;padding:4px 12px;border-radius:12px;font-size:11px;z-index:9999;cursor:pointer;transition:opacity 0.3s;';
            el.onclick = function() { DataSource.showModeInfo(); };
            document.body.appendChild(el);
        }
        if (this._mode === 'api') {
            el.style.background = '#27ae60';
            el.style.color = '#fff';
            el.textContent = '● ' + text;
        } else {
            el.style.background = '#f39c12';
            el.style.color = '#fff';
            el.textContent = '○ ' + text;
        }
    },

    showModeInfo: function() {
        var info = this._mode === 'api' ?
            '<div style="font-size:13px;line-height:2;">' +
            '<div><strong>当前模式：</strong><span style="color:#27ae60;">数据库模式 (SQLite)</span></div>' +
            '<div><strong>后端地址：</strong>' + API.baseUrl + '</div>' +
            '<div><strong>数据来源：</strong>server/db/platform.db</div>' +
            '<div><strong>数据流转：</strong>前端 → REST API → Express → sql.js → SQLite</div>' +
            '<div style="margin-top:8px;padding:8px;background:#f0f5ff;border-radius:4px;font-size:12px;">所有增删改查操作均通过API持久化到数据库，支持多端同步。</div></div>' :
            '<div style="font-size:13px;line-height:2;">' +
            '<div><strong>当前模式：</strong><span style="color:#f39c12;">本地演示模式</span></div>' +
            '<div><strong>数据来源：</strong>JilinData (内存) + localStorage</div>' +
            '<div><strong>切换方式：</strong>启动后端服务即可自动切换</div>' +
            '<div style="margin-top:8px;padding:8px;background:#fff8e6;border-radius:4px;font-size:12px;">' +
            '<strong>启动后端：</strong><br>cd server<br>npm install<br>node db/seed.js<br>node server.js</div></div>';
        Modal.show('数据源信息', info, '<button class="btn btn-primary" onclick="Modal.close()">确定</button>', '450px');
    },

    // ====== 统一数据接口 ======

    // 获取首页驾驶舱数据
    getDashboard: async function() {
        if (this._mode === 'api') {
            return await API.dashboard();
        }
        // 本地模式
        var d = JilinData.dashboardData;
        var m = JilinData.kpiMetrics;
        return {
            summary: { totalUsers: m.totalBroadbandUsers, activeUsers: m.activeUsers, gatewayCount: 216.39, avgCei: m.totalCeiScore, avgSpeed: m.avgDownloadSpeed, avgLatency: m.avgLatency, workOrders: m.workOrderCount, qualityIssues: JilinData.userQualityRecords.length },
            cityRanking: d.cityRanking,
            todayAlerts: d.todayAlerts,
            pendingOrders: JilinData.workOrderStats.pending,
            deviceHealth: { brasTotal: JilinData.brasDevices.length, brasNormal: JilinData.brasDevices.filter(function(b){return b.status==='正常';}).length, oltTotal: JilinData.oltDevices.length, oltOnline: JilinData.oltDevices.filter(function(o){return o.online;}).length },
            bizDist: d.bizDistribution,
            alertTrend: d.alertTrend,
            qualityTop5: JilinData.qualityTop5Reasons
        };
    },

    // 获取CEI趋势
    getCeiTrend: async function(cityId) {
        if (this._mode === 'api') {
            return await API.ceiTrend(cityId ? { city_id: cityId } : {});
        }
        var t = JilinData.ceiTrendData;
        return t.labels.map(function(d, i) {
            return { record_date: '2025-' + (d.indexOf('12') === 0 ? '12' : '11') + '-' + d.split('-')[1], overall: t.overall[i], business: t.business[i], network: t.network[i] };
        });
    },

    // 获取工单列表
    getWorkOrders: async function(params) {
        if (this._mode === 'api') {
            return await API.workOrders(params);
        }
        // 本地模式 - 从DataStore获取
        var data = DataStore.load('workOrders', null);
        if (!data || !data.length) data = JilinData.workOrderList;
        if (params && params.city_id) {
            var cityName = JilinData.cities[parseInt(params.city_id) - 1];
            if (cityName) data = data.filter(function(d) { return d.city === cityName; });
        }
        if (params && params.status) data = data.filter(function(d) { return d.status === params.status; });
        var page = parseInt(params && params.page) || 1;
        var pageSize = parseInt(params && params.pageSize) || 15;
        var total = data.length;
        var sliced = data.slice((page - 1) * pageSize, page * pageSize);
        return { data: sliced, pagination: { page: page, pageSize: pageSize, total: total, totalPages: Math.ceil(total / pageSize) } };
    },

    // 获取工单统计
    getWorkOrderStats: async function() {
        if (this._mode === 'api') {
            return await API.workOrderStats();
        }
        var s = JilinData.workOrderStats;
        return { stats: s, cityDist: Object.keys(JilinData.workOrderCityDistribution).map(function(c) { return { city_name: c, count: JilinData.workOrderCityDistribution[c] }; }) };
    },

    // 获取GIS数据
    getGisData: async function() {
        if (this._mode === 'api') {
            return await API.gis();
        }
        var result = [];
        for (var city in JilinData.gisCoordinates) {
            var c = JilinData.gisCoordinates[city];
            var users = JilinData.cityGatewayDistribution[city] ? JilinData.cityGatewayDistribution[city].users : 0;
            result.push({ city_name: city, lng: c.lng, lat: c.lat, ceiScore: c.ceiScore, total_users: users });
        }
        return result;
    },

    // 获取设备统计
    getDeviceStats: async function() {
        if (this._mode === 'api') {
            return await API.deviceStats();
        }
        return {
            gateway: { totalWan: 216.39, onlineWan: 215.8, offlineWan: 0.59, abnormalWan: 0.36 },
            olt: JilinData.oltStats,
            cityGateway: Object.keys(JilinData.cityGatewayDistribution).map(function(c) {
                var d = JilinData.cityGatewayDistribution[c];
                return { city_name: c, gateway_count: d.gateway, active_gateway_count: d.activeGateway, total_users: d.users, dpi_active_users: d.activeDpi };
            })
        };
    },

    // 获取PON异常
    getPonAnomalies: async function(params) {
        if (this._mode === 'api') {
            return await API.ponAnomalies(params);
        }
        return null; // 降级到本地Pages逻辑
    },

    // 获取用户质差
    getUserQuality: async function(params) {
        if (this._mode === 'api') {
            return await API.userQuality(params);
        }
        return null;
    },

    // 获取质差聚类
    getQualityCluster: async function() {
        if (this._mode === 'api') {
            return await API.qualityCluster();
        }
        return null;
    },

    // 获取系统用户
    getSystemUsers: async function() {
        if (this._mode === 'api') {
            return await API.systemUsers();
        }
        return DataStore.load('users', []);
    },

    // 获取操作日志
    getLogs: async function(params) {
        if (this._mode === 'api') {
            return await API.logs(params);
        }
        return null;
    },

    // 获取配置
    getConfigs: async function(params) {
        if (this._mode === 'api') {
            return await API.configs(params);
        }
        return DataStore.load('configs', []);
    },

    // 获取地市列表
    getCities: async function() {
        if (this._mode === 'api') {
            return await API.cities();
        }
        return JilinData.cities.map(function(c, i) { return { id: i + 1, city_name: c }; });
    },

    // 创建工单（API模式写入数据库）
    createWorkOrder: async function(params) {
        if (this._mode === 'api') {
            return await API.createWorkOrder(params);
        }
        return null; // 本地模式由Pages自行处理
    },

    // 派发工单
    dispatchWorkOrder: async function(woId, params) {
        if (this._mode === 'api') {
            return await API.dispatchWorkOrder(woId, params);
        }
        return null;
    },

    // 解决工单
    resolveWorkOrder: async function(woId) {
        if (this._mode === 'api') {
            return await API.resolveWorkOrder(woId);
        }
        return null;
    },

    // 关闭工单
    closeWorkOrder: async function(woId) {
        if (this._mode === 'api') {
            return await API.closeWorkOrder(woId);
        }
        return null;
    }
};

// 页面加载时自动检测
document.addEventListener('DOMContentLoaded', function() {
    DataSource.init();
});
