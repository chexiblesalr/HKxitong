/**
 * 家宽网络质量分析平台 - 数据库种子数据生成器 (sql.js版)
 */
const { getDb, initSchema, saveDb, queryAll, queryOne, execute } = require('./database');

let seed = 20251202;
function sr() { seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
function ri(a,b) { return Math.floor(sr()*(b-a+1))+a; }
function rf(a,b,d) { return parseFloat((sr()*(b-a)+a).toFixed(d||2)); }
function pk(a) { return a[ri(0,a.length-1)]; }
function rd(s,e) {
    const st=new Date(s).getTime(),et=new Date(e).getTime(),d=new Date(st+sr()*(et-st));
    const p=n=>n<10?'0'+n:''+n;
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
}
function rip(){return ri(10,172)+'.'+ri(1,254)+'.'+ri(1,254)+'.'+ri(1,254);}
function ws(){const r=sr();return r<0.78?'正常':(r<0.92?'告警':'异常');}

async function run() {
    console.log('=== 初始化数据库 ===');
    await initSchema();

    // 检查是否已有数据，如果有则跳过
    const existing = queryOne('SELECT COUNT(*) as c FROM cities');
    if (existing && existing.c > 0) {
        console.log('数据库已有数据（地市数: ' + existing.c + '），跳过seed。');
        return;
    }

    // 1. 地市
    console.log('插入地市...');
    const cities=[['CC','长春',125.3245,43.8868,906.69,96.5,1],['JL','吉林',126.5496,43.8378,362.34,94.2,2],
        ['SP','四平',124.3504,43.1667,181.27,92.8,3],['LY','辽源',125.1451,42.8878,104.34,91.5,4],
        ['TH','通化',125.939,41.728,196.52,90.3,5],['BS','白山',126.4279,41.9425,95.28,89.8,6],
        ['SY','松原',124.825,45.1412,252.67,93.1,7],['BC','白城',122.841,45.619,160.89,91.2,8],
        ['YB','延边',129.5133,42.8918,194.17,93.8,9],['CBS','长白山',128.0578,42.0486,6.78,88.5,10]];
    cities.forEach(c=>execute(`INSERT INTO cities(city_code,city_name,longitude,latitude,population_wan,broadband_coverage,sort_order)VALUES(?,?,?,?,?,?,?)`,c));

    const cityMap={};
    queryAll('SELECT id,city_code FROM cities').forEach(r=>{cityMap[r.city_code]=r.id;});

    // 2. 区县
    console.log('插入区县...');
    const dists={'CC':['南关区','朝阳区','二道区','绿园区','宽城区','经开区','高新区','净月区','双阳区','九台区','榆树市','农安县','德惠市'],
        'JL':['昌邑区','船营区','龙潭区','丰满区','永吉县','蛟河市','桦甸市','磐石市','舒兰市'],
        'SP':['铁西区','铁东区','梨树县','伊通县','双辽市','公主岭市'],'LY':['龙山区','西安区','东丰县','东辽县'],
        'TH':['东昌区','二道江区','梅河口市','集安市','通化县','辉南县','柳河县'],'BS':['浑江区','江源区','临江市','抚松县','靖宇县','长白县'],
        'SY':['宁江区','前郭县','长岭县','乾安县','扶余市'],'BC':['洮北区','镇赉县','通榆县','大安市','洮南市'],
        'YB':['延吉市','图们市','敦化市','珲春市','龙井市','和龙市','汪清县','安图县'],'CBS':['池北区','池西区','池南区']};
    for(const[code,names]of Object.entries(dists)){
        const cid=cityMap[code],base=cities.find(c=>c[0]===code);
        names.forEach((n,i)=>execute(`INSERT INTO districts(city_id,district_code,district_name,longitude,latitude)VALUES(?,?,?,?,?)`,
            [cid,code+String(i+1).padStart(2,'0'),n,base[2]+rf(-0.5,0.5,4),base[3]+rf(-0.3,0.3,4)]));
    }
    const distMap={};
    queryAll('SELECT id,city_id,district_name FROM districts').forEach(r=>{if(!distMap[r.city_id])distMap[r.city_id]=[];distMap[r.city_id].push(r);});

    // 3. 系统用户
    console.log('插入系统用户...');
    const sn=['李','王','张','刘','陈','杨','黄','赵','周','吴'],nm=['明','华','强','伟','芳','敏','磊','峰','军','杰','涛','超'];
    execute(`INSERT INTO system_users(username,password_hash,real_name,role,department,phone,email,status,last_login_at,login_count)VALUES(?,?,?,?,?,?,?,?,?,?)`,
        ['admin','e10adc3949ba59abbe56e057f20f883e','系统管理员','admin','信息技术部','13800000001','admin@jlct.com',1,'2025-12-02 14:20:05',1256]);
    for(const[code,cid]of Object.entries(cityMap)){
        for(let i=0;i<3;i++){
            const uname=code.toLowerCase()+'_'+['admin','op1','op2'][i];
            execute(`INSERT INTO system_users(username,password_hash,real_name,role,city_id,department,phone,email,status,last_login_at,login_count)VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
                [uname,'e10adc3949ba59abbe56e057f20f883e',pk(sn)+pk(nm),['city_admin','operator','viewer'][i],cid,
                cities.find(c=>c[0]===code)[1]+'网络运维部','138'+String(ri(10000000,99999999)),uname+'@jlct.com',1,rd('2025-11-28','2025-12-02'),ri(50,500)]);
        }
    }

    // 4. BRAS设备
    console.log('插入BRAS设备...');
    const brasM=['ME60-X16','ME60-X8','NE40E-X16','NE40E-X8','CR16010H-F'];
    const brasV=['华为','华为','华为','华为','中兴'];
    for(const[code,cid]of Object.entries(cityMap)){
        const cnt=code==='CC'?6:(code==='JL'||code==='YB'?4:(code==='CBS'?2:3));
        for(let i=1;i<=cnt;i++){
            const mi=ri(0,brasM.length-1);
            execute(`INSERT INTO bras_devices(device_name,city_id,model,vendor,ip_address,online_users,cpu_usage,memory_usage,uplink_bandwidth,uplink_utilization,cei_score,status,uptime_days,location)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                ['BRAS-'+code+'-'+String(i).padStart(2,'0'),cid,brasM[mi],brasV[mi],rip(),ri(25000,135000),rf(15,75,1),rf(20,68,1),
                pk(['10GE','40GE','100GE']),rf(20,85,1),rf(89.5,95.5,1),ws(),ri(30,720),pk(['核心机房','城域汇聚点','数据中心'])]);
        }
    }
    const brasIds={};
    queryAll('SELECT id,city_id FROM bras_devices').forEach(r=>{if(!brasIds[r.city_id])brasIds[r.city_id]=[];brasIds[r.city_id].push(r.id);});

    // 5. OLT设备
    console.log('插入OLT设备...');
    const oltM=['MA5800-X17','MA5800-X7','MA5680T','MA5608T','C300','C220'];
    for(const[code,cid]of Object.entries(cityMap)){
        const cnt=code==='CC'?55:(code==='JL'?35:(code==='YB'?28:(code==='CBS'?8:ri(15,25))));
        const cd=distMap[cid]||[],cb=brasIds[cid]||[];
        for(let i=1;i<=cnt;i++){
            const st=ws(),isOn=st!=='异常'||sr()>0.3?1:0,pp=pk([8,16,16,32,64]),to=ri(200,4000);
            const dist=cd.length?pk(cd):null;
            execute(`INSERT INTO olt_devices(device_id,device_name,city_id,district_id,bras_id,model,vendor,ip_address,pon_ports,used_pon_ports,online_ont_count,total_ont_count,cpu_usage,memory_usage,temperature,uplink_bandwidth,uplink_utilization,cei_score,status,is_online,uptime_days,location)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                ['OLT-'+code+'-'+String(i).padStart(4,'0'),cities.find(c=>c[0]===code)[1]+pk(['东','西','南','北','中'])+'局OLT-'+i,
                cid,dist?dist.id:null,cb.length?pk(cb):null,pk(oltM),pk(['华为','中兴']),rip(),
                pp,ri(Math.floor(pp*0.3),pp),Math.floor(to*rf(0.85,0.99,2)),to,
                rf(10,85,1),rf(15,78,1),rf(25,55,1),pk(['10GE','40GE']),rf(15,92,1),
                rf(88,96,1),st,isOn,ri(1,900),(dist?dist.district_name:'')+'机房'+pk(['A','B','C','D'])]);
        }
    }
    const oltIds=queryAll('SELECT id,city_id,device_id FROM olt_devices');
    const oltByCity={};
    oltIds.forEach(r=>{if(!oltByCity[r.city_id])oltByCity[r.city_id]=[];oltByCity[r.city_id].push(r);});

    // 6. 宽带用户 (2000)
    console.log('插入宽带用户(2000条)...');
    const ontM=['HG8245H','HG8546M','HG8145X6','HS8145V5','F663N'],gwM=['HG8245H','HS8145V5','HG8546M','WA8021V5'];
    const ptypes=['宽带','宽带','宽带','电视','电视','固话','融合','融合'];
    const bws=[100,100,200,200,300,500,500,1000];
    const qtypes=['线路质差','高时延','网关cpu高','频繁重启','视频卡顿','游戏高时延','wifi干扰','信道利用率高','配置质差'];
    const streets=['人民大街','解放大路','长春大街','南湖大路','卫星路','硅谷大街','远达大街'];
    for(let i=0;i<2000;i++){
        const code=pk(Object.keys(cityMap)),cid=cityMap[code];
        const cd=distMap[cid]||[],co=oltByCity[cid]||[];
        const dist=cd.length?pk(cd):null,olt=co.length?pk(co):null;
        const cei=rf(55,99,1),isQ=cei<75?1:(cei<80&&sr()>0.5?1:0),rx=rf(-28,-14,2);
        execute(`INSERT INTO broadband_users(user_account,user_name,phone,city_id,district_id,address,olt_id,pon_port,ont_id,ont_sn,ont_model,bandwidth,product_type,tx_power,rx_power,ont_temperature,ont_voltage,ont_status,gateway_id,gateway_model,overall_cei,business_cei,network_cei,download_speed,upload_speed,latency,packet_loss,is_quality_issue,quality_issue_type,last_online_at)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            ['JL'+String(20250001+i),pk(sn)+pk(nm)+(sr()>0.5?pk(nm):''),'1'+pk(['38','39','58','86'])+String(ri(10000000,99999999)),
            cid,dist?dist.id:null,(dist?dist.district_name:'')+pk(streets)+ri(1,300)+'号',
            olt?olt.id:null,'GPON 0/'+ri(0,7)+'/'+ri(0,15),'ONT-'+code+'-'+String(i+1).padStart(5,'0'),
            '485754'+String(ri(10000000,99999999)),pk(ontM),pk(bws),pk(ptypes),
            rf(1.5,3.5,2),rx,rf(25,60,1),rf(3.1,3.5,2),rx<-25?'异常':(rx<-22?'告警':'在线'),
            'GW-'+code+'-'+String(ri(1,9999)).padStart(5,'0'),pk(gwM),
            cei,rf(cei-5,cei+3,1),rf(cei-3,cei+4,1),rf(30,500,1),rf(8,100,1),rf(3,50,1),rf(0,5,3),
            isQ,isQ?pk(qtypes):null,rd('2025-12-01','2025-12-02')]);
    }
    const userIds=queryAll('SELECT id,city_id,user_account FROM broadband_users');

    console.log('基础数据完成: 地市'+Object.keys(cityMap).length+' BRAS'+queryOne('SELECT COUNT(*)as c FROM bras_devices').c+' OLT'+oltIds.length+' 用户'+userIds.length);

    // 7. PON光功率异常 (300)
    console.log('插入PON异常/CEI汇总/质差/工单/告警...');
    const handlers=['张工','李工','王工','赵工','刘工','陈工','杨工','黄工'];
    const ponT=['光功率偏低','光功率偏高','ONU离线','光衰增大','PON口异常','光纤断裂','分光器故障'];
    for(let i=0;i<300;i++){
        const code=pk(Object.keys(cityMap)),cid=cityMap[code],co=oltByCity[cid]||[],olt=co.length?pk(co):oltIds[0];
        const at=pk(ponT),sev=(at==='ONU离线'||at==='光纤断裂')?'严重':pk(['一般','紧急','一般']);
        execute(`INSERT INTO pon_anomalies(anomaly_id,olt_id,pon_port,city_id,tx_power,rx_power,anomaly_type,severity,affected_users,status,handler,discovery_time)VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
            ['PON-'+code+'-'+String(i+1).padStart(5,'0'),olt.id,'GPON 0/'+ri(0,7)+'/'+ri(0,15),cid,rf(1.2,3.5,2),rf(-29,-12,2),at,sev,ri(1,256),pk(['待处理','处理中','已恢复','已恢复']),pk(handlers),rd('2025-11-16','2025-12-02')]);
    }

    // 8. CEI每日汇总 (170)
    const dateLabels=[];for(let d=16;d<=30;d++)dateLabels.push('2025-11-'+String(d).padStart(2,'0'));dateLabels.push('2025-12-01','2025-12-02');
    const cbs={'CC':{u:1280000,g:76.2,c:94.2},'JL':{u:549000,g:32.8,c:93.1},'SP':{u:292000,g:17.5,c:91.8},'LY':{u:146000,g:8.7,c:92.5},
        'TH':{u:219000,g:13,c:91.2},'BS':{u:183000,g:10.8,c:90.8},'SY':{u:292000,g:17.5,c:92},'BC':{u:183000,g:10.8,c:91.5},'YB':{u:365000,g:21.7,c:93.5},'CBS':{u:146000,g:8.6,c:90.5}};
    for(const[code,cid]of Object.entries(cityMap)){
        const b=cbs[code];
        dateLabels.forEach(dt=>{
            const f=rf(-0.3,0.3,1);
            execute(`INSERT INTO cei_daily_summary(city_id,record_date,total_users,active_users,gateway_count,active_gateway_count,dpi_active_users,overall_cei,business_cei,network_cei,avg_download_speed,avg_upload_speed,avg_latency,avg_packet_loss,quality_issue_count,work_order_count,top10_video_speed,home_network_quality,gaming_latency)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [cid,dt,Math.floor(b.u*rf(0.98,1.02,3)),Math.floor(b.u*rf(0.92,0.97,3)),b.g+rf(-0.5,0.5,1),b.g+rf(-1,0,1),b.g+rf(-2,-0.5,1),
                b.c+f,b.c+f-rf(0.5,1.5,1),b.c+f+rf(0.3,1.2,1),rf(150,220,1),rf(35,55,1),rf(8,18,1),rf(0.1,0.8,3),ri(20,200),ri(10,80),rf(24,32,1),rf(93,97,1),rf(12,25,1)]);
        });
    }

    // 9. 质差模型 (300)
    const models=['线路质差模型','设备质差模型','家庭网络模型','传输质差模型','WiFi干扰模型','光路衰减模型'];
    const factors=['光衰过大','CPU利用率高','丢包严重','时延过大','WiFi干扰','带宽不足','终端老旧','线路老化'];
    const recs=['更换光猫','优化WiFi','升级带宽','更换线路','重启设备','升级固件','更换分光器'];
    for(let i=0;i<300;i++){
        const u=pk(userIds);
        execute(`INSERT INTO quality_model_results(result_id,user_id,city_id,model_name,score,primary_factor,severity,recommendation,analysis_time)VALUES(?,?,?,?,?,?,?,?,?)`,
            ['QM-'+String(i+1).padStart(5,'0'),u.id,u.city_id,pk(models),rf(25,88,1),pk(factors),pk(['低','中','高','紧急']),pk(recs),rd('2025-11-20','2025-12-02')]);
    }

    // 10. 用户质差 (500)
    const bizAff=['宽带上网','视频点播','在线游戏','IPTV直播','视频通话','云办公','在线教育'];
    for(let i=0;i<500;i++){
        const u=pk(userIds);
        execute(`INSERT INTO user_quality_issues(user_id,city_id,cei_score,quality_type,duration_hours,affected_business,status,report_time)VALUES(?,?,?,?,?,?,?,?)`,
            [u.id,u.city_id,rf(40,78,1),pk(qtypes),rf(0.5,72,1),pk(bizAff),pk(['质差中','已恢复','待确认','已恢复']),rd('2025-11-16','2025-12-02')]);
    }

    // 11. 业务质差 (200)
    const bizT=['宽带上网','IPTV','视频通话','在线游戏','云办公','在线教育','直播推流','智能家居'];
    for(let i=0;i<200;i++){
        const code=pk(Object.keys(cityMap)),cei=rf(55,92,1);
        execute(`INSERT INTO biz_quality_issues(biz_type,city_id,affected_users,avg_cei,avg_latency,avg_speed,packet_loss,quality_level,report_time)VALUES(?,?,?,?,?,?,?,?,?)`,
            [pk(bizT),cityMap[code],ri(5,5000),cei,rf(5,80,1),rf(20,300,1),rf(0,10,3),cei>85?'优':(cei>75?'良':(cei>65?'中':'差')),rd('2025-11-16','2025-12-02')]);
    }

    // 12. PING测试 (400)
    const pingT=[['10.168.1.1','核心路由器'],['114.114.114.114','公共DNS'],['8.8.8.8','Google DNS'],['202.98.0.68','吉林DNS'],['10.200.1.1','BRAS网关']];
    for(let i=0;i<400;i++){
        const code=pk(Object.keys(cityMap)),t=pk(pingT),dl=rf(1,55,1),ls=dl>35?rf(5,45,1):(dl>20?rf(0,12,1):rf(0,2,1)),cnt=pk([5,10,20,50]);
        execute(`INSERT INTO ping_tests(test_id,target_ip,target_name,city_id,source_ip,packet_size,packet_count,avg_delay,max_delay,min_delay,packet_loss,packets_sent,packets_received,status,operator,test_time)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            ['PING-'+String(i+1).padStart(6,'0'),t[0],t[1],cityMap[code],rip(),pk([32,64,128,256]),cnt,dl,rf(dl,dl*2.5,1),rf(0.5,dl,1),ls,cnt,Math.max(0,cnt-Math.round(cnt*ls/100)),
            ls>25?'异常':(ls>5||dl>30?'告警':'正常'),pk(handlers),rd('2025-11-16','2025-12-02')]);
    }

    // 13. ONT光功率 (300)
    for(let i=0;i<300;i++){
        const u=pk(userIds),rx=rf(-28.5,-13,2);
        execute(`INSERT INTO ont_power_records(user_id,ont_id,city_id,ont_model,tx_power,rx_power,temperature,voltage,bias_current,optical_distance,status,query_time)VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
            [u.id,'ONT-'+u.user_account,u.city_id,pk(ontM),rf(1.5,3.5,2),rx,rf(22,68,1),rf(3.05,3.55,2),rf(5,45,1),rf(0.1,25,2),rx<-26?'异常':(rx<-22?'告警':'正常'),rd('2025-11-28','2025-12-02')]);
    }

    // 14. 网关重启 (200)
    const restR=['用户申报故障','CPU异常高','流量异常','定期维护','ONU离线','内存溢出'];
    for(let i=0;i<200;i++){
        const u=pk(userIds),code=Object.keys(cityMap).find(k=>cityMap[k]===u.city_id)||'CC';
        execute(`INSERT INTO gateway_restarts(gateway_id,gateway_sn,user_id,city_id,restart_reason,operator,result,duration_seconds,restart_time)VALUES(?,?,?,?,?,?,?,?,?)`,
            ['GW-'+code+'-'+String(ri(1,9999)).padStart(5,'0'),'485754'+String(ri(10000000,99999999)),u.id,u.city_id,pk(restR),pk(handlers),sr()>0.1?'重启成功':'重启失败',ri(12,240),rd('2025-11-16','2025-12-02')]);
    }

    // 15. DPI (200)
    const apps=['抖音','快手','B站','腾讯视频','爱奇艺','微信','王者荣耀','和平精英','淘宝','百度','钉钉','腾讯会议'];
    const protos=['HTTP','HTTPS','DNS','RTMP','HLS','QUIC','TCP','UDP'];
    for(let i=0;i<200;i++){
        const u=pk(userIds);
        execute(`INSERT INTO dpi_records(record_id,user_id,city_id,src_ip,src_port,dst_ip,dst_port,protocol,app_name,up_traffic,down_traffic,latency,tcp_retransmit_rate,status,capture_time)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            ['DPI-'+String(i+1).padStart(6,'0'),u.id,u.city_id,'192.168.'+ri(1,254)+'.'+ri(1,254),ri(1024,65535),
            ri(1,223)+'.'+ri(1,254)+'.'+ri(1,254)+'.'+ri(1,254),pk([80,443,8080]),pk(protos),pk(apps),
            rf(0.01,80,2),rf(0.1,800,2),rf(1,100,1),rf(0,5,3),sr()>0.12?'正常':'异常',rd('2025-12-01','2025-12-02')]);
    }

    // 16. 光路测试 (250)
    const offR=['光功率低','设备故障','用户关机','dying-gasp','掉电','光纤被挖断'];
    for(let i=0;i<250;i++){
        const olt=pk(oltIds),ev=sr()>0.3?'上线':'下线';
        execute(`INSERT INTO optical_tests(test_id,olt_id,ont_device_id,city_id,pon_port,event_type,reason,tx_power,rx_power,distance,duration_minutes,event_time)VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
            ['OT-'+String(i+1).padStart(5,'0'),olt.id,'ONT-'+olt.device_id.split('-')[1]+'-'+String(ri(1,9999)).padStart(5,'0'),olt.city_id,
            'GPON 0/'+ri(0,7)+'/'+ri(0,15),ev,ev==='下线'?pk(offR):'正常注册',rf(1.2,3.5,2),rf(-27,-13,2),rf(0.1,25,1),ev==='下线'?ri(1,720):0,rd('2025-11-25','2025-12-02')]);
    }

    // 17. CON网络分析 (150)
    const nodeT=['OLT','BRAS','交换机','路由器','汇聚交换机','核心路由器'];
    for(let i=0;i<150;i++){
        const code=pk(Object.keys(cityMap)),ut=rf(8,98,1);
        execute(`INSERT INTO con_analysis(analysis_id,city_id,node_type,node_id,node_name,bandwidth,utilization,peak_utilization,avg_latency,packet_loss,in_traffic,out_traffic,status,analysis_time)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            ['CON-'+String(i+1).padStart(5,'0'),cityMap[code],pk(nodeT),'N-'+code+'-'+String(ri(1,50)).padStart(3,'0'),
            cities.find(c=>c[0]===code)[1]+pk(['核心','汇聚','接入'])+pk(nodeT),pk(['1GE','10GE','40GE','100GE']),
            ut,rf(ut,Math.min(99,ut+15),1),rf(0.5,35,1),rf(0,4,3),rf(100,50000,1),rf(100,50000,1),
            ut>90?'异常':(ut>75?'告警':'正常'),rd('2025-12-01','2025-12-02')]);
    }

    // 18. 工单 (800)
    console.log('插入工单(800条)...');
    const woT=['用户申诉','主动发现','系统告警','AI预测','巡检发现'];
    const woTitles=['宽带无法上网','网速慢','频繁掉线','视频卡顿','IPTV花屏','游戏延迟高','WiFi信号弱','光猫红灯','下载速度不达标','网页打开慢','视频通话断续','路由器频繁重启','宽带间歇性断网','IPTV信号中断'];
    const woS=['待派单','已派单','处理中','已解决','已关闭'];
    for(let i=0;i<800;i++){
        const u=pk(userIds),s=pk(woS),done=s==='已解决'||s==='已关闭',pc=rf(45,78,1),dur=done?rf(0.5,72,1):null;
        execute(`INSERT INTO work_orders(order_id,title,order_type,city_id,user_id,user_account,status,priority,quality_type,assignee,resolve_duration_hours,is_overdue,resolution,root_cause,satisfaction,pre_cei,post_cei,cei_improvement,created_at)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            ['WO-'+String(20251116+ri(0,16))+String(ri(10000,99999)),pk(woTitles),pk(woT),u.city_id,u.id,u.user_account,s,pk(['低','中','中','高','紧急']),pk(qtypes),
            s!=='待派单'?pk(handlers):null,dur,dur&&dur>24?1:0,done?pk(['已修复','已更换设备','已优化配置','已升级带宽']):null,
            done?pk(['光衰过大','线路老化','设备故障','WiFi拥挤','带宽不足','光猫故障']):null,done?pk(['非常满意','满意','一般','不满意']):null,
            pc,done?rf(pc+5,95,1):null,done?parseFloat((rf(pc+5,95,1)-pc).toFixed(1)):null,rd('2025-11-16','2025-12-02')]);
    }

    // 19. 告警 (500)
    const altT=['设备告警','链路告警','性能告警','光功率告警','端口告警','温度告警','CPU告警','内存告警'];
    for(let i=0;i<500;i++){
        const code=pk(Object.keys(cityMap)),at=pk(altT);
        execute(`INSERT INTO alerts(alert_id,alert_type,alert_level,source,city_id,title,description,affected_users,status,handler,alert_time)VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
            ['ALT-'+String(i+1).padStart(6,'0'),at,pk(['提示','一般','重要','紧急']),pk(['OLT','BRAS','PON','交换机']),cityMap[code],
            at+'-'+cities.find(c=>c[0]===code)[1],at+'影响设备运行',ri(0,5000),pk(['未确认','已确认','处理中','已恢复','已恢复']),pk(handlers),rd('2025-11-16','2025-12-02')]);
    }

    // 20. 操作日志 (600)
    const logPairs={
        '全景视图':['查询','导出'],
        '质量画像':['查询','导出','CEI查询'],
        '质差定界':['分析','定位','导出'],
        '远程操作':['PING测试','网关重启','ONT光功率查询'],
        '工单管理':['新增','编辑','工单派发','工单处理'],
        '用户管理':['查询','新增','编辑','密码重置','账号锁定'],
        '系统管理':['查询','编辑','配置变更'],
        '登录认证':['登录','登出']
    };
    const logContent={
        '全景视图':'查看全省网络质量全景指标',
        '质量画像':'查询用户质量画像与CEI评分',
        '质差定界':'执行质差定界定位分析',
        '远程操作':'下发远程诊断操作',
        '工单管理':'处理质差闭环工单',
        '用户管理':'维护系统用户与权限',
        '系统管理':'调整系统配置或查看系统状态',
        '登录认证':'完成账号登录认证'
    };
    const mods=Object.keys(logPairs);
    for(let i=0;i<600;i++){
        const mod=pk(mods), act=pk(logPairs[mod]);
        execute(`INSERT INTO operation_logs(username,ip_address,module,action,description,result,created_at)VALUES(?,?,?,?,?,?,?)`,
            [pk(['admin','cc_admin','jl_admin','sp_op1','ly_admin']),rip(),mod,act,logContent[mod]+'：'+act,sr()>0.05?'成功':'失败',rd('2025-11-16','2025-12-02')]);
    }

    // 21. 系统配置
    console.log('插入系统配置...');
    const cfgs=[['cei.weight.business','0.6','CEI评估','业务CEI权重'],['cei.weight.network','0.4','CEI评估','网络CEI权重'],
        ['cei.threshold.poor','80','CEI评估','质差用户CEI阈值'],['workorder.timeout.hours','24','工单管理','工单超时阈值(小时)'],
        ['workorder.dispatch.auto','true','工单管理','自动派单'],['alert.notify.channels','sms,email','告警管理','通知渠道'],
        ['ping.default.count','10','远程操作','PING默认次数'],['system.session.timeout','1800','系统安全','会话超时(秒)'],
        ['quality.model.version','V3.2','质差模型','模型版本'],['gis.map.center','125.3245,43.8868','GIS配置','地图中心']];
    cfgs.forEach(c=>execute(`INSERT INTO system_configs(config_key,config_value,category,description,is_editable)VALUES(?,?,?,?,1)`,c));

    // 22. 定时任务
    const tasks=[['CEI评分计算','0 */1 * * *','启用','每小时计算CEI'],['质差模型分析','0 */2 * * *','启用','每2小时质差分析'],
        ['设备状态采集','*/5 * * * *','启用','每5分钟采集'],['告警恢复检测','*/10 * * * *','启用','每10分钟检测'],
        ['日报自动生成','0 8 * * *','启用','每日8点生成'],['数据清理','0 3 * * *','启用','每日3点清理']];
    tasks.forEach(t=>execute(`INSERT INTO scheduled_tasks(task_name,cron_expression,status,description)VALUES(?,?,?,?)`,t));

    // 保存数据库到文件
    saveDb();

    console.log('\n=== 数据库初始化完成 ===');
    const counts = ['cities','districts','system_users','bras_devices','olt_devices','broadband_users',
        'pon_anomalies','cei_daily_summary','quality_model_results','user_quality_issues','biz_quality_issues',
        'ping_tests','ont_power_records','gateway_restarts','dpi_records','optical_tests','con_analysis',
        'work_orders','alerts','operation_logs','system_configs','scheduled_tasks'];
    counts.forEach(t=>{
        const r=queryOne('SELECT COUNT(*)as c FROM '+t);
        console.log('  '+t+': '+(r?r.c:0));
    });
    console.log('\n数据库文件: '+require('./database').DB_PATH);
}

run().catch(e=>{ console.error('Seed error:', e); process.exit(1); });
