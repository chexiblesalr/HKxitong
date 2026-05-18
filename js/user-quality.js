/**
 * 用户质差 - 完整重写模块
 * 质差识别 > 用户质差
 * 
 * 查询条件：时间、地市、区县、用户账号
 * 列表字段：时间、地市、区县、装维网格、小区、BRAS、OLT、PON口、用户账号、标签类型、质差标签
 * 详情弹窗：标签类型、质差标签、指标值、时间戳、置信度、标签定义及判定规则
 */
(function () {
    if (!window.Pages) return;

    // ==================== 质差标签定义 ====================
    var QUALITY_TAG_DEFS = {
        '线路质差': {
            '弱光': 'ONU接收光功率出现低于-27dBm的次数，大于3次，定义为ONU接收光功率弱光',
            '强光': 'ONU接收光功率出现高于-8dBm的次数，大于3次，定义为ONU接收光功率强光',
            '高误码': '网关接收流量误码率大于5%的周期为异常周期，网关接收流量误码率异常周期数大于2或误码率异常周期占比大于5%'
        },
        '设备质差': {
            'CPU占用高': '网关判定周期内N次周期上报，其中50%的周期上报CPU利用率超60%，定义为网关CPU占用高',
            'CPU跳变高': '累计跳变次数超过3次，定义为网关CPU跳变高',
            '内存占用高': '网关判定周期内N次周期上报，其中50%的周期上报内存利用率超60%，定义为网关内存占用高',
            '内存跳变高': '一天累计跳变次数超过30次，定义为内存跳变日质差',
            '频繁重启': '重启次数>3，定义为网关频繁重启',
            '频繁掉线': '异常掉线次数=统计周期内除User-Request、Idle-Timeout、Session-Timeout外的其它原因掉线总次数，异常掉线次数超5次，并且同PON口下用户异常掉线用户数小于3个用户'
        },
        '业务质差': {
            '视频卡顿': '视频卡顿时长占比>3%的上报周期占比大于1%，定义为视频卡顿',
            '游戏时延高': '5分钟均值的游戏业务数传时延大于300ms，计为一次质差周期，质差周期占比>0，定义为游戏时延高',
            '下载业务时延高': '5分钟均值的下载业务数传时延大于100ms，计为一次质差周期，质差占比大于30%，定义为下载业务时延高'
        },
        '配置质差': {
            'WIFI干扰大': '信道干扰信号的占空比大于35%的次数占比大于60%，定义为WIFI干扰大',
            'WIFI信道底噪高': '信道的底噪大于（-60dBm）的周期占比高于30%，定义为网关WIFI信道底噪高',
            'WIFI2.4G单频': '网关型号仅支持2.4G，定义为网关WIFI2.4G单频',
            'WIFI2.4G信号占比高': '2.4G信号周期占比大于50%，定义为WIFI2.4G信号占比高',
            'WIFI信道利用率高': '5G WIFI信道利用率＞75%，2.4G WIFI信道利用率＞85%，定义为网关WIFI信道利用率高'
        }
    };

    // 已展开的所有标签列表
    var ALL_TAG_TYPES = Object.keys(QUALITY_TAG_DEFS);
    var ALL_TAGS = [];
    ALL_TAG_TYPES.forEach(function (type) {
        Object.keys(QUALITY_TAG_DEFS[type]).forEach(function (tag) {
            ALL_TAGS.push({ type: type, tag: tag, rule: QUALITY_TAG_DEFS[type][tag] });
        });
    });

    // ==================== 区县数据 ====================
    var CITY_DISTRICTS = {
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
    var ALL_DISTRICTS = [];
    Object.keys(CITY_DISTRICTS).forEach(function (c) { ALL_DISTRICTS = ALL_DISTRICTS.concat(CITY_DISTRICTS[c]); });

    // ==================== 用哈希函数保持数据稳定 ====================
    function stableHash(str, seed) {
        seed = seed || 0;
        var hash = seed;
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }
    function stableFloat(str, seed, min, max, decimals) {
        var h = Math.abs(stableHash(str, seed));
        var v = min + (h % 10000) / 9999 * (max - min);
        var f = Math.pow(10, decimals || 1);
        return Math.round(v * f) / f;
    }
    function stableInt(str, seed, min, max) {
        var h = Math.abs(stableHash(str, seed));
        return min + (h % (max - min + 1));
    }
    function stablePick(str, seed, arr) {
        return arr[stableInt(str, seed, 0, arr.length - 1)];
    }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    // ==================== 机房/厂家映射 ====================
    var CITY_ROOMS = {
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
    var BRAS_VENDORS = ['HW', 'ZTE', 'FH'];
    var OLT_VM = [['HW', 'MA5800-X17'], ['HW', 'MA5800-X7'], ['HW', 'MA5680T'], ['ZTE', 'C300'], ['ZTE', 'C220'], ['FH', 'AN5516-04']];

    // ==================== 生成模拟数据 ====================
    function generateUserQualityData() {
        var cities = (window.JilinData && JilinData.cities) || Object.keys(CITY_DISTRICTS);
        var records = [];

        for (var i = 0; i < 300; i++) {
            var seed = 'uq_' + i;
            var city = stablePick(seed, 1, cities);
            var districts = CITY_DISTRICTS[city] || ['城区'];
            var district = stablePick(seed, 2, districts);

            // 每用户分配1~3个质差标签
            var tagCount = stableInt(seed, 3, 1, 3);
            var assignedTags = [];
            var usedIdxSet = {};
            for (var t = 0; t < tagCount; t++) {
                var idx = stableInt(seed + '_t' + t, 10 + t, 0, ALL_TAGS.length - 1);
                if (!usedIdxSet[idx]) {
                    usedIdxSet[idx] = true;
                    assignedTags.push(ALL_TAGS[idx]);
                }
            }
            if (assignedTags.length === 0) assignedTags.push(ALL_TAGS[i % ALL_TAGS.length]);

            // 标签类型和质差标签用逗号汇总显示
            var tagTypes = [];
            var tagNames = [];
            assignedTags.forEach(function (tg) {
                if (tagTypes.indexOf(tg.type) < 0) tagTypes.push(tg.type);
                tagNames.push(tg.tag);
            });

            var day = stableInt(seed, 5, 1, 17);
            var hour = stableInt(seed, 6, 0, 23);
            var minute = stableInt(seed, 7, 0, 59);
            var timeStr = '2025-' + (day <= 14 ? '11' : '12') + '-' + pad(day <= 14 ? 16 + day : day - 14) + ' ' + pad(hour) + ':' + pad(minute) + ':' + pad(stableInt(seed, 8, 0, 59));

            // BRAS命名：JL-市-机房-BRAS-序号-厂家
            var rooms = CITY_ROOMS[city] || [city + '机房'];
            var room = stablePick(seed, 30, rooms);
            var brasVendor = stablePick(seed, 31, BRAS_VENDORS);
            var brasSeq = stableInt(seed, 32, 1, 5);
            var brasName = 'JL-' + city + '-' + room + '-BRAS-' + pad(brasSeq) + '-' + brasVendor;

            // OLT命名：JL-市-区县-站点-OLT-序号-厂家-型号
            var oltVM = stablePick(seed, 33, OLT_VM);
            var siteName = district.replace(/[区县市]$/, '') + '站';
            var oltSeq = stableInt(seed, 34, 1, 8);
            var oltName = 'JL-' + city + '-' + district + '-' + siteName + '-OLT-' + pad(oltSeq) + '-' + oltVM[0] + '-' + oltVM[1];

            // PON口命名：OLT设备名-机架/槽位/PON口
            var rack = 0;
            var slot = stableInt(seed, 35, 0, 7);
            var ponPort = stableInt(seed, 36, 0, 15);
            var ponName = oltName + '-' + rack + '/' + slot + '/' + ponPort;

            // 网格和小区
            var gridIdx = stableInt(seed, 20, 1, 12);
            var cellIdx = stableInt(seed, 21, 1, 30);
            var cellName = district.replace(/[区县市]$/, '') + '-小区-' + String(cellIdx).padStart(3, '0');

            records.push({
                time: timeStr,
                city: city,
                district: district,
                grid: district + '-网格' + pad(gridIdx),
                cell: cellName,
                bras: brasName,
                olt: oltName,
                pon: ponName,
                userAccount: 'JL' + (20250000 + stableInt(seed, 9, 1, 520)),
                tagTypeStr: tagTypes.join('、'),
                tagNameStr: tagNames.join('、'),
                tags: assignedTags,
                // 每个标签对应的详情数据
                tagDetails: assignedTags.map(function (tg, j) {
                    var dSeed = seed + '_d' + j;
                    return {
                        type: tg.type,
                        tag: tg.tag,
                        value: generateIndicatorValue(tg, dSeed),
                        timestamp: timeStr,
                        confidence: stableFloat(dSeed, 50, 72, 99, 1),
                        rule: tg.rule
                    };
                })
            });
        }
        return records;
    }

    // 根据标签类型生成对应的指标值
    function generateIndicatorValue(tagDef, seed) {
        var map = {
            '弱光': function () { return 'ONU接收光功率: ' + stableFloat(seed, 100, -32, -27, 1) + 'dBm，低于-27dBm次数: ' + stableInt(seed, 101, 4, 12) + '次'; },
            '强光': function () { return 'ONU接收光功率: ' + stableFloat(seed, 100, -8, -3, 1) + 'dBm，高于-8dBm次数: ' + stableInt(seed, 101, 4, 10) + '次'; },
            '高误码': function () { return '误码率: ' + stableFloat(seed, 100, 5.1, 18, 2) + '%，异常周期数: ' + stableInt(seed, 101, 3, 15) + '，异常占比: ' + stableFloat(seed, 102, 5.2, 25, 1) + '%'; },
            'CPU占用高': function () { return 'CPU利用率: ' + stableFloat(seed, 100, 61, 95, 1) + '%，超60%周期占比: ' + stableFloat(seed, 101, 51, 85, 1) + '%'; },
            'CPU跳变高': function () { return 'CPU跳变次数: ' + stableInt(seed, 100, 4, 20) + '次'; },
            '内存占用高': function () { return '内存利用率: ' + stableFloat(seed, 100, 61, 92, 1) + '%，超60%周期占比: ' + stableFloat(seed, 101, 51, 80, 1) + '%'; },
            '内存跳变高': function () { return '内存跳变次数: ' + stableInt(seed, 100, 31, 80) + '次/天'; },
            '频繁重启': function () { return '重启次数: ' + stableInt(seed, 100, 4, 15) + '次'; },
            '频繁掉线': function () { return '异常掉线次数: ' + stableInt(seed, 100, 6, 25) + '次，同PON口掉线用户数: ' + stableInt(seed, 101, 1, 2) + '个'; },
            '视频卡顿': function () { return '卡顿时长占比: ' + stableFloat(seed, 100, 3.1, 12, 2) + '%，卡顿周期占比: ' + stableFloat(seed, 101, 1.1, 8, 2) + '%'; },
            '游戏时延高': function () { return '游戏数传时延均值: ' + stableFloat(seed, 100, 301, 600, 1) + 'ms，质差周期占比: ' + stableFloat(seed, 101, 0.5, 15, 1) + '%'; },
            '下载业务时延高': function () { return '下载数传时延均值: ' + stableFloat(seed, 100, 101, 350, 1) + 'ms，质差占比: ' + stableFloat(seed, 101, 31, 60, 1) + '%'; },
            'WIFI干扰大': function () { return '干扰信号占空比>35%次数占比: ' + stableFloat(seed, 100, 61, 90, 1) + '%'; },
            'WIFI信道底噪高': function () { return '底噪: ' + stableFloat(seed, 100, -59, -45, 1) + 'dBm，底噪>-60dBm周期占比: ' + stableFloat(seed, 101, 31, 65, 1) + '%'; },
            'WIFI2.4G单频': function () { return '网关型号仅支持2.4G'; },
            'WIFI2.4G信号占比高': function () { return '2.4G信号周期占比: ' + stableFloat(seed, 100, 51, 88, 1) + '%'; },
            'WIFI信道利用率高': function () { return '5G信道利用率: ' + stableFloat(seed, 100, 76, 95, 1) + '%，2.4G信道利用率: ' + stableFloat(seed, 101, 86, 98, 1) + '%'; }
        };
        return map[tagDef.tag] ? map[tagDef.tag]() : '—';
    }

    // ==================== 缓存数据 ====================
    var _cachedData = null;
    function getData() {
        if (!_cachedData) _cachedData = generateUserQualityData();
        return _cachedData;
    }

    // ==================== 工具函数 ====================
    function esc(v) {
        return String(v === undefined || v === null ? '' : v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // 标签类型颜色
    function tagTypeColor(type) {
        return {
            '线路质差': '#e74c3c',
            '设备质差': '#f39c12',
            '业务质差': '#8e44ad',
            '配置质差': '#3498db'
        }[type] || '#666';
    }

    function tagTypeBadge(type) {
        var color = tagTypeColor(type);
        return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:' + color + '18;color:' + color + ';font-size:11px;font-weight:600;border:1px solid ' + color + '30;white-space:nowrap;">' + esc(type) + '</span>';
    }

    function tagBadge(tag) {
        return '<span style="display:inline-block;padding:2px 6px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:10px;font-size:10px;color:#c0392b;margin:1px 2px;white-space:nowrap;">' + esc(tag) + '</span>';
    }

    // ==================== 过滤器状态 ====================
    Pages._uqPage2 = 1;
    Pages._uqTime2 = '';
    Pages._uqCity2 = '';
    Pages._uqDistrict2 = '';
    Pages._uqAccount2 = '';

    // ==================== 区县联动 ====================
    Pages._uqUpdateDistricts = function () {
        var city = Pages._uqCity2;
        var sel = document.getElementById('uqDistrictFilter2');
        if (!sel) return;
        var districts = city ? (CITY_DISTRICTS[city] || []) : ALL_DISTRICTS;
        var html = '<option value="">全部区县</option>';
        districts.forEach(function (d) {
            html += '<option value="' + esc(d) + '"' + (d === Pages._uqDistrict2 ? ' selected' : '') + '>' + esc(d) + '</option>';
        });
        sel.innerHTML = html;
    };

    // ==================== 主渲染函数 ====================
    Pages.renderUserQuality = function (container, page) {
        this._uqPage2 = page || 1;
        var allData = getData();
        var data = allData;

        // 筛选
        if (this._uqTime2) {
            var filterDate = this._uqTime2;
            data = data.filter(function (d) { return d.time.indexOf(filterDate) === 0; });
        }
        if (this._uqCity2) data = data.filter(function (d) { return d.city === Pages._uqCity2; });
        if (this._uqDistrict2) data = data.filter(function (d) { return d.district === Pages._uqDistrict2; });
        if (this._uqAccount2) {
            var kw = this._uqAccount2.toLowerCase();
            data = data.filter(function (d) { return d.userAccount.toLowerCase().indexOf(kw) >= 0; });
        }

        // 统计卡片
        var totalUsers = data.length;
        var tagTypeCount = {};
        var tagCount = {};
        data.forEach(function (d) {
            d.tags.forEach(function (t) {
                tagTypeCount[t.type] = (tagTypeCount[t.type] || 0) + 1;
                tagCount[t.tag] = (tagCount[t.tag] || 0) + 1;
            });
        });
        var uniqueTypes = Object.keys(tagTypeCount).length;
        var uniqueTags = Object.keys(tagCount).length;

        // 分页
        var p = Pages.paginate(data, this._uqPage2, 12);

        // 表格行
        var rows = p.data.map(function (r, idx) {
            var globalIdx = (Pages._uqPage2 - 1) * 12 + idx;
            // 标签类型 badges
            var typeBadges = [];
            var seenTypes = {};
            r.tags.forEach(function (t) {
                if (!seenTypes[t.type]) { seenTypes[t.type] = true; typeBadges.push(tagTypeBadge(t.type)); }
            });
            // 质差标签 badges
            var tagBadges = r.tags.map(function (t) { return tagBadge(t.tag); }).join('');

            return '<tr>' +
                '<td>' + esc(r.time) + '</td>' +
                '<td>' + esc(r.city) + '</td>' +
                '<td>' + esc(r.district) + '</td>' +
                '<td style="font-size:11px;">' + esc(r.grid) + '</td>' +
                '<td style="font-size:11px;">' + esc(r.cell) + '</td>' +
                '<td style="font-size:11px;">' + esc(r.bras) + '</td>' +
                '<td style="font-size:11px;">' + esc(r.olt) + '</td>' +
                '<td style="font-size:11px;">' + esc(r.pon) + '</td>' +
                '<td><a style="color:#2b7de9;cursor:pointer;" onclick="Pages._showUqDetail2(' + globalIdx + ')">' + esc(r.userAccount) + '</a></td>' +
                '<td>' + typeBadges.join(' ') + '</td>' +
                '<td>' + tagBadges + '</td>' +
                '<td><a style="color:#2b7de9;cursor:pointer;font-size:12px;" onclick="Pages._showUqDetail2(' + globalIdx + ')">详情</a></td>' +
                '</tr>';
        }).join('') || '<tr><td colspan="12" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

        // 查询条件
        var cityOpts = '<option value="">全部地市</option>';
        var cities = (window.JilinData && JilinData.cities) || Object.keys(CITY_DISTRICTS);
        cities.forEach(function (c) { cityOpts += '<option value="' + esc(c) + '"' + (c === Pages._uqCity2 ? ' selected' : '') + '>' + esc(c) + '</option>'; });

        var districtOpts = '<option value="">全部区县</option>';
        var districtList = this._uqCity2 ? (CITY_DISTRICTS[this._uqCity2] || []) : ALL_DISTRICTS;
        districtList.forEach(function (d) { districtOpts += '<option value="' + esc(d) + '"' + (d === Pages._uqDistrict2 ? ' selected' : '') + '>' + esc(d) + '</option>'; });

        // TOP标签统计
        var sortedTags = Object.keys(tagCount).map(function (k) { return { name: k, count: tagCount[k] }; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 6);

        container.innerHTML =
            '<div class="page-content">' +
            // 统计卡片
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card" style="border-top:3px solid #e74c3c;">' +
                    '<div class="wo-stat-value" style="color:#e74c3c;font-size:26px;">' + totalUsers + '</div>' +
                    '<div class="wo-stat-label">质差用户数</div>' +
                '</div>' +
                '<div class="wo-stat-card" style="border-top:3px solid #f39c12;">' +
                    '<div class="wo-stat-value" style="color:#f39c12;font-size:26px;">' + uniqueTypes + '</div>' +
                    '<div class="wo-stat-label">标签类型</div>' +
                '</div>' +
                '<div class="wo-stat-card" style="border-top:3px solid #8e44ad;">' +
                    '<div class="wo-stat-value" style="color:#8e44ad;font-size:26px;">' + uniqueTags + '</div>' +
                    '<div class="wo-stat-label">质差标签</div>' +
                '</div>' +
                '<div class="wo-stat-card" style="border-top:3px solid #3498db;">' +
                    '<div class="wo-stat-value" style="color:#3498db;font-size:26px;">' + (cities.length) + '</div>' +
                    '<div class="wo-stat-label">覆盖地市</div>' +
                '</div>' +
            '</div>' +
            // TOP标签分布卡片
            '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">' +
                sortedTags.map(function (t) {
                    return '<div style="flex:1;min-width:100px;padding:8px 12px;background:#f8fafc;border:1px solid #e0e4e8;border-radius:6px;text-align:center;">' +
                        '<div style="font-size:16px;font-weight:700;color:#333;">' + t.count + '</div>' +
                        '<div style="font-size:11px;color:#999;margin-top:2px;">' + esc(t.name) + '</div>' +
                    '</div>';
                }).join('') +
            '</div>' +
            // 查询面板
            '<div class="remote-panel"><div class="remote-panel-title">用户质差查询</div>' +
            '<div class="remote-form">' +
                '<div class="form-group"><label class="form-label">时间</label><input class="form-input" type="date" id="uqTimeFilter2" value="' + esc(this._uqTime2 || '') + '"></div>' +
                '<div class="form-group"><label class="form-label">地市</label><select class="form-select" style="width:120px;" id="uqCityFilter2" onchange="Pages._uqCity2=this.value;Pages._uqDistrict2=\'\';Pages._uqUpdateDistricts();Pages.renderUserQuality(document.getElementById(\'page-user-quality\'),1)">' + cityOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">区县</label><select class="form-select" style="width:120px;" id="uqDistrictFilter2" onchange="Pages._uqDistrict2=this.value;Pages.renderUserQuality(document.getElementById(\'page-user-quality\'),1)">' + districtOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">用户账号</label><input class="form-input" id="uqAccountFilter2" value="' + esc(this._uqAccount2 || '') + '" placeholder="请输入用户账号"></div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                    '<button class="btn btn-primary" onclick="Pages._uqTime2=document.getElementById(\'uqTimeFilter2\').value;Pages._uqAccount2=document.getElementById(\'uqAccountFilter2\').value.trim();Pages.renderUserQuality(document.getElementById(\'page-user-quality\'),1)">查询</button>' +
                    '<button class="btn" onclick="Pages._uqTime2=\'\';Pages._uqCity2=\'\';Pages._uqDistrict2=\'\';Pages._uqAccount2=\'\';Pages.renderUserQuality(document.getElementById(\'page-user-quality\'),1)">重置</button>' +
                    '<button class="btn" onclick="Pages._exportUq2()">导出</button>' +
                '</div>' +
            '</div></div>' +
            // 数据表格
            '<div class="data-table-wrapper" style="margin-top:8px;">' +
                '<table class="data-table">' +
                    '<thead><tr>' +
                        '<th>时间</th><th>地市</th><th>区县</th><th>装维网格</th><th>小区</th><th>BRAS</th><th>OLT</th><th>PON口</th><th>用户账号</th><th>标签类型</th><th>质差标签</th><th>操作</th>' +
                    '</tr></thead>' +
                    '<tbody>' + rows + '</tbody>' +
                '</table>' +
                Pages.paginationHtml(p, 'Pages.renderUserQuality.bind(Pages,document.getElementById("page-user-quality"))') +
            '</div>' +
            '</div>';
    };

    // ==================== 详情弹窗 ====================
    Pages._showUqDetail2 = function (globalIdx) {
        var allData = getData();
        var data = allData;
        if (this._uqTime2) {
            var filterDate = this._uqTime2;
            data = data.filter(function (d) { return d.time.indexOf(filterDate) === 0; });
        }
        if (this._uqCity2) data = data.filter(function (d) { return d.city === Pages._uqCity2; });
        if (this._uqDistrict2) data = data.filter(function (d) { return d.district === Pages._uqDistrict2; });
        if (this._uqAccount2) {
            var kw = this._uqAccount2.toLowerCase();
            data = data.filter(function (d) { return d.userAccount.toLowerCase().indexOf(kw) >= 0; });
        }

        var r = data[globalIdx];
        if (!r) return;

        // 头部用户信息
        var headerHtml =
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:16px;padding:12px;background:linear-gradient(135deg,#f0f5ff 0%,#fef0f0 100%);border-radius:8px;border:1px solid #e0e4e8;">' +
                '<div style="text-align:center;">' +
                    '<div style="font-size:11px;color:#999;">用户账号</div>' +
                    '<div style="font-size:14px;font-weight:700;color:#2b7de9;margin-top:2px;">' + esc(r.userAccount) + '</div>' +
                '</div>' +
                '<div style="text-align:center;">' +
                    '<div style="font-size:11px;color:#999;">地市 / 区县</div>' +
                    '<div style="font-size:13px;font-weight:600;color:#333;margin-top:2px;">' + esc(r.city) + ' · ' + esc(r.district) + '</div>' +
                '</div>' +
                '<div style="text-align:center;">' +
                    '<div style="font-size:11px;color:#999;">OLT / PON口</div>' +
                    '<div style="font-size:12px;color:#666;margin-top:2px;">' + esc(r.olt) + ' / ' + esc(r.pon) + '</div>' +
                '</div>' +
                '<div style="text-align:center;">' +
                    '<div style="font-size:11px;color:#999;">BRAS / 网格</div>' +
                    '<div style="font-size:12px;color:#666;margin-top:2px;">' + esc(r.bras) + ' / ' + esc(r.grid) + '</div>' +
                '</div>' +
            '</div>';

        // 标签详情表
        var detailRows = r.tagDetails.map(function (d) {
            var confColor = d.confidence >= 90 ? '#27ae60' : (d.confidence >= 80 ? '#f39c12' : '#e74c3c');
            return '<tr>' +
                '<td>' + tagTypeBadge(d.type) + '</td>' +
                '<td style="font-weight:600;">' + esc(d.tag) + '</td>' +
                '<td style="font-size:12px;max-width:240px;word-break:break-all;line-height:1.5;">' + esc(d.value) + '</td>' +
                '<td style="font-size:12px;white-space:nowrap;">' + esc(d.timestamp) + '</td>' +
                '<td style="text-align:center;"><span style="display:inline-block;padding:2px 10px;border-radius:12px;background:' + confColor + '15;color:' + confColor + ';font-weight:700;font-size:13px;">' + d.confidence + '%</span></td>' +
                '<td style="font-size:11px;color:#666;max-width:320px;line-height:1.5;">' + esc(d.rule) + '</td>' +
                '</tr>';
        }).join('');

        var detailHtml = headerHtml +
            '<div style="max-height:400px;overflow:auto;">' +
            '<table class="data-table" style="font-size:12px;">' +
                '<thead><tr>' +
                    '<th style="min-width:80px;">标签类型</th>' +
                    '<th style="min-width:80px;">质差标签</th>' +
                    '<th style="min-width:180px;">指标值</th>' +
                    '<th style="min-width:130px;">时间戳</th>' +
                    '<th style="min-width:60px;">置信度</th>' +
                    '<th style="min-width:200px;">标签定义及判定规则</th>' +
                '</tr></thead>' +
                '<tbody>' + detailRows + '</tbody>' +
            '</table>' +
            '</div>';

        Modal.show(
            '质差标签详情 - ' + r.userAccount,
            detailHtml,
            '<button class="btn" onclick="Modal.close()">关闭</button>' +
            '<button class="btn btn-primary" onclick="Modal.close();Pages.createOrderFromQuality && Pages.createOrderFromQuality(0)">生成工单</button>',
            '960px'
        );
    };

    // ==================== 导出 ====================
    Pages._exportUq2 = function () {
        var data = getData();
        if (this._uqTime2) {
            var filterDate = this._uqTime2;
            data = data.filter(function (d) { return d.time.indexOf(filterDate) === 0; });
        }
        if (this._uqCity2) data = data.filter(function (d) { return d.city === Pages._uqCity2; });
        if (this._uqDistrict2) data = data.filter(function (d) { return d.district === Pages._uqDistrict2; });
        if (this._uqAccount2) {
            var kw = this._uqAccount2.toLowerCase();
            data = data.filter(function (d) { return d.userAccount.toLowerCase().indexOf(kw) >= 0; });
        }
        var csv = '时间,地市,区县,装维网格,小区,BRAS,OLT,PON口,用户账号,标签类型,质差标签\n';
        data.forEach(function (r) {
            csv += [r.time, r.city, r.district, r.grid, r.cell, r.bras, r.olt, r.pon, r.userAccount, r.tagTypeStr, r.tagNameStr].join(',') + '\n';
        });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '用户质差数据_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        if (window.Modal) Modal.toast('用户质差数据已导出 (' + data.length + '条)', 'success');
        if (window.DataStore) DataStore.addLog('数据导出', '质差识别', '导出用户质差数据，共' + data.length + '条');
    };

})();
