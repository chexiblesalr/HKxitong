/**
 * 家宽网络质量分析平台 - 地图数据模块
 * 使用阿里DataV真实GeoJSON边界数据
 * API: https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json
 * 三级下钻: 吉林省(9地市GeoJSON) → 地市(区县GeoJSON) → 区县(乡镇网格算法生成)
 */

/* ===== 地图配置 ===== */
var MAP_CFG = {
    center: [43.88, 126.55],
    zoom: 7,
    minZoom: 5,
    maxZoom: 18,
    tileUrl: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    attribution: '&copy; 高德地图',
    geoApiBase: 'https://geo.datav.aliyun.com/areas_v3/bound'
};

/* ===== 吉林省行政区划代码 ===== */
var JL_ADCODE = '220000';

/* ===== 各地市行政区划代码 ===== */
var CITY_ADCODES = {
    '长春市': '220100',
    '吉林市': '220200',
    '四平市': '220300',
    '辽源市': '220400',
    '通化市': '220500',
    '白山市': '220600',
    '松原市': '220700',
    '白城市': '220800',
    '延边朝鲜族自治州': '222400'
};

/* ===== 地市名称简称映射(用于匹配JilinData.cities) ===== */
var CITY_SHORT_NAMES = {
    '长春市': '长春',
    '吉林市': '吉林',
    '四平市': '四平',
    '辽源市': '辽源',
    '通化市': '通化',
    '白山市': '白山',
    '松原市': '松原',
    '白城市': '白城',
    '延边朝鲜族自治州': '延边'
};

var CITY_FULL_NAMES = {};
(function() {
    for (var k in CITY_SHORT_NAMES) {
        CITY_FULL_NAMES[CITY_SHORT_NAMES[k]] = k;
    }
})();

/* ===== 图层级别配置 ===== */
var GRID_LEVELS = [
    { id: 'province', name: '省级', color: '#2b7de9', fillOpacity: 0.20, weight: 2.5, hoverOpacity: 0.38 },
    { id: 'city', name: '地市', color: '#00897b', fillOpacity: 0.22, weight: 2.0, hoverOpacity: 0.40 },
    { id: 'district', name: '区县', color: '#e08c2a', fillOpacity: 0.25, weight: 1.5, hoverOpacity: 0.42 }
];

/* ===== GeoJSON缓存 ===== */
var GEO_CACHE = {};

/** 获取GeoJSON数据（带缓存 & 自动回退） */
function fetchGeoJSON(adcode, callback) {
    var fullKey = adcode + '_full';
    if (GEO_CACHE[fullKey]) {
        callback(GEO_CACHE[fullKey]);
        return;
    }

    var fullUrl = MAP_CFG.geoApiBase + '/' + adcode + '_full.json';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', fullUrl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            try {
                var data = JSON.parse(xhr.responseText);
                GEO_CACHE[fullKey] = data;
                callback(data);
                return;
            } catch(e) {
                console.warn('[GeoJSON] 解析失败:', e);
            }
        }
        // 回退到不带_full的版本
        var fallbackUrl = MAP_CFG.geoApiBase + '/' + adcode + '.json';
        var xhr2 = new XMLHttpRequest();
        xhr2.open('GET', fallbackUrl, true);
        xhr2.onreadystatechange = function() {
            if (xhr2.readyState !== 4) return;
            if (xhr2.status === 200) {
                try {
                    var data2 = JSON.parse(xhr2.responseText);
                    data2._isSingleFeature = true;
                    GEO_CACHE[adcode] = data2;
                    callback(data2);
                } catch(e2) {
                    console.error('[GeoJSON] 回退解析失败:', e2);
                    callback(null);
                }
            } else {
                console.error('[GeoJSON] 加载失败:', fallbackUrl, xhr2.status);
                callback(null);
            }
        };
        xhr2.send();
    };
    xhr.send();
}

/* ===== 工具函数 ===== */
function jlSeededRand(seed) {
    var s = Math.abs(seed);
    return function() {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function jlHashStr(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

/** GeoJSON要素的包围盒 */
function getGeoJSONBBox(feature) {
    var minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    var coords = feature.geometry.coordinates;
    function walk(arr) {
        if (typeof arr[0] === 'number') {
            if (arr[0] < minLng) minLng = arr[0];
            if (arr[0] > maxLng) maxLng = arr[0];
            if (arr[1] < minLat) minLat = arr[1];
            if (arr[1] > maxLat) maxLat = arr[1];
        } else { for (var i = 0; i < arr.length; i++) walk(arr[i]); }
    }
    walk(coords);
    return { minLat: minLat, maxLat: maxLat, minLng: minLng, maxLng: maxLng };
}

/* ===== 点-in-多边形检测 (射线法) ===== */
function pointInPolygonRing(lng, lat, ring) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0], yi = ring[i][1];
        var xj = ring[j][0], yj = ring[j][1];
        if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function isPointInFeature(lat, lng, feature) {
    var geom = feature.geometry;
    if (geom.type === 'Polygon') {
        return pointInPolygonRing(lng, lat, geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
        for (var i = 0; i < geom.coordinates.length; i++) {
            if (pointInPolygonRing(lng, lat, geom.coordinates[i][0])) return true;
        }
    }
    return false;
}

/* ===== 评分颜色 ===== */
function getScoreColor(score) {
    if (score >= 93) return '#27ae60';
    if (score >= 91) return '#f39c12';
    if (score >= 88) return '#e67e22';
    return '#e74c3c';
}

function getHeatColor(score) {
    if (score >= 93) return 'rgba(39, 174, 96, 0.35)';
    if (score >= 91) return 'rgba(243, 156, 18, 0.30)';
    if (score >= 88) return 'rgba(230, 126, 34, 0.30)';
    return 'rgba(231, 76, 60, 0.35)';
}

/** 生成区县/乡镇网格的KPI指标 */
function generateGridMetrics(name, seed) {
    var rand = jlSeededRand(seed || jlHashStr(name));
    var ceiScore = (88 + rand() * 7).toFixed(1);
    var users = Math.floor(1000 + rand() * 50000);
    var qualityBad = Math.floor(users * (0.01 + rand() * 0.05));
    var avgSpeed = (80 + rand() * 120).toFixed(1);
    var latency = (10 + rand() * 30).toFixed(1);
    var packetLoss = (rand() * 2).toFixed(2);
    var onlineRate = (95 + rand() * 4.5).toFixed(1);
    var gigabitRate = (15 + rand() * 50).toFixed(1);

    return {
        ceiScore: parseFloat(ceiScore),
        users: users,
        qualityBad: qualityBad,
        avgSpeed: parseFloat(avgSpeed),
        latency: parseFloat(latency),
        packetLoss: parseFloat(packetLoss),
        onlineRate: parseFloat(onlineRate),
        gigabitRate: parseFloat(gigabitRate)
    };
}

/**
 * 在一个真实 GeoJSON Feature 的多边形边界内生成不规则网格
 */
function generateGridsInFeature(feature, count, seed) {
    var bbox = getGeoJSONBBox(feature);
    var rand = jlSeededRand(seed);
    var latRange = bbox.maxLat - bbox.minLat;
    var lngRange = bbox.maxLng - bbox.minLng;

    var centers = [];
    var attempts = 0;
    var maxAttempts = count * 80;
    while (centers.length < count && attempts < maxAttempts) {
        var lat = bbox.minLat + rand() * latRange;
        var lng = bbox.minLng + rand() * lngRange;
        if (isPointInFeature(lat, lng, feature)) {
            centers.push({ lat: lat, lng: lng });
        }
        attempts++;
    }
    // 补足
    if (centers.length < count) {
        var aspect = lngRange / (latRange || 0.001);
        var cols = Math.max(2, Math.round(Math.sqrt(count * aspect)));
        var rows = Math.max(2, Math.ceil(count / cols));
        for (var r = 0; r < rows && centers.length < count; r++) {
            for (var c = 0; c < cols && centers.length < count; c++) {
                var lat2 = bbox.minLat + (r + 0.5) / rows * latRange;
                var lng2 = bbox.minLng + (c + 0.5) / cols * lngRange;
                if (isPointInFeature(lat2, lng2, feature)) {
                    centers.push({ lat: lat2, lng: lng2 });
                }
            }
        }
    }

    var avgRadius = Math.sqrt(latRange * lngRange / Math.max(count, 1)) * 0.45;
    var grids = [];
    for (var ci = 0; ci < centers.length; ci++) {
        var s = centers[ci];
        var nVerts = 6 + Math.floor(rand() * 4);
        var polygon = [];
        var rLat = avgRadius * (0.6 + rand() * 0.4);
        var rLng = avgRadius * (lngRange / latRange) * (0.6 + rand() * 0.4);
        for (var v = 0; v < nVerts; v++) {
            var angle = (Math.PI * 2 * v) / nVerts + (rand() - 0.5) * 0.4;
            var rFactor = 0.5 + rand() * 0.5;
            var plat = s.lat + rLat * rFactor * Math.sin(angle);
            var plng = s.lng + rLng * rFactor * Math.cos(angle);
            if (!isPointInFeature(plat, plng, feature)) {
                for (var step = 0; step < 10; step++) {
                    plat = (plat + s.lat) / 2;
                    plng = (plng + s.lng) / 2;
                    if (isPointInFeature(plat, plng, feature)) break;
                }
            }
            polygon.push([plat, plng]);
        }
        grids.push({
            polygon: polygon,
            center: [s.lat, s.lng],
            bbox: {
                minLat: Math.min.apply(null, polygon.map(function(p) { return p[0]; })),
                maxLat: Math.max.apply(null, polygon.map(function(p) { return p[0]; })),
                minLng: Math.min.apply(null, polygon.map(function(p) { return p[1]; })),
                maxLng: Math.max.apply(null, polygon.map(function(p) { return p[1]; }))
            }
        });
    }
    return grids;
}

/** 生成不规则网格（Voronoi风格） — 不需要 GeoJSON Feature */
function generateIrregularGrids(bbox, count, seed) {
    var rand = jlSeededRand(seed);
    var latRange = bbox.maxLat - bbox.minLat;
    var lngRange = bbox.maxLng - bbox.minLng;
    var aspect = lngRange / (latRange || 0.001);
    var cols = Math.max(2, Math.round(Math.sqrt(count * aspect)));
    var rows = Math.max(2, Math.ceil(count / cols));
    var actualCount = Math.min(count, rows * cols);

    var seeds = [];
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            if (seeds.length >= actualCount) break;
            var baseLat = bbox.minLat + (r + 0.5) / rows * latRange;
            var baseLng = bbox.minLng + (c + 0.5) / cols * lngRange;
            var jLat = (rand() - 0.5) * latRange / rows * 0.55;
            var jLng = (rand() - 0.5) * lngRange / cols * 0.55;
            seeds.push({
                lat: Math.max(bbox.minLat + latRange * 0.05, Math.min(bbox.maxLat - latRange * 0.05, baseLat + jLat)),
                lng: Math.max(bbox.minLng + lngRange * 0.05, Math.min(bbox.maxLng - lngRange * 0.05, baseLng + jLng))
            });
        }
    }

    var grids = [];
    for (var si = 0; si < seeds.length; si++) {
        var s = seeds[si];
        var nVerts = 6 + Math.floor(rand() * 4);
        var polygon = [];
        var rLat2 = latRange / rows * (0.45 + rand() * 0.2);
        var rLng2 = lngRange / cols * (0.45 + rand() * 0.2);
        for (var v = 0; v < nVerts; v++) {
            var angle2 = (Math.PI * 2 * v) / nVerts + (rand() - 0.5) * 0.4;
            var rFactor2 = 0.7 + rand() * 0.6;
            var lat3 = s.lat + rLat2 * rFactor2 * Math.sin(angle2);
            var lng3 = s.lng + rLng2 * rFactor2 * Math.cos(angle2);
            polygon.push([
                Math.max(bbox.minLat, Math.min(bbox.maxLat, lat3)),
                Math.max(bbox.minLng, Math.min(bbox.maxLng, lng3))
            ]);
        }
        grids.push({
            polygon: polygon,
            center: [s.lat, s.lng],
            bbox: {
                minLat: Math.min.apply(null, polygon.map(function(p) { return p[0]; })),
                maxLat: Math.max.apply(null, polygon.map(function(p) { return p[0]; })),
                minLng: Math.min.apply(null, polygon.map(function(p) { return p[1]; })),
                maxLng: Math.max.apply(null, polygon.map(function(p) { return p[1]; }))
            }
        });
    }
    return grids;
}

/* ===== 乡镇/街道名称模板 ===== */
var TOWNSHIP_SUFFIXES = ['街道', '镇', '乡', '开发区', '工业园区'];
var TOWNSHIP_PREFIXES = [
    '东风', '朝阳', '南关', '宽城', '绿园', '双阳', '九台',
    '丰满', '龙潭', '昌邑', '船营', '铁东', '铁西', '公主岭',
    '梨树', '伊通', '双辽', '龙山', '西安', '东辽', '东丰',
    '东昌', '二道江', '梅河口', '集安', '辉南', '柳河',
    '浑江', '江源', '临江', '抚松', '靖宇', '长白',
    '宁江', '前郭', '长岭', '乾安', '扶余',
    '洮北', '镇赉', '通榆', '洮南', '大安',
    '延吉', '图们', '敦化', '珲春', '龙井', '和龙', '汪清', '安图'
];
