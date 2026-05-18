/**
 * 家宽网络质量分析平台 - 吉林省数据模块 (增强版)
 * 使用种子随机数生成器确保数据稳定不变
 */

// ========== 种子随机数生成器 ==========
var SeededRandom = (function() {
    var seed = 20251202;
    return {
        reset: function(s) { seed = s || 20251202; },
        next: function() {
            seed = (seed * 16807 + 0) % 2147483647;
            return (seed - 1) / 2147483646;
        },
        int: function(min, max) {
            return Math.floor(this.next() * (max - min + 1)) + min;
        },
        float: function(min, max, decimals) {
            var v = this.next() * (max - min) + min;
            return parseFloat(v.toFixed(decimals || 2));
        },
        pick: function(arr) {
            return arr[this.int(0, arr.length - 1)];
        },
        date: function(startStr, endStr) {
            var s = new Date(startStr).getTime();
            var e = new Date(endStr).getTime();
            var d = new Date(s + this.next() * (e - s));
            var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
            return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
        }
    };
})();

var JilinData = {
    // 吉林省地市列表
    cities: ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边', '长白山'],
    allCities: ['全省', '长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边', '长白山'],

    // 时间序列
    dateRange: {
        start: '2025-11-16',
        end: '2025-12-02',
        labels: ['11-16','11-17','11-18','11-19','11-20','11-21','11-22','11-23','11-24','11-25','11-26','11-27','11-28','11-29','11-30','12-01','12-02']
    },

    // ========== 全省用户统计 ==========
    gatewayCount: {
        title: '网关数（探计）（单位：万）',
        data: [218.5,219,218.3,217.8,217.5,218,218.2,217.6,217.3,216.5,216.8,216.39,216.5,217.0,216.8,217.2,216.5],
        unit: '万'
    },
    activeGatewayCount: {
        title: '有流量网关数（探计）（单位：万）',
        data: [218.5,218,217.5,217.8,217.3,216.5,217,216.8,216,215.5,216,215.8,215.5,216,215.5,215.57,215.3],
        unit: '万'
    },
    userCount: {
        title: '用户数（关联家宽营销地址）（单位：万）',
        data: [365.8,365.6,365.5,365.4,365.3,365.2,365.1,365.0,364.8,365.0,365.14,365.2,365.3,365.1,365.0,365.2,365.0],
        unit: '万'
    },
    activeDpiUserCount: {
        title: '有流量用户数（DPI）（单位：万）',
        data: [215,210,220,205,215,225,220,210,215,218,220,225,222,210,215,220,227.85],
        unit: '万'
    },

    // 各地市网关数分布
    cityGatewayDistribution: {
        '长春': { gateway: 76.2, activeGateway: 75.5, users: 128.0, activeDpi: 79.7 },
        '吉林': { gateway: 32.8, activeGateway: 32.3, users: 54.9, activeDpi: 34.2 },
        '四平': { gateway: 17.5, activeGateway: 17.1, users: 29.2, activeDpi: 18.2 },
        '辽源': { gateway: 8.7, activeGateway: 8.5, users: 14.6, activeDpi: 9.1 },
        '通化': { gateway: 13.0, activeGateway: 12.7, users: 21.9, activeDpi: 13.6 },
        '白山': { gateway: 10.8, activeGateway: 10.6, users: 18.3, activeDpi: 11.3 },
        '松原': { gateway: 17.5, activeGateway: 17.1, users: 29.2, activeDpi: 18.2 },
        '白城': { gateway: 10.8, activeGateway: 10.6, users: 18.3, activeDpi: 11.3 },
        '延边': { gateway: 21.7, activeGateway: 21.3, users: 36.5, activeDpi: 22.7 },
        '长白山': { gateway: 8.6, activeGateway: 8.4, users: 14.6, activeDpi: 9.0 }
    },

    // KPI指标
    kpiMetrics: {
        totalBroadbandUsers: 876.5,
        activeUsers: 842.3,
        totalCeiScore: 92.8,
        businessCeiScore: 91.5,
        networkCeiScore: 93.2,
        avgDownloadSpeed: 186.5,
        avgUploadSpeed: 42.3,
        avgLatency: 12.8,
        qualityComplaintRate: 0.35,
        workOrderCount: 3256,
        resolvedRate: 94.2,
        top10VideoAvgSpeed: 28.5,
        homeNetworkQuality: 95.6,
        gamingLatency: 18.5
    },

    // CEI评分区域分布
    ceiDistribution: {
        '长春': { overall: 94.2, business: 93.5, network: 94.8 },
        '吉林': { overall: 93.1, business: 92.3, network: 93.8 },
        '四平': { overall: 91.8, business: 90.9, network: 92.5 },
        '辽源': { overall: 92.5, business: 91.8, network: 93.1 },
        '通化': { overall: 91.2, business: 90.5, network: 91.8 },
        '白山': { overall: 90.8, business: 89.9, network: 91.5 },
        '松原': { overall: 92.0, business: 91.2, network: 92.6 },
        '白城': { overall: 91.5, business: 90.8, network: 92.1 },
        '延边': { overall: 93.5, business: 92.8, network: 94.1 },
        '长白山': { overall: 90.5, business: 89.5, network: 91.2 }
    },

    // 质差类型分布
    qualityIssueTypes: [
        { type: '线路质差', count: 1256, percentage: 28.5 },
        { type: '高时延', count: 985, percentage: 22.3 },
        { type: '网关cpu高', count: 652, percentage: 14.8 },
        { type: '频繁重启', count: 523, percentage: 11.9 },
        { type: '视频卡顿', count: 412, percentage: 9.3 },
        { type: '游戏高时延', count: 285, percentage: 6.5 },
        { type: 'wifi干扰', count: 168, percentage: 3.8 },
        { type: '信道利用率高', count: 125, percentage: 2.9 }
    ],

    businessTypes: ['全部', '电视', '宽带', '固话', '融合'],

    // ========== 装维工程师团队（真实姓名） ==========
    engineers: [
        // 长春
        { id: 'E001', name: '张建国', phone: '138-0431-1001', city: '长春', team: '长春一组', skill: ['光路', '设备'], level: '高级', workload: 8, online: true, area: '南关区/朝阳区' },
        { id: 'E002', name: '李秀梅', phone: '138-0431-1002', city: '长春', team: '长春一组', skill: ['家庭网络', 'WiFi'], level: '中级', workload: 5, online: true, area: '宽城区/二道区' },
        { id: 'E003', name: '王志强', phone: '138-0431-1003', city: '长春', team: '长春二组', skill: ['传输', 'BRAS'], level: '高级', workload: 12, online: true, area: '绿园区/双阳区' },
        { id: 'E004', name: '刘建华', phone: '138-0431-1004', city: '长春', team: '长春二组', skill: ['光路', '装机'], level: '中级', workload: 6, online: false, area: '九台区/榆树市' },
        { id: 'E005', name: '陈明亮', phone: '138-0431-1005', city: '长春', team: '长春三组', skill: ['故障排查', 'CEI定界'], level: '高级', workload: 9, online: true, area: '德惠市/农安县' },
        // 吉林
        { id: 'E006', name: '赵玉海', phone: '138-0432-2001', city: '吉林', team: '吉林一组', skill: ['光路', '设备'], level: '高级', workload: 7, online: true, area: '昌邑区/龙潭区' },
        { id: 'E007', name: '孙丽娟', phone: '138-0432-2002', city: '吉林', team: '吉林一组', skill: ['家庭网络', 'IPTV'], level: '中级', workload: 4, online: true, area: '船营区/丰满区' },
        { id: 'E008', name: '周文斌', phone: '138-0432-2003', city: '吉林', team: '吉林二组', skill: ['传输', '光路'], level: '高级', workload: 10, online: true, area: '永吉县/蛟河市' },
        { id: 'E009', name: '吴俊杰', phone: '138-0432-2004', city: '吉林', team: '吉林二组', skill: ['故障排查', 'WiFi'], level: '中级', workload: 5, online: false, area: '桦甸市/舒兰市' },
        // 四平
        { id: 'E010', name: '郑志勇', phone: '138-0434-3001', city: '四平', team: '四平组', skill: ['光路', 'OLT'], level: '高级', workload: 8, online: true, area: '铁西区/铁东区' },
        { id: 'E011', name: '马春艳', phone: '138-0434-3002', city: '四平', team: '四平组', skill: ['装机', '家庭网络'], level: '中级', workload: 6, online: true, area: '梨树县/伊通县' },
        { id: 'E012', name: '高伟峰', phone: '138-0434-3003', city: '四平', team: '四平组', skill: ['传输', '故障排查'], level: '高级', workload: 11, online: true, area: '公主岭市/双辽市' },
        // 辽源
        { id: 'E013', name: '林晓东', phone: '138-0437-4001', city: '辽源', team: '辽源组', skill: ['光路', '装机'], level: '中级', workload: 4, online: true, area: '龙山区/西安区' },
        { id: 'E014', name: '何雅静', phone: '138-0437-4002', city: '辽源', team: '辽源组', skill: ['家庭网络', 'WiFi'], level: '中级', workload: 5, online: true, area: '东丰县/东辽县' },
        // 通化
        { id: 'E015', name: '徐建斌', phone: '138-0435-5001', city: '通化', team: '通化组', skill: ['光路', '设备'], level: '高级', workload: 7, online: true, area: '东昌区/二道江区' },
        { id: 'E016', name: '黄丽华', phone: '138-0435-5002', city: '通化', team: '通化组', skill: ['传输', 'BRAS'], level: '高级', workload: 9, online: false, area: '梅河口市/集安市' },
        { id: 'E017', name: '罗志勇', phone: '138-0435-5003', city: '通化', team: '通化组', skill: ['装机', '家庭网络'], level: '中级', workload: 5, online: true, area: '通化县/辉南县/柳河县' },
        // 白山
        { id: 'E018', name: '韩宇辰', phone: '138-0439-6001', city: '白山', team: '白山组', skill: ['光路', '故障排查'], level: '中级', workload: 6, online: true, area: '浑江区/江源区' },
        { id: 'E019', name: '冯晓梅', phone: '138-0439-6002', city: '白山', team: '白山组', skill: ['家庭网络', 'WiFi'], level: '中级', workload: 4, online: true, area: '临江市/抚松县/靖宇县/长白县' },
        // 松原
        { id: 'E020', name: '梁建军', phone: '138-0438-7001', city: '松原', team: '松原组', skill: ['光路', '设备'], level: '高级', workload: 8, online: true, area: '宁江区/前郭县' },
        { id: 'E021', name: '宋丽红', phone: '138-0438-7002', city: '松原', team: '松原组', skill: ['装机', '家庭网络'], level: '中级', workload: 5, online: true, area: '长岭县/乾安县/扶余市' },
        // 白城
        { id: 'E022', name: '崔志伟', phone: '138-0436-8001', city: '白城', team: '白城组', skill: ['光路', '传输'], level: '高级', workload: 7, online: true, area: '洮北区/镇赉县' },
        { id: 'E023', name: '邓小芳', phone: '138-0436-8002', city: '白城', team: '白城组', skill: ['WiFi', '家庭网络'], level: '中级', workload: 4, online: false, area: '通榆县/洮南市/大安市' },
        // 延边
        { id: 'E024', name: '金成日', phone: '138-0433-9001', city: '延边', team: '延边一组', skill: ['光路', '设备'], level: '高级', workload: 9, online: true, area: '延吉市/图们市' },
        { id: 'E025', name: '朴美兰', phone: '138-0433-9002', city: '延边', team: '延边一组', skill: ['家庭网络', '故障排查'], level: '中级', workload: 5, online: true, area: '敦化市/珲春市' },
        { id: 'E026', name: '崔东浩', phone: '138-0433-9003', city: '延边', team: '延边二组', skill: ['传输', 'OLT'], level: '高级', workload: 10, online: true, area: '龙井市/和龙市/汪清县/安图县' },
        // 长白山
        { id: 'E027', name: '杨国栋', phone: '138-0440-0001', city: '长白山', team: '长白山组', skill: ['光路', '装机'], level: '中级', workload: 4, online: true, area: '池北区/池西区/池南区' }
    ],

    // 根据地市和技能筛选合适的工程师（按工作量排序）
    findEngineers: function(city, skill) {
        var list = this.engineers;
        if (city) list = list.filter(function(e) { return e.city === city; });
        if (skill) list = list.filter(function(e) { return e.skill.indexOf(skill) >= 0; });
        // 在线优先，工作量低的优先
        return list.slice().sort(function(a, b) {
            if (a.online !== b.online) return a.online ? -1 : 1;
            return a.workload - b.workload;
        });
    },

    // 根据质差类型映射到所需技能
    qualityTypeToSkill: function(qualityType) {
        var map = {
            '线路质差': '光路', '高时延': '传输', '网关cpu高': '设备', '频繁重启': '设备',
            '视频卡顿': '故障排查', 'wifi干扰': 'WiFi', '游戏高时延': '传输', '信道利用率高': 'WiFi'
        };
        return map[qualityType] || '故障排查';
    },

    // CEI评分趋势
    ceiTrendData: {
        labels: ['11-16','11-17','11-18','11-19','11-20','11-21','11-22','11-23','11-24','11-25','11-26','11-27','11-28','11-29','11-30','12-01','12-02'],
        overall: [92.5,92.3,92.8,92.6,92.9,93.0,92.7,92.5,92.8,93.1,92.6,92.8,93.0,92.5,92.7,92.9,92.8],
        business: [91.2,91.0,91.5,91.3,91.6,91.8,91.4,91.2,91.5,91.8,91.3,91.5,91.7,91.2,91.4,91.6,91.5],
        network: [93.5,93.2,93.8,93.5,93.9,94.0,93.6,93.4,93.7,94.0,93.5,93.7,93.9,93.4,93.6,93.8,93.2]
    },

    // 质差TOP5原因
    qualityTop5Reasons: [
        { reason: '线路老化', count: 856, percentage: 26.3 },
        { reason: '光衰过大', count: 698, percentage: 21.4 },
        { reason: '设备故障', count: 523, percentage: 16.1 },
        { reason: 'WiFi信号弱', count: 412, percentage: 12.7 },
        { reason: '带宽不足', count: 356, percentage: 10.9 }
    ],

    // GIS地图坐标（吉林省各地市）
    gisCoordinates: {
        '长春': { lng: 125.3245, lat: 43.8868, ceiScore: 94.2 },
        '吉林': { lng: 126.5496, lat: 43.8378, ceiScore: 93.1 },
        '四平': { lng: 124.3504, lat: 43.1667, ceiScore: 91.8 },
        '辽源': { lng: 125.1451, lat: 42.8878, ceiScore: 92.5 },
        '通化': { lng: 125.9390, lat: 41.7280, ceiScore: 91.2 },
        '白山': { lng: 126.4279, lat: 41.9425, ceiScore: 90.8 },
        '松原': { lng: 124.8250, lat: 45.1412, ceiScore: 92.0 },
        '白城': { lng: 122.8410, lat: 45.6190, ceiScore: 91.5 },
        '延边': { lng: 129.5133, lat: 42.8918, ceiScore: 93.5 },
        '长白山': { lng: 128.0578, lat: 42.0486, ceiScore: 90.5 }
    },

    // 整体概况面板
    overviewTabs: {
        '整体概况': { charts: ['ceiTrend', 'userDistribution', 'qualityDistribution', 'businessType'] },
        '用户': { charts: ['gatewayCount', 'activeGatewayCount', 'userCount', 'activeDpiUserCount'] },
        '固关': { metrics: { total: 216.39, online: 215.8, offline: 0.59, abnormal: 1.2 } },
        'OLT': { metrics: { total: 8526, online: 8498, abnormal: 156, overload: 42 } }
    },

    // 工单统计
    workOrderStats: {
        total: 3256,
        pending: 245,
        processing: 512,
        completed: 2389,
        closed: 110,
        avgProcessTime: 4.2,
        overdueCount: 38,
        overdueRate: 1.17,
        satisfactionRate: 96.5
    },

    workOrderCityDistribution: {
        '长春': 856, '吉林': 498, '四平': 325, '辽源': 186,
        '通化': 268, '白山': 215, '松原': 312, '白城': 198,
        '延边': 298, '长白山': 100
    },

    // ========== 大规模生成数据 ==========
    brasDevices: [],
    oltDevices: [],
    ponAnomalies: [],
    pingTestHistory: [],
    ontPowerRecords: [],
    gatewayRestartRecords: [],
    dpiRecords: [],
    ceiUserRecords: [],
    qualityModelRecords: [],
    userQualityRecords: [],
    bizQualityRecords: [],
    opticalTestRecords: [],
    conAnalysisRecords: [],
    workOrderList: [],
    oltStats: { totalCount: 0, onlineCount: 0, offlineCount: 0, avgCeiScore: 92.3, abnormalCount: 0, overloadCount: 0 },

    // 首页驾驶舱数据
    dashboardData: {
        todayAlerts: 23,
        onlineDevices: 8498,
        activeUsers: 8423000,
        ceiScore: 92.8,
        workOrderPending: 245,
        networkHealth: 97.2,
        cityRanking: [],
        alertTrend: [],
        bizDistribution: [
            { name: '宽带', value: 4523 },
            { name: '电视', value: 2356 },
            { name: '固话', value: 986 },
            { name: '融合', value: 1558 }
        ]
    },

    // 生成函数
    generate: function() {
        var cities = this.cities;
        var self = this;
        SeededRandom.reset(20251202);

        var cityPrefixes = { '长春': 'CC', '吉林': 'JL', '四平': 'SP', '辽源': 'LY', '通化': 'TH', '白山': 'BS', '松原': 'SY', '白城': 'BC', '延边': 'YB', '长白山': 'CBS' };
        var statusList = ['正常', '告警', '异常'];
        var statusWeights = [0.75, 0.15, 0.10];
        function weightedStatus() {
            var r = SeededRandom.next();
            if (r < statusWeights[0]) return statusList[0];
            if (r < statusWeights[0] + statusWeights[1]) return statusList[1];
            return statusList[2];
        }

        // ===== BRAS 设备 30台 =====
        // BRAS命名规范：省-市-机房-BRAS-序号-厂家
        var cityRooms = {
            '长春': ['朝阳机房', '南关机房', '宽城机房', '绿园机房', '二道机房'],
            '吉林': ['昌邑机房', '船营机房', '龙潭机房', '丰满机房'],
            '四平': ['铁西机房', '铁东机房', '梨树机房'],
            '辽源': ['龙山机房', '西安机房'],
            '通化': ['东昌机房', '梅河口机房', '集安机房'],
            '白山': ['浑江机房', '江源机房'],
            '松原': ['宁江机房', '前郭机房', '扶余机房'],
            '白城': ['洮北机房', '洮南机房', '大安机房'],
            '延边': ['延吉机房', '敦化机房', '珲春机房', '龙井机房'],
            '长白山': ['池北机房', '池西机房']
        };
        var brasVendors = ['HW', 'ZTE', 'FH'];
        this.brasDevices = [];
        cities.forEach(function(city) {
            var rooms = cityRooms[city] || [city + '机房'];
            var count = city === '长春' ? 5 : (city === '吉林' || city === '延边' ? 4 : 3);
            for (var i = 1; i <= count; i++) {
                var room = rooms[(i - 1) % rooms.length];
                var vendor = SeededRandom.pick(brasVendors);
                self.brasDevices.push({
                    name: 'JL-' + city + '-' + room + '-BRAS-' + (i < 10 ? '0' + i : i) + '-' + vendor,
                    city: city,
                    users: SeededRandom.int(25000, 135000),
                    ceiScore: SeededRandom.float(89.5, 95.5, 1),
                    status: weightedStatus(),
                    model: SeededRandom.pick(['ME60-X16', 'ME60-X8', 'NE40E-X16', 'CR16010H-F']),
                    uptime: SeededRandom.int(30, 365) + '天'
                });
            }
        });

        // ===== OLT 设备 220台 =====
        // OLT命名规范：省-市-区县-站点-OLT-序号-厂家-型号
        var cityDistricts = {
            '长春': ['南关区', '朝阳区', '宽城区', '二道区', '绿园区', '双阳区', '九台区'],
            '吉林': ['昌邑区', '龙潭区', '船营区', '丰满区', '永吉县', '蛟河市'],
            '四平': ['铁西区', '铁东区', '梨树县', '伊通县', '公主岭市', '双辽市'],
            '辽源': ['龙山区', '西安区', '东丰县', '东辽县'],
            '通化': ['东昌区', '二道江区', '梅河口市', '集安市', '通化县', '辉南县'],
            '白山': ['浑江区', '江源区', '临江市', '抚松县', '靖宇县', '长白县'],
            '松原': ['宁江区', '前郭县', '长岭县', '乾安县', '扶余市'],
            '白城': ['洮北区', '镇赉县', '通榆县', '洮南市', '大安市'],
            '延边': ['延吉市', '图们市', '敦化市', '珲春市', '龙井市', '和龙市', '汪清县', '安图县'],
            '长白山': ['池北区', '池西区', '池南区']
        };
        var oltVendorModels = [['HW', 'MA5800-X17'], ['HW', 'MA5800-X7'], ['HW', 'MA5680T'], ['ZTE', 'C300'], ['ZTE', 'C220'], ['FH', 'AN5516-04']];
        this.oltDevices = [];
        var oltOnline = 0, oltOffline = 0, oltAbnormal = 0, oltOverload = 0;
        cities.forEach(function(city) {
            var dists = cityDistricts[city] || ['城区'];
            var count = city === '长春' ? 45 : (city === '吉林' ? 30 : SeededRandom.int(12, 25));
            for (var i = 1; i <= count; i++) {
                var st = weightedStatus();
                var isOnline = st !== '异常' || SeededRandom.next() > 0.3;
                if (isOnline) oltOnline++; else oltOffline++;
                if (st === '告警') oltAbnormal++;
                if (SeededRandom.next() < 0.03) oltOverload++;
                var dist = dists[(i - 1) % dists.length];
                var siteName = dist.replace(/[区县市]$/, '') + '站';
                var vm = SeededRandom.pick(oltVendorModels);
                self.oltDevices.push({
                    id: 'JL-' + city + '-' + dist + '-' + siteName + '-OLT-' + String(i).padStart(2, '0') + '-' + vm[0] + '-' + vm[1],
                    city: city,
                    district: dist,
                    model: vm[1],
                    ponPorts: SeededRandom.int(8, 64),
                    onlineONT: SeededRandom.int(200, 3500),
                    ceiScore: SeededRandom.float(88, 96, 1),
                    status: st,
                    online: isOnline,
                    cpuUsage: SeededRandom.float(15, 85, 1),
                    memUsage: SeededRandom.float(20, 78, 1),
                    uptime: SeededRandom.int(1, 720) + '天'
                });
            }
        });
        this.oltStats = {
            totalCount: this.oltDevices.length,
            onlineCount: oltOnline,
            offlineCount: oltOffline,
            avgCeiScore: 92.3,
            abnormalCount: oltAbnormal,
            overloadCount: oltOverload
        };

        // ===== PON光功率异常 120条 =====
        this.ponAnomalies = [];
        for (var i = 0; i < 120; i++) {
            var city = SeededRandom.pick(cities);
            var st = SeededRandom.pick(['光功率偏低', '光功率偏高', 'ONU离线', '光衰增大', 'PON口异常']);
            this.ponAnomalies.push({
                id: 'PON-' + cityPrefixes[city] + '-' + String(i + 1).padStart(5, '0'),
                oltId: 'OLT-' + cityPrefixes[city] + '-' + String(SeededRandom.int(1, 20)).padStart(4, '0'),
                ponPort: 'GPON 0/' + SeededRandom.int(0, 7) + '/' + SeededRandom.int(0, 15),
                city: city,
                txPower: SeededRandom.float(1.5, 3.5, 2),
                rxPower: SeededRandom.float(-28, -14, 2),
                anomalyType: st,
                severity: st === 'ONU离线' || st === 'PON口异常' ? '严重' : (SeededRandom.next() > 0.5 ? '一般' : '紧急'),
                affectedUsers: SeededRandom.int(1, 256),
                discoveryTime: SeededRandom.date('2025-11-20', '2025-12-02'),
                status: SeededRandom.pick(['待处理', '处理中', '已恢复'])
            });
        }

        // ===== PING测试记录 150条 =====
        this.pingTestHistory = [];
        for (var i = 0; i < 150; i++) {
            var city = SeededRandom.pick(cities);
            var delay = SeededRandom.float(2, 50, 1);
            var loss = delay > 30 ? SeededRandom.float(5, 40, 1) : (delay > 15 ? SeededRandom.float(0, 10, 1) : 0);
            this.pingTestHistory.push({
                time: SeededRandom.date('2025-11-16', '2025-12-02'),
                ontId: 'ONT-' + cityPrefixes[city] + '-' + String(SeededRandom.int(1, 9999)).padStart(5, '0'),
                target: '10.' + SeededRandom.int(160, 175) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254),
                city: city,
                packetSize: SeededRandom.pick([32, 64, 128, 256]),
                count: SeededRandom.pick([5, 10, 20, 50]),
                interval: SeededRandom.pick([1, 1, 1, 2, 5]),
                avgDelay: delay,
                maxDelay: SeededRandom.float(delay, delay * 2, 1),
                minDelay: SeededRandom.float(1, delay, 1),
                packetLoss: loss,
                status: loss > 20 ? '异常' : (loss > 5 || delay > 25 ? '告警' : '正常')
            });
        }


        // ===== ONT光功率查询 150条 =====
        this.ontPowerRecords = [];
        for (var i = 0; i < 150; i++) {
            var city = SeededRandom.pick(cities);
            var rx = SeededRandom.float(-28, -15, 2);
            this.ontPowerRecords.push({
                ontId: 'ONT-' + cityPrefixes[city] + '-' + String(i + 1).padStart(5, '0'),
                city: city,
                userAccount: 'JL' + (20250000 + i + 1),
                txPower: SeededRandom.float(1.8, 3.2, 2),
                rxPower: rx,
                temperature: SeededRandom.float(25, 65, 1),
                voltage: SeededRandom.float(3.1, 3.5, 2),
                model: SeededRandom.pick(['HG8245H', 'HG8546M', 'F663N', 'HS8145V5', 'HG8145X6']),
                status: rx < -25 ? '异常' : (rx < -22 ? '告警' : '正常'),
                lastUpdate: SeededRandom.date('2025-12-01', '2025-12-02')
            });
        }

        // ===== 网关远程重启记录 80条 =====
        this.gatewayRestartRecords = [];
        for (var i = 0; i < 80; i++) {
            var city = SeededRandom.pick(cities);
            this.gatewayRestartRecords.push({
                time: SeededRandom.date('2025-11-20', '2025-12-02'),
                gwId: 'GW-' + cityPrefixes[city] + '-' + String(SeededRandom.int(1, 9999)).padStart(5, '0'),
                sn: '4857544' + SeededRandom.int(10000000, 99999999),
                city: city,
                reason: SeededRandom.pick(['用户申报故障', 'CPU异常高', '流量异常', '定期维护', 'ONU离线']),
                operator: SeededRandom.pick(['张建国', '王志强', '赵玉海', '郑志勇', '梁建军', '金成日', '陈明亮', '周文斌']),
                result: SeededRandom.next() > 0.12 ? '重启成功' : '重启失败',
                duration: SeededRandom.int(15, 180) + 's'
            });
        }

        // ===== DPI抓包记录 80条 =====
        this.dpiRecords = [];
        var protocols = ['HTTP', 'HTTPS', 'DNS', 'RTMP', 'HLS', 'QUIC', 'TCP', 'UDP'];
        var apps = ['抖音', '快手', 'B站', '腾讯视频', '爱奇艺', '微信', '王者荣耀', '和平精英', '淘宝', '百度'];
        for (var i = 0; i < 80; i++) {
            var city = SeededRandom.pick(cities);
            this.dpiRecords.push({
                id: 'DPI-' + String(i + 1).padStart(6, '0'),
                time: SeededRandom.date('2025-12-01', '2025-12-02'),
                userAccount: 'JL' + (20250000 + SeededRandom.int(1, 500)),
                city: city,
                srcIp: '192.168.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254),
                dstIp: SeededRandom.int(1, 223) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254),
                protocol: SeededRandom.pick(protocols),
                app: SeededRandom.pick(apps),
                upTraffic: SeededRandom.float(0.1, 50, 2),
                downTraffic: SeededRandom.float(1, 500, 2),
                latency: SeededRandom.float(2, 80, 1),
                status: SeededRandom.next() > 0.15 ? '正常' : '异常'
            });
        }

        // ===== CEI用户查询记录 500+条 =====
        this.ceiUserRecords = [];
        for (var i = 0; i < 520; i++) {
            var city = SeededRandom.pick(cities);
            var overall = SeededRandom.float(60, 99, 1);
            this.ceiUserRecords.push({
                account: 'JL' + (20250000 + i + 1),
                city: city,
                area: SeededRandom.pick(['南关区', '朝阳区', '二道区', '绿园区', '宽城区', '昌邑区', '船营区', '龙潭区', '铁西区', '铁东区', '前郭县', '梅河口', '集安市']),
                overallCei: overall,
                businessCei: SeededRandom.float(overall - 5, overall + 2, 1),
                networkCei: SeededRandom.float(overall - 3, overall + 3, 1),
                downloadSpeed: SeededRandom.float(50, 300, 1),
                uploadSpeed: SeededRandom.float(10, 80, 1),
                latency: SeededRandom.float(3, 45, 1),
                packetLoss: SeededRandom.float(0, 5, 2),
                bizType: SeededRandom.pick(['宽带', '电视', '固话', '融合']),
                bandwidth: SeededRandom.pick([100, 200, 300, 500, 1000]),
                lastUpdate: SeededRandom.date('2025-11-28', '2025-12-02')
            });
        }

        // ===== 质差模型记录 100条 =====
        this.qualityModelRecords = [];
        var modelNames = ['线路质差模型', '设备质差模型', '家庭网络模型', '传输质差模型', 'WiFi干扰模型'];
        for (var i = 0; i < 100; i++) {
            var city = SeededRandom.pick(cities);
            this.qualityModelRecords.push({
                id: 'QM-' + String(i + 1).padStart(5, '0'),
                userAccount: 'JL' + (20250000 + SeededRandom.int(1, 520)),
                city: city,
                modelName: SeededRandom.pick(modelNames),
                score: SeededRandom.float(30, 85, 1),
                primaryFactor: SeededRandom.pick(['光衰', 'CPU高', '丢包', '时延大', 'WiFi干扰', '带宽不足', '终端老旧']),
                severity: SeededRandom.pick(['低', '中', '高', '紧急']),
                recommendation: SeededRandom.pick(['更换光猫', '优化WiFi', '升级带宽', '更换线路', '重启设备', '升级固件']),
                analysisTime: SeededRandom.date('2025-11-25', '2025-12-02')
            });
        }

        // ===== 用户质差记录 200条 =====
        this.userQualityRecords = [];
        for (var i = 0; i < 200; i++) {
            var city = SeededRandom.pick(cities);
            this.userQualityRecords.push({
                userAccount: 'JL' + (20250000 + SeededRandom.int(1, 520)),
                city: city,
                ceiScore: SeededRandom.float(45, 80, 1),
                qualityType: SeededRandom.pick(['线路质差', '高时延', '网关cpu高', '频繁重启', '视频卡顿', 'wifi干扰']),
                duration: SeededRandom.int(1, 72) + '小时',
                affectedBiz: SeededRandom.pick(['宽带上网', '视频点播', '在线游戏', 'IPTV直播', '视频通话']),
                status: SeededRandom.pick(['质差中', '已恢复', '待确认']),
                reportTime: SeededRandom.date('2025-11-20', '2025-12-02')
            });
        }

        // ===== 业务质差记录 150条 =====
        this.bizQualityRecords = [];
        var bizAppMap = {
            '视频': ['腾讯视频', '爱奇艺', '优酷视频', '抖音', '快手', '哔哩哔哩'],
            '游戏': ['王者荣耀', '和平精英', '英雄联盟手游', '原神', '穿越火线'],
            '在线办公': ['企业微信', '钉钉', '腾讯会议', '飞书', 'WPS云文档'],
            '网站/下载': ['百度网盘', '迅雷下载', '浏览器下载', '京东商城', '淘宝']
        };
        var bizQualityMap = {
            '视频': ['视频高时延', '视频卡顿'],
            '游戏': ['游戏高时延', '游戏卡顿'],
            '在线办公': ['应用高时延', '应用卡顿'],
            '网站/下载': ['应用高时延', '应用卡顿']
        };
        for (var i = 0; i < 150; i++) {
            var city = SeededRandom.pick(cities);
            var bizType = SeededRandom.pick(['视频', '游戏', '在线办公', '网站/下载']);
            var relatedOlt = SeededRandom.pick(this.oltDevices.filter(function(o) { return o.city === city; }));
            var startHour = SeededRandom.int(8, 21);
            var level = SeededRandom.pick(['高', '中', '低']);
            this.bizQualityRecords.push({
                bizType: bizType,
                appName: SeededRandom.pick(bizAppMap[bizType]),
                qualityType: SeededRandom.pick(bizQualityMap[bizType]),
                city: city,
                impactScope: SeededRandom.next() > 0.45 ? (city + (relatedOlt && relatedOlt.district ? relatedOlt.district : '城区')) : (relatedOlt ? relatedOlt.id : city + '城区'),
                occurrenceTime: '2026-05-17 ' + String(startHour).padStart(2, '0') + ':00 ~ 2026-05-17 ' + String(Math.min(startHour + SeededRandom.int(1, 4), 23)).padStart(2, '0') + ':00',
                affectedUsers: SeededRandom.int(10, 5000),
                avgCei: SeededRandom.float(60, 88, 1),
                avgLatency: SeededRandom.float(8, 60, 1),
                avgSpeed: SeededRandom.float(30, 200, 1),
                packetLoss: SeededRandom.float(0, 8, 2),
                qualityLevel: level,
                severity: level,
                reportTime: SeededRandom.date('2026-05-17', '2026-05-18')
            });
        }

        // ===== 光路测试记录 100条 =====
        this.opticalTestRecords = [];
        for (var i = 0; i < 100; i++) {
            var city = SeededRandom.pick(cities);
            var eventType = SeededRandom.pick(['上线', '下线', '上线', '上线']);
            this.opticalTestRecords.push({
                id: 'OT-' + String(i + 1).padStart(5, '0'),
                oltId: 'OLT-' + cityPrefixes[city] + '-' + String(SeededRandom.int(1, 20)).padStart(4, '0'),
                ontId: 'ONT-' + cityPrefixes[city] + '-' + String(SeededRandom.int(1, 9999)).padStart(5, '0'),
                city: city,
                ponPort: 'GPON 0/' + SeededRandom.int(0, 7) + '/' + SeededRandom.int(0, 15),
                eventType: eventType,
                reason: eventType === '下线' ? SeededRandom.pick(['光功率低', '设备故障', '用户关机', 'dying-gasp', '掉电']) : '正常注册',
                txPower: SeededRandom.float(1.5, 3.2, 2),
                rxPower: SeededRandom.float(-26, -15, 2),
                eventTime: SeededRandom.date('2025-11-28', '2025-12-02'),
                duration: eventType === '下线' ? SeededRandom.int(1, 480) + '分钟' : '-'
            });
        }

        // ===== CON网络分析记录 80条 =====
        this.conAnalysisRecords = [];
        for (var i = 0; i < 80; i++) {
            var city = SeededRandom.pick(cities);
            this.conAnalysisRecords.push({
                id: 'CON-' + String(i + 1).padStart(5, '0'),
                city: city,
                nodeType: SeededRandom.pick(['OLT', 'BRAS', '交换机', '路由器', '汇聚交换机']),
                nodeId: SeededRandom.pick(['OLT', 'BRAS', 'SW', 'RT', 'AGS'])[0] + '-' + cityPrefixes[city] + '-' + String(SeededRandom.int(1, 50)).padStart(3, '0'),
                bandwidth: SeededRandom.pick(['1G', '10G', '40G', '100G']),
                utilization: SeededRandom.float(10, 95, 1),
                peakUtil: SeededRandom.float(50, 99, 1),
                latency: SeededRandom.float(1, 30, 1),
                packetLoss: SeededRandom.float(0, 3, 3),
                status: SeededRandom.next() > 0.15 ? '正常' : (SeededRandom.next() > 0.5 ? '告警' : '异常'),
                analysisTime: SeededRandom.date('2025-12-01', '2025-12-02')
            });
        }

        // ===== 工单详细清单 320条 =====
        this.workOrderList = [];
        var woTypes = ['用户申诉', '主动发现', '系统告警', 'AI预测', '巡检发现'];
        var woStatus = ['待派单', '已派单', '处理中', '已解决', '已关闭'];
        for (var i = 0; i < 320; i++) {
            var city = SeededRandom.pick(cities);
            var s = SeededRandom.pick(woStatus);
            this.workOrderList.push({
                id: 'WO-' + (20251120 + SeededRandom.int(0, 12)) + String(SeededRandom.int(10000, 99999)),
                title: SeededRandom.pick(['宽带无法上网', '网速慢', '频繁掉线', '视频卡顿', 'IPTV花屏', '游戏延迟高', 'WiFi信号弱', '光猫红灯', '网关无法登录', '下载速度不达标']),
                type: SeededRandom.pick(woTypes),
                city: city,
                userAccount: 'JL' + (20250000 + SeededRandom.int(1, 520)),
                status: s,
                priority: SeededRandom.pick(['低', '中', '高', '紧急']),
                createTime: SeededRandom.date('2025-11-16', '2025-12-02'),
                assignee: s === '待派单' ? '-' : SeededRandom.pick(['张建国', '李秀梅', '王志强', '赵玉海', '周文斌', '郑志勇', '林晓东', '徐建斌', '梁建军', '金成日', '杨国栋', '高伟峰']),
                resolveTime: (s === '已解决' || s === '已关闭') ? SeededRandom.int(1, 48) + '小时' : '-',
                satisfaction: (s === '已解决' || s === '已关闭') ? SeededRandom.pick(['非常满意', '满意', '一般', '不满意']) : '-'
            });
        }

        // ===== 首页数据 =====
        this.dashboardData.cityRanking = [];
        cities.forEach(function(c) {
            self.dashboardData.cityRanking.push({
                city: c,
                ceiScore: self.ceiDistribution[c].overall,
                users: self.cityGatewayDistribution[c].users,
                workOrders: self.workOrderCityDistribution[c]
            });
        });
        this.dashboardData.cityRanking.sort(function(a, b) { return b.ceiScore - a.ceiScore; });

        this.dashboardData.alertTrend = [];
        for (var i = 0; i < 24; i++) {
            this.dashboardData.alertTrend.push({ hour: i + ':00', count: SeededRandom.int(5, 45) });
        }
    }
};

// 初始化生成数据
JilinData.generate();

// ========== 按城市获取时间序列数据 ==========
JilinData.getCityTimeSeriesData = function(city) {
    if (!city || city === '全省') {
        return {
            gatewayCount: this.gatewayCount,
            activeGatewayCount: this.activeGatewayCount,
            userCount: this.userCount,
            activeDpiUserCount: this.activeDpiUserCount,
            kpiMetrics: this.kpiMetrics,
            ceiTrendData: this.ceiTrendData,
            qualityIssueTypes: this.qualityIssueTypes
        };
    }
    // 缓存
    if (this._cityCache && this._cityCache[city]) return this._cityCache[city];
    if (!this._cityCache) this._cityCache = {};

    var dist = this.cityGatewayDistribution[city];
    if (!dist) return this.getCityTimeSeriesData('全省');

    var totalGw = 216.5, totalUsers = 365.0, totalDpi = 220;
    var gwRatio = dist.gateway / totalGw;
    var userRatio = dist.users / totalUsers;
    var dpiRatio = dist.activeDpi / totalDpi;

    SeededRandom.reset(20251202 + city.charCodeAt(0) * 100);

    // 生成城市级别的时间序列
    var labels = this.dateRange.labels;
    var gwData = [], agwData = [], uData = [], dpiData = [];
    for (var i = 0; i < labels.length; i++) {
        var baseGw = this.gatewayCount.data[i];
        var baseAgw = this.activeGatewayCount.data[i];
        var baseU = this.userCount.data[i];
        var baseDpi = this.activeDpiUserCount.data[i];
        gwData.push(parseFloat((baseGw * gwRatio * (1 + (SeededRandom.next() - 0.5) * 0.02)).toFixed(2)));
        agwData.push(parseFloat((baseAgw * gwRatio * (1 + (SeededRandom.next() - 0.5) * 0.02)).toFixed(2)));
        uData.push(parseFloat((baseU * userRatio * (1 + (SeededRandom.next() - 0.5) * 0.02)).toFixed(2)));
        dpiData.push(parseFloat((baseDpi * dpiRatio * (1 + (SeededRandom.next() - 0.5) * 0.04)).toFixed(2)));
    }

    var cei = this.ceiDistribution[city] || { overall: 92, business: 91, network: 93 };
    var ceiOverall = [], ceiBusiness = [], ceiNetwork = [];
    for (var i = 0; i < labels.length; i++) {
        ceiOverall.push(parseFloat((cei.overall + (SeededRandom.next() - 0.5) * 1.2).toFixed(1)));
        ceiBusiness.push(parseFloat((cei.business + (SeededRandom.next() - 0.5) * 1.2).toFixed(1)));
        ceiNetwork.push(parseFloat((cei.network + (SeededRandom.next() - 0.5) * 1.2).toFixed(1)));
    }

    // 城市级KPI
    var cityKpi = {
        totalBroadbandUsers: parseFloat((this.kpiMetrics.totalBroadbandUsers * userRatio).toFixed(1)),
        activeUsers: parseFloat((this.kpiMetrics.activeUsers * userRatio).toFixed(1)),
        totalCeiScore: cei.overall,
        businessCeiScore: cei.business,
        networkCeiScore: parseFloat((cei.network || 93).toFixed(1)),
        avgDownloadSpeed: parseFloat((this.kpiMetrics.avgDownloadSpeed * (0.9 + SeededRandom.next() * 0.2)).toFixed(1)),
        avgUploadSpeed: parseFloat((this.kpiMetrics.avgUploadSpeed * (0.9 + SeededRandom.next() * 0.2)).toFixed(1)),
        avgLatency: parseFloat((this.kpiMetrics.avgLatency * (0.8 + SeededRandom.next() * 0.4)).toFixed(1)),
        qualityComplaintRate: parseFloat((this.kpiMetrics.qualityComplaintRate * (0.7 + SeededRandom.next() * 0.6)).toFixed(2)),
        workOrderCount: Math.floor(this.workOrderCityDistribution[city] || this.kpiMetrics.workOrderCount * gwRatio),
        resolvedRate: parseFloat((this.kpiMetrics.resolvedRate + (SeededRandom.next() - 0.5) * 4).toFixed(1)),
        top10VideoAvgSpeed: parseFloat((this.kpiMetrics.top10VideoAvgSpeed * (0.85 + SeededRandom.next() * 0.3)).toFixed(1)),
        homeNetworkQuality: parseFloat((this.kpiMetrics.homeNetworkQuality + (SeededRandom.next() - 0.5) * 3).toFixed(1)),
        gamingLatency: parseFloat((this.kpiMetrics.gamingLatency * (0.8 + SeededRandom.next() * 0.4)).toFixed(1))
    };

    // 城市质差类型按比例
    var cityQualityTypes = this.qualityIssueTypes.map(function(t) {
        var cnt = Math.floor(t.count * gwRatio * (0.7 + SeededRandom.next() * 0.6));
        return { type: t.type, count: cnt, percentage: t.percentage };
    });

    SeededRandom.reset(20251202);

    var result = {
        gatewayCount: { title: city + ' 网关数（探计）（单位：万）', data: gwData, unit: '万' },
        activeGatewayCount: { title: city + ' 有流量网关数（探计）（单位：万）', data: agwData, unit: '万' },
        userCount: { title: city + ' 用户数（关联家宽营销地址）（单位：万）', data: uData, unit: '万' },
        activeDpiUserCount: { title: city + ' 有流量用户数（DPI）（单位：万）', data: dpiData, unit: '万' },
        kpiMetrics: cityKpi,
        ceiTrendData: { labels: labels, overall: ceiOverall, business: ceiBusiness, network: ceiNetwork },
        qualityIssueTypes: cityQualityTypes
    };

    this._cityCache[city] = result;
    return result;
};

// 按城市筛选生成数据记录
JilinData.filterByCity = function(dataArray, city) {
    if (!city || city === '全省') return dataArray;
    return dataArray.filter(function(d) { return d.city === city; });
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JilinData;
}
