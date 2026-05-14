/**
 * 家宽网络质量分析平台 - Express后端服务器 (sql.js版)
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb, initSchema, queryAll, queryOne, execute, paginate, saveDb } = require('./db/database');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

function ok(data, msg) { return { code: 200, message: msg || 'success', data }; }
function err(msg) { return { code: 500, message: msg, data: null }; }

async function startServer() {
    await initSchema();
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

    // ====== PING/ONT/网关/DPI/光路/CON ======
    app.get('/api/ping-tests', (req, res) => {
        const { city_id, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND pt.city_id=?';p.push(parseInt(city_id));}
        res.json(ok(paginate(`SELECT pt.*, c.city_name FROM ping_tests pt LEFT JOIN cities c ON pt.city_id=c.id ${w} ORDER BY pt.test_time DESC`,
            `SELECT COUNT(*) as total FROM ping_tests pt ${w}`, p, page, pageSize)));
    });
    app.post('/api/ping-test', (req, res) => {
        const { target, count } = req.body; const results = [];
        for(let i=0;i<(count||10);i++) results.push({seq:i+1,time:(Math.random()*15+2).toFixed(1),ttl:64});
        const avg=results.reduce((s,r)=>s+parseFloat(r.time),0)/results.length;
        res.json(ok({target,results,stats:{sent:results.length,received:results.length,loss:0,avg:avg.toFixed(1)}}));
    });
    app.get('/api/ont-power', (req, res) => {
        const { city_id, status, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND o.city_id=?';p.push(parseInt(city_id));}if(status){w+=' AND o.status=?';p.push(status);}
        res.json(ok(paginate(`SELECT o.*, c.city_name, u.user_account FROM ont_power_records o JOIN cities c ON o.city_id=c.id LEFT JOIN broadband_users u ON o.user_id=u.id ${w} ORDER BY o.query_time DESC`,
            `SELECT COUNT(*) as total FROM ont_power_records o ${w}`, p, page, pageSize)));
    });
    app.get('/api/gateway-restarts', (req, res) => {
        const { city_id, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND g.city_id=?';p.push(parseInt(city_id));}
        res.json(ok(paginate(`SELECT g.*, c.city_name FROM gateway_restarts g JOIN cities c ON g.city_id=c.id ${w} ORDER BY g.restart_time DESC`,
            `SELECT COUNT(*) as total FROM gateway_restarts g ${w}`, p, page, pageSize)));
    });
    app.post('/api/gateway-restart', (req, res) => {
        res.json(ok({ result:'重启成功', duration: Math.floor(Math.random()*120+15)+'s' }));
    });
    app.get('/api/dpi', (req, res) => {
        const { city_id, protocol, page, pageSize } = req.query;
        let w=' WHERE 1=1',p=[];if(city_id){w+=' AND d.city_id=?';p.push(parseInt(city_id));}if(protocol){w+=' AND d.protocol=?';p.push(protocol);}
        res.json(ok(paginate(`SELECT d.*, c.city_name, u.user_account FROM dpi_records d JOIN cities c ON d.city_id=c.id LEFT JOIN broadband_users u ON d.user_id=u.id ${w} ORDER BY d.capture_time DESC`,
            `SELECT COUNT(*) as total FROM dpi_records d ${w}`, p, page, pageSize)));
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
                FROM work_orders GROUP BY dt ORDER BY dt`)
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

    // ====== 系统管理 ======
    app.get('/api/system-users', (req, res) => {
        res.json(ok(queryAll(`SELECT u.id,u.username,u.real_name,u.role,u.department,u.phone,u.email,u.status,u.last_login_at,u.login_count,c.city_name
            FROM system_users u LEFT JOIN cities c ON u.city_id=c.id ORDER BY u.id`)));
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
    app.get('/api/tasks', (req, res) => { res.json(ok(queryAll('SELECT * FROM scheduled_tasks ORDER BY id'))); });

    app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`家宽网络质量分析平台 后端服务已启动`);
        console.log(`前端: http://localhost:${PORT}`);
        console.log(`API:  http://localhost:${PORT}/api`);
        console.log(`========================================\n`);
    });
}

startServer().catch(e => { console.error('Server start error:', e); });
