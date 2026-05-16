/**
 * 家宽网络质量分析平台 - 增强模块
 * 补充：DPI-XDR数据底座、质差标签标准化、多维聚类、权限体系、工单闭环链路
 * 不重构现有代码，仅追加功能
 */

// ============================================================
// 1. DPI-XDR 完整数据底座 - 10种协议xDR明细字段定义
// ============================================================
var DpiXdrSchema = {
    // 公共字段（所有协议共有）
    common: [
        'record_id', 'capture_time', 'user_account', 'user_ip', 'city',
        'src_ip', 'src_port', 'dst_ip', 'dst_port', 'protocol',
        'app_name', 'app_category', 'up_bytes', 'down_bytes', 'up_packets', 'down_packets',
        'session_duration', 'tcp_rtt', 'tcp_retransmit_rate', 'tcp_window_size',
        'tcp_mss', 'tcp_connect_time', 'tcp_connect_success_rate',
        'olt_id', 'pon_port', 'ont_id', 'bras_id'
    ],
    // HTTP协议扩展字段
    http: [
        'request_url', 'request_method', 'response_code', 'content_type',
        'user_agent', 'referer', 'host', 'first_packet_delay',
        'http_transaction_delay', 'response_body_size', 'page_load_time',
        'redirect_count', 'server_ip', 'cdn_node'
    ],
    // HTTPS/TLS协议扩展字段
    https: [
        'sni_domain', 'tls_version', 'cipher_suite', 'cert_domain',
        'cert_issuer', 'cert_valid_from', 'cert_valid_to',
        'tls_handshake_delay', 'alpn_protocol', 'session_reuse'
    ],
    // DNS协议扩展字段
    dns: [
        'query_domain', 'query_type', 'response_code_dns', 'resolved_ip',
        'dns_server', 'dns_delay', 'ttl', 'is_hijacked',
        'recursion_desired', 'answer_count', 'authority_count'
    ],
    // RTMP/流媒体协议扩展字段
    rtmp: [
        'stream_url', 'video_codec', 'audio_codec', 'video_bitrate',
        'audio_bitrate', 'frame_rate', 'resolution', 'buffer_count',
        'stall_count', 'stall_duration', 'initial_buffer_time'
    ],
    // HLS协议扩展字段
    hls: [
        'm3u8_url', 'segment_duration', 'segment_count', 'bandwidth_adaptation',
        'current_bitrate', 'max_bitrate', 'stall_ratio', 'switch_count',
        'initial_load_time', 'avg_segment_download_time'
    ],
    // QUIC协议扩展字段
    quic: [
        'quic_version', 'connection_id', 'sni_domain', 'zero_rtt',
        'packet_loss_rate', 'smooth_rtt', 'min_rtt', 'congestion_window',
        'bytes_in_flight', 'stream_count'
    ],
    // 游戏协议扩展字段
    gaming: [
        'game_name', 'game_server_ip', 'game_server_port', 'game_latency',
        'jitter', 'packet_loss_game', 'fps_avg', 'frame_drop_count',
        'match_duration', 'region_server'
    ],
    // VoIP/视频通话扩展字段
    voip: [
        'call_type', 'caller_id', 'callee_id', 'codec',
        'mos_score', 'jitter_voip', 'packet_loss_voip', 'call_duration',
        'setup_time', 'owd_up', 'owd_down'
    ],
    // P2P/下载协议扩展字段
    p2p: [
        'torrent_hash', 'peer_count', 'seed_count', 'download_speed',
        'upload_speed', 'file_size', 'completion_rate', 'tracker_url'
    ],
    // IPTV协议扩展字段
    iptv: [
        'channel_name', 'channel_id', 'multicast_group', 'video_bitrate_iptv',
        'stall_count_iptv', 'stall_duration_iptv', 'mosaic_count',
        'channel_switch_time', 'epg_load_time', 'signal_quality'
    ]
};

// ============================================================
// 2. DPI-XDR 完整明细数据生成
// ============================================================
var DpiXdrData = {
    _records: null,

    generate: function() {
        if (this._records) return this._records;
        SeededRandom.reset(20251202 + 8888);
        var records = [];
        var protocols = ['HTTP', 'HTTPS', 'DNS', 'RTMP', 'HLS', 'QUIC', 'Gaming', 'VoIP', 'IPTV', 'P2P'];
        var apps = {
            'HTTP': ['百度搜索', '新浪新闻', '网易邮箱', '12306', '政务服务'],
            'HTTPS': ['抖音', 'B站', '微信', '淘宝', '京东', '腾讯视频', '爱奇艺'],
            'DNS': ['DNS查询', 'DNS解析'],
            'RTMP': ['斗鱼直播', '虎牙直播', '快手直播', '抖音直播'],
            'HLS': ['腾讯视频', '爱奇艺', '优酷', '芒果TV', 'B站'],
            'QUIC': ['YouTube', 'Google', 'Cloudflare'],
            'Gaming': ['王者荣耀', '和平精英', '原神', '英雄联盟', 'CS2'],
            'VoIP': ['微信通话', '钉钉会议', '腾讯会议', 'Zoom'],
            'IPTV': ['CCTV-1', 'CCTV-5', '吉林卫视', '长春新闻', '电影频道'],
            'P2P': ['迅雷下载', '百度网盘', '阿里云盘']
        };
        var cities = JilinData.cities;
        var cityPrefixes = { '长春': 'CC', '吉林': 'JL', '四平': 'SP', '辽源': 'LY', '通化': 'TH', '白山': 'BS', '松原': 'SY', '白城': 'BC', '延边': 'YB', '长白山': 'CBS' };

        for (var i = 0; i < 300; i++) {
            var proto = SeededRandom.pick(protocols);
            var city = SeededRandom.pick(cities);
            var prefix = cityPrefixes[city] || 'XX';
            var userIp = '10.' + SeededRandom.int(160, 175) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254);
            var dstIp = SeededRandom.int(1, 223) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254);

            var rec = {
                record_id: 'XDR-' + String(i + 1).padStart(6, '0'),
                capture_time: SeededRandom.date('2025-12-01', '2025-12-02'),
                user_account: 'JL' + (20250000 + SeededRandom.int(1, 520)),
                user_ip: userIp,
                city: city,
                src_ip: userIp,
                src_port: SeededRandom.int(1024, 65535),
                dst_ip: dstIp,
                dst_port: proto === 'HTTP' ? 80 : (proto === 'HTTPS' || proto === 'QUIC' ? 443 : (proto === 'DNS' ? 53 : SeededRandom.int(1024, 65535))),
                protocol: proto,
                app_name: SeededRandom.pick(apps[proto]),
                app_category: proto === 'Gaming' ? '游戏' : (proto === 'IPTV' || proto === 'HLS' || proto === 'RTMP' ? '视频' : (proto === 'VoIP' ? '通话' : '上网')),
                up_bytes: SeededRandom.int(1024, 5242880),
                down_bytes: SeededRandom.int(10240, 104857600),
                up_packets: SeededRandom.int(10, 50000),
                down_packets: SeededRandom.int(100, 500000),
                session_duration: SeededRandom.float(0.1, 3600, 1),
                tcp_rtt: SeededRandom.float(2, 80, 1),
                tcp_retransmit_rate: SeededRandom.float(0, 5, 2),
                tcp_window_size: SeededRandom.pick([65535, 131072, 262144, 524288]),
                tcp_mss: SeededRandom.pick([1380, 1440, 1460]),
                tcp_connect_time: SeededRandom.float(5, 120, 0),
                tcp_connect_success_rate: SeededRandom.float(95, 100, 1),
                olt_id: 'OLT-' + prefix + '-' + String(SeededRandom.int(1, 20)).padStart(4, '0'),
                pon_port: 'GPON 0/' + SeededRandom.int(0, 7) + '/' + SeededRandom.int(0, 15),
                ont_id: 'ONT-' + prefix + '-' + String(SeededRandom.int(1, 9999)).padStart(5, '0'),
                bras_id: 'BRAS-' + prefix + '-' + String(SeededRandom.int(1, 5)).padStart(2, '0')
            };

            // 协议扩展字段
            if (proto === 'HTTP') {
                rec.request_url = 'http://' + dstIp + '/api/v' + SeededRandom.int(1, 3) + '/' + SeededRandom.pick(['stream', 'data', 'page', 'resource', 'content']);
                rec.request_method = SeededRandom.pick(['GET', 'GET', 'GET', 'POST', 'PUT']);
                rec.response_code = SeededRandom.pick([200, 200, 200, 200, 301, 302, 404, 500, 502, 503]);
                rec.content_type = SeededRandom.pick(['text/html', 'application/json', 'image/jpeg', 'video/mp4', 'application/octet-stream']);
                rec.user_agent = SeededRandom.pick(['Mozilla/5.0 (Windows NT 10.0; Win64)', 'Dalvik/2.1.0 (Android 12)', 'AppleCoreMedia/1.0', 'okhttp/4.9.3']);
                rec.first_packet_delay = SeededRandom.float(20, 500, 0);
                rec.http_transaction_delay = SeededRandom.float(50, 2000, 0);
                rec.response_body_size = SeededRandom.int(512, 10485760);
                rec.page_load_time = SeededRandom.float(200, 5000, 0);
            } else if (proto === 'HTTPS') {
                rec.sni_domain = SeededRandom.pick(['www.bilibili.com', 'v.qq.com', 'www.douyin.com', 'www.taobao.com', 'www.jd.com', 'live.kuaishou.com']);
                rec.tls_version = SeededRandom.pick(['TLS 1.2', 'TLS 1.3', 'TLS 1.3']);
                rec.cipher_suite = SeededRandom.pick(['AES_128_GCM_SHA256', 'AES_256_GCM_SHA384', 'CHACHA20_POLY1305_SHA256']);
                rec.cert_domain = '*.' + rec.sni_domain.replace('www.', '');
                rec.tls_handshake_delay = SeededRandom.float(15, 200, 0);
                rec.first_packet_delay = SeededRandom.float(30, 400, 0);
            } else if (proto === 'DNS') {
                rec.query_domain = SeededRandom.pick(['www.baidu.com', 'v.qq.com', 'api.bilibili.com', 'live.douyin.com', 'www.taobao.com', 'dns.alidns.com', 'www.163.com']);
                rec.query_type = SeededRandom.pick(['A', 'A', 'A', 'AAAA', 'CNAME', 'MX', 'TXT']);
                rec.response_code_dns = SeededRandom.pick(['NOERROR', 'NOERROR', 'NOERROR', 'NOERROR', 'NXDOMAIN', 'SERVFAIL']);
                rec.resolved_ip = SeededRandom.int(1, 223) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254);
                rec.dns_server = SeededRandom.pick(['114.114.114.114', '8.8.8.8', '223.5.5.5', '119.29.29.29', '10.168.1.1']);
                rec.dns_delay = SeededRandom.float(2, 120, 0);
                rec.ttl = SeededRandom.int(60, 86400);
                rec.is_hijacked = SeededRandom.next() > 0.95 ? '疑似' : '否';
            } else if (proto === 'Gaming') {
                rec.game_name = rec.app_name;
                rec.game_server_ip = dstIp;
                rec.game_latency = SeededRandom.float(5, 120, 0);
                rec.jitter = SeededRandom.float(1, 30, 1);
                rec.packet_loss_game = SeededRandom.float(0, 5, 2);
                rec.fps_avg = SeededRandom.int(25, 60);
                rec.frame_drop_count = SeededRandom.int(0, 50);
                rec.match_duration = SeededRandom.int(60, 1800);
            } else if (proto === 'IPTV') {
                rec.channel_name = rec.app_name;
                rec.channel_id = SeededRandom.int(1, 500);
                rec.multicast_group = '239.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254) + '.' + SeededRandom.int(1, 254);
                rec.video_bitrate_iptv = SeededRandom.pick([4000, 6000, 8000, 12000, 15000]);
                rec.stall_count_iptv = SeededRandom.int(0, 10);
                rec.stall_duration_iptv = SeededRandom.float(0, 15, 1);
                rec.mosaic_count = SeededRandom.int(0, 5);
                rec.channel_switch_time = SeededRandom.float(0.5, 5, 1);
            } else if (proto === 'VoIP') {
                rec.call_type = SeededRandom.pick(['音频通话', '视频通话', '视频会议']);
                rec.codec = SeededRandom.pick(['OPUS', 'G.711', 'G.729', 'AAC']);
                rec.mos_score = SeededRandom.float(2.5, 4.8, 1);
                rec.jitter_voip = SeededRandom.float(1, 50, 1);
                rec.packet_loss_voip = SeededRandom.float(0, 8, 2);
                rec.call_duration = SeededRandom.int(10, 3600);
                rec.setup_time = SeededRandom.float(0.5, 5, 1);
            } else if (proto === 'HLS') {
                rec.m3u8_url = 'https://' + dstIp + '/live/index.m3u8';
                rec.segment_duration = SeededRandom.pick([2, 4, 6, 10]);
                rec.current_bitrate = SeededRandom.pick([1500, 2500, 4000, 6000, 8000]);
                rec.stall_ratio = SeededRandom.float(0, 8, 2);
                rec.initial_load_time = SeededRandom.float(0.3, 5, 1);
                rec.avg_segment_download_time = SeededRandom.float(0.1, 2, 2);
            } else if (proto === 'RTMP') {
                rec.stream_url = 'rtmp://' + dstIp + '/live/stream_' + SeededRandom.int(1, 9999);
                rec.video_bitrate = SeededRandom.pick([2500, 4000, 6000, 8000]);
                rec.frame_rate = SeededRandom.pick([24, 30, 60]);
                rec.resolution = SeededRandom.pick(['720p', '1080p', '1440p', '4K']);
                rec.stall_count = SeededRandom.int(0, 15);
                rec.initial_buffer_time = SeededRandom.float(0.5, 8, 1);
            } else if (proto === 'QUIC') {
                rec.quic_version = SeededRandom.pick(['QUICv1', 'QUICv2', 'h3-29', 'h3']);
                rec.connection_id = '0x' + Math.floor(SeededRandom.next() * 0xFFFFFFFF).toString(16);
                rec.sni_domain = SeededRandom.pick(['www.google.com', 'www.youtube.com', 'quic.rocks', 'cloudflare.com']);
                rec.zero_rtt = SeededRandom.pick(['是', '否', '否']);
                rec.smooth_rtt = SeededRandom.float(5, 80, 1);
            } else if (proto === 'P2P') {
                rec.peer_count = SeededRandom.int(5, 200);
                rec.seed_count = SeededRandom.int(1, 50);
                rec.download_speed = SeededRandom.float(0.5, 50, 1);
                rec.file_size = SeededRandom.int(1048576, 10737418240);
                rec.completion_rate = SeededRandom.float(0, 100, 1);
            }

            // 质差判定标记（基于配置中心阈值）
            rec.is_quality_issue = false;
            rec.quality_tags = [];
            var configs = DataStore.load('configs', []);
            var getThreshold = function(key, def) {
                for (var ci = 0; ci < configs.length; ci++) {
                    if (configs[ci].key === key) return parseFloat(configs[ci].value);
                }
                return def;
            };

            if (proto === 'HTTP' && rec.first_packet_delay > getThreshold('dpi_http_first_packet_threshold', 200)) {
                rec.is_quality_issue = true;
                rec.quality_tags.push('HTTP首包超标');
            }
            if (proto === 'DNS' && rec.dns_delay > getThreshold('dpi_dns_resolve_threshold', 50)) {
                rec.is_quality_issue = true;
                rec.quality_tags.push('DNS解析超标');
            }
            if (rec.tcp_retransmit_rate > getThreshold('dpi_tcp_retransmit_threshold', 2)) {
                rec.is_quality_issue = true;
                rec.quality_tags.push('TCP重传超标');
            }
            if ((proto === 'HLS' || proto === 'RTMP' || proto === 'IPTV') && (rec.stall_ratio > 3 || rec.stall_count > 5 || rec.stall_count_iptv > 3)) {
                rec.is_quality_issue = true;
                rec.quality_tags.push('视频卡顿超标');
            }
            if (proto === 'Gaming' && rec.game_latency > 50) {
                rec.is_quality_issue = true;
                rec.quality_tags.push('游戏高时延');
            }

            records.push(rec);
        }

        this._records = records;
        SeededRandom.reset(20251202);
        return records;
    },

    // 按条件查询
    query: function(filters) {
        var data = this.generate();
        if (!filters) return data;
        return data.filter(function(r) {
            if (filters.city && r.city !== filters.city) return false;
            if (filters.protocol && r.protocol !== filters.protocol) return false;
            if (filters.app_name && r.app_name !== filters.app_name) return false;
            if (filters.user_account && r.user_account.indexOf(filters.user_account) < 0) return false;
            if (filters.is_quality_issue && !r.is_quality_issue) return false;
            if (filters.quality_tag && r.quality_tags.indexOf(filters.quality_tag) < 0) return false;
            return true;
        });
    },

    // 统计
    stats: function() {
        var data = this.generate();
        var protoMap = {}, appMap = {}, qualityCount = 0, tagMap = {};
        data.forEach(function(r) {
            protoMap[r.protocol] = (protoMap[r.protocol] || 0) + 1;
            appMap[r.app_name] = (appMap[r.app_name] || 0) + 1;
            if (r.is_quality_issue) {
                qualityCount++;
                r.quality_tags.forEach(function(t) { tagMap[t] = (tagMap[t] || 0) + 1; });
            }
        });
        return { total: data.length, protoMap: protoMap, appMap: appMap, qualityCount: qualityCount, tagMap: tagMap };
    }
};


// ============================================================
// 3. 质差标签标准化体系
// ============================================================
var QualityTagSystem = {
    // 标准化质差标签定义
    tagDefinitions: [
        { id: 'WEAK_LIGHT', name: '弱光', category: '光路', configKey: 'tag_weak_light_threshold', unit: 'dBm', direction: 'lt', description: '接收光功率低于阈值' },
        { id: 'HIGH_BER', name: '高误码', category: '光路', configKey: 'tag_high_ber_threshold', unit: '', direction: 'gt', description: '误码率高于阈值' },
        { id: 'FREQUENT_DISCONNECT', name: '频繁掉线', category: '通断', configKey: 'tag_frequent_disconnect_count', unit: '次/天', direction: 'gt', description: '每日掉线次数超标' },
        { id: 'DYING_GASP', name: '掉电', category: '通断', configKey: 'tag_dying_gasp_window', unit: '分钟', direction: 'gt', description: '检测到dying-gasp信号' },
        { id: 'VIDEO_STALL', name: '视频卡顿', category: '业务', configKey: 'dpi_video_stall_threshold', unit: '%', direction: 'gt', description: '视频卡顿率超标' },
        { id: 'GAME_HIGH_LATENCY', name: '游戏高时延', category: '业务', configKey: 'quality_latency_threshold', unit: 'ms', direction: 'gt', description: '游戏时延超标' },
        { id: 'DNS_SLOW', name: 'DNS解析慢', category: '业务', configKey: 'dpi_dns_resolve_threshold', unit: 'ms', direction: 'gt', description: 'DNS解析时延超标' },
        { id: 'HTTP_SLOW', name: 'HTTP响应慢', category: '业务', configKey: 'dpi_http_first_packet_threshold', unit: 'ms', direction: 'gt', description: 'HTTP首包时延超标' },
        { id: 'TCP_RETRANSMIT', name: 'TCP重传高', category: '网络', configKey: 'dpi_tcp_retransmit_threshold', unit: '%', direction: 'gt', description: 'TCP重传率超标' },
        { id: 'HIGH_LATENCY', name: '高时延', category: '网络', configKey: 'quality_latency_threshold', unit: 'ms', direction: 'gt', description: '网络时延超标' },
        { id: 'HIGH_PACKET_LOSS', name: '高丢包', category: '网络', configKey: 'quality_loss_threshold', unit: '%', direction: 'gt', description: '丢包率超标' },
        { id: 'WIFI_INTERFERENCE', name: 'WiFi干扰', category: '家庭', configKey: null, unit: '', direction: null, description: 'WiFi信道干扰严重' },
        { id: 'GW_CPU_HIGH', name: '网关CPU高', category: '家庭', configKey: null, unit: '%', direction: 'gt', description: '网关CPU使用率过高' },
        { id: 'GW_RESTART', name: '网关频繁重启', category: '家庭', configKey: null, unit: '次/天', direction: 'gt', description: '网关频繁重启' },
        { id: 'BANDWIDTH_LOW', name: '带宽不足', category: '网络', configKey: null, unit: 'Mbps', direction: 'lt', description: '实际速率远低于签约带宽' }
    ],

    // 获取阈值（从配置中心读取）
    getThreshold: function(configKey, defaultValue) {
        if (!configKey) return defaultValue;
        var configs = DataStore.load('configs', []);
        for (var i = 0; i < configs.length; i++) {
            if (configs[i].key === configKey) return parseFloat(configs[i].value);
        }
        return defaultValue;
    },

    // 对用户进行质差标签判定
    evaluateUser: function(userData) {
        var tags = [];
        var self = this;

        // 弱光判定
        if (userData.rxPower !== undefined) {
            var weakLightThreshold = this.getThreshold('tag_weak_light_threshold', -25);
            if (userData.rxPower < weakLightThreshold) {
                tags.push({ tagId: 'WEAK_LIGHT', name: '弱光', value: userData.rxPower, threshold: weakLightThreshold, confidence: 98 });
            }
        }

        // 高时延判定
        if (userData.latency !== undefined) {
            var latencyThreshold = this.getThreshold('quality_latency_threshold', 50);
            if (userData.latency > latencyThreshold) {
                tags.push({ tagId: 'HIGH_LATENCY', name: '高时延', value: userData.latency, threshold: latencyThreshold, confidence: 95 });
            }
        }

        // 高丢包判定
        if (userData.packetLoss !== undefined) {
            var lossThreshold = this.getThreshold('quality_loss_threshold', 5);
            if (userData.packetLoss > lossThreshold) {
                tags.push({ tagId: 'HIGH_PACKET_LOSS', name: '高丢包', value: userData.packetLoss, threshold: lossThreshold, confidence: 96 });
            }
        }

        // 频繁掉线判定
        if (userData.disconnectCount !== undefined) {
            var disconnectThreshold = this.getThreshold('tag_frequent_disconnect_count', 3);
            if (userData.disconnectCount > disconnectThreshold) {
                tags.push({ tagId: 'FREQUENT_DISCONNECT', name: '频繁掉线', value: userData.disconnectCount, threshold: disconnectThreshold, confidence: 92 });
            }
        }

        return tags;
    },

    // 生成用户质差标签数据（批量）
    generateUserTags: function() {
        var stored = DataStore.load('userQualityTags', null);
        if (stored && stored.length > 0) return stored;

        SeededRandom.reset(20251202 + 7777);
        var tags = [];
        var cities = JilinData.cities;
        var tagDefs = this.tagDefinitions;

        for (var i = 0; i < 500; i++) {
            var city = SeededRandom.pick(cities);
            var userTags = [];
            var tagCount = SeededRandom.int(1, 3);
            for (var t = 0; t < tagCount; t++) {
                var def = SeededRandom.pick(tagDefs);
                if (userTags.indexOf(def.id) < 0) userTags.push(def.id);
            }

            tags.push({
                userAccount: 'JL' + (20250000 + SeededRandom.int(1, 520)),
                city: city,
                area: SeededRandom.pick(['南关区', '朝阳区', '宽城区', '昌邑区', '船营区', '铁西区', '龙山区', '东昌区', '宁江区', '洮北区', '延吉市']),
                tags: userTags,
                tagNames: userTags.map(function(tid) {
                    for (var j = 0; j < tagDefs.length; j++) { if (tagDefs[j].id === tid) return tagDefs[j].name; }
                    return tid;
                }),
                ceiScore: SeededRandom.float(42, 82, 1),
                firstDetectTime: SeededRandom.date('2025-11-20', '2025-12-01'),
                lastDetectTime: SeededRandom.date('2025-12-01', '2025-12-02'),
                duration: SeededRandom.int(1, 168) + '小时',
                status: SeededRandom.pick(['质差中', '质差中', '已恢复', '待确认']),
                confidence: SeededRandom.float(72, 99, 1),
                oltId: 'OLT-' + city.substr(0, 1) + '-' + String(SeededRandom.int(1, 20)).padStart(4, '0'),
                ponPort: 'GPON 0/' + SeededRandom.int(0, 7) + '/' + SeededRandom.int(0, 15)
            });
        }

        DataStore.save('userQualityTags', tags);
        SeededRandom.reset(20251202);
        return tags;
    }
};

// ============================================================
// 4. 多维质差聚类引擎
// ============================================================
var QualityClusterEngine = {
    // 按维度聚类
    clusterBy: function(dimension) {
        var userTags = QualityTagSystem.generateUserTags();
        var clusters = {};

        if (dimension === 'olt') {
            userTags.forEach(function(u) {
                var key = u.oltId;
                if (!clusters[key]) clusters[key] = { id: key, city: u.city, dimension: 'OLT', users: [], tagMap: {}, count: 0 };
                clusters[key].users.push(u.userAccount);
                clusters[key].count++;
                u.tagNames.forEach(function(t) { clusters[key].tagMap[t] = (clusters[key].tagMap[t] || 0) + 1; });
            });
        } else if (dimension === 'pon') {
            userTags.forEach(function(u) {
                var key = u.oltId + '/' + u.ponPort;
                if (!clusters[key]) clusters[key] = { id: key, city: u.city, dimension: 'PON口', users: [], tagMap: {}, count: 0 };
                clusters[key].users.push(u.userAccount);
                clusters[key].count++;
                u.tagNames.forEach(function(t) { clusters[key].tagMap[t] = (clusters[key].tagMap[t] || 0) + 1; });
            });
        } else if (dimension === 'city') {
            userTags.forEach(function(u) {
                var key = u.city;
                if (!clusters[key]) clusters[key] = { id: key, city: u.city, dimension: '地市', users: [], tagMap: {}, count: 0 };
                clusters[key].users.push(u.userAccount);
                clusters[key].count++;
                u.tagNames.forEach(function(t) { clusters[key].tagMap[t] = (clusters[key].tagMap[t] || 0) + 1; });
            });
        } else if (dimension === 'area') {
            userTags.forEach(function(u) {
                var key = u.city + '-' + u.area;
                if (!clusters[key]) clusters[key] = { id: key, city: u.city, area: u.area, dimension: '网格', users: [], tagMap: {}, count: 0 };
                clusters[key].users.push(u.userAccount);
                clusters[key].count++;
                u.tagNames.forEach(function(t) { clusters[key].tagMap[t] = (clusters[key].tagMap[t] || 0) + 1; });
            });
        } else if (dimension === 'tag') {
            userTags.forEach(function(u) {
                u.tagNames.forEach(function(t) {
                    if (!clusters[t]) clusters[t] = { id: t, dimension: '质差标签', users: [], cityMap: {}, count: 0 };
                    clusters[t].users.push(u.userAccount);
                    clusters[t].count++;
                    clusters[t].cityMap[u.city] = (clusters[t].cityMap[u.city] || 0) + 1;
                });
            });
        } else if (dimension === 'time') {
            // 按时间段聚类（早/中/晚/夜）
            userTags.forEach(function(u) {
                var hour = parseInt(u.lastDetectTime.split(' ')[1].split(':')[0]);
                var period = hour < 6 ? '凌晨(0-6)' : (hour < 12 ? '上午(6-12)' : (hour < 18 ? '下午(12-18)' : '晚间(18-24)'));
                if (!clusters[period]) clusters[period] = { id: period, dimension: '时间段', users: [], tagMap: {}, count: 0 };
                clusters[period].users.push(u.userAccount);
                clusters[period].count++;
                u.tagNames.forEach(function(t) { clusters[period].tagMap[t] = (clusters[period].tagMap[t] || 0) + 1; });
            });
        }

        // 转为数组并排序
        var result = [];
        for (var k in clusters) {
            var c = clusters[k];
            // 找出主要质差类型
            var maxTag = '', maxCount = 0;
            for (var t in c.tagMap) { if (c.tagMap[t] > maxCount) { maxCount = c.tagMap[t]; maxTag = t; } }
            c.primaryTag = maxTag;
            c.primaryTagCount = maxCount;
            // 聚类告警判定：同一设备/区域下超过5个质差用户
            c.isAlert = c.count >= 5;
            c.severity = c.count >= 20 ? '紧急' : (c.count >= 10 ? '高' : (c.count >= 5 ? '中' : '低'));
            result.push(c);
        }
        result.sort(function(a, b) { return b.count - a.count; });
        return result;
    },

    // 获取聚类告警（超过阈值的聚类）
    getAlerts: function(threshold) {
        threshold = threshold || 5;
        var dimensions = ['olt', 'pon', 'area', 'time'];
        var alerts = [];
        var self = this;
        dimensions.forEach(function(dim) {
            var clusters = self.clusterBy(dim);
            clusters.forEach(function(c) {
                if (c.count >= threshold) {
                    alerts.push(c);
                }
            });
        });
        alerts.sort(function(a, b) { return b.count - a.count; });
        return alerts;
    }
};


// ============================================================
// 5. 权限体系增强
// ============================================================
var PermissionSystem = {
    // 角色定义
    roles: {
        'system_admin': {
            name: '系统管理员',
            level: 100,
            menus: '*',  // 全部菜单
            dataScope: '*',  // 全省数据
            operations: ['create', 'read', 'update', 'delete', 'export', 'config', 'user_manage', 'dispatch']
        },
        'city_admin': {
            name: '地市管理员',
            level: 80,
            menus: ['broadband-quality', 'gis-view', 'kpi-view', 'con-analysis', 'pon-power', 'optical-test',
                    'cei-query', 'cei-cluster', 'quality-model', 'user-quality', 'quality-cluster', 'biz-quality', 'biz-cluster',
                    'ce-location', 'biz-cei-boundary', 'biz-cei-locate', 'conn-cei-boundary', 'conn-cei-locate', 'dpi-capture',
                    'ping-test', 'ont-power', 'gateway-restart',
                    'work-order', 'work-order-eval', 'log-management'],
            dataScope: 'city',  // 仅本地市数据
            operations: ['create', 'read', 'update', 'export', 'dispatch']
        },
        'operator': {
            name: '运维人员',
            level: 60,
            menus: ['broadband-quality', 'kpi-view', 'pon-power', 'optical-test',
                    'cei-query', 'user-quality', 'quality-cluster',
                    'ce-location', 'dpi-capture',
                    'ping-test', 'ont-power', 'gateway-restart',
                    'work-order'],
            dataScope: 'city',
            operations: ['read', 'update', 'export']
        },
        'readonly': {
            name: '只读用户',
            level: 20,
            menus: ['broadband-quality', 'gis-view', 'kpi-view', 'cei-query', 'cei-cluster', 'work-order-eval'],
            dataScope: 'city',
            operations: ['read']
        }
    },

    // 当前用户信息
    _currentUser: null,

    // 获取当前用户
    getCurrentUser: function() {
        if (this._currentUser) return this._currentUser;
        var stored = DataStore.load('currentSession', null);
        if (stored) { this._currentUser = stored; return stored; }
        // 默认admin
        return { username: 'admin', realName: '系统管理员', role: 'system_admin', city: '全省' };
    },

    // 登录
    login: function(username, password) {
        var users = DataStore.load('users', []);
        var user = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === username && users[i].status === '启用') {
                user = users[i]; break;
            }
        }
        if (!user) return { success: false, message: '用户名或密码错误' };

        var roleKey = 'system_admin';
        if (user.role === '系统管理员') roleKey = 'system_admin';
        else if (user.role === '地市管理员') roleKey = 'city_admin';
        else if (user.role === '运维人员') roleKey = 'operator';
        else roleKey = 'readonly';

        var session = {
            username: user.username,
            realName: user.realName,
            role: roleKey,
            roleName: user.role,
            city: user.city,
            department: user.department,
            loginTime: new Date().toLocaleString('zh-CN'),
            token: 'tk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8)
        };
        this._currentUser = session;
        DataStore.save('currentSession', session);
        DataStore.addLog('登录', '系统管理', user.realName + ' 登录系统');
        return { success: true, user: session };
    },

    // 登出
    logout: function() {
        DataStore.addLog('登出', '系统管理', (this._currentUser ? this._currentUser.realName : 'admin') + ' 退出系统');
        this._currentUser = null;
        localStorage.removeItem('hk_currentSession');
    },

    // 检查菜单权限
    hasMenuAccess: function(pageId) {
        var user = this.getCurrentUser();
        var role = this.roles[user.role];
        if (!role) return true;
        if (role.menus === '*') return true;
        return role.menus.indexOf(pageId) >= 0;
    },

    // 检查操作权限
    hasOperation: function(operation) {
        var user = this.getCurrentUser();
        var role = this.roles[user.role];
        if (!role) return true;
        return role.operations.indexOf(operation) >= 0;
    },

    // 获取数据范围（用于筛选数据）
    getDataScope: function() {
        var user = this.getCurrentUser();
        var role = this.roles[user.role];
        if (!role || role.dataScope === '*') return null; // null表示全部
        return user.city; // 返回地市名称
    },

    // 检查是否有数据访问权限
    canAccessCity: function(cityName) {
        var scope = this.getDataScope();
        if (!scope) return true; // 全省权限
        if (scope === '全省') return true;
        return scope === cityName;
    }
};

// ============================================================
// 6. 工单闭环链路增强 - 质差驱动工单 + CEI改善对比
// ============================================================
var WorkOrderLoop = {
    // 质差标签自动生成工单规则
    autoDispatchRules: [
        { tagId: 'WEAK_LIGHT', priority: '高', type: '系统告警', deadline: 8, skill: '光路', description: '用户接收光功率低于阈值，疑似弱光故障' },
        { tagId: 'HIGH_BER', priority: '高', type: '系统告警', deadline: 8, skill: '光路', description: '用户误码率超标，光路质量劣化' },
        { tagId: 'FREQUENT_DISCONNECT', priority: '紧急', type: '系统告警', deadline: 4, skill: '设备', description: '用户频繁掉线，影响业务连续性' },
        { tagId: 'VIDEO_STALL', priority: '中', type: 'AI预测', deadline: 24, skill: '故障排查', description: '用户视频卡顿率超标，业务体验下降' },
        { tagId: 'GAME_HIGH_LATENCY', priority: '中', type: 'AI预测', deadline: 24, skill: '传输', description: '用户游戏时延超标，影响游戏体验' },
        { tagId: 'GW_CPU_HIGH', priority: '高', type: '主动发现', deadline: 8, skill: '设备', description: '网关CPU持续高负载，可能导致业务中断' },
        { tagId: 'DNS_SLOW', priority: '中', type: '主动发现', deadline: 24, skill: '故障排查', description: 'DNS解析时延超标，影响网页访问速度' }
    ],

    // 从质差标签自动生成工单
    autoCreateFromTag: function(userTag) {
        var rule = null;
        for (var i = 0; i < this.autoDispatchRules.length; i++) {
            if (userTag.tags.indexOf(this.autoDispatchRules[i].tagId) >= 0) {
                rule = this.autoDispatchRules[i]; break;
            }
        }
        if (!rule) return null;

        // 检查配置中心是否开启自动派单
        var configs = DataStore.load('configs', []);
        var autoEnabled = true;
        for (var i = 0; i < configs.length; i++) {
            if (configs[i].key === 'boundary_auto_dispatch_enabled') {
                autoEnabled = configs[i].value === '开启';
                break;
            }
        }

        var woId = 'WO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 90000 + 10000));
        var engineers = JilinData.findEngineers(userTag.city, rule.skill);
        var assignee = engineers.length > 0 && autoEnabled ? engineers[0].name : '';

        var order = {
            id: woId,
            title: rule.description.substr(0, 20) + ' - ' + userTag.userAccount,
            type: rule.type,
            city: userTag.city,
            userAccount: userTag.userAccount,
            status: assignee ? '已派单' : '待派单',
            priority: rule.priority,
            createTime: new Date().toLocaleString('zh-CN'),
            assignee: assignee || '-',
            resolveTime: '-',
            satisfaction: '-',
            deadline: rule.deadline + '小时',
            description: rule.description + '。质差标签：' + userTag.tagNames.join('、') + '，CEI评分：' + userTag.ceiScore,
            sourceType: '质差标签自动',
            sourceTagId: rule.tagId,
            sourceTagName: userTag.tagNames[0],
            ceiBeforeRepair: userTag.ceiScore,
            ceiAfterRepair: null
        };
        return order;
    },

    // 批量从质差标签生成工单
    batchAutoCreate: function(count) {
        count = count || 10;
        var userTags = QualityTagSystem.generateUserTags();
        var qualityTags = userTags.filter(function(u) { return u.status === '质差中'; });
        var created = [];

        for (var i = 0; i < Math.min(count, qualityTags.length); i++) {
            var order = this.autoCreateFromTag(qualityTags[i]);
            if (order) created.push(order);
        }
        return created;
    },

    // 工单后评估 - CEI改善对比
    generateCeiComparison: function() {
        SeededRandom.reset(20251202 + 6666);
        var comparisons = [];
        var orders = DataStore.load('workOrders', null) || JilinData.workOrderList;
        var resolvedOrders = orders.filter(function(o) { return o.status === '已解决' || o.status === '已关闭'; });

        for (var i = 0; i < Math.min(50, resolvedOrders.length); i++) {
            var wo = resolvedOrders[i];
            var ceiBefore = SeededRandom.float(48, 78, 1);
            var ceiAfter = SeededRandom.float(ceiBefore + 5, Math.min(ceiBefore + 25, 98), 1);
            var improvement = parseFloat((ceiAfter - ceiBefore).toFixed(1));

            comparisons.push({
                orderId: wo.id,
                userAccount: wo.userAccount,
                city: wo.city,
                orderType: wo.type,
                priority: wo.priority,
                ceiBefore: ceiBefore,
                ceiAfter: ceiAfter,
                improvement: improvement,
                improvementRate: parseFloat((improvement / ceiBefore * 100).toFixed(1)),
                resolveTime: wo.resolveTime,
                assignee: wo.assignee,
                isImproved: ceiAfter > ceiBefore,
                qualityTag: SeededRandom.pick(['弱光', '高时延', '频繁掉线', '视频卡顿', 'WiFi干扰', '网关CPU高']),
                repairAction: SeededRandom.pick(['更换尾纤', '清洁接头', '重启网关', '升级固件', '调整WiFi信道', '更换光模块', '优化路由'])
            });
        }

        SeededRandom.reset(20251202);
        return comparisons;
    },

    // 工单闭环统计
    getLoopStats: function() {
        var comparisons = this.generateCeiComparison();
        var totalImproved = comparisons.filter(function(c) { return c.isImproved; }).length;
        var avgImprovement = comparisons.reduce(function(s, c) { return s + c.improvement; }, 0) / comparisons.length;
        var avgImprovementRate = comparisons.reduce(function(s, c) { return s + c.improvementRate; }, 0) / comparisons.length;

        // 按质差标签统计
        var tagStats = {};
        comparisons.forEach(function(c) {
            if (!tagStats[c.qualityTag]) tagStats[c.qualityTag] = { count: 0, totalImprovement: 0, improved: 0 };
            tagStats[c.qualityTag].count++;
            tagStats[c.qualityTag].totalImprovement += c.improvement;
            if (c.isImproved) tagStats[c.qualityTag].improved++;
        });

        // 按地市统计
        var cityStats = {};
        comparisons.forEach(function(c) {
            if (!cityStats[c.city]) cityStats[c.city] = { count: 0, improved: 0, totalImprovement: 0 };
            cityStats[c.city].count++;
            if (c.isImproved) cityStats[c.city].improved++;
            cityStats[c.city].totalImprovement += c.improvement;
        });

        return {
            total: comparisons.length,
            improved: totalImproved,
            improvementRate: parseFloat((totalImproved / comparisons.length * 100).toFixed(1)),
            avgImprovement: parseFloat(avgImprovement.toFixed(1)),
            avgImprovementRate: parseFloat(avgImprovementRate.toFixed(1)),
            tagStats: tagStats,
            cityStats: cityStats,
            comparisons: comparisons
        };
    }
};
