/**
 * GIS视图 - 业务CEI分数下钻
 * 四级下钻：地市 → 区县 → BRAS → OLT
 * 替换 enhance-pages.js 中的 showGisMetricDrill
 */
(function () {
    if (!window.Pages) return;

    // ---- 工具函数 ----
    function _e(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function _hs(v) {
        var h = 0; v = String(v || '');
        for (var i = 0; i < v.length; i++) h = ((h << 5) - h + v.charCodeAt(i)) | 0;
        return Math.abs(h);
    }
    function _nv(s, mn, mx) {
        var x = Math.abs(Math.sin(s) * 10000) % 1;
        return Number((mn + x * (mx - mn)).toFixed(1));
    }
    function _sc(v) {
        return v >= 93 ? '#27ae60' : (v >= 90 ? '#f39c12' : '#e74c3c');
    }

    // ---- 数据定义 ----
    var _dm = {
        '\u957f\u6625': ['\u671d\u9633\u533a', '\u5357\u5173\u533a', '\u5bbd\u57ce\u533a', '\u4e8c\u9053\u533a', '\u7eff\u56ed\u533a', '\u53cc\u9633\u533a'],
        '\u5409\u6797': ['\u660c\u9091\u533a', '\u9f99\u6f6d\u533a', '\u8239\u8425\u533a', '\u4e30\u6ee1\u533a', '\u6c38\u5409\u53bf', '\u86e4\u6cb3\u5e02'],
        '\u56db\u5e73': ['\u94c1\u897f\u533a', '\u94c1\u4e1c\u533a', '\u68a8\u6811\u53bf', '\u4f0a\u901a\u53bf', '\u516c\u4e3b\u5cad\u5e02'],
        '\u8fbd\u6e90': ['\u9f99\u5c71\u533a', '\u897f\u5b89\u533a', '\u4e1c\u4e30\u53bf', '\u4e1c\u8fbd\u53bf'],
        '\u901a\u5316': ['\u4e1c\u660c\u533a', '\u4e8c\u9053\u6c5f\u533a', '\u6885\u6cb3\u53e3\u5e02', '\u96c6\u5b89\u5e02', '\u901a\u5316\u53bf'],
        '\u767d\u5c71': ['\u6d51\u6c5f\u533a', '\u6c5f\u6e90\u533a', '\u4e34\u6c5f\u5e02', '\u629a\u677e\u53bf', '\u9756\u5b87\u53bf'],
        '\u677e\u539f': ['\u5b81\u6c5f\u533a', '\u524d\u90ed\u53bf', '\u957f\u5cad\u53bf', '\u4e7e\u5b89\u53bf', '\u6276\u4f59\u5e02'],
        '\u767d\u57ce': ['\u6d2e\u5317\u533a', '\u9547\u8d49\u53bf', '\u901a\u6986\u53bf', '\u6d2e\u5357\u5e02', '\u5927\u5b89\u5e02'],
        '\u5ef6\u8fb9': ['\u5ef6\u5409\u5e02', '\u56fe\u4eec\u5e02', '\u6566\u5316\u5e02', '\u73f2\u6625\u5e02', '\u9f99\u4e95\u5e02', '\u5b89\u56fe\u53bf']
    };
    var _cc = {
        '\u957f\u6625': 'CC', '\u5409\u6797': 'JL', '\u56db\u5e73': 'SP', '\u8fbd\u6e90': 'LY',
        '\u901a\u5316': 'TH', '\u767d\u5c71': 'BS', '\u677e\u539f': 'SY', '\u767d\u57ce': 'BC', '\u5ef6\u8fb9': 'YB'
    };
    var _dc = {
        '\u671d\u9633\u533a': 'CY', '\u5357\u5173\u533a': 'NG', '\u5bbd\u57ce\u533a': 'KC', '\u4e8c\u9053\u533a': 'ED',
        '\u7eff\u56ed\u533a': 'LY', '\u53cc\u9633\u533a': 'SY', '\u660c\u9091\u533a': 'CYQ', '\u9f99\u6f6d\u533a': 'LT',
        '\u8239\u8425\u533a': 'CYG', '\u4e30\u6ee1\u533a': 'FM', '\u6c38\u5409\u53bf': 'YJ', '\u86e4\u6cb3\u5e02': 'JH',
        '\u94c1\u897f\u533a': 'TX', '\u94c1\u4e1c\u533a': 'TD', '\u68a8\u6811\u53bf': 'LS', '\u4f0a\u901a\u53bf': 'YT',
        '\u516c\u4e3b\u5cad\u5e02': 'GZL', '\u9f99\u5c71\u533a': 'LSD', '\u897f\u5b89\u533a': 'XA',
        '\u4e1c\u4e30\u53bf': 'DF', '\u4e1c\u8fbd\u53bf': 'DL', '\u4e1c\u660c\u533a': 'DC',
        '\u4e8c\u9053\u6c5f\u533a': 'EDJ', '\u6885\u6cb3\u53e3\u5e02': 'MHK', '\u96c6\u5b89\u5e02': 'JA',
        '\u901a\u5316\u53bf': 'THX', '\u6d51\u6c5f\u533a': 'HJ', '\u6c5f\u6e90\u533a': 'JY',
        '\u4e34\u6c5f\u5e02': 'LJ', '\u629a\u677e\u53bf': 'FS', '\u9756\u5b87\u53bf': 'JYX',
        '\u5b81\u6c5f\u533a': 'NJ', '\u524d\u90ed\u53bf': 'QG', '\u957f\u5cad\u53bf': 'CL',
        '\u4e7e\u5b89\u53bf': 'QA', '\u6276\u4f59\u5e02': 'FY', '\u6d2e\u5317\u533a': 'TB',
        '\u9547\u8d49\u53bf': 'ZL', '\u901a\u6986\u53bf': 'TY', '\u6d2e\u5357\u5e02': 'TN',
        '\u5927\u5b89\u5e02': 'DA', '\u5ef6\u5409\u5e02': 'YJT', '\u56fe\u4eec\u5e02': 'TM',
        '\u6566\u5316\u5e02': 'DHT', '\u73f2\u6625\u5e02': 'HC', '\u9f99\u4e95\u5e02': 'LJT', '\u5b89\u56fe\u53bf': 'AT'
    };
    var _vd = ['HW', 'ZTE', 'FH', 'ALU'];

    function _br(c, d, i) {
        return 'JL-' + (_cc[c] || 'JL') + '-' + (_dc[d] || 'HX') + '-BRAS-' + String(i).padStart(3, '0') + '-' + _vd[_hs(c + d + i) % 4];
    }
    function _ol(c, d, bi, oi) {
        var m = (bi + oi) % 2 === 0 ? 'MA5800' : 'C600';
        return 'JL-' + (_cc[c] || 'JL') + '-' + (_dc[d] || 'HX') + '-OLT-' + String(bi * 4 + oi).padStart(3, '0') + '-' + _vd[_hs(c + d + bi + oi + 1) % 4] + '-' + m;
    }

    // ---- 构建弹窗内容 ----
    function _build(mt, st) {
        var lv = st.level, cy = st.city || '', di = st.district || '', br = st.bras || '';
        var lc = { city: '#2b7de9', district: '#5ad8a6', bras: '#f39c12', olt: '#9b59b6' };
        var ll = {
            city: '\u5730\u5e02\u7ef4\u5ea6',      // 地市维度
            district: '\u533a\u53bf\u7ef4\u5ea6',   // 区县维度
            bras: 'BRAS\u7ef4\u5ea6',               // BRAS维度
            olt: 'OLT\u7ef4\u5ea6'                  // OLT维度
        };

        // 面包屑
        var bc = '<div style="display:flex;align-items:center;gap:4px;font-size:12px;margin-bottom:12px;flex-wrap:wrap;'
            + 'padding:6px 10px;background:#f8fafc;border-radius:6px;border:1px solid #e6ebf2;">';
        bc += '<span style="color:#2b7de9;cursor:pointer;" onclick="Pages._gmd(\'city\',\'' + _e(mt) + '\')">'
            + '\u5409\u6797\u7701</span>';  // 吉林省
        if (lv !== 'city') {
            bc += '<span style="color:#bbb;margin:0 2px;">\u203a</span>'
                + '<span style="color:#2b7de9;cursor:pointer;" onclick="Pages._gmd(\'district\',\'' + _e(mt) + '\')">' + _e(cy) + '</span>';
        }
        if (lv === 'bras' || lv === 'olt') {
            bc += '<span style="color:#bbb;margin:0 2px;">\u203a</span>'
                + '<span style="color:#2b7de9;cursor:pointer;" onclick="Pages._gmd(\'bras\',\'' + _e(mt) + '\')">' + _e(di) + '</span>';
        }
        if (lv === 'olt') {
            bc += '<span style="color:#bbb;margin:0 2px;">\u203a</span>'
                + '<span style="color:#555;font-size:11px;">' + _e(br) + '</span>';
        }
        bc += '<span style="margin-left:auto;padding:2px 10px;border-radius:10px;background:' + (lc[lv] || '#2b7de9')
            + ';color:#fff;font-size:11px;font-weight:600;">' + (ll[lv] || '') + '</span></div>';

        var th = '', rows = '';
        var cities = window.JilinData && JilinData.cities
            ? JilinData.cities.filter(function (x) { return x !== '\u957f\u767d\u5c71'; })
            : Object.keys(_dm);

        if (lv === 'city') {
            th = '<tr>'
                + '<th>\u65f6\u95f4</th>'                    // 时间
                + '<th>\u5730\u5e02</th>'
                + '<th>\u603b\u4f53CEI\u5206\u6570</th>'     // 总体CEI分数
                + '<th>\u4e1a\u52a1CEI\u5206\u6570</th>'     // 业务CEI分数
                + '<th>\u901a\u65adCEI\u5206\u6570</th>'     // 通断CEI分数
                + '<th>\u64cd\u4f5c</th>'                    // 操作
                + '</tr>';
            rows = cities.map(function (n) {
                var s = _hs(mt + n);
                var ov = _nv(s + 1, 88, 96), bz = _nv(s + 2, 86, 95), cn = _nv(s + 3, 87, 96);
                return '<tr>'
                    + '<td>2026-05-17 18:00</td>'
                    + '<td><a class="drill-link" style="color:#2b7de9;cursor:pointer;font-weight:500;" '
                    + 'onclick="Pages._gmdc(\'' + _e(mt) + '\',\'' + _e(n) + '\')">' + _e(n) + '</a></td>'
                    + '<td><span style="color:' + _sc(ov) + ';font-weight:600;">' + ov + '</span></td>'
                    + '<td>' + bz + '</td>'
                    + '<td>' + cn + '</td>'
                    + '<td><button class="btn" onclick="Pages.showKpiTrend(\'' + _e(n) + '\')">\u8d8b\u52bf</button></td>'  // 趋势
                    + '</tr>';
            }).join('');

        } else if (lv === 'district') {
            var dl = _dm[cy] || _dm['\u957f\u6625'];
            th = '<tr>'
                + '<th>\u65f6\u95f4</th>'
                + '<th>\u5730\u5e02</th>'
                + '<th>\u533a\u53bf</th>'
                + '<th>\u603b\u4f53CEI\u5206\u6570</th>'
                + '<th>\u4e1a\u52a1CEI\u5206\u6570</th>'
                + '<th>\u901a\u65adCEI\u5206\u6570</th>'
                + '<th>\u64cd\u4f5c</th>'
                + '</tr>';
            rows = dl.map(function (n) {
                var s = _hs(mt + cy + n);
                var ov = _nv(s + 1, 87, 96), bz = _nv(s + 2, 85, 95), cn = _nv(s + 3, 86, 96);
                return '<tr>'
                    + '<td>2026-05-17 18:00</td>'
                    + '<td>' + _e(cy) + '</td>'
                    + '<td><a class="drill-link" style="color:#16a085;cursor:pointer;font-weight:500;" '
                    + 'onclick="Pages._gmdd(\'' + _e(mt) + '\',\'' + _e(cy) + '\',\'' + _e(n) + '\')">' + _e(n) + '</a></td>'
                    + '<td><span style="color:' + _sc(ov) + ';font-weight:600;">' + ov + '</span></td>'
                    + '<td>' + bz + '</td>'
                    + '<td>' + cn + '</td>'
                    + '<td><button class="btn" onclick="Pages.showKpiTrend(\'' + _e(n) + '\')">\u8d8b\u52bf</button></td>'
                    + '</tr>';
            }).join('');

        } else if (lv === 'bras') {
            var bc2 = 4 + (_hs(cy + di) % 4);
            th = '<tr>'
                + '<th>\u65f6\u95f4</th>'
                + '<th>\u5730\u5e02</th>'
                + '<th>\u533a\u53bf</th>'
                + '<th>BRAS\u8bbe\u5907</th>'
                + '<th>\u603b\u4f53CEI\u5206\u6570</th>'
                + '<th>\u4e1a\u52a1CEI\u5206\u6570</th>'
                + '<th>\u901a\u65adCEI\u5206\u6570</th>'
                + '<th>\u5728\u7ebf\u7528\u6237</th>'
                + '<th>\u64cd\u4f5c</th>'
                + '</tr>';
            rows = '';
            for (var bi = 1; bi <= bc2; bi++) {
                var bn = _br(cy, di, bi);
                var s = _hs(mt + bn);
                var ov = _nv(s + 1, 87, 96), bz = _nv(s + 2, 85, 95), cn = _nv(s + 3, 86, 96);
                var us = 1200 + (s % 8800);
                rows += '<tr>'
                    + '<td>2026-05-17 18:00</td>'
                    + '<td>' + _e(cy) + '</td>'
                    + '<td>' + _e(di) + '</td>'
                    + '<td><a class="drill-link" style="color:#e67e22;cursor:pointer;font-size:12px;" '
                    + 'onclick="Pages._gmdb(\'' + _e(mt) + '\',\'' + _e(cy) + '\',\'' + _e(di) + '\',\'' + _e(bn) + '\',' + bi + ')">' + _e(bn) + '</a></td>'
                    + '<td><span style="color:' + _sc(ov) + ';font-weight:600;">' + ov + '</span></td>'
                    + '<td>' + bz + '</td>'
                    + '<td>' + cn + '</td>'
                    + '<td>' + us.toLocaleString() + '</td>'
                    + '<td><button class="btn" onclick="Pages.showKpiTrend(\'' + _e(bn) + '\')">\u8d8b\u52bf</button></td>'
                    + '</tr>';
            }

        } else if (lv === 'olt') {
            var bIdx = st.brasIdx || 1;
            var oc = 4 + (_hs(br) % 5);
            th = '<tr>'
                + '<th>\u65f6\u95f4</th>'
                + '<th>\u5730\u5e02</th>'
                + '<th>\u533a\u53bf</th>'
                + '<th>BRAS</th>'
                + '<th>OLT\u8bbe\u5907</th>'
                + '<th>\u603b\u4f53CEI\u5206\u6570</th>'
                + '<th>\u4e1a\u52a1CEI\u5206\u6570</th>'
                + '<th>\u901a\u65adCEI\u5206\u6570</th>'
                + '<th>\u5728\u7ebfONT</th>'
                + '<th>\u64cd\u4f5c</th>'
                + '</tr>';
            rows = '';
            for (var oi = 1; oi <= oc; oi++) {
                var on = _ol(cy, di, bIdx, oi);
                var s = _hs(mt + on);
                var ov = _nv(s + 1, 86, 96), bz = _nv(s + 2, 84, 95), cn = _nv(s + 3, 85, 96);
                var ont = 80 + (s % 420);
                rows += '<tr>'
                    + '<td>2026-05-17 18:00</td>'
                    + '<td>' + _e(cy) + '</td>'
                    + '<td>' + _e(di) + '</td>'
                    + '<td style="font-size:11px;color:#888;">' + _e(br) + '</td>'
                    + '<td style="font-size:11px;color:#555;">' + _e(on) + '</td>'
                    + '<td><span style="color:' + _sc(ov) + ';font-weight:600;">' + ov + '</span></td>'
                    + '<td>' + bz + '</td>'
                    + '<td>' + cn + '</td>'
                    + '<td>' + ont + '</td>'
                    + '<td><button class="btn" onclick="Pages.showKpiTrend(\'' + _e(on) + '\')">\u8d8b\u52bf</button></td>'
                    + '</tr>';
            }
        }

        var hint = lv !== 'olt'
            ? '<div style="font-size:11px;color:#999;margin-top:8px;">\ud83d\udca1 \u70b9\u51fb\u5e26\u989c\u8272\u540d\u79f0\u7ee7\u7eed\u4e0b\u9492</div>'  // 💡 点击带颜色名称继续下钻
            : '<div style="font-size:11px;color:#27ae60;margin-top:8px;">\u2705 \u5df2\u5230\u6700\u5e95\u5c42 OLT \u7ef4\u5ea6</div>';  // ✅ 已到最底层 OLT 维度

        return '<div>' + bc
            + '<table class="data-table"><thead>' + th + '</thead><tbody>' + rows + '</tbody></table>'
            + hint + '</div>';
    }

    // ---- 刷新弹窗内容 ----
    function _rf() {
        var el = document.querySelector('.modal-body');
        if (el) el.innerHTML = _build(Pages._gmdM || '\u4e1a\u52a1CEI\u5206\u6570\u4e0b\u9492', Pages._gmdS || { level: 'city' });
    }

    // ---- 入口：打开弹窗 ----
    Pages.showGisMetricDrill = function (metricName) {
        Pages._gmdM = metricName;
        Pages._gmdS = { level: 'city' };
        Modal.show(
            metricName + ' \u2014 \u4e1a\u52a1CEI\u5206\u6570\u4e0b\u9492',  // — 业务CEI分数下钻
            _build(metricName, Pages._gmdS),
            '<button class="btn btn-primary" onclick="Modal.close()">\u5173\u95ed</button>',  // 关闭
            '1100px'
        );
    };

    // ---- 面包屑回跳 ----
    Pages._gmd = function (level, metric) {
        if (metric) Pages._gmdM = metric;
        var s = Pages._gmdS || {};
        if (level === 'city') Pages._gmdS = { level: 'city' };
        else if (level === 'district') Pages._gmdS = { level: 'district', city: s.city };
        else if (level === 'bras') Pages._gmdS = { level: 'bras', city: s.city, district: s.district };
        _rf();
    };

    // ---- 地市 → 区县 ----
    Pages._gmdc = function (metric, city) {
        Pages._gmdM = metric;
        Pages._gmdS = { level: 'district', city: city };
        _rf();
    };

    // ---- 区县 → BRAS ----
    Pages._gmdd = function (metric, city, district) {
        Pages._gmdM = metric;
        Pages._gmdS = { level: 'bras', city: city, district: district };
        _rf();
    };

    // ---- BRAS → OLT ----
    Pages._gmdb = function (metric, city, district, bras, brasIdx) {
        Pages._gmdM = metric;
        Pages._gmdS = { level: 'olt', city: city, district: district, bras: bras, brasIdx: Number(brasIdx) };
        _rf();
    };

})();
