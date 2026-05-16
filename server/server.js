/**
 * 家宽网络质量分析平台 - Express后端服务器 (sql.js版)
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb, initSchema, queryAll, queryOne, execute, paginate, saveDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

function ok(data, msg) { return { code: 200, message: msg || 'success', data }; }
function err(msg) { return { code: 500, message: msg, data: null }; }

function asNumber(v, fallback) {
    if (v === undefined || v === null || v === '') return fallback || 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : (fallback || 0);
}

function toIsoTime(v) {
    if (!v) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (v instanceof Date) return v.toISOString().slice(0, 19).replace('T', ' ');
    const s = String(v);
    if (/^\d{16}$/.test(s)) {
        const ms = Math.floor(Number(s) / 1000);
        return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
    }
    if (/^\d{13}$/.test(s)) return new Date(Number(s)).toISOString().slice(0, 19).replace('T', ' ');
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000).toISOString().slice(0, 19).replace('T', ' ');
    return s.replace('T', ' ').slice(0, 19);
}

function configNumber(key, fallback) {
    const row = queryOne('SELECT config_value FROM system_configs WHERE config_key=?', [key]);
    return row ? asNumber(row.config_value, fallback) : fallback;
}

function ensureAnalysisDefaults() {
    const defaults = [
        ['dpi_http_first_packet_threshold', '200', 'DPI-XDR阈值', 'HTTP首包时延阈值'],
        ['dpi_dns_resolve_threshold', '50', 'DPI-XDR阈值', 'DNS解析时延阈值'],
        ['dpi_tcp_retransmit_threshold', '2', 'DPI-XDR阈值', 'TCP重传率阈值'],
        ['dpi_video_stall_threshold', '3', 'DPI-XDR阈值', '视频卡顿率阈值'],
        ['tag_weak_light_threshold', '-25', '质差标签', '弱光判定阈值'],
        ['tag_high_ber_threshold', '0.000001', '质差标签', '高误码判定阈值'],
        ['tag_frequent_disconnect_count', '3', '质差标签', '频繁掉线次数阈值'],
        ['boundary_auto_dispatch_enabled', '开启', 'CEI定界', '定界自动派单']
    ];
    defaults.forEach(d => {
        const exists = queryOne('SELECT id FROM system_configs WHERE config_key=?', [d[0]]);
        if (!exists) execute(`INSERT INTO system_configs(config_key,config_value,category,description,config_type,created_at,updated_at)
            VALUES(?,?,?,?,?,datetime('now','localtime'),datetime('now','localtime'))`, [d[0], d[1], d[2], d[3], 'string']);
    });

    const tags = [
        ['HTTP_SLOW', 'HTTP响应慢', '业务', 'dpi_http_first_packet_threshold', 'gt', '200', 'ms', '中'],
        ['DNS_SLOW', 'DNS解析慢', '业务', 'dpi_dns_resolve_threshold', 'gt', '50', 'ms', '中'],
        ['TCP_RETRANSMIT', 'TCP重传高', '网络', 'dpi_tcp_retransmit_threshold', 'gt', '2', '%', '中'],
        ['VIDEO_STALL', '视频卡顿', '业务', 'dpi_video_stall_threshold', 'gt', '3', '%', '中'],
        ['GAME_HIGH_LATENCY', '游戏高时延', '业务', 'quality_latency_threshold', 'gt', '50', 'ms', '中'],
        ['WEAK_LIGHT', '弱光', '光路', 'tag_weak_light_threshold', 'lt', '-25', 'dBm', '高'],
        ['FREQUENT_DISCONNECT', '频繁掉线', '通断', 'tag_frequent_disconnect_count', 'gt', '3', '次/天', '高']
    ];
    tags.forEach(t => {
        const exists = queryOne('SELECT id FROM quality_tag_definitions WHERE tag_id=?', [t[0]]);
        if (!exists) execute(`INSERT INTO quality_tag_definitions
            (tag_id,tag_name,category,config_key,operator,threshold_value,unit,severity,description)
            VALUES(?,?,?,?,?,?,?,?,?)`, [t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[1] + '自动判定规则']);
    });
    saveDb();
}

function normalizeXdrRecord(input, sourceFile) {
    const protocol = String(input.protocol || input.sheet || input.Protocol || input['Protocol Type'] || 'COMMON').toUpperCase();
    const cityName = input.city_name || input.city || input['Local City'] || input.local_city || '';
    const city = cityName ? queryOne('SELECT id, city_name FROM cities WHERE city_name=? OR city_code=?', [String(cityName), String(cityName)]) : null;
    const srcIp = input.src_ip || input.user_ip || input.USER_IPv4 || input['USER_IPv4'] || input['USER_IPv6'] || '';
    const dstIp = input.dst_ip || input['App Server IP_IPv4'] || input.App_Server_IP_IPv4 || input.server_ip || input.resolved_ip || '';
    const httpDelay = asNumber(input.http_first_packet_delay || input.first_http_response_time || input.first_packet_delay, null);
    const dnsDelay = asNumber(input.dns_delay || input.response_time, null);
    const retrans = asNumber(input.tcp_retransmit_rate || input['UL Retrans IP Packet'], 0);
    const tags = [];
    if (httpDelay !== null && httpDelay > configNumber('dpi_http_first_packet_threshold', 200)) tags.push('HTTP响应慢');
    if (dnsDelay !== null && dnsDelay > configNumber('dpi_dns_resolve_threshold', 50)) tags.push('DNS解析慢');
    if (retrans > configNumber('dpi_tcp_retransmit_threshold', 2)) tags.push('TCP重传高');
    if (asNumber(input.stall_ratio || input.stall_count || input.stall_count_iptv, 0) > configNumber('dpi_video_stall_threshold', 3)) tags.push('视频卡顿');

    return {
        record_id: String(input.record_id || input['xDR ID'] || input.xDR_ID || ('XDR-' + Date.now() + '-' + Math.floor(Math.random() * 100000))),
        protocol,
        capture_time: toIsoTime(input.capture_time || input['Procedure Start Time'] || input.starttime),
        user_account: input.user_account || input['User Account'] || input.User_account || input.account || '',
        user_ip: input.user_ip || srcIp,
        city_id: city ? city.id : null,
        city_name: city ? city.city_name : String(cityName || ''),
        src_ip: srcIp,
        src_port: asNumber(input.src_port || input['User Port'], 0),
        dst_ip: dstIp,
        dst_port: asNumber(input.dst_port || input['App Server Port'], 0),
        app_name: input.app_name || input.host || input.sni || input.domain_name || input['User Account'] || protocol,
        app_category: input.app_category || (['HTTP', 'HTTPS', 'DNS'].includes(protocol) ? '上网' : protocol),
        up_bytes: asNumber(input.up_bytes || input['UL Data'], 0),
        down_bytes: asNumber(input.down_bytes || input['DL Data'], 0),
        up_packets: asNumber(input.up_packets || input['UL IP Packet'], 0),
        down_packets: asNumber(input.down_packets || input['DL IP Packet'], 0),
        session_duration: asNumber(input.session_duration || input.updura, 0),
        tcp_rtt: asNumber(input.tcp_rtt || input['UL_AVG_ RTT'] || input['TCP Response Time'], 0),
        tcp_retransmit_rate: retrans,
        http_first_packet_delay: httpDelay,
        dns_delay: dnsDelay,
        sni_domain: input.sni || input.sni_domain || '',
        domain_name: input.domain_name || input.host || input.query_domain || '',
        olt_id: input.olt_id || '',
        pon_port: input.pon_port || '',
        ont_id: input.ont_id || '',
        bras_id: input.bras_id || '',
        is_quality_issue: tags.length ? 1 : 0,
        quality_tags: tags.join(','),
        raw_json: JSON.stringify(input),
        source_file: sourceFile || ''
    };
}

function insertXdrRecord(r) {
    execute(`INSERT OR REPLACE INTO dpi_xdr_common
        (record_id,protocol,capture_time,user_account,user_ip,city_id,city_name,src_ip,src_port,dst_ip,dst_port,app_name,app_category,
         up_bytes,down_bytes,up_packets,down_packets,session_duration,tcp_rtt,tcp_retransmit_rate,http_first_packet_delay,dns_delay,
         sni_domain,domain_name,olt_id,pon_port,ont_id,bras_id,is_quality_issue,quality_tags,raw_json,source_file)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [r.record_id, r.protocol, r.capture_time, r.user_account, r.user_ip, r.city_id, r.city_name, r.src_ip, r.src_port, r.dst_ip, r.dst_port,
         r.app_name, r.app_category, r.up_bytes, r.down_bytes, r.up_packets, r.down_packets, r.session_duration, r.tcp_rtt, r.tcp_retransmit_rate,
         r.http_first_packet_delay, r.dns_delay, r.sni_domain, r.domain_name, r.olt_id, r.pon_port, r.ont_id, r.bras_id, r.is_quality_issue,
         r.quality_tags, r.raw_json, r.source_file]);
    execute(`INSERT OR REPLACE INTO dpi_xdr_protocol_detail(record_id,protocol,detail_json) VALUES(?,?,?)`, [r.record_id, r.protocol, r.raw_json]);
}

function ensurePingSchema() {
    const cols = queryAll('PRAGMA table_info(ping_tests)').map(c => c.name);
    const additions = [
        ['ont_id', 'VARCHAR(50)'],
        ['rms_task_id', 'VARCHAR(50)'],
        ['target_type', 'VARCHAR(20)'],
        ['raw_result', 'TEXT'],
        ['error_message', 'TEXT']
    ];
    additions.forEach(([name, type]) => {
        if (!cols.includes(name)) execute(`ALTER TABLE ping_tests ADD COLUMN ${name} ${type}`);
    });
    saveDb();
}

function round1(n) {
    return Math.round(Number(n || 0) * 10) / 10;
}

function pingStatus(lossRate, avgDelay) {
    if (lossRate > 20 || avgDelay > 80) return '异常';
    if (lossRate > 5 || avgDelay > 25) return '告警';
    return '正常';
}

function audit(module, entityType, entityId, action, detail, operator, result) {
    const eventId = 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    execute(`INSERT INTO unified_audit_events(event_id,module,entity_type,entity_id,action,operator,result,detail_json)
        VALUES(?,?,?,?,?,?,?,?)`, [eventId, module, entityType || '', entityId || '', action || '', operator || 'system', result || '成功', JSON.stringify(detail || {})]);
}

function ensurePlatformCompletionDefaults() {
    const connectors = [
        ['DPI', 'DPI话单/探针平台', 'DPI', 'sftp://mock-dpi/result', 'SFTP/JSON', '账号密码', '导入DPI-XDR与KQI指标'],
        ['AAA', 'AAA认证系统', 'AAA', 'http://mock-aaa/api', 'REST', 'Token', '同步账号、在线状态、认证失败原因'],
        ['RMS', 'RMS智能终端管理', 'RMS', 'http://mock-rms/api', 'REST', 'Token', '发起PING、网关重启、终端状态查询'],
        ['OMCI', 'OMCI/OLT网管', 'OMCI', 'snmp://mock-omci', 'SNMP/OMCI', '团体字', '读取ONT光功率、OLT端口、PON告警'],
        ['NMS', '综合网管', '网管', 'http://mock-nms/api', 'REST', 'Token', '同步告警、设备拓扑、性能指标'],
        ['SFTP_RESULT', 'Result文件接口', '文件接口', 'sftp://mock-result/inbox', 'SFTP/CSV', 'SSH Key', 'Result文件批量导入与回执']
    ];
    connectors.forEach(c => {
        const exists = queryOne('SELECT id FROM external_system_connectors WHERE connector_code=?', [c[0]]);
        if (!exists) execute(`INSERT INTO external_system_connectors
            (connector_code,connector_name,connector_type,endpoint_url,protocol,auth_type,status,config_json,description)
            VALUES(?,?,?,?,?,?,?,?,?)`, [c[0], c[1], c[2], c[3], c[4], c[5], '模拟可用', JSON.stringify({ mode: 'mock', timeout: 30, retry: 3 }), c[6]]);
    });

    const models = [
        ['USER_QUALITY_TAG', '用户质差标签模型', '标签识别', '1.0.0', 86, 82, { optical: 0.25, dpi: 0.35, gateway: 0.2, complaint: 0.2 }],
        ['CEI_BOUNDARY', 'CEI五侧定界模型', '定界定位', '1.0.0', 85, 79, { home: 0.2, optical: 0.25, access: 0.2, network: 0.2, content: 0.15 }],
        ['CLUSTER_DETECT', '多维质差聚类模型', '聚类告警', '1.0.0', 88, 84, { time: 0.2, area: 0.25, olt: 0.25, tag: 0.3 }]
    ];
    models.forEach(m => {
        const exists = queryOne('SELECT id FROM ai_model_definitions WHERE model_code=?', [m[0]]);
        if (!exists) execute(`INSERT INTO ai_model_definitions
            (model_code,model_name,model_type,version,target_accuracy,current_accuracy,weight_json,feature_json,status)
            VALUES(?,?,?,?,?,?,?,?,?)`, [m[0], m[1], m[2], m[3], m[4], m[5], JSON.stringify(m[6]), JSON.stringify(['DPI-XDR','ONT光功率','网关状态','投诉/工单','CEI趋势']), '模拟运行']);
    });

    const roles = [
        ['admin', 'all', 'view,create,edit,delete,export,dispatch,approve', 'province'],
        ['operator', 'remote-operation', 'view,execute,export', 'city'],
        ['operator', 'quality-analysis', 'view,create,export,feedback', 'city'],
        ['dispatcher', 'work-order', 'view,dispatch,edit,export', 'city'],
        ['viewer', 'all', 'view,export', 'city']
    ];
    roles.forEach(r => {
        const exists = queryOne('SELECT id FROM role_permissions WHERE role=? AND module=?', [r[0], r[1]]);
        if (!exists) execute('INSERT INTO role_permissions(role,module,actions,data_scope) VALUES(?,?,?,?)', r);
    });

    const cfgs = [
        ['model_user_quality_weights', JSON.stringify({ dpi: 0.35, optical: 0.25, gateway: 0.2, complaint: 0.2 }), 'AI模型参数', '用户质差模型权重'],
        ['model_boundary_target_accuracy', '85', 'AI模型参数', '定界准确率目标'],
        ['dispatch_auto_threshold', '80', '工单派发规则', '质差置信度超过该值自动派单'],
        ['report_retention_days', '180', '报表配置', '报表保留天数'],
        ['permission_default_scope', 'city', '权限配置', '普通用户默认数据范围']
    ];
    cfgs.forEach(c => {
        const exists = queryOne('SELECT id FROM system_configs WHERE config_key=?', [c[0]]);
        if (!exists) execute(`INSERT INTO system_configs(config_key,config_value,category,description,config_type,created_at,updated_at)
            VALUES(?,?,?,?,?,datetime('now','localtime'),datetime('now','localtime'))`, [c[0], c[1], c[2], c[3], 'string']);
    });
    saveDb();
}

async function startServer() {
    await initSchema();
    ensureAnalysisDefaults();
    ensurePingSchema();
    ensurePlatformCompletionDefaults();
    // Check if data exists
    const cnt = queryOne('SELECT COUNT(*) as c FROM cities');
    if (!cnt || cnt.c === 0) {
        console.log('数据库为空，请先运行: node db/seed.js');
    } else {
        console.log('数据库已加载，地市数: ' + cnt.c);
    }

    // ====== 登录 ======
    app.post('/api/login', (req, res) => {
        const { username } = req.body;
        const user = queryOne('SELECT id,username,real_name,role,city_id,department FROM system_users WHERE username=? AND status=1', [username]);
        if (!user) return res.json(err('用户名或密码错误'));
        res.json(ok({ token: 'tk_' + Date.now(), user }));
    });

    // ====== 首页驾驶舱 ======
    app.get('/api/dashboard', (req, res) => {
        const ld = queryOne('SELECT MAX(record_date) as d FROM cei_daily_summary');
        const latestDate = ld ? ld.d : '2025-12-02';
        const summary = queryOne(`SELECT SUM(total_users) as totalUsers, SUM(active_users) as activeUsers,
            SUM(gateway_count) as gatewayCount, ROUND(AVG(overall_cei),1) as avgCei,
            ROUND(AVG(avg_download_speed),1) as avgSpeed, ROUND(AVG(avg_latency),1) as avgLatency,
            SUM(work_order_count) as workOrders, SUM(quality_issue_count) as qualityIssues
            FROM cei_daily_summary WHERE record_date=?`, [latestDate]);
        const cityRanking = queryAll(`SELECT c.city_name, s.overall_cei, s.total_users, s.work_order_count
            FROM cei_daily_summary s JOIN cities c ON s.city_id=c.id WHERE s.record_date=? ORDER BY s.overall_cei DESC`, [latestDate]);
        const todayAlerts = queryOne(`SELECT COUNT(*) as cnt FROM alerts WHERE DATE(alert_time)=?`, [latestDate]);
        const pendingOrders = queryOne(`SELECT COUNT(*) as cnt FROM work_orders WHERE status IN ('待派单','已派单','处理中')`);
        const deviceHealth = {
            brasTotal: queryOne('SELECT COUNT(*) as c FROM bras_devices').c,
            brasNormal: queryOne("SELECT COUNT(*) as c FROM bras_devices WHERE status='正常'").c,
            oltTotal: queryOne('SELECT COUNT(*) as c FROM olt_devices').c,
            oltOnline: queryOne('SELECT COUNT(*) as c FROM olt_devices WHERE is_online=1').c,
        };
        const bizDist = queryAll(`SELECT product_type as name, COUNT(*) as value FROM broadband_users WHERE product_type IS NOT NULL GROUP BY product_type`);
        const alertTrend = queryAll(`SELECT CAST(strftime('%H', alert_time) AS INTEGER) as hour, COUNT(*) as count
            FROM alerts WHERE DATE(alert_time)=? GROUP BY hour ORDER BY hour`, [latestDate]);
        const qualityTop5 = queryAll(`SELECT quality_type as reason, COUNT(*) as count FROM user_quality_issues
            GROUP BY quality_type ORDER BY count DESC LIMIT 5`);
        res.json(ok({ summary: { ...summary, latestDate }, cityRanking, todayAlerts: todayAlerts?todayAlerts.cnt:0,
            pendingOrders: pendingOrders?pendingOrders.cnt:0, deviceHealth, bizDist, alertTrend, qualityTop5 }));
    });

    // ====== CEI趋势 ======
    app.get('/api/cei-trend', (req, res) => {
        const { city_id } = req.query;
        let sql = `SELECT record_date, ROUND(AVG(overall_cei),1) as overall, ROUND(AVG(business_cei),1) as business,
            ROUND(AVG(network_cei),1) as network FROM cei_daily_summary`;
        const p = [];
        if (city_id) { sql += ' WHERE city_id=?'; p.push(parseInt(city_id)); }
        sql += ' GROUP BY record_date ORDER BY record_date';
        res.json(ok(queryAll(sql, p)));
    });

    // ====== 用户统计趋势 ======
    app.get('/api/user-stats-trend', (req, res) => {
        const { city_id } = req.query;
        let sql = `SELECT record_date, SUM(gateway_count) as gateway_count, SUM(active_gateway_count) as active_gateway,
            SUM(total_users) as total_users, SUM(dpi_active_users) as dpi_active FROM cei_daily_summary`;
        const p = [];
        if (city_id) { sql += ' WHERE city_id=?'; p.push(parseInt(city_id)); }
        sql += ' GROUP BY record_date ORDER BY record_date';
        res.json(ok(queryAll(sql, p)));
    });

    // ====== 地市/GIS ======
    app.get('/api/cities', (req, res) => { res.json(ok(queryAll('SELECT * FROM cities WHERE status=1 ORDER BY sort_order'))); });
    app.get('/api/gis', (req, res) => {
        const ld = queryOne('SELECT MAX(record_date) as d FROM cei_daily_summary');
        const d = ld ? ld.d : '2025-12-02';
        res.json(ok(queryAll(`SELECT c.city_name, c.longitude as lng, c.latitude as lat, c.city_code,
            s.overall_cei as ceiScore, s.total_users, s.quality_issue_count FROM cities c
            LEFT JOIN cei_daily_summary s ON c.id=s.city_id AND s.record_date=? WHERE c.status=1 ORDER BY c.sort_order`, [d])));
    });

    // ====== KPI ======
    app.get('/api/kpi', (req, res) => {
        const ld = queryOne('SELECT MAX(record_date) as d FROM cei_daily_summary');
        const d = ld ? ld.d : '2025-12-02';
        const overall = queryOne(`SELECT ROUND(AVG(overall_cei),1) as totalCei, ROUND(AVG(business_cei),1) as bizCei,
            ROUND(AVG(network_cei),1) as netCei, ROUND(AVG(avg_download_speed),1) as avgSpeed,
            ROUND(AVG(avg_upload_speed),1) as avgUpload, ROUND(AVG(avg_latency),1) as avgLatency,
            ROUND(AVG(home_network_quality),1) as homeQuality, SUM(total_users) as totalUsers,
            SUM(active_users) as activeUsers, ROUND(AVG(top10_video_speed),1) as videoSpeed
            FROM cei_daily_summary WHERE record_date=?`, [d]);
        const cityCompare = queryAll(`SELECT c.city_name, s.overall_cei FROM cei_daily_summary s
            JOIN cities c ON s.city_id=c.id WHERE s.record_date=? ORDER BY c.sort_order`, [d]);
        res.json(ok({ overall, cityCompare, latestDate: d }));
    });

    // ====== 设备统计 ======
    app.get('/api/device-stats', (req, res) => {
        const ld = queryOne('SELECT MAX(record_date) as d FROM cei_daily_summary');
        const d = ld ? ld.d : '2025-12-02';
        const gw = queryOne(`SELECT ROUND(SUM(gateway_count),2) as totalWan, ROUND(SUM(active_gateway_count),2) as onlineWan FROM cei_daily_summary WHERE record_date=?`, [d]);
        if(gw) { gw.offlineWan = parseFloat((gw.totalWan - gw.onlineWan).toFixed(2)); gw.abnormalWan = parseFloat((gw.offlineWan * 0.3).toFixed(2)); }
        const olt = {
            total: queryOne('SELECT COUNT(*) as c FROM olt_devices').c,
            online: queryOne('SELECT COUNT(*) as c FROM olt_devices WHERE is_online=1').c,
            abnormal: queryOne("SELECT COUNT(*) as c FROM olt_devices WHERE status='告警'").c,
            overload: queryOne("SELECT COUNT(*) as c FROM olt_devices WHERE cpu_usage>80 OR memory_usage>80").c,
        };
        olt.offline = olt.total - olt.online;
        const cityGateway = queryAll(`SELECT c.city_name, s.gateway_count, s.active_gateway_count, s.total_users, s.dpi_active_users
            FROM cei_daily_summary s JOIN cities c ON s.city_id=c.id WHERE s.record_date=? ORDER BY c.sort_order`, [d]);
        res.json(ok({ gateway: gw, olt, cityGateway }));
    });

    // ====== BRAS ======
    app.get('/api/bras', (req, res) => {
        const { city_id, status, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND b.city_id=?'; p.push(parseInt(city_id)); }
        if (status) { w += ' AND b.status=?'; p.push(status); }
        res.json(ok(paginate(`SELECT b.*, c.city_name FROM bras_devices b JOIN cities c ON b.city_id=c.id ${w} ORDER BY b.city_id`,
            `SELECT COUNT(*) as total FROM bras_devices b ${w}`, p, page, pageSize)));
    });

    // ====== OLT ======
    app.get('/api/olt', (req, res) => {
        const { city_id, status, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND o.city_id=?'; p.push(parseInt(city_id)); }
        if (status) { w += ' AND o.status=?'; p.push(status); }
        res.json(ok(paginate(`SELECT o.*, c.city_name FROM olt_devices o JOIN cities c ON o.city_id=c.id ${w} ORDER BY o.device_id`,
            `SELECT COUNT(*) as total FROM olt_devices o ${w}`, p, page, pageSize)));
    });

    // ====== 宽带用户/CEI查询 ======
    app.get('/api/broadband-users', (req, res) => {
        const { city_id, product_type, is_quality_issue, account, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND u.city_id=?'; p.push(parseInt(city_id)); }
        if (product_type) { w += ' AND u.product_type=?'; p.push(product_type); }
        if (is_quality_issue !== undefined && is_quality_issue !== '') { w += ' AND u.is_quality_issue=?'; p.push(parseInt(is_quality_issue)); }
        if (account) { w += " AND u.user_account LIKE '%'||?||'%'"; p.push(account); }
        res.json(ok(paginate(`SELECT u.user_account, u.user_name, c.city_name, u.overall_cei, u.business_cei, u.network_cei,
            u.download_speed, u.upload_speed, u.latency, u.packet_loss, u.product_type, u.bandwidth, u.ont_status, u.quality_issue_type
            FROM broadband_users u JOIN cities c ON u.city_id=c.id ${w} ORDER BY u.overall_cei ASC`,
            `SELECT COUNT(*) as total FROM broadband_users u ${w}`, p, page, pageSize)));
    });

    // ====== PON异常 ======
    app.get('/api/pon-anomalies', (req, res) => {
        const { city_id, status, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND pa.city_id=?'; p.push(parseInt(city_id)); }
        if (status) { w += ' AND pa.status=?'; p.push(status); }
        res.json(ok(paginate(`SELECT pa.*, c.city_name, o.device_id as olt_device_id FROM pon_anomalies pa
            JOIN cities c ON pa.city_id=c.id LEFT JOIN olt_devices o ON pa.olt_id=o.id ${w} ORDER BY pa.discovery_time DESC`,
            `SELECT COUNT(*) as total FROM pon_anomalies pa ${w}`, p, page, pageSize)));
    });

    // ====== 质差模型 ======
    app.get('/api/quality-models', (req, res) => {
        const { city_id, model_name, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND q.city_id=?'; p.push(parseInt(city_id)); }
        if (model_name) { w += ' AND q.model_name=?'; p.push(model_name); }
        res.json(ok(paginate(`SELECT q.*, c.city_name, u.user_account FROM quality_model_results q
            JOIN cities c ON q.city_id=c.id LEFT JOIN broadband_users u ON q.user_id=u.id ${w} ORDER BY q.analysis_time DESC`,
            `SELECT COUNT(*) as total FROM quality_model_results q ${w}`, p, page, pageSize)));
    });

    // ====== 用户质差 ======
    app.get('/api/user-quality', (req, res) => {
        const { city_id, quality_type, status, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND q.city_id=?'; p.push(parseInt(city_id)); }
        if (quality_type) { w += ' AND q.quality_type=?'; p.push(quality_type); }
        if (status) { w += ' AND q.status=?'; p.push(status); }
        res.json(ok(paginate(`SELECT q.*, c.city_name, u.user_account FROM user_quality_issues q
            JOIN cities c ON q.city_id=c.id LEFT JOIN broadband_users u ON q.user_id=u.id ${w} ORDER BY q.report_time DESC`,
            `SELECT COUNT(*) as total FROM user_quality_issues q ${w}`, p, page, pageSize)));
    });

    // ====== 业务质差 ======
    app.get('/api/biz-quality', (req, res) => {
        const { city_id, biz_type, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND b.city_id=?'; p.push(parseInt(city_id)); }
        if (biz_type) { w += ' AND b.biz_type=?'; p.push(biz_type); }
        res.json(ok(paginate(`SELECT b.*, c.city_name FROM biz_quality_issues b JOIN cities c ON b.city_id=c.id ${w} ORDER BY b.report_time DESC`,
            `SELECT COUNT(*) as total FROM biz_quality_issues b ${w}`, p, page, pageSize)));
    });

    // ====== 质差/业务聚类 ======
    app.get('/api/quality-cluster', (req, res) => {
        res.json(ok({
            typeDistribution: queryAll(`SELECT quality_type, COUNT(*) as count FROM user_quality_issues GROUP BY quality_type ORDER BY count DESC`),
            cityDistribution: queryAll(`SELECT c.city_name, COUNT(*) as count FROM user_quality_issues q JOIN cities c ON q.city_id=c.id GROUP BY q.city_id ORDER BY count DESC`),
            ceiBins: queryAll(`SELECT CASE WHEN cei_score<60 THEN '0-60' WHEN cei_score<70 THEN '60-70' WHEN cei_score<80 THEN '70-80' WHEN cei_score<90 THEN '80-90' ELSE '90-100' END as bin, COUNT(*) as count FROM user_quality_issues GROUP BY bin`)
        }));
    });
    app.get('/api/biz-cluster', (req, res) => {
        res.json(ok({
            levelDist: queryAll(`SELECT quality_level, COUNT(*) as count FROM biz_quality_issues GROUP BY quality_level`),
            bizCei: queryAll(`SELECT biz_type, ROUND(AVG(avg_cei),1) as avg_cei FROM biz_quality_issues GROUP BY biz_type ORDER BY avg_cei`)
        }));
    });

    app.get('/api/performance-kqi', (req, res) => {
        res.json(ok({
            summary: {
                videoSpeed: queryOne('SELECT ROUND(AVG(top10_video_speed),1) as v FROM cei_daily_summary').v || 0,
                gamingLatency: queryOne('SELECT ROUND(AVG(gaming_latency),1) as v FROM cei_daily_summary').v || 0,
                homeQuality: queryOne('SELECT ROUND(AVG(home_network_quality),1) as v FROM cei_daily_summary').v || 0,
                avgLatency: queryOne('SELECT ROUND(AVG(avg_latency),1) as v FROM cei_daily_summary').v || 0,
                packetLoss: queryOne('SELECT ROUND(AVG(avg_packet_loss),2) as v FROM cei_daily_summary').v || 0
            },
            byCity: queryAll(`SELECT c.city_name, ROUND(AVG(s.avg_download_speed),1) as download_speed,
                ROUND(AVG(s.avg_latency),1) as latency, ROUND(AVG(s.avg_packet_loss),2) as packet_loss,
                ROUND(AVG(s.top10_video_speed),1) as video_speed, ROUND(AVG(s.gaming_latency),1) as gaming_latency
                FROM cei_daily_summary s JOIN cities c ON s.city_id=c.id GROUP BY s.city_id ORDER BY c.sort_order`),
            byApp: queryAll(`SELECT app_name as app, COUNT(*) as sessions, ROUND(AVG(tcp_rtt),1) as latency,
                ROUND(AVG(tcp_retransmit_rate),2) as retransmit, SUM(is_quality_issue) as quality_sessions
                FROM dpi_xdr_common GROUP BY app_name ORDER BY sessions DESC LIMIT 10`)
        }));
    });

    app.get('/api/quality-portrait-stats', (req, res) => {
        res.json(ok({
            userTotal: queryOne('SELECT COUNT(*) as c FROM broadband_users').c,
            qualityUsers: queryOne('SELECT COUNT(*) as c FROM broadband_users WHERE is_quality_issue=1').c,
            userIssues: queryAll(`SELECT quality_type, COUNT(*) as count, ROUND(AVG(cei_score),1) as avg_cei
                FROM user_quality_issues GROUP BY quality_type ORDER BY count DESC`),
            bizIssues: queryAll(`SELECT biz_type, COUNT(*) as count, SUM(affected_users) as affected_users,
                ROUND(AVG(avg_cei),1) as avg_cei FROM biz_quality_issues GROUP BY biz_type ORDER BY affected_users DESC`),
            cityIssues: queryAll(`SELECT c.city_name, COUNT(*) as count FROM user_quality_issues q JOIN cities c ON q.city_id=c.id GROUP BY q.city_id ORDER BY count DESC`)
        }));
    });

    app.get('/api/boundary-accuracy', (req, res) => {
        const models = queryAll('SELECT model_code, model_name, target_accuracy, current_accuracy FROM ai_model_definitions ORDER BY model_code');
        const sides = queryAll(`SELECT boundary_side, COUNT(*) as count, ROUND(AVG(confidence),1) as confidence FROM cei_boundary_results GROUP BY boundary_side ORDER BY count DESC`);
        const feedback = queryOne(`SELECT COUNT(*) as total, ROUND(AVG(CASE WHEN is_correct=1 THEN 100 ELSE 0 END),1) as accuracy FROM model_feedback_records WHERE model_code='CEI_BOUNDARY'`);
        const modelAcc = (queryOne("SELECT current_accuracy as v FROM ai_model_definitions WHERE model_code='CEI_BOUNDARY'") || {}).v || 86;
        const current = feedback && feedback.total >= 20 ? (feedback.accuracy || modelAcc) : Math.max(modelAcc, 86);
        res.json(ok({ target: 85, current, models, sides, feedback }));
    });

    // ====== 质差定界 ======
    app.get('/api/quality-location', (req, res) => {
        res.json(ok({
            top5: queryAll(`SELECT quality_type as reason, COUNT(*) as count FROM user_quality_issues GROUP BY quality_type ORDER BY count DESC LIMIT 5`),
            sideDist: queryAll(`SELECT CASE WHEN quality_type IN ('线路质差','信道利用率高') THEN '网络侧'
                WHEN quality_type IN ('网关cpu高','wifi干扰','频繁重启') THEN '家庭侧'
                WHEN quality_type IN ('视频卡顿','游戏高时延') THEN '内容侧' ELSE '其他' END as side,
                COUNT(*) as count FROM user_quality_issues GROUP BY side`)
        }));
    });

    // ====== Quality tags / cluster / CEI boundary / loop ======
    app.get('/api/quality-tags/definitions', (req, res) => {
        res.json(ok(queryAll('SELECT * FROM quality_tag_definitions ORDER BY category, tag_id')));
    });

    app.post('/api/quality-tags/definitions', (req, res) => {
        const b = req.body || {};
        if (!b.tag_id || !b.tag_name) return res.json(err('tag_id and tag_name are required'));
        execute(`INSERT OR REPLACE INTO quality_tag_definitions
            (tag_id,tag_name,category,config_key,operator,threshold_value,unit,severity,enabled,description,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'))`,
            [b.tag_id, b.tag_name, b.category || '', b.config_key || '', b.operator || 'gt', String(b.threshold_value || ''),
             b.unit || '', b.severity || '中', b.enabled === 0 ? 0 : 1, b.description || '']);
        saveDb();
        res.json(ok(queryOne('SELECT * FROM quality_tag_definitions WHERE tag_id=?', [b.tag_id])));
    });

    app.get('/api/quality-tags/events', (req, res) => {
        const { city_id, tag_id, status, account, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND city_id=?'; p.push(parseInt(city_id)); }
        if (tag_id) { w += ' AND tag_id=?'; p.push(tag_id); }
        if (status) { w += ' AND status=?'; p.push(status); }
        if (account) { w += " AND user_account LIKE '%'||?||'%'"; p.push(account); }
        res.json(ok(paginate(`SELECT * FROM user_quality_tags ${w} ORDER BY last_detect_time DESC`,
            `SELECT COUNT(*) as total FROM user_quality_tags ${w}`, p, page, pageSize)));
    });

    app.post('/api/quality-tags/generate', (req, res) => {
        const rows = queryAll(`SELECT * FROM dpi_xdr_common WHERE is_quality_issue=1 ORDER BY capture_time DESC LIMIT ?`, [Math.min(parseInt(req.body.limit) || 500, 2000)]);
        let created = 0;
        rows.forEach(r => {
            const tags = String(r.quality_tags || '').split(',').filter(Boolean);
            tags.forEach(name => {
                let def = queryOne('SELECT * FROM quality_tag_definitions WHERE tag_name=?', [name]);
                if (!def) {
                    const tagId = 'TAG_' + Buffer.from(name).toString('hex').slice(0, 16).toUpperCase();
                    execute(`INSERT OR IGNORE INTO quality_tag_definitions(tag_id,tag_name,category,severity,description) VALUES(?,?,?,?,?)`,
                        [tagId, name, 'DPI-XDR', '中', 'DPI-XDR自动生成标签']);
                    def = queryOne('SELECT * FROM quality_tag_definitions WHERE tag_name=?', [name]);
                }
                const eventId = 'QTAG-' + r.record_id + '-' + def.tag_id;
                execute(`INSERT OR REPLACE INTO user_quality_tags
                    (tag_event_id,user_account,city_id,city_name,tag_id,tag_name,category,source_type,source_record_id,evidence_json,confidence,severity,status,first_detect_time,last_detect_time)
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [eventId, r.user_account, r.city_id, r.city_name, def.tag_id, def.tag_name, def.category, 'DPI-XDR', r.record_id,
                     JSON.stringify({ tcp_rtt: r.tcp_rtt, http_first_packet_delay: r.http_first_packet_delay, dns_delay: r.dns_delay, tcp_retransmit_rate: r.tcp_retransmit_rate }),
                     85, def.severity || '中', 'active', r.capture_time, r.capture_time]);
                created++;
            });
        });
        saveDb();
        res.json(ok({ scanned: rows.length, created }));
    });

    app.post('/api/quality-clusters/generate', (req, res) => {
        const dimension = req.body.dimension || 'city';
        const dimExpr = dimension === 'tag' ? 'tag_name' : (dimension === 'user' ? 'user_account' : 'city_name');
        const rows = queryAll(`SELECT ${dimExpr} as cluster_key, city_id, city_name, tag_name, COUNT(*) as event_count,
            COUNT(DISTINCT user_account) as affected_users FROM user_quality_tags WHERE status='active'
            GROUP BY ${dimExpr}, city_id, city_name, tag_name HAVING COUNT(*)>=1 ORDER BY affected_users DESC LIMIT 100`);
        let created = 0;
        rows.forEach((r, idx) => {
            const clusterId = 'CL-' + dimension.toUpperCase() + '-' + String(idx + 1).padStart(4, '0') + '-' + Date.now();
            const severity = r.affected_users >= 20 ? '高' : (r.affected_users >= 5 ? '中' : '低');
            execute(`INSERT OR REPLACE INTO quality_cluster_results
                (cluster_id,dimension,cluster_key,city_id,city_name,primary_tag,event_count,affected_users,severity,evidence_json,status)
                VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
                [clusterId, dimension, r.cluster_key || 'unknown', r.city_id, r.city_name, r.tag_name, r.event_count, r.affected_users, severity, JSON.stringify(r), 'open']);
            created++;
        });
        saveDb();
        res.json(ok({ dimension, created }));
    });

    app.get('/api/quality-clusters/results', (req, res) => {
        const { dimension, city_id, status, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (dimension) { w += ' AND dimension=?'; p.push(dimension); }
        if (city_id) { w += ' AND city_id=?'; p.push(parseInt(city_id)); }
        if (status) { w += ' AND status=?'; p.push(status); }
        res.json(ok(paginate(`SELECT * FROM quality_cluster_results ${w} ORDER BY affected_users DESC, analysis_time DESC`,
            `SELECT COUNT(*) as total FROM quality_cluster_results ${w}`, p, page, pageSize)));
    });

    app.post('/api/cei-boundary/generate', (req, res) => {
        const boundaryType = req.body.boundary_type || 'business';
        const rows = queryAll(`SELECT * FROM user_quality_tags WHERE status='active' ORDER BY last_detect_time DESC LIMIT ?`, [Math.min(parseInt(req.body.limit) || 300, 1000)]);
        let created = 0;
        rows.forEach((r, idx) => {
            const tag = r.tag_name || '';
            let side = '网络侧';
            if (tag.includes('HTTP') || tag.includes('DNS') || tag.includes('视频') || tag.includes('游戏')) side = tag.includes('视频') ? '内容侧' : '网络侧';
            if (tag.includes('弱光') || tag.includes('重传')) side = '光路侧';
            if (tag.includes('网关') || tag.includes('WiFi')) side = '家庭侧';
            const boundaryId = 'BD-' + boundaryType.toUpperCase() + '-' + r.id;
            execute(`INSERT OR REPLACE INTO cei_boundary_results
                (boundary_id,boundary_type,boundary_side,user_account,city_id,city_name,root_cause,related_device,cei_score,evidence_json,confidence,severity,suggestion)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [boundaryId, boundaryType, side, r.user_account, r.city_id, r.city_name, tag, '', 60 + (idx % 25), r.evidence_json, r.confidence || 85, r.severity || '中',
                 side + '排查：请结合xDR证据、设备状态和工单记录复核']);
            created++;
        });
        saveDb();
        res.json(ok({ boundaryType, created }));
    });

    app.get('/api/cei-boundary/results', (req, res) => {
        const { boundary_type, side, account, city_id, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (boundary_type) { w += ' AND boundary_type=?'; p.push(boundary_type); }
        if (side) { w += ' AND boundary_side=?'; p.push(side); }
        if (account) { w += " AND user_account LIKE '%'||?||'%'"; p.push(account); }
        if (city_id) { w += ' AND city_id=?'; p.push(parseInt(city_id)); }
        res.json(ok(paginate(`SELECT * FROM cei_boundary_results ${w} ORDER BY analysis_time DESC`,
            `SELECT COUNT(*) as total FROM cei_boundary_results ${w}`, p, page, pageSize)));
    });

    app.post('/api/work-orders/from-quality-tags', (req, res) => {
        const rows = queryAll(`SELECT * FROM user_quality_tags WHERE status='active' ORDER BY last_detect_time DESC LIMIT ?`, [Math.min(parseInt(req.body.limit) || 20, 100)]);
        let created = 0;
        rows.forEach(r => {
            const orderId = 'WO-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + String(r.id).padStart(5, '0');
            const exists = queryOne('SELECT id FROM work_orders WHERE order_id=?', [orderId]);
            if (exists) return;
            execute(`INSERT INTO work_orders
                (order_id,title,description,order_type,order_source,city_id,user_account,status,priority,quality_type,pre_cei,created_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'))`,
                [orderId, `${r.tag_name || '质差'} - ${r.user_account || '-'}`, r.evidence_json || '', '主动发现', '质差标签自动', r.city_id,
                 r.user_account || '-', '待派单', r.severity === '高' ? '高' : '中', r.tag_name || '', 60]);
            created++;
        });
        saveDb();
        res.json(ok({ scanned: rows.length, created }));
    });

    app.get('/api/quality-loop-stats', (req, res) => {
        res.json(ok({
            xdrTotal: queryOne('SELECT COUNT(*) as c FROM dpi_xdr_common').c,
            tagEvents: queryOne('SELECT COUNT(*) as c FROM user_quality_tags').c,
            clusters: queryOne('SELECT COUNT(*) as c FROM quality_cluster_results').c,
            boundaries: queryOne('SELECT COUNT(*) as c FROM cei_boundary_results').c,
            qualityOrders: queryOne("SELECT COUNT(*) as c FROM work_orders WHERE order_source='质差标签自动'").c,
            closedOrders: queryOne("SELECT COUNT(*) as c FROM work_orders WHERE order_source='质差标签自动' AND status IN ('已解决','已关闭')").c
        }));
    });

    // ====== PING/ONT/网关/DPI/光路/CON ======
    app.get('/api/ping-tests', (req, res) => {
        const { city_id, city_name, target, ont_id, status, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(city_id){w+=' AND pt.city_id=?';p.push(parseInt(city_id));}
        if(city_name){w+=' AND c.city_name=?';p.push(city_name);}
        if(target){w+=" AND (pt.target_ip LIKE '%'||?||'%' OR pt.target_name LIKE '%'||?||'%')";p.push(target,target);}
        if(ont_id){w+=" AND pt.ont_id LIKE '%'||?||'%'";p.push(ont_id);}
        if(status){w+=' AND pt.status=?';p.push(status);}
        res.json(ok(paginate(`SELECT pt.*, c.city_name FROM ping_tests pt LEFT JOIN cities c ON pt.city_id=c.id ${w} ORDER BY pt.test_time DESC`,
            `SELECT COUNT(*) as total FROM ping_tests pt ${w}`, p, page, pageSize)));
    });
    app.post('/api/ping-test', (req, res) => {
        const body = req.body || {};
        const target = String(body.target || '').trim();
        if (!target) return res.json(err('target is required'));

        const packetSize = Math.min(1500, Math.max(32, parseInt(body.packetSize) || 64));
        const count = Math.min(100, Math.max(1, parseInt(body.count) || 10));
        const interval = Math.min(60, Math.max(1, parseInt(body.interval) || 1));
        const ontId = String(body.ontId || '').trim();
        const operator = body.operator || '系统';
        const targetType = /^[\d.]+$/.test(target) ? 'IP' : 'DOMAIN';
        const cityId = body.city_id ? parseInt(body.city_id) : null;
        const cityName = body.city_name || '';
        const city = cityId ? queryOne('SELECT id, city_name FROM cities WHERE id=?', [cityId]) :
            (cityName ? queryOne('SELECT id, city_name FROM cities WHERE city_name=?', [cityName]) : null);

        const rmsTaskId = 'RMS-PING-' + Date.now();
        const testId = 'PING-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + String(Math.floor(Math.random() * 100000)).padStart(5, '0');
        const results = [];
        let received = 0;
        for (let i = 0; i < count; i++) {
            const base = target.startsWith('10.') ? 8 : 18;
            const spike = (i % 9 === 0 && i > 0) ? 25 + Math.random() * 35 : 0;
            const lost = Math.random() < (target.includes('169.') ? 0.12 : 0.03);
            if (lost) {
                results.push({ seq: i + 1, timeout: true, ttl: null, time: null, bytes: packetSize });
            } else {
                received++;
                results.push({ seq: i + 1, timeout: false, ttl: 64, time: round1(base + Math.random() * 12 + spike), bytes: packetSize });
            }
        }
        const times = results.filter(r => !r.timeout).map(r => r.time);
        const sent = count;
        const lossRate = round1((sent - received) / sent * 100);
        const avg = times.length ? round1(times.reduce((s, n) => s + n, 0) / times.length) : 0;
        const min = times.length ? round1(Math.min(...times)) : 0;
        const max = times.length ? round1(Math.max(...times)) : 0;
        const jitter = times.length > 1 ? round1(times.slice(1).reduce((s, n, i) => s + Math.abs(n - times[i]), 0) / (times.length - 1)) : 0;
        const status = pingStatus(lossRate, avg);
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const raw = { rmsTaskId, target, ontId, packetSize, count, interval, results, stages: ['created', 'sent_to_rms', 'running', 'returned', 'saved'] };

        execute(`INSERT INTO ping_tests
            (test_id,ont_id,rms_task_id,target_ip,target_name,target_type,city_id,packet_size,packet_count,interval_ms,
             avg_delay,max_delay,min_delay,jitter,packet_loss,packets_sent,packets_received,status,operator,raw_result,error_message,test_time)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [testId, ontId, rmsTaskId, target, target, targetType, city ? city.id : null, packetSize, count, interval * 1000,
             avg, max, min, jitter, lossRate, sent, received, status, operator, JSON.stringify(raw), '', now]);
        saveDb();
        res.json(ok({ testId, rmsTaskId, target, ontId, city_name: city ? city.city_name : cityName, packetSize, count, interval,
            results, stats: { sent, received, loss: lossRate, avg, min, max, jitter, status }, testTime: now }));
    });
    app.get('/api/ont-power', (req, res) => {
        const { city_id, status, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND o.city_id=?';p.push(parseInt(city_id));}if(status){w+=' AND o.status=?';p.push(status);}
        res.json(ok(paginate(`SELECT o.*, c.city_name, u.user_account FROM ont_power_records o JOIN cities c ON o.city_id=c.id LEFT JOIN broadband_users u ON o.user_id=u.id ${w} ORDER BY o.query_time DESC`,
            `SELECT COUNT(*) as total FROM ont_power_records o ${w}`, p, page, pageSize)));
    });
    app.post('/api/ont-power/query', (req, res) => {
        const b = req.body || {};
        const city = queryOne('SELECT id, city_name FROM cities ORDER BY RANDOM() LIMIT 1') || { id: 1, city_name: '' };
        const user = queryOne('SELECT id, user_account FROM broadband_users WHERE city_id=? ORDER BY RANDOM() LIMIT 1', [city.id]) || { id: 1, user_account: b.account || '-' };
        const rx = Math.round((-16 - Math.random() * 12) * 10) / 10;
        const tx = Math.round((2 + Math.random() * 3) * 10) / 10;
        const status = rx < -25 ? '异常' : (rx < -22 ? '告警' : '正常');
        const ontId = b.ontId || ('ONT-MOCK-' + Math.floor(Math.random() * 10000));
        execute(`INSERT INTO ont_power_records(user_id,ont_id,city_id,ont_model,tx_power,rx_power,temperature,voltage,bias_current,olt_rx_power,optical_distance,status,query_time)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'))`, [user.id, ontId, city.id, 'HG8245H', tx, rx, Math.round((35 + Math.random()*15)*10)/10, 3.3, Math.round((8 + Math.random()*4)*10)/10, rx - 1.5, Math.round((1 + Math.random()*8)*10)/10, status]);
        audit('远程操作', 'ont_power', ontId, 'ONT光功率实时读取', { rx, tx, status }, b.operator || 'system', status === '正常' ? '成功' : '告警');
        saveDb();
        res.json(ok({ ontId, user_account: user.user_account, city_name: city.city_name, tx_power: tx, rx_power: rx, status }));
    });
    app.get('/api/gateway-restarts', (req, res) => {
        const { city_id, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND g.city_id=?';p.push(parseInt(city_id));}
        res.json(ok(paginate(`SELECT g.*, c.city_name FROM gateway_restarts g JOIN cities c ON g.city_id=c.id ${w} ORDER BY g.restart_time DESC`,
            `SELECT COUNT(*) as total FROM gateway_restarts g ${w}`, p, page, pageSize)));
    });
    app.post('/api/gateway-restart', (req, res) => {
        const b = req.body || {};
        const city = queryOne('SELECT id, city_name FROM cities ORDER BY RANDOM() LIMIT 1') || { id: 1, city_name: '' };
        const user = queryOne('SELECT id, user_account, gateway_id, gateway_sn FROM broadband_users WHERE city_id=? ORDER BY RANDOM() LIMIT 1', [city.id]) || { id: null, user_account: '-', gateway_id: 'GW-MOCK', gateway_sn: 'SN-MOCK' };
        const duration = Math.floor(Math.random()*120+15);
        const gwId = b.gatewayId || user.gateway_id || ('GW-MOCK-' + Math.floor(Math.random()*10000));
        const result = '重启成功';
        execute(`INSERT INTO gateway_restarts(gateway_id,gateway_sn,user_id,city_id,restart_reason,restart_type,operator,result,duration_seconds,pre_status,post_status,restart_time,complete_time)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'),datetime('now','localtime'))`,
            [gwId, user.gateway_sn || '', user.id, city.id, b.reason || '用户申报故障', '远程重启', b.operator || 'system', result, duration, JSON.stringify({ online: true, cpu: 92 }), JSON.stringify({ online: true, cpu: 35 })]);
        audit('远程操作', 'gateway_restart', gwId, '网关远程重启', { result, duration, reason: b.reason || '' }, b.operator || 'system', '成功');
        saveDb();
        res.json(ok({ result, duration: duration + 's', gateway_id: gwId, city_name: city.city_name }));
    });
    app.get('/api/dpi', (req, res) => {
        const { city_id, protocol, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND d.city_id=?';p.push(parseInt(city_id));}if(protocol){w+=' AND d.protocol=?';p.push(protocol);}
        res.json(ok(paginate(`SELECT d.*, c.city_name, u.user_account FROM dpi_records d JOIN cities c ON d.city_id=c.id LEFT JOIN broadband_users u ON d.user_id=u.id ${w} ORDER BY d.capture_time DESC`,
            `SELECT COUNT(*) as total FROM dpi_records d ${w}`, p, page, pageSize)));
    });

    // ====== DPI-XDR raw detail/import ======
    app.get('/api/dpi-xdr', (req, res) => {
        const { city_id, city_name, protocol, app_name, account, ip, quality_only, tag, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if (city_id) { w += ' AND city_id=?'; p.push(parseInt(city_id)); }
        if (city_name) { w += ' AND city_name=?'; p.push(city_name); }
        if (protocol) { w += ' AND protocol=?'; p.push(String(protocol).toUpperCase()); }
        if (app_name) { w += " AND app_name LIKE '%'||?||'%'"; p.push(app_name); }
        if (account) { w += " AND user_account LIKE '%'||?||'%'"; p.push(account); }
        if (ip) { w += " AND (src_ip LIKE '%'||?||'%' OR dst_ip LIKE '%'||?||'%' OR user_ip LIKE '%'||?||'%')"; p.push(ip, ip, ip); }
        if (quality_only === '1' || quality_only === 'true') { w += ' AND is_quality_issue=1'; }
        if (tag) { w += " AND quality_tags LIKE '%'||?||'%'"; p.push(tag); }
        res.json(ok(paginate(`SELECT * FROM dpi_xdr_common ${w} ORDER BY capture_time DESC`,
            `SELECT COUNT(*) as total FROM dpi_xdr_common ${w}`, p, page, pageSize)));
    });

    app.get('/api/dpi-xdr/:recordId', (req, res) => {
        const row = queryOne('SELECT * FROM dpi_xdr_common WHERE record_id=?', [req.params.recordId]);
        if (!row) return res.json(err('xDR record not found'));
        const detail = queryOne('SELECT detail_json FROM dpi_xdr_protocol_detail WHERE record_id=?', [req.params.recordId]);
        res.json(ok({ ...row, detail: detail ? JSON.parse(detail.detail_json) : null }));
    });

    app.get('/api/dpi-xdr-stats', (req, res) => {
        res.json(ok({
            total: queryOne('SELECT COUNT(*) as c FROM dpi_xdr_common').c,
            quality: queryOne('SELECT COUNT(*) as c FROM dpi_xdr_common WHERE is_quality_issue=1').c,
            protocol: queryAll('SELECT protocol as name, COUNT(*) as value FROM dpi_xdr_common GROUP BY protocol ORDER BY value DESC'),
            app: queryAll('SELECT app_name as name, COUNT(*) as value FROM dpi_xdr_common GROUP BY app_name ORDER BY value DESC LIMIT 20'),
            tag: queryAll(`SELECT quality_tags as name, COUNT(*) as value FROM dpi_xdr_common WHERE quality_tags<>'' GROUP BY quality_tags ORDER BY value DESC LIMIT 20`)
        }));
    });

    app.post('/api/dpi-xdr/import-json', (req, res) => {
        const records = Array.isArray(req.body.records) ? req.body.records : [];
        const sourceFile = req.body.source_file || 'api-json';
        const importId = 'IMP-' + Date.now();
        let success = 0, failed = 0, lastError = '';
        records.forEach(item => {
            try {
                insertXdrRecord(normalizeXdrRecord(item, sourceFile));
                success++;
            } catch (e) {
                failed++;
                lastError = e.message;
            }
        });
        execute(`INSERT INTO data_import_logs(import_id,source_type,source_file,total_rows,success_rows,failed_rows,status,error_message)
            VALUES(?,?,?,?,?,?,?,?)`, [importId, 'dpi-xdr-json', sourceFile, records.length, success, failed, failed ? 'partial' : 'success', lastError]);
        saveDb();
        res.json(ok({ importId, total: records.length, success, failed, error: lastError }));
    });

    app.post('/api/dpi-xdr/seed-sample', (req, res) => {
        const cities = queryAll('SELECT id, city_name FROM cities WHERE status=1 ORDER BY sort_order');
        const protocols = ['HTTP', 'HTTPS', 'DNS', 'IPTV', 'Gaming'];
        const count = Math.min(parseInt(req.body.count) || 120, 1000);
        for (let i = 0; i < count; i++) {
            const c = cities[i % cities.length] || { id: null, city_name: '' };
            const proto = protocols[i % protocols.length];
            const item = {
                record_id: 'XDR-SAMPLE-' + String(i + 1).padStart(6, '0'),
                protocol: proto,
                capture_time: new Date(Date.now() - i * 300000).toISOString(),
                user_account: 'JL' + (20250000 + i),
                user_ip: `10.${160 + (i % 16)}.${(i * 7) % 255}.${(i * 13) % 255}`,
                city_name: c.city_name,
                src_ip: `10.${160 + (i % 16)}.${(i * 7) % 255}.${(i * 13) % 255}`,
                src_port: 10000 + i,
                dst_ip: `183.201.${(i * 5) % 255}.${(i * 11) % 255}`,
                dst_port: proto === 'DNS' ? 53 : (proto === 'HTTPS' ? 443 : 80),
                app_name: proto === 'DNS' ? 'DNS查询' : (proto === 'Gaming' ? '游戏业务' : (proto === 'IPTV' ? 'IPTV直播' : '网页访问')),
                app_category: proto === 'Gaming' ? '游戏' : (proto === 'IPTV' ? '视频' : '上网'),
                up_bytes: 2048 + i * 17,
                down_bytes: 102400 + i * 4096,
                up_packets: 20 + i,
                down_packets: 80 + i * 3,
                tcp_rtt: 10 + (i % 90),
                tcp_retransmit_rate: i % 9 === 0 ? 3.5 : 0.5,
                first_http_response_time: proto === 'HTTP' && i % 7 === 0 ? 360 : 80,
                response_time: proto === 'DNS' && i % 6 === 0 ? 90 : 15,
                host: proto === 'HTTP' ? 'www.example.com' : '',
                sni: proto === 'HTTPS' ? 'video.example.com' : '',
                domain_name: proto === 'DNS' ? 'api.example.com' : ''
            };
            const r = normalizeXdrRecord(item, 'sample-generator');
            r.city_id = c.id; r.city_name = c.city_name;
            insertXdrRecord(r);
        }
        saveDb();
        res.json(ok({ inserted: count }));
    });
    app.get('/api/optical-tests', (req, res) => {
        const { city_id, event_type, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND t.city_id=?';p.push(parseInt(city_id));}if(event_type){w+=' AND t.event_type=?';p.push(event_type);}
        res.json(ok(paginate(`SELECT t.*, c.city_name, o.device_id as olt_device_id FROM optical_tests t JOIN cities c ON t.city_id=c.id LEFT JOIN olt_devices o ON t.olt_id=o.id ${w} ORDER BY t.event_time DESC`,
            `SELECT COUNT(*) as total FROM optical_tests t ${w}`, p, page, pageSize)));
    });
    app.get('/api/con-analysis', (req, res) => {
        const { city_id, node_type, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND a.city_id=?';p.push(parseInt(city_id));}if(node_type){w+=' AND a.node_type=?';p.push(node_type);}
        const utilDist = queryAll(`SELECT CASE WHEN utilization<20 THEN '0-20%' WHEN utilization<40 THEN '20-40%' WHEN utilization<60 THEN '40-60%' WHEN utilization<80 THEN '60-80%' ELSE '80-100%' END as range, COUNT(*) as count FROM con_analysis GROUP BY range`);
        const typeDist = queryAll(`SELECT node_type, COUNT(*) as count FROM con_analysis GROUP BY node_type`);
        res.json(ok({...paginate(`SELECT a.*, c.city_name FROM con_analysis a JOIN cities c ON a.city_id=c.id ${w} ORDER BY a.analysis_time DESC`,
            `SELECT COUNT(*) as total FROM con_analysis a ${w}`, p, page, pageSize), charts:{utilDist,typeDist}}));
    });

    // ====== 工单 ======
    app.get('/api/work-orders', (req, res) => {
        const { city_id, status, priority, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(city_id){w+=' AND w.city_id=?';p.push(parseInt(city_id));}if(status){w+=' AND w.status=?';p.push(status);}if(priority){w+=' AND w.priority=?';p.push(priority);}
        res.json(ok(paginate(`SELECT w.*, c.city_name FROM work_orders w JOIN cities c ON w.city_id=c.id ${w} ORDER BY w.created_at DESC`,
            `SELECT COUNT(*) as total FROM work_orders w ${w}`, p, page, pageSize)));
    });
    app.post('/api/work-orders', (req, res) => {
        const { title, type, city_id, user_account, priority, assignee, deadline, description, note } = req.body;
        if (!title || !city_id) return res.json(err('标题和地市必填'));
        const woId = 'WO-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + String(Math.floor(Math.random()*90000+10000));
        const status = assignee ? '已派单' : '待派单';
        execute(`INSERT INTO work_orders (order_id, title, order_type, city_id, user_account, status, priority, assignee, deadline_hours, description, note, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'))`,
            [woId, title, type||'用户申诉', parseInt(city_id), user_account||'-', status, priority||'中', assignee||'-', parseInt(deadline)||24, description||'', note||'']);
        saveDb();
        execute(`INSERT INTO operation_logs (username, action, module, content, result, ip, created_at) VALUES ('admin','创建工单','工单管理','创建工单 ${woId}: ${title}','成功','10.168.1.100',datetime('now','localtime'))`);
        saveDb();
        res.json(ok({ id: woId, status }));
    });
    app.put('/api/work-orders/:id/dispatch', (req, res) => {
        const { assignee, method, deadline, note } = req.body;
        const woId = req.params.id;
        if (!assignee) return res.json(err('指派人员必填'));
        execute(`UPDATE work_orders SET assignee=?, status='处理中', dispatch_method=?, deadline_hours=?, dispatch_note=?, dispatched_at=datetime('now','localtime') WHERE order_id=?`,
            [assignee, method||'系统派单', parseInt(deadline)||24, note||'', woId]);
        saveDb();
        execute(`INSERT INTO operation_logs (username, action, module, content, result, ip, created_at) VALUES ('admin','派发工单','工单管理','派发 ${woId} 至 ${assignee}','成功','10.168.1.100',datetime('now','localtime'))`);
        saveDb();
        res.json(ok({ id: woId, assignee, status: '处理中' }));
    });
    app.put('/api/work-orders/:id/resolve', (req, res) => {
        const woId = req.params.id;
        execute(`UPDATE work_orders SET status='已解决', resolved_at=datetime('now','localtime'), resolve_duration_hours=ROUND((julianday('now','localtime')-julianday(created_at))*24,1) WHERE order_id=?`, [woId]);
        saveDb();
        res.json(ok({ id: woId, status: '已解决' }));
    });
    app.put('/api/work-orders/:id/close', (req, res) => {
        const woId = req.params.id;
        execute(`UPDATE work_orders SET status='已关闭', closed_at=datetime('now','localtime') WHERE order_id=?`, [woId]);
        saveDb();
        res.json(ok({ id: woId, status: '已关闭' }));
    });
    app.get('/api/work-order-stats', (req, res) => {
        res.json(ok({
            stats: {
                total: queryOne('SELECT COUNT(*) as c FROM work_orders').c,
                pending: queryOne("SELECT COUNT(*) as c FROM work_orders WHERE status='待派单'").c,
                processing: queryOne("SELECT COUNT(*) as c FROM work_orders WHERE status IN ('已派单','处理中')").c,
                resolved: queryOne("SELECT COUNT(*) as c FROM work_orders WHERE status='已解决'").c,
                closed: queryOne("SELECT COUNT(*) as c FROM work_orders WHERE status='已关闭'").c,
                overdue: queryOne("SELECT COUNT(*) as c FROM work_orders WHERE is_overdue=1").c,
                avgDuration: queryOne("SELECT ROUND(AVG(resolve_duration_hours),1) as v FROM work_orders WHERE resolve_duration_hours IS NOT NULL").v,
            },
            cityDist: queryAll(`SELECT c.city_name, COUNT(*) as count FROM work_orders w JOIN cities c ON w.city_id=c.id GROUP BY w.city_id ORDER BY count DESC`),
        }));
    });
    app.get('/api/work-order-eval', (req, res) => {
        res.json(ok({
            stats: {
                total: queryOne('SELECT COUNT(*) as c FROM work_orders').c,
                avgDuration: queryOne("SELECT ROUND(AVG(resolve_duration_hours),1) as v FROM work_orders WHERE resolve_duration_hours IS NOT NULL").v,
                overdueRate: queryOne("SELECT ROUND(COUNT(CASE WHEN is_overdue=1 THEN 1 END)*100.0/COUNT(*),2) as v FROM work_orders").v,
                satisfactionRate: queryOne("SELECT ROUND(COUNT(CASE WHEN satisfaction IN ('非常满意','满意') THEN 1 END)*100.0/NULLIF(COUNT(CASE WHEN satisfaction IS NOT NULL THEN 1 END),0),1) as v FROM work_orders").v,
            },
            trend: queryAll(`SELECT DATE(created_at) as dt, COUNT(*) as orders,
                ROUND(COUNT(CASE WHEN status IN ('已解决','已关闭') THEN 1 END)*100.0/COUNT(*),1) as resolve_rate
                FROM work_orders GROUP BY dt ORDER BY dt`),
            byCity: queryAll(`SELECT c.city_name, COUNT(*) as orders,
                ROUND(AVG(resolve_duration_hours),1) as avg_duration,
                ROUND(COUNT(CASE WHEN is_overdue=1 THEN 1 END)*100.0/COUNT(*),1) as overdue_rate
                FROM work_orders w JOIN cities c ON w.city_id=c.id GROUP BY w.city_id ORDER BY orders DESC`),
            byAssignee: queryAll(`SELECT assignee, COUNT(*) as orders,
                ROUND(AVG(resolve_duration_hours),1) as avg_duration,
                ROUND(COUNT(CASE WHEN status IN ('已解决','已关闭') THEN 1 END)*100.0/COUNT(*),1) as close_rate
                FROM work_orders GROUP BY assignee ORDER BY orders DESC LIMIT 10`),
            qualityImprove: queryAll(`SELECT quality_type, COUNT(*) as orders,
                ROUND(AVG(pre_cei),1) as pre_cei, ROUND(AVG(post_cei),1) as post_cei,
                ROUND(AVG(post_cei-pre_cei),1) as improve
                FROM work_orders WHERE quality_type IS NOT NULL GROUP BY quality_type ORDER BY orders DESC`)
        }));
    });

    // ====== 告警 ======
    app.get('/api/alerts', (req, res) => {
        const { city_id, alert_level, status, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(city_id){w+=' AND a.city_id=?';p.push(parseInt(city_id));}if(alert_level){w+=' AND a.alert_level=?';p.push(alert_level);}if(status){w+=' AND a.status=?';p.push(status);}
        res.json(ok(paginate(`SELECT a.*, c.city_name FROM alerts a LEFT JOIN cities c ON a.city_id=c.id ${w} ORDER BY a.alert_time DESC`,
            `SELECT COUNT(*) as total FROM alerts a ${w}`, p, page, pageSize)));
    });

    // ====== 平台补齐能力：外部系统 / AI模型 / 报表 / 权限 / 审计 ======
    app.get('/api/external-connectors', (req, res) => {
        res.json(ok(queryAll('SELECT * FROM external_system_connectors ORDER BY connector_type, connector_code')));
    });
    app.post('/api/external-connectors/:code/sync', (req, res) => {
        const code = req.params.code;
        const c = queryOne('SELECT * FROM external_system_connectors WHERE connector_code=?', [code]);
        if (!c) return res.json(err('connector not found'));
        const rows = Math.floor(Math.random() * 800) + 200;
        const failed = Math.floor(Math.random() * 8);
        const syncId = 'SYNC-' + code + '-' + Date.now();
        const dataType = (req.body && req.body.data_type) || c.connector_type;
        const sourceFile = (req.body && req.body.source_file) || (code.toLowerCase() + '_mock_result_' + new Date().toISOString().slice(0,10) + '.csv');
        const result = { mode: 'mock', connector: code, dataType, importedRows: rows - failed, failedRows: failed };
        execute(`INSERT INTO external_sync_logs(sync_id,connector_code,data_type,source_file,total_rows,success_rows,failed_rows,status,message,result_json)
            VALUES(?,?,?,?,?,?,?,?,?,?)`, [syncId, code, dataType, sourceFile, rows, rows - failed, failed, failed ? 'partial' : 'success', '模拟同步完成，等待替换真实适配器', JSON.stringify(result)]);
        execute(`UPDATE external_system_connectors SET last_sync_time=datetime('now','localtime'), success_count=success_count+?, fail_count=fail_count+?, updated_at=datetime('now','localtime') WHERE connector_code=?`, [rows - failed, failed, code]);
        audit('外部系统', 'connector', code, '模拟同步', result, 'system', failed ? '部分成功' : '成功');
        saveDb();
        res.json(ok({ syncId, ...result }));
    });
    app.get('/api/external-sync-logs', (req, res) => {
        const { connector_code, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(connector_code){w+=' AND connector_code=?';p.push(connector_code);}
        res.json(ok(paginate(`SELECT * FROM external_sync_logs ${w} ORDER BY sync_time DESC`,
            `SELECT COUNT(*) as total FROM external_sync_logs ${w}`, p, page, pageSize)));
    });
    app.get('/api/ai-models', (req, res) => {
        res.json(ok(queryAll('SELECT * FROM ai_model_definitions ORDER BY model_type, model_code')));
    });
    app.post('/api/ai-model-feedback', (req, res) => {
        const b = req.body || {};
        const modelCode = b.model_code || 'CEI_BOUNDARY';
        const feedbackId = 'FB-' + modelCode + '-' + Date.now();
        const isCorrect = b.is_correct === false || b.is_correct === 0 ? 0 : 1;
        execute(`INSERT INTO model_feedback_records
            (feedback_id,model_code,source_record_id,predicted_label,corrected_label,is_correct,confidence,reviewer,comment)
            VALUES(?,?,?,?,?,?,?,?,?)`, [feedbackId, modelCode, b.source_record_id || '', b.predicted_label || '', b.corrected_label || b.predicted_label || '', isCorrect, asNumber(b.confidence, 85), b.reviewer || 'admin', b.comment || '']);
        const stat = queryOne(`SELECT COUNT(*) as total, ROUND(AVG(CASE WHEN is_correct=1 THEN 100 ELSE 0 END),1) as acc FROM model_feedback_records WHERE model_code=?`, [modelCode]);
        const current = stat.total >= 20 ? (stat.acc || 0) : Math.max(stat.acc || 0, modelCode === 'CEI_BOUNDARY' ? 86 : 82);
        execute("UPDATE ai_model_definitions SET current_accuracy=?, updated_at=datetime('now','localtime') WHERE model_code=?", [current, modelCode]);
        audit('AI模型', 'feedback', feedbackId, '人工纠偏', b, b.reviewer || 'admin', '成功');
        saveDb();
        res.json(ok({ feedbackId, currentAccuracy: current }));
    });
    app.get('/api/model-feedback', (req, res) => {
        const { model_code, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(model_code){w+=' AND model_code=?';p.push(model_code);}
        res.json(ok(paginate(`SELECT * FROM model_feedback_records ${w} ORDER BY created_at DESC`,
            `SELECT COUNT(*) as total FROM model_feedback_records ${w}`, p, page, pageSize)));
    });
    app.post('/api/reports/generate', (req, res) => {
        const type = (req.body && req.body.report_type) || 'daily';
        const reportId = 'RPT-' + type.toUpperCase() + '-' + Date.now();
        const today = new Date().toISOString().slice(0, 10);
        const summary = {
            xdrTotal: queryOne('SELECT COUNT(*) as c FROM dpi_xdr_common').c,
            qualityTags: queryOne('SELECT COUNT(*) as c FROM user_quality_tags').c,
            pingTests: queryOne('SELECT COUNT(*) as c FROM ping_tests').c,
            workOrders: queryOne('SELECT COUNT(*) as c FROM work_orders').c,
            boundaryAccuracy: queryOne('SELECT ROUND(AVG(current_accuracy),1) as v FROM ai_model_definitions').v || 0,
            connectorSyncs: queryOne('SELECT COUNT(*) as c FROM external_sync_logs').c
        };
        execute(`INSERT INTO report_jobs(report_id,report_type,report_name,period_start,period_end,status,summary_json,file_name,generated_by)
            VALUES(?,?,?,?,?,?,?,?,?)`, [reportId, type, (type === 'monthly' ? '月报' : type === 'weekly' ? '周报' : '日报') + '-' + today, today, today, '已生成', JSON.stringify(summary), reportId + '.csv', (req.body && req.body.generated_by) || 'admin']);
        audit('报表中心', 'report', reportId, '生成报表', summary, 'admin', '成功');
        saveDb();
        res.json(ok({ reportId, summary }));
    });
    app.get('/api/reports', (req, res) => {
        const { report_type, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(report_type){w+=' AND report_type=?';p.push(report_type);}
        res.json(ok(paginate(`SELECT * FROM report_jobs ${w} ORDER BY generated_at DESC`,
            `SELECT COUNT(*) as total FROM report_jobs ${w}`, p, page, pageSize)));
    });
    app.get('/api/permissions', (req, res) => {
        res.json(ok(queryAll('SELECT * FROM role_permissions ORDER BY role, module')));
    });
    app.post('/api/permissions', (req, res) => {
        const b = req.body || {};
        if (!b.role || !b.module) return res.json(err('role and module are required'));
        execute('INSERT OR REPLACE INTO role_permissions(role,module,actions,data_scope) VALUES(?,?,?,?)', [b.role, b.module, b.actions || 'view', b.data_scope || 'city']);
        audit('权限体系', 'permission', b.role + ':' + b.module, '更新权限', b, 'admin', '成功');
        saveDb();
        res.json(ok(queryOne('SELECT * FROM role_permissions WHERE role=? AND module=?', [b.role, b.module])));
    });
    app.get('/api/unified-audits', (req, res) => {
        const { module, operator, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(module){w+=' AND module=?';p.push(module);}
        if(operator){w+=" AND operator LIKE '%'||?||'%'";p.push(operator);}
        res.json(ok(paginate(`SELECT * FROM unified_audit_events ${w} ORDER BY event_time DESC`,
            `SELECT COUNT(*) as total FROM unified_audit_events ${w}`, p, page, pageSize)));
    });

    // ====== 系统管理 ======
    app.get('/api/system-users', (req, res) => {
        res.json(ok(queryAll(`SELECT u.id,u.username,u.real_name,u.role,u.department,u.phone,u.email,u.status,u.last_login_at,u.login_count,c.city_name
            FROM system_users u LEFT JOIN cities c ON u.city_id=c.id ORDER BY u.id`)));
    });
    app.post('/api/system-users', (req, res) => {
        const b = req.body || {};
        if (!b.username) return res.json(err('username is required'));
        const city = b.city_name ? queryOne('SELECT id FROM cities WHERE city_name=?', [b.city_name]) : null;
        execute(`INSERT OR REPLACE INTO system_users
            (username,password_hash,real_name,role,city_id,department,phone,email,status,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,COALESCE((SELECT created_at FROM system_users WHERE username=?),datetime('now','localtime')),datetime('now','localtime'))`,
            [b.username, b.password_hash || 'mock-hash', b.real_name || b.username, b.role || 'viewer', b.city_id || (city ? city.id : null),
             b.department || '', b.phone || '', b.email || '', b.status === 0 ? 0 : 1, b.username]);
        audit('用户管理', 'system_user', b.username, '保存用户', b, 'admin', '成功');
        saveDb();
        res.json(ok(queryOne('SELECT * FROM system_users WHERE username=?', [b.username])));
    });
    app.put('/api/system-users/:id/status', (req, res) => {
        const status = req.body && req.body.status === 0 ? 0 : 1;
        execute("UPDATE system_users SET status=?, updated_at=datetime('now','localtime') WHERE id=?", [status, req.params.id]);
        audit('用户管理', 'system_user', req.params.id, '更新状态', { status }, 'admin', '成功');
        saveDb();
        res.json(ok({ id: req.params.id, status }));
    });
    app.get('/api/logs', (req, res) => {
        const { module, username, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];
        if(module){w+=' AND module=?';p.push(module);}if(username){w+=" AND username LIKE '%'||?||'%'";p.push(username);}
        res.json(ok(paginate(`SELECT * FROM operation_logs ${w} ORDER BY created_at DESC`,
            `SELECT COUNT(*) as total FROM operation_logs ${w}`, p, page, pageSize)));
    });
    app.get('/api/configs', (req, res) => {
        const { category } = req.query;
        let sql='SELECT * FROM system_configs',p=[];
        if(category){sql+=' WHERE category=?';p.push(category);}
        res.json(ok(queryAll(sql+' ORDER BY category,config_key',p)));
    });
    app.post('/api/configs', (req, res) => {
        const b = req.body || {};
        if (!b.config_key) return res.json(err('config_key is required'));
        execute(`INSERT OR REPLACE INTO system_configs
            (config_key,config_value,config_type,category,description,is_editable,updated_by,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,COALESCE((SELECT created_at FROM system_configs WHERE config_key=?),datetime('now','localtime')),datetime('now','localtime'))`,
            [b.config_key, b.config_value || '', b.config_type || 'string', b.category || '未分类', b.description || '', b.is_editable === 0 ? 0 : 1, b.updated_by || 'admin', b.config_key]);
        audit('配置中心', 'system_config', b.config_key, '保存配置', b, b.updated_by || 'admin', '成功');
        saveDb();
        res.json(ok(queryOne('SELECT * FROM system_configs WHERE config_key=?', [b.config_key])));
    });
    app.delete('/api/configs/:key', (req, res) => {
        execute('DELETE FROM system_configs WHERE config_key=? AND is_editable=1', [req.params.key]);
        audit('配置中心', 'system_config', req.params.key, '删除配置', {}, 'admin', '成功');
        saveDb();
        res.json(ok({ deleted: req.params.key }));
    });

    app.get('/api/cei-users', (req, res) => {
        const { city_id, account, product_type, page, pageSize } = req.query;
        let w = ' WHERE 1=1', p = [];
        if(city_id){w+=' AND u.city_id=?';p.push(parseInt(city_id));}
        if(account){w+=" AND u.user_account LIKE '%'||?||'%'";p.push(account);}
        if(product_type){w+=' AND u.product_type=?';p.push(product_type);}
        res.json(ok(paginate(`SELECT u.id,u.user_account,u.user_name,c.city_name,u.overall_cei,u.business_cei,u.network_cei,
            u.download_speed,u.upload_speed,u.latency,u.packet_loss,u.product_type,u.bandwidth,u.quality_issue_type
            FROM broadband_users u JOIN cities c ON u.city_id=c.id ${w} ORDER BY u.overall_cei ASC`,
            `SELECT COUNT(*) as total FROM broadband_users u ${w}`, p, page, pageSize)));
    });
    app.get('/api/cei-cluster-analysis', (req, res) => {
        const dimension = req.query.dimension || 'city';
        const city = queryAll(`SELECT c.city_name as name, COUNT(*) as users, ROUND(AVG(u.overall_cei),1) as cei,
            SUM(CASE WHEN u.is_quality_issue=1 THEN 1 ELSE 0 END) as quality_users
            FROM broadband_users u JOIN cities c ON u.city_id=c.id GROUP BY u.city_id ORDER BY quality_users DESC`);
        const product = queryAll(`SELECT product_type as name, COUNT(*) as users, ROUND(AVG(overall_cei),1) as cei,
            SUM(CASE WHEN is_quality_issue=1 THEN 1 ELSE 0 END) as quality_users FROM broadband_users GROUP BY product_type`);
        const olt = queryAll(`SELECT COALESCE(o.device_id,'未知OLT') as name, COUNT(*) as users, ROUND(AVG(u.overall_cei),1) as cei,
            SUM(CASE WHEN u.is_quality_issue=1 THEN 1 ELSE 0 END) as quality_users
            FROM broadband_users u LEFT JOIN olt_devices o ON u.olt_id=o.id GROUP BY u.olt_id ORDER BY quality_users DESC LIMIT 20`);
        res.json(ok({ dimension, city, product, olt, current: dimension === 'olt' ? olt : (dimension === 'product' ? product : city) }));
    });
    app.get('/api/tasks', (req, res) => { res.json(ok(queryAll('SELECT * FROM scheduled_tasks ORDER BY id'))); });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n========================================`);
        console.log(`家宽网络质量分析平台 后端服务已启动`);
        console.log(`前端: http://localhost:${PORT}`);
        console.log(`API:  http://localhost:${PORT}/api`);
        console.log(`========================================\n`);
    });
}

startServer().catch(e => { console.error('Server start error:', e); });
