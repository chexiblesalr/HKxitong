/**
 * 种子数据 Part2 - 质量监控/远程操作/工单/告警/系统管理
 */
const { getDb } = require('./database');
const p1 = require('./seed');
const { cityMap, distMap, oltByCityMap, userByCityMap, userIds, oltIds,
    srand, rint, rfloat, pick, rdate, rip, wStatus, citiesData, qualityTypes, surnames, names2 } = p1;

const db = getDb();

// ===== 7. PON光功率异常 (300条) =====
console.log('插入PON光功率异常...');
const ponInsert = db.prepare(`INSERT INTO pon_anomalies (anomaly_id,olt_id,pon_port,city_id,tx_power,rx_power,anomaly_type,severity,affected_users,description,status,handler,discovery_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const ponTypes = ['光功率偏低','光功率偏高','ONU离线','光衰增大','PON口异常','光纤断裂','分光器故障'];
const handlers = ['张工','李工','王工','赵工','刘工','陈工','杨工','黄工','周工','吴工'];

db.transaction(() => {
    for (let i = 0; i < 300; i++) {
        const code = pick(Object.keys(cityMap));
        const cid = cityMap[code];
        const cityOlts = oltByCityMap[cid] || [];
        const olt = cityOlts.length > 0 ? pick(cityOlts) : oltIds[0];
        const atype = pick(ponTypes);
        const sev = (atype==='ONU离线'||atype==='PON口异常'||atype==='光纤断裂') ? '严重' : pick(['一般','紧急','一般']);
        ponInsert.run(
            'PON-'+code+'-'+String(i+1).padStart(5,'0'),
            olt.id, 'GPON 0/'+rint(0,7)+'/'+rint(0,15), cid,
            rfloat(1.2,3.5,2), rfloat(-29,-12,2),
            atype, sev, rint(1,256),
            atype+'，影响'+rint(1,256)+'用户，需'+pick(['更换光模块','重新熔接','更换分光器','排查线路','设备重启']),
            pick(['待处理','处理中','已恢复','已恢复','已恢复']),
            pick(handlers), rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 8. CEI每日汇总 (10城 x 17天 = 170条) =====
console.log('插入CEI每日汇总...');
const ceiSumInsert = db.prepare(`INSERT INTO cei_daily_summary (city_id,record_date,total_users,active_users,gateway_count,active_gateway_count,dpi_active_users,overall_cei,business_cei,network_cei,avg_download_speed,avg_upload_speed,avg_latency,avg_packet_loss,quality_issue_count,quality_issue_rate,work_order_count,top10_video_speed,home_network_quality,gaming_latency) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const dateLabels = [];
for (let d = 16; d <= 30; d++) dateLabels.push('2025-11-'+String(d).padStart(2,'0'));
dateLabels.push('2025-12-01','2025-12-02');

const cityBaseStats = {
    'CC':{ users:1280000, gw:76.2, cei:94.2 }, 'JL':{ users:549000, gw:32.8, cei:93.1 },
    'SP':{ users:292000, gw:17.5, cei:91.8 }, 'LY':{ users:146000, gw:8.7, cei:92.5 },
    'TH':{ users:219000, gw:13.0, cei:91.2 }, 'BS':{ users:183000, gw:10.8, cei:90.8 },
    'SY':{ users:292000, gw:17.5, cei:92.0 }, 'BC':{ users:183000, gw:10.8, cei:91.5 },
    'YB':{ users:365000, gw:21.7, cei:93.5 }, 'CBS':{ users:146000, gw:8.6, cei:90.5 }
};

db.transaction(() => {
    for (const [code, cid] of Object.entries(cityMap)) {
        const base = cityBaseStats[code];
        dateLabels.forEach((dt, di) => {
            const fluct = rfloat(-0.3,0.3,1);
            ceiSumInsert.run(cid, dt,
                Math.floor(base.users * rfloat(0.98,1.02,3)),
                Math.floor(base.users * rfloat(0.92,0.97,3)),
                base.gw + rfloat(-0.5,0.5,1),
                base.gw + rfloat(-1,0,1),
                base.gw + rfloat(-2,-0.5,1),
                base.cei + fluct,
                base.cei + fluct - rfloat(0.5,1.5,1),
                base.cei + fluct + rfloat(0.3,1.2,1),
                rfloat(150,220,1), rfloat(35,55,1),
                rfloat(8,18,1), rfloat(0.1,0.8,3),
                rint(20,200), rfloat(0.5,3.5,2),
                rint(10,80),
                rfloat(24,32,1), rfloat(93,97,1), rfloat(12,25,1)
            );
        });
    }
})();

// ===== 9. 质差模型分析 (300条) =====
console.log('插入质差模型分析...');
const qmInsert = db.prepare(`INSERT INTO quality_model_results (result_id,user_id,city_id,model_name,model_version,score,primary_factor,secondary_factors,severity,recommendation,analysis_time,quality_labels) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const modelNames = ['线路质差模型','设备质差模型','家庭网络模型','传输质差模型','WiFi干扰模型','光路衰减模型'];
const factors = ['光衰过大','CPU利用率高','丢包严重','时延过大','WiFi干扰','带宽不足','终端老旧','固件过旧','线路老化','分光比过高'];
const recs = ['更换光猫','优化WiFi信道','升级带宽','更换线路','重启设备','升级固件','更换分光器','调整光功率','更换网线','优化家庭组网'];

db.transaction(() => {
    for (let i = 0; i < 300; i++) {
        const u = pick(userIds);
        qmInsert.run('QM-'+String(i+1).padStart(5,'0'), u.id, u.city_id,
            pick(modelNames), 'V'+rint(1,3)+'.'+rint(0,9),
            rfloat(25,88,1), pick(factors),
            JSON.stringify([pick(factors),pick(factors)]),
            pick(['低','中','高','紧急']),
            pick(recs)+';'+pick(recs),
            rdate('2025-11-20','2025-12-02'),
            JSON.stringify([pick(qualityTypes),pick(['游戏','视频','网页','下载'])])
        );
    }
})();

// ===== 10. 用户质差记录 (500条) =====
console.log('插入用户质差记录...');
const uqiInsert = db.prepare(`INSERT INTO user_quality_issues (user_id,city_id,cei_score,quality_type,sub_type,duration_hours,affected_business,description,status,report_time) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const bizAffected = ['宽带上网','视频点播','在线游戏','IPTV直播','视频通话','云办公','在线教育','直播推流'];

db.transaction(() => {
    for (let i = 0; i < 500; i++) {
        const u = pick(userIds);
        const qt = pick(qualityTypes);
        uqiInsert.run(u.id, u.city_id, rfloat(40,78,1), qt,
            pick(['持续性','间歇性','突发性']),
            rfloat(0.5,72,1), pick(bizAffected),
            qt+'导致'+pick(bizAffected)+'受影响，持续'+rint(1,72)+'小时',
            pick(['质差中','已恢复','待确认','已恢复','已恢复']),
            rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 11. 业务质差记录 (200条) =====
console.log('插入业务质差记录...');
const bqiInsert = db.prepare(`INSERT INTO biz_quality_issues (biz_type,city_id,affected_users,avg_cei,avg_latency,avg_speed,packet_loss,quality_level,description,report_time) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const bizTypes = ['宽带上网','IPTV','视频通话','在线游戏','云办公','在线教育','直播推流','智能家居'];

db.transaction(() => {
    for (let i = 0; i < 200; i++) {
        const code = pick(Object.keys(cityMap));
        const bt = pick(bizTypes);
        const cei = rfloat(55,92,1);
        bqiInsert.run(bt, cityMap[code], rint(5,5000), cei,
            rfloat(5,80,1), rfloat(20,300,1), rfloat(0,10,3),
            cei>85?'优':(cei>75?'良':(cei>65?'中':'差')),
            bt+'业务在'+citiesData.find(c=>c[0]===code)[1]+'区域质量'+pick(['下降','波动','异常']),
            rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 12. PING测试 (400条) =====
console.log('插入PING测试记录...');
const pingInsert = db.prepare(`INSERT INTO ping_tests (test_id,target_ip,target_name,city_id,source_ip,packet_size,packet_count,avg_delay,max_delay,min_delay,jitter,packet_loss,packets_sent,packets_received,status,operator,test_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const pingTargets = [
    ['10.168.1.1','核心路由器'],['10.168.2.1','汇聚交换机'],['114.114.114.114','公共DNS'],
    ['8.8.8.8','Google DNS'],['202.98.0.68','吉林DNS'],['223.5.5.5','阿里DNS'],
    ['119.29.29.29','DNSPod'],['10.200.1.1','BRAS网关'],['10.100.1.1','城域网出口']
];

db.transaction(() => {
    for (let i = 0; i < 400; i++) {
        const code = pick(Object.keys(cityMap));
        const target = pick(pingTargets);
        const delay = rfloat(1,55,1);
        const loss = delay>35?rfloat(5,45,1):(delay>20?rfloat(0,12,1):rfloat(0,2,1));
        const cnt = pick([5,10,20,50,100]);
        const recv = Math.max(0, cnt - Math.round(cnt*loss/100));
        pingInsert.run('PING-'+String(i+1).padStart(6,'0'),
            target[0], target[1], cityMap[code], rip(),
            pick([32,64,128,256,512,1024]), cnt,
            delay, rfloat(delay,delay*2.5,1), rfloat(0.5,delay,1),
            rfloat(0.1,delay*0.3,1), loss, cnt, recv,
            loss>25?'异常':(loss>5||delay>30?'告警':'正常'),
            pick(handlers), rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 13. ONT光功率查询 (300条) =====
console.log('插入ONT光功率查询...');
const ontPInsert = db.prepare(`INSERT INTO ont_power_records (user_id,ont_id,city_id,ont_model,tx_power,rx_power,temperature,voltage,bias_current,olt_rx_power,optical_distance,status,query_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const ontMdls = ['HG8245H','HG8546M','F663N','HS8145V5','HG8145X6','HG8245Q2','HS8546V5','WA8021V5'];

db.transaction(() => {
    for (let i = 0; i < 300; i++) {
        const u = pick(userIds);
        const rx = rfloat(-28.5,-13,2);
        ontPInsert.run(u.id, 'ONT-'+u.user_account, u.city_id, pick(ontMdls),
            rfloat(1.5,3.5,2), rx, rfloat(22,68,1), rfloat(3.05,3.55,2),
            rfloat(5,45,1), rfloat(-28,-14,2), rfloat(0.1,25,2),
            rx<-26?'异常':(rx<-22?'告警':'正常'),
            rdate('2025-11-28','2025-12-02')
        );
    }
})();

// ===== 14. 网关远程重启 (200条) =====
console.log('插入网关重启记录...');
const gwInsert = db.prepare(`INSERT INTO gateway_restarts (gateway_id,gateway_sn,user_id,city_id,restart_reason,restart_type,operator,result,duration_seconds,restart_time) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const restartReasons = ['用户申报故障','CPU异常高','流量异常','定期维护','ONU离线','长时间未重启','内存溢出','固件升级','用户主动申请'];

db.transaction(() => {
    for (let i = 0; i < 200; i++) {
        const u = pick(userIds);
        const code = Object.keys(cityMap).find(k => cityMap[k] === u.city_id) || 'CC';
        gwInsert.run('GW-'+code+'-'+String(rint(1,9999)).padStart(5,'0'),
            '485754'+String(rint(10000000,99999999)),
            u.id, u.city_id, pick(restartReasons),
            pick(['远程重启','定时重启','紧急重启']),
            pick(handlers), srand()>0.1?'重启成功':'重启失败',
            rint(12,240), rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 15. DPI抓包 (200条) =====
console.log('插入DPI抓包记录...');
const dpiInsert = db.prepare(`INSERT INTO dpi_records (record_id,user_id,city_id,src_ip,src_port,dst_ip,dst_port,protocol,app_name,app_category,up_traffic,down_traffic,latency,tcp_retransmit_rate,status,capture_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const protocols = ['HTTP','HTTPS','DNS','RTMP','HLS','QUIC','TCP','UDP','HTTP/2','WebSocket'];
const apps = ['抖音','快手','B站','腾讯视频','爱奇艺','微信','王者荣耀','和平精英','淘宝','百度','京东','拼多多','支付宝','钉钉','腾讯会议','网易云音乐'];
const appCats = ['短视频','短视频','视频','视频','视频','即时通讯','游戏','游戏','购物','搜索','购物','购物','支付','办公','视频会议','音乐'];

db.transaction(() => {
    for (let i = 0; i < 200; i++) {
        const u = pick(userIds);
        const ai = rint(0,apps.length-1);
        dpiInsert.run('DPI-'+String(i+1).padStart(6,'0'), u.id, u.city_id,
            '192.168.'+rint(1,254)+'.'+rint(1,254), rint(1024,65535),
            rint(1,223)+'.'+rint(1,254)+'.'+rint(1,254)+'.'+rint(1,254), pick([80,443,8080,8443,53]),
            pick(protocols), apps[ai], appCats[ai],
            rfloat(0.01,80,2), rfloat(0.1,800,2),
            rfloat(1,100,1), rfloat(0,5,3),
            srand()>0.12?'正常':'异常', rdate('2025-12-01','2025-12-02')
        );
    }
})();

// ===== 16. 光路测试 (250条) =====
console.log('插入光路测试记录...');
const otInsert = db.prepare(`INSERT INTO optical_tests (test_id,olt_id,ont_device_id,city_id,pon_port,event_type,reason,tx_power,rx_power,distance,duration_minutes,event_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const offlineReasons = ['光功率低','设备故障','用户关机','dying-gasp','掉电','光纤被挖断','分光器故障','OLT端口故障'];

db.transaction(() => {
    for (let i = 0; i < 250; i++) {
        const olt = pick(oltIds);
        const code = Object.keys(cityMap).find(k => cityMap[k] === olt.city_id) || 'CC';
        const evType = srand()>0.3?'上线':'下线';
        otInsert.run('OT-'+String(i+1).padStart(5,'0'),
            olt.id, 'ONT-'+code+'-'+String(rint(1,9999)).padStart(5,'0'), olt.city_id,
            'GPON 0/'+rint(0,7)+'/'+rint(0,15), evType,
            evType==='下线'?pick(offlineReasons):'正常注册',
            rfloat(1.2,3.5,2), rfloat(-27,-13,2), rfloat(0.1,25,1),
            evType==='下线'?rint(1,720):0,
            rdate('2025-11-25','2025-12-02')
        );
    }
})();

// ===== 17. CON网络分析 (150条) =====
console.log('插入CON网络分析...');
const conInsert = db.prepare(`INSERT INTO con_analysis (analysis_id,city_id,node_type,node_id,node_name,bandwidth,utilization,peak_utilization,avg_latency,peak_latency,packet_loss,in_traffic,out_traffic,status,analysis_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const nodeTypes = ['OLT','BRAS','交换机','路由器','汇聚交换机','核心路由器','城域网出口'];

db.transaction(() => {
    for (let i = 0; i < 150; i++) {
        const code = pick(Object.keys(cityMap));
        const nt = pick(nodeTypes);
        const util = rfloat(8,98,1);
        conInsert.run('CON-'+String(i+1).padStart(5,'0'), cityMap[code],
            nt, nt.substring(0,1)+'-'+code+'-'+String(rint(1,50)).padStart(3,'0'),
            citiesData.find(c=>c[0]===code)[1]+pick(['核心','汇聚','接入','出口'])+nt+'-'+rint(1,20),
            pick(['1GE','10GE','40GE','100GE']),
            util, rfloat(util,Math.min(99,util+15),1),
            rfloat(0.5,35,1), rfloat(1,80,1), rfloat(0,4,3),
            rfloat(100,50000,1), rfloat(100,50000,1),
            util>90?'异常':(util>75?'告警':'正常'),
            rdate('2025-12-01','2025-12-02')
        );
    }
})();

// ===== 18. 工单 (800条) =====
console.log('插入工单数据...');
const woInsert = db.prepare(`INSERT INTO work_orders (order_id,title,description,order_type,order_source,city_id,user_id,user_account,status,priority,quality_type,assignee,assignee_phone,dispatch_time,resolve_duration_hours,is_overdue,resolution,root_cause,satisfaction,pre_cei,post_cei,cei_improvement,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const woTypes = ['用户申诉','主动发现','系统告警','AI预测','巡检发现'];
const woSources = ['10086','APP','网厅','主动发现','系统自动','巡检系统'];
const woTitles = ['宽带无法上网','网速慢','频繁掉线','视频卡顿严重','IPTV花屏马赛克','游戏延迟高','WiFi信号弱覆盖差','光猫红灯告警','网关无法登录管理','下载速度不达标','上传速度异常低','DNS解析异常','网页打开缓慢','视频通话断续','直播推流卡顿','智能家居设备掉线','路由器频繁重启','宽带间歇性断网','IPTV信号中断','网络延迟抖动大'];
const woStatuses = ['待派单','已派单','处理中','已解决','已关闭'];
const rootCauses = ['光衰过大','线路老化','设备故障','WiFi信道拥挤','带宽不足','DNs故障','光猫故障','用户终端问题','施工割接影响','光缆故障','分光器故障','OLT端口故障'];
const satisfactions = ['非常满意','满意','一般','不满意'];

db.transaction(() => {
    for (let i = 0; i < 800; i++) {
        const u = pick(userIds);
        const s = pick(woStatuses);
        const isResolved = s==='已解决'||s==='已关闭';
        const preCei = rfloat(45,78,1);
        const postCei = isResolved ? rfloat(preCei+5,95,1) : null;
        const dur = isResolved ? rfloat(0.5,72,1) : null;
        woInsert.run(
            'WO-'+String(20251116+rint(0,16))+String(rint(10000,99999)),
            pick(woTitles),
            pick(woTitles)+'，用户反馈'+pick(['无法使用','体验差','影响工作','无法观看','频繁中断']),
            pick(woTypes), pick(woSources), u.city_id, u.id, u.user_account,
            s, pick(['低','中','中','高','紧急']),
            pick(qualityTypes),
            s!=='待派单'?pick(handlers):null,
            s!=='待派单'?'138'+String(rint(10000000,99999999)):null,
            s!=='待派单'?rdate('2025-11-16','2025-12-02'):null,
            dur, dur&&dur>24?1:0,
            isResolved?pick(['已修复','已更换设备','已优化配置','已升级带宽','已重新熔接','用户侧问题已解决']):null,
            isResolved?pick(rootCauses):null,
            isResolved?pick(satisfactions):null,
            preCei, postCei, postCei?parseFloat((postCei-preCei).toFixed(1)):null,
            rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 19. 告警 (500条) =====
console.log('插入告警数据...');
const alertInsert = db.prepare(`INSERT INTO alerts (alert_id,alert_type,alert_level,source,source_id,city_id,title,description,affected_users,status,handler,alert_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const alertTypes = ['设备告警','链路告警','性能告警','光功率告警','端口告警','温度告警','CPU告警','内存告警','丢包告警','用户掉线告警'];
const alertLevels = ['提示','一般','重要','紧急'];

db.transaction(() => {
    for (let i = 0; i < 500; i++) {
        const code = pick(Object.keys(cityMap));
        const at = pick(alertTypes);
        alertInsert.run('ALT-'+String(i+1).padStart(6,'0'), at,
            pick(alertLevels), pick(['OLT','BRAS','PON','交换机','核心网']),
            pick(['OLT','BRAS','SW','RT'])[0]+'-'+code+'-'+String(rint(1,50)).padStart(3,'0'),
            cityMap[code], at+'-'+citiesData.find(c=>c[0]===code)[1],
            at+'，设备'+pick(['端口down','CPU超限','内存不足','光功率异常','温度过高','链路中断']),
            rint(0,5000),
            pick(['未确认','已确认','处理中','已恢复','已恢复','已恢复']),
            pick(handlers), rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 20. 操作日志 (600条) =====
console.log('插入操作日志...');
const logInsert = db.prepare(`INSERT INTO operation_logs (username,ip_address,module,action,description,result,created_at) VALUES (?,?,?,?,?,?,?)`);
const modules = ['全景视图','质量画像','质差定界','远程操作','工单管理','用户管理','系统管理','登录认证'];
const actions = ['查询','导出','新增','编辑','删除','登录','登出','PING测试','网关重启','DPI抓包','工单派发','工单处理'];

db.transaction(() => {
    for (let i = 0; i < 600; i++) {
        const mod = pick(modules);
        const act = pick(actions);
        logInsert.run(pick(['admin','zhangwei','cc_admin','jl_admin','sp_op1','ly_admin','th_op1','sy_admin']),
            rip(), mod, act, mod+'-'+act+'-'+pick(['成功','完成','执行']),
            srand()>0.05?'成功':'失败',
            rdate('2025-11-16','2025-12-02')
        );
    }
})();

// ===== 21. 系统配置 =====
console.log('插入系统配置...');
const cfgInsert = db.prepare(`INSERT INTO system_configs (config_key,config_value,config_type,category,description,is_editable) VALUES (?,?,?,?,?,?)`);
const configs = [
    ['cei.weight.business','0.6','number','CEI评估','业务CEI权重系数',1],
    ['cei.weight.network','0.4','number','CEI评估','网络CEI权重系数',1],
    ['cei.threshold.poor','80','number','CEI评估','质差用户CEI阈值',1],
    ['cei.threshold.warning','85','number','CEI评估','告警用户CEI阈值',1],
    ['workorder.timeout.hours','24','number','工单管理','工单处理超时阈值(小时)',1],
    ['workorder.dispatch.auto','true','boolean','工单管理','是否自动派单',1],
    ['workorder.dispatch.rule','area','string','工单管理','派单规则(area/load/manual)',1],
    ['alert.auto_recover.enabled','true','boolean','告警管理','是否启用自动恢复检测',1],
    ['alert.notify.channels','sms,email,dingtalk','string','告警管理','告警通知渠道',1],
    ['ping.default.count','10','number','远程操作','PING默认次数',1],
    ['ping.default.size','64','number','远程操作','PING默认包大小',1],
    ['ping.timeout.ms','5000','number','远程操作','PING超时时间(ms)',1],
    ['system.session.timeout','1800','number','系统安全','会话超时时间(秒)',1],
    ['system.password.min_length','8','number','系统安全','密码最小长度',1],
    ['system.login.max_retry','5','number','系统安全','最大登录重试次数',1],
    ['data.retention.days','90','number','数据管理','数据保留天数',1],
    ['report.auto_generate','true','boolean','报表管理','是否自动生成日报',1],
    ['quality.model.version','V3.2','string','质差模型','当前模型版本',0],
    ['quality.model.update_time','2025-11-15 08:00:00','string','质差模型','模型更新时间',0],
    ['gis.map.center','125.3245,43.8868','string','GIS配置','地图中心坐标',1],
    ['gis.map.zoom','7','number','GIS配置','地图默认缩放级别',1],
];
db.transaction(() => { for (const c of configs) cfgInsert.run(...c); })();

// ===== 22. 定时任务 =====
const taskInsert = db.prepare(`INSERT INTO scheduled_tasks (task_name,task_type,cron_expression,status,last_run_at,last_run_result,description) VALUES (?,?,?,?,?,?,?)`);
const tasks = [
    ['CEI评分计算','数据计算','0 */1 * * *','启用','2025-12-02 14:00:00','成功','每小时计算一次CEI评分'],
    ['质差模型分析','AI分析','0 */2 * * *','启用','2025-12-02 14:00:00','成功','每2小时执行质差模型分析'],
    ['设备状态采集','数据采集','*/5 * * * *','启用','2025-12-02 14:30:00','成功','每5分钟采集设备状态'],
    ['告警自动恢复检测','告警管理','*/10 * * * *','启用','2025-12-02 14:30:00','成功','每10分钟检测告警恢复'],
    ['日报自动生成','报表','0 8 * * *','启用','2025-12-02 08:00:00','成功','每日8点生成运营日报'],
    ['数据清理','数据管理','0 3 * * *','启用','2025-12-02 03:00:00','成功','每日3点清理过期数据'],
    ['工单超时检测','工单管理','0 */1 * * *','启用','2025-12-02 14:00:00','成功','每小时检测超时工单'],
];
db.transaction(() => { for (const t of tasks) taskInsert.run(...t); })();

// ===== 完成 =====
console.log('\n=== 数据库初始化完成 ===');
console.log('  PON异常: ' + db.prepare('SELECT COUNT(*) as c FROM pon_anomalies').get().c);
console.log('  CEI汇总: ' + db.prepare('SELECT COUNT(*) as c FROM cei_daily_summary').get().c);
console.log('  质差模型: ' + db.prepare('SELECT COUNT(*) as c FROM quality_model_results').get().c);
console.log('  用户质差: ' + db.prepare('SELECT COUNT(*) as c FROM user_quality_issues').get().c);
console.log('  业务质差: ' + db.prepare('SELECT COUNT(*) as c FROM biz_quality_issues').get().c);
console.log('  PING测试: ' + db.prepare('SELECT COUNT(*) as c FROM ping_tests').get().c);
console.log('  ONT光功率: ' + db.prepare('SELECT COUNT(*) as c FROM ont_power_records').get().c);
console.log('  网关重启: ' + db.prepare('SELECT COUNT(*) as c FROM gateway_restarts').get().c);
console.log('  DPI记录: ' + db.prepare('SELECT COUNT(*) as c FROM dpi_records').get().c);
console.log('  光路测试: ' + db.prepare('SELECT COUNT(*) as c FROM optical_tests').get().c);
console.log('  CON分析: ' + db.prepare('SELECT COUNT(*) as c FROM con_analysis').get().c);
console.log('  工单: ' + db.prepare('SELECT COUNT(*) as c FROM work_orders').get().c);
console.log('  告警: ' + db.prepare('SELECT COUNT(*) as c FROM alerts').get().c);
console.log('  操作日志: ' + db.prepare('SELECT COUNT(*) as c FROM operation_logs').get().c);
console.log('  系统配置: ' + db.prepare('SELECT COUNT(*) as c FROM system_configs').get().c);
console.log('\n数据库文件: ' + require('./database').DB_PATH);
