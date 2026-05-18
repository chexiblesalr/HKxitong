/**
 * 家宽网络质量分析平台 - 子页面渲染模块 (增强版)
 * 所有"开发中"页面已实现：筛选、图表、分页、详情
 */

// SVG Icon Library - replace all emoji with professional inline SVGs
var ICO = {
    satellite: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>',
    bolt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z"/></svg>',
    bell: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
    clipboard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
    heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
    user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    map: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>',
    robot: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/></svg>',
    wrench: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    bulb: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>',
    antenna: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7zm1 9.29c.88-.39 1.5-1.26 1.5-2.29 0-1.38-1.12-2.5-2.5-2.5S9.5 10.62 9.5 12c0 1.02.62 1.9 1.5 2.29v3.3L7.59 21 9 22.41l3-3 3 3L16.41 21 13 17.59v-3.3zM12 1C5.93 1 1 5.93 1 12h2c0-4.97 4.03-9 9-9s9 4.03 9 9h2c0-6.07-4.93-11-11-11z"/></svg>',
    online: '<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#27ae60"/></svg>',
    offline: '<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#ccc"/></svg>',
    star: '<svg width="12" height="12" viewBox="0 0 24 24" fill="#f6bd16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
    analysis: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>',
    locate: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>'
};

var Pages = {
    // ========== 通用分页渲染 ==========
    paginate: function(data, page, size) {
        size = size || 15;
        var total = data.length;
        var totalPages = Math.ceil(total / size);
        page = Math.max(1, Math.min(page, totalPages));
        return { data: data.slice((page - 1) * size, page * size), page: page, totalPages: totalPages, total: total };
    },

    paginationHtml: function(p, callback) {
        if (p.totalPages <= 1) return '';
        var escaped = callback.replace(/"/g, '&quot;');
        var h = '<div class="pagination"><span class="page-info">共 ' + p.total + ' 条，第 ' + p.page + '/' + p.totalPages + ' 页</span>';
        h += '<button class="page-btn" onclick="' + escaped + '(' + Math.max(1, p.page - 1) + ')">&lt;</button>';
        var start = Math.max(1, p.page - 2), end = Math.min(p.totalPages, start + 4);
        start = Math.max(1, end - 4);
        for (var i = start; i <= end; i++) {
            h += '<button class="page-btn' + (i === p.page ? ' active' : '') + '" onclick="' + escaped + '(' + i + ')">' + i + '</button>';
        }
        h += '<button class="page-btn" onclick="' + escaped + '(' + Math.min(p.totalPages, p.page + 1) + ')">&gt;</button></div>';
        return h;
    },

    statusHtml: function(s) {
        var cls = s === '正常' || s === '已恢复' || s === '已解决' || s === '已关闭' || s === '重启成功' || s === '上线' ? 'status-normal' :
                  (s === '告警' || s === '待处理' || s === '处理中' || s === '一般' || s === '待派单' || s === '已派单' || s === '待确认' ? 'status-warning' : 'status-error');
        return '<span class="' + cls + '">' + s + '</span>';
    },

    cityFilterHtml: function(id, onChange, currentValue) {
        var escaped = onChange.replace(/"/g, '&quot;');
        var h = '<div class="form-group"><label class="form-label">地市</label><select class="form-select" style="width:120px;" id="' + id + '" onchange="' + escaped + '">';
        h += '<option value="">全部地市</option>';
        JilinData.cities.forEach(function(c) { h += '<option value="' + c + '"' + (c === currentValue ? ' selected' : '') + '>' + c + '</option>'; });
        h += '</select></div>';
        return h;
    },

    // ========== GIS 视图 (Leaflet + OpenStreetMap, 支持下钻) ==========
    _gisLevel: 'province',
    _gisCityName: '',
    _leafletMap: null,
    _leafletMarkers: [],
    _drillDistrictData: {},

    renderGisView: function(container) {
        this._gisLevel = 'province';
        this._gisCityName = '';
        container.innerHTML =
            '<div class="gis-container">' +
                '<div id="leafletMapContainer" style="width:100%;height:100%;"></div>' +
                '<div class="gis-overlay gis-overlay-light" style="max-height:calc(100% - 32px);overflow-y:auto;">' +
                    '<div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#1a1a2e;">吉林省家宽运营GIS视图</div>' +
                    '<div id="gisBreadcrumb" style="font-size:11px;color:#666;margin-bottom:10px;cursor:pointer;"><span style="color:#2b7de9;" onclick="Pages.gisDrillTo(\'province\')">吉林省</span></div>' +
                    '<div id="gisLegend" style="font-size:11px;line-height:2;color:#333;"></div>' +
                    '<div style="margin-top:12px;padding-top:10px;border-top:1px solid #e0e4e8;">' +
                        '<div style="font-size:11px;color:#666;margin-bottom:6px;">图例说明</div>' +
                        '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#333;margin-bottom:4px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27ae60;"></span> CEI ≥ 93 优秀</div>' +
                        '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#333;margin-bottom:4px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f39c12;"></span> 91 ≤ CEI < 93 良好</div>' +
                        '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#333;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#e74c3c;"></span> CEI < 91 需关注</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        this._initLeafletMap();
    },

    _initLeafletMap: function() {
        var self = this;
        if (this._leafletMap) { this._leafletMap.remove(); this._leafletMap = null; }

        var map = L.map('leafletMapContainer', {
            center: [43.5, 126.5],
            zoom: 7,
            zoomControl: true,
            attributionControl: false
        });

        var tileCfg = window.MAP_CFG || {};
        L.tileLayer(tileCfg.tileUrl || 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            maxZoom: tileCfg.maxZoom || 18,
            minZoom: tileCfg.minZoom || 5,
            subdomains: tileCfg.subdomains || '1234',
            attribution: tileCfg.attribution || '&copy; 高德地图'
        }).addTo(map);

        L.control.attribution({ position: 'bottomright', prefix: '' })
            .addAttribution(tileCfg.attribution || '&copy; 高德地图')
            .addTo(map);

        this._leafletMap = map;
        this._loadProvinceView(map);
    },

    _createCeiIcon: function(score, label, size) {
        size = size || 36;
        var color = score >= 93 ? '#27ae60' : (score >= 91 ? '#f39c12' : '#e74c3c');
        var html = '<div style="position:relative;cursor:pointer;">' +
            '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:3px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:' + (size > 30 ? 11 : 10) + 'px;font-weight:700;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);">' + score + '</div>' +
            '<div style="position:absolute;top:' + (size + 2) + 'px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:' + (size > 30 ? 11 : 10) + 'px;color:#1a1a2e;text-shadow:0 1px 2px rgba(255,255,255,0.8);font-weight:600;">' + label + '</div>' +
            '</div>';
        return L.divIcon({
            html: html,
            className: 'gis-marker-icon',
            iconSize: [size + 10, size + 20],
            iconAnchor: [(size + 10) / 2, (size + 10) / 2]
        });
    },

    _loadProvinceView: function(map) {
        var self = this;
        this._gisLevel = 'province';
        this._clearMarkers();
        this._gisProvinceRows = [];

        var bc = document.getElementById('gisBreadcrumb');
        if (bc) bc.innerHTML = '<span style="color:#2b7de9;">吉林省</span>';

        var cities = JilinData.gisCoordinates;
        var legendHtml = '';
        function _hs(v){var h=0;v=String(v||'');for(var i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return Math.abs(h);}
        for (var city in cities) {
            (function(cityName) {
                var c = cities[cityName];
                var color = c.ceiScore >= 93 ? '#27ae60' : (c.ceiScore >= 91 ? '#f39c12' : '#e74c3c');
                var users = JilinData.cityGatewayDistribution[cityName] ? JilinData.cityGatewayDistribution[cityName].users : 0;
                var connCei = Number((JilinData.ceiDistribution[cityName] || {}).network || c.ceiScore);
                var bizCei  = Number((JilinData.ceiDistribution[cityName] || {}).business || c.ceiScore);
                var qualUsers = (JilinData.userQualityRecords||[]).filter(function(r){return r.city===cityName;}).length;
                var qualApps  = (JilinData.bizQualityRecords||[]).filter(function(r){return r.city===cityName;}).length || (3 + _hs(cityName) % 12);
                var wOrders   = (JilinData.workOrderCityDistribution||{})[cityName] || (20 + _hs(cityName+'o') % 60);
                var closeRate = Number((88 + (c.ceiScore - 88) * 2).toFixed(1));
                var activeUsers = Number((users * (0.93 + (_hs(cityName+'a') % 5) / 100)).toFixed(1));

                var marker = L.marker([c.lat, c.lng], {
                    icon: self._createCeiIcon(c.ceiScore, cityName, 36)
                }).addTo(map);

                var popupContent = '<div style="padding:4px;min-width:210px;">' +
                    '<div style="font-weight:600;font-size:14px;margin-bottom:8px;border-bottom:2px solid ' + color + ';padding-bottom:6px;">' + cityName + '</div>' +
                    '<div style="font-size:12px;line-height:1.9;">' +
                    '<div>总体CEI: <strong style="color:' + color + ';">' + c.ceiScore + '</strong> 分</div>' +
                    '<div>业务CEI: <strong>' + bizCei + '</strong> 分</div>' +
                    '<div>通断CEI: <strong>' + connCei + '</strong> 分</div>' +
                    '<div style="border-top:1px dashed #eee;margin:4px 0;"></div>' +
                    '<div>用户总数: <strong>' + users + '</strong> 万</div>' +
                    '<div>活跃用户数: <strong>' + activeUsers + '</strong> 万</div>' +
                    '<div>质差用户数: <strong style="color:#e74c3c;">' + qualUsers + '</strong></div>' +
                    '<div>质差应用数: <strong style="color:#e74c3c;">' + qualApps + '</strong></div>' +
                    '<div>质差工单量: <strong style="color:#f39c12;">' + wOrders + '</strong></div>' +
                    '<div>工单闭环率: <strong style="color:' + (closeRate>=95?'#27ae60':'#f39c12') + ';">' + closeRate + '%</strong></div>' +
                    '</div>' +
                    '<div style="margin-top:8px;"><a style="color:#2b7de9;font-size:12px;cursor:pointer;" onclick="Pages.gisDrillTo(\'' + cityName + '\')">下钻查看 →</a></div>' +
                    '</div>';
                marker.bindPopup(popupContent, { maxWidth: 260 });

                self._leafletMarkers.push(marker);
                self._gisProvinceRows.push({
                    name: cityName,
                    overall: Number(c.ceiScore),
                    business: Number((JilinData.ceiDistribution[cityName] || {}).business || c.ceiScore),
                    network: Number((JilinData.ceiDistribution[cityName] || {}).network || c.ceiScore),
                    users: Number(users || 0),
                    qualityUsers: Number((JilinData.userQualityRecords || []).filter(function(r) { return r.city === cityName; }).length),
                    qualityApps: Number((JilinData.bizQualityRecords || []).filter(function(r) { return r.city === cityName; }).length),
                    orders: Number((JilinData.workOrderCityDistribution || {})[cityName] || 0),
                    closeRate: Number((88 + (c.ceiScore - 88) * 2).toFixed(1))
                });
                legendHtml += '<div style="display:flex;align-items:center;gap:6px;color:#333;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + '"></span><span style="cursor:pointer;color:#2b7de9;" onclick="Pages.gisDrillTo(\'' + cityName + '\')">' + cityName + '</span>: <strong>' + c.ceiScore + '</strong>分 | ' + users + '万</div>';
            })(city);
        }

        var el = document.getElementById('gisLegend');
        if (el) el.innerHTML = legendHtml;

        map.setView([43.5, 126.5], 7);
        if (this.refreshGisDashboardFromMap) this.refreshGisDashboardFromMap();
    },

    // 预定义各地市下辖区县坐标
    _getDistrictData: function(cityName) {
        var districts = {
            '长春': [
                { name: '南关区', lat: 43.864, lng: 125.350 }, { name: '宽城区', lat: 43.920, lng: 125.326 },
                { name: '朝阳区', lat: 43.852, lng: 125.288 }, { name: '二道区', lat: 43.874, lng: 125.384 },
                { name: '绿园区', lat: 43.881, lng: 125.235 }, { name: '双阳区', lat: 43.525, lng: 125.660 },
                { name: '九台区', lat: 44.152, lng: 125.840 }, { name: '榆树市', lat: 44.840, lng: 126.533 },
                { name: '德惠市', lat: 44.521, lng: 125.728 }, { name: '农安县', lat: 44.432, lng: 125.184 }
            ],
            '吉林': [
                { name: '昌邑区', lat: 43.882, lng: 126.574 }, { name: '龙潭区', lat: 43.910, lng: 126.562 },
                { name: '船营区', lat: 43.833, lng: 126.521 }, { name: '丰满区', lat: 43.821, lng: 126.562 },
                { name: '永吉县', lat: 43.672, lng: 126.497 }, { name: '蛟河市', lat: 43.724, lng: 127.344 },
                { name: '桦甸市', lat: 42.972, lng: 126.746 }, { name: '舒兰市', lat: 44.406, lng: 126.965 },
                { name: '磐石市', lat: 42.946, lng: 126.060 }
            ],
            '四平': [
                { name: '铁西区', lat: 43.146, lng: 124.346 }, { name: '铁东区', lat: 43.162, lng: 124.410 },
                { name: '梨树县', lat: 43.307, lng: 124.336 }, { name: '伊通县', lat: 43.344, lng: 125.305 },
                { name: '公主岭市', lat: 43.504, lng: 124.823 }, { name: '双辽市', lat: 43.518, lng: 123.502 }
            ],
            '辽源': [
                { name: '龙山区', lat: 42.901, lng: 125.136 }, { name: '西安区', lat: 42.927, lng: 125.149 },
                { name: '东丰县', lat: 42.677, lng: 125.531 }, { name: '东辽县', lat: 42.926, lng: 124.991 }
            ],
            '通化': [
                { name: '东昌区', lat: 41.728, lng: 125.927 }, { name: '二道江区', lat: 41.774, lng: 126.042 },
                { name: '梅河口市', lat: 42.539, lng: 125.710 }, { name: '集安市', lat: 41.126, lng: 126.194 },
                { name: '通化县', lat: 41.680, lng: 125.759 }, { name: '辉南县', lat: 42.684, lng: 126.046 },
                { name: '柳河县', lat: 42.284, lng: 125.745 }
            ],
            '白山': [
                { name: '浑江区', lat: 41.943, lng: 126.423 }, { name: '江源区', lat: 42.056, lng: 126.592 },
                { name: '临江市', lat: 41.811, lng: 126.918 }, { name: '抚松县', lat: 42.221, lng: 127.449 },
                { name: '靖宇县', lat: 42.388, lng: 126.813 }, { name: '长白县', lat: 41.420, lng: 128.200 }
            ],
            '松原': [
                { name: '宁江区', lat: 45.172, lng: 124.817 }, { name: '前郭县', lat: 45.118, lng: 124.823 },
                { name: '长岭县', lat: 44.276, lng: 123.967 }, { name: '乾安县', lat: 45.003, lng: 124.041 },
                { name: '扶余市', lat: 44.986, lng: 126.049 }
            ],
            '白城': [
                { name: '洮北区', lat: 45.621, lng: 122.851 }, { name: '镇赉县', lat: 45.847, lng: 123.199 },
                { name: '通榆县', lat: 44.812, lng: 123.088 }, { name: '洮南市', lat: 45.338, lng: 122.787 },
                { name: '大安市', lat: 45.506, lng: 124.292 }
            ],
            '延边': [
                { name: '延吉市', lat: 42.891, lng: 129.508 }, { name: '图们市', lat: 42.968, lng: 129.844 },
                { name: '敦化市', lat: 43.373, lng: 128.232 }, { name: '珲春市', lat: 42.862, lng: 130.366 },
                { name: '龙井市', lat: 42.767, lng: 129.427 }, { name: '和龙市', lat: 42.546, lng: 129.010 },
                { name: '汪清县', lat: 43.313, lng: 129.771 }, { name: '安图县', lat: 43.112, lng: 128.899 }
            ],
            '长白山': [
                { name: '池北区', lat: 42.048, lng: 128.175 }, { name: '池西区', lat: 42.404, lng: 127.524 },
                { name: '池南区', lat: 42.130, lng: 127.220 }
            ]
        };
        return districts[cityName] || [];
    },

    gisDrillTo: function(target) {
        if (target === 'province') {
            if (this._leafletMap) {
                this._loadProvinceView(this._leafletMap);
            }
            return;
        }
        this._gisLevel = 'city';
        this._gisCityName = target;
        var self = this;
        var map = this._leafletMap;
        if (!map) return;

        this._clearMarkers();

        var bc = document.getElementById('gisBreadcrumb');
        if (bc) bc.innerHTML = '<span style="color:#2b7de9;cursor:pointer;" onclick="Pages.gisDrillTo(\'province\')">吉林省</span> <span style="color:#999;"> > </span> <span style="color:#1a1a2e;font-weight:600;">' + target + '</span>';

        var cityCoord = JilinData.gisCoordinates[target];
        if (cityCoord) {
            map.setView([cityCoord.lat, cityCoord.lng], 10);
        }

        // 使用预定义区县数据
        SeededRandom.reset(20251202 + target.charCodeAt(0));
        var districts = this._getDistrictData(target);
        var districtRows = [];
        var legendHtml = '';

        districts.forEach(function(dist) {
            var score = SeededRandom.float(88, 96, 1);
            var color = score >= 93 ? '#27ae60' : (score >= 91 ? '#f39c12' : '#e74c3c');
            var userCount = SeededRandom.int(2, 25);
            var qualityCount = SeededRandom.int(50, 500);
            var businessScore = SeededRandom.float(Math.max(85, score - 2.3), Math.min(96, score + 1.2), 1);
            var networkScore = SeededRandom.float(Math.max(86, score - 1.4), Math.min(96, score + 1.6), 1);
            var qualityApps = SeededRandom.int(3, 18);
            var workOrders = SeededRandom.int(16, 92);
            var closeRate = SeededRandom.float(78, 96, 1);

            var marker = L.marker([dist.lat, dist.lng], {
                icon: self._createCeiIcon(score, dist.name, 30)
            }).addTo(map);

            var popupContent = '<div style="padding:4px;min-width:210px;">' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:6px;border-bottom:2px solid ' + color + ';padding-bottom:5px;">' + dist.name + '</div>' +
                '<div style="font-size:12px;line-height:1.9;">' +
                '<div>总体CEI: <strong style="color:' + color + ';">' + score + '</strong> 分</div>' +
                '<div>业务CEI: <strong>' + businessScore + '</strong> 分</div>' +
                '<div>通断CEI: <strong>' + networkScore + '</strong> 分</div>' +
                '<div style="border-top:1px dashed #eee;margin:4px 0;"></div>' +
                '<div>用户数: <strong>' + userCount + '</strong> 万</div>' +
                '<div>活跃用户数: <strong>' + Number((userCount * (0.93 + (score % 5) / 100)).toFixed(1)) + '</strong> 万</div>' +
                '<div>质差用户数: <strong style="color:#e74c3c;">' + qualityCount + '</strong></div>' +
                '<div>质差应用数: <strong style="color:#e74c3c;">' + qualityApps + '</strong></div>' +
                '<div>质差工单量: <strong style="color:#f39c12;">' + workOrders + '</strong></div>' +
                '<div>工单闭环率: <strong style="color:' + (closeRate>=95?'#27ae60':'#f39c12') + ';">' + closeRate + '%</strong></div>' +
                '</div></div>';
            marker.bindPopup(popupContent, { maxWidth: 240 });

            self._leafletMarkers.push(marker);
            districtRows.push({
                name: dist.name,
                overall: Number(score),
                business: Number(businessScore),
                network: Number(networkScore),
                users: Number(userCount),
                qualityUsers: Number(qualityCount),
                qualityApps: Number(qualityApps),
                orders: Number(workOrders),
                closeRate: Number(closeRate)
            });
            legendHtml += '<div style="display:flex;align-items:center;gap:6px;color:#333;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + '"></span>' + dist.name + ': ' + score + '分</div>';
        });
        this._drillDistrictData[target] = districtRows;

        // Reset random seed
        SeededRandom.reset(20251202);

        var el = document.getElementById('gisLegend');
        if (el) el.innerHTML = legendHtml || '<div style="color:#666;">暂无区县数据</div>';
        if (this.refreshGisDashboardFromMap) this.refreshGisDashboardFromMap();
    },

    _clearMarkers: function() {
        var self = this;
        this._leafletMarkers.forEach(function(m) {
            if (self._leafletMap) self._leafletMap.removeLayer(m);
        });
        this._leafletMarkers = [];
    },

    // ========== KPI 视图 (增强：质差用户清单+质差服务器IP) ==========
    renderKpiView: function(container) {
        var m = JilinData.kpiMetrics;
        container.innerHTML =
            '<div class="page-content">' +
                '<div class="kpi-grid">' +
                    App.kpiCardHtml('宽带用户总数', m.totalBroadbandUsers, '万户', 0.3) +
                    App.kpiCardHtml('活跃用户数', m.activeUsers, '万户', -0.2) +
                    App.kpiCardHtml('总体CEI评分', m.totalCeiScore, '分', 0.5) +
                    App.kpiCardHtml('业务CEI评分', m.businessCeiScore, '分', 0.3) +
                    App.kpiCardHtml('网络CEI评分', m.networkCeiScore, '分', 0.2) +
                    App.kpiCardHtml('家庭网络优良率', m.homeNetworkQuality, '%', 1.2) +
                    App.kpiCardHtml('TOP10视频下载速率', m.top10VideoAvgSpeed, 'Mbps', 2.3) +
                    App.kpiCardHtml('TOP10游戏时延', m.gamingLatency, 'ms', -0.8) +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
                    '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">用户中断平均时长趋势（小时粒度）</span></div><div class="chart-container" id="kpiChart1"></div></div>' +
                    '<div class="chart-card"><div class="chart-card-header"><span class="chart-title">各地市CEI评分对比</span></div><div class="chart-container" id="kpiChart2"></div></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
                    '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">质差用户清单 TOP20</div>' +
                    '<table class="data-table"><thead><tr><th>用户账号</th><th>地市</th><th>CEI评分</th><th>质差类型</th><th>影响业务</th></tr></thead><tbody id="kpiQualityUsers"></tbody></table></div>' +
                    '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">质差服务器IP清单</div>' +
                    '<table class="data-table"><thead><tr><th>服务器IP</th><th>应用</th><th>平均时延</th><th>丢包率</th><th>影响用户数</th></tr></thead><tbody id="kpiQualityServers"></tbody></table></div>' +
                '</div>' +
            '</div>';
        this.initKpiCharts();
        this._renderKpiLists();
    },

    _renderKpiLists: function() {
        // 质差用户TOP20
        var userBody = document.getElementById('kpiQualityUsers');
        if (userBody) {
            var qualityUsers = JilinData.userQualityRecords.slice(0, 20);
            userBody.innerHTML = qualityUsers.map(function(r) {
                return '<tr><td>' + r.userAccount + '</td><td>' + r.city + '</td><td><span class="status-error">' + r.ceiScore + '</span></td><td>' + r.qualityType + '</td><td>' + r.affectedBiz + '</td></tr>';
            }).join('');
        }
        // 质差服务器IP
        var serverBody = document.getElementById('kpiQualityServers');
        if (serverBody) {
            var servers = [];
            var apps = ['抖音CDN', '腾讯视频', '爱奇艺', 'B站', '快手', '王者荣耀', '和平精英', '百度云', '阿里云', '华为云'];
            for (var i = 0; i < 15; i++) {
                servers.push({
                    ip: SeededRandom.int(1, 223) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254),
                    app: SeededRandom.pick(apps),
                    latency: SeededRandom.float(30, 120, 1),
                    loss: SeededRandom.float(2, 15, 2),
                    users: SeededRandom.int(50, 3000)
                });
            }
            serverBody.innerHTML = servers.map(function(s) {
                return '<tr><td>' + s.ip + '</td><td>' + s.app + '</td><td><span class="status-warning">' + s.latency + 'ms</span></td><td><span class="status-error">' + s.loss + '%</span></td><td>' + s.users + '</td></tr>';
            }).join('');
        }
    },

    initKpiCharts: function() {
        var d1 = document.getElementById('kpiChart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['kpiChart1'] = c1;
            // 用户中断平均时长（小时粒度）
            var hours = [];
            for (var i = 0; i < 24; i++) hours.push(i + ':00');
            var interruptData = [];
            for (var i = 0; i < 24; i++) interruptData.push(SeededRandom.float(0.5, 8.5, 1));
            c1.setOption({
                grid: { top: 20, right: 20, bottom: 30, left: 45 }, tooltip: { trigger: 'axis', formatter: '{b}<br/>中断平均时长: {c} 分钟' },
                xAxis: { type: 'category', data: hours, axisLabel: { fontSize: 9, color: '#999' } },
                yAxis: { type: 'value', name: '分钟', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
                series: [{ type: 'line', data: interruptData, smooth: true, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(91,143,249,0.3)' }, { offset: 1, color: 'rgba(91,143,249,0)' }] } }, lineStyle: { color: '#5b8ff9', width: 2 }, itemStyle: { color: '#5b8ff9' } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('kpiChart2');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['kpiChart2'] = c2;
            var ct = [], sc = [];
            for (var c in JilinData.ceiDistribution) { ct.push(c); sc.push(JilinData.ceiDistribution[c].overall); }
            c2.setOption({
                grid: { top: 20, right: 20, bottom: 40, left: 40 }, tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: ct, axisLabel: { fontSize: 10, rotate: 30 } },
                yAxis: { type: 'value', min: 88, max: 96, splitLine: { lineStyle: { color: '#f0f2f5' } } },
                series: [{ type: 'bar', data: sc.map(function(v) { return { value: v, itemStyle: { color: v >= 93 ? '#27ae60' : (v >= 91 ? '#f39c12' : '#e74c3c') } }; }), barWidth: '50%' }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    },

    // ========== PON光功率异常管理 (增强：统计/筛选/详情/处理/批量) ==========
    _ponPage: 1,
    _ponCity: '',
    _ponSeverity: '',
    _ponStatus: '',
    _ponType: '',
    _ponKeyword: '',
    _getPonAnomalies: function() {
        var stored = DataStore.load('ponAnomalies', null);
        if (!stored || !stored.length) { DataStore.save('ponAnomalies', JilinData.ponAnomalies); return JilinData.ponAnomalies; }
        return stored;
    },
    _savePonAnomalies: function(data) { DataStore.save('ponAnomalies', data); },
    renderPonPower: function(container, page) {
        this._ponPage = page || 1;
        var allData = this._getPonAnomalies();
        var data = allData;
        if (this._ponCity) data = data.filter(function(d) { return d.city === Pages._ponCity; });
        if (this._ponSeverity) data = data.filter(function(d) { return d.severity === Pages._ponSeverity; });
        if (this._ponStatus) data = data.filter(function(d) { return d.status === Pages._ponStatus; });
        if (this._ponType) data = data.filter(function(d) { return d.anomalyType === Pages._ponType; });
        if (this._ponKeyword) {
            var kw = this._ponKeyword.toLowerCase();
            data = data.filter(function(d) { return d.id.toLowerCase().indexOf(kw) >= 0 || d.oltId.toLowerCase().indexOf(kw) >= 0 || d.ponPort.toLowerCase().indexOf(kw) >= 0; });
        }
        // 统计
        var stats = { total: allData.length, pending: 0, processing: 0, resolved: 0, severe: 0 };
        allData.forEach(function(d) {
            if (d.status === '待处理') stats.pending++;
            else if (d.status === '处理中') stats.processing++;
            else if (d.status === '已恢复') stats.resolved++;
            if (d.severity === '严重' || d.severity === '紧急') stats.severe++;
        });
        var p = this.paginate(data, this._ponPage, 10);
        var rows = p.data.map(function(r) {
            return '<tr>' +
                '<td><input type="checkbox" class="pon-row-chk" data-id="' + r.id + '"></td>' +
                '<td>' + r.id + '</td><td>' + r.oltId + '</td><td>' + r.ponPort + '</td><td>' + r.city + '</td>' +
                '<td>' + r.txPower + ' dBm</td><td>' + r.rxPower + ' dBm</td><td>' + r.anomalyType + '</td>' +
                '<td>' + Pages.statusHtml(r.severity) + '</td><td>' + r.affectedUsers + '</td>' +
                '<td>' + Pages.statusHtml(r.status) + '</td><td>' + r.discoveryTime + '</td>' +
                '<td>' +
                    '<a style="color:#2b7de9;cursor:pointer;margin-right:6px;" onclick="Pages.showPonDetail(\'' + r.id + '\')">详情</a>' +
                    (r.status !== '已恢复' ? '<a style="color:#27ae60;cursor:pointer;margin-right:6px;" onclick="Pages.handlePonAnomaly(\'' + r.id + '\')">处理</a>' : '') +
                    '<a style="color:#e74c3c;cursor:pointer;" onclick="Pages.deletePonAnomaly(\'' + r.id + '\')">删除</a>' +
                '</td></tr>';
        }).join('') || '<tr><td colspan="13" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

        var sevOpts = '<option value="">全部严重程度</option>';
        ['紧急','严重','一般'].forEach(function(s) { sevOpts += '<option value="' + s + '"' + (s === Pages._ponSeverity ? ' selected' : '') + '>' + s + '</option>'; });
        var statusOpts = '<option value="">全部状态</option>';
        ['待处理','处理中','已恢复'].forEach(function(s) { statusOpts += '<option value="' + s + '"' + (s === Pages._ponStatus ? ' selected' : '') + '>' + s + '</option>'; });
        var typeOpts = '<option value="">全部类型</option>';
        ['光功率偏低','光功率偏高','ONU离线','光衰增大','PON口异常'].forEach(function(t) { typeOpts += '<option value="' + t + '"' + (t === Pages._ponType ? ' selected' : '') + '>' + t + '</option>'; });

        container.innerHTML =
            '<div class="page-content">' +
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
                    '<div class="wo-stat-card"><div class="wo-stat-value">' + stats.total + '</div><div class="wo-stat-label">异常总数</div></div>' +
                    '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + stats.pending + '</div><div class="wo-stat-label">待处理</div></div>' +
                    '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + stats.processing + '</div><div class="wo-stat-label">处理中</div></div>' +
                    '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + stats.resolved + '</div><div class="wo-stat-label">已恢复</div></div>' +
                    '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#c0392b;">' + stats.severe + '</div><div class="wo-stat-label">严重/紧急</div></div>' +
                '</div>' +
                '<div class="remote-panel"><div class="remote-panel-title">PON光功率异常管理</div>' +
                '<div class="remote-form">' +
                this.cityFilterHtml('ponCityFilter', 'Pages._ponCity=this.value;Pages.renderPonPower(document.getElementById("page-pon-power"),1)', this._ponCity) +
                '<div class="form-group"><label class="form-label">异常类型</label><select class="form-select" onchange="Pages._ponType=this.value;Pages.renderPonPower(document.getElementById(\'page-pon-power\'),1)">' + typeOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">严重程度</label><select class="form-select" onchange="Pages._ponSeverity=this.value;Pages.renderPonPower(document.getElementById(\'page-pon-power\'),1)">' + sevOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">处理状态</label><select class="form-select" onchange="Pages._ponStatus=this.value;Pages.renderPonPower(document.getElementById(\'page-pon-power\'),1)">' + statusOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">关键字</label><input class="form-input" id="ponKwInput" value="' + (this._ponKeyword || '') + '" placeholder="异常ID/OLT/端口"></div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                    '<button class="btn btn-primary" onclick="Pages._ponKeyword=document.getElementById(\'ponKwInput\').value.trim();Pages.renderPonPower(document.getElementById(\'page-pon-power\'),1)">查询</button>' +
                    '<button class="btn" onclick="Pages.resetPonFilter()">重置</button>' +
                    '<button class="btn" onclick="Pages.batchHandlePon()">批量处理</button>' +
                    '<button class="btn" onclick="Pages.exportPonAnomalies()">导出</button>' +
                '</div></div></div>' +
                '<div class="data-table-wrapper"><table class="data-table"><thead><tr>' +
                    '<th style="width:30px;"><input type="checkbox" id="ponSelAll" onclick="Pages.togglePonSelectAll(this)"></th>' +
                    '<th>异常ID</th><th>OLT</th><th>PON端口</th><th>地市</th><th>发送功率</th><th>接收功率</th><th>异常类型</th><th>严重程度</th><th>影响用户</th><th>状态</th><th>发现时间</th><th>操作</th>' +
                '</tr></thead><tbody>' + rows + '</tbody></table>' +
                this.paginationHtml(p, 'Pages.renderPonPower.bind(Pages,document.getElementById("page-pon-power"))') + '</div></div>';
    },

    resetPonFilter: function() {
        this._ponCity = ''; this._ponSeverity = ''; this._ponStatus = ''; this._ponType = ''; this._ponKeyword = '';
        this.renderPonPower(document.getElementById('page-pon-power'), 1);
    },

    togglePonSelectAll: function(el) {
        document.querySelectorAll('.pon-row-chk').forEach(function(c) { c.checked = el.checked; });
    },

    showPonDetail: function(id) {
        var data = this._getPonAnomalies();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { r = data[i]; break; } }
        if (!r) return;
        var sevColor = r.severity === '紧急' || r.severity === '严重' ? '#e74c3c' : '#f39c12';
        Modal.show('PON异常详情 - ' + r.id,
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
            '<div><strong>异常ID：</strong>' + r.id + '</div>' +
            '<div><strong>地市：</strong>' + r.city + '</div>' +
            '<div><strong>OLT设备：</strong>' + r.oltId + '</div>' +
            '<div><strong>PON端口：</strong>' + r.ponPort + '</div>' +
            '<div><strong>异常类型：</strong>' + r.anomalyType + '</div>' +
            '<div><strong>严重程度：</strong><span style="color:' + sevColor + ';font-weight:600;">' + r.severity + '</span></div>' +
            '<div><strong>发送光功率：</strong>' + r.txPower + ' dBm</div>' +
            '<div><strong>接收光功率：</strong>' + r.rxPower + ' dBm</div>' +
            '<div><strong>影响用户数：</strong>' + r.affectedUsers + ' 户</div>' +
            '<div><strong>处理状态：</strong>' + r.status + '</div>' +
            '<div><strong>发现时间：</strong>' + r.discoveryTime + '</div>' +
            '<div><strong>处理人：</strong>' + (r.handler || '-') + '</div>' +
            '</div>' +
            (r.handleNote ? '<div style="margin-top:12px;padding:10px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;"><strong>处理记录：</strong>' + r.handleNote + '</div>' : '') +
            '<div style="margin-top:12px;padding:10px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:12px;">' +
                '<strong>处理建议：</strong>' +
                (r.anomalyType === '光功率偏低' ? '检查光纤接头是否清洁、光分路器是否老化，必要时更换尾纤' :
                 r.anomalyType === '光功率偏高' ? '检查光模块输出功率是否过大，调整发射功率或更换光模块' :
                 r.anomalyType === 'ONU离线' ? '检查ONU供电、光路连接，必要时上门处理' :
                 r.anomalyType === '光衰增大' ? '排查光路损耗增大点，重新熔接或更换光纤' : '检查PON端口配置及板卡状态，必要时倒换主备') +
            '</div>',
            '<button class="btn" onclick="Modal.close()">关闭</button>' +
            (r.status !== '已恢复' ? '<button class="btn btn-primary" onclick="Modal.close();Pages.handlePonAnomaly(\'' + r.id + '\')">立即处理</button>' : ''),
            '680px'
        );
    },

    handlePonAnomaly: function(id) {
        // 查找该异常的地市
        var data = this._getPonAnomalies();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { r = data[i]; break; } }
        var city = r ? r.city : '';
        var engineers = JilinData.findEngineers(city, '光路');
        if (engineers.length === 0) engineers = JilinData.findEngineers(city, null);
        var engineerOpts = '';
        engineers.forEach(function(e, i) {
            var statusIcon = e.online ? '[+]' : '[-]';
            engineerOpts += '<option value="' + e.name + '"' + (i === 0 ? ' selected' : '') + '>' + statusIcon + ' ' + e.name + ' (' + e.team + ')</option>';
        });
        if (engineers.length === 0) {
            JilinData.engineers.slice(0, 8).forEach(function(e) { engineerOpts += '<option value="' + e.name + '">' + e.name + ' (' + e.city + ')</option>'; });
        }
        Modal.show('处理PON异常 - ' + id,
            '<div class="form-group"><label class="form-label">处理动作 *</label><select class="form-select" id="ponHandleAction"><option>派单上门</option><option>远程调测</option><option>切换主备</option><option>更换设备</option><option>误报关闭</option></select></div>' +
            '<div class="form-group"><label class="form-label">处理人 *（' + (city || '全省') + '）</label><select class="form-select" id="ponHandler">' + engineerOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">处理结果</label><select class="form-select" id="ponHandleResult"><option value="处理中">标记处理中</option><option value="已恢复">已恢复</option></select></div>' +
            '<div class="form-group"><label class="form-label">处理备注</label><textarea class="form-input" id="ponHandleNote" rows="3" placeholder="请填写处理过程与结果"></textarea></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doHandlePon(\'' + id + '\')">提交</button>',
            '480px'
        );
    },

    doHandlePon: function(id) {
        var action = document.getElementById('ponHandleAction').value;
        var handler = document.getElementById('ponHandler').value;
        var result = document.getElementById('ponHandleResult').value;
        var note = document.getElementById('ponHandleNote').value.trim();
        var data = this._getPonAnomalies();
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                data[i].status = result;
                data[i].handler = handler;
                data[i].handleNote = (note ? note + ' | ' : '') + '处理动作：' + action;
                break;
            }
        }
        this._savePonAnomalies(data);
        DataStore.addLog('异常处理', 'PON管理', handler + ' 处理PON异常 ' + id + '，结果：' + result);
        Modal.close();
        Modal.toast('异常已' + (result === '已恢复' ? '恢复' : '标记处理中'), 'success');
        this.renderPonPower(document.getElementById('page-pon-power'), this._ponPage);
    },

    deletePonAnomaly: function(id) {
        var self = this;
        Modal.show('确认删除',
            '<div style="padding:10px 0;font-size:13px;">确定要删除异常记录 <strong>' + id + '</strong> 吗？此操作不可恢复。</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" style="background:#e74c3c;border-color:#e74c3c;" onclick="Pages.doDeletePon(\'' + id + '\')">确认删除</button>',
            '420px'
        );
    },

    doDeletePon: function(id) {
        var data = this._getPonAnomalies().filter(function(d) { return d.id !== id; });
        this._savePonAnomalies(data);
        DataStore.addLog('删除', 'PON管理', '删除PON异常记录 ' + id);
        Modal.close();
        Modal.toast('已删除', 'success');
        this.renderPonPower(document.getElementById('page-pon-power'), this._ponPage);
    },

    batchHandlePon: function() {
        var ids = [];
        document.querySelectorAll('.pon-row-chk:checked').forEach(function(c) { ids.push(c.getAttribute('data-id')); });
        if (ids.length === 0) { Modal.toast('请先勾选要处理的记录', 'warning'); return; }
        var engineerOpts = '';
        JilinData.engineers.filter(function(e) { return e.online; }).slice(0, 10).forEach(function(e) {
            engineerOpts += '<option value="' + e.name + '">' + e.name + ' (' + e.city + ' · ' + e.team + ')</option>';
        });
        Modal.show('批量处理 (' + ids.length + ' 条)',
            '<div class="form-group"><label class="form-label">批量动作 *</label><select class="form-select" id="batchPonAction"><option value="已恢复">批量标记已恢复</option><option value="处理中">批量标记处理中</option><option value="delete">批量删除</option></select></div>' +
            '<div class="form-group"><label class="form-label">处理人</label><select class="form-select" id="batchPonHandler">' + engineerOpts + '</select></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doBatchHandlePon(' + JSON.stringify(ids).replace(/"/g, '&quot;') + ')">确认</button>',
            '440px'
        );
    },

    doBatchHandlePon: function(ids) {
        var action = document.getElementById('batchPonAction').value;
        var handler = document.getElementById('batchPonHandler').value;
        var data = this._getPonAnomalies();
        if (action === 'delete') {
            data = data.filter(function(d) { return ids.indexOf(d.id) < 0; });
        } else {
            data.forEach(function(d) { if (ids.indexOf(d.id) >= 0) { d.status = action; d.handler = handler; } });
        }
        this._savePonAnomalies(data);
        DataStore.addLog('批量处理', 'PON管理', '批量' + (action === 'delete' ? '删除' : '处理为' + action) + ' ' + ids.length + ' 条PON异常');
        Modal.close();
        Modal.toast('批量操作完成 (' + ids.length + ' 条)', 'success');
        this.renderPonPower(document.getElementById('page-pon-power'), 1);
    },

    exportPonAnomalies: function() {
        var data = this._getPonAnomalies();
        if (this._ponCity) data = data.filter(function(d) { return d.city === Pages._ponCity; });
        if (this._ponSeverity) data = data.filter(function(d) { return d.severity === Pages._ponSeverity; });
        if (this._ponStatus) data = data.filter(function(d) { return d.status === Pages._ponStatus; });
        var csv = '异常ID,OLT,PON端口,地市,发送功率(dBm),接收功率(dBm),异常类型,严重程度,影响用户,状态,发现时间\n';
        data.forEach(function(r) {
            csv += [r.id, r.oltId, r.ponPort, r.city, r.txPower, r.rxPower, r.anomalyType, r.severity, r.affectedUsers, r.status, r.discoveryTime].join(',') + '\n';
        });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'PON光功率异常_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('数据已导出 (' + data.length + ' 条)', 'success');
        DataStore.addLog('数据导出', 'PON管理', '导出PON光功率异常 ' + data.length + ' 条');
    },

    // ========== 光路测试上下线 (增强：统计/筛选/详情/手动测试) ==========
    _otPage: 1, _otCity: '', _otEvent: '', _otReason: '', _otKw: '',
    _getOpticalTests: function() {
        var stored = DataStore.load('opticalTests', null);
        if (!stored || !stored.length) { DataStore.save('opticalTests', JilinData.opticalTestRecords); return JilinData.opticalTestRecords; }
        return stored;
    },
    _saveOpticalTests: function(d) { DataStore.save('opticalTests', d); },
    renderOpticalTest: function(container, page) {
        this._otPage = page || 1;
        var allData = this._getOpticalTests();
        var data = allData;
        if (this._otCity) data = data.filter(function(d) { return d.city === Pages._otCity; });
        if (this._otEvent) data = data.filter(function(d) { return d.eventType === Pages._otEvent; });
        if (this._otReason) data = data.filter(function(d) { return d.reason === Pages._otReason; });
        if (this._otKw) {
            var kw = this._otKw.toLowerCase();
            data = data.filter(function(d) { return d.id.toLowerCase().indexOf(kw) >= 0 || d.oltId.toLowerCase().indexOf(kw) >= 0 || d.ontId.toLowerCase().indexOf(kw) >= 0; });
        }
        // 统计
        var stats = { total: allData.length, online: 0, offline: 0 };
        allData.forEach(function(d) { if (d.eventType === '上线') stats.online++; else stats.offline++; });
        var p = this.paginate(data, this._otPage, 10);
        var rows = p.data.map(function(r) {
            var rxCls = r.rxPower < -25 ? 'status-error' : (r.rxPower < -22 ? 'status-warning' : 'status-normal');
            return '<tr><td>' + r.id + '</td><td>' + r.oltId + '</td><td>' + r.ontId + '</td><td>' + r.ponPort + '</td><td>' + r.city + '</td><td>' + Pages.statusHtml(r.eventType) + '</td><td>' + r.reason + '</td><td>' + r.txPower + ' dBm</td><td><span class="' + rxCls + '">' + r.rxPower + ' dBm</span></td><td>' + r.duration + '</td><td>' + r.eventTime + '</td>' +
                '<td><a style="color:#2b7de9;cursor:pointer;margin-right:6px;" onclick="Pages.showOtDetail(\'' + r.id + '\')">详情</a><a style="color:#27ae60;cursor:pointer;" onclick="Pages.testOnt(\'' + r.ontId + '\')">测试</a></td></tr>';
        }).join('') || '<tr><td colspan="12" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

        var evtOpts = '<option value="">全部事件</option>';
        ['上线','下线'].forEach(function(s) { evtOpts += '<option value="' + s + '"' + (s === Pages._otEvent ? ' selected' : '') + '>' + s + '</option>'; });
        var reasonOpts = '<option value="">全部原因</option>';
        ['正常注册','光功率低','设备故障','用户关机','dying-gasp','掉电'].forEach(function(s) { reasonOpts += '<option value="' + s + '"' + (s === Pages._otReason ? ' selected' : '') + '>' + s + '</option>'; });

        container.innerHTML =
            '<div class="page-content">' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + stats.total + '</div><div class="wo-stat-label">测试记录总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + stats.online + '</div><div class="wo-stat-label">上线事件</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + stats.offline + '</div><div class="wo-stat-label">下线事件</div></div>' +
            '</div>' +
            '<div class="remote-panel"><div class="remote-panel-title">光路测试上下线</div>' +
            '<div class="remote-form">' +
                this.cityFilterHtml('otCityFilter', 'Pages._otCity=this.value;Pages.renderOpticalTest(document.getElementById("page-optical-test"),1)', this._otCity) +
                '<div class="form-group"><label class="form-label">事件类型</label><select class="form-select" onchange="Pages._otEvent=this.value;Pages.renderOpticalTest(document.getElementById(\'page-optical-test\'),1)">' + evtOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">原因</label><select class="form-select" onchange="Pages._otReason=this.value;Pages.renderOpticalTest(document.getElementById(\'page-optical-test\'),1)">' + reasonOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">关键字</label><input class="form-input" id="otKwInput" value="' + (this._otKw || '') + '" placeholder="测试ID/OLT/ONT"></div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                    '<button class="btn btn-primary" onclick="Pages._otKw=document.getElementById(\'otKwInput\').value.trim();Pages.renderOpticalTest(document.getElementById(\'page-optical-test\'),1)">查询</button>' +
                    '<button class="btn" onclick="Pages._otCity=\'\';Pages._otEvent=\'\';Pages._otReason=\'\';Pages._otKw=\'\';Pages.renderOpticalTest(document.getElementById(\'page-optical-test\'),1)">重置</button>' +
                    '<button class="btn" onclick="Pages.startOpticalTest()">手动触发测试</button>' +
                    '<button class="btn" onclick="Pages.exportOpticalTests()">导出</button>' +
                '</div></div></div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>测试ID</th><th>OLT</th><th>ONT</th><th>PON口</th><th>地市</th><th>事件</th><th>原因</th><th>发送功率</th><th>接收功率</th><th>持续时长</th><th>时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderOpticalTest.bind(Pages,document.getElementById("page-optical-test"))') + '</div></div>';
    },

    showOtDetail: function(id) {
        var data = this._getOpticalTests();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { r = data[i]; break; } }
        if (!r) return;
        Modal.show('光路测试详情 - ' + r.id,
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
            '<div><strong>测试ID：</strong>' + r.id + '</div>' +
            '<div><strong>地市：</strong>' + r.city + '</div>' +
            '<div><strong>OLT：</strong>' + r.oltId + '</div>' +
            '<div><strong>ONT：</strong>' + r.ontId + '</div>' +
            '<div><strong>PON端口：</strong>' + r.ponPort + '</div>' +
            '<div><strong>事件：</strong>' + r.eventType + '</div>' +
            '<div><strong>原因：</strong>' + r.reason + '</div>' +
            '<div><strong>持续时长：</strong>' + r.duration + '</div>' +
            '<div><strong>发送光功率：</strong>' + r.txPower + ' dBm</div>' +
            '<div><strong>接收光功率：</strong>' + r.rxPower + ' dBm</div>' +
            '<div><strong>事件时间：</strong>' + r.eventTime + '</div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">关闭</button>' +
            '<button class="btn btn-primary" onclick="Modal.close();Pages.testOnt(\'' + r.ontId + '\')">立即测试</button>',
            '560px'
        );
    },

    startOpticalTest: function() {
        Modal.show('手动触发光路测试',
            '<div class="form-group"><label class="form-label">ONT设备ID *</label><input class="form-input" id="otNewOnt" placeholder="如 ONT-CC-00123"></div>' +
            '<div class="form-group"><label class="form-label">所属OLT</label><input class="form-input" id="otNewOlt" placeholder="如 OLT-CC-0005"></div>' +
            '<div class="form-group"><label class="form-label">PON端口</label><input class="form-input" id="otNewPort" placeholder="如 GPON 0/1/3" value="GPON 0/1/3"></div>' +
            '<div class="form-group"><label class="form-label">地市</label><select class="form-select" id="otNewCity">' + JilinData.cities.map(function(c) { return '<option>' + c + '</option>'; }).join('') + '</select></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doStartOpticalTest()">开始测试</button>',
            '460px'
        );
    },

    doStartOpticalTest: function() {
        var ont = document.getElementById('otNewOnt').value.trim();
        if (!ont) { Modal.toast('请输入ONT设备ID', 'warning'); return; }
        var olt = document.getElementById('otNewOlt').value.trim() || 'OLT-AUTO';
        var port = document.getElementById('otNewPort').value.trim() || 'GPON 0/0/0';
        var city = document.getElementById('otNewCity').value;
        var newRec = {
            id: 'OT-' + String(Date.now()).slice(-6),
            oltId: olt,
            ontId: ont,
            ponPort: port,
            city: city,
            eventType: '上线',
            reason: '手动测试',
            txPower: parseFloat((1.5 + Math.random() * 1.7).toFixed(2)),
            rxPower: parseFloat((-15 - Math.random() * 11).toFixed(2)),
            eventTime: new Date().toLocaleString('zh-CN'),
            duration: '-'
        };
        var data = this._getOpticalTests();
        data.unshift(newRec);
        this._saveOpticalTests(data);
        DataStore.addLog('光路测试', '光路管理', '手动触发测试 ' + ont + '，接收光功率 ' + newRec.rxPower + ' dBm');
        Modal.close();
        Modal.toast('光路测试完成', 'success');
        this.renderOpticalTest(document.getElementById('page-optical-test'), 1);
    },

    testOnt: function(ontId) {
        Modal.show('测试中...', '<div style="text-align:center;padding:20px;"><div class="loading-spinner" style="margin:0 auto 12px;"></div><div style="color:#666;">正在测试 ' + ontId + ' 光路状态...</div></div>', '');
        setTimeout(function() {
            var rx = parseFloat((-15 - Math.random() * 11).toFixed(2));
            var tx = parseFloat((1.5 + Math.random() * 1.7).toFixed(2));
            Modal.show('测试结果 - ' + ontId,
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:8px 0;">' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;">发送功率</div><div style="font-size:20px;font-weight:700;color:#27ae60;">' + tx + ' dBm</div></div>' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;">接收功率</div><div style="font-size:20px;font-weight:700;color:' + (rx < -25 ? '#e74c3c' : (rx < -22 ? '#f39c12' : '#27ae60')) + ';">' + rx + ' dBm</div></div>' +
                '</div><div style="margin-top:10px;text-align:center;font-size:12px;color:#666;">测试时间：' + new Date().toLocaleString('zh-CN') + '</div>',
                '<button class="btn" onclick="Modal.close()">关闭</button>', '440px'
            );
            DataStore.addLog('光路测试', '光路管理', '测试ONT ' + ontId + '，rxPower ' + rx + ' dBm');
        }, 1200);
    },

    exportOpticalTests: function() {
        var data = this._getOpticalTests();
        if (this._otCity) data = data.filter(function(d) { return d.city === Pages._otCity; });
        var csv = '测试ID,OLT,ONT,PON口,地市,事件,原因,发送功率,接收功率,持续时长,时间\n';
        data.forEach(function(r) { csv += [r.id, r.oltId, r.ontId, r.ponPort, r.city, r.eventType, r.reason, r.txPower, r.rxPower, r.duration, r.eventTime].join(',') + '\n'; });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '光路测试_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('已导出 (' + data.length + ' 条)', 'success');
        DataStore.addLog('数据导出', '光路管理', '导出光路测试 ' + data.length + ' 条');
    },

    // ========== CON网络分析 ==========
    _conPage: 1, _conCity: '',
    renderConAnalysis: function(container, page) {
        this._conPage = page || 1;
        var data = JilinData.conAnalysisRecords;
        if (this._conCity) data = data.filter(function(d) { return d.city === Pages._conCity; });
        var p = this.paginate(data, this._conPage, 12);
        var rows = p.data.map(function(r) {
            return '<tr><td>' + r.id + '</td><td>' + r.city + '</td><td>' + r.nodeType + '</td><td>' + r.nodeId + '</td><td>' + r.bandwidth + '</td><td>' + r.utilization + '%</td><td>' + r.peakUtil + '%</td><td>' + r.latency + 'ms</td><td>' + r.packetLoss + '%</td><td>' + Pages.statusHtml(r.status) + '</td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">CON网络分析</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('conCityFilter', 'Pages._conCity=this.value;Pages.renderConAnalysis(document.getElementById("page-con-analysis"),1)', this._conCity) + '</div></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">带宽利用率分布</span></div><div class="chart-container" id="conChart1"></div></div>' +
                '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">节点类型分布</span></div><div class="chart-container" id="conChart2"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>ID</th><th>地市</th><th>节点类型</th><th>节点ID</th><th>带宽</th><th>利用率</th><th>峰值利用率</th><th>时延</th><th>丢包率</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderConAnalysis.bind(Pages,document.getElementById("page-con-analysis"))') + '</div></div>';
        // CON图表
        var cd1 = document.getElementById('conChart1');
        if (cd1) {
            var cc1 = echarts.init(cd1); App.chartInstances['conChart1'] = cc1;
            var ranges = [0,0,0,0,0];
            JilinData.conAnalysisRecords.forEach(function(r) { var u = r.utilization; if(u<20)ranges[0]++;else if(u<40)ranges[1]++;else if(u<60)ranges[2]++;else if(u<80)ranges[3]++;else ranges[4]++; });
            cc1.setOption({ tooltip:{}, xAxis:{type:'category',data:['0-20%','20-40%','40-60%','60-80%','80-100%']}, yAxis:{type:'value'}, series:[{type:'bar',data:ranges,itemStyle:{color:function(p){return ['#27ae60','#5b8ff9','#f6bd16','#f39c12','#e74c3c'][p.dataIndex];}}}] });
            window.addEventListener('resize',function(){cc1.resize();});
        }
        var cd2 = document.getElementById('conChart2');
        if (cd2) {
            var cc2 = echarts.init(cd2); App.chartInstances['conChart2'] = cc2;
            var typeMap = {};
            JilinData.conAnalysisRecords.forEach(function(r) { typeMap[r.nodeType] = (typeMap[r.nodeType]||0)+1; });
            var pieData = [];
            for(var k in typeMap) pieData.push({name:k,value:typeMap[k]});
            cc2.setOption({ tooltip:{trigger:'item'}, series:[{type:'pie',radius:['30%','60%'],data:pieData,label:{fontSize:10}}] });
            window.addEventListener('resize',function(){cc2.resize();});
        }
    },

    // ========== CEI查询 (增强：支持用户详情下钻) ==========
    _ceiPage: 1, _ceiCity: '', _ceiAccount: '',
    renderCeiQuery: function(container, page) {
        this._ceiPage = page || 1;
        var data = JilinData.ceiUserRecords;
        if (this._ceiCity) data = data.filter(function(d) { return d.city === Pages._ceiCity; });
        if (this._ceiAccount) {
            var kw = this._ceiAccount.toLowerCase();
            data = data.filter(function(d) { return d.account.toLowerCase().indexOf(kw) >= 0; });
        }
        var p = this.paginate(data, this._ceiPage, 15);
        var rows = p.data.map(function(r, idx) {
            var globalIdx = (Pages._ceiPage - 1) * 15 + idx;
            var ceiCls = r.overallCei < 70 ? 'status-error' : (r.overallCei < 80 ? 'status-warning' : 'status-normal');
            return '<tr><td><a style="color:#2b7de9;cursor:pointer;" onclick="Pages.showCeiDetail(' + globalIdx + ')">' + r.account + '</a></td><td>' + r.city + '</td><td>' + r.area + '</td><td><span class="' + ceiCls + '">' + r.overallCei + '</span></td><td>' + r.businessCei + '</td><td>' + r.networkCei + '</td><td>' + r.downloadSpeed + ' Mbps</td><td>' + r.latency + 'ms</td><td>' + r.packetLoss + '%</td><td>' + r.bizType + '</td><td>' + r.bandwidth + 'M</td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">用户和业务CEI查询</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('ceiCityFilter', 'Pages._ceiCity=this.value;Pages.renderCeiQuery(document.getElementById("page-cei-query"),1)', this._ceiCity) +
            '<div class="form-group"><label class="form-label">用户账号</label><input class="form-input" id="ceiAccountInput" value="' + (this._ceiAccount || '') + '" placeholder="请输入用户账号"></div>' +
            '<div class="form-group"><label class="form-label">业务类型</label><select class="form-select" id="ceiBizType"><option value="">全部</option><option>宽带</option><option>电视</option><option>固话</option><option>融合</option></select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages._ceiAccount=document.getElementById(\'ceiAccountInput\').value.trim();Pages.renderCeiQuery(document.getElementById(\'page-cei-query\'),1)">查询</button><button class="btn" onclick="Pages.exportCeiData()">导出</button></div></div></div>' +
            '<div style="margin-bottom:8px;padding:8px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;">提示：点击用户账号可查看CEI详情及业务KQI下钻分析</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>用户账号</th><th>地市</th><th>区域</th><th>综合CEI</th><th>业务CEI</th><th>网络CEI</th><th>下载速率</th><th>时延</th><th>丢包率</th><th>业务类型</th><th>带宽</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderCeiQuery.bind(Pages,document.getElementById("page-cei-query"))') + '</div></div>';
    },

    showCeiDetail: function(idx) {
        var data = JilinData.ceiUserRecords;
        if (this._ceiCity) data = data.filter(function(d) { return d.city === Pages._ceiCity; });
        if (this._ceiAccount) { var kw = this._ceiAccount.toLowerCase(); data = data.filter(function(d) { return d.account.toLowerCase().indexOf(kw) >= 0; }); }
        var r = data[idx];
        if (!r) return;
        var ceiColor = r.overallCei >= 90 ? '#27ae60' : (r.overallCei >= 80 ? '#f39c12' : '#e74c3c');
        Modal.show('CEI详情 - ' + r.account,
            '<div style="display:grid;grid-template-columns:auto 1fr;gap:16px;">' +
            '<div style="text-align:center;padding:16px;">' +
                '<div style="width:90px;height:90px;border-radius:50%;border:4px solid ' + ceiColor + ';display:flex;align-items:center;justify-content:center;margin:0 auto 8px;"><span style="font-size:28px;font-weight:700;color:' + ceiColor + ';">' + r.overallCei + '</span></div>' +
                '<div style="font-size:11px;color:#999;">综合CEI评分</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;">' +
                '<div><strong>用户账号：</strong>' + r.account + '</div>' +
                '<div><strong>地市/区域：</strong>' + r.city + ' ' + r.area + '</div>' +
                '<div><strong>业务CEI：</strong>' + r.businessCei + ' 分</div>' +
                '<div><strong>网络CEI：</strong>' + r.networkCei + ' 分</div>' +
                '<div><strong>下载速率：</strong>' + r.downloadSpeed + ' Mbps</div>' +
                '<div><strong>上传速率：</strong>' + r.uploadSpeed + ' Mbps</div>' +
                '<div><strong>时延：</strong>' + r.latency + ' ms</div>' +
                '<div><strong>丢包率：</strong>' + r.packetLoss + '%</div>' +
                '<div><strong>业务类型：</strong>' + r.bizType + '</div>' +
                '<div><strong>带宽：</strong>' + r.bandwidth + 'M</div>' +
            '</div></div>' +
            '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e0e4e8;">' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:8px;">业务KQI下钻分析</div>' +
                '<table class="data-table" style="font-size:12px;"><thead><tr><th>KQI指标</th><th>当前值</th><th>阈值</th><th>状态</th></tr></thead><tbody>' +
                '<tr><td>HTTP首包时延</td><td>' + SeededRandom.float(50, 300, 0) + 'ms</td><td>≤200ms</td><td>' + Pages.statusHtml(SeededRandom.next() > 0.5 ? '正常' : '告警') + '</td></tr>' +
                '<tr><td>视频初始缓冲时间</td><td>' + SeededRandom.float(0.5, 5, 1) + 's</td><td>≤2s</td><td>' + Pages.statusHtml(SeededRandom.next() > 0.4 ? '正常' : '告警') + '</td></tr>' +
                '<tr><td>视频卡顿率</td><td>' + SeededRandom.float(0, 8, 2) + '%</td><td>≤2%</td><td>' + Pages.statusHtml(SeededRandom.next() > 0.5 ? '正常' : '异常') + '</td></tr>' +
                '<tr><td>DNS解析时延</td><td>' + SeededRandom.float(5, 80, 0) + 'ms</td><td>≤50ms</td><td>' + Pages.statusHtml(SeededRandom.next() > 0.6 ? '正常' : '告警') + '</td></tr>' +
                '<tr><td>TCP建连成功率</td><td>' + SeededRandom.float(92, 100, 1) + '%</td><td>≥98%</td><td>' + Pages.statusHtml(SeededRandom.next() > 0.5 ? '正常' : '告警') + '</td></tr>' +
                '</tbody></table></div>',
            '<button class="btn" onclick="Modal.close()">关闭</button>', '680px'
        );
        DataStore.addLog('CEI查询', '质量画像', '查询用户 ' + r.account + ' 的CEI评分详情');
    },

    exportCeiData: function() {
        var data = JilinData.ceiUserRecords;
        if (this._ceiCity) data = data.filter(function(d) { return d.city === Pages._ceiCity; });
        if (this._ceiAccount) { var kw = this._ceiAccount.toLowerCase(); data = data.filter(function(d) { return d.account.toLowerCase().indexOf(kw) >= 0; }); }
        var csv = '用户账号,地市,区域,综合CEI,业务CEI,网络CEI,下载速率(Mbps),时延(ms),丢包率(%),业务类型,带宽(M)\n';
        data.forEach(function(r) {
            csv += [r.account, r.city, r.area, r.overallCei, r.businessCei, r.networkCei, r.downloadSpeed, r.latency, r.packetLoss, r.bizType, r.bandwidth].join(',') + '\n';
        });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'CEI用户查询_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('CEI数据已导出 (' + data.length + '条)', 'success');
        DataStore.addLog('数据导出', '质量画像', '导出CEI用户查询数据，共' + data.length + '条');
    },

    // ========== CEI聚类分析 (增强：区域/BRAS/OLT维度) ==========
    _clusterDim: 'area', // area / bras / olt
    renderCeiCluster: function(container) {
        container.innerHTML =
            '<div class="page-content">' +
            '<div class="remote-panel"><div class="remote-panel-title">CEI聚类分析</div>' +
            '<div class="remote-form"><div class="form-group"><label class="form-label">分析维度</label><select class="form-select" id="clusterDimSelect" onchange="Pages._clusterDim=this.value;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">' +
            '<option value="area"' + (this._clusterDim === 'area' ? ' selected' : '') + '>区域维度</option>' +
            '<option value="bras"' + (this._clusterDim === 'bras' ? ' selected' : '') + '>BRAS维度</option>' +
            '<option value="olt"' + (this._clusterDim === 'olt' ? ' selected' : '') + '>OLT维度</option></select></div>' +
            '<div class="form-group"><label class="form-label">时间粒度</label><select class="form-select"><option>天级</option><option>小时级</option></select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end"><button class="btn btn-primary" onclick="Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">分析</button></div></div></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:350px;"><div class="chart-card-header"><span class="chart-title">' + this._getClusterChartTitle() + '</span></div><div class="chart-container" id="clusterChart1"></div></div>' +
                '<div class="chart-card" style="min-height:350px;"><div class="chart-card-header"><span class="chart-title">CEI评分趋势对比</span></div><div class="chart-container" id="clusterChart2"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">' + this._getClusterTableTitle() + '</div>' +
            '<table class="data-table"><thead><tr>' + this._getClusterTableHeader() + '</tr></thead><tbody id="clusterTableBody"></tbody></table></div></div>';
        this._renderClusterCharts();
        this._renderClusterTable();
    },

    _getClusterChartTitle: function() {
        if (this._clusterDim === 'bras') return 'BRAS维度CEI评分统计';
        if (this._clusterDim === 'olt') return 'OLT维度CEI评分统计';
        return 'CEI评分区域分布';
    },
    _getClusterTableTitle: function() {
        if (this._clusterDim === 'bras') return 'BRAS设备CEI评分明细';
        if (this._clusterDim === 'olt') return 'OLT设备CEI评分明细';
        return '各地市CEI评分明细';
    },
    _getClusterTableHeader: function() {
        if (this._clusterDim === 'bras') return '<th>BRAS名称</th><th>地市</th><th>综合CEI</th><th>业务CEI</th><th>通断CEI</th><th>用户数</th><th>状态</th>';
        if (this._clusterDim === 'olt') return '<th>OLT设备</th><th>地市</th><th>综合CEI</th><th>业务CEI</th><th>通断CEI</th><th>在线ONT</th><th>状态</th>';
        return '<th>地市</th><th>综合CEI</th><th>业务CEI</th><th>网络CEI</th><th>用户数(万)</th><th>质差用户</th><th>趋势</th>';
    },

    _renderClusterCharts: function() {
        var d1 = document.getElementById('clusterChart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['clusterChart1'] = c1;
            if (this._clusterDim === 'area') {
                var bins = [0, 0, 0, 0, 0];
                JilinData.ceiUserRecords.forEach(function(r) { var s = r.overallCei; if (s < 60) bins[0]++; else if (s < 70) bins[1]++; else if (s < 80) bins[2]++; else if (s < 90) bins[3]++; else bins[4]++; });
                c1.setOption({ tooltip: {}, xAxis: { data: ['<60(极差)', '60-70(差)', '70-80(中)', '80-90(良)', '90-100(优)'], axisLabel: { fontSize: 10 } }, yAxis: { name: '用户数' }, series: [{ type: 'bar', data: bins, itemStyle: { color: function(p) { return ['#e74c3c', '#f39c12', '#f1c40f', '#5b8ff9', '#27ae60'][p.dataIndex]; } }, label: { show: true, position: 'top', fontSize: 9 } }] });
            } else if (this._clusterDim === 'bras') {
                var names = [], scores = [];
                JilinData.brasDevices.slice(0, 12).forEach(function(b) { names.push(b.name); scores.push(b.ceiScore); });
                c1.setOption({ grid: { top: 15, right: 20, bottom: 50, left: 50 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: names, axisLabel: { fontSize: 9, rotate: 45 } }, yAxis: { type: 'value', min: 88, max: 96 }, series: [{ type: 'bar', data: scores.map(function(v) { return { value: v, itemStyle: { color: v >= 93 ? '#27ae60' : (v >= 91 ? '#f39c12' : '#e74c3c') } }; }), barWidth: '60%' }] });
            } else {
                var names = [], scores = [];
                JilinData.oltDevices.slice(0, 15).forEach(function(o) { names.push(o.id); scores.push(o.ceiScore); });
                c1.setOption({ grid: { top: 15, right: 20, bottom: 60, left: 50 }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: names, axisLabel: { fontSize: 8, rotate: 60 } }, yAxis: { type: 'value', min: 86, max: 97 }, series: [{ type: 'bar', data: scores.map(function(v) { return { value: v, itemStyle: { color: v >= 93 ? '#27ae60' : (v >= 91 ? '#f39c12' : '#e74c3c') } }; }), barWidth: '60%' }] });
            }
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('clusterChart2');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['clusterChart2'] = c2;
            var t = JilinData.ceiTrendData;
            c2.setOption({
                grid: { top: 30, right: 15, bottom: 25, left: 35 }, tooltip: { trigger: 'axis' },
                legend: { data: ['综合CEI', '业务CEI', '通断CEI'], top: 0, textStyle: { fontSize: 10 } },
                xAxis: { type: 'category', data: t.labels, axisLabel: { fontSize: 9 } },
                yAxis: { type: 'value', min: 89, max: 95, axisLabel: { fontSize: 9 }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
                series: [
                    { name: '综合CEI', type: 'line', data: t.overall, smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#5b8ff9' } },
                    { name: '业务CEI', type: 'line', data: t.business, smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#5ad8a6' } },
                    { name: '通断CEI', type: 'line', data: t.network, smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#f6bd16' } }
                ]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    },

    _renderClusterTable: function() {
        var tbody = document.getElementById('clusterTableBody');
        if (!tbody) return;
        var rows = '';
        if (this._clusterDim === 'area') {
            for (var city in JilinData.ceiDistribution) {
                var d = JilinData.ceiDistribution[city];
                var users = JilinData.cityGatewayDistribution[city] ? JilinData.cityGatewayDistribution[city].users : 0;
                var qualityCount = SeededRandom.int(10, 50);
                var trend = SeededRandom.float(-0.5, 0.8, 1);
                rows += '<tr><td>' + city + '</td><td><span class="' + (d.overall >= 93 ? 'status-normal' : (d.overall >= 91 ? 'status-warning' : 'status-error')) + '">' + d.overall + '</span></td><td>' + d.business + '</td><td>' + d.network + '</td><td>' + users + '</td><td>' + qualityCount + '</td><td><span class="' + (trend >= 0 ? 'trend-up' : 'trend-down') + '">' + (trend >= 0 ? '↑' : '↓') + Math.abs(trend) + '%</span></td></tr>';
            }
        } else if (this._clusterDim === 'bras') {
            JilinData.brasDevices.slice(0, 15).forEach(function(b) {
                var bizCei = SeededRandom.float(b.ceiScore - 2, b.ceiScore + 1, 1);
                var disCei = SeededRandom.float(b.ceiScore - 1, b.ceiScore + 2, 1);
                rows += '<tr><td>' + b.name + '</td><td>' + b.city + '</td><td>' + b.ceiScore + '</td><td>' + bizCei + '</td><td>' + disCei + '</td><td>' + b.users.toLocaleString() + '</td><td>' + Pages.statusHtml(b.status) + '</td></tr>';
            });
        } else {
            JilinData.oltDevices.slice(0, 15).forEach(function(o) {
                var bizCei = SeededRandom.float(o.ceiScore - 2, o.ceiScore + 1, 1);
                var disCei = SeededRandom.float(o.ceiScore - 1, o.ceiScore + 2, 1);
                rows += '<tr><td>' + o.id + '</td><td>' + o.city + '</td><td>' + o.ceiScore + '</td><td>' + bizCei + '</td><td>' + disCei + '</td><td>' + o.onlineONT + '</td><td>' + Pages.statusHtml(o.status) + '</td></tr>';
            });
        }
        tbody.innerHTML = rows;
    },

    // ========== PING测试 ==========
    _pingPage: 1,
    _pingRunning: false,
    renderPingTest: function(container, page) {
        this._pingPage = page || 1;
        var p = this.paginate(JilinData.pingTestHistory, this._pingPage, 12);
        var rows = p.data.map(function(r) {
            return '<tr><td>' + r.time + '</td><td>' + (r.ontId || '-') + '</td><td>' + r.target + '</td><td>' + (r.packetSize || 64) + '</td><td>' + (r.count || 10) + '</td><td>' + (r.interval || 1) + '</td><td>' + r.city + '</td><td>' + r.avgDelay + 'ms</td><td>' + r.maxDelay + 'ms</td><td>' + (r.minDelay || '-') + 'ms</td><td>' + r.packetLoss + '%</td><td>' + Pages.statusHtml(r.status) + '</td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">PING测试工具</div>' +
            '<div class="remote-form">' +
            '<div class="form-group"><label class="form-label">ont id</label><input class="form-input" id="pingOntId" placeholder="ONT设备ID"></div>' +
            '<div class="form-group"><label class="form-label">目标IP/域名</label><input class="form-input" id="pingTarget" value="10.168.1.1"></div>' +
            '<div class="form-group"><label class="form-label">ping包大小</label><input class="form-input" id="pingSize" value="64"></div>' +
            '<div class="form-group"><label class="form-label">次数</label><input class="form-input" id="pingCount" value="10"></div>' +
            '<div class="form-group"><label class="form-label">间隔</label><input class="form-input" id="pingInterval" placeholder="秒"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" id="pingStartBtn" onclick="Pages.executePing()">开始PING</button></div></div>' +
            '<div class="ping-result" id="pingResult"><span style="color:#f39c12;">等待执行PING测试...</span></div></div>' +
            '<div class="data-table-wrapper" style="margin-top:8px;"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">历史测试记录 (共' + JilinData.pingTestHistory.length + '条)</div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>ont id</th><th>目标ip/域名</th><th>ping包大小</th><th>次数</th><th>间隔</th><th>地市</th><th>平均时延</th><th>最大时延</th><th>最小时延</th><th>丢包率</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderPingTest.bind(Pages,document.getElementById("page-ping-test"))') + '</div></div>';
    },

    executePing: function() {
        if (this._pingRunning) { Modal.toast('PING测试正在执行中，请等待完成', 'warning'); return; }
        var result = document.getElementById('pingResult');
        var target = document.getElementById('pingTarget').value.trim();
        var size = parseInt(document.getElementById('pingSize').value) || 64;
        var count = parseInt(document.getElementById('pingCount').value) || 10;
        var pingInterval = parseInt(document.getElementById('pingInterval').value) || 1;
        var ontId = document.getElementById('pingOntId').value.trim();
        if (!target) { Modal.toast('请输入目标IP或域名', 'warning'); return; }

        this._pingRunning = true;
        var startBtn = document.getElementById('pingStartBtn');
        if (startBtn) { startBtn.disabled = true; startBtn.textContent = '执行中...'; }

        // Step 1: 发送给RMS
        result.innerHTML = '<span style="color:#f39c12;">发送给RMS ...</span>';
        var step = 0;
        var self = this;

        setTimeout(function() {
            // Step 2: Show dots
            result.innerHTML += '<br><span style="color:#999;">···</span>';
            setTimeout(function() {
                result.innerHTML += '<br><span style="color:#999;">···</span>';
                setTimeout(function() {
                    // Step 3: RMS返回ping结果
                    result.innerHTML += '<br><span style="color:#27ae60;font-weight:600;">RMS返回ping结果</span>';
                    setTimeout(function() {
                        // Step 4: 显示ping结果
                        var delays = [];
                        var lines = '';
                        for (var i = 0; i < count; i++) {
                            var delay = Math.random() * 15 + 2 + (Math.random() > 0.9 ? Math.random() * 50 : 0);
                            delays.push(delay);
                        }
                        var avg = delays.reduce(function(s, d) { return s + d; }, 0) / delays.length;
                        var min = Math.min.apply(null, delays);
                        var max = Math.max.apply(null, delays);
                        var loss = delays.filter(function(d) { return d > 100; }).length;
                        var lossRate = parseFloat((loss / count * 100).toFixed(1));

                        result.innerHTML += '<br><span style="color:#999;">···</span>';
                        result.innerHTML += '<br><span style="color:#00ff88;">--- ' + target + ' ping统计 ---</span>';
                        result.innerHTML += '<br><span style="color:#00ff88;">' + count + ' 个包已发送, ' + (count - loss) + ' 个已接收, 丢包率 ' + lossRate.toFixed(1) + '%</span>';
                        result.innerHTML += '<br><span style="color:#00ff88;">rtt 最小/平均/最大 = ' + min.toFixed(1) + '/' + avg.toFixed(1) + '/' + max.toFixed(1) + ' ms</span>';

                        // 添加到历史记录
                        JilinData.pingTestHistory.unshift({
                            time: new Date().toLocaleString('zh-CN'),
                            ontId: ontId || '-',
                            target: target,
                            city: App.currentCity || '全省',
                            packetSize: size,
                            count: count,
                            interval: pingInterval,
                            avgDelay: parseFloat(avg.toFixed(1)),
                            maxDelay: parseFloat(max.toFixed(1)),
                            minDelay: parseFloat(min.toFixed(1)),
                            packetLoss: lossRate,
                            status: lossRate > 20 ? '异常' : (lossRate > 5 || avg > 25 ? '告警' : '正常')
                        });
                        DataStore.addLog('PING测试', '远程操作', '对' + target + '执行PING测试' + (ontId ? '（ONT: ' + ontId + '）' : '') + '，包大小' + size + 'B，次数' + count + '，间隔' + pingInterval + 's，平均时延' + avg.toFixed(1) + 'ms');

                        self._pingRunning = false;
                        if (startBtn) { startBtn.disabled = false; startBtn.textContent = '开始PING'; }
                    }, 600);
                }, 500);
            }, 400);
        }, 500);
    },

    // ========== ONT光功率查询 (增强交互) ==========
    _ontPage: 1, _ontCity: '', _ontSearch: '',
    renderOntPower: function(container, page) {
        this._ontPage = page || 1;
        var data = JilinData.ontPowerRecords;
        if (this._ontCity) data = data.filter(function(d) { return d.city === Pages._ontCity; });
        if (this._ontSearch) {
            var kw = this._ontSearch.toLowerCase();
            data = data.filter(function(d) { return d.ontId.toLowerCase().indexOf(kw) >= 0 || (d.userAccount || '').toLowerCase().indexOf(kw) >= 0; });
        }
        var p = this.paginate(data, this._ontPage, 12);
        var rows = p.data.map(function(r) {
            var rxCls = r.rxPower < -25 ? 'status-error' : (r.rxPower < -22 ? 'status-warning' : 'status-normal');
            return '<tr><td>' + r.ontId + '</td><td>' + (r.userAccount || '-') + '</td><td>' + r.city + '</td><td>' + r.model + '</td><td>' + r.txPower + ' dBm</td><td><span class="' + rxCls + '">' + r.rxPower + ' dBm</span></td><td>' + r.temperature + '°C</td><td>' + r.voltage + 'V</td><td>' + Pages.statusHtml(r.status) + '</td><td>' + r.lastUpdate + '</td>' +
                '<td><a style="color:#2b7de9;cursor:pointer;" onclick="Pages.queryOntDetail(\'' + r.ontId + '\')">详情</a></td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">ONT光功率查询</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('ontCityFilter', 'Pages._ontCity=this.value;Pages.renderOntPower(document.getElementById("page-ont-power"),1)', this._ontCity) +
            '<div class="form-group"><label class="form-label">ONT设备ID/用户账号</label><input class="form-input" id="ontSearchInput" value="' + (this._ontSearch || '') + '" placeholder="请输入ONT设备ID或用户账号"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages._ontSearch=document.getElementById(\'ontSearchInput\').value.trim();Pages.renderOntPower(document.getElementById(\'page-ont-power\'),1)">查询</button><button class="btn" onclick="Pages.realtimeOntQuery()">实时读取</button></div></div></div>' +
            '<div style="margin:0 0 8px 0;padding:8px 12px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:12px;color:#666;"><strong>阈值说明：</strong>接收光功率正常范围 -8 ~ -22 dBm，告警范围 -22 ~ -25 dBm，异常 < -25 dBm</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>ONT设备ID</th><th>用户账号</th><th>地市</th><th>型号</th><th>发送功率</th><th>接收功率</th><th>温度</th><th>电压</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderOntPower.bind(Pages,document.getElementById("page-ont-power"))') + '</div></div>';
    },

    realtimeOntQuery: function() {
        var ontId = document.getElementById('ontSearchInput').value.trim();
        if (!ontId) { Modal.toast('请输入ONT设备ID或用户账号', 'warning'); return; }
        // 模拟实时读取
        Modal.show('实时光功率读取 - ' + ontId,
            '<div style="text-align:center;padding:20px;"><div class="loading-spinner" style="margin:0 auto 12px;"></div><div style="color:#666;">正在通过OMCI协议读取ONT光功率...</div></div>',
            '', '420px'
        );
        setTimeout(function() {
            var tx = SeededRandom.float(1.8, 3.2, 2);
            var rx = SeededRandom.float(-26, -15, 2);
            var temp = SeededRandom.float(28, 58, 1);
            var voltage = SeededRandom.float(3.1, 3.5, 2);
            var bias = SeededRandom.float(5, 35, 1);
            var rxStatus = rx < -25 ? '异常（弱光）' : (rx < -22 ? '告警' : '正常');
            var rxColor = rx < -25 ? '#e74c3c' : (rx < -22 ? '#f39c12' : '#27ae60');
            Modal.show('实时光功率 - ' + ontId,
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:8px 0;">' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;margin-bottom:4px;">发送光功率</div><div style="font-size:22px;font-weight:700;color:#27ae60;">' + tx + ' <span style="font-size:12px;font-weight:400;">dBm</span></div></div>' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;margin-bottom:4px;">接收光功率</div><div style="font-size:22px;font-weight:700;color:' + rxColor + ';">' + rx + ' <span style="font-size:12px;font-weight:400;">dBm</span></div><div style="font-size:11px;color:' + rxColor + ';">' + rxStatus + '</div></div>' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;margin-bottom:4px;">光模块温度</div><div style="font-size:22px;font-weight:700;color:#333;">' + temp + ' <span style="font-size:12px;font-weight:400;">°C</span></div></div>' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;margin-bottom:4px;">供电电压</div><div style="font-size:22px;font-weight:700;color:#333;">' + voltage + ' <span style="font-size:12px;font-weight:400;">V</span></div></div>' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;margin-bottom:4px;">偏置电流</div><div style="font-size:22px;font-weight:700;color:#333;">' + bias + ' <span style="font-size:12px;font-weight:400;">mA</span></div></div>' +
                '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:4px;"><div style="font-size:11px;color:#999;margin-bottom:4px;">读取时间</div><div style="font-size:13px;font-weight:600;color:#333;">' + new Date().toLocaleString('zh-CN') + '</div></div>' +
                '</div>',
                '<button class="btn" onclick="Modal.close()">关闭</button>', '500px'
            );
            DataStore.addLog('ONT查询', '远程操作', '实时读取 ' + ontId + ' 光功率，接收功率: ' + rx + 'dBm');
        }, 1500);
    },

    queryOntDetail: function(ontId) {
        var record = null;
        for (var i = 0; i < JilinData.ontPowerRecords.length; i++) {
            if (JilinData.ontPowerRecords[i].ontId === ontId) { record = JilinData.ontPowerRecords[i]; break; }
        }
        if (!record) return;
        var rxColor = record.rxPower < -25 ? '#e74c3c' : (record.rxPower < -22 ? '#f39c12' : '#27ae60');
        Modal.show('ONT详情 - ' + ontId,
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
            '<div><strong>设备ID：</strong>' + record.ontId + '</div>' +
            '<div><strong>用户账号：</strong>' + (record.userAccount || '-') + '</div>' +
            '<div><strong>地市：</strong>' + record.city + '</div>' +
            '<div><strong>型号：</strong>' + record.model + '</div>' +
            '<div><strong>发送功率：</strong><span style="color:#27ae60;">' + record.txPower + ' dBm</span></div>' +
            '<div><strong>接收功率：</strong><span style="color:' + rxColor + ';">' + record.rxPower + ' dBm</span></div>' +
            '<div><strong>温度：</strong>' + record.temperature + '°C</div>' +
            '<div><strong>电压：</strong>' + record.voltage + 'V</div>' +
            '<div><strong>状态：</strong>' + record.status + '</div>' +
            '<div><strong>最后更新：</strong>' + record.lastUpdate + '</div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">关闭</button>', '500px'
        );
    },

    // ========== 网关远程重启 (增强交互) ==========
    _gwPage: 1, _gwCity: '',
    renderGatewayRestart: function(container, page) {
        this._gwPage = page || 1;
        var data = JilinData.gatewayRestartRecords;
        if (this._gwCity) data = data.filter(function(d) { return d.city === Pages._gwCity; });
        var p = this.paginate(data, this._gwPage, 12);
        var rows = p.data.map(function(r) {
            return '<tr><td>' + r.time + '</td><td>' + r.gwId + '</td><td>' + r.sn + '</td><td>' + r.city + '</td><td>' + r.reason + '</td><td>' + r.operator + '</td><td>' + Pages.statusHtml(r.result) + '</td><td>' + r.duration + '</td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">网关远程重启</div>' +
            '<div class="remote-form">' +
            this.cityFilterHtml('gwCityFilter', 'Pages._gwCity=this.value;Pages.renderGatewayRestart(document.getElementById("page-gateway-restart"),1)', this._gwCity) +
            '<div class="form-group"><label class="form-label">网关设备ID/用户账号</label><input class="form-input" id="gwRestartId" placeholder="请输入网关设备ID或用户账号"></div>' +
            '<div class="form-group"><label class="form-label">重启原因</label><select class="form-select" id="gwRestartReason"><option>用户申报故障</option><option>CPU异常高</option><option>流量异常</option><option>定期维护</option><option>ONU离线</option></select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.executeGatewayRestart()">执行重启</button><button class="btn" onclick="Pages.batchRestart()">批量重启</button></div></div>' +
            '<div id="gwRestartResult" style="display:none;" class="ping-result"></div></div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">重启记录 (共' + data.length + '条)</div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>网关设备</th><th>SN号</th><th>地市</th><th>重启原因</th><th>操作人</th><th>结果</th><th>耗时</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderGatewayRestart.bind(Pages,document.getElementById("page-gateway-restart"))') + '</div></div>';
    },

    executeGatewayRestart: function() {
        var gwId = document.getElementById('gwRestartId').value.trim();
        if (!gwId) { Modal.toast('请输入网关设备ID或用户账号', 'warning'); return; }
        var reason = document.getElementById('gwRestartReason').value;
        var resultDiv = document.getElementById('gwRestartResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = '正在连接设备 ' + gwId + ' ...\n';

        var steps = [
            '> 验证设备身份...',
            '> 设备身份验证通过',
            '> 发送重启指令 (TR-069)...',
            '> 等待设备响应...',
            '> 设备已接收重启指令',
            '> 设备正在重启中...',
            '> 检测设备状态...'
        ];
        var i = 0;
        var interval = setInterval(function() {
            if (i >= steps.length) {
                var success = Math.random() > 0.12;
                var duration = Math.floor(Math.random() * 120 + 15);
                if (success) {
                    resultDiv.textContent += '\n[OK] 重启成功！设备已恢复在线，耗时 ' + duration + 's\n';
                    resultDiv.textContent += '> 设备IP: 10.' + Math.floor(Math.random()*200+1) + '.' + Math.floor(Math.random()*254+1) + '.' + Math.floor(Math.random()*254+1) + '\n';
                    resultDiv.textContent += '> 在线时间: ' + new Date().toLocaleString('zh-CN');
                } else {
                    resultDiv.textContent += '\n[FAIL] 重启失败：设备响应超时，请检查设备连接状态\n';
                    resultDiv.style.color = '#ff6b6b';
                }
                // 添加到记录
                var city = Pages._gwCity || SeededRandom.pick(JilinData.cities);
                JilinData.gatewayRestartRecords.unshift({
                    time: new Date().toLocaleString('zh-CN'),
                    gwId: gwId.indexOf('GW-') === 0 ? gwId : 'GW-' + gwId,
                    sn: '4857544' + Math.floor(Math.random() * 90000000 + 10000000),
                    city: city,
                    reason: reason,
                    operator: DataStore._currentUser,
                    result: success ? '重启成功' : '重启失败',
                    duration: duration + 's'
                });
                DataStore.addLog('网关重启', '远程操作', (success ? '成功' : '失败') + '重启网关 ' + gwId + '，原因：' + reason);
                clearInterval(interval);
                return;
            }
            resultDiv.textContent += steps[i] + '\n';
            i++;
        }, 600);
    },

    batchRestart: function() {
        Modal.show('批量重启',
            '<div class="form-group"><label class="form-label">请输入需要重启的设备ID列表（每行一个）</label>' +
            '<textarea id="batchGwIds" style="width:100%;height:120px;border:1px solid #e0e4e8;border-radius:2px;padding:8px;font-size:12px;resize:vertical;" placeholder="GW-CC-00001\nGW-CC-00002\nGW-JL-00015"></textarea></div>' +
            '<div class="form-group"><label class="form-label">重启原因</label><select class="form-select" id="batchReason"><option>定期维护</option><option>批量故障恢复</option><option>系统升级</option></select></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doBatchRestart()">确认批量重启</button>'
        );
    },

    doBatchRestart: function() {
        var ids = document.getElementById('batchGwIds').value.trim().split('\n').filter(function(s) { return s.trim(); });
        if (ids.length === 0) { Modal.toast('请输入设备ID', 'warning'); return; }
        var reason = document.getElementById('batchReason').value;
        var successCount = 0;
        ids.forEach(function(id) {
            var success = Math.random() > 0.15;
            if (success) successCount++;
            JilinData.gatewayRestartRecords.unshift({
                time: new Date().toLocaleString('zh-CN'),
                gwId: id.trim(),
                sn: '4857544' + Math.floor(Math.random() * 90000000 + 10000000),
                city: SeededRandom.pick(JilinData.cities),
                reason: reason,
                operator: DataStore._currentUser,
                result: success ? '重启成功' : '重启失败',
                duration: Math.floor(Math.random() * 120 + 15) + 's'
            });
        });
        DataStore.addLog('批量重启', '远程操作', '批量重启 ' + ids.length + ' 台网关，成功 ' + successCount + ' 台');
        Modal.close();
        Modal.toast('批量重启完成：' + successCount + '/' + ids.length + ' 台成功', successCount === ids.length ? 'success' : 'warning');
        this.renderGatewayRestart(document.getElementById('page-gateway-restart'), 1);
    },

    // ========== 质差模型 (增强：多筛选/CRUD/模型训练) ==========
    _qmPage: 1, _qmCity: '', _qmModel: '', _qmSeverity: '', _qmKw: '',
    _getQmRecords: function() {
        var stored = DataStore.load('qmRecords', null);
        if (!stored || !stored.length) { DataStore.save('qmRecords', JilinData.qualityModelRecords); return JilinData.qualityModelRecords; }
        return stored;
    },
    _saveQmRecords: function(d) { DataStore.save('qmRecords', d); },
    renderQualityModel: function(container, page) {
        this._qmPage = page || 1;
        var allData = this._getQmRecords();
        var data = allData;
        if (this._qmCity) data = data.filter(function(d) { return d.city === Pages._qmCity; });
        if (this._qmModel) data = data.filter(function(d) { return d.modelName === Pages._qmModel; });
        if (this._qmSeverity) data = data.filter(function(d) { return d.severity === Pages._qmSeverity; });
        if (this._qmKw) {
            var kw = this._qmKw.toLowerCase();
            data = data.filter(function(d) { return (d.userAccount || '').toLowerCase().indexOf(kw) >= 0 || (d.id || '').toLowerCase().indexOf(kw) >= 0; });
        }
        // 模型库
        var models = [
            { name: '线路质差模型', accuracy: 94.2, samples: 12580, lastTrain: '2025-11-28', status: '运行中' },
            { name: '设备质差模型', accuracy: 92.8, samples: 9856, lastTrain: '2025-11-25', status: '运行中' },
            { name: '家庭网络模型', accuracy: 89.5, samples: 7820, lastTrain: '2025-11-20', status: '运行中' },
            { name: '传输质差模型', accuracy: 91.2, samples: 6580, lastTrain: '2025-11-18', status: '训练中' },
            { name: 'WiFi干扰模型', accuracy: 87.8, samples: 5420, lastTrain: '2025-11-15', status: '运行中' }
        ];
        var modelCards = models.map(function(m) {
            var statusClass = m.status === '运行中' ? 'running' : 'training';
            var accColor = m.accuracy >= 92 ? '#27ae60' : (m.accuracy >= 90 ? '#f39c12' : '#e74c3c');
            return '<div class="model-card-enhanced">' +
                '<div class="model-status-bar ' + statusClass + '"></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<span style="font-weight:600;font-size:13px;">' + m.name + '</span>' +
                    '<span style="font-size:10px;color:' + (m.status === '运行中' ? '#27ae60' : '#f39c12') + ';font-weight:600;">● ' + m.status + '</span>' +
                '</div>' +
                '<div class="model-accuracy-ring" style="border:3px solid ' + accColor + ';color:' + accColor + ';">' + m.accuracy + '%</div>' +
                '<div style="text-align:center;font-size:10px;color:#999;margin-bottom:8px;">准确率</div>' +
                '<div style="font-size:11px;color:#666;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;">' +
                    '<div>样本: <strong style="color:#333;">' + m.samples.toLocaleString() + '</strong></div>' +
                    '<div>特征: <strong style="color:#333;">' + (15 + Math.floor(m.accuracy * 0.3)) + '维</strong></div>' +
                    '<div style="grid-column:1/-1;">更新: ' + m.lastTrain + '</div>' +
                '</div>' +
                '<div style="display:flex;gap:6px;">' +
                    '<button class="btn" style="font-size:11px;padding:2px 10px;flex:1;" onclick="Pages.trainModel(\'' + m.name + '\')">重新训练</button>' +
                    '<button class="btn" style="font-size:11px;padding:2px 10px;flex:1;" onclick="Pages.modelDetail(\'' + m.name + '\')">详情</button>' +
                '</div></div>';
        }).join('');

        var p = this.paginate(data, this._qmPage, 10);
        var rows = p.data.map(function(r) {
            return '<tr><td>' + r.id + '</td><td>' + r.userAccount + '</td><td>' + r.city + '</td><td>' + r.modelName + '</td><td><span style="color:' + (r.score < 50 ? '#e74c3c' : (r.score < 70 ? '#f39c12' : '#27ae60')) + ';font-weight:600;">' + r.score + '</span></td><td>' + r.primaryFactor + '</td><td>' + Pages.statusHtml(r.severity) + '</td><td>' + r.recommendation + '</td><td>' + r.analysisTime + '</td>' +
                '<td><a style="color:#2b7de9;cursor:pointer;margin-right:6px;" onclick="Pages.qmDetail(\'' + r.id + '\')">详情</a><a style="color:#27ae60;cursor:pointer;" onclick="Pages.qmCreateOrder(\'' + r.id + '\')">派单</a></td></tr>';
        }).join('') || '<tr><td colspan="10" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

        var modelOpts = '<option value="">全部模型</option>';
        models.forEach(function(m) { modelOpts += '<option value="' + m.name + '"' + (m.name === Pages._qmModel ? ' selected' : '') + '>' + m.name + '</option>'; });
        var sevOpts = '<option value="">全部严重</option>';
        ['低','中','高','紧急'].forEach(function(s) { sevOpts += '<option value="' + s + '"' + (s === Pages._qmSeverity ? ' selected' : '') + '>' + s + '</option>'; });

        container.innerHTML =
            '<div class="page-content">' +
            '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' + modelCards + '</div>' +
            '<div class="remote-panel"><div class="remote-panel-title">质差模型分析</div>' +
            '<div class="remote-form">' +
                this.cityFilterHtml('qmCityFilter', 'Pages._qmCity=this.value;Pages.renderQualityModel(document.getElementById("page-quality-model"),1)', this._qmCity) +
                '<div class="form-group"><label class="form-label">模型类型</label><select class="form-select" onchange="Pages._qmModel=this.value;Pages.renderQualityModel(document.getElementById(\'page-quality-model\'),1)">' + modelOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">严重程度</label><select class="form-select" onchange="Pages._qmSeverity=this.value;Pages.renderQualityModel(document.getElementById(\'page-quality-model\'),1)">' + sevOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">关键字</label><input class="form-input" id="qmKwInput" value="' + (this._qmKw || '') + '" placeholder="ID/账号"></div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                    '<button class="btn btn-primary" onclick="Pages._qmKw=document.getElementById(\'qmKwInput\').value.trim();Pages.renderQualityModel(document.getElementById(\'page-quality-model\'),1)">分析</button>' +
                    '<button class="btn" onclick="Pages._qmCity=\'\';Pages._qmModel=\'\';Pages._qmSeverity=\'\';Pages._qmKw=\'\';Pages.renderQualityModel(document.getElementById(\'page-quality-model\'),1)">重置</button>' +
                    '<button class="btn" onclick="Pages.exportQmRecords()">导出</button>' +
                '</div></div></div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>ID</th><th>用户账号</th><th>地市</th><th>模型</th><th>评分</th><th>主因</th><th>严重程度</th><th>建议</th><th>分析时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderQualityModel.bind(Pages,document.getElementById("page-quality-model"))') + '</div></div>';
    },

    qmDetail: function(id) {
        var data = this._getQmRecords();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { r = data[i]; break; } }
        if (!r) return;
        Modal.show('质差分析详情 - ' + r.id,
            '<div style="display:grid;grid-template-columns:auto 1fr;gap:16px;">' +
            '<div style="text-align:center;padding:16px;">' +
                '<div style="width:80px;height:80px;border-radius:50%;border:4px solid ' + (r.score < 50 ? '#e74c3c' : (r.score < 70 ? '#f39c12' : '#27ae60')) + ';display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:24px;font-weight:700;color:' + (r.score < 50 ? '#e74c3c' : (r.score < 70 ? '#f39c12' : '#27ae60')) + ';">' + r.score + '</div>' +
                '<div style="font-size:11px;color:#999;">质差评分</div>' +
            '</div>' +
            '<div style="font-size:13px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<div><strong>分析ID：</strong>' + r.id + '</div>' +
                '<div><strong>用户账号：</strong>' + r.userAccount + '</div>' +
                '<div><strong>地市：</strong>' + r.city + '</div>' +
                '<div><strong>模型：</strong>' + r.modelName + '</div>' +
                '<div><strong>主因：</strong>' + r.primaryFactor + '</div>' +
                '<div><strong>严重程度：</strong>' + r.severity + '</div>' +
                '<div style="grid-column:1/-1;"><strong>建议：</strong>' + r.recommendation + '</div>' +
                '<div style="grid-column:1/-1;"><strong>分析时间：</strong>' + r.analysisTime + '</div>' +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">关闭</button><button class="btn btn-primary" onclick="Modal.close();Pages.qmCreateOrder(\'' + r.id + '\')">生成工单</button>',
            '600px'
        );
    },

    qmCreateOrder: function(id) {
        var data = this._getQmRecords();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { r = data[i]; break; } }
        if (!r) return;
        var woId = 'WO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 90000 + 10000));
        var priority = r.severity === '紧急' ? '紧急' : (r.severity === '高' ? '高' : '中');
        // Match engineers
        var skill = JilinData.qualityTypeToSkill ? JilinData.qualityTypeToSkill(r.primaryFactor || '') : '';
        var engineers = JilinData.findEngineers ? JilinData.findEngineers(r.city, skill) : [];
        var allEngineers = JilinData.findEngineers ? JilinData.findEngineers(r.city, null) : [];
        var availableEngineers = engineers.length > 0 ? engineers : allEngineers;
        var engineerOpts = '<option value="">暂不指派（待派单）</option>';
        availableEngineers.forEach(function(e, i) {
            var icon = e.online ? ICO.online : ICO.offline;
            engineerOpts += '<option value="' + e.name + '"' + (i === 0 ? ' selected' : '') + '>' + e.name + ' - ' + e.team + ' 工单' + e.workload + '件' + (i === 0 ? ' [推荐]' : '') + '</option>';
        });
        var scoreColor = r.score < 50 ? '#e74c3c' : (r.score < 70 ? '#f39c12' : '#27ae60');
        Modal.show('从质差分析生成工单',
            '<div style="display:grid;grid-template-columns:280px 1fr;gap:20px;">' +
            // Left: Source info
            '<div style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e0e4e8;">' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.chart + ' 质差分析来源</div>' +
                '<div style="text-align:center;margin-bottom:12px;">' +
                    '<div style="width:72px;height:72px;border-radius:50%;border:4px solid ' + scoreColor + ';display:flex;align-items:center;justify-content:center;margin:0 auto 6px;font-size:22px;font-weight:700;color:' + scoreColor + ';">' + r.score + '</div>' +
                    '<div style="font-size:11px;color:#999;">质差评分</div>' +
                '</div>' +
                '<div style="font-size:12px;color:#666;line-height:2;">' +
                    '<div><strong>分析ID：</strong><span style="color:#2b7de9;">' + r.id + '</span></div>' +
                    '<div><strong>用户账号：</strong>' + r.userAccount + '</div>' +
                    '<div><strong>所属地市：</strong>' + r.city + '</div>' +
                    '<div><strong>分析模型：</strong><span style="padding:1px 6px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:2px;font-size:10px;color:#2b7de9;">' + r.modelName + '</span></div>' +
                    '<div><strong>主要原因：</strong><span style="color:#e74c3c;font-weight:600;">' + r.primaryFactor + '</span></div>' +
                    '<div><strong>严重程度：</strong>' + Pages.statusHtml(r.severity) + '</div>' +
                    '<div><strong>分析时间：</strong>' + r.analysisTime + '</div>' +
                '</div>' +
                '<div style="margin-top:10px;padding:8px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:11px;color:#666;">' +
                    '<strong>建议：</strong>' + r.recommendation +
                '</div>' +
            '</div>' +
            // Right: Order form
            '<div>' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.clipboard + ' 工单信息</div>' +
                '<div class="form-group"><label class="form-label">工单编号</label><input class="form-input" value="' + woId + '" readonly style="background:#f8fafc;"></div>' +
                '<div class="form-group"><label class="form-label">工单标题 *</label><input class="form-input" id="qmWoTitle" value="' + r.modelName + ' - ' + r.userAccount + '"></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">工单类型</label><select class="form-select" id="qmWoType"><option selected>AI预测</option><option>主动发现</option><option>系统告警</option></select></div>' +
                    '<div class="form-group"><label class="form-label">优先级</label><select class="form-select" id="qmWoPriority"><option' + (priority === '低' ? ' selected' : '') + '>低</option><option' + (priority === '中' ? ' selected' : '') + '>中</option><option' + (priority === '高' ? ' selected' : '') + '>高</option><option' + (priority === '紧急' ? ' selected' : '') + '>紧急</option></select></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">处理时限</label><select class="form-select" id="qmWoDeadline"><option value="4">4小时（紧急）</option><option value="8">8小时</option><option value="24" selected>24小时（标准）</option><option value="48">48小时</option></select></div>' +
                    '<div class="form-group"><label class="form-label">用户账号</label><input class="form-input" value="' + r.userAccount + '" readonly style="background:#f8fafc;"></div>' +
                '</div>' +
                '<div class="form-group"><label class="form-label">指派工程师（' + r.city + '地区，按工作量排序）</label><select class="form-select" id="qmWoAssignee">' + engineerOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">故障描述</label><textarea class="form-input" id="qmWoDesc" rows="3" style="resize:vertical;">用户 ' + r.userAccount + ' 经 ' + r.modelName + ' 分析，质差评分 ' + r.score + '，主因：' + r.primaryFactor + '（严重程度：' + r.severity + '）。建议：' + r.recommendation + '</textarea></div>' +
                '<div class="form-group"><label class="form-label">派单备注</label><input class="form-input" id="qmWoNote" placeholder="如：需携带光功率计、用户白天在家"></div>' +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doQmCreateOrder(\'' + id + '\',\'' + woId + '\')">确认生成工单</button>',
            '820px'
        );
    },

    doQmCreateOrder: function(id, woId) {
        var data = this._getQmRecords();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { r = data[i]; break; } }
        if (!r) return;
        var title = document.getElementById('qmWoTitle').value.trim();
        if (!title) { Modal.toast('请填写工单标题', 'warning'); return; }
        var assignee = document.getElementById('qmWoAssignee').value;
        var newOrder = {
            id: woId,
            title: title,
            type: document.getElementById('qmWoType').value,
            city: r.city,
            userAccount: r.userAccount,
            status: assignee ? '已派单' : '待派单',
            priority: document.getElementById('qmWoPriority').value,
            createTime: new Date().toLocaleString('zh-CN'),
            assignee: assignee || '-',
            resolveTime: '-',
            satisfaction: '-',
            deadline: document.getElementById('qmWoDeadline').value + '小时',
            description: document.getElementById('qmWoDesc').value,
            note: document.getElementById('qmWoNote').value,
            sourceId: r.id,
            sourceType: '质差模型'
        };
        var orders = this._getWorkOrders();
        orders.unshift(newOrder);
        this._saveWorkOrders(orders);
        DataStore.addLog('工单创建', '质差模型', '从质差模型生成工单: ' + newOrder.id + '，指派: ' + (assignee || '待派单'));
        Modal.close();
        Modal.toast('工单 ' + woId + ' 已创建' + (assignee ? '，已派发至 ' + assignee : '，等待派单'), 'success');
    },

    trainModel: function(name) {
        Modal.show('训练模型 - ' + name,
            '<div class="train-progress-wrap">' +
                '<div class="train-progress-header"><span>正在训练 <strong>' + name + '</strong> ...</span><span id="trainPercent">0%</span></div>' +
                '<div class="train-progress-bar"><div class="train-progress-fill" id="trainFill" style="width:0%"></div></div>' +
                '<div class="train-log" id="trainLog">' +
                    '<span class="log-step">[初始化]</span> 加载训练数据集...\n' +
                '</div>' +
                '<div id="trainMetrics" style="display:none;margin-top:12px;display:none;"></div>' +
            '</div>',
            '<button class="btn" id="trainCancelBtn" onclick="Modal.close()">取消训练</button>', '560px'
        );
        var fill = document.getElementById('trainFill');
        var pct = document.getElementById('trainPercent');
        var log = document.getElementById('trainLog');
        var metrics = document.getElementById('trainMetrics');
        var cancelBtn = document.getElementById('trainCancelBtn');
        var totalEpochs = 20;
        var epoch = 0;
        var baseLoss = 0.45 + Math.random() * 0.15;
        var baseAcc = 87 + Math.random() * 3;

        var logLines = [
            { t: 300, msg: '<span class="log-step">[数据预处理]</span> 特征工程完成，提取 ' + (15 + Math.floor(Math.random() * 20)) + ' 维特征' },
            { t: 600, msg: '<span class="log-step">[数据预处理]</span> 训练集 ' + (8000 + Math.floor(Math.random() * 5000)) + ' 条，验证集 ' + (1000 + Math.floor(Math.random() * 2000)) + ' 条' },
            { t: 900, msg: '<span class="log-step">[模型构建]</span> 算法: ' + (name.indexOf('WiFi') >= 0 ? 'RandomForest' : (name.indexOf('线路') >= 0 ? 'XGBoost' : 'GradientBoosting')) },
            { t: 1200, msg: '<span class="log-step">[训练开始]</span> learning_rate=0.01, max_depth=8, n_estimators=' + totalEpochs * 50 }
        ];
        logLines.forEach(function(l) {
            setTimeout(function() { if (log) log.innerHTML += l.msg + '\n'; log.scrollTop = log.scrollHeight; }, l.t);
        });

        var trainInterval = setInterval(function() {
            epoch++;
            if (epoch > totalEpochs) {
                clearInterval(trainInterval);
                var finalAcc = (baseAcc + 3.5 + Math.random() * 1.5).toFixed(1);
                var finalRecall = (baseAcc + 1.2 + Math.random() * 2).toFixed(1);
                var finalF1 = (0.87 + Math.random() * 0.08).toFixed(3);
                if (fill) fill.style.width = '100%';
                if (pct) pct.textContent = '100%';
                if (log) {
                    log.innerHTML += '<span class="log-step">[训练完成]</span> <span class="log-metric">最终准确率: ' + finalAcc + '% | 召回率: ' + finalRecall + '% | F1: ' + finalF1 + '</span>\n';
                    log.innerHTML += '<span class="log-step">[模型保存]</span> 模型已保存至 /models/' + name.replace(/\s/g, '_') + '_v' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.pkl\n';
                    log.scrollTop = log.scrollHeight;
                }
                if (metrics) {
                    metrics.style.display = 'grid';
                    metrics.style.gridTemplateColumns = 'repeat(4, 1fr)';
                    metrics.style.gap = '8px';
                    metrics.innerHTML =
                        '<div style="text-align:center;padding:10px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;"><div style="font-size:18px;font-weight:700;color:#27ae60;">' + finalAcc + '%</div><div style="font-size:10px;color:#999;">准确率</div></div>' +
                        '<div style="text-align:center;padding:10px;background:#eff6ff;border-radius:6px;border:1px solid #bfdbfe;"><div style="font-size:18px;font-weight:700;color:#5b8ff9;">' + finalRecall + '%</div><div style="font-size:10px;color:#999;">召回率</div></div>' +
                        '<div style="text-align:center;padding:10px;background:#fefce8;border-radius:6px;border:1px solid #fde68a;"><div style="font-size:18px;font-weight:700;color:#f39c12;">' + finalF1 + '</div><div style="font-size:10px;color:#999;">F1分数</div></div>' +
                        '<div style="text-align:center;padding:10px;background:#fdf2f8;border-radius:6px;border:1px solid #fbcfe8;"><div style="font-size:18px;font-weight:700;color:#9b59b6;">+0.3%</div><div style="font-size:10px;color:#999;">准确率提升</div></div>';
                }
                if (cancelBtn) { cancelBtn.textContent = '完成'; cancelBtn.className = 'btn btn-primary'; }
                DataStore.addLog('模型训练', '质差模型', '重新训练 ' + name + '，准确率 ' + finalAcc + '%');
                return;
            }
            var progress = Math.round(epoch / totalEpochs * 100);
            var loss = (baseLoss * Math.pow(0.88, epoch) + Math.random() * 0.02).toFixed(4);
            var acc = (baseAcc + (3.5 * epoch / totalEpochs) + (Math.random() - 0.5) * 0.8).toFixed(2);
            if (fill) fill.style.width = progress + '%';
            if (pct) pct.textContent = progress + '%';
            if (log) {
                var warn = parseFloat(loss) > 0.2 ? ' <span class="log-warn">[!] loss偏高</span>' : '';
                log.innerHTML += '<span class="log-step">[Epoch ' + epoch + '/' + totalEpochs + ']</span> loss: <span class="log-metric">' + loss + '</span> | acc: <span class="log-metric">' + acc + '%</span>' + warn + '\n';
                log.scrollTop = log.scrollHeight;
            }
        }, 400);
    },

    modelDetail: function(name) {
        Modal.show('模型详情 - ' + name,
            '<div style="font-size:13px;line-height:2;">' +
            '<div><strong>模型名称：</strong>' + name + '</div>' +
            '<div><strong>算法类型：</strong>' + (name.indexOf('WiFi') >= 0 ? '随机森林' : (name.indexOf('线路') >= 0 ? 'XGBoost' : '梯度提升')) + '</div>' +
            '<div><strong>特征数量：</strong>' + (15 + Math.floor(Math.random() * 25)) + ' 个</div>' +
            '<div><strong>训练样本：</strong>' + (5000 + Math.floor(Math.random() * 10000)) + ' 条</div>' +
            '<div><strong>准确率：</strong>' + (87 + Math.random() * 8).toFixed(1) + '%</div>' +
            '<div><strong>召回率：</strong>' + (85 + Math.random() * 10).toFixed(1) + '%</div>' +
            '<div><strong>F1分数：</strong>0.' + (87 + Math.floor(Math.random() * 10)) + '</div>' +
            '<div><strong>主要特征：</strong>光功率、CPU、时延、丢包率、连接时长、终端型号</div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">关闭</button>', '500px'
        );
    },

    exportQmRecords: function() {
        var data = this._getQmRecords();
        if (this._qmCity) data = data.filter(function(d) { return d.city === Pages._qmCity; });
        var csv = 'ID,用户账号,地市,模型,评分,主因,严重程度,建议,分析时间\n';
        data.forEach(function(r) { csv += [r.id, r.userAccount, r.city, r.modelName, r.score, r.primaryFactor, r.severity, r.recommendation, r.analysisTime].join(',') + '\n'; });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '质差模型分析_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('已导出 (' + data.length + ' 条)', 'success');
    },

    // ========== 用户质差 (增强：质差标签+画像) ==========
    _uqPage: 1, _uqCity: '', _uqType: '',
    renderUserQuality: function(container, page) {
        this._uqPage = page || 1;
        var data = JilinData.userQualityRecords;
        if (this._uqCity) data = data.filter(function(d) { return d.city === Pages._uqCity; });
        if (this._uqType) data = data.filter(function(d) { return d.qualityType === Pages._uqType; });
        var p = this.paginate(data, this._uqPage, 12);
        var rows = p.data.map(function(r, idx) {
            var globalIdx = (Pages._uqPage - 1) * 12 + idx;
            return '<tr><td><a style="color:#2b7de9;cursor:pointer;" onclick="Pages.showUserQualityProfile(' + globalIdx + ')">' + r.userAccount + '</a></td><td>' + r.city + '</td><td><span class="status-error">' + r.ceiScore + '</span></td><td><span class="badge badge-warning" style="font-size:10px;">' + r.qualityType + '</span></td><td>' + r.duration + '</td><td>' + r.affectedBiz + '</td><td>' + Pages.statusHtml(r.status) + '</td><td>' + r.reportTime + '</td><td><a style="color:#2b7de9;cursor:pointer;margin-right:6px;" onclick="Pages.showUserQualityProfile(' + globalIdx + ')">画像</a><a style="color:#27ae60;cursor:pointer;" onclick="Pages.createOrderFromQuality(' + globalIdx + ')">派单</a></td></tr>';
        }).join('');
        var typeOpts = '<option value="">全部类型</option>';
        ['线路质差', '高时延', '网关cpu高', '频繁重启', '视频卡顿', 'wifi干扰'].forEach(function(t) {
            typeOpts += '<option value="' + t + '"' + (t === Pages._uqType ? ' selected' : '') + '>' + t + '</option>';
        });
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">用户质差管理</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('uqCityFilter', 'Pages._uqCity=this.value;Pages.renderUserQuality(document.getElementById("page-user-quality"),1)', this._uqCity) +
            '<div class="form-group"><label class="form-label">质差类型</label><select class="form-select" id="uqTypeFilter" onchange="Pages._uqType=this.value;Pages.renderUserQuality(document.getElementById(\'page-user-quality\'),1)">' + typeOpts + '</select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderUserQuality(document.getElementById(\'page-user-quality\'),1)">查询</button><button class="btn" onclick="Pages.exportUserQuality()">导出</button></div></div></div>' +
            '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + data.length + '</div><div class="wo-stat-label">质差用户总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + data.filter(function(d){return d.status==="质差中";}).length + '</div><div class="wo-stat-label">当前质差中</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + data.filter(function(d){return d.status==="已恢复";}).length + '</div><div class="wo-stat-label">已恢复</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + data.filter(function(d){return d.qualityType==="线路质差";}).length + '</div><div class="wo-stat-label">线路质差</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + data.filter(function(d){return d.qualityType==="高时延";}).length + '</div><div class="wo-stat-label">高时延</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + data.filter(function(d){return d.qualityType==="视频卡顿";}).length + '</div><div class="wo-stat-label">视频卡顿</div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>用户账号</th><th>地市</th><th>CEI评分</th><th>质差标签</th><th>持续时长</th><th>影响业务</th><th>状态</th><th>上报时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderUserQuality.bind(Pages,document.getElementById("page-user-quality"))') + '</div></div>';
    },

    showUserQualityProfile: function(idx) {
        var data = JilinData.userQualityRecords;
        if (this._uqCity) data = data.filter(function(d) { return d.city === Pages._uqCity; });
        if (this._uqType) data = data.filter(function(d) { return d.qualityType === Pages._uqType; });
        var r = data[idx];
        if (!r) return;
        // 生成多维质差标签
        var tags = [r.qualityType];
        if (r.ceiScore < 60) tags.push('严重质差');
        if (r.qualityType === '线路质差') tags.push('弱光');
        if (r.qualityType === '网关cpu高') tags.push('设备异常');
        if (r.qualityType === '视频卡顿') tags.push('业务质差');
        if (r.qualityType === 'wifi干扰') tags.push('配置质差');
        var confidence = SeededRandom.float(75, 98, 1);
        Modal.show('用户质差画像 - ' + r.userAccount,
            '<div style="display:grid;grid-template-columns:1fr 2fr;gap:16px;">' +
            '<div style="text-align:center;padding:16px;background:#f8fafc;border-radius:8px;">' +
                '<div style="width:70px;height:70px;border-radius:50%;border:3px solid #e74c3c;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:24px;font-weight:700;color:#e74c3c;">' + r.ceiScore + '</div>' +
                '<div style="font-size:12px;color:#999;">CEI评分</div>' +
                '<div style="margin-top:12px;text-align:left;">' +
                    '<div style="font-size:11px;color:#666;margin-bottom:6px;"><strong>质差标签：</strong></div>' +
                    tags.map(function(t) { return '<span style="display:inline-block;padding:2px 8px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:10px;font-size:10px;color:#c0392b;margin:2px 4px 2px 0;">' + t + '</span>'; }).join('') +
                    '<div style="margin-top:10px;font-size:11px;color:#666;"><strong>置信度：</strong>' + confidence + '%</div>' +
                '</div>' +
            '</div>' +
            '<div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;margin-bottom:12px;">' +
                    '<div><strong>用户账号：</strong>' + r.userAccount + '</div>' +
                    '<div><strong>地市：</strong>' + r.city + '</div>' +
                    '<div><strong>质差类型：</strong>' + r.qualityType + '</div>' +
                    '<div><strong>持续时长：</strong>' + r.duration + '</div>' +
                    '<div><strong>影响业务：</strong>' + r.affectedBiz + '</div>' +
                    '<div><strong>状态：</strong>' + r.status + '</div>' +
                    '<div><strong>上报时间：</strong>' + r.reportTime + '</div>' +
                    '<div><strong>时间戳：</strong>' + r.reportTime + '</div>' +
                '</div>' +
                '<div style="padding:10px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:12px;margin-bottom:12px;">' +
                    '<strong>判定规则：</strong>' + (r.qualityType === '线路质差' ? '接收光功率 < -25dBm 或 误码率 > 1E-5' : (r.qualityType === '高时延' ? '平均时延 > 50ms 持续超过30分钟' : (r.qualityType === '网关cpu高' ? 'CPU使用率 > 85% 持续超过15分钟' : (r.qualityType === '视频卡顿' ? '视频卡顿率 > 5% 或 初始缓冲 > 3s' : '质差模型综合判定')))) +
                '</div>' +
                '<div style="font-size:12px;"><strong>处理建议：</strong>' + (r.qualityType === '线路质差' ? '建议派单检查光路，可能需要更换尾纤或清洁接头' : (r.qualityType === '高时延' ? '建议检查BRAS负载及上行链路拥塞情况' : (r.qualityType === '网关cpu高' ? '建议远程重启网关或升级固件版本' : '建议综合排查网络及终端状态'))) + '</div>' +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">关闭</button><button class="btn btn-primary" onclick="Modal.close();Pages.createOrderFromQuality(' + idx + ')">生成工单</button>',
            '700px'
        );
    },

    createOrderFromQuality: function(idx) {
        var data = JilinData.userQualityRecords;
        if (this._uqCity) data = data.filter(function(d) { return d.city === Pages._uqCity; });
        if (this._uqType) data = data.filter(function(d) { return d.qualityType === Pages._uqType; });
        var r = data[idx];
        if (!r) return;
        // 根据质差类型和地市推荐工程师
        var skill = JilinData.qualityTypeToSkill(r.qualityType);
        var engineers = JilinData.findEngineers(r.city, skill);
        var allEngineers = JilinData.findEngineers(r.city, null);
        var recommendId = engineers.length > 0 ? engineers[0].id : '';
        var engineerOpts = '<option value="">暂不指派（待派单）</option>';
        var engineerListHtml = '';
        (engineers.length > 0 ? engineers : allEngineers).forEach(function(e) {
            var isRecommend = e.id === recommendId;
            engineerOpts += '<option value="' + e.name + '"' + (isRecommend ? ' selected' : '') + '>' + e.name + ' (' + e.team + ')' + (isRecommend ? ' [推荐]' : '') + '</option>';
            var statusColor = e.online ? '#27ae60' : '#bbb';
            var loadColor = e.workload > 10 ? '#e74c3c' : (e.workload > 7 ? '#f39c12' : '#27ae60');
            engineerListHtml += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f2f5;font-size:12px;">' +
                '<span style="width:8px;height:8px;border-radius:50%;background:' + statusColor + ';flex-shrink:0;"></span>' +
                '<span style="width:60px;font-weight:600;">' + e.name + '</span>' +
                '<span style="color:#666;width:70px;">' + e.team + '</span>' +
                '<span style="color:#666;width:80px;">' + e.skill.join('/') + '</span>' +
                '<span style="color:' + loadColor + ';">工单' + e.workload + '件</span>' +
                (isRecommend ? '<span style="color:#2b7de9;font-weight:600;">[\u63a8\u8350]</span>' : '') +
                '</div>';
        });
        var woId = 'WO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 90000 + 10000));
        Modal.show('从质差画像生成工单',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
            '<div>' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.clipboard + ' 工单信息</div>' +
                '<div class="form-group"><label class="form-label">工单编号</label><input class="form-input" value="' + woId + '" readonly style="background:#f8fafc;"></div>' +
                '<div class="form-group"><label class="form-label">工单标题 *</label><input class="form-input" id="qWoTitle" value="' + r.qualityType + ' - ' + r.userAccount + '"></div>' +
                '<div class="form-group"><label class="form-label">工单类型</label><select class="form-select" id="qWoType"><option selected>主动发现</option><option>系统告警</option><option>AI预测</option><option>用户申诉</option></select></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">优先级</label><select class="form-select" id="qWoPriority"><option' + (r.ceiScore >= 60 ? '' : '') + '>低</option><option>中</option><option' + (r.ceiScore < 60 ? '' : ' selected') + '>高</option><option' + (r.ceiScore < 60 ? ' selected' : '') + '>紧急</option></select></div>' +
                    '<div class="form-group"><label class="form-label">处理时限</label><select class="form-select" id="qWoDeadline"><option value="4">4小时</option><option value="8">8小时</option><option value="24" selected>24小时</option><option value="48">48小时</option></select></div>' +
                '</div>' +
                '<div class="form-group"><label class="form-label">故障描述</label><textarea class="form-input" id="qWoDesc" rows="3" style="resize:vertical;">' + '用户 ' + r.userAccount + ' 存在' + r.qualityType + '问题，CEI评分 ' + r.ceiScore + '，持续 ' + r.duration + '，影响业务：' + r.affectedBiz + '</textarea></div>' +
            '</div>' +
            '<div>' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.user + ' 用户信息 & 指派</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">用户账号</label><input class="form-input" value="' + r.userAccount + '" readonly style="background:#f8fafc;"></div>' +
                    '<div class="form-group"><label class="form-label">所属地市</label><input class="form-input" value="' + r.city + '" readonly style="background:#f8fafc;"></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">质差类型</label><input class="form-input" value="' + r.qualityType + '" readonly style="background:#f8fafc;"></div>' +
                    '<div class="form-group"><label class="form-label">CEI评分</label><input class="form-input" value="' + r.ceiScore + ' 分" readonly style="background:#f8fafc;color:' + (r.ceiScore < 60 ? '#e74c3c' : '#f39c12') + ';font-weight:600;"></div>' +
                '</div>' +
                '<div class="form-group"><label class="form-label">指派工程师（系统根据技能和工作量推荐）</label><select class="form-select" id="qWoAssignee">' + engineerOpts + '</select></div>' +
                '<div style="margin-top:8px;padding:8px;background:#f8fafc;border:1px solid #e0e4e8;border-radius:4px;max-height:140px;overflow-y:auto;">' +
                    '<div style="font-size:11px;color:#999;margin-bottom:6px;">可选工程师（' + r.city + ' · 技能匹配：' + skill + '）</div>' +
                    engineerListHtml +
                    (engineers.length === 0 ? '<div style="font-size:11px;color:#999;text-align:center;padding:8px;">该地市暂无匹配技能的工程师</div>' : '') +
                '</div>' +
                '<div class="form-group" style="margin-top:8px;"><label class="form-label">派单备注</label><input class="form-input" id="qWoNote" placeholder="可选，如：需携带光功率计"></div>' +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doCreateOrderFromQuality(' + idx + ',\'' + woId + '\')">确认生成工单</button>',
            '820px'
        );
    },

    doCreateOrderFromQuality: function(idx, woId) {
        var data = JilinData.userQualityRecords;
        if (this._uqCity) data = data.filter(function(d) { return d.city === Pages._uqCity; });
        if (this._uqType) data = data.filter(function(d) { return d.qualityType === Pages._uqType; });
        var r = data[idx];
        if (!r) return;
        var title = document.getElementById('qWoTitle').value.trim();
        if (!title) { Modal.toast('请填写工单标题', 'warning'); return; }
        var assignee = document.getElementById('qWoAssignee').value;
        var newOrder = {
            id: woId,
            title: title,
            type: document.getElementById('qWoType').value,
            city: r.city,
            userAccount: r.userAccount,
            status: assignee ? '已派单' : '待派单',
            priority: document.getElementById('qWoPriority').value,
            createTime: new Date().toLocaleString('zh-CN'),
            assignee: assignee || '-',
            resolveTime: '-',
            satisfaction: '-',
            deadline: document.getElementById('qWoDeadline').value + '小时',
            description: document.getElementById('qWoDesc').value,
            note: document.getElementById('qWoNote').value
        };
        var orders = this._getWorkOrders();
        orders.unshift(newOrder);
        this._saveWorkOrders(orders);
        DataStore.addLog('工单创建', '质差识别', '从用户质差画像创建工单: ' + newOrder.id + '，指派: ' + (assignee || '待派单'));
        Modal.close();
        Modal.toast('工单 ' + woId + ' 已创建' + (assignee ? '，已派发至 ' + assignee : '，等待派单'), 'success');
    },

    exportUserQuality: function() {
        var data = JilinData.userQualityRecords;
        if (this._uqCity) data = data.filter(function(d) { return d.city === Pages._uqCity; });
        if (this._uqType) data = data.filter(function(d) { return d.qualityType === Pages._uqType; });
        var csv = '用户账号,地市,CEI评分,质差类型,持续时长,影响业务,状态,上报时间\n';
        data.forEach(function(r) {
            csv += [r.userAccount, r.city, r.ceiScore, r.qualityType, r.duration, r.affectedBiz, r.status, r.reportTime].join(',') + '\n';
        });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '质差用户数据_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('质差用户数据已导出 (' + data.length + '条)', 'success');
        DataStore.addLog('数据导出', '质差识别', '导出用户质差数据，共' + data.length + '条');
    },

    // ========== 质差聚类质差 (增强：GIS聚类+多维度) ==========
    renderQualityCluster: function(container) {
        // 统计聚类数据
        var typeMap = {}, cityMap = {}, oltMap = {};
        JilinData.userQualityRecords.forEach(function(r) {
            typeMap[r.qualityType] = (typeMap[r.qualityType] || 0) + 1;
            cityMap[r.city] = (cityMap[r.city] || 0) + 1;
        });
        // 模拟OLT维度聚类
        JilinData.oltDevices.slice(0, 20).forEach(function(olt) {
            oltMap[olt.id] = { city: olt.city, count: SeededRandom.int(2, 25), type: SeededRandom.pick(['弱光', '高误码', '频繁掉线']) };
        });
        var clusterRows = '';
        var clusterIdx = 1;
        for (var olt in oltMap) {
            var o = oltMap[olt];
            if (o.count > 5) {
                clusterRows += '<tr><td>CL-' + String(clusterIdx++).padStart(3, '0') + '</td><td>' + o.city + '</td><td>OLT</td><td>' + olt + '</td><td>' + o.type + '</td><td>' + o.count + '</td><td>' + SeededRandom.date('2025-12-01', '2025-12-02') + '</td><td><span class="badge badge-danger" style="font-size:10px;">聚类告警</span></td></tr>';
            }
        }
        container.innerHTML =
            '<div class="page-content">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + JilinData.userQualityRecords.length + '</div><div class="wo-stat-label">质差用户总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + Object.keys(typeMap).length + '</div><div class="wo-stat-label">质差类型数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#2b7de9;">' + clusterIdx + '</div><div class="wo-stat-label">聚类告警数</div></div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">质差类型聚类分布</span></div><div class="chart-container" id="qcChart1"></div></div>' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">各地市质差用户分布（支持下钻）</span></div><div class="chart-container" id="qcChart2"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">聚类告警清单（基于OLT/PON/网格维度自动聚类）</div>' +
            '<table class="data-table"><thead><tr><th>聚类ID</th><th>地市</th><th>聚类维度</th><th>设备/区域</th><th>质差类型</th><th>影响用户数</th><th>发现时间</th><th>状态</th></tr></thead><tbody>' + clusterRows + '</tbody></table></div></div>';
        // 图表
        var d1 = document.getElementById('qcChart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['qcChart1'] = c1;
            var pd = []; for (var k in typeMap) pd.push({ name: k, value: typeMap[k] });
            c1.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
                legend: { bottom: 5, textStyle: { fontSize: 10 } },
                series: [{ type: 'pie', radius: ['30%', '58%'], center: ['50%', '45%'], data: pd, label: { fontSize: 10 }, itemStyle: { borderRadius: 4 } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('qcChart2');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['qcChart2'] = c2;
            var cs = [], vs = [];
            for (var k in cityMap) { cs.push(k); vs.push(cityMap[k]); }
            c2.setOption({
                grid: { top: 20, right: 20, bottom: 40, left: 50 }, tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: cs, axisLabel: { fontSize: 10, rotate: 30 } },
                yAxis: { type: 'value', name: '质差用户数', splitLine: { lineStyle: { color: '#f0f2f5' } } },
                series: [{ type: 'bar', data: vs.map(function(v) { return { value: v, itemStyle: { color: v > 25 ? '#e74c3c' : (v > 15 ? '#f39c12' : '#5b8ff9') } }; }), barWidth: '50%', label: { show: true, position: 'top', fontSize: 9 } }]
            });
            // 点击下钻
            c2.on('click', function(params) {
                Modal.show('地市质差详情 - ' + params.name,
                    '<div style="font-size:13px;padding:8px 0;">' +
                    '<div style="margin-bottom:12px;"><strong>' + params.name + '</strong> 共有 <span style="color:#e74c3c;font-weight:700;">' + params.value + '</span> 个质差用户</div>' +
                    '<table class="data-table"><thead><tr><th>质差类型</th><th>用户数</th><th>占比</th></tr></thead><tbody>' +
                    JilinData.qualityIssueTypes.slice(0, 5).map(function(t) { var cnt = Math.floor(params.value * t.percentage / 100); return '<tr><td>' + t.type + '</td><td>' + cnt + '</td><td>' + t.percentage + '%</td></tr>'; }).join('') +
                    '</tbody></table></div>',
                    '<button class="btn" onclick="Modal.close()">关闭</button>', '480px'
                );
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    },

    // ========== 业务质差 (增强：质差标签+影响范围) ==========
    _bqPage: 1, _bqCity: '', _bqType: '',
    _bizQualityTypes: ['视频', '游戏', '在线办公', '网站/下载'],
    _bizAppMap: {
        '视频': ['腾讯视频', '爱奇艺', '优酷视频', '抖音', '快手', '哔哩哔哩'],
        '游戏': ['王者荣耀', '和平精英', '英雄联盟手游', '原神', '穿越火线'],
        '在线办公': ['企业微信', '钉钉', '腾讯会议', '飞书', 'WPS云文档'],
        '网站/下载': ['百度网盘', '迅雷下载', '浏览器下载', '京东商城', '淘宝']
    },
    _bizQualityTypeMap: {
        '视频': ['视频高时延', '视频卡顿'],
        '游戏': ['游戏高时延', '游戏卡顿'],
        '在线办公': ['应用高时延', '应用卡顿'],
        '网站/下载': ['应用高时延', '应用卡顿']
    },
    _bizTagDefinitions: {
        '视频高时延': [
            ['TCP建连时延', '>=150ms 高；>100ms and <150ms 中；>60ms，<=100ms 低'],
            ['HTTP平均响应时延', '>=180ms 高；>120ms and <180ms 中；>70ms，<=120ms 低']
        ],
        '视频卡顿': [
            ['HTTP响应成功率', '<=90% 高；>90% and <95% 中；>95%，<99% 低'],
            ['视频卡顿时长占比', '>1% 高；>0.5% and <1% 中；>0.1%，<0.5% 低'],
            ['抖动', '>20ms 高；>12ms and <20ms 中；>5ms，<12ms 低'],
            ['丢包率', '>2% 高；>1% and <2% 中；>0.1%，<1% 低'],
            ['下载速率', '<1000Kbps 高；>1000Kbps and <5000Kbps 中；<8000Kbps，>5000Kbps 低']
        ],
        '游戏高时延': [
            ['TCP建连时延', '>=150ms 高；>100ms and <150ms 中；>60ms，<=100ms 低'],
            ['HTTP平均响应时延', '>=180ms 高；>120ms and <180ms 中；>70ms，<=120ms 低']
        ],
        '游戏卡顿': [
            ['HTTP响应成功率', '<=90% 高；>90% and <95% 中；>95%，<99% 低'],
            ['抖动', '>20ms 高；>12ms and <20ms 中；>5ms，<12ms 低'],
            ['丢包率', '>2% 高；>1% and <2% 中；>0.1%，<1% 低'],
            ['下载速率', '<1000Kbps 高；>1000Kbps and <5000Kbps 中；<8000Kbps，>5000Kbps 低']
        ],
        '应用高时延': [
            ['TCP建连时延', '>=150ms 高；>100ms and <150ms 中；>60ms，<=100ms 低'],
            ['HTTP平均响应时延', '>=180ms 高；>120ms and <180ms 中；>70ms，<=120ms 低']
        ],
        '应用卡顿': [
            ['HTTP响应成功率', '<=90% 高；>90% and <95% 中；>95%，<99% 低'],
            ['下载速率', '<1000Kbps 高；>1000Kbps and <5000Kbps 中；<8000Kbps，>5000Kbps 低'],
            ['抖动', '>20ms 高；>12ms and <20ms 中；>5ms，<12ms 低'],
            ['丢包率', '>2% 高；>1% and <2% 中；>0.1%，<1% 低'],
            ['下载成功率', '<=90% 高；>90% and <95% 中；>95%，<99% 低']
        ]
    },
    _normalizeBizQualityRecord: function(r, idx) {
        var oldTypeMap = { 'IPTV': '视频', '视频通话': '视频', '在线游戏': '游戏', '云办公': '在线办公', '在线教育': '在线办公', '宽带上网': '网站/下载' };
        var bizType = this._bizQualityTypes.indexOf(r.bizType) >= 0 ? r.bizType : (oldTypeMap[r.bizType] || this._bizQualityTypes[idx % this._bizQualityTypes.length]);
        var qualityTypes = this._bizQualityTypeMap[bizType] || ['应用高时延'];
        var cityOlts = (JilinData.oltDevices || []).filter(function(o) { return o.city === r.city; });
        var olt = cityOlts.length ? cityOlts[idx % cityOlts.length] : null;
        var level = r.severity || r.qualityLevel;
        if (level === '差') level = '高';
        if (level === '良' || level === '优') level = '低';
        var startHour = 18 + (idx % 3);
        return {
            bizType: bizType,
            appName: r.appName || this._bizAppMap[bizType][idx % this._bizAppMap[bizType].length],
            qualityType: r.qualityType || qualityTypes[idx % qualityTypes.length],
            impactScope: r.impactScope || (idx % 2 === 0 ? (r.city + (olt && olt.district ? olt.district : '城区')) : (olt ? olt.id : r.city + '城区')),
            occurrenceTime: r.occurrenceTime || ('2026-05-17 ' + String(startHour).padStart(2, '0') + ':00 ~ 2026-05-17 ' + String(startHour + 2).padStart(2, '0') + ':00'),
            severity: level || '中'
        };
    },
    renderBizQuality: function(container, page) {
        this._bqPage = page || 1;
        var data = JilinData.bizQualityRecords;
        if (this._bqType) data = data.filter(function(d, idx) { return Pages._normalizeBizQualityRecord(d, idx).bizType === Pages._bqType; });
        var p = this.paginate(data, this._bqPage, 12);
        var startIdx = (this._bqPage - 1) * 12;
        var rows = p.data.map(function(r, i) {
            var d = Pages._normalizeBizQualityRecord(r, startIdx + i);
            var lvlCls = d.severity === '高' ? 'status-error' : (d.severity === '中' ? 'status-warning' : 'status-normal');
            return '<tr><td><span class="badge badge-primary" style="font-size:10px;">' + d.bizType + '</span></td><td>' + d.appName + '</td><td><a style="color:#2b7de9;cursor:pointer;font-weight:600;" onclick="Pages.showBizQualityDefinition(\'' + d.bizType + '\',\'' + d.qualityType + '\')">' + d.qualityType + '</a></td><td>' + d.impactScope + '</td><td>' + d.occurrenceTime + '</td><td><span class="' + lvlCls + '">' + d.severity + '</span></td></tr>';
        }).join('');
        var bizOpts = '<option value="">全部业务</option>';
        this._bizQualityTypes.forEach(function(t) {
            bizOpts += '<option value="' + t + '"' + (t === Pages._bqType ? ' selected' : '') + '>' + t + '</option>';
        });
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">业务质差分析</div>' +
            '<div class="remote-form"><div class="form-group"><label class="form-label">业务类型</label><select class="form-select" onchange="Pages._bqType=this.value;Pages.renderBizQuality(document.getElementById(\'page-biz-quality\'),1)">' + bizOpts + '</select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderBizQuality(document.getElementById(\'page-biz-quality\'),1)">查询</button><button class="btn" onclick="Pages.exportBizQuality()">导出</button></div></div></div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>业务类型</th><th>业务名称</th><th>质差类型</th><th>影响范围</th><th>发生时段</th><th>严重程度</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderBizQuality.bind(Pages,document.getElementById("page-biz-quality"))') + '</div></div>';
    },

    showBizQualityDefinition: function(bizType, qualityType) {
        var defs = this._bizTagDefinitions[qualityType] || [];
        var rows = defs.map(function(d) {
            return '<tr><td>' + bizType + '</td><td>' + qualityType + '</td><td>' + d[0] + '</td><td style="white-space:normal;line-height:1.7;">' + d[1] + '</td></tr>';
        }).join('');
        Modal.show('质差标签定义 - ' + qualityType,
            '<table class="data-table"><thead><tr><th>业务类型</th><th>质差类型</th><th>质差标签</th><th>定义</th></tr></thead><tbody>' + rows + '</tbody></table>',
            '<button class="btn btn-primary" onclick="Modal.close()">关闭</button>',
            '860px'
        );
    },

    exportBizQuality: function() {
        var data = JilinData.bizQualityRecords;
        if (this._bqType) data = data.filter(function(d, idx) { return Pages._normalizeBizQualityRecord(d, idx).bizType === Pages._bqType; });
        var csv = '业务类型,业务名称,质差类型,影响范围,发生时段,严重程度\n';
        data.forEach(function(r, idx) {
            var d = Pages._normalizeBizQualityRecord(r, idx);
            csv += [d.bizType, d.appName, d.qualityType, d.impactScope, d.occurrenceTime, d.severity].join(',') + '\n';
        });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '业务质差分析_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('业务质差数据已导出 (' + data.length + '条)', 'success');
        DataStore.addLog('数据导出', '质差识别', '导出业务质差数据，共' + data.length + '条');
    },

    // ========== 业务聚类质差 (增强：聚类发现+共性问题定位) ==========
    renderBizCluster: function(container) {
        // 模拟聚类结果
        var clusterEvents = [];
        for (var i = 0; i < 8; i++) {
            var city = SeededRandom.pick(JilinData.cities);
            var cityOlts = (JilinData.oltDevices || []).filter(function(o) { return o.city === city; });
            var relatedOlt = cityOlts.length ? cityOlts[i % cityOlts.length] : null;
            clusterEvents.push({
                id: 'BC-' + String(i + 1).padStart(3, '0'),
                bizCount: SeededRandom.int(3, 8),
                city: city,
                oltId: relatedOlt ? relatedOlt.id : 'JL-' + city + '-城区-城区站-OLT-01-HW-MA5800-X7',
                affectedUsers: SeededRandom.int(50, 800),
                timeRange: '2026-05-17 ' + SeededRandom.int(8, 18) + ':00 ~ 2026-05-17 ' + SeededRandom.int(19, 23) + ':00',
                severity: SeededRandom.pick(['高', '中', '低'])
            });
        }
        var clusterRows = clusterEvents.map(function(e) {
            var sevCls = e.severity === '高' ? 'status-error' : (e.severity === '中' ? 'status-warning' : 'status-normal');
            return '<tr><td>' + e.id + '</td><td>' + e.bizCount + '</td><td>' + e.city + '</td><td>' + e.oltId + '</td><td>' + e.affectedUsers + '</td><td>' + e.timeRange + '</td><td><span class="' + sevCls + '">' + e.severity + '</span></td></tr>';
        }).join('');

        container.innerHTML =
            '<div class="page-content">' +
            '<div style="margin-bottom:8px;padding:10px 12px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:4px;font-size:12px;color:#c0392b;"><strong>聚类说明：</strong>系统自动将发生在同一时间段、同一OLT区域下的多个业务质差事件进行聚类分析，发现共性网络问题。</div>' +
            '<div style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">各业务质量等级分布</span></div><div class="chart-container" id="bcChart1"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">业务聚类质差事件（共性问题发现）</div>' +
            '<table class="data-table"><thead><tr><th>聚类ID</th><th>业务数量</th><th>地市</th><th>关联OLT</th><th>影响用户</th><th>发生时段</th><th>严重程度</th></tr></thead><tbody>' + clusterRows + '</tbody></table></div></div>';
        var d1 = document.getElementById('bcChart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['bcChart1'] = c1;
            var lvl = {}; JilinData.bizQualityRecords.forEach(function(r) { lvl[r.qualityLevel] = (lvl[r.qualityLevel] || 0) + 1; });
            var pd = []; for (var k in lvl) pd.push({ name: k, value: lvl[k] });
            c1.setOption({ tooltip: { trigger: 'item', formatter: '{b}: {c}件 ({d}%)' }, legend: { bottom: 5, textStyle: { fontSize: 10 } }, series: [{ type: 'pie', radius: ['30%', '58%'], center: ['50%', '45%'], data: pd, label: { fontSize: 10 }, itemStyle: { borderRadius: 4 } }] });
            window.addEventListener('resize', function() { c1.resize(); });
        }
    },

    // ========== DPI实时抓包 (增强：实时抓包/筛选/详情) ==========
    _dpiPage: 1, _dpiCity: '', _dpiAccount: '', _dpiProto: '', _dpiApp: '',
    _getDpiRecords: function() {
        var stored = DataStore.load('dpiRecords', null);
        if (!stored || !stored.length) { DataStore.save('dpiRecords', JilinData.dpiRecords); return JilinData.dpiRecords; }
        return stored;
    },
    _saveDpiRecords: function(d) { DataStore.save('dpiRecords', d); },
    _dpiCapturing: false,
    renderDpiCapture: function(container, page) {
        this._dpiPage = page || 1;
        var allData = this._getDpiRecords();
        var data = allData;
        if (this._dpiCity) data = data.filter(function(d) { return d.city === Pages._dpiCity; });
        if (this._dpiProto) data = data.filter(function(d) { return d.protocol === Pages._dpiProto; });
        if (this._dpiApp) data = data.filter(function(d) { return d.app === Pages._dpiApp; });
        if (this._dpiAccount) {
            var kw = this._dpiAccount.toLowerCase();
            data = data.filter(function(d) { return (d.userAccount || '').toLowerCase().indexOf(kw) >= 0; });
        }
        // 协议/应用统计
        var protoStats = {}, appStats = {};
        allData.forEach(function(d) { protoStats[d.protocol] = (protoStats[d.protocol] || 0) + 1; appStats[d.app] = (appStats[d.app] || 0) + 1; });
        var topApps = Object.keys(appStats).map(function(k) { return { name: k, count: appStats[k] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 5);

        var p = this.paginate(data, this._dpiPage, 10);
        var rows = p.data.map(function(r) {
            return '<tr><td>' + r.id + '</td><td>' + r.time + '</td><td>' + r.userAccount + '</td><td>' + r.city + '</td><td>' + r.srcIp + '</td><td>' + r.dstIp + '</td><td>' + r.protocol + '</td><td>' + r.app + '</td><td>' + r.upTraffic + ' MB</td><td>' + r.downTraffic + ' MB</td><td>' + r.latency + ' ms</td><td>' + Pages.statusHtml(r.status) + '</td>' +
                '<td><a style="color:#2b7de9;cursor:pointer;" onclick="Pages.dpiDetail(\'' + r.id + '\')">详情</a></td></tr>';
        }).join('') || '<tr><td colspan="13" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

        var protoOpts = '<option value="">全部协议</option>';
        Object.keys(protoStats).forEach(function(k) { protoOpts += '<option value="' + k + '"' + (k === Pages._dpiProto ? ' selected' : '') + '>' + k + ' (' + protoStats[k] + ')</option>'; });
        var appOpts = '<option value="">全部应用</option>';
        Object.keys(appStats).forEach(function(k) { appOpts += '<option value="' + k + '"' + (k === Pages._dpiApp ? ' selected' : '') + '>' + k + '</option>'; });

        var captureBtn = this._dpiCapturing ?
            '<button class="btn" style="background:#e74c3c;border-color:#e74c3c;color:#fff;" onclick="Pages.stopDpiCapture()">⏹ 停止抓包</button>' :
            '<button class="btn btn-primary" onclick="Pages.startDpiCapture()">▶ 开始抓包</button>';

        container.innerHTML =
            '<div class="page-content">' +
            '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + allData.length + '</div><div class="wo-stat-label">抓包总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">' + Object.keys(protoStats).length + '</div><div class="wo-stat-label">协议数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + Object.keys(appStats).length + '</div><div class="wo-stat-label">应用数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + allData.filter(function(d){return d.status==='异常';}).length + '</div><div class="wo-stat-label">异常会话</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:' + (this._dpiCapturing ? '#27ae60' : '#999') + ';">' + (this._dpiCapturing ? '抓包中' : '已停止') + '</div><div class="wo-stat-label">抓包状态</div></div>' +
            '</div>' +
            '<div class="remote-panel"><div class="remote-panel-title">DPI实时抓包分析</div>' +
            '<div class="remote-form">' +
                this.cityFilterHtml('dpiCityFilter', 'Pages._dpiCity=this.value;Pages.renderDpiCapture(document.getElementById("page-dpi-capture"),1)', this._dpiCity) +
                '<div class="form-group"><label class="form-label">用户账号</label><input class="form-input" id="dpiAccountInput" value="' + (this._dpiAccount || '') + '" placeholder="用户账号"></div>' +
                '<div class="form-group"><label class="form-label">协议类型</label><select class="form-select" onchange="Pages._dpiProto=this.value;Pages.renderDpiCapture(document.getElementById(\'page-dpi-capture\'),1)">' + protoOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">应用</label><select class="form-select" onchange="Pages._dpiApp=this.value;Pages.renderDpiCapture(document.getElementById(\'page-dpi-capture\'),1)">' + appOpts + '</select></div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                    '<button class="btn btn-primary" onclick="Pages._dpiAccount=document.getElementById(\'dpiAccountInput\').value.trim();Pages.renderDpiCapture(document.getElementById(\'page-dpi-capture\'),1)">查询</button>' +
                    '<button class="btn" onclick="Pages._dpiCity=\'\';Pages._dpiAccount=\'\';Pages._dpiProto=\'\';Pages._dpiApp=\'\';Pages.renderDpiCapture(document.getElementById(\'page-dpi-capture\'),1)">重置</button>' +
                    captureBtn +
                    '<button class="btn" onclick="Pages.exportDpi()">导出PCAP</button>' +
                '</div></div></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:240px;"><div class="chart-card-header"><span class="chart-title">协议占比</span></div><div class="chart-container" id="dpiProtoChart"></div></div>' +
                '<div class="chart-card" style="min-height:240px;"><div class="chart-card-header"><span class="chart-title">TOP5应用</span></div><div class="chart-container" id="dpiAppChart"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>ID</th><th>时间</th><th>用户</th><th>地市</th><th>源IP</th><th>目的IP</th><th>协议</th><th>应用</th><th>上行</th><th>下行</th><th>时延</th><th>状态</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderDpiCapture.bind(Pages,document.getElementById("page-dpi-capture"))') + '</div></div>';

        // 协议环图
        var pdom = document.getElementById('dpiProtoChart');
        if (pdom) {
            var pc = echarts.init(pdom); App.chartInstances['dpiProtoChart'] = pc;
            var pData = []; for (var k in protoStats) pData.push({ name: k, value: protoStats[k] });
            pc.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0, textStyle: { fontSize: 10 } }, series: [{ type: 'pie', radius: ['35%', '60%'], center: ['50%', '45%'], data: pData, label: { fontSize: 10 } }] });
            window.addEventListener('resize', function() { pc.resize(); });
        }
        // TOP5应用条形
        var adom = document.getElementById('dpiAppChart');
        if (adom) {
            var ac = echarts.init(adom); App.chartInstances['dpiAppChart'] = ac;
            ac.setOption({
                grid: { top: 10, right: 30, bottom: 20, left: 70 }, tooltip: { trigger: 'axis' },
                xAxis: { type: 'value' },
                yAxis: { type: 'category', data: topApps.map(function(a) { return a.name; }).reverse(), axisLabel: { fontSize: 11 } },
                series: [{ type: 'bar', data: topApps.map(function(a) { return a.count; }).reverse(), itemStyle: { color: '#5b8ff9' }, label: { show: true, position: 'right', fontSize: 10 } }]
            });
            window.addEventListener('resize', function() { ac.resize(); });
        }
    },

    dpiDetail: function(id) {
        var data = this._getDpiRecords();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { r = data[i]; break; } }
        if (!r) return;
        var srcPort = Math.floor(Math.random() * 60000 + 1024);
        var dstPort = r.protocol === 'HTTPS' ? 443 : (r.protocol === 'HTTP' ? 80 : (r.protocol === 'DNS' ? 53 : (r.protocol === 'RTMP' ? 1935 : (r.protocol === 'HLS' ? 80 : (r.protocol === 'QUIC' ? 443 : Math.floor(Math.random() * 60000 + 1024))))));
        // 协议特定xDR字段
        var protoFields = '';
        if (r.protocol === 'HTTP') {
            protoFields = '<div style="margin-top:12px;padding:12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;"><div style="font-weight:600;font-size:12px;margin-bottom:8px;color:#2b7de9;">HTTP xDR明细字段</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">' +
                '<div><strong>请求URL：</strong><code style="word-break:break-all;">http://' + r.dstIp + '/api/v1/stream?id=' + Math.floor(Math.random()*9999) + '</code></div>' +
                '<div><strong>请求方法：</strong>GET</div>' +
                '<div><strong>响应状态码：</strong><span style="color:' + (Math.random() > 0.8 ? '#e74c3c' : '#27ae60') + ';">' + SeededRandom.pick([200, 200, 200, 301, 404, 500, 503]) + '</span></div>' +
                '<div><strong>Content-Type：</strong>' + SeededRandom.pick(['text/html', 'application/json', 'video/mp4', 'image/jpeg']) + '</div>' +
                '<div><strong>User-Agent：</strong>' + SeededRandom.pick(['Mozilla/5.0 (Windows NT 10.0)', 'Dalvik/2.1.0 (Android)', 'AppleCoreMedia/1.0']) + '</div>' +
                '<div><strong>首包响应时延：</strong><span style="color:' + (SeededRandom.float(50,300,0) > 200 ? '#e74c3c' : '#27ae60') + ';">' + SeededRandom.float(50, 300, 0) + 'ms</span></div>' +
                '<div><strong>HTTP事务时延：</strong>' + SeededRandom.float(100, 800, 0) + 'ms</div>' +
                '<div><strong>响应体大小：</strong>' + SeededRandom.float(1, 5000, 0) + ' KB</div>' +
                '</div></div>';
        } else if (r.protocol === 'HTTPS') {
            protoFields = '<div style="margin-top:12px;padding:12px;background:#f0fdf4;border:1px solid #a3e4c1;border-radius:4px;"><div style="font-weight:600;font-size:12px;margin-bottom:8px;color:#1a7a4a;">HTTPS/TLS xDR明细字段</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">' +
                '<div><strong>SNI域名：</strong>' + SeededRandom.pick(['www.bilibili.com', 'v.qq.com', 'www.douyin.com', 'live.kuaishou.com', 'www.baidu.com']) + '</div>' +
                '<div><strong>TLS版本：</strong>' + SeededRandom.pick(['TLS 1.2', 'TLS 1.3', 'TLS 1.3']) + '</div>' +
                '<div><strong>加密套件：</strong>' + SeededRandom.pick(['AES_128_GCM_SHA256', 'AES_256_GCM_SHA384', 'CHACHA20_POLY1305']) + '</div>' +
                '<div><strong>证书域名：</strong>*.' + SeededRandom.pick(['bilibili.com', 'qq.com', 'douyin.com', 'kuaishou.com']) + '</div>' +
                '<div><strong>TLS握手时延：</strong>' + SeededRandom.float(20, 150, 0) + 'ms</div>' +
                '<div><strong>证书有效期：</strong>2025-06-15 ~ 2026-06-15</div>' +
                '</div></div>';
        } else if (r.protocol === 'DNS') {
            protoFields = '<div style="margin-top:12px;padding:12px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:4px;"><div style="font-weight:600;font-size:12px;margin-bottom:8px;color:#c0392b;">DNS xDR明细字段</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">' +
                '<div><strong>查询域名：</strong>' + SeededRandom.pick(['www.baidu.com', 'v.qq.com', 'api.bilibili.com', 'live.douyin.com', 'dns.alidns.com']) + '</div>' +
                '<div><strong>查询类型：</strong>' + SeededRandom.pick(['A', 'A', 'AAAA', 'CNAME', 'MX']) + '</div>' +
                '<div><strong>响应码：</strong><span style="color:' + (Math.random() > 0.9 ? '#e74c3c' : '#27ae60') + ';">' + SeededRandom.pick(['NOERROR', 'NOERROR', 'NOERROR', 'NXDOMAIN', 'SERVFAIL']) + '</span></div>' +
                '<div><strong>解析IP：</strong>' + Math.floor(Math.random()*200+1) + '.' + Math.floor(Math.random()*254+1) + '.' + Math.floor(Math.random()*254+1) + '.' + Math.floor(Math.random()*254+1) + '</div>' +
                '<div><strong>DNS时延：</strong><span style="color:' + (SeededRandom.float(5,80,0) > 50 ? '#e74c3c' : '#27ae60') + ';">' + SeededRandom.float(5, 80, 0) + 'ms</span></div>' +
                '<div><strong>DNS服务器：</strong>' + SeededRandom.pick(['114.114.114.114', '8.8.8.8', '223.5.5.5', '119.29.29.29']) + '</div>' +
                '<div><strong>TTL：</strong>' + SeededRandom.int(60, 3600) + 's</div>' +
                '<div><strong>是否劫持：</strong>' + SeededRandom.pick(['否', '否', '否', '疑似']) + '</div>' +
                '</div></div>';
        } else if (r.protocol === 'QUIC') {
            protoFields = '<div style="margin-top:12px;padding:12px;background:#fefce8;border:1px solid #fde68a;border-radius:4px;"><div style="font-weight:600;font-size:12px;margin-bottom:8px;color:#92400e;">QUIC xDR明细字段</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">' +
                '<div><strong>QUIC版本：</strong>' + SeededRandom.pick(['QUICv1', 'QUICv2', 'h3-29']) + '</div>' +
                '<div><strong>Connection ID：</strong>0x' + Math.floor(Math.random()*0xFFFFFFFF).toString(16) + '</div>' +
                '<div><strong>SNI域名：</strong>' + SeededRandom.pick(['www.google.com', 'www.youtube.com', 'quic.rocks']) + '</div>' +
                '<div><strong>0-RTT：</strong>' + SeededRandom.pick(['是', '否', '否']) + '</div>' +
                '<div><strong>丢包率：</strong>' + SeededRandom.float(0, 5, 2) + '%</div>' +
                '<div><strong>平滑RTT：</strong>' + SeededRandom.float(5, 60, 1) + 'ms</div>' +
                '</div></div>';
        } else {
            // TCP/UDP/RTMP/HLS等通用
            protoFields = '<div style="margin-top:12px;padding:12px;background:#f8fafc;border:1px solid #e0e4e8;border-radius:4px;"><div style="font-weight:600;font-size:12px;margin-bottom:8px;color:#333;">TCP/传输层 xDR明细字段</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">' +
                '<div><strong>TCP窗口大小：</strong>' + SeededRandom.pick([65535, 131072, 262144]) + '</div>' +
                '<div><strong>TCP重传率：</strong><span style="color:' + (SeededRandom.float(0,5,2) > 2 ? '#e74c3c' : '#27ae60') + ';">' + SeededRandom.float(0, 5, 2) + '%</span></div>' +
                '<div><strong>RTT：</strong>' + SeededRandom.float(5, 80, 1) + 'ms</div>' +
                '<div><strong>MSS：</strong>' + SeededRandom.pick([1460, 1380, 1440]) + '</div>' +
                '<div><strong>建连时延：</strong>' + SeededRandom.float(10, 120, 0) + 'ms</div>' +
                '<div><strong>建连成功率：</strong>' + SeededRandom.float(95, 100, 1) + '%</div>' +
                (r.protocol === 'RTMP' ? '<div><strong>流媒体地址：</strong>rtmp://' + r.dstIp + '/live/stream_' + Math.floor(Math.random()*999) + '</div><div><strong>视频码率：</strong>' + SeededRandom.pick([2500, 4000, 6000, 8000]) + ' kbps</div>' : '') +
                (r.protocol === 'HLS' ? '<div><strong>m3u8地址：</strong>https://' + r.dstIp + '/live/index.m3u8</div><div><strong>分片时长：</strong>' + SeededRandom.pick([2, 4, 6, 10]) + 's</div>' : '') +
                '</div></div>';
        }
        Modal.show('DPI-XDR明细 - ' + r.id,
            '<div style="font-size:13px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<div><strong>记录ID：</strong>' + r.id + '</div>' +
            '<div><strong>时间：</strong>' + r.time + '</div>' +
            '<div><strong>用户：</strong>' + r.userAccount + '</div>' +
            '<div><strong>地市：</strong>' + r.city + '</div>' +
            '<div><strong>源IP：</strong>' + r.srcIp + ':' + srcPort + '</div>' +
            '<div><strong>目的IP：</strong>' + r.dstIp + ':' + dstPort + '</div>' +
            '<div><strong>协议：</strong><span style="padding:2px 8px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:10px;font-size:11px;color:#2b7de9;font-weight:600;">' + r.protocol + '</span></div>' +
            '<div><strong>应用：</strong>' + r.app + '</div>' +
            '<div><strong>上行流量：</strong>' + r.upTraffic + ' MB</div>' +
            '<div><strong>下行流量：</strong>' + r.downTraffic + ' MB</div>' +
            '<div><strong>会话时延：</strong>' + r.latency + ' ms</div>' +
            '<div><strong>状态：</strong>' + r.status + '</div>' +
            '</div>' +
            protoFields +
            '<div style="margin-top:12px;padding:10px;background:#1e1e2e;border-radius:4px;font-family:monospace;font-size:11px;color:#0f0;line-height:1.6;">' +
            '> Capture: ' + r.protocol + ' ' + r.srcIp + ':' + srcPort + ' → ' + r.dstIp + ':' + dstPort + '<br>' +
            '> Frame Length: ' + Math.floor(Math.random() * 1400 + 64) + ' bytes<br>' +
            '> TTL: 64, Window Size: 65535<br>' +
            '> Application: ' + r.app + '<br>' +
            '> Session Duration: ' + (Math.random() * 300 + 5).toFixed(1) + 's' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">关闭</button>', '720px'
        );
    },


    startDpiCapture: function() {
        this._dpiCapturing = true;
        Modal.toast('已开始实时抓包', 'success');
        DataStore.addLog('启动抓包', 'DPI抓包', '启动DPI实时抓包');
        var self = this;
        // 模拟实时抓包，每2秒新增一条
        this._dpiTimer = setInterval(function() {
            if (!self._dpiCapturing) return;
            var protocols = ['HTTP', 'HTTPS', 'DNS', 'RTMP', 'HLS', 'QUIC', 'TCP', 'UDP'];
            var apps = ['抖音', '快手', 'B站', '腾讯视频', '爱奇艺', '微信', '王者荣耀', '和平精英', '淘宝', '百度'];
            var city = JilinData.cities[Math.floor(Math.random() * JilinData.cities.length)];
            var newRec = {
                id: 'DPI-' + String(Date.now()).slice(-6),
                time: new Date().toLocaleString('zh-CN'),
                userAccount: 'JL' + (20250000 + Math.floor(Math.random() * 500)),
                city: city,
                srcIp: '192.168.' + Math.floor(Math.random() * 254 + 1) + '.' + Math.floor(Math.random() * 254 + 1),
                dstIp: Math.floor(Math.random() * 223 + 1) + '.' + Math.floor(Math.random() * 254 + 1) + '.' + Math.floor(Math.random() * 254 + 1) + '.' + Math.floor(Math.random() * 254 + 1),
                protocol: protocols[Math.floor(Math.random() * protocols.length)],
                app: apps[Math.floor(Math.random() * apps.length)],
                upTraffic: parseFloat((Math.random() * 50).toFixed(2)),
                downTraffic: parseFloat((Math.random() * 500 + 1).toFixed(2)),
                latency: parseFloat((Math.random() * 80 + 2).toFixed(1)),
                status: Math.random() > 0.15 ? '正常' : '异常'
            };
            var data = self._getDpiRecords();
            data.unshift(newRec);
            if (data.length > 200) data = data.slice(0, 200); // 限制数量
            self._saveDpiRecords(data);
            // 仅当当前页面在DPI时刷新
            var c = document.getElementById('page-dpi-capture');
            if (c && c.classList.contains('active')) self.renderDpiCapture(c, self._dpiPage);
        }, 2500);
    },

    stopDpiCapture: function() {
        this._dpiCapturing = false;
        if (this._dpiTimer) { clearInterval(this._dpiTimer); this._dpiTimer = null; }
        Modal.toast('已停止抓包', 'info');
        DataStore.addLog('停止抓包', 'DPI抓包', '停止DPI实时抓包');
        this.renderDpiCapture(document.getElementById('page-dpi-capture'), this._dpiPage);
    },

    exportDpi: function() {
        var data = this._getDpiRecords();
        var csv = 'ID,时间,用户,地市,源IP,目的IP,协议,应用,上行(MB),下行(MB),时延(ms),状态\n';
        data.forEach(function(r) { csv += [r.id, r.time, r.userAccount, r.city, r.srcIp, r.dstIp, r.protocol, r.app, r.upTraffic, r.downTraffic, r.latency, r.status].join(',') + '\n'; });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'DPI抓包_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('已导出 PCAP格式 (' + data.length + ' 条)', 'success');
    },

    // ========== 质差定界定位 / CE定界 (增强：业务CEI定界+通断CEI定界+定位) ==========
    _qlTab: 'business', // business / disconnect
    renderQualityLocation: function(container) {
        var self = this;
        container.innerHTML =
            '<div class="page-content">' +
            '<div class="remote-panel"><div class="remote-panel-title">CEI定界定位查询</div>' +
            '<div class="remote-form"><div class="form-group"><label class="form-label">用户账号/IP</label><input class="form-input" id="qlAccount" placeholder="请输入用户账号或IP"></div>' +
            '<div class="form-group"><label class="form-label">定界类型</label><select class="form-select" id="qlType" onchange="Pages._qlTab=this.value;Pages._renderQlCharts()"><option value="business">业务CEI定界定位</option><option value="disconnect">通断CEI定界定位</option></select></div>' +
            '<div class="form-group"><label class="form-label">时间范围</label><input class="form-input" type="date" id="qlDate" value="2025-12-02"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.executeQlQuery()">定位查询</button><button class="btn" onclick="Pages.exportQlResult()">导出报告</button></div></div></div>' +
            '<div id="qlResultArea">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">定界结果分布</span></div><div class="chart-container" id="qlChart1"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">质差原因TOP5</span></div><div class="chart-container" id="qlChart2"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">质差指标分布</span></div><div class="chart-container" id="qlChart3"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">定界定位详情</div>' +
            '<table class="data-table" id="qlDetailTable"><thead><tr><th>用户账号</th><th>地市</th><th>定界结果</th><th>定位原因</th><th>CEI评分</th><th>影响指标</th><th>严重程度</th><th>时间</th></tr></thead><tbody id="qlDetailBody"></tbody></table></div>' +
            '</div></div>';
        this._renderQlCharts();
        this._renderQlTable();
    },

    _renderQlCharts: function() {
        var isBiz = this._qlTab === 'business';
        // 定界结果分布（环形图）
        var d1 = document.getElementById('qlChart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['qlChart1'] = c1;
            var sideData = isBiz
                ? [{ name: '家庭侧', value: 32.8, itemStyle: { color: '#5ad8a6' } }, { name: '网络侧', value: 45.2, itemStyle: { color: '#5b8ff9' } }, { name: '内容侧', value: 15.5, itemStyle: { color: '#f6bd16' } }, { name: '其他', value: 6.5, itemStyle: { color: '#bdc3c7' } }]
                : [{ name: '家庭侧', value: 28.5, itemStyle: { color: '#5ad8a6' } }, { name: '光路侧', value: 38.2, itemStyle: { color: '#5b8ff9' } }, { name: '接入侧', value: 25.8, itemStyle: { color: '#f6bd16' } }, { name: '其他', value: 7.5, itemStyle: { color: '#bdc3c7' } }];
            c1.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
                legend: { bottom: 5, textStyle: { fontSize: 10 } },
                series: [{ type: 'pie', radius: ['35%', '58%'], center: ['50%', '45%'], data: sideData, label: { fontSize: 10, formatter: '{b}\n{d}%' } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        // TOP5原因
        var d2 = document.getElementById('qlChart2');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['qlChart2'] = c2;
            var reasons = isBiz
                ? [{ name: '视频卡顿', value: 856 }, { name: '下载速率低', value: 698 }, { name: '游戏高时延', value: 523 }, { name: '网页加载慢', value: 412 }, { name: '直播缓冲', value: 356 }]
                : [{ name: '光衰过大', value: 920 }, { name: '频繁掉线', value: 756 }, { name: 'dying-gasp', value: 534 }, { name: '设备重启', value: 423 }, { name: '光路中断', value: 312 }];
            c2.setOption({
                grid: { top: 15, right: 50, bottom: 15, left: 80 }, tooltip: { trigger: 'axis' },
                yAxis: { type: 'category', data: reasons.map(function(r) { return r.name; }).reverse(), axisLabel: { fontSize: 10 } },
                xAxis: { type: 'value', axisLabel: { fontSize: 9 } },
                series: [{ type: 'bar', data: reasons.map(function(r) { return r.value; }).reverse(), barWidth: '50%', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#5b8ff9' }, { offset: 1, color: '#85c1ff' }] } }, label: { show: true, position: 'right', fontSize: 9 } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
        // 质差指标分布
        var d3 = document.getElementById('qlChart3');
        if (d3) {
            var c3 = echarts.init(d3); App.chartInstances['qlChart3'] = c3;
            var indicators = isBiz
                ? [{ name: '时延', max: 100 }, { name: '丢包率', max: 10 }, { name: '下载速率', max: 300 }, { name: '上传速率', max: 80 }, { name: 'DNS解析', max: 50 }]
                : [{ name: '接收光功率', max: 5 }, { name: '发送光功率', max: 5 }, { name: '中断次数', max: 20 }, { name: '中断时长', max: 60 }, { name: '误码率', max: 10 }];
            var radarData = isBiz ? [35, 3.2, 180, 42, 15] : [3.5, 2.8, 8, 25, 2.5];
            c3.setOption({
                tooltip: {},
                radar: { indicator: indicators, radius: '60%', axisName: { fontSize: 9, color: '#666' } },
                series: [{ type: 'radar', data: [{ value: radarData, name: '当前值', areaStyle: { color: 'rgba(91,143,249,0.2)' } }], itemStyle: { color: '#5b8ff9' } }]
            });
            window.addEventListener('resize', function() { c3.resize(); });
        }
    },

    _renderQlTable: function() {
        var tbody = document.getElementById('qlDetailBody');
        if (!tbody) return;
        var isBiz = this._qlTab === 'business';
        var sides = isBiz ? ['家庭侧', '网络侧', '内容侧'] : ['家庭侧', '光路侧', '接入侧'];
        var reasons = isBiz
            ? ['视频卡顿', '下载速率低', '游戏高时延', '网页加载慢', 'DNS解析慢']
            : ['光衰过大', '频繁掉线', 'dying-gasp', '设备重启', '光路中断'];
        var rows = '';
        for (var i = 0; i < 15; i++) {
            var city = SeededRandom.pick(JilinData.cities);
            rows += '<tr><td>JL' + (20250000 + SeededRandom.int(1, 500)) + '</td><td>' + city + '</td><td>' + SeededRandom.pick(sides) + '</td><td>' + SeededRandom.pick(reasons) + '</td><td>' + SeededRandom.float(55, 85, 1) + '</td><td>' + (isBiz ? SeededRandom.float(20, 80, 1) + 'ms' : SeededRandom.float(-28, -18, 1) + 'dBm') + '</td><td>' + Pages.statusHtml(SeededRandom.pick(['紧急', '一般', '告警'])) + '</td><td>' + SeededRandom.date('2025-12-01', '2025-12-02') + '</td></tr>';
        }
        tbody.innerHTML = rows;
    },

    executeQlQuery: function() {
        var account = document.getElementById('qlAccount').value.trim();
        if (!account) { Modal.toast('请输入用户账号或IP地址', 'warning'); return; }
        DataStore.addLog('定界查询', '质差定界定位', '查询用户 ' + account + ' 的CEI定界定位信息');
        // 模拟查询结果弹窗
        var isBiz = this._qlTab === 'business';
        var side = SeededRandom.pick(isBiz ? ['家庭侧', '网络侧', '内容侧'] : ['家庭侧', '光路侧', '接入侧']);
        var reason = SeededRandom.pick(isBiz ? ['视频卡顿', '下载速率低', '游戏高时延'] : ['光衰过大', '频繁掉线', 'dying-gasp']);
        Modal.show('定界定位结果 - ' + account,
            '<div style="padding:8px 0;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
            '<div><strong>用户账号：</strong>' + account + '</div>' +
            '<div><strong>定界类型：</strong>' + (isBiz ? '业务CEI定界' : '通断CEI定界') + '</div>' +
            '<div><strong>定界结果：</strong><span style="color:#e74c3c;font-weight:600;">' + side + '</span></div>' +
            '<div><strong>定位原因：</strong>' + reason + '</div>' +
            '<div><strong>CEI评分：</strong>' + SeededRandom.float(55, 78, 1) + ' 分</div>' +
            '<div><strong>影响时段：</strong>2025-12-02 08:00 ~ 14:00</div>' +
            '</div>' +
            '<div style="margin-top:16px;padding:12px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:12px;">' +
            '<strong>处理建议：</strong>' + (side === '家庭侧' ? '建议检查用户侧网关设备、WiFi信号及终端连接状态' : (side === '网络侧' || side === '光路侧' ? '建议检查OLT端口、光路衰减及传输链路' : '建议联系内容提供商确认服务器状态')) +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">关闭</button><button class="btn btn-primary" onclick="Modal.close();Pages.showCreateOrderFromQl(\'' + account + '\',\'' + reason + '\')">生成工单</button>',
            '550px'
        );
    },

    showCreateOrderFromQl: function(account, reason) {
        var isBiz = this._qlTab === 'business';
        var woId = 'WO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 90000 + 10000));
        var city = SeededRandom.pick(JilinData.cities);
        var side = isBiz ? SeededRandom.pick(['家庭侧', '网络侧', '内容侧']) : SeededRandom.pick(['家庭侧', '光路侧', '接入侧']);
        var ceiScore = SeededRandom.float(48, 72, 1);
        var scoreColor = ceiScore < 55 ? '#e74c3c' : (ceiScore < 65 ? '#f39c12' : '#5b8ff9');
        // Engineers
        var engList = JilinData.findEngineers ? JilinData.findEngineers(city, null) : [];
        var engOpts = '<option value="">暂不指派（待派单）</option>';
        engList.forEach(function(e, i) {
            engOpts += '<option value="' + e.name + '"' + (i === 0 ? ' selected' : '') + '>' + e.name + ' - ' + e.team + ' 工单' + e.workload + '件' + (i === 0 ? ' [推荐]' : '') + '</option>';
        });
        var suggestion = side === '家庭侧' ? '检查用户侧网关设备、WiFi信号及终端连接状态' : (side === '网络侧' || side === '光路侧' ? '检查OLT端口、光路衰减及传输链路' : '联系内容提供商确认服务器状态');

        Modal.show('从定界分析生成工单',
            '<div style="display:grid;grid-template-columns:280px 1fr;gap:20px;">' +
            // Left: Diagnosis source
            '<div style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e0e4e8;">' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.search + ' 定界诊断来源</div>' +
                '<div style="text-align:center;margin-bottom:12px;">' +
                    '<div style="width:72px;height:72px;border-radius:50%;border:4px solid ' + scoreColor + ';display:flex;align-items:center;justify-content:center;margin:0 auto 6px;font-size:22px;font-weight:700;color:' + scoreColor + ';">' + ceiScore + '</div>' +
                    '<div style="font-size:11px;color:#999;">CEI评分</div>' +
                '</div>' +
                '<div style="font-size:12px;color:#666;line-height:2;">' +
                    '<div><strong>用户账号：</strong>' + account + '</div>' +
                    '<div><strong>所属地市：</strong>' + city + '</div>' +
                    '<div><strong>定界类型：</strong><span style="padding:1px 6px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:2px;font-size:10px;color:#2b7de9;">' + (isBiz ? '业务CEI定界' : '通断CEI定界') + '</span></div>' +
                    '<div><strong>定界结果：</strong><span style="color:#e74c3c;font-weight:600;">' + side + '</span></div>' +
                    '<div><strong>定位原因：</strong><span style="color:#e74c3c;">' + reason + '</span></div>' +
                    '<div><strong>影响时段：</strong>2025-12-02 08:00 ~ 14:00</div>' +
                '</div>' +
                '<div style="margin-top:10px;padding:8px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:11px;color:#666;">' +
                    '<strong>处理建议：</strong>' + suggestion +
                '</div>' +
            '</div>' +
            // Right: Order form
            '<div>' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.clipboard + ' 工单信息</div>' +
                '<div class="form-group"><label class="form-label">工单编号</label><input class="form-input" value="' + woId + '" readonly style="background:#f8fafc;"></div>' +
                '<div class="form-group"><label class="form-label">工单标题 *</label><input class="form-input" id="qlWoTitle" value="' + reason + ' - ' + account + '"></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">工单类型</label><select class="form-select" id="qlWoType"><option selected>系统告警</option><option>质差定界</option><option>主动发现</option></select></div>' +
                    '<div class="form-group"><label class="form-label">优先级</label><select class="form-select" id="qlWoPriority"><option>低</option><option>中</option><option selected>高</option><option>紧急</option></select></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">处理时限</label><select class="form-select" id="qlWoDeadline"><option value="4">4小时（紧急）</option><option value="8" selected>8小时</option><option value="24">24小时（标准）</option><option value="48">48小时</option></select></div>' +
                    '<div class="form-group"><label class="form-label">定界侧</label><input class="form-input" value="' + side + '" readonly style="background:#f8fafc;"></div>' +
                '</div>' +
                '<div class="form-group"><label class="form-label">指派工程师（' + city + '地区）</label><select class="form-select" id="qlWoAssignee">' + engOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">故障描述</label><textarea class="form-input" id="qlWoDesc" rows="3" style="resize:vertical;">用户 ' + account + ' CEI定界分析，评分 ' + ceiScore + '，定界结果：' + side + '，定位原因：' + reason + '。建议：' + suggestion + '</textarea></div>' +
                '<div class="form-group"><label class="form-label">派单备注</label><input class="form-input" id="qlWoNote" placeholder="如：需现场检测光路、用户晚上在家"></div>' +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doQlCreateOrder(\'' + account + '\',\'' + city + '\',\'' + woId + '\')">确认生成工单</button>',
            '820px'
        );
    },

    doQlCreateOrder: function(account, city, woId) {
        var title = document.getElementById('qlWoTitle').value.trim();
        if (!title) { Modal.toast('请填写工单标题', 'warning'); return; }
        var assignee = document.getElementById('qlWoAssignee').value;
        var newOrder = {
            id: woId,
            title: title,
            type: document.getElementById('qlWoType').value,
            city: city,
            userAccount: account,
            status: assignee ? '已派单' : '待派单',
            priority: document.getElementById('qlWoPriority').value,
            createTime: new Date().toLocaleString('zh-CN'),
            assignee: assignee || '-',
            resolveTime: '-',
            satisfaction: '-',
            deadline: document.getElementById('qlWoDeadline').value + '小时',
            description: document.getElementById('qlWoDesc').value,
            note: document.getElementById('qlWoNote').value,
            sourceType: '质差定界'
        };
        JilinData.workOrderList.unshift(newOrder);
        JilinData.workOrderStats.total++;
        JilinData.workOrderStats.pending++;
        DataStore.addLog('工单创建', '质差定界定位', '从定界结果创建工单: ' + newOrder.id + '，指派: ' + (assignee || '待派单'));
        Modal.close();
        Modal.toast('工单 ' + woId + ' 已创建' + (assignee ? '，已派发至 ' + assignee : '，等待派单'), 'success');
    },

    exportQlResult: function() {
        Modal.toast('定界定位报告已导出', 'success');
        DataStore.addLog('导出报告', '质差定界定位', '导出CEI定界定位分析报告');
    },

    // ========== 工单管理 (增强CRUD - localStorage持久化) ==========
    _woPage: 1, _woCity: '', _woStatus: '',
    _getWorkOrders: function() {
        var stored = DataStore.load('workOrders', null);
        if (!stored || !stored.length) { DataStore.save('workOrders', JilinData.workOrderList); return JilinData.workOrderList; }
        return stored;
    },
    _saveWorkOrders: function(data) { DataStore.save('workOrders', data); },
    renderWorkOrder: function(container, page) {
        this._woPage = page || 1;
        var allData = this._getWorkOrders();
        var s = { total: allData.length, pending: 0, processing: 0, completed: 0, overdueCount: 0 };
        allData.forEach(function(wo) { if (wo.status === '待派单') s.pending++; else if (wo.status === '处理中' || wo.status === '已派单') s.processing++; else if (wo.status === '已解决' || wo.status === '已关闭') s.completed++; });
        s.overdueCount = Math.floor(s.total * 0.012);
        var data = allData;
        if (this._woCity) data = data.filter(function(d) { return d.city === Pages._woCity; });
        if (this._woStatus) data = data.filter(function(d) { return d.status === Pages._woStatus; });
        var p = this.paginate(data, this._woPage, 10);
        var rows = p.data.map(function(r, idx) {
            var globalIdx = (Pages._woPage - 1) * 10 + idx;
            return '<tr><td>' + r.id + '</td><td><a style="color:#2b7de9;cursor:pointer;" onclick="Pages.showWorkOrderDetail(' + globalIdx + ')">' + r.title + '</a></td><td>' + r.type + '</td><td>' + r.city + '</td><td>' + r.userAccount + '</td><td>' + Pages.statusHtml(r.status) + '</td><td>' + Pages.statusHtml(r.priority) + '</td><td>' + r.assignee + '</td><td>' + r.createTime + '</td><td>' +
                '<a style="color:#2b7de9;cursor:pointer;margin-right:6px;" onclick="Pages.dispatchOrder(' + globalIdx + ')">派单</a>' +
                '<a style="color:#27ae60;cursor:pointer;margin-right:6px;" onclick="Pages.resolveOrder(' + globalIdx + ')">解决</a>' +
                '<a style="color:#e74c3c;cursor:pointer;" onclick="Pages.closeOrder(' + globalIdx + ')">关闭</a></td></tr>';
        }).join('');
        var statusOpts = '<option value="">全部状态</option>';
        ['待派单','已派单','处理中','已解决','已关闭'].forEach(function(st) {
            statusOpts += '<option value="' + st + '"' + (st === Pages._woStatus ? ' selected' : '') + '>' + st + '</option>';
        });
        container.innerHTML =
            '<div class="page-content"><div class="work-order-stats">' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + s.total + '</div><div class="wo-stat-label">工单总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + s.pending + '</div><div class="wo-stat-label">待处理</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#2b7de9;">' + s.processing + '</div><div class="wo-stat-label">处理中</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + s.completed + '</div><div class="wo-stat-label">已完成</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + s.overdueCount + '</div><div class="wo-stat-label">超时工单</div></div>' +
            '</div>' +
            '<div class="remote-panel" style="margin-bottom:8px"><div class="remote-form">' +
            this.cityFilterHtml('woCityFilter', 'Pages._woCity=this.value;Pages.renderWorkOrder(document.getElementById("page-work-order"),1)', this._woCity) +
            '<div class="form-group"><label class="form-label">工单状态</label><select class="form-select" id="woStatusFilter" onchange="Pages._woStatus=this.value;Pages.renderWorkOrder(document.getElementById(\'page-work-order\'),1)">' + statusOpts + '</select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderWorkOrder(document.getElementById(\'page-work-order\'),1)">查询</button><button class="btn" onclick="Pages.showCreateOrder()">+ 新建工单</button></div></div></div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>工单号</th><th>标题</th><th>类型</th><th>地市</th><th>用户</th><th>状态</th><th>优先级</th><th>处理人</th><th>创建时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderWorkOrder.bind(Pages,document.getElementById("page-work-order"))') + '</div></div>';
    },

    showWorkOrderDetail: function(idx) {
        var data = this._getWorkOrders();
        if (this._woCity) data = data.filter(function(d) { return d.city === Pages._woCity; });
        if (this._woStatus) data = data.filter(function(d) { return d.status === Pages._woStatus; });
        var wo = data[idx];
        if (!wo) return;
        Modal.show('工单详情 - ' + wo.id,
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
            '<div><strong>工单号：</strong>' + wo.id + '</div>' +
            '<div><strong>标题：</strong>' + wo.title + '</div>' +
            '<div><strong>类型：</strong>' + wo.type + '</div>' +
            '<div><strong>优先级：</strong>' + wo.priority + '</div>' +
            '<div><strong>地市：</strong>' + wo.city + '</div>' +
            '<div><strong>用户账号：</strong>' + wo.userAccount + '</div>' +
            '<div><strong>状态：</strong>' + wo.status + '</div>' +
            '<div><strong>处理人：</strong>' + wo.assignee + '</div>' +
            '<div><strong>创建时间：</strong>' + wo.createTime + '</div>' +
            '<div><strong>解决耗时：</strong>' + wo.resolveTime + '</div>' +
            '<div><strong>满意度：</strong>' + wo.satisfaction + '</div>' +
            '</div>' +
            '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e0e4e8;"><strong>处理记录：</strong>' +
            '<div style="margin-top:8px;padding:10px;background:#f8fafc;border-radius:4px;font-size:12px;line-height:2;">' +
            '<div>• ' + wo.createTime + ' 工单创建，来源：' + wo.type + '</div>' +
            (wo.assignee !== '-' ? '<div>• 工单已派发至 ' + wo.assignee + '</div>' : '') +
            (wo.status === '已解决' || wo.status === '已关闭' ? '<div>• 工单已解决，耗时 ' + wo.resolveTime + '</div>' : '') +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">关闭</button>', '650px'
        );
    },

    showCreateOrder: function() {
        var cityOpts = '';
        JilinData.cities.forEach(function(c) { cityOpts += '<option value="' + c + '">' + c + '</option>'; });
        // 默认显示全部工程师
        var defaultEngineers = JilinData.findEngineers('', null);
        var engineerOpts = '<option value="">暂不指派（待派单）</option>';
        defaultEngineers.forEach(function(e) {
            var statusIcon = e.online ? '[+]' : '[-]';
            engineerOpts += '<option value="' + e.name + '">' + statusIcon + ' ' + e.name + ' - ' + e.city + ' (' + e.team + ') 工单' + e.workload + '件</option>';
        });
        var woId = 'WO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 90000 + 10000));
        Modal.show('新建工单',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
            '<div>' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.clipboard + ' 工单基本信息</div>' +
                '<div class="form-group"><label class="form-label">工单编号</label><input class="form-input" value="' + woId + '" readonly style="background:#f8fafc;"></div>' +
                '<div class="form-group"><label class="form-label">工单标题 *</label><input class="form-input" id="woTitle" placeholder="如：宽带无法上网 - JL20250001"></div>' +
                '<div class="form-group"><label class="form-label">工单类型</label><select class="form-select" id="woType"><option>用户申诉</option><option>主动发现</option><option>系统告警</option><option>AI预测</option><option>巡检发现</option></select></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">所属地市 *</label><select class="form-select" id="woCity" onchange="Pages._refreshWoEngineers()">' + cityOpts + '</select></div>' +
                    '<div class="form-group"><label class="form-label">优先级</label><select class="form-select" id="woPriority"><option>低</option><option>中</option><option selected>高</option><option>紧急</option></select></div>' +
                '</div>' +
                '<div class="form-group"><label class="form-label">用户账号</label><input class="form-input" id="woAccount" placeholder="请输入用户账号"></div>' +
                '<div class="form-group"><label class="form-label">故障描述</label><textarea class="form-input" id="woDesc" rows="3" placeholder="请描述故障现象..." style="resize:vertical;"></textarea></div>' +
            '</div>' +
            '<div>' +
                '<div style="font-weight:600;font-size:13px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e0e4e8;">' + ICO.wrench + ' 指派工程师</div>' +
                '<div class="form-group"><label class="form-label">指派工程师</label><select class="form-select" id="woAssignee">' + engineerOpts + '</select></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div class="form-group"><label class="form-label">处理时限</label><select class="form-select" id="woDeadline"><option value="4">4小时（紧急）</option><option value="8">8小时</option><option value="24" selected>24小时（标准）</option><option value="48">48小时</option><option value="72">72小时</option></select></div>' +
                    '<div class="form-group"><label class="form-label">联系电话</label><input class="form-input" id="woPhone" placeholder="用户联系电话"></div>' +
                '</div>' +
                '<div class="form-group"><label class="form-label">派单备注</label><input class="form-input" id="woNote" placeholder="如：需携带光功率计、用户白天在家"></div>' +
                '<div style="margin-top:12px;padding:10px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:11px;color:#1a5bb8;">' +
                    '<strong>提示：</strong>选择地市后，工程师列表将自动筛选为该地市的可用人员。系统按在线状态和当前工作量排序推荐。' +
                '</div>' +
                '<div id="woEngineerInfo" style="margin-top:8px;"></div>' +
            '</div></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doCreateOrder(\'' + woId + '\')">创建工单</button>',
            '780px'
        );
    },

    _refreshWoEngineers: function() {
        var city = document.getElementById('woCity').value;
        var engineers = JilinData.findEngineers(city, null);
        var sel = document.getElementById('woAssignee');
        if (!sel) return;
        var opts = '<option value="">暂不指派（待派单）</option>';
        engineers.forEach(function(e) {
            var statusIcon = e.online ? '[+]' : '[-]';
            opts += '<option value="' + e.name + '">' + statusIcon + ' ' + e.name + ' (' + e.team + ') 工单' + e.workload + '件</option>';
        });
        sel.innerHTML = opts;
        // 显示工程师信息
        var info = document.getElementById('woEngineerInfo');
        if (info && engineers.length > 0) {
            info.innerHTML = '<div style="font-size:11px;color:#666;margin-bottom:4px;">' + city + ' 可用工程师 (' + engineers.length + '人)：</div>' +
                engineers.slice(0, 4).map(function(e) {
                    return '<div style="font-size:11px;padding:3px 0;color:#333;">' + (e.online ? '<span style="color:#27ae60;">●</span>' : '<span style="color:#ccc;">●</span>') + ' ' + e.name + ' · ' + e.area + ' · 工单' + e.workload + '件</div>';
                }).join('');
        }
    },

    doCreateOrder: function(woId) {
        var title = document.getElementById('woTitle').value.trim();
        if (!title) { Modal.toast('请输入工单标题', 'warning'); return; }
        var assignee = document.getElementById('woAssignee').value;
        var newOrder = {
            id: woId,
            title: title,
            type: document.getElementById('woType').value,
            city: document.getElementById('woCity').value,
            userAccount: document.getElementById('woAccount').value || '-',
            status: assignee ? '已派单' : '待派单',
            priority: document.getElementById('woPriority').value,
            createTime: new Date().toLocaleString('zh-CN'),
            assignee: assignee || '-',
            resolveTime: '-',
            satisfaction: '-',
            deadline: document.getElementById('woDeadline').value + '小时',
            description: document.getElementById('woDesc').value,
            note: document.getElementById('woNote').value,
            phone: document.getElementById('woPhone').value
        };
        var orders = this._getWorkOrders();
        orders.unshift(newOrder);
        this._saveWorkOrders(orders);
        DataStore.addLog('工单创建', '工单管理', '创建工单: ' + newOrder.id + ' - ' + title + (assignee ? '，指派: ' + assignee : ''));
        Modal.close();
        Modal.toast('工单创建成功: ' + newOrder.id + (assignee ? '，已派发至 ' + assignee : ''), 'success');
        this.renderWorkOrder(document.getElementById('page-work-order'), 1);
    },

    dispatchOrder: function(idx) {
        var data = this._getWorkOrders();
        if (this._woCity) data = data.filter(function(d) { return d.city === Pages._woCity; });
        if (this._woStatus) data = data.filter(function(d) { return d.status === Pages._woStatus; });
        var wo = data[idx];
        if (!wo) return;
        if (wo.status !== '待派单' && wo.status !== '已派单') { Modal.toast('当前状态不可派单', 'warning'); return; }
        // 根据工单地市筛选工程师
        var engineers = JilinData.findEngineers(wo.city, null);
        var engineerOpts = '';
        engineers.forEach(function(e, i) {
            var statusIcon = e.online ? '[+]' : '[-]';
            engineerOpts += '<option value="' + e.name + '"' + (i === 0 ? ' selected' : '') + '>' + statusIcon + ' ' + e.name + ' - ' + e.team + ' (' + e.skill.join('/') + ') 工单' + e.workload + '件</option>';
        });
        // 如果该地市没有工程师，显示全部
        if (engineers.length === 0) {
            JilinData.engineers.forEach(function(e) {
                var statusIcon = e.online ? '[+]' : '[-]';
                engineerOpts += '<option value="' + e.name + '">' + statusIcon + ' ' + e.name + ' - ' + e.city + ' (' + e.team + ')</option>';
            });
        }
        var engineerCards = engineers.slice(0, 4).map(function(e) {
            var statusColor = e.online ? '#27ae60' : '#bbb';
            var loadColor = e.workload > 10 ? '#e74c3c' : (e.workload > 7 ? '#f39c12' : '#27ae60');
            return '<div style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e0e4e8;border-radius:4px;margin-bottom:6px;">' +
                '<span style="width:10px;height:10px;border-radius:50%;background:' + statusColor + ';flex-shrink:0;"></span>' +
                '<div style="flex:1;">' +
                    '<div style="font-size:12px;font-weight:600;">' + e.name + ' <span style="font-weight:400;color:#666;">(' + e.level + ')</span></div>' +
                    '<div style="font-size:11px;color:#666;">' + e.team + ' · ' + e.area + '</div>' +
                    '<div style="font-size:11px;color:#666;">技能：' + e.skill.join('、') + '</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                    '<div style="font-size:11px;color:' + loadColor + ';font-weight:600;">工单' + e.workload + '件</div>' +
                    '<div style="font-size:10px;color:#999;">' + e.phone + '</div>' +
                '</div></div>';
        }).join('');

        Modal.show('派发工单 - ' + wo.id,
            '<div style="margin-bottom:12px;padding:10px;background:#f8fafc;border:1px solid #e0e4e8;border-radius:4px;font-size:12px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
                '<div><strong>工单：</strong>' + wo.id + '</div>' +
                '<div><strong>标题：</strong>' + wo.title + '</div>' +
                '<div><strong>地市：</strong>' + wo.city + '</div>' +
                '<div><strong>优先级：</strong>' + wo.priority + '</div>' +
                '<div><strong>用户：</strong>' + wo.userAccount + '</div>' +
                '<div><strong>类型：</strong>' + wo.type + '</div>' +
                '</div></div>' +
            '<div class="form-group"><label class="form-label">指派工程师 *（' + wo.city + '地区，按工作量排序）</label><select class="form-select" id="dispatchAssignee">' + engineerOpts + '</select></div>' +
            (engineerCards ? '<div style="margin-bottom:10px;"><div style="font-size:11px;color:#999;margin-bottom:6px;">推荐工程师：</div>' + engineerCards + '</div>' : '') +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<div class="form-group"><label class="form-label">处理时限</label><select class="form-select" id="dispatchDeadline"><option value="4">4小时</option><option value="8">8小时</option><option value="24" selected>24小时</option><option value="48">48小时</option></select></div>' +
                '<div class="form-group"><label class="form-label">派单方式</label><select class="form-select" id="dispatchMethod"><option>系统派单</option><option>电话通知</option><option>短信通知</option><option>企业微信</option></select></div>' +
            '</div>' +
            '<div class="form-group"><label class="form-label">派单备注</label><textarea class="form-input" id="dispatchNote" rows="2" placeholder="如：用户反映晚间网速慢，需携带光功率计上门检测" style="resize:vertical;"></textarea></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doDispatch(\'' + wo.id + '\')">确认派单</button>',
            '600px'
        );
    },

    doDispatch: function(woId) {
        var orders = this._getWorkOrders();
        var assignee = document.getElementById('dispatchAssignee').value;
        var method = document.getElementById('dispatchMethod').value;
        var deadline = document.getElementById('dispatchDeadline').value;
        var note = document.getElementById('dispatchNote').value;
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id === woId) {
                orders[i].assignee = assignee;
                orders[i].status = '处理中';
                orders[i].deadline = deadline + '小时';
                orders[i].dispatchMethod = method;
                orders[i].dispatchNote = note;
                orders[i].dispatchTime = new Date().toLocaleString('zh-CN');
                break;
            }
        }
        this._saveWorkOrders(orders);
        DataStore.addLog('工单派发', '工单管理', '派发工单 ' + woId + ' 至 ' + assignee + '（' + method + '）');
        Modal.close();
        Modal.toast('工单已通过' + method + '派发至 ' + assignee, 'success');
        this.renderWorkOrder(document.getElementById('page-work-order'), this._woPage);
    },

    resolveOrder: function(idx) {
        var data = this._getWorkOrders();
        if (this._woCity) data = data.filter(function(d) { return d.city === Pages._woCity; });
        if (this._woStatus) data = data.filter(function(d) { return d.status === Pages._woStatus; });
        var wo = data[idx];
        if (!wo) return;
        if (wo.status === '已解决' || wo.status === '已关闭') { Modal.toast('工单已完结', 'warning'); return; }
        var woId = wo.id;
        Modal.confirm('解决工单', '确认将工单【' + woId + '】标记为已解决？', function() {
            var orders = Pages._getWorkOrders();
            for (var i = 0; i < orders.length; i++) {
                if (orders[i].id === woId) { orders[i].status = '已解决'; orders[i].resolveTime = Math.floor(Math.random() * 20 + 1) + '小时'; break; }
            }
            Pages._saveWorkOrders(orders);
            DataStore.addLog('工单解决', '工单管理', '解决工单 ' + woId);
            Modal.toast('工单已标记为已解决', 'success');
            Pages.renderWorkOrder(document.getElementById('page-work-order'), Pages._woPage);
        });
    },

    closeOrder: function(idx) {
        var data = this._getWorkOrders();
        if (this._woCity) data = data.filter(function(d) { return d.city === Pages._woCity; });
        if (this._woStatus) data = data.filter(function(d) { return d.status === Pages._woStatus; });
        var wo = data[idx];
        if (!wo) return;
        if (wo.status === '已关闭') { Modal.toast('工单已关闭', 'warning'); return; }
        var woId = wo.id;
        Modal.confirm('关闭工单', '确认关闭工单【' + woId + '】？关闭后不可重新打开。', function() {
            var orders = Pages._getWorkOrders();
            for (var i = 0; i < orders.length; i++) {
                if (orders[i].id === woId) { orders[i].status = '已关闭'; break; }
            }
            Pages._saveWorkOrders(orders);
            DataStore.addLog('工单关闭', '工单管理', '关闭工单 ' + woId);
            Modal.toast('工单已关闭', 'success');
            Pages.renderWorkOrder(document.getElementById('page-work-order'), Pages._woPage);
        });
    },

    // ========== 工单后评估 (增强多维度分析) ==========
    renderWorkOrderEval: function(container) {
        var s = JilinData.workOrderStats;
        // Calculate city stats
        var cityStats = {};
        JilinData.workOrderList.forEach(function(wo) {
            if (!cityStats[wo.city]) cityStats[wo.city] = { total: 0, resolved: 0, closed: 0 };
            cityStats[wo.city].total++;
            if (wo.status === '已解决') cityStats[wo.city].resolved++;
            if (wo.status === '已关闭') cityStats[wo.city].closed++;
        });
        var cityRows = '';
        for (var city in cityStats) {
            var cs = cityStats[city];
            var rate = cs.total > 0 ? ((cs.resolved + cs.closed) / cs.total * 100).toFixed(1) : '0';
            var rateCls = parseFloat(rate) >= 90 ? 'status-normal' : (parseFloat(rate) >= 80 ? 'status-warning' : 'status-error');
            cityRows += '<tr><td>' + city + '</td><td>' + cs.total + '</td><td>' + cs.resolved + '</td><td>' + cs.closed + '</td><td><span class="' + rateCls + '">' + rate + '%</span></td></tr>';
        }
        // Engineer performance data
        SeededRandom.reset(20251202 + 777);
        var engineers = JilinData.engineers ? JilinData.engineers.slice(0, 10) : [];
        var perfRows = engineers.map(function(e, idx) {
            var resolved = SeededRandom.int(15, 45);
            var avgTime = SeededRandom.float(1.5, 12, 1);
            var satisfaction = SeededRandom.float(3.5, 5.0, 1);
            var satPercent = (satisfaction / 5 * 100).toFixed(0);
            var rankClass = idx === 0 ? 'gold' : (idx === 1 ? 'silver' : (idx === 2 ? 'bronze' : 'normal'));
            var satColor = satisfaction >= 4.5 ? '#27ae60' : (satisfaction >= 4.0 ? '#5b8ff9' : (satisfaction >= 3.5 ? '#f39c12' : '#e74c3c'));
            var stars = '';
            for (var si = 0; si < 5; si++) { stars += '<span class="star ' + (si < Math.round(satisfaction) ? 'filled' : '') + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></span>'; }
            return '<tr>' +
                '<td><span class="perf-rank-badge ' + rankClass + '">' + (idx + 1) + '</span></td>' +
                '<td><strong>' + e.name + '</strong></td>' +
                '<td>' + e.city + '</td>' +
                '<td>' + e.team + '</td>' +
                '<td style="font-weight:600;color:#5b8ff9;">' + resolved + '件</td>' +
                '<td>' + avgTime + 'h</td>' +
                '<td><div class="perf-bar"><div class="perf-bar-fill" style="width:' + satPercent + '%;background:' + satColor + ';"></div></div>' + satisfaction + '</td>' +
                '<td><div class="stars">' + stars + '</div></td>' +
                '</tr>';
        }).join('');
        SeededRandom.reset(20251202);

        container.innerHTML =
            '<div class="page-content">' +
            // Time Filter
            '<div class="remote-panel" style="margin-bottom:8px;"><div class="remote-form">' +
                '<div class="form-group"><label class="form-label">评估周期</label><select class="form-select" id="evalPeriod"><option value="week">近一周</option><option value="month" selected>近一月</option><option value="quarter">近一季度</option></select></div>' +
                '<div class="form-group"><label class="form-label">地市</label>' + this.cityFilterHtml('evalCity', '', '') + '</div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderWorkOrderEval(document.getElementById(\'page-work-order-eval\'))">查询</button><button class="btn" onclick="Modal.toast(\'评估报告已导出\',\'success\')">导出报告</button></div>' +
            '</div></div>' +
            // KPI Cards
            '<div class="kpi-grid">' +
                App.kpiCardHtml('工单总数', s.total, '件', 0) +
                App.kpiCardHtml('平均处理时长', s.avgProcessTime, '小时', -5.2) +
                App.kpiCardHtml('超时率', s.overdueRate, '%', -0.5) +
                App.kpiCardHtml('满意率', s.satisfactionRate, '%', 1.2) +
                App.kpiCardHtml('闭环率', ((s.completed + s.closed) / s.total * 100).toFixed(1), '%', 2.1) +
                App.kpiCardHtml('业务质量提升', Math.floor(s.completed * 0.78), '件', 3.5) +
                App.kpiCardHtml('首次解决率', '72.8', '%', 1.8) +
                App.kpiCardHtml('超时工单数', Math.max(1, Math.floor(s.total * 0.012)), '件', -0.3) +
            '</div>' +
            // Charts Row
            '<div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-top:8px;">' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">工单量与解决率趋势</span></div><div class="chart-container" id="woEvalChart"></div></div>' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">满意度评分分布</span></div><div class="chart-container" id="woSatChart"></div></div>' +
            '</div>' +
            // Engineer Performance
            '<div class="data-table-wrapper" style="margin-top:8px;"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;display:flex;justify-content:space-between;align-items:center;">工程师绩效排名<span style="font-size:11px;color:#999;font-weight:400;">基于解决工单数、处理时长及满意度综合评分</span></div>' +
            '<table class="data-table"><thead><tr><th style="width:50px;">排名</th><th>姓名</th><th>地市</th><th>团队</th><th>已解决</th><th>平均时长</th><th>满意度</th><th>评分</th></tr></thead><tbody>' + perfRows + '</tbody></table></div>' +
            // City Stats
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
                '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">各地市工单统计</div>' +
                '<table class="data-table"><thead><tr><th>地市</th><th>工单总数</th><th>已解决</th><th>已关闭</th><th>闭环率</th></tr></thead><tbody>' + cityRows + '</tbody></table></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">工单类型分布</span></div><div class="chart-container" id="woEvalPie"></div></div>' +
            '</div></div>';
        // Charts
        var dom = document.getElementById('woEvalChart');
        if (dom) {
            var chart = echarts.init(dom); App.chartInstances['woEvalChart'] = chart;
            chart.setOption({
                grid:{top:30,right:60,bottom:30,left:40}, legend:{data:['工单数','解决率'],top:0}, tooltip:{trigger:'axis'},
                xAxis:{type:'category',data:JilinData.dateRange.labels},
                yAxis:[{type:'value',name:'工单数',splitLine:{lineStyle:{color:'#f0f2f5'}}},{type:'value',name:'解决率(%)',min:85,max:100,splitLine:{show:false}}],
                series:[
                    {name:'工单数',type:'bar',data:[198,215,256,230,210,245,268,282,240,225,235,218,242,210,228,250,238],itemStyle:{color:'#5b8ff9'}},
                    {name:'解决率',type:'line',yAxisIndex:1,data:[93.5,94.2,92.8,95.1,94.5,93.8,94.8,93.2,95.5,94.0,93.5,95.2,94.8,95.0,93.8,94.5,94.2],smooth:true,itemStyle:{color:'#5ad8a6'}}
                ]
            });
            window.addEventListener('resize',function(){chart.resize();});
        }
        // Satisfaction Distribution
        var satDom = document.getElementById('woSatChart');
        if (satDom) {
            var satChart = echarts.init(satDom); App.chartInstances['woSatChart'] = satChart;
            satChart.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 20, right: 20, bottom: 30, left: 40 },
                xAxis: { type: 'category', data: ['1星', '2星', '3星', '4星', '5星'], axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value', name: '工单数', splitLine: { lineStyle: { color: '#f0f2f5' } } },
                series: [{
                    type: 'bar', barWidth: '50%',
                    data: [
                        { value: 8, itemStyle: { color: '#e74c3c' } },
                        { value: 15, itemStyle: { color: '#f39c12' } },
                        { value: 42, itemStyle: { color: '#f6bd16' } },
                        { value: 128, itemStyle: { color: '#5b8ff9' } },
                        { value: 265, itemStyle: { color: '#27ae60' } }
                    ],
                    label: { show: true, position: 'top', fontSize: 10 }
                }]
            });
            window.addEventListener('resize',function(){satChart.resize();});
        }
        var pie = document.getElementById('woEvalPie');
        if (pie) {
            var c2 = echarts.init(pie); App.chartInstances['woEvalPie'] = c2;
            var typeMap = {};
            JilinData.workOrderList.forEach(function(wo) { typeMap[wo.type] = (typeMap[wo.type] || 0) + 1; });
            var pieData = [];
            for (var t in typeMap) pieData.push({ name: t, value: typeMap[t] });
            c2.setOption({ tooltip:{trigger:'item',formatter:'{b}: {c}件 ({d}%)'}, series:[{type:'pie',radius:['30%','60%'],center:['50%','55%'],data:pieData,label:{fontSize:10}}] });
            window.addEventListener('resize',function(){c2.resize();});
        }
    },

    // ========== 用户管理 (完整CRUD) ==========
    _umPage: 1, _umKeyword: '',
    renderUserManagement: function(container, page) {
        this._umPage = page || 1;
        var users = DataStore.query('users', this._umKeyword ? { _keyword: this._umKeyword } : null);
        var p = this.paginate(users, this._umPage, 10);
        var rows = p.data.map(function(r) {
            var statusCls = r.status === '启用' ? 'status-normal' : 'status-warning';
            var toggleBtn = r.status === '启用'
                ? '<a style="color:#e74c3c;cursor:pointer;" onclick="Pages.toggleUserStatus(\'' + r._id + '\',\'禁用\')">禁用</a>'
                : '<a style="color:#27ae60;cursor:pointer;" onclick="Pages.toggleUserStatus(\'' + r._id + '\',\'启用\')">启用</a>';
            return '<tr><td>' + (r.id || r._id) + '</td><td>' + r.username + '</td><td>' + r.realName + '</td><td>' + r.role + '</td><td>' + r.city + '</td><td>' + r.department + '</td><td><span class="' + statusCls + '">' + r.status + '</span></td><td>' + (r.lastLogin || '-') + '</td><td>' +
                '<a style="color:#2b7de9;cursor:pointer;margin-right:8px;" onclick="Pages.editUser(\'' + r._id + '\')">编辑</a>' +
                '<a style="color:#9b59b6;cursor:pointer;margin-right:8px;" onclick="Pages.resetUserPwd(\'' + r._id + '\')">重置密码</a>' +
                toggleBtn +
                ' | <a style="color:#e74c3c;cursor:pointer;margin-left:8px;" onclick="Pages.deleteUser(\'' + r._id + '\')">删除</a></td></tr>';
        }).join('');
        container.innerHTML =
            '<div class="page-content"><div class="system-panel"><div class="system-panel-header"><span class="system-panel-title">用户账号管理</span>' +
            '<div style="display:flex;gap:8px;align-items:center;"><input class="form-input" style="width:180px;" placeholder="搜索用户名/姓名..." id="umSearchInput" value="' + (this._umKeyword || '') + '" onkeyup="if(event.keyCode===13)Pages.searchUsers()">' +
            '<button class="btn" onclick="Pages.searchUsers()">搜索</button>' +
            '<button class="btn btn-primary" onclick="Pages.showAddUser()">+ 新增用户</button></div></div>' +
            '<div class="system-panel-body"><table class="data-table"><thead><tr><th>用户ID</th><th>用户名</th><th>姓名</th><th>角色</th><th>所属地市</th><th>部门</th><th>状态</th><th>最后登录</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderUserManagement.bind(Pages,document.getElementById("page-user-management"))') +
            '</div></div></div>';
    },

    searchUsers: function() {
        var input = document.getElementById('umSearchInput');
        this._umKeyword = input ? input.value.trim() : '';
        this.renderUserManagement(document.getElementById('page-user-management'), 1);
    },

    showAddUser: function() {
        var cityOpts = '<option value="全省">全省</option>';
        JilinData.cities.forEach(function(c) { cityOpts += '<option value="' + c + '">' + c + '</option>'; });
        Modal.show('新增用户',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div class="form-group"><label class="form-label">用户名 *</label><input class="form-input" id="addUserName" placeholder="请输入用户名"></div>' +
            '<div class="form-group"><label class="form-label">姓名 *</label><input class="form-input" id="addRealName" placeholder="请输入姓名"></div>' +
            '<div class="form-group"><label class="form-label">角色 *</label><select class="form-select" id="addRole"><option>系统管理员</option><option>地市管理员</option><option>运维人员</option><option>只读用户</option></select></div>' +
            '<div class="form-group"><label class="form-label">所属地市 *</label><select class="form-select" id="addCity">' + cityOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">部门</label><input class="form-input" id="addDept" placeholder="请输入部门"></div>' +
            '<div class="form-group"><label class="form-label">手机号</label><input class="form-input" id="addPhone" placeholder="请输入手机号"></div>' +
            '<div class="form-group" style="grid-column:span 2;"><label class="form-label">邮箱</label><input class="form-input" id="addEmail" placeholder="请输入邮箱"></div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doAddUser()">确定新增</button>'
        );
    },

    doAddUser: function() {
        var username = document.getElementById('addUserName').value.trim();
        var realName = document.getElementById('addRealName').value.trim();
        if (!username || !realName) { Modal.toast('请填写用户名和姓名', 'warning'); return; }
        var existing = DataStore.query('users', { username: username });
        if (existing.length > 0) { Modal.toast('用户名已存在', 'error'); return; }
        DataStore.add('users', {
            id: String(DataStore.load('users').length + 1).padStart(3, '0'),
            username: username,
            realName: realName,
            role: document.getElementById('addRole').value,
            city: document.getElementById('addCity').value,
            department: document.getElementById('addDept').value || '未分配',
            phone: document.getElementById('addPhone').value || '',
            email: document.getElementById('addEmail').value || '',
            status: '启用',
            lastLogin: '-',
            loginCount: 0
        });
        Modal.close();
        Modal.toast('用户创建成功', 'success');
        this.renderUserManagement(document.getElementById('page-user-management'), 1);
    },

    editUser: function(id) {
        var users = DataStore.load('users');
        var user = null;
        for (var i = 0; i < users.length; i++) { if (users[i]._id === id) { user = users[i]; break; } }
        if (!user) return;
        var cityOpts = '';
        ['全省'].concat(JilinData.cities).forEach(function(c) { cityOpts += '<option value="' + c + '"' + (c === user.city ? ' selected' : '') + '>' + c + '</option>'; });
        var roleOpts = '';
        ['系统管理员','地市管理员','运维人员','只读用户'].forEach(function(r) { roleOpts += '<option' + (r === user.role ? ' selected' : '') + '>' + r + '</option>'; });
        Modal.show('编辑用户 - ' + user.username,
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div class="form-group"><label class="form-label">用户名</label><input class="form-input" id="editUserName" value="' + user.username + '" disabled style="background:#f5f5f5;"></div>' +
            '<div class="form-group"><label class="form-label">姓名</label><input class="form-input" id="editRealName" value="' + user.realName + '"></div>' +
            '<div class="form-group"><label class="form-label">角色</label><select class="form-select" id="editRole">' + roleOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">所属地市</label><select class="form-select" id="editCity">' + cityOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">部门</label><input class="form-input" id="editDept" value="' + (user.department || '') + '"></div>' +
            '<div class="form-group"><label class="form-label">手机号</label><input class="form-input" id="editPhone" value="' + (user.phone || '') + '"></div>' +
            '<div class="form-group" style="grid-column:span 2;"><label class="form-label">邮箱</label><input class="form-input" id="editEmail" value="' + (user.email || '') + '"></div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doEditUser(\'' + id + '\')">保存修改</button>'
        );
    },

    doEditUser: function(id) {
        DataStore.update('users', id, {
            realName: document.getElementById('editRealName').value.trim(),
            role: document.getElementById('editRole').value,
            city: document.getElementById('editCity').value,
            department: document.getElementById('editDept').value,
            phone: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value
        });
        Modal.close();
        Modal.toast('用户信息已更新', 'success');
        this.renderUserManagement(document.getElementById('page-user-management'), this._umPage);
    },

    toggleUserStatus: function(id, newStatus) {
        Modal.confirm('确认操作', '确定要将该用户状态设置为【' + newStatus + '】吗？', function() {
            DataStore.update('users', id, { status: newStatus });
            Modal.toast('用户状态已更新为: ' + newStatus, 'success');
            Pages.renderUserManagement(document.getElementById('page-user-management'), Pages._umPage);
        });
    },

    resetUserPwd: function(id) {
        Modal.confirm('重置密码', '确定要重置该用户的登录密码吗？重置后密码为默认密码 Abc@123456', function() {
            DataStore.addLog('重置密码', '用户管理', '重置用户 ' + id + ' 的登录密码');
            Modal.toast('密码已重置为: Abc@123456', 'success');
        });
    },

    deleteUser: function(id) {
        Modal.confirm('删除用户', '确定要删除该用户吗？此操作不可恢复！', function() {
            DataStore.remove('users', id);
            Modal.toast('用户已删除', 'success');
            Pages.renderUserManagement(document.getElementById('page-user-management'), 1);
        });
    },

    // ========== 日志管理 (完整搜索/分页/导出) ==========
    _logPage: 1, _logModule: '', _logKeyword: '',
    renderLogManagement: async function(container, page) {
        this._logPage = page || 1;
        var useApi = window.API && API.logs;
        var resp = useApi ? await API.logs({
            page: this._logPage,
            pageSize: 12,
            module: this._logModule || '',
            username: this._logKeyword || ''
        }) : null;
        var logs = resp && resp.data ? resp.data : DataStore.load('logs', []);
        if (!useApi && this._logModule) logs = logs.filter(function(l) { return l.module === Pages._logModule; });
        if (!useApi && this._logKeyword) {
            var kw = this._logKeyword.toLowerCase();
            logs = logs.filter(function(l) {
                return (l.operator || '').toLowerCase().indexOf(kw) >= 0 ||
                       (l.content || '').toLowerCase().indexOf(kw) >= 0 ||
                       (l.action || '').toLowerCase().indexOf(kw) >= 0;
            });
        }
        var p = useApi && resp && resp.pagination ? resp.pagination : this.paginate(logs, this._logPage, 12);
        var pageRows = useApi ? logs : p.data;
        var rows = pageRows.map(function(r) {
            var resCls = r.result === '成功' ? 'status-normal' : 'status-error';
            var actor = r.operator || r.username || '-';
            var ip = r.ip || r.ip_address || '-';
            var content = r.content || r.description || '-';
            return '<tr><td>' + (r.time || r.created_at || '-') + '</td><td>' + actor + '</td><td>' + ip + '</td><td>' + (r.module || '-') + '</td><td>' + (r.action || '-') + '</td><td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + content + '">' + content + '</td><td><span class="' + resCls + '">' + (r.result || '成功') + '</span></td></tr>';
        }).join('');
        var moduleOpts = '<option value="">全部模块</option>';
        ['远程操作','质量画像','工单管理','系统管理','用户管理','配置中心','质差识别','全景视图'].forEach(function(m) {
            moduleOpts += '<option value="' + m + '"' + (m === Pages._logModule ? ' selected' : '') + '>' + m + '</option>';
        });
        container.innerHTML =
            '<div class="page-content"><div class="system-panel"><div class="system-panel-header"><span class="system-panel-title">操作日志管理</span>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
            '<select class="form-select" style="width:120px;" id="logModuleFilter" onchange="Pages._logModule=this.value;Pages.renderLogManagement(document.getElementById(\'page-log-management\'),1)">' + moduleOpts + '</select>' +
            '<input class="form-input" style="width:180px;" placeholder="搜索操作人/内容..." id="logSearchInput" value="' + (this._logKeyword || '') + '" onkeyup="if(event.keyCode===13)Pages.searchLogs()">' +
            '<button class="btn btn-primary" onclick="Pages.searchLogs()">搜索</button>' +
            '<button class="btn" onclick="Pages.exportLogs()">导出</button>' +
            '<button class="btn" onclick="Pages.clearLogs()">清空日志</button></div></div>' +
            '<div class="system-panel-body"><div style="margin-bottom:8px;font-size:12px;color:#999;">共 ' + (p.total || logs.length) + ' 条日志记录</div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>操作人</th><th>IP地址</th><th>模块</th><th>操作类型</th><th>操作内容</th><th>结果</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderLogManagement.bind(Pages,document.getElementById("page-log-management"))') +
            '</div></div></div>';
    },

    searchLogs: function() {
        var input = document.getElementById('logSearchInput');
        this._logKeyword = input ? input.value.trim() : '';
        this.renderLogManagement(document.getElementById('page-log-management'), 1);
    },

    exportLogs: function() {
        var logs = DataStore.load('logs', []);
        var csv = '时间,操作人,IP地址,模块,操作类型,操作内容,结果\n';
        logs.forEach(function(l) {
            csv += [l.time, l.operator, l.ip, l.module, l.action, l.content, l.result].join(',') + '\n';
        });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '操作日志_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('日志导出成功', 'success');
    },

    clearLogs: function() {
        Modal.confirm('清空日志', '确定要清空所有操作日志吗？此操作不可恢复！', function() {
            DataStore.save('logs', []);
            Modal.toast('日志已清空', 'success');
            Pages.renderLogManagement(document.getElementById('page-log-management'), 1);
        });
    },

    // ========== 配置中心 (完整CRUD) ==========
    _cfgCategory: '',
    renderConfigCenter: function(container) {
        var configs = DataStore.load('configs', []);
        if (this._cfgCategory) configs = configs.filter(function(c) { return c.category === Pages._cfgCategory; });
        // 按分类分组
        var groups = {};
        configs.forEach(function(c) { if (!groups[c.category]) groups[c.category] = []; groups[c.category].push(c); });
        var categoryOpts = '<option value="">全部分类</option>';
        var allCats = {};
        DataStore.load('configs', []).forEach(function(c) { allCats[c.category] = 1; });
        for (var cat in allCats) { categoryOpts += '<option value="' + cat + '"' + (cat === Pages._cfgCategory ? ' selected' : '') + '>' + cat + '</option>'; }

        var tableRows = '';
        for (var g in groups) {
            groups[g].forEach(function(r, idx) {
                tableRows += '<tr>' +
                    (idx === 0 ? '<td rowspan="' + groups[g].length + '" style="font-weight:600;background:#f8fafc;vertical-align:middle;">' + g + '</td>' : '') +
                    '<td>' + r.name + '</td><td><code style="background:#f0f5ff;padding:2px 8px;border-radius:2px;color:#2b7de9;">' + r.value + (r.unit ? ' ' + r.unit : '') + '</code></td><td style="color:#666;max-width:250px;">' + r.desc + '</td><td>' + (r.updatedBy || '-') + '</td><td>' + (r.updatedAt || '-') + '</td>' +
                    '<td><a style="color:#2b7de9;cursor:pointer;margin-right:8px;" onclick="Pages.editConfig(\'' + r._id + '\')">编辑</a><a style="color:#e74c3c;cursor:pointer;" onclick="Pages.deleteConfig(\'' + r._id + '\')">删除</a></td></tr>';
            });
        }
        container.innerHTML =
            '<div class="page-content"><div class="system-panel"><div class="system-panel-header"><span class="system-panel-title">配置中心</span>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
            '<select class="form-select" style="width:130px;" onchange="Pages._cfgCategory=this.value;Pages.renderConfigCenter(document.getElementById(\'page-config-center\'))">' + categoryOpts + '</select>' +
            '<button class="btn btn-primary" onclick="Pages.showAddConfig()">+ 新增配置</button></div></div>' +
            '<div class="system-panel-body"><table class="data-table"><thead><tr><th style="width:100px;">分类</th><th>配置项</th><th>配置值</th><th>说明</th><th>修改人</th><th>修改时间</th><th style="width:100px;">操作</th></tr></thead><tbody>' + tableRows + '</tbody></table></div></div></div>';
    },

    showAddConfig: function() {
        Modal.show('新增配置项',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div class="form-group"><label class="form-label">分类 *</label><input class="form-input" id="cfgCategory" placeholder="如：质差阈值、工单规则"></div>' +
            '<div class="form-group"><label class="form-label">配置名称 *</label><input class="form-input" id="cfgName" placeholder="请输入配置名称"></div>' +
            '<div class="form-group"><label class="form-label">配置值 *</label><input class="form-input" id="cfgValue" placeholder="请输入配置值"></div>' +
            '<div class="form-group"><label class="form-label">单位</label><input class="form-input" id="cfgUnit" placeholder="如：分、ms、%"></div>' +
            '<div class="form-group" style="grid-column:span 2;"><label class="form-label">说明</label><input class="form-input" id="cfgDesc" placeholder="请输入配置说明"></div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doAddConfig()">确定新增</button>'
        );
    },

    doAddConfig: function() {
        var category = document.getElementById('cfgCategory').value.trim();
        var name = document.getElementById('cfgName').value.trim();
        var value = document.getElementById('cfgValue').value.trim();
        if (!category || !name || !value) { Modal.toast('请填写必填项', 'warning'); return; }
        DataStore.add('configs', {
            category: category,
            key: name.replace(/[\s\/]/g, '_').toLowerCase(),
            name: name,
            value: value,
            unit: document.getElementById('cfgUnit').value.trim(),
            desc: document.getElementById('cfgDesc').value.trim(),
            updatedBy: DataStore._currentUser,
            updatedAt: new Date().toLocaleString('zh-CN')
        });
        Modal.close();
        Modal.toast('配置项已新增', 'success');
        this.renderConfigCenter(document.getElementById('page-config-center'));
    },

    editConfig: function(id) {
        var configs = DataStore.load('configs', []);
        var cfg = null;
        for (var i = 0; i < configs.length; i++) { if (configs[i]._id === id) { cfg = configs[i]; break; } }
        if (!cfg) return;
        Modal.show('编辑配置 - ' + cfg.name,
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div class="form-group"><label class="form-label">分类</label><input class="form-input" id="editCfgCategory" value="' + cfg.category + '"></div>' +
            '<div class="form-group"><label class="form-label">配置名称</label><input class="form-input" id="editCfgName" value="' + cfg.name + '"></div>' +
            '<div class="form-group"><label class="form-label">配置值 *</label><input class="form-input" id="editCfgValue" value="' + cfg.value + '"></div>' +
            '<div class="form-group"><label class="form-label">单位</label><input class="form-input" id="editCfgUnit" value="' + (cfg.unit || '') + '"></div>' +
            '<div class="form-group" style="grid-column:span 2;"><label class="form-label">说明</label><input class="form-input" id="editCfgDesc" value="' + (cfg.desc || '') + '"></div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doEditConfig(\'' + id + '\')">保存修改</button>'
        );
    },

    doEditConfig: function(id) {
        var oldCfg = DataStore.load('configs', []).find(function(c) { return c._id === id; });
        var newValue = document.getElementById('editCfgValue').value.trim();
        if (!newValue) { Modal.toast('配置值不能为空', 'warning'); return; }
        DataStore.update('configs', id, {
            category: document.getElementById('editCfgCategory').value.trim(),
            name: document.getElementById('editCfgName').value.trim(),
            value: newValue,
            unit: document.getElementById('editCfgUnit').value.trim(),
            desc: document.getElementById('editCfgDesc').value.trim(),
            updatedBy: DataStore._currentUser,
            updatedAt: new Date().toLocaleString('zh-CN')
        });
        if (oldCfg) DataStore.addLog('修改配置', '配置中心', '修改' + oldCfg.name + '从"' + oldCfg.value + '"为"' + newValue + '"');
        Modal.close();
        Modal.toast('配置已更新', 'success');
        this.renderConfigCenter(document.getElementById('page-config-center'));
    },

    deleteConfig: function(id) {
        Modal.confirm('删除配置', '确定要删除该配置项吗？', function() {
            DataStore.remove('configs', id);
            Modal.toast('配置项已删除', 'success');
            Pages.renderConfigCenter(document.getElementById('page-config-center'));
        });
    },

    // ========== 首页驾驶舱 ==========
    renderHome: function(container) {
        var d = JilinData.dashboardData;
        var m = JilinData.kpiMetrics;
        var s = JilinData.workOrderStats;
        // Generate alert ticker items
        var alerts = [
            { time: '14:28', level: 'critical', text: 'OLT-CC-0012 端口3光功率异常，接收功率 -27.5dBm，影响用户32户' },
            { time: '14:15', level: 'major', text: 'BRAS-JL-02 CPU利用率达89%，建议关注负载均衡' },
            { time: '14:02', level: 'minor', text: '长春朝阳区用户JL20250128 CEI评分降至62分，触发质差预警' },
            { time: '13:48', level: 'critical', text: '松原前郭光缆中断告警，影响OLT设备3台，用户约1200户' },
            { time: '13:35', level: 'major', text: '延边州IPTV卡顿率上升至4.2%，超出阈值(2%)' },
            { time: '13:22', level: 'minor', text: '白山临江网关GW-BS-00128离线超过30分钟' },
            { time: '13:10', level: 'major', text: '通化梅河口OLT-TH-0008端口利用率95%，建议扩容' },
            { time: '12:55', level: 'critical', text: '四平公主岭传输链路丢包率8.5%，影响下游580用户' }
        ];
        var tickerHtml = alerts.map(function(a) {
            return '<span class="alert-ticker-item"><span class="ticker-time">' + a.time + '</span><span class="ticker-level ' + a.level + '">' + (a.level === 'critical' ? '紧急' : (a.level === 'major' ? '重要' : '一般')) + '</span>' + a.text + '</span>';
        }).join('');
        // Duplicate for seamless scroll
        tickerHtml = tickerHtml + tickerHtml;

        container.innerHTML =
            '<div class="page-content">' +
            // Dashboard Header
            '<div class="dashboard-header-enhanced">' +
                '<div class="dashboard-title-area">' +
                    '<h2 class="dashboard-title-enhanced">家宽网络质量运营驾驶舱</h2>' +
                    '<div class="dashboard-time-badge"><span class="live-dot"></span>实时监控中</div>' +
                '</div>' +
                '<div class="dashboard-actions">' +
                    '<div class="refresh-timer"><span>自动刷新</span><div class="refresh-timer-progress"><div class="refresh-timer-fill"></div></div></div>' +
                    '<button class="btn" onclick="loadPageContent(\'home\')"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg> 刷新</button>' +
                    '<button class="btn" onclick="Modal.toast(\'全屏模式开发中\',\'info\')"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg> 全屏</button>' +
                '</div>' +
            '</div>' +
            // Alert Ticker
            '<div class="alert-ticker">' +
                '<div class="alert-ticker-label"><span class="ticker-dot"></span>实时告警</div>' +
                '<div class="alert-ticker-content"><div class="alert-ticker-scroll">' + tickerHtml + '</div></div>' +
            '</div>' +
            // Enhanced KPI Row
            '<div class="dash-kpi-row-enhanced">' +
                '<div class="dash-kpi-enhanced"><div class="dke-header"><span class="dke-label">宽带用户总数</span><div class="dke-icon" style="background:rgba(91,143,249,0.1);color:#5b8ff9;">' + ICO.antenna + '</div></div><div class="dke-value">' + m.totalBroadbandUsers + '<span>万</span></div><div class="dke-footer"><span class="dke-trend up">↑ 0.3% 环比</span><span class="dke-compare">较昨日 +856户</span></div></div>' +
                '<div class="dash-kpi-enhanced"><div class="dke-header"><span class="dke-label">综合CEI评分</span><div class="dke-icon" style="background:rgba(90,216,166,0.1);color:#5ad8a6;">' + ICO.chart + '</div></div><div class="dke-value">' + m.totalCeiScore + '<span>分</span></div><div class="dke-footer"><span class="dke-trend up">↑ 0.5 环比</span><span class="dke-compare">目标 ≥93</span></div></div>' +
                '<div class="dash-kpi-enhanced"><div class="dke-header"><span class="dke-label">平均下载速率</span><div class="dke-icon" style="background:rgba(246,189,22,0.1);color:#f6bd16;">' + ICO.bolt + '</div></div><div class="dke-value">' + m.avgDownloadSpeed + '<span>Mbps</span></div><div class="dke-footer"><span class="dke-trend up">↑ 2.1%</span><span class="dke-compare">100M达标率 98.5%</span></div></div>' +
                '<div class="dash-kpi-enhanced"><div class="dke-header"><span class="dke-label">今日告警</span><div class="dke-icon" style="background:rgba(231,76,60,0.1);color:#e74c3c;">' + ICO.bell + '</div></div><div class="dke-value">' + d.todayAlerts + '<span>条</span></div><div class="dke-footer"><span class="dke-trend down">↓ 5.2% 环比</span><span class="dke-compare">紧急 ' + Math.floor(d.todayAlerts * 0.12) + ' / 重要 ' + Math.floor(d.todayAlerts * 0.35) + '</span></div></div>' +
                '<div class="dash-kpi-enhanced"><div class="dke-header"><span class="dke-label">待处理工单</span><div class="dke-icon" style="background:rgba(155,89,182,0.1);color:#9b59b6;">' + ICO.clipboard + '</div></div><div class="dke-value">' + s.pending + '<span>件</span></div><div class="dke-footer"><span class="dke-trend down">↓ 3件</span><span class="dke-compare">' + (s.pending > 0 ? '<span class="overdue-badge">超时 ' + Math.max(1, Math.floor(s.pending * 0.1)) + '</span>' : '无超时') + '</span></div></div>' +
                '<div class="dash-kpi-enhanced"><div class="dke-header"><span class="dke-label">网络健康度</span><div class="dke-icon" style="background:rgba(26,188,156,0.1);color:#1abc9c;">' + ICO.heart + '</div></div><div class="dke-value">' + d.networkHealth + '<span>%</span></div><div class="dke-footer"><span class="dke-trend up">↑ 0.8%</span><span class="dke-compare">较上周提升</span></div></div>' +
            '</div>' +
            // System Status Strip
            '<div class="sys-status-strip">' +
                '<div class="sys-status-item"><span class="sys-status-dot online"></span>应用服务器 <span class="sys-status-value">正常</span></div>' +
                '<div class="sys-status-item"><span class="sys-status-dot online"></span>数据库 <span class="sys-status-value">正常</span> <span style="color:#999;">延迟 2ms</span></div>' +
                '<div class="sys-status-item"><span class="sys-status-dot online"></span>Redis缓存 <span class="sys-status-value">正常</span> <span style="color:#999;">命中率 97.8%</span></div>' +
                '<div class="sys-status-item"><span class="sys-status-dot online"></span>采集服务 <span class="sys-status-value">运行中</span></div>' +
                '<div class="sys-status-item"><span class="sys-status-dot warning"></span>Kafka队列 <span class="sys-status-value" style="color:#f39c12;">积压 1.2k</span></div>' +
                '<div style="margin-left:auto;display:flex;align-items:center;gap:6px;"><span style="color:#999;">在线用户</span><span class="sys-status-value">23</span><span style="color:#999;margin-left:12px;">今日访问</span><span class="sys-status-value">158</span></div>' +
            '</div>' +
            // Quick Actions
            '<div class="quick-actions">' +
                '<div class="quick-action" onclick="loadPageContent(\'cei-query\')"><div class="quick-action-icon" style="color:#5b8ff9;">' + ICO.search + '</div><div class="quick-action-label">CEI查询</div></div>' +
                '<div class="quick-action" onclick="loadPageContent(\'work-order\')"><div class="quick-action-icon" style="color:#9b59b6;">' + ICO.clipboard + '</div><div class="quick-action-label">工单管理</div></div>' +
                '<div class="quick-action" onclick="loadPageContent(\'user-quality\')"><div class="quick-action-icon" style="color:#e74c3c;">' + ICO.user + '</div><div class="quick-action-label">质差用户</div></div>' +
                '<div class="quick-action" onclick="loadPageContent(\'gis-view\')"><div class="quick-action-icon" style="color:#27ae60;">' + ICO.map + '</div><div class="quick-action-label">GIS视图</div></div>' +
                '<div class="quick-action" onclick="loadPageContent(\'quality-model\')"><div class="quick-action-icon" style="color:#2b7de9;">' + ICO.robot + '</div><div class="quick-action-label">质差模型</div></div>' +
                '<div class="quick-action" onclick="loadPageContent(\'dpi-capture\')"><div class="quick-action-icon" style="color:#f39c12;">' + ICO.antenna + '</div><div class="quick-action-label">DPI抓包</div></div>' +
                '<div class="quick-action" onclick="loadPageContent(\'ping-test\')"><div class="quick-action-icon" style="color:#1abc9c;">' + ICO.wrench + '</div><div class="quick-action-label">PING测试</div></div>' +
                '<div class="quick-action" onclick="loadPageContent(\'pon-power\')"><div class="quick-action-icon" style="color:#f6bd16;">' + ICO.bulb + '</div><div class="quick-action-label">光功率异常</div></div>' +
            '</div>' +
            // Charts Row 1
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">CEI评分趋势</span></div><div class="chart-container" id="homeChart1"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">各地市CEI排名</span></div><div class="chart-container" id="homeChart2"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">业务类型分布</span></div><div class="chart-container" id="homeChart3"></div></div>' +
            '</div>' +
            // Charts Row 2
            '<div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;">' +
                '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">24小时告警趋势</span></div><div class="chart-container" id="homeChart4"></div></div>' +
                '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">质差类型TOP5</span></div><div class="chart-container" id="homeChart5"></div></div>' +
            '</div></div>';
        this.initHomeCharts();
    },

    initHomeCharts: function() {
        var d = JilinData.dashboardData;
        // CEI趋势
        var h1 = document.getElementById('homeChart1');
        if (h1) {
            var c1 = echarts.init(h1); App.chartInstances['homeChart1'] = c1;
            var t = JilinData.ceiTrendData;
            c1.setOption({ grid:{top:30,right:15,bottom:25,left:35}, tooltip:{trigger:'axis'}, legend:{data:['综合','业务','网络'],top:0,textStyle:{fontSize:10}},
                xAxis:{type:'category',data:t.labels,axisLabel:{fontSize:9}}, yAxis:{type:'value',min:89,max:95,axisLabel:{fontSize:9},splitLine:{lineStyle:{color:'#f0f2f5'}}},
                series:[{name:'综合',type:'line',data:t.overall,smooth:true,lineStyle:{width:2},itemStyle:{color:'#5b8ff9'}},{name:'业务',type:'line',data:t.business,smooth:true,lineStyle:{width:2},itemStyle:{color:'#5ad8a6'}},{name:'网络',type:'line',data:t.network,smooth:true,lineStyle:{width:2},itemStyle:{color:'#f6bd16'}}]
            });
            window.addEventListener('resize',function(){c1.resize();});
        }
        // 地市排名
        var h2 = document.getElementById('homeChart2');
        if (h2) {
            var c2 = echarts.init(h2); App.chartInstances['homeChart2'] = c2;
            var ranking = d.cityRanking;
            c2.setOption({ grid:{top:10,right:40,bottom:10,left:60}, tooltip:{trigger:'axis'},
                yAxis:{type:'category',data:ranking.map(function(r){return r.city;}).reverse(),axisLabel:{fontSize:10}},
                xAxis:{type:'value',min:89,max:95},
                series:[{type:'bar',data:ranking.map(function(r){return r.ceiScore;}).reverse(),barWidth:'50%',itemStyle:{color:function(p){return p.value>=93?'#27ae60':(p.value>=91?'#f39c12':'#e74c3c');}},label:{show:true,position:'right',fontSize:9}}]
            });
            window.addEventListener('resize',function(){c2.resize();});
        }
        // 业务分布
        var h3 = document.getElementById('homeChart3');
        if (h3) {
            var c3 = echarts.init(h3); App.chartInstances['homeChart3'] = c3;
            c3.setOption({ tooltip:{trigger:'item',formatter:'{b}: {c} ({d}%)'}, series:[{type:'pie',radius:['35%','60%'],center:['50%','55%'],data:d.bizDistribution,label:{fontSize:10},itemStyle:{borderRadius:4}}] });
            window.addEventListener('resize',function(){c3.resize();});
        }
        // 告警趋势
        var h4 = document.getElementById('homeChart4');
        if (h4) {
            var c4 = echarts.init(h4); App.chartInstances['homeChart4'] = c4;
            c4.setOption({ grid:{top:15,right:15,bottom:25,left:35}, tooltip:{trigger:'axis'},
                xAxis:{type:'category',data:d.alertTrend.map(function(a){return a.hour;}),axisLabel:{fontSize:9}},
                yAxis:{type:'value',axisLabel:{fontSize:9},splitLine:{lineStyle:{color:'#f0f2f5'}}},
                series:[{type:'bar',data:d.alertTrend.map(function(a){return a.count;}),itemStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'#5b8ff9'},{offset:1,color:'#b8d4fe'}]}}}]
            });
            window.addEventListener('resize',function(){c4.resize();});
        }
        // 质差TOP5
        var h5 = document.getElementById('homeChart5');
        if (h5) {
            var c5 = echarts.init(h5); App.chartInstances['homeChart5'] = c5;
            var rs = JilinData.qualityTop5Reasons;
            c5.setOption({ grid:{top:10,right:40,bottom:10,left:70}, tooltip:{trigger:'axis'},
                yAxis:{type:'category',data:rs.map(function(r){return r.reason;}).reverse(),axisLabel:{fontSize:10}},
                xAxis:{type:'value'},
                series:[{type:'bar',data:rs.map(function(r){return r.count;}).reverse(),barWidth:'50%',itemStyle:{color:'#f39c12'},label:{show:true,position:'right',fontSize:9}}]
            });
            window.addEventListener('resize',function(){c5.resize();});
        }
    },

    // ========== 业务CEI定界（拆分页面） ==========
    renderBizCeiBoundary: function(container) {
        var sides = [
            { name: '家庭侧', value: 32.8, color: '#5ad8a6', reasons: ['WiFi信号弱', '网关CPU高', '终端兼容性差', '组网不合理', '带宽不足'] },
            { name: '网络侧', value: 45.2, color: '#5b8ff9', reasons: ['OLT上行拥塞', 'BRAS负载高', '传输链路抖动', '路由环路', '光衰过大'] },
            { name: '内容侧', value: 15.5, color: '#f6bd16', reasons: ['CDN节点异常', '源站响应慢', 'DNS劫持', '内容限速', '证书过期'] },
            { name: '其他', value: 6.5, color: '#bdc3c7', reasons: ['未知原因', '设备兼容', '策略配置'] }
        ];
        var topReasons = [
            { name: '视频卡顿', count: 856, pct: 22.5 },
            { name: '下载速率低', count: 698, pct: 18.3 },
            { name: '游戏高时延', count: 523, pct: 13.7 },
            { name: '网页加载慢', count: 412, pct: 10.8 },
            { name: '直播缓冲长', count: 356, pct: 9.3 }
        ];
        // 生成表格数据
        var tableRows = '';
        for (var i = 0; i < 15; i++) {
            var city = SeededRandom.pick(JilinData.cities);
            var side = SeededRandom.pick(sides);
            var reason = SeededRandom.pick(topReasons);
            var cei = SeededRandom.float(48, 82, 1);
            var ceiCls = cei < 60 ? 'status-error' : (cei < 75 ? 'status-warning' : 'status-normal');
            tableRows += '<tr><td>JL' + (20250000 + SeededRandom.int(1, 500)) + '</td><td>' + city + '</td><td><span style="padding:2px 8px;background:' + side.color + '22;color:' + side.color + ';border-radius:10px;font-size:11px;font-weight:600;">' + side.name + '</span></td><td>' + reason.name + '</td><td><span class="' + ceiCls + '">' + cei + '</span></td><td>' + SeededRandom.float(15, 85, 1) + 'ms</td><td>' + Pages.statusHtml(SeededRandom.pick(['紧急', '一般', '告警'])) + '</td><td>' + SeededRandom.date('2025-12-01', '2025-12-02') + '</td><td><a style="color:#2b7de9;cursor:pointer;" onclick="Pages._showBizBoundaryDetail(\'' + city + '\')">详情</a> <a style="color:#27ae60;cursor:pointer;margin-left:6px;" onclick="Pages.showCreateOrderFromQl(\'JL' + (20250000 + i) + '\',\'' + reason.name + '\')">派单</a></td></tr>';
        }

        container.innerHTML =
            '<div class="page-content">' +
            '<div class="remote-panel"><div class="remote-panel-title">' + ICO.chart + ' 业务CEI定界分析</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('bizBdCity', '', '') +
            '<div class="form-group"><label class="form-label">用户账号/IP</label><input class="form-input" id="bizBdAccount" placeholder="输入用户账号或IP"></div>' +
            '<div class="form-group"><label class="form-label">时间范围</label><input class="form-input" type="date" value="2025-12-02"></div>' +
            '<div class="form-group"><label class="form-label">业务类型</label><select class="form-select"><option value="">全部</option><option>宽带上网</option><option>IPTV</option><option>在线游戏</option><option>视频通话</option></select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderBizCeiBoundary(document.getElementById(\'page-biz-cei-boundary\'))">定界查询</button><button class="btn" onclick="Modal.toast(\'定界报告已导出\',\'success\')">导出报告</button></div></div></div>' +
            '<div style="margin-bottom:8px;padding:10px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;"><strong>业务CEI定界说明：</strong>基于用户业务体验指标(视频卡顿率、HTTP首包时延、DNS解析时延、下载速率等)，将质差根因定界到<strong>家庭侧、网络侧、内容侧</strong>三大区域。阈值从配置中心动态读取。</div>' +
            // 统计卡片
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">3,812</div><div class="wo-stat-label">业务质差用户总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">45.2%</div><div class="wo-stat-label">网络侧占比</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5ad8a6;">32.8%</div><div class="wo-stat-label">家庭侧占比</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f6bd16;">15.5%</div><div class="wo-stat-label">内容侧占比</div></div>' +
            '</div>' +
            // 图表行
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">定界结果分布</span></div><div class="chart-container" id="bizBdChart1"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">质差原因TOP5</span></div><div class="chart-container" id="bizBdChart2"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">业务指标雷达图</span></div><div class="chart-container" id="bizBdChart3"></div></div>' +
            '</div>' +
            // 表格
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">业务CEI定界明细</div>' +
            '<table class="data-table"><thead><tr><th>用户账号</th><th>地市</th><th>定界结果</th><th>主要原因</th><th>CEI评分</th><th>业务时延</th><th>严重程度</th><th>时间</th><th>操作</th></tr></thead><tbody>' + tableRows + '</tbody></table></div></div>';
        // 渲染图表
        this._renderCeiSplitCharts('bizBd', sides, topReasons, [
            { name: '时延', max: 100 }, { name: '丢包率', max: 10 }, { name: '下载速率', max: 300 }, { name: '上传速率', max: 80 }, { name: 'DNS解析', max: 50 }
        ], [35, 3.2, 180, 42, 15]);
    },

    // ========== 业务CEI定位（拆分页面） ==========
    renderBizCeiLocate: function(container) {
        var locateItems = [
            { name: 'OLT上行拥塞', count: 856, dim: 'OLT', devices: ['OLT-CC-0012', 'OLT-JL-0008', 'OLT-SP-0003'], affectedUsers: 2340 },
            { name: 'BRAS负载高', count: 698, dim: 'BRAS', devices: ['BRAS-CC-01', 'BRAS-JL-02'], affectedUsers: 5680 },
            { name: 'CDN节点异常', count: 523, dim: 'CDN', devices: ['CDN-CC-Video01', 'CDN-JL-Stream02'], affectedUsers: 1850 },
            { name: '传输链路抖动', count: 412, dim: '传输', devices: ['TRANS-SP-Link03'], affectedUsers: 890 },
            { name: '光路衰减', count: 356, dim: 'PON', devices: ['PON-CC-0045', 'PON-YB-0012', 'PON-BS-0023'], affectedUsers: 720 }
        ];
        var locateRows = locateItems.map(function(item, idx) {
            var sevCls = idx < 2 ? 'status-error' : (idx < 4 ? 'status-warning' : 'status-normal');
            return '<tr><td>BL-' + String(idx + 1).padStart(3, '0') + '</td><td style="color:#e74c3c;font-weight:600;">' + item.name + '</td><td>' + item.dim + '</td><td>' + item.devices.join(', ') + '</td><td>' + item.count + '</td><td>' + item.affectedUsers + '</td><td><span class="' + sevCls + '">' + (idx < 2 ? '高' : (idx < 4 ? '中' : '低')) + '</span></td><td>' + SeededRandom.date('2025-12-01', '2025-12-02') + '</td></tr>';
        });

        container.innerHTML =
            '<div class="page-content">' +
            '<div class="remote-panel"><div class="remote-panel-title">' + ICO.search + ' 业务CEI定位分析</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('bizLocCity', '', '') +
            '<div class="form-group"><label class="form-label">定位维度</label><select class="form-select"><option>全部</option><option>OLT</option><option>BRAS</option><option>CDN</option><option>传输</option><option>PON</option></select></div>' +
            '<div class="form-group"><label class="form-label">时间范围</label><input class="form-input" type="date" value="2025-12-02"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderBizCeiLocate(document.getElementById(\'page-biz-cei-locate\'))">定位分析</button><button class="btn" onclick="Modal.toast(\'定位报告已导出\',\'success\')">导出</button></div></div></div>' +
            '<div style="margin-bottom:8px;padding:10px 12px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:12px;color:#666;"><strong>业务CEI定位说明：</strong>在定界确定质差侧（家庭/网络/内容）后，进一步下钻定位到具体的设备、链路或节点。支持按OLT、BRAS、CDN、传输链路、PON口等维度交叉分析。</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">定位原因设备聚合分析</span></div><div class="chart-container" id="bizLocChart1"></div></div>' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">各维度影响用户数对比</span></div><div class="chart-container" id="bizLocChart2"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">业务CEI定位明细（已按影响用户数排序）</div>' +
            '<table class="data-table"><thead><tr><th>定位ID</th><th>定位原因</th><th>维度</th><th>关联设备</th><th>质差事件数</th><th>影响用户</th><th>严重程度</th><th>发现时间</th></tr></thead><tbody>' + locateRows.join('') + '</tbody></table></div></div>';
        // 图表
        var d1 = document.getElementById('bizLocChart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['bizLocChart1'] = c1;
            c1.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 15, right: 40, bottom: 15, left: 100 },
                yAxis: { type: 'category', data: locateItems.map(function(r) { return r.name; }).reverse(), axisLabel: { fontSize: 10 } },
                xAxis: { type: 'value', axisLabel: { fontSize: 9 } },
                series: [{ type: 'bar', data: locateItems.map(function(r) { return r.count; }).reverse(), barWidth: '50%', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#5b8ff9' }, { offset: 1, color: '#85c1ff' }] } }, label: { show: true, position: 'right', fontSize: 9 } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('bizLocChart2');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['bizLocChart2'] = c2;
            c2.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 20, right: 20, bottom: 40, left: 50 },
                xAxis: { type: 'category', data: locateItems.map(function(r) { return r.dim; }), axisLabel: { fontSize: 10 } },
                yAxis: { type: 'value', name: '影响用户数', splitLine: { lineStyle: { color: '#f0f2f5' } } },
                series: [{ type: 'bar', data: locateItems.map(function(r) { return { value: r.affectedUsers, itemStyle: { color: r.affectedUsers > 2000 ? '#e74c3c' : (r.affectedUsers > 1000 ? '#f39c12' : '#5b8ff9') } }; }), barWidth: '50%', label: { show: true, position: 'top', fontSize: 9 } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    },

    // ========== 通断CEI定界（拆分页面） ==========
    renderConnCeiBoundary: function(container) {
        var sides = [
            { name: '家庭侧', value: 28.5, color: '#5ad8a6', reasons: ['网关掉电', '网关死机', 'WiFi模块故障', '用户拔线', '电源不稳'] },
            { name: '光路侧', value: 38.2, color: '#5b8ff9', reasons: ['光衰过大', '光纤断裂', '接头松动', '分光器故障', '弯曲过度'] },
            { name: '接入侧', value: 25.8, color: '#f6bd16', reasons: ['OLT端口故障', 'PON板卡异常', 'MAC认证失败', 'VLAN配置错误', '端口拉闸'] },
            { name: '其他', value: 7.5, color: '#bdc3c7', reasons: ['未知中断', '施工割接', '计划停电'] }
        ];
        var topReasons = [
            { name: '光衰过大', count: 920, pct: 24.1 },
            { name: '频繁掉线', count: 756, pct: 19.8 },
            { name: 'dying-gasp', count: 534, pct: 14.0 },
            { name: '设备重启', count: 423, pct: 11.1 },
            { name: '光路中断', count: 312, pct: 8.2 }
        ];
        var tableRows = '';
        for (var i = 0; i < 15; i++) {
            var city = SeededRandom.pick(JilinData.cities);
            var side = SeededRandom.pick(sides);
            var reason = SeededRandom.pick(topReasons);
            var cei = SeededRandom.float(40, 78, 1);
            var ceiCls = cei < 55 ? 'status-error' : (cei < 70 ? 'status-warning' : 'status-normal');
            tableRows += '<tr><td>JL' + (20250000 + SeededRandom.int(1, 500)) + '</td><td>' + city + '</td><td><span style="padding:2px 8px;background:' + side.color + '22;color:' + side.color + ';border-radius:10px;font-size:11px;font-weight:600;">' + side.name + '</span></td><td>' + reason.name + '</td><td><span class="' + ceiCls + '">' + cei + '</span></td><td>' + SeededRandom.float(-28, -16, 1) + 'dBm</td><td>' + SeededRandom.int(1, 15) + '次</td><td>' + Pages.statusHtml(SeededRandom.pick(['紧急', '一般', '告警'])) + '</td><td>' + SeededRandom.date('2025-12-01', '2025-12-02') + '</td></tr>';
        }
        container.innerHTML =
            '<div class="page-content">' +
            '<div class="remote-panel"><div class="remote-panel-title">' + ICO.bolt + ' 通断CEI定界分析</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('connBdCity', '', '') +
            '<div class="form-group"><label class="form-label">用户账号/IP</label><input class="form-input" placeholder="输入用户账号或IP"></div>' +
            '<div class="form-group"><label class="form-label">时间范围</label><input class="form-input" type="date" value="2025-12-02"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderConnCeiBoundary(document.getElementById(\'page-conn-cei-boundary\'))">定界查询</button><button class="btn" onclick="Modal.toast(\'定界报告已导出\',\'success\')">导出报告</button></div></div></div>' +
            '<div style="margin-bottom:8px;padding:10px 12px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:4px;font-size:12px;color:#c0392b;"><strong>通断CEI定界说明：</strong>基于用户通断体验指标(掉线次数、掉线时长、dying-gasp、光功率)，将连通性质差根因定界到<strong>家庭侧、光路侧、接入侧</strong>三大区域。弱光阈值：接收光功率 < -25dBm（可在配置中心调整）。</div>' +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">2,945</div><div class="wo-stat-label">通断质差用户总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">38.2%</div><div class="wo-stat-label">光路侧占比</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5ad8a6;">28.5%</div><div class="wo-stat-label">家庭侧占比</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f6bd16;">25.8%</div><div class="wo-stat-label">接入侧占比</div></div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">通断定界结果分布</span></div><div class="chart-container" id="connBdChart1"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">通断原因TOP5</span></div><div class="chart-container" id="connBdChart2"></div></div>' +
                '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">通断指标雷达图</span></div><div class="chart-container" id="connBdChart3"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">通断CEI定界明细</div>' +
            '<table class="data-table"><thead><tr><th>用户账号</th><th>地市</th><th>定界结果</th><th>主要原因</th><th>CEI评分</th><th>接收光功率</th><th>掉线次数</th><th>严重程度</th><th>时间</th></tr></thead><tbody>' + tableRows + '</tbody></table></div></div>';
        this._renderCeiSplitCharts('connBd', sides, topReasons, [
            { name: '接收光功率', max: 5 }, { name: '发送光功率', max: 5 }, { name: '中断次数', max: 20 }, { name: '中断时长', max: 60 }, { name: '误码率', max: 10 }
        ], [3.5, 2.8, 8, 25, 2.5]);
    },

    // ========== 通断CEI定位（拆分页面） ==========
    renderConnCeiLocate: function(container) {
        var locateItems = [
            { name: '光衰过大(弱光)', count: 920, dim: 'PON/光路', devices: ['PON-CC-0045', 'PON-JL-0023', 'PON-YB-0012'], affectedUsers: 1450, tag: '弱光' },
            { name: '高误码', count: 756, dim: 'OLT', devices: ['OLT-CC-0012', 'OLT-SP-0008'], affectedUsers: 980, tag: '高误码' },
            { name: '频繁掉线', count: 534, dim: 'BNG/BRAS', devices: ['BRAS-CC-01', 'BNG-JL-03'], affectedUsers: 1680, tag: '频繁掉线' },
            { name: 'dying-gasp(掉电)', count: 423, dim: '家庭侧', devices: ['区域：长春朝阳', '区域：吉林龙潭'], affectedUsers: 560, tag: '掉电' },
            { name: '光路中断', count: 312, dim: '光缆', devices: ['光缆段-CC-A023', '光缆段-SP-B012'], affectedUsers: 2100, tag: '光路中断' }
        ];
        var locateRows = locateItems.map(function(item, idx) {
            var sevCls = item.affectedUsers > 1500 ? 'status-error' : (item.affectedUsers > 800 ? 'status-warning' : 'status-normal');
            return '<tr><td>CL-' + String(idx + 1).padStart(3, '0') + '</td><td style="color:#e74c3c;font-weight:600;">' + item.name + '</td><td>' + item.dim + '</td><td>' + item.devices.join(', ') + '</td><td><span class="badge badge-warning" style="font-size:10px;">' + item.tag + '</span></td><td>' + item.count + '</td><td>' + item.affectedUsers + '</td><td><span class="' + sevCls + '">' + (item.affectedUsers > 1500 ? '高' : (item.affectedUsers > 800 ? '中' : '低')) + '</span></td></tr>';
        });

        container.innerHTML =
            '<div class="page-content">' +
            '<div class="remote-panel"><div class="remote-panel-title">' + ICO.search + ' 通断CEI定位分析</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('connLocCity', '', '') +
            '<div class="form-group"><label class="form-label">定位维度</label><select class="form-select"><option>全部</option><option>PON/光路</option><option>OLT</option><option>BNG/BRAS</option><option>光缆</option><option>家庭侧</option></select></div>' +
            '<div class="form-group"><label class="form-label">质差标签</label><select class="form-select"><option value="">全部</option><option>弱光</option><option>高误码</option><option>频繁掉线</option><option>掉电</option><option>光路中断</option></select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.renderConnCeiLocate(document.getElementById(\'page-conn-cei-locate\'))">定位分析</button><button class="btn" onclick="Modal.toast(\'定位报告已导出\',\'success\')">导出</button></div></div></div>' +
            '<div style="margin-bottom:8px;padding:10px 12px;background:#e8f8f0;border:1px solid #a3e4c1;border-radius:4px;font-size:12px;color:#1a7a4a;"><strong>通断CEI定位说明：</strong>在通断定界确定质差侧后，下钻定位到具体PON口、OLT端口、BNG设备或光缆段。支持<strong>弱光、高误码、频繁掉线、dying-gasp</strong>等标准化质差标签筛选，自动聚类相同设备/区域下的同类故障。</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">质差标签分布（通断）</span></div><div class="chart-container" id="connLocChart1"></div></div>' +
                '<div class="chart-card" style="min-height:320px;"><div class="chart-card-header"><span class="chart-title">各维度影响用户数</span></div><div class="chart-container" id="connLocChart2"></div></div>' +
            '</div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">通断CEI定位明细（按影响用户数排序）</div>' +
            '<table class="data-table"><thead><tr><th>定位ID</th><th>定位原因</th><th>维度</th><th>关联设备/区域</th><th>质差标签</th><th>事件数</th><th>影响用户</th><th>严重程度</th></tr></thead><tbody>' + locateRows.join('') + '</tbody></table></div></div>';
        // 图表
        var d1 = document.getElementById('connLocChart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances['connLocChart1'] = c1;
            c1.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c}件 ({d}%)' },
                legend: { bottom: 5, textStyle: { fontSize: 10 } },
                series: [{ type: 'pie', radius: ['35%', '58%'], center: ['50%', '45%'], data: locateItems.map(function(r) { return { name: r.tag, value: r.count }; }), label: { fontSize: 10, formatter: '{b}\n{d}%' }, itemStyle: { borderRadius: 4 } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('connLocChart2');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances['connLocChart2'] = c2;
            c2.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 15, right: 50, bottom: 15, left: 80 },
                yAxis: { type: 'category', data: locateItems.map(function(r) { return r.dim; }).reverse(), axisLabel: { fontSize: 10 } },
                xAxis: { type: 'value' },
                series: [{ type: 'bar', data: locateItems.map(function(r) { return { value: r.affectedUsers, itemStyle: { color: r.affectedUsers > 1500 ? '#e74c3c' : (r.affectedUsers > 800 ? '#f39c12' : '#27ae60') } }; }).reverse(), barWidth: '50%', label: { show: true, position: 'right', fontSize: 9 } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    },

    // ========== 通用CEI拆分页面图表渲染 ==========
    _renderCeiSplitCharts: function(prefix, sides, topReasons, radarIndicators, radarData) {
        var d1 = document.getElementById(prefix + 'Chart1');
        if (d1) {
            var c1 = echarts.init(d1); App.chartInstances[prefix + 'Chart1'] = c1;
            c1.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
                legend: { bottom: 5, textStyle: { fontSize: 10 } },
                series: [{ type: 'pie', radius: ['35%', '58%'], center: ['50%', '45%'], data: sides.map(function(s) { return { name: s.name, value: s.value, itemStyle: { color: s.color } }; }), label: { fontSize: 10, formatter: '{b}\n{d}%' } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById(prefix + 'Chart2');
        if (d2) {
            var c2 = echarts.init(d2); App.chartInstances[prefix + 'Chart2'] = c2;
            c2.setOption({
                grid: { top: 15, right: 50, bottom: 15, left: 80 }, tooltip: { trigger: 'axis' },
                yAxis: { type: 'category', data: topReasons.map(function(r) { return r.name; }).reverse(), axisLabel: { fontSize: 10 } },
                xAxis: { type: 'value', axisLabel: { fontSize: 9 } },
                series: [{ type: 'bar', data: topReasons.map(function(r) { return r.count; }).reverse(), barWidth: '50%', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#5b8ff9' }, { offset: 1, color: '#85c1ff' }] } }, label: { show: true, position: 'right', fontSize: 9, formatter: function(p) { return p.value + '件'; } } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
        var d3 = document.getElementById(prefix + 'Chart3');
        if (d3) {
            var c3 = echarts.init(d3); App.chartInstances[prefix + 'Chart3'] = c3;
            c3.setOption({
                tooltip: {},
                radar: { indicator: radarIndicators, radius: '60%', axisName: { fontSize: 9, color: '#666' } },
                series: [{ type: 'radar', data: [{ value: radarData, name: '当前值', areaStyle: { color: 'rgba(91,143,249,0.2)' } }], itemStyle: { color: '#5b8ff9' } }]
            });
            window.addEventListener('resize', function() { c3.resize(); });
        }
    },

    _showBizBoundaryDetail: function(city) {
        Modal.show('定界详情 - ' + city,
            '<div style="font-size:13px;line-height:2;">' +
            '<div><strong>地市：</strong>' + city + '</div>' +
            '<div><strong>质差用户数：</strong>' + SeededRandom.int(80, 350) + ' 户</div>' +
            '<div><strong>家庭侧占比：</strong>' + SeededRandom.float(25, 40, 1) + '%</div>' +
            '<div><strong>网络侧占比：</strong>' + SeededRandom.float(35, 50, 1) + '%</div>' +
            '<div><strong>内容侧占比：</strong>' + SeededRandom.float(10, 20, 1) + '%</div>' +
            '<div><strong>TOP原因：</strong>视频卡顿(' + SeededRandom.int(20, 80) + '人)、下载速率低(' + SeededRandom.int(15, 60) + '人)</div>' +
            '</div>',
            '<button class="btn btn-primary" onclick="Modal.close()">关闭</button>', '450px'
        );
    },

    // 通用模块占位
    renderModulePlaceholder: function(container, title) {
        container.innerHTML = '<div class="empty-state" style="height:100%;"><div class="empty-icon" style="font-size:36px;opacity:0.2;">[ ]</div><div class="empty-text" style="font-size:14px;color:#999;">' + title + '</div></div>';
    }
};

// Legacy fallback cleanup for remote-operation pages. enhance-pages.js will replace
// these when backend APIs are available; this keeps cached/old render paths consistent.
(function() {
    if (!window.Pages) return;

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function(c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }

    function normalizeOnuId(value, seed) {
        var raw = String(value || '').trim().toUpperCase();
        if (/^(HWTC|ZTEG|FHTT|ALCL)[0-9A-F]{12}$/.test(raw)) return raw;
        var vendors = ['HWTC', 'ZTEG', 'FHTT', 'ALCL'];
        var n = 0;
        for (var i = 0; i < raw.length; i++) n = (n * 31 + raw.charCodeAt(i)) >>> 0;
        n = n || Number(seed || Date.now());
        return vendors[n % vendors.length] + String(n % 1000000000000).padStart(12, '0');
    }

    function normalizeOperator(value) {
        var v = String(value || '').trim();
        var names = ['张建国', '王志强', '赵玉海', '郑志勇', '梁建军', '金成日', '陈明亮', '周文斌'];
        var map = {
            '刘工': '张建国',
            '李工': '王志强',
            '赵工': '赵玉海',
            '王工': '郑志勇',
            '黄工': '梁建军',
            '张工': '金成日',
            '杨工': '陈明亮',
            '陈工': '陈明亮',
            '周工': '周文斌'
        };
        if (!v || v === 'system' || v === 'admin') return names[Math.floor(Math.random() * names.length)];
        return map[v] || v;
    }

    function normalizeReason(value) {
        var v = String(value || '').trim();
        return (!v || /\?/.test(v)) ? '用户申报故障' : v;
    }

    Pages._pingLastOutput = Pages._pingLastOutput || '';
    Pages._pingLastStats = Pages._pingLastStats || null;
    Pages._pingCity = Pages._pingCity || '';
    Pages._pingTarget = Pages._pingTarget || '';
    Pages._pingOnt = Pages._pingOnt || '';
    Pages._pingStatus = Pages._pingStatus || '';

    Pages.renderPingTest = function(container, page) {
        this._pingPage = page || this._pingPage || 1;
        var data = (JilinData.pingTestHistory || []).map(function(r, idx) {
            return Object.assign({}, r, { ontId: normalizeOnuId(r.ontId, idx + 1) });
        });
        if (this._pingCity) data = data.filter(function(r) { return r.city === Pages._pingCity; });
        if (this._pingTarget) data = data.filter(function(r) { return String(r.target || '').indexOf(Pages._pingTarget) >= 0; });
        if (this._pingOnt) data = data.filter(function(r) { return String(r.ontId || '').indexOf(Pages._pingOnt.toUpperCase()) >= 0; });
        if (this._pingStatus) data = data.filter(function(r) { return r.status === Pages._pingStatus; });
        var p = this.paginate(data, this._pingPage, 12);
        var rows = p.data.map(function(r) {
            return '<tr><td>' + esc(r.time) + '</td><td>' + esc(r.ontId) + '</td><td>' + esc(r.target) + '</td><td>' + esc(r.packetSize || 64) + '</td><td>' + esc(r.count || 10) + '</td><td>' + esc(r.interval || 1) + 's</td><td>' + esc(r.city || '-') + '</td><td>' + esc(r.avgDelay) + 'ms</td><td>' + esc(r.maxDelay) + 'ms</td><td>' + esc(r.minDelay || '-') + 'ms</td><td>' + esc(r.packetLoss) + '%</td><td>' + Pages.statusHtml(r.status) + '</td></tr>';
        }).join('') || '<tr><td colspan="12" style="text-align:center;color:#999;padding:18px;">暂无PING历史记录</td></tr>';
        var statusOpts = ['正常', '告警', '异常'].map(function(s) {
            return '<option value="' + s + '"' + (s === Pages._pingStatus ? ' selected' : '') + '>' + s + '</option>';
        }).join('');
        container.innerHTML =
            '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">PING测试工具</div>' +
            '<div class="remote-form">' +
            this.cityFilterHtml('pingCityFilter', 'Pages._pingCity=this.value;Pages.renderPingTest(document.getElementById("page-ping-test"),1)', this._pingCity) +
            '<div class="form-group"><label class="form-label">ONT设备ID</label><input class="form-input" id="pingOntId" value="' + esc(this._pingOnt) + '" placeholder="请输入ONT设备ID"></div>' +
            '<div class="form-group"><label class="form-label">目标IP/域名</label><input class="form-input" id="pingTarget" value="' + esc(this._pingTarget) + '" placeholder="请输入目标IP或域名"></div>' +
            '<div class="form-group"><label class="form-label">ping包大小</label><input class="form-input" id="pingSize" type="number" min="32" max="1500" value="64"></div>' +
            '<div class="form-group"><label class="form-label">次数</label><input class="form-input" id="pingCount" type="number" min="1" max="100" value="10"></div>' +
            '<div class="form-group"><label class="form-label">间隔</label><input class="form-input" id="pingInterval" type="number" min="1" max="60" value="1" placeholder="秒"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;"><button class="btn btn-primary" id="pingStartBtn" onclick="Pages.executePing()">开始PING</button><button class="btn" onclick="Pages.resetPingFilters()">重置</button></div></div>' +
            '<div class="ping-result" id="pingResult" style="min-height:220px;max-height:360px;overflow:auto;">' + (this._pingLastOutput || '<span style="color:#f39c12;">等待执行PING测试...</span>') + '</div></div>' +
            '<div class="data-table-wrapper" style="margin-top:8px;"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">历史测试记录 (共' + data.length + '条)' +
            '<input class="form-input" style="width:180px;height:30px;" id="pingTargetFilter" value="' + esc(this._pingTarget) + '" placeholder="目标IP/域名">' +
            '<input class="form-input" style="width:160px;height:30px;" id="pingOntFilter" value="' + esc(this._pingOnt) + '" placeholder="ONT设备ID">' +
            '<select class="form-select" style="width:110px;height:30px;" id="pingStatusFilter"><option value="">全部状态</option>' + statusOpts + '</select>' +
            '<button class="btn" onclick="Pages.applyPingHistoryFilter()">查询</button></div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>ONT设备ID</th><th>目标IP/域名</th><th>ping包大小</th><th>次数</th><th>间隔</th><th>地市</th><th>平均时延</th><th>最大时延</th><th>最小时延</th><th>丢包率</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            this.paginationHtml(p, 'Pages.renderPingTest.bind(Pages,document.getElementById("page-ping-test"))') + '</div></div>';
    };

    Pages.applyPingHistoryFilter = function() {
        this._pingTarget = (document.getElementById('pingTargetFilter') || {}).value || '';
        this._pingOnt = (document.getElementById('pingOntFilter') || {}).value || '';
        this._pingStatus = (document.getElementById('pingStatusFilter') || {}).value || '';
        this.renderPingTest(document.getElementById('page-ping-test'), 1);
    };

    Pages.resetPingFilters = function() {
        this._pingTarget = '';
        this._pingOnt = '';
        this._pingStatus = '';
        this._pingCity = '';
        this._pingLastOutput = '';
        this._pingLastStats = null;
        this.renderPingTest(document.getElementById('page-ping-test'), 1);
    };

    Pages.executePing = function() {
        if (this._pingRunning) { Modal.toast('PING测试正在执行中，请等待完成', 'warning'); return; }
        var result = document.getElementById('pingResult');
        var target = (document.getElementById('pingTarget') || {}).value.trim();
        var size = parseInt((document.getElementById('pingSize') || {}).value, 10) || 64;
        var count = parseInt((document.getElementById('pingCount') || {}).value, 10) || 10;
        var pingInterval = parseInt((document.getElementById('pingInterval') || {}).value, 10) || 1;
        var ontId = normalizeOnuId((document.getElementById('pingOntId') || {}).value, Date.now());
        if (!target) { Modal.toast('请输入目标IP或域名', 'warning'); return; }
        this._pingRunning = true;
        this._pingTarget = target;
        this._pingOnt = ontId;
        var startBtn = document.getElementById('pingStartBtn');
        if (startBtn) { startBtn.disabled = true; startBtn.textContent = '执行中...'; }
        if (result) {
            result.innerHTML = '<span style="color:#f39c12;">发送给RMS ...</span>';
            this._pingLastOutput = result.innerHTML;
        }
        var self = this;
        setTimeout(function() {
            var delays = [];
            for (var i = 0; i < count; i++) delays.push(Math.random() * 15 + 2 + (Math.random() > 0.9 ? Math.random() * 50 : 0));
            var avg = delays.reduce(function(s, d) { return s + d; }, 0) / delays.length;
            var min = Math.min.apply(null, delays);
            var max = Math.max.apply(null, delays);
            var lossRate = parseFloat((delays.filter(function(d) { return d > 100; }).length / count * 100).toFixed(1));
            var html = '<span style="color:#f39c12;">发送给RMS ...</span><br><span style="color:#27ae60;font-weight:600;">RMS返回ping结果</span>' +
                '<br><span style="color:#00ff88;">--- ' + esc(target) + ' ping统计 ---</span>' +
                '<br><span style="color:#00ff88;">ONT设备ID：' + esc(ontId) + '</span>' +
                '<br><span style="color:#00ff88;">' + count + ' 个包已发送，' + (count - Math.round(lossRate * count / 100)) + ' 个已接收，丢包率 ' + lossRate.toFixed(1) + '%</span>' +
                '<br><span style="color:#00ff88;">rtt 最小/平均/最大 = ' + min.toFixed(1) + '/' + avg.toFixed(1) + '/' + max.toFixed(1) + ' ms</span>';
            if (result) result.innerHTML = html;
            self._pingLastOutput = html;
            JilinData.pingTestHistory.unshift({
                time: new Date().toLocaleString('zh-CN'),
                ontId: ontId,
                target: target,
                city: Pages._pingCity || App.currentCity || '全省',
                packetSize: size,
                count: count,
                interval: pingInterval,
                avgDelay: parseFloat(avg.toFixed(1)),
                maxDelay: parseFloat(max.toFixed(1)),
                minDelay: parseFloat(min.toFixed(1)),
                packetLoss: lossRate,
                status: lossRate > 20 ? '异常' : (lossRate > 5 || avg > 25 ? '告警' : '正常')
            });
            self._pingRunning = false;
            if (startBtn) { startBtn.disabled = false; startBtn.textContent = '开始PING'; }
            self.renderPingTest(document.getElementById('page-ping-test'), 1);
        }, 800);
    };

    var originalGatewayRender = Pages.renderGatewayRestart;
    Pages.renderGatewayRestart = function(container, page) {
        if (!JilinData.gatewayRestartRecords) return originalGatewayRender.call(this, container, page);
        JilinData.gatewayRestartRecords.forEach(function(r, idx) {
            r.gwId = normalizeOnuId(r.gwId, idx + 1);
            r.sn = /^211\d{8}$/.test(String(r.sn || '')) ? r.sn : ('211' + String(idx + 1).padStart(8, '0'));
            r.reason = normalizeReason(r.reason);
            r.operator = normalizeOperator(r.operator);
        });
        return originalGatewayRender.call(this, container, page);
    };
})();

