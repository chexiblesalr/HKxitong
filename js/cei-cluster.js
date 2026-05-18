/**
 * CEI聚类分析 — 完整重写
 * 三个 Tab：区域（GIS渲染） | BRAS | OLT
 * (1) 区域：GIS地图省→地市→区县下钻，图例5段(80以下/80-90/90-95/95-99/100)
 * (2) BRAS：数据表 + 趋势弹窗（小时24周期/天14周期）
 * (3) OLT ：数据表 + 趋势弹窗（小时24周期/天14周期）
 */
(function () {
    if (!window.Pages) return;

    // ---- 工具 ----
    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function hs(v) { v = String(v || ''); var h = 0; for (var i = 0; i < v.length; i++) h = ((h << 5) - h + v.charCodeAt(i)) | 0; return Math.abs(h); }
    function nv(seed, min, max, dec) { var x = Math.abs(Math.sin(seed) * 10000) % 1; return Number((min + x * (max - min)).toFixed(dec === undefined ? 1 : dec)); }
    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    // ---- 5段 CEI 图例颜色 ----
    function ceiColor5(score) {
        if (score >= 100) return '#1a9641';       // 100: 深绿
        if (score >= 95) return '#66bd63';         // 95-99: 浅绿
        if (score >= 90) return '#fee08b';         // 90-95: 黄
        if (score >= 80) return '#f46d43';         // 80-90: 橙
        return '#d73027';                          // <80: 红
    }
    function ceiLabel5(score) {
        if (score >= 100) return '100';
        if (score >= 95) return '95-99';
        if (score >= 90) return '90-95';
        if (score >= 80) return '80-90';
        return '80以下';
    }

    // ---- 数据生成: 地市 ----
    var _cities = ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'];
    var _districts = {
        '长春': ['朝阳区', '南关区', '宽城区', '二道区', '绿园区', '双阳区'],
        '吉林': ['昌邑区', '龙潭区', '船营区', '丰满区', '永吉县', '蛟河市'],
        '四平': ['铁西区', '铁东区', '梨树县', '伊通县', '公主岭市'],
        '辽源': ['龙山区', '西安区', '东丰县', '东辽县'],
        '通化': ['东昌区', '二道江区', '梅河口市', '集安市', '通化县'],
        '白山': ['浑江区', '江源区', '临江市', '抚松县', '靖宇县'],
        '松原': ['宁江区', '前郭县', '长岭县', '乾安县', '扶余市'],
        '白城': ['洮北区', '镇赉县', '通榆县', '洮南市', '大安市'],
        '延边': ['延吉市', '图们市', '敦化市', '珲春市', '龙井市', '安图县']
    };
    var _cityCode = { '长春': 'CC', '吉林': 'JL', '四平': 'SP', '辽源': 'LY', '通化': 'TH', '白山': 'BS', '松原': 'SY', '白城': 'BC', '延边': 'YB' };
    var _vendors = ['HW', 'ZTE', 'FH', 'ALU'];

    function genBrasName(city, district, idx) {
        return (_cityCode[city] || 'JL') + '-' + (district || 'HX').substring(0, 2).toUpperCase() + '-BRAS-' + String(idx).padStart(3, '0') + '-' + _vendors[hs(city + district + idx) % 4];
    }
    function genOltName(city, district, idx) {
        var model = idx % 2 === 0 ? 'MA5800' : 'C600';
        return (_cityCode[city] || 'JL') + '-' + (district || 'HX').substring(0, 2).toUpperCase() + '-OLT-' + String(idx).padStart(3, '0') + '-' + _vendors[hs(city + district + idx + 7) % 4] + '-' + model;
    }

    // ---- 生成 CEI 分数（集中在 80-100 之间） ----
    function genCeiScore(seed) {
        var r = nv(seed, 0, 100, 0);
        // 使数据集中在 80-100：大部分在 90-100
        if (r > 15) return nv(seed + 1, 90, 100, 1);
        if (r > 5) return nv(seed + 2, 80, 90, 1);
        return nv(seed + 3, 95, 100, 1);
    }

    // ---- 当前时间辅助 ----
    function nowDateStr() {
        var d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }
    function hoursAgo(h) {
        var d = new Date(); d.setHours(d.getHours() - h);
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':00';
    }
    function daysAgo(n) {
        var d = new Date(); d.setDate(d.getDate() - n);
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    // ---- 趋势数据生成 ----
    function genTrendData(seed, periods, baseOverall, baseBiz, baseConn) {
        var data = { labels: [], overall: [], business: [], connection: [] };
        for (var i = 0; i < periods; i++) {
            data.overall.push(nv(seed + i * 3, baseOverall - 3, baseOverall + 2, 1));
            data.business.push(nv(seed + i * 3 + 1, baseBiz - 4, baseBiz + 2, 1));
            data.connection.push(nv(seed + i * 3 + 2, baseConn - 3, baseConn + 3, 1));
        }
        return data;
    }

    // ========== 状态 ==========
    Pages._ceiClusterTab = Pages._ceiClusterTab || 'area';     // area / bras / olt
    Pages._ceiClusterGrain = Pages._ceiClusterGrain || 'hour';  // hour / day
    Pages._ceiClusterCity = Pages._ceiClusterCity || '';
    Pages._ceiClusterBras = Pages._ceiClusterBras || '';
    Pages._ceiClusterOlt = Pages._ceiClusterOlt || '';
    Pages._ceiClusterPage = Pages._ceiClusterPage || 1;

    // ========== 入口渲染 ==========
    Pages.renderCeiCluster = function (container) {
        var tab = this._ceiClusterTab;
        var isArea = tab === 'area', isBras = tab === 'bras', isOlt = tab === 'olt';

        // Tab 栏
        var tabBarHtml =
            '<div class="cei-cluster-tabs">' +
            '<div class="cei-cluster-tab' + (isArea ? ' active' : '') + '" onclick="Pages._ceiClusterTab=\'area\';Pages._ceiClusterPage=1;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">' +
            '<i class="tab-icon"></i> 区域' +
            '</div>' +
            '<div class="cei-cluster-tab' + (isBras ? ' active' : '') + '" onclick="Pages._ceiClusterTab=\'bras\';Pages._ceiClusterPage=1;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">' +
            '<i class="tab-icon"></i> BRAS' +
            '</div>' +
            '<div class="cei-cluster-tab' + (isOlt ? ' active' : '') + '" onclick="Pages._ceiClusterTab=\'olt\';Pages._ceiClusterPage=1;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">' +
            '<i class="tab-icon"></i> OLT' +
            '</div>' +
            '</div>';

        // 描述区
        var descArea =
            '<div class="cei-cluster-desc">' +
            '<div class="desc-item' + (isArea ? ' active' : '') + '"><span class="desc-num">1</span> 支持区域维度CEI评分统计：支持按照GIS地图方式呈现全网、行政区呈现CEI评分信息</div>' +
            '<div class="desc-item' + (isBras ? ' active' : '') + '"><span class="desc-num">2</span> 支持BRAS维度CEI评分统计：支持按天级、小时级BRAS维度的业务CEI、通断CEI及总体CEI评分和趋势分析</div>' +
            '<div class="desc-item' + (isOlt ? ' active' : '') + '"><span class="desc-num">3</span> 支持OLT维度CEI评分统计：支持按天级、小时级OLT维度的业务CEI、通断CEI及总体CEI评分和趋势分析</div>' +
            '</div>';

        var bodyHtml = '';
        if (isArea) bodyHtml = this._buildAreaTab();
        else if (isBras) bodyHtml = this._buildDeviceTab('bras');
        else bodyHtml = this._buildDeviceTab('olt');

        container.innerHTML =
            '<div class="page-content">' +
            '<div class="cei-cluster-header">' +
            '<div class="cei-cluster-title">CEI聚类分析</div>' +
            descArea +
            '</div>' +
            tabBarHtml +
            '<div class="cei-cluster-body">' + bodyHtml + '</div>' +
            '</div>';

        // 初始化地图（区域tab）
        if (isArea) {
            this._initClusterGisMap();
        }
    };

    // ========== (1) 区域 Tab ==========
    Pages._buildAreaTab = function () {
        return '<div class="cei-area-container">' +
            '<div class="cei-area-map-wrap">' +
            '<div class="cei-area-map" id="ceiClusterMapView"></div>' +
            '<div class="cei-area-legend" id="ceiClusterLegend">' +
            '<div class="legend-title">网络健康度</div>' +
            '<div class="legend-item"><span class="legend-dot" style="background:#1a9641"></span> 优秀 CEI=100</div>' +
            '<div class="legend-item"><span class="legend-dot" style="background:#66bd63"></span> 良好 95≤CEI<100</div>' +
            '<div class="legend-item"><span class="legend-dot" style="background:#fee08b"></span> 关注 90≤CEI<95</div>' +
            '<div class="legend-item"><span class="legend-dot" style="background:#f46d43"></span> 需改善 80≤CEI<90</div>' +
            '<div class="legend-item"><span class="legend-dot" style="background:#d73027"></span> 差 CEI<80</div>' +
            '</div>' +
            '<div class="cei-area-breadcrumb" id="ceiClusterBreadcrumb"></div>' +
            '<div class="cei-area-mode" id="ceiClusterMode">● 数据/年模式</div>' +
            '</div>' +
            '</div>';
    };

    // ---- 区域 GIS 地图初始化 ----
    Pages._clusterMapObj = null;
    Pages._clusterMapLevel = 'province'; // province / city / district
    Pages._clusterMapCity = null;
    Pages._clusterMapCityAdcode = null;

    Pages._initClusterGisMap = function () {
        var el = document.getElementById('ceiClusterMapView');
        if (!el) return;

        // 如果之前有地图实例，销毁
        if (this._clusterMapObj) {
            this._clusterMapObj.remove();
            this._clusterMapObj = null;
        }

        this._clusterMapLevel = 'province';
        this._clusterMapCity = null;

        var map = L.map('ceiClusterMapView', {
            center: [43.88, 126.55],
            zoom: 6,
            minZoom: 5,
            maxZoom: 14,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer(typeof MAP_CFG !== 'undefined' ? MAP_CFG.tileUrl : 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            subdomains: '1234',
            maxZoom: 18
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        this._clusterMapObj = map;
        this._clusterGeoLayer = L.featureGroup().addTo(map);
        this._clusterMarkerGroup = L.layerGroup().addTo(map);

        this._loadClusterProvince();
    };

    Pages._loadClusterProvince = function () {
        var self = this;
        var map = this._clusterMapObj;
        if (!map) return;
        this._clusterGeoLayer.clearLayers();
        this._clusterMarkerGroup.clearLayers();
        this._clusterMapLevel = 'province';
        this._clusterMapCity = null;

        var JL_ADCODE = typeof window.JL_ADCODE !== 'undefined' ? window.JL_ADCODE : '220000';

        if (typeof fetchGeoJSON === 'function') {
            fetchGeoJSON(JL_ADCODE, function (geojson) {
                if (!geojson) return;
                self._renderClusterGeo(geojson, 'province');
                map.fitBounds([[39.5, 121.5], [46.5, 131.5]], { padding: [15, 15] });
                self._updateClusterBreadcrumb();
            });
        } else {
            // 没有GeoJSON时用简单卡片替代
            this._renderClusterFallback();
        }
    };

    Pages._renderClusterGeo = function (geojson, level) {
        var self = this;
        var map = this._clusterMapObj;

        L.geoJSON(geojson, {
            style: function (feature) {
                var name = feature.properties.name;
                var shortName = (typeof CITY_SHORT_NAMES !== 'undefined' && CITY_SHORT_NAMES[name]) || name;
                var score = genCeiScore(hs(shortName + 'cluster'));
                return {
                    color: level === 'province' ? '#3388ff' : '#5b8ff9',
                    fillColor: ceiColor5(score),
                    fillOpacity: 0.55,
                    weight: level === 'province' ? 2 : 1.5
                };
            },
            onEachFeature: function (feature, layer) {
                var name = feature.properties.name;
                var shortName = (typeof CITY_SHORT_NAMES !== 'undefined' && CITY_SHORT_NAMES[name]) || name;
                var center = feature.properties.centroid || feature.properties.center;
                var score = genCeiScore(hs(shortName + 'cluster'));

                // 标注
                if (center) {
                    var displayName = shortName.replace(/[市区县旗]$/, '');
                    L.marker([center[1], center[0]], {
                        icon: L.divIcon({
                            className: 'grid-label city-label',
                            html: '<div class="gl-name">' + displayName + '</div>',
                            iconSize: [56, 22], iconAnchor: [28, 11]
                        })
                    }).addTo(self._clusterMarkerGroup);
                }

                // tooltip
                layer.bindTooltip(
                    '<div class="map-hover-tip"><b>' + name + '</b><br/>' +
                    '<span class="tip-sub">CEI: ' + score + '分 | 等级: ' + ceiLabel5(score) + '</span></div>',
                    { className: 'district-tooltip-container', direction: 'top', offset: [0, -10], sticky: true }
                );

                layer.on('mouseover', function () { layer.setStyle({ fillOpacity: 0.75, weight: 3 }); });
                layer.on('mouseout', function () { layer.setStyle({ fillOpacity: 0.55, weight: level === 'province' ? 2 : 1.5 }); });

                // 下钻
                if (level === 'province') {
                    layer.on('click', function (e) {
                        L.DomEvent.stopPropagation(e);
                        var adcode = (typeof CITY_ADCODES !== 'undefined') ? CITY_ADCODES[name] : null;
                        if (adcode) {
                            self._clusterDrillCity(shortName, name, adcode);
                        }
                    });
                }
            }
        }).addTo(this._clusterGeoLayer);
    };

    Pages._clusterDrillCity = function (shortName, fullName, adcode) {
        var self = this;
        var map = this._clusterMapObj;
        this._clusterGeoLayer.clearLayers();
        this._clusterMarkerGroup.clearLayers();
        this._clusterMapLevel = 'city';
        this._clusterMapCity = shortName;
        this._clusterMapCityAdcode = adcode;

        fetchGeoJSON(adcode, function (geojson) {
            if (!geojson || !geojson.features) return;
            self._renderClusterGeo(geojson, 'city');

            // fit bounds
            var minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
            geojson.features.forEach(function (f) {
                if (typeof getGeoJSONBBox === 'function') {
                    var bb = getGeoJSONBBox(f);
                    if (bb.minLat < minLat) minLat = bb.minLat;
                    if (bb.maxLat > maxLat) maxLat = bb.maxLat;
                    if (bb.minLng < minLng) minLng = bb.minLng;
                    if (bb.maxLng > maxLng) maxLng = bb.maxLng;
                }
            });
            if (minLat < Infinity) map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [25, 25] });
            self._updateClusterBreadcrumb();
        });
    };

    Pages._updateClusterBreadcrumb = function () {
        var bc = document.getElementById('ceiClusterBreadcrumb');
        if (!bc) return;
        var self = this;
        var html = '<span class="bc-link" onclick="Pages._loadClusterProvince()">吉林省</span>';
        if (this._clusterMapLevel === 'city' && this._clusterMapCity) {
            html += ' <span class="bc-sep">›</span> <span class="bc-current">' + esc(this._clusterMapCity) + '</span>';
        }
        bc.innerHTML = html;
    };

    Pages._renderClusterFallback = function () {
        // 当没有GIS数据时，显示CEI分布卡片
        var el = document.getElementById('ceiClusterMapView');
        if (!el) return;
        var html = '<div style="padding:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">';
        _cities.forEach(function (city) {
            var score = genCeiScore(hs(city + 'cluster'));
            html += '<div style="padding:16px;background:' + ceiColor5(score) + '22;border:2px solid ' + ceiColor5(score) + ';border-radius:8px;text-align:center;">' +
                '<div style="font-size:14px;font-weight:600;">' + city + '</div>' +
                '<div style="font-size:24px;font-weight:700;color:' + ceiColor5(score) + ';">' + score + '</div>' +
                '<div style="font-size:11px;color:#888;">' + ceiLabel5(score) + '</div></div>';
        });
        html += '</div>';
        el.innerHTML = html;
    };

    // ========== (2)(3) BRAS / OLT Tab ==========
    Pages._buildDeviceTab = function (type) {
        var grain = this._ceiClusterGrain;
        var city = this._ceiClusterCity;
        var deviceFilter = type === 'bras' ? this._ceiClusterBras : this._ceiClusterOlt;

        // 时间范围
        var timeRangeText = '';
        if (grain === 'hour') {
            timeRangeText = hoursAgo(3) + ' ~ ' + hoursAgo(0);
        } else {
            timeRangeText = daysAgo(14) + ' ~ ' + nowDateStr();
        }

        // 地市选项
        var cityOpts = '<option value="">全部</option>';
        _cities.forEach(function (c) {
            cityOpts += '<option value="' + c + '"' + (c === city ? ' selected' : '') + '>' + c + '</option>';
        });

        // 筛选工具栏
        var filterBar =
            '<div class="cei-device-filter">' +
            '<div class="filter-row">' +
            '<div class="filter-item">' +
            '<label>时间粒度：</label>' +
            '<label class="radio-label"><input type="radio" name="ceiGrain_' + type + '" value="hour"' + (grain === 'hour' ? ' checked' : '') + ' onchange="Pages._ceiClusterGrain=\'hour\';Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))"> 小时</label>' +
            '<label class="radio-label"><input type="radio" name="ceiGrain_' + type + '" value="day"' + (grain === 'day' ? ' checked' : '') + ' onchange="Pages._ceiClusterGrain=\'day\';Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))"> 天</label>' +
            '</div>' +
            '<div class="filter-item">' +
            '<label>时间：</label>' +
            '<span class="filter-time-display">' + esc(timeRangeText) + '</span>' +
            '</div>' +
            '<div class="filter-item">' +
            '<label>地市：</label>' +
            '<select class="form-select" style="width:100px;" onchange="Pages._ceiClusterCity=this.value;Pages._ceiClusterPage=1;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">' + cityOpts + '</select>' +
            '</div>' +
            '<div class="filter-item">' +
            '<label>' + (type === 'bras' ? 'BRAS' : 'OLT') + '：</label>' +
            '<input class="form-input" style="width:160px;" id="ceiDevice_' + type + '" value="' + esc(deviceFilter) + '" placeholder="请输入设备名称">' +
            '</div>' +
            '<div class="filter-actions">' +
            '<button class="btn btn-primary" onclick="Pages._ceiCluster' + (type === 'bras' ? 'Bras' : 'Olt') + '=document.getElementById(\'ceiDevice_' + type + '\').value.trim();Pages._ceiClusterPage=1;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">查询</button>' +
            '<button class="btn" onclick="Pages._ceiClusterCity=\'\';Pages._ceiCluster' + (type === 'bras' ? 'Bras' : 'Olt') + '=\'\';Pages._ceiClusterGrain=\'hour\';Pages._ceiClusterPage=1;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">重置</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        // 数据表
        var allData = this._genDeviceData(type);
        // 过滤
        if (city) allData = allData.filter(function (d) { return d.city === city; });
        if (deviceFilter) {
            var kw = deviceFilter.toLowerCase();
            allData = allData.filter(function (d) { return d.device.toLowerCase().indexOf(kw) >= 0; });
        }

        // 分页
        var page = this._ceiClusterPage || 1;
        var pageSize = 15;
        var total = allData.length;
        var totalPages = Math.ceil(total / pageSize) || 1;
        if (page > totalPages) page = totalPages;
        var pageData = allData.slice((page - 1) * pageSize, page * pageSize);

        // 表头
        var thCols = type === 'bras'
            ? '<th>时间</th><th>地市</th><th>区县</th><th>BRAS</th><th>业务CEI</th><th>通断CEI</th><th>总体CEI</th><th>详情</th>'
            : '<th>时间</th><th>地市</th><th>区县</th><th>OLT</th><th>业务CEI</th><th>通断CEI</th><th>总体CEI</th><th>详情</th>';

        var rows = pageData.map(function (d) {
            var overallCls = d.overall >= 95 ? 'status-normal' : (d.overall >= 90 ? 'status-warning' : 'status-error');
            return '<tr>' +
                '<td>' + esc(d.time) + '</td>' +
                '<td>' + esc(d.city) + '</td>' +
                '<td>' + esc(d.district) + '</td>' +
                '<td style="font-size:12px;">' + esc(d.device) + '</td>' +
                '<td><span style="color:#5b8ff9;font-weight:600;">' + d.business + '</span></td>' +
                '<td><span style="color:#5ad8a6;font-weight:600;">' + d.connection + '</span></td>' +
                '<td><span class="' + overallCls + '" style="font-weight:700;">' + d.overall + '</span></td>' +
                '<td><a class="trend-link" onclick="Pages.showCeiTrend(\'' + type + '\',\'' + esc(d.device) + '\',\'' + esc(d.city) + '\',\'' + esc(d.district) + '\')">趋势</a></td>' +
                '</tr>';
        }).join('') || '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

        // 分页条
        var pagerHtml = '<div class="cei-pager">' +
            '<span>共 ' + total + ' 条，第 ' + page + '/' + totalPages + ' 页</span>' +
            '<button class="btn"' + (page <= 1 ? ' disabled' : '') + ' onclick="Pages._ceiClusterPage=' + (page - 1) + ';Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">上一页</button>' +
            '<button class="btn"' + (page >= totalPages ? ' disabled' : '') + ' onclick="Pages._ceiClusterPage=' + (page + 1) + ';Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))">下一页</button>' +
            '</div>';

        return filterBar +
            '<div class="data-table-wrapper">' +
            '<table class="data-table"><thead><tr>' + thCols + '</tr></thead>' +
            '<tbody>' + rows + '</tbody></table>' +
            pagerHtml +
            '</div>';
    };

    // ---- 设备数据生成 ----
    Pages._genDeviceData = function (type) {
        var grain = this._ceiClusterGrain;
        var data = [];
        var self = this;
        _cities.forEach(function (city) {
            var dists = _districts[city] || ['未知区'];
            dists.forEach(function (dist, di) {
                var deviceCount = type === 'bras' ? 2 + (hs(city + dist) % 3) : 3 + (hs(city + dist + 'olt') % 4);
                for (var dIdx = 1; dIdx <= deviceCount; dIdx++) {
                    var device = type === 'bras' ? genBrasName(city, dist, dIdx) : genOltName(city, dist, dIdx);
                    var s = hs(device + grain);
                    var overall = genCeiScore(s);
                    var business = nv(s + 10, overall - 3, overall + 1, 1);
                    var connection = nv(s + 20, overall - 2, overall + 2, 1);
                    var timeStr = grain === 'hour' ? hoursAgo(hs(device) % 24) : daysAgo(hs(device) % 14);
                    data.push({
                        time: timeStr,
                        city: city,
                        district: dist,
                        device: device,
                        business: business,
                        connection: connection,
                        overall: overall
                    });
                }
            });
        });
        // 按时间降序
        data.sort(function (a, b) { return b.time > a.time ? 1 : -1; });
        return data;
    };

    // ========== 趋势弹窗 ==========
    Pages.showCeiTrend = function (type, device, city, district) {
        var grain = this._ceiClusterGrain;
        var periods = grain === 'hour' ? 24 : 14;
        var s = hs(device + type);
        var baseOverall = genCeiScore(s);
        var baseBiz = nv(s + 10, baseOverall - 3, baseOverall + 1, 1);
        var baseConn = nv(s + 20, baseOverall - 2, baseOverall + 2, 1);

        var trendData = genTrendData(s, periods, baseOverall, baseBiz, baseConn);

        // 生成标签
        var labels = [];
        for (var i = periods - 1; i >= 0; i--) {
            if (grain === 'hour') {
                labels.push(hoursAgo(i));
            } else {
                labels.push(daysAgo(i));
            }
        }
        trendData.labels = labels;

        // 弹窗标题
        var title = (type === 'bras' ? 'BRAS' : 'OLT') + ' CEI趋势 — ' + device;
        var subtitle = city + ' ' + district + ' | ' + (grain === 'hour' ? '小时粒度 (24周期)' : '天粒度 (14周期)');

        Modal.show(title,
            '<div style="font-size:12px;color:#888;margin-bottom:8px;">' + esc(subtitle) + '</div>' +
            '<div id="ceiTrendChart" style="width:100%;height:320px;"></div>',
            '<button class="btn btn-primary" onclick="Modal.close()">关闭</button>',
            '900px'
        );

        // 渲染ECharts
        setTimeout(function () {
            var el = document.getElementById('ceiTrendChart');
            if (!el || !window.echarts) return;
            var chart = echarts.init(el);
            chart.setOption({
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(255,255,255,0.96)',
                    borderColor: '#e0e4e8',
                    textStyle: { color: '#333', fontSize: 12 },
                    axisPointer: { type: 'cross', crossStyle: { color: '#999' } }
                },
                legend: {
                    data: ['业务CEI', '通断CEI', '总体CEI'],
                    top: 0,
                    textStyle: { fontSize: 12 },
                    itemWidth: 24,
                    itemHeight: 3,
                    icon: 'roundRect'
                },
                grid: { top: 35, right: 20, bottom: 50, left: 45 },
                xAxis: {
                    type: 'category',
                    data: trendData.labels,
                    axisLabel: {
                        fontSize: 10,
                        rotate: grain === 'hour' ? 45 : 30,
                        formatter: function (v) {
                            return grain === 'hour' ? v.substring(11) : v.substring(5);
                        }
                    },
                    axisTick: { alignWithLabel: true }
                },
                yAxis: {
                    type: 'value',
                    min: function (v) { return Math.floor(v.min - 2); },
                    max: function (v) { return Math.ceil(v.max + 1); },
                    axisLabel: { fontSize: 10 },
                    splitLine: { lineStyle: { color: '#f0f2f5' } }
                },
                series: [
                    {
                        name: '业务CEI',
                        type: 'line',
                        data: trendData.business,
                        smooth: true,
                        lineStyle: { width: 2.5, color: '#5b8ff9' },
                        itemStyle: { color: '#5b8ff9' },
                        symbol: 'circle',
                        symbolSize: 5
                    },
                    {
                        name: '通断CEI',
                        type: 'line',
                        data: trendData.connection,
                        smooth: true,
                        lineStyle: { width: 2.5, color: '#5ad8a6' },
                        itemStyle: { color: '#5ad8a6' },
                        symbol: 'circle',
                        symbolSize: 5
                    },
                    {
                        name: '总体CEI',
                        type: 'line',
                        data: trendData.overall,
                        smooth: true,
                        lineStyle: { width: 2.5, color: '#f6bd16' },
                        itemStyle: { color: '#f6bd16' },
                        symbol: 'circle',
                        symbolSize: 5
                    }
                ]
            });
            window.addEventListener('resize', function () { chart.resize(); });
        }, 200);
    };

})();
