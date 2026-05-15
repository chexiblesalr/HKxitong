/**
 * 家宽网络质量分析平台 - GIS地图交互模块
 * 三级下钻: 吉林省 → 地市(GeoJSON) → 区县(GeoJSON) → 乡镇网格(算法生成)
 * 参考重庆集中性能系统的下钻样式
 */

/* ============================================================
   0. 状态
   ============================================================ */
var GridMap = {
    map: null,
    geoLayer: null,
    markerGroup: null,
    currentLevel: 0,
    breadcrumb: [],
    currentCityName: null,
    currentCityAdcode: null,
    currentDistrictName: null,
    currentDistrictFeature: null,
    initialized: false,
    _loading: false
};

/* ============================================================
   1. 初始化
   ============================================================ */
function initGridMap() {
    if (GridMap.initialized) {
        if (GridMap.map) {
            setTimeout(function() { GridMap.map.invalidateSize(); }, 200);
        }
        return;
    }

    var el = document.getElementById('gridMapView');
    if (!el) return;

    GridMap.map = L.map('gridMapView', {
        center: MAP_CFG.center,
        zoom: MAP_CFG.zoom,
        minZoom: MAP_CFG.minZoom,
        maxZoom: MAP_CFG.maxZoom,
        zoomControl: false,
        attributionControl: false
    });

    L.tileLayer(MAP_CFG.tileUrl, {
        attribution: MAP_CFG.attribution,
        subdomains: '1234',
        maxZoom: 18
    }).addTo(GridMap.map);

    L.control.zoom({ position: 'bottomright' }).addTo(GridMap.map);

    GridMap.geoLayer = L.featureGroup().addTo(GridMap.map);
    GridMap.markerGroup = L.layerGroup().addTo(GridMap.map);

    GridMap.initialized = true;

    // 绑定工具栏事件
    var backBtn = document.getElementById('mapBackBtn');
    if (backBtn) {
        backBtn.onclick = function() { navigateBack(); };
    }

    loadProvinceLayer();
}

/* ============================================================
   2. Loading 状态
   ============================================================ */
function showMapLoading(show) {
    GridMap._loading = show;
    var el = document.getElementById('mapLoadingOverlay');
    if (!el && show) {
        el = document.createElement('div');
        el.id = 'mapLoadingOverlay';
        el.className = 'map-loading';
        el.innerHTML = '<div class="map-loading-spinner"></div><div class="map-loading-text">加载地理数据中...</div>';
        var container = document.getElementById('mapContainer');
        if (container) container.appendChild(el);
    }
    if (el) el.style.display = show ? 'flex' : 'none';
}

function showMapToast(msg) {
    var toast = document.getElementById('mapToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'map-toast show';
    setTimeout(function() { toast.className = 'map-toast'; }, 2500);
}

/* ============================================================
   3. 省级层 (Level 0) — 吉林省整体 GeoJSON，按地市着色
   ============================================================ */
function loadProvinceLayer() {
    showMapLoading(true);
    GridMap.geoLayer.clearLayers();
    GridMap.markerGroup.clearLayers();
    GridMap.currentLevel = 0;
    GridMap.currentCityName = null;
    GridMap.currentCityAdcode = null;
    GridMap.currentDistrictName = null;
    GridMap.breadcrumb = [{ name: '吉林省', level: -1 }];

    fetchGeoJSON(JL_ADCODE, function(geojson) {
        showMapLoading(false);
        if (!geojson) { showMapToast('⚠️ 地理数据加载失败'); return; }

        var lvl = GRID_LEVELS[0];

        L.geoJSON(geojson, {
            style: function(feature) {
                var cityName = feature.properties.name;
                var shortName = CITY_SHORT_NAMES[cityName] || cityName;
                var seed = jlHashStr(shortName);
                var rand = jlSeededRand(seed);
                var score = 88 + rand() * 7;
                // 尝试从JilinData获取真实CEI数据
                if (typeof JilinData !== 'undefined' && JilinData.gisCoordinates) {
                    var gisData = JilinData.gisCoordinates[shortName];
                    if (gisData) score = gisData.ceiScore;
                }
                return {
                    color: lvl.color,
                    fillColor: getScoreColor(score),
                    fillOpacity: lvl.fillOpacity,
                    weight: lvl.weight
                };
            },
            onEachFeature: function(feature, layer) {
                var cityName = feature.properties.name;
                var shortName = CITY_SHORT_NAMES[cityName] || cityName;
                var center = feature.properties.centroid || feature.properties.center;

                // 地市名称标注
                if (center) {
                    var displayName = shortName;
                    L.marker([center[1], center[0]], {
                        icon: L.divIcon({
                            className: 'grid-label city-label',
                            html: '<div class="gl-name">' + displayName + '</div>',
                            iconSize: [56, 22], iconAnchor: [28, 11]
                        })
                    }).addTo(GridMap.markerGroup);
                }

                // tooltip
                var seed = jlHashStr(shortName);
                var rand = jlSeededRand(seed);
                var ceiScore = (88 + rand() * 7).toFixed(1);
                var users = (10 + rand() * 60).toFixed(1);
                if (typeof JilinData !== 'undefined' && JilinData.gisCoordinates && JilinData.gisCoordinates[shortName]) {
                    ceiScore = JilinData.gisCoordinates[shortName].ceiScore;
                    users = JilinData.gisCoordinates[shortName].broadbandUsers;
                }
                var tooltipHtml = '<div class="map-hover-tip"><b>' + cityName + '</b><br/>' +
                    '<span class="tip-sub">CEI: ' + ceiScore + '分 | 宽带用户: ' + users + '万</span></div>';
                layer.bindTooltip(tooltipHtml, {
                    className: 'district-tooltip-container',
                    direction: 'top', offset: [0, -10], sticky: true
                });

                layer.on('mouseover', function() { layer.setStyle({ fillOpacity: lvl.hoverOpacity, weight: lvl.weight + 1 }); });
                layer.on('mouseout', function() { layer.setStyle({ fillOpacity: lvl.fillOpacity, weight: lvl.weight }); });

                // 点击下钻到地市
                layer.on('click', function(e) {
                    L.DomEvent.stopPropagation(e);
                    var adcode = CITY_ADCODES[cityName];
                    if (adcode) {
                        loadCityLayer(cityName, shortName, adcode);
                    }
                });
            }
        }).addTo(GridMap.geoLayer);

        GridMap.map.fitBounds([[39.5, 121.5], [46.5, 131.5]], { padding: [15, 15] });
        updateMapBreadcrumb();
        updateLayerIndicator();
    });
}

/* ============================================================
   4. 地市层 (Level 1) — 地市GeoJSON，按区县着色
   ============================================================ */
function loadCityLayer(cityFullName, cityShortName, adcode) {
    showMapLoading(true);
    GridMap.geoLayer.clearLayers();
    GridMap.markerGroup.clearLayers();
    GridMap.currentLevel = 1;
    GridMap.currentCityName = cityShortName;
    GridMap.currentCityAdcode = adcode;
    GridMap.breadcrumb = [
        { name: '吉林省', level: -1 },
        { name: cityShortName, level: 0 }
    ];

    fetchGeoJSON(adcode, function(geojson) {
        showMapLoading(false);
        if (!geojson || !geojson.features) {
            showMapToast('⚠️ 地理数据加载失败');
            updateMapBreadcrumb(); updateLayerIndicator();
            return;
        }

        var lvl = GRID_LEVELS[1];

        L.geoJSON(geojson, {
            style: function(feature) {
                var distName = feature.properties.name;
                var seed = jlHashStr(distName + cityShortName);
                var rand = jlSeededRand(seed);
                var score = 87 + rand() * 8;
                return {
                    color: lvl.color,
                    fillColor: getScoreColor(score),
                    fillOpacity: lvl.fillOpacity,
                    weight: lvl.weight
                };
            },
            onEachFeature: function(feature, layer) {
                var distName = feature.properties.name;
                var center = feature.properties.centroid || feature.properties.center;
                var seed = jlHashStr(distName + cityShortName);
                var metrics = generateGridMetrics(distName, seed);

                // 区县名称标注
                if (center) {
                    var displayName = distName.replace(/[市区县旗]$/, '');
                    if (displayName.length > 4) displayName = displayName.substring(0, 4) + '..';
                    L.marker([center[1], center[0]], {
                        icon: L.divIcon({
                            className: 'grid-label district-label',
                            html: '<div class="gl-name" style="font-size:11px;">' + displayName + '</div>',
                            iconSize: [70, 22], iconAnchor: [35, 11]
                        }),
                        zIndexOffset: 200
                    }).addTo(GridMap.markerGroup);
                }

                // tooltip
                var tooltipHtml = '<div class="map-hover-tip"><b>' + distName + '</b><br/>' +
                    '<span class="tip-sub">CEI: ' + metrics.ceiScore + '分 | 用户: ' + metrics.users + '户</span></div>';
                layer.bindTooltip(tooltipHtml, {
                    className: 'district-tooltip-container',
                    direction: 'top', offset: [0, -10], sticky: true
                });

                layer.on('mouseover', function() { layer.setStyle({ fillOpacity: lvl.hoverOpacity, weight: lvl.weight + 1 }); });
                layer.on('mouseout', function() { layer.setStyle({ fillOpacity: lvl.fillOpacity, weight: lvl.weight }); });

                // 点击下钻到区县内部
                layer.on('click', function(e) {
                    L.DomEvent.stopPropagation(e);
                    loadDistrictLayer(distName, feature);
                });
            }
        }).addTo(GridMap.geoLayer);

        // 自动定位到该地市 — 从GeoJSON features计算bounds
        var minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
        geojson.features.forEach(function(f) {
            var fb = getGeoJSONBBox(f);
            if (fb.minLat < minLat) minLat = fb.minLat;
            if (fb.maxLat > maxLat) maxLat = fb.maxLat;
            if (fb.minLng < minLng) minLng = fb.minLng;
            if (fb.maxLng > maxLng) maxLng = fb.maxLng;
        });
        if (minLat < Infinity) {
            GridMap.map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [25, 25] });
        }
        updateMapBreadcrumb();
        updateLayerIndicator();
    });
}

/* ============================================================
   5. 区县层 (Level 2) — 区县边界内算法生成乡镇网格
   ============================================================ */
function loadDistrictLayer(distName, feature) {
    GridMap.geoLayer.clearLayers();
    GridMap.markerGroup.clearLayers();
    GridMap.currentLevel = 2;
    GridMap.currentDistrictName = distName;
    GridMap.currentDistrictFeature = feature;
    GridMap.breadcrumb = [
        { name: '吉林省', level: -1 },
        { name: GridMap.currentCityName, level: 0 },
        { name: distName, level: 1 }
    ];

    var lvl = GRID_LEVELS[2];
    var bbox = getGeoJSONBBox(feature);

    // 绘制区县外轮廓
    L.geoJSON(feature, {
        style: {
            color: '#2b7de9', fillColor: '#e3eefa', fillOpacity: 0.12,
            weight: 2.5, dashArray: '8 5', lineCap: 'round'
        }
    }).addTo(GridMap.geoLayer);

    // 根据区县面积确定网格数量
    var area = (bbox.maxLat - bbox.minLat) * (bbox.maxLng - bbox.minLng);
    var gridCount = Math.max(4, Math.min(12, Math.floor(area * 50)));
    var seed = jlHashStr(distName + '_township');
    var rand = jlSeededRand(seed);

    // 使用GeoJSON Feature约束生成网格
    var grids = generateGridsInFeature(feature, gridCount, seed);
    if (grids.length === 0) {
        grids = generateIrregularGrids(bbox, gridCount, seed);
    }

    grids.forEach(function(grid, idx) {
        var townName = TOWNSHIP_PREFIXES[Math.floor(rand() * TOWNSHIP_PREFIXES.length)] +
                       TOWNSHIP_SUFFIXES[Math.floor(rand() * TOWNSHIP_SUFFIXES.length)];
        var tseed = jlHashStr(townName + distName);
        var metrics = generateGridMetrics(townName, tseed);
        var scoreColor = getScoreColor(metrics.ceiScore);
        var heatColor = getHeatColor(metrics.ceiScore);

        var poly = L.polygon(grid.polygon, {
            color: lvl.color, fillColor: heatColor, fillOpacity: 0.55,
            weight: 1.5, className: 'grid-polygon'
        }).addTo(GridMap.geoLayer);

        // 标签
        var shortLabel = townName.length > 5 ? townName.substring(0, 4) + '..' : townName;
        var statusColor = metrics.onlineRate >= 98 ? '#27ae60' : (metrics.onlineRate >= 96 ? '#f39c12' : '#e74c3c');

        var labelHtml =
            '<div class="mgrid-info-label">' +
                '<div class="mgrid-info-top">' +
                    '<span class="mgrid-name">' + shortLabel + '</span>' +
                    '<span class="mgrid-score-pill" style="background:' + scoreColor + '">' + metrics.ceiScore + '</span>' +
                '</div>' +
                '<div class="mgrid-info-kpi">' +
                    '<span class="mgrid-kpi-item">用户 ' + metrics.users + '</span>' +
                    '<span class="mgrid-kpi-item ' + (metrics.packetLoss > 1 ? 'alert' : '') + '">丢包 ' + metrics.packetLoss + '%</span>' +
                '</div>' +
            '</div>';

        L.marker(grid.center, {
            icon: L.divIcon({
                className: 'grid-label mgrid-label-v2',
                html: labelHtml, iconSize: [130, 56], iconAnchor: [65, 28]
            })
        }).addTo(GridMap.markerGroup);

        // tooltip
        var tooltipHtml = '<div class="map-hover-tip"><b>' + townName + '</b><br/>' +
            '<span class="tip-sub">CEI: ' + metrics.ceiScore + '分 | 用户: ' + metrics.users + '户<br/>' +
            '速率: ' + metrics.avgSpeed + 'Mbps | 时延: ' + metrics.latency + 'ms</span></div>';
        poly.bindTooltip(tooltipHtml, {
            className: 'district-tooltip-container',
            direction: 'top', offset: [0, -10], sticky: true
        });

        // 点击显示详情弹窗
        poly.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            showGridPopup(e.latlng, townName, metrics, '乡镇网格');
        });

        poly.on('mouseover', function() { poly.setStyle({ fillOpacity: 0.75, weight: 2.5 }); poly.bringToFront(); });
        poly.on('mouseout', function() { poly.setStyle({ fillOpacity: 0.55, weight: 1.5 }); });
    });

    // 添加图例
    addHealthLegend();

    var bounds = [[bbox.minLat, bbox.minLng], [bbox.maxLat, bbox.maxLng]];
    GridMap.map.fitBounds(bounds, { padding: [25, 25] });
    updateMapBreadcrumb();
    updateLayerIndicator();
}

/* ============================================================
   6. 弹窗（详细指标）
   ============================================================ */
function showGridPopup(latlng, name, metrics, levelName) {
    GridMap.map.closePopup();
    var scoreColor = getScoreColor(metrics.ceiScore);

    var mainHtml =
        '<div class="qp-row"><span class="qp-k">CEI评分</span><span class="qp-v" style="color:' + scoreColor + '">' + metrics.ceiScore + '分</span></div>' +
        '<div class="qp-row"><span class="qp-k">宽带用户数</span><span class="qp-v">' + metrics.users.toLocaleString() + '户</span></div>' +
        '<div class="qp-row"><span class="qp-k">质差用户数</span><span class="qp-v" style="color:#e74c3c">' + metrics.qualityBad + '户</span></div>' +
        '<div class="qp-row"><span class="qp-k">下载速率</span><span class="qp-v">' + metrics.avgSpeed + ' Mbps</span></div>' +
        '<div class="qp-row"><span class="qp-k">网络时延</span><span class="qp-v">' + metrics.latency + ' ms</span></div>' +
        '<div class="qp-row"><span class="qp-k">丢包率</span><span class="qp-v" style="color:' + (metrics.packetLoss > 1 ? '#e74c3c' : '#27ae60') + '">' + metrics.packetLoss + '%</span></div>' +
        '<div class="qp-row"><span class="qp-k">在线率</span><span class="qp-v">' + metrics.onlineRate + '%</span></div>' +
        '<div class="qp-row"><span class="qp-k">千兆渗透率</span><span class="qp-v">' + metrics.gigabitRate + '%</span></div>';

    var popupContent =
        '<div class="grid-popup">' +
            '<div class="gp-header">' +
                '<div class="gp-title-row">' +
                    '<span class="gp-tag">' + levelName + '</span>' +
                    '<span class="gp-name">' + name + '</span>' +
                '</div>' +
                '<span class="gp-score" style="background:' + scoreColor + '">' + metrics.ceiScore + '<small>分</small></span>' +
            '</div>' +
            '<div class="gp-main">' + mainHtml + '</div>' +
        '</div>';

    L.popup({
        className: 'grid-popup-container',
        maxWidth: 320, minWidth: 240, closeButton: true
    }).setLatLng(latlng).setContent(popupContent).openOn(GridMap.map);
}

/* ============================================================
   7. 健康度图例
   ============================================================ */
function addHealthLegend() {
    removeHealthLegend();
    var legendDiv = document.createElement('div');
    legendDiv.id = 'mgridHealthLegend';
    legendDiv.className = 'mgrid-health-legend';
    legendDiv.innerHTML =
        '<div class="mhl-title">网络健康度</div>' +
        '<div class="mhl-items">' +
            '<div class="mhl-item"><span class="mhl-dot" style="background:rgba(39,174,96,0.5)"></span>优秀 CEI≥93</div>' +
            '<div class="mhl-item"><span class="mhl-dot" style="background:rgba(243,156,18,0.5)"></span>良好 91≤CEI<93</div>' +
            '<div class="mhl-item"><span class="mhl-dot" style="background:rgba(230,126,34,0.5)"></span>关注 88≤CEI<91</div>' +
            '<div class="mhl-item"><span class="mhl-dot" style="background:rgba(231,76,60,0.5)"></span>需改善 CEI<88</div>' +
        '</div>';
    var container = document.getElementById('mapContainer');
    if (container) container.appendChild(legendDiv);
}

function removeHealthLegend() {
    var el = document.getElementById('mgridHealthLegend');
    if (el) el.parentNode.removeChild(el);
}

/* ============================================================
   8. 面包屑 & 图层指示器
   ============================================================ */
function updateMapBreadcrumb() {
    var bc = document.getElementById('mapBreadcrumb');
    if (!bc) return;
    var html = '';
    GridMap.breadcrumb.forEach(function(item, idx) {
        if (idx > 0) html += '<span class="bc-sep">›</span>';
        var isLast = idx === GridMap.breadcrumb.length - 1;
        html += '<button class="bc-item' + (isLast ? ' active' : '') + '" onclick="navigateTo(' + item.level + ')">' + item.name + '</button>';
    });
    // 图层级别标签
    var currentLvl = GRID_LEVELS[Math.min(GridMap.currentLevel, GRID_LEVELS.length - 1)];
    if (currentLvl) {
        html += '<span class="bc-level-tag" style="background:' + currentLvl.color + '">' + currentLvl.name + '</span>';
    }
    bc.innerHTML = html;
}

function updateLayerIndicator() {
    var indicator = document.getElementById('mapLayerIndicator');
    if (!indicator) return;
    var html = '';
    GRID_LEVELS.forEach(function(lvl, idx) {
        var state = idx < GridMap.currentLevel ? 'done' : (idx === GridMap.currentLevel ? 'active' : '');
        html += '<div class="li-item ' + state + '" onclick="navigateTo(' + (idx - 1) + ')" title="' + lvl.name + '">' +
            '<div class="li-dot" style="background:' + lvl.color + '"></div>' +
            '<div class="li-name">' + lvl.name + '</div>' +
            '</div>';
        if (idx < GRID_LEVELS.length - 1) {
            html += '<div class="li-line ' + (idx < GridMap.currentLevel ? 'done' : '') + '"></div>';
        }
    });
    indicator.innerHTML = html;
}

/* ============================================================
   9. 导航
   ============================================================ */
function navigateTo(level) {
    if (level <= -1) {
        loadProvinceLayer();
    } else if (level === 0 && GridMap.currentCityName) {
        var fullName = CITY_FULL_NAMES[GridMap.currentCityName] || GridMap.currentCityName + '市';
        var adcode = GridMap.currentCityAdcode;
        loadCityLayer(fullName, GridMap.currentCityName, adcode);
    }
    // Level 1 is district, can't navigate to it without context
}

function navigateBack() {
    if (GridMap.currentLevel === 2) {
        // back to city
        var fullName = CITY_FULL_NAMES[GridMap.currentCityName] || GridMap.currentCityName + '市';
        loadCityLayer(fullName, GridMap.currentCityName, GridMap.currentCityAdcode);
    } else if (GridMap.currentLevel === 1) {
        // back to province
        loadProvinceLayer();
    }
    // level 0 is top, no back
}

/* ============================================================
   10. 外部入口：显示/隐藏地图
   ============================================================ */
function showGisMap() {
    var container = document.getElementById('mapContainer');
    if (container) {
        container.style.display = 'flex';
        setTimeout(function() {
            initGridMap();
        }, 100);
    }
}

function hideGisMap() {
    var container = document.getElementById('mapContainer');
    if (container) container.style.display = 'none';
}
