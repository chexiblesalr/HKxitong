/**
 * 家宽网络质量分析平台 - 增强页面渲染模块
 * 增强DPI-XDR明细查询、质差标签管理、聚类告警等页面
 */

var EnhancePages = {

    // ========== DPI-XDR 完整明细查询页面 ==========
    _xdrPage: 1, _xdrCity: '', _xdrProto: '', _xdrApp: '', _xdrTag: '', _xdrAccount: '', _xdrIssueOnly: false,

    renderDpiXdrDetail: function(container, page) {
        this._xdrPage = page || 1;
        var allData = DpiXdrData.generate();
        var data = allData;
        if (this._xdrCity) data = data.filter(function(d) { return d.city === EnhancePages._xdrCity; });
        if (this._xdrProto) data = data.filter(function(d) { return d.protocol === EnhancePages._xdrProto; });
        if (this._xdrApp) data = data.filter(function(d) { return d.app_name === EnhancePages._xdrApp; });
        if (this._xdrTag) data = data.filter(function(d) { return d.quality_tags.indexOf(EnhancePages._xdrTag) >= 0; });
        if (this._xdrAccount) {
            var kw = this._xdrAccount.toLowerCase();
            data = data.filter(function(d) { return d.user_account.toLowerCase().indexOf(kw) >= 0; });
        }
        if (this._xdrIssueOnly) data = data.filter(function(d) { return d.is_quality_issue; });

        var stats = DpiXdrData.stats();

        // 协议选项
        var protoOpts = '<option value="">全部协议</option>';
        Object.keys(stats.protoMap).forEach(function(k) {
            protoOpts += '<option value="' + k + '"' + (k === EnhancePages._xdrProto ? ' selected' : '') + '>' + k + ' (' + stats.protoMap[k] + ')</option>';
        });

        // 应用选项
        var appOpts = '<option value="">全部应用</option>';
        Object.keys(stats.appMap).slice(0, 30).forEach(function(k) {
            appOpts += '<option value="' + k + '"' + (k === EnhancePages._xdrApp ? ' selected' : '') + '>' + k + '</option>';
        });

        // 质差标签选项
        var tagOpts = '<option value="">全部标签</option>';
        Object.keys(stats.tagMap).forEach(function(k) {
            tagOpts += '<option value="' + k + '"' + (k === EnhancePages._xdrTag ? ' selected' : '') + '>' + k + ' (' + stats.tagMap[k] + ')</option>';
        });

        // 分页
        var p = Pages.paginate(data, this._xdrPage, 12);
        var rows = p.data.map(function(r) {
            var tagsHtml = r.quality_tags.map(function(t) {
                return '<span style="display:inline-block;padding:1px 6px;background:#fef0f0;color:#c0392b;border-radius:8px;font-size:10px;margin-right:3px;">' + t + '</span>';
            }).join('');
            var statusCls = r.is_quality_issue ? 'status-error' : 'status-normal';
            var statusText = r.is_quality_issue ? '质差' : '正常';
            return '<tr>' +
                '<td>' + r.record_id + '</td>' +
                '<td style="font-size:11px;">' + r.capture_time + '</td>' +
                '<td>' + r.user_account + '</td>' +
                '<td>' + r.city + '</td>' +
                '<td><span style="padding:1px 6px;background:#f0f5ff;color:#2b7de9;border-radius:8px;font-size:10px;">' + r.protocol + '</span></td>' +
                '<td>' + r.app_name + '</td>' +
                '<td style="font-size:11px;">' + r.src_ip + ':' + r.src_port + '</td>' +
                '<td style="font-size:11px;">' + r.dst_ip + ':' + r.dst_port + '</td>' +
                '<td>' + (r.down_bytes / 1024 / 1024).toFixed(2) + ' MB</td>' +
                '<td>' + r.tcp_rtt + ' ms</td>' +
                '<td><span class="' + statusCls + '">' + statusText + '</span></td>' +
                '<td>' + (tagsHtml || '<span style="color:#ccc;">-</span>') + '</td>' +
                '<td><a style="color:#2b7de9;cursor:pointer;" onclick="EnhancePages.showXdrDetail(\'' + r.record_id + '\')">查看xDR</a></td>' +
                '</tr>';
        }).join('') || '<tr><td colspan="13" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

        container.innerHTML =
            '<div class="page-content">' +
            '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + stats.total + '</div><div class="wo-stat-label">xDR总数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">' + Object.keys(stats.protoMap).length + '</div><div class="wo-stat-label">协议数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + Object.keys(stats.appMap).length + '</div><div class="wo-stat-label">应用数</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + stats.qualityCount + '</div><div class="wo-stat-label">质差会话</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + (stats.qualityCount / stats.total * 100).toFixed(1) + '%</div><div class="wo-stat-label">质差占比</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">' + Object.keys(stats.tagMap).length + '</div><div class="wo-stat-label">质差标签数</div></div>' +
            '</div>' +
            '<div class="remote-panel"><div class="remote-panel-title">DPI-XDR明细查询（基于配置中心阈值实时判定质差）</div>' +
            '<div class="remote-form">' +
                Pages.cityFilterHtml('xdrCityFilter', 'EnhancePages._xdrCity=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById("page-dpi-capture"),1)', this._xdrCity) +
                '<div class="form-group"><label class="form-label">用户账号/IP</label><input class="form-input" id="xdrAccountInput" value="' + (this._xdrAccount || '') + '" placeholder="账号/IP"></div>' +
                '<div class="form-group"><label class="form-label">协议</label><select class="form-select" onchange="EnhancePages._xdrProto=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">' + protoOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">应用</label><select class="form-select" onchange="EnhancePages._xdrApp=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">' + appOpts + '</select></div>' +
                '<div class="form-group"><label class="form-label">质差标签</label><select class="form-select" onchange="EnhancePages._xdrTag=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">' + tagOpts + '</select></div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                    '<label style="font-size:12px;color:#666;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" ' + (this._xdrIssueOnly ? 'checked' : '') + ' onchange="EnhancePages._xdrIssueOnly=this.checked;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">仅显示质差</label>' +
                    '<button class="btn btn-primary" onclick="EnhancePages._xdrAccount=document.getElementById(\'xdrAccountInput\').value.trim();EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">查询</button>' +
                    '<button class="btn" onclick="EnhancePages.resetXdrFilter()">重置</button>' +
                    '<button class="btn" onclick="Pages.startDpiCapture()">开始抓包</button>' +
                    '<button class="btn" onclick="EnhancePages.exportXdr()">导出xDR</button>' +
                '</div></div></div>' +
            '<div style="margin-bottom:8px;padding:8px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;">' +
                '<strong>xDR明细字段说明：</strong>HTTP（首包时延、URL、状态码）、HTTPS（SNI、TLS版本、握手时延）、DNS（查询域名、解析IP、是否劫持）、QUIC（版本、连接ID、平滑RTT）、视频（卡顿率、码率、初始缓冲）、游戏（时延、抖动、丢包）、IPTV（频道、组播组、卡顿次数）等10类协议完整字段。质差判定阈值从配置中心实时读取。' +
            '</div>' +
            '<div class="data-table-wrapper">' +
            '<table class="data-table"><thead><tr>' +
                '<th>记录ID</th><th>时间</th><th>用户</th><th>地市</th><th>协议</th><th>应用</th><th>源IP:端口</th><th>目的IP:端口</th><th>下行</th><th>RTT</th><th>状态</th><th>质差标签</th><th>操作</th>' +
            '</tr></thead><tbody>' + rows + '</tbody></table>' +
            Pages.paginationHtml(p, 'EnhancePages.renderDpiXdrDetail.bind(EnhancePages,document.getElementById("page-dpi-capture"))') + '</div></div>';
    },

    resetXdrFilter: function() {
        this._xdrCity = ''; this._xdrProto = ''; this._xdrApp = ''; this._xdrTag = ''; this._xdrAccount = ''; this._xdrIssueOnly = false;
        this.renderDpiXdrDetail(document.getElementById('page-dpi-capture'), 1);
    },

    showXdrDetail: function(recordId) {
        var data = DpiXdrData.generate();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].record_id === recordId) { r = data[i]; break; } }
        if (!r) return;

        // 通用字段
        var commonFields = '<div style="font-weight:600;font-size:12px;margin-bottom:8px;color:#2b7de9;border-bottom:1px solid #e0e4e8;padding-bottom:4px;">通用xDR字段</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;line-height:2;">' +
            '<div><strong>记录ID：</strong>' + r.record_id + '</div>' +
            '<div><strong>抓取时间：</strong>' + r.capture_time + '</div>' +
            '<div><strong>用户账号：</strong>' + r.user_account + '</div>' +
            '<div><strong>地市：</strong>' + r.city + '</div>' +
            '<div><strong>源IP:端口：</strong>' + r.src_ip + ':' + r.src_port + '</div>' +
            '<div><strong>目的IP:端口：</strong>' + r.dst_ip + ':' + r.dst_port + '</div>' +
            '<div><strong>协议：</strong>' + r.protocol + '</div>' +
            '<div><strong>应用：</strong>' + r.app_name + ' (' + r.app_category + ')</div>' +
            '<div><strong>上行流量：</strong>' + (r.up_bytes / 1024 / 1024).toFixed(2) + ' MB</div>' +
            '<div><strong>下行流量：</strong>' + (r.down_bytes / 1024 / 1024).toFixed(2) + ' MB</div>' +
            '<div><strong>会话时长：</strong>' + r.session_duration + ' s</div>' +
            '<div><strong>TCP RTT：</strong>' + r.tcp_rtt + ' ms</div>' +
            '<div><strong>TCP重传率：</strong>' + r.tcp_retransmit_rate + '%</div>' +
            '<div><strong>TCP窗口：</strong>' + r.tcp_window_size + '</div>' +
            '<div><strong>建连时延：</strong>' + r.tcp_connect_time + ' ms</div>' +
            '<div><strong>OLT/PON：</strong>' + r.olt_id + ' / ' + r.pon_port + '</div>' +
            '<div><strong>ONT：</strong>' + r.ont_id + '</div>' +
            '<div><strong>BRAS：</strong>' + r.bras_id + '</div>' +
            '</div>';

        // 协议特定字段
        var protoFields = '<div style="font-weight:600;font-size:12px;margin-top:12px;margin-bottom:8px;color:#27ae60;border-bottom:1px solid #e0e4e8;padding-bottom:4px;">' + r.protocol + ' 协议扩展字段</div>';
        protoFields += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;line-height:2;">';

        if (r.protocol === 'HTTP') {
            protoFields += '<div style="grid-column:1/-1;"><strong>请求URL：</strong><code style="word-break:break-all;font-size:11px;">' + r.request_url + '</code></div>';
            protoFields += '<div><strong>请求方法：</strong>' + r.request_method + '</div>';
            protoFields += '<div><strong>响应状态码：</strong><span style="color:' + (r.response_code >= 400 ? '#e74c3c' : '#27ae60') + ';font-weight:600;">' + r.response_code + '</span></div>';
            protoFields += '<div><strong>Content-Type：</strong>' + r.content_type + '</div>';
            protoFields += '<div><strong>响应体大小：</strong>' + (r.response_body_size / 1024).toFixed(2) + ' KB</div>';
            protoFields += '<div><strong>首包响应时延：</strong><span style="color:' + (r.first_packet_delay > 200 ? '#e74c3c' : '#27ae60') + ';">' + r.first_packet_delay + 'ms</span></div>';
            protoFields += '<div><strong>HTTP事务时延：</strong>' + r.http_transaction_delay + 'ms</div>';
            protoFields += '<div><strong>页面加载时间：</strong>' + r.page_load_time + 'ms</div>';
            protoFields += '<div style="grid-column:1/-1;"><strong>User-Agent：</strong><code style="font-size:11px;">' + r.user_agent + '</code></div>';
        } else if (r.protocol === 'HTTPS') {
            protoFields += '<div><strong>SNI域名：</strong>' + r.sni_domain + '</div>';
            protoFields += '<div><strong>TLS版本：</strong>' + r.tls_version + '</div>';
            protoFields += '<div><strong>加密套件：</strong>' + r.cipher_suite + '</div>';
            protoFields += '<div><strong>证书域名：</strong>' + r.cert_domain + '</div>';
            protoFields += '<div><strong>TLS握手时延：</strong>' + r.tls_handshake_delay + 'ms</div>';
            protoFields += '<div><strong>首包时延：</strong>' + r.first_packet_delay + 'ms</div>';
        } else if (r.protocol === 'DNS') {
            protoFields += '<div><strong>查询域名：</strong>' + r.query_domain + '</div>';
            protoFields += '<div><strong>查询类型：</strong>' + r.query_type + '</div>';
            protoFields += '<div><strong>响应码：</strong><span style="color:' + (r.response_code_dns !== 'NOERROR' ? '#e74c3c' : '#27ae60') + ';">' + r.response_code_dns + '</span></div>';
            protoFields += '<div><strong>解析IP：</strong>' + r.resolved_ip + '</div>';
            protoFields += '<div><strong>DNS服务器：</strong>' + r.dns_server + '</div>';
            protoFields += '<div><strong>DNS时延：</strong><span style="color:' + (r.dns_delay > 50 ? '#e74c3c' : '#27ae60') + ';">' + r.dns_delay + 'ms</span></div>';
            protoFields += '<div><strong>TTL：</strong>' + r.ttl + 's</div>';
            protoFields += '<div><strong>是否劫持：</strong><span style="color:' + (r.is_hijacked === '是' ? '#e74c3c' : (r.is_hijacked === '疑似' ? '#f39c12' : '#27ae60')) + ';">' + r.is_hijacked + '</span></div>';
        } else if (r.protocol === 'Gaming') {
            protoFields += '<div><strong>游戏名称：</strong>' + r.game_name + '</div>';
            protoFields += '<div><strong>游戏服务器：</strong>' + r.game_server_ip + '</div>';
            protoFields += '<div><strong>游戏时延：</strong><span style="color:' + (r.game_latency > 50 ? '#e74c3c' : '#27ae60') + ';">' + r.game_latency + 'ms</span></div>';
            protoFields += '<div><strong>抖动：</strong>' + r.jitter + 'ms</div>';
            protoFields += '<div><strong>丢包率：</strong>' + r.packet_loss_game + '%</div>';
            protoFields += '<div><strong>平均FPS：</strong>' + r.fps_avg + '</div>';
            protoFields += '<div><strong>掉帧次数：</strong>' + r.frame_drop_count + '</div>';
            protoFields += '<div><strong>对局时长：</strong>' + r.match_duration + 's</div>';
        } else if (r.protocol === 'IPTV') {
            protoFields += '<div><strong>频道名称：</strong>' + r.channel_name + '</div>';
            protoFields += '<div><strong>频道ID：</strong>' + r.channel_id + '</div>';
            protoFields += '<div><strong>组播组：</strong>' + r.multicast_group + '</div>';
            protoFields += '<div><strong>视频码率：</strong>' + r.video_bitrate_iptv + ' kbps</div>';
            protoFields += '<div><strong>卡顿次数：</strong><span style="color:' + (r.stall_count_iptv > 3 ? '#e74c3c' : '#27ae60') + ';">' + r.stall_count_iptv + '</span></div>';
            protoFields += '<div><strong>卡顿总时长：</strong>' + r.stall_duration_iptv + 's</div>';
            protoFields += '<div><strong>马赛克次数：</strong>' + r.mosaic_count + '</div>';
            protoFields += '<div><strong>换台时延：</strong>' + r.channel_switch_time + 's</div>';
        } else if (r.protocol === 'VoIP') {
            protoFields += '<div><strong>通话类型：</strong>' + r.call_type + '</div>';
            protoFields += '<div><strong>编解码：</strong>' + r.codec + '</div>';
            protoFields += '<div><strong>MOS评分：</strong><span style="color:' + (r.mos_score < 3.5 ? '#e74c3c' : (r.mos_score < 4 ? '#f39c12' : '#27ae60')) + ';font-weight:600;">' + r.mos_score + '</span></div>';
            protoFields += '<div><strong>抖动：</strong>' + r.jitter_voip + 'ms</div>';
            protoFields += '<div><strong>丢包率：</strong>' + r.packet_loss_voip + '%</div>';
            protoFields += '<div><strong>通话时长：</strong>' + r.call_duration + 's</div>';
            protoFields += '<div><strong>建立时延：</strong>' + r.setup_time + 's</div>';
        } else if (r.protocol === 'HLS') {
            protoFields += '<div style="grid-column:1/-1;"><strong>m3u8地址：</strong><code style="font-size:11px;">' + r.m3u8_url + '</code></div>';
            protoFields += '<div><strong>分片时长：</strong>' + r.segment_duration + 's</div>';
            protoFields += '<div><strong>当前码率：</strong>' + r.current_bitrate + ' kbps</div>';
            protoFields += '<div><strong>卡顿率：</strong><span style="color:' + (r.stall_ratio > 3 ? '#e74c3c' : '#27ae60') + ';">' + r.stall_ratio + '%</span></div>';
            protoFields += '<div><strong>首屏时延：</strong>' + r.initial_load_time + 's</div>';
            protoFields += '<div><strong>分片下载平均时延：</strong>' + r.avg_segment_download_time + 's</div>';
        } else if (r.protocol === 'RTMP') {
            protoFields += '<div style="grid-column:1/-1;"><strong>流媒体地址：</strong><code style="font-size:11px;">' + r.stream_url + '</code></div>';
            protoFields += '<div><strong>视频码率：</strong>' + r.video_bitrate + ' kbps</div>';
            protoFields += '<div><strong>帧率：</strong>' + r.frame_rate + ' fps</div>';
            protoFields += '<div><strong>分辨率：</strong>' + r.resolution + '</div>';
            protoFields += '<div><strong>卡顿次数：</strong>' + r.stall_count + '</div>';
            protoFields += '<div><strong>初始缓冲：</strong>' + r.initial_buffer_time + 's</div>';
        } else if (r.protocol === 'QUIC') {
            protoFields += '<div><strong>QUIC版本：</strong>' + r.quic_version + '</div>';
            protoFields += '<div><strong>连接ID：</strong>' + r.connection_id + '</div>';
            protoFields += '<div><strong>SNI域名：</strong>' + r.sni_domain + '</div>';
            protoFields += '<div><strong>0-RTT：</strong>' + r.zero_rtt + '</div>';
            protoFields += '<div><strong>平滑RTT：</strong>' + r.smooth_rtt + 'ms</div>';
        } else if (r.protocol === 'P2P') {
            protoFields += '<div><strong>对等节点：</strong>' + r.peer_count + '</div>';
            protoFields += '<div><strong>种子数：</strong>' + r.seed_count + '</div>';
            protoFields += '<div><strong>下载速度：</strong>' + r.download_speed + ' MB/s</div>';
            protoFields += '<div><strong>文件大小：</strong>' + (r.file_size / 1024 / 1024 / 1024).toFixed(2) + ' GB</div>';
            protoFields += '<div><strong>完成度：</strong>' + r.completion_rate + '%</div>';
        }
        protoFields += '</div>';

        // 质差标签
        var tagsHtml = '';
        if (r.quality_tags.length > 0) {
            tagsHtml = '<div style="margin-top:12px;padding:10px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:4px;">' +
                '<div style="font-weight:600;font-size:12px;color:#c0392b;margin-bottom:6px;">质差标签（基于配置中心阈值判定）</div>' +
                r.quality_tags.map(function(t) {
                    return '<span style="display:inline-block;padding:3px 10px;background:#fff;color:#c0392b;border:1px solid #f5c6c6;border-radius:12px;font-size:11px;margin:2px;">' + t + '</span>';
                }).join('') + '</div>';
        }

        // 操作面板
        var actions = '<div style="margin-top:12px;display:flex;gap:8px;">' +
            '<button class="btn" onclick="Modal.toast(\'PCAP数据包已下载\',\'success\')">下载PCAP</button>' +
            '<button class="btn" onclick="Modal.toast(\'已添加到关注列表\',\'success\')">关注此用户</button>' +
            (r.is_quality_issue ? '<button class="btn btn-primary" onclick="Modal.close();EnhancePages.createOrderFromXdr(\'' + r.record_id + '\')">基于xDR派单</button>' : '') +
            '</div>';

        Modal.show('xDR完整明细 - ' + r.record_id, commonFields + protoFields + tagsHtml + actions,
            '<button class="btn" onclick="Modal.close()">关闭</button>', '780px');
    },

    createOrderFromXdr: function(recordId) {
        var data = DpiXdrData.generate();
        var r = null;
        for (var i = 0; i < data.length; i++) { if (data[i].record_id === recordId) { r = data[i]; break; } }
        if (!r) return;

        var woId = 'WO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 90000 + 10000));
        var engineers = JilinData.findEngineers(r.city, '故障排查');
        var assignee = engineers.length > 0 ? engineers[0].name : '';

        var order = {
            id: woId,
            title: 'DPI-XDR质差告警 - ' + r.user_account,
            type: '系统告警',
            city: r.city,
            userAccount: r.user_account,
            status: assignee ? '已派单' : '待派单',
            priority: '高',
            createTime: new Date().toLocaleString('zh-CN'),
            assignee: assignee || '-',
            resolveTime: '-',
            satisfaction: '-',
            deadline: '8小时',
            description: '基于DPI-XDR分析发现质差。协议：' + r.protocol + '，应用：' + r.app_name + '，质差标签：' + r.quality_tags.join('、') + '，xDR记录：' + recordId,
            sourceType: 'DPI-XDR',
            sourceRecordId: recordId
        };
        var orders = DataStore.load('workOrders', null) || JilinData.workOrderList;
        orders.unshift(order);
        DataStore.save('workOrders', orders);
        DataStore.addLog('工单创建', 'DPI-XDR', '基于xDR记录 ' + recordId + ' 创建工单 ' + woId);
        Modal.toast('工单 ' + woId + ' 已创建', 'success');
    },

    exportXdr: function() {
        var data = DpiXdrData.generate();
        var csv = 'xDR记录ID,时间,用户,地市,源IP,源端口,目的IP,目的端口,协议,应用,上行(MB),下行(MB),会话时长(s),RTT(ms),TCP重传率(%),OLT,PON,质差标签\n';
        data.forEach(function(r) {
            csv += [r.record_id, r.capture_time, r.user_account, r.city, r.src_ip, r.src_port, r.dst_ip, r.dst_port, r.protocol, r.app_name, (r.up_bytes / 1024 / 1024).toFixed(2), (r.down_bytes / 1024 / 1024).toFixed(2), r.session_duration, r.tcp_rtt, r.tcp_retransmit_rate, r.olt_id, r.pon_port, '"' + r.quality_tags.join(';') + '"'].join(',') + '\n';
        });
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'DPI-XDR明细_' + new Date().toISOString().slice(0, 10) + '.csv';
        link.click();
        Modal.toast('已导出 (' + data.length + ' 条xDR)', 'success');
        DataStore.addLog('数据导出', 'DPI-XDR', '导出xDR明细 ' + data.length + ' 条');
    }
};


// ============ 质差标签管理页面 ============
EnhancePages._tagPage = 1;
EnhancePages._tagCity = '';
EnhancePages._tagFilter = '';
EnhancePages._tagStatus = '';

EnhancePages.renderQualityTags = function(container, page) {
    this._tagPage = page || 1;
    var allData = QualityTagSystem.generateUserTags();
    var data = allData;
    if (this._tagCity) data = data.filter(function(d) { return d.city === EnhancePages._tagCity; });
    if (this._tagFilter) data = data.filter(function(d) { return d.tagNames.indexOf(EnhancePages._tagFilter) >= 0; });
    if (this._tagStatus) data = data.filter(function(d) { return d.status === EnhancePages._tagStatus; });

    // 标签统计
    var tagStats = {};
    var statusStats = { '质差中': 0, '已恢复': 0, '待确认': 0 };
    allData.forEach(function(u) {
        u.tagNames.forEach(function(t) { tagStats[t] = (tagStats[t] || 0) + 1; });
        statusStats[u.status] = (statusStats[u.status] || 0) + 1;
    });

    // 标签筛选选项
    var tagOpts = '<option value="">全部标签</option>';
    Object.keys(tagStats).forEach(function(k) {
        tagOpts += '<option value="' + k + '"' + (k === EnhancePages._tagFilter ? ' selected' : '') + '>' + k + ' (' + tagStats[k] + ')</option>';
    });

    var p = Pages.paginate(data, this._tagPage, 12);
    var rows = p.data.map(function(r) {
        var tagsHtml = r.tagNames.map(function(t) {
            return '<span style="display:inline-block;padding:1px 6px;background:#fef0f0;color:#c0392b;border-radius:8px;font-size:10px;margin-right:3px;">' + t + '</span>';
        }).join('');
        var statusCls = r.status === '已恢复' ? 'status-normal' : (r.status === '质差中' ? 'status-error' : 'status-warning');
        return '<tr>' +
            '<td>' + r.userAccount + '</td>' +
            '<td>' + r.city + '</td>' +
            '<td>' + r.area + '</td>' +
            '<td>' + r.oltId + '</td>' +
            '<td>' + r.ponPort + '</td>' +
            '<td>' + tagsHtml + '</td>' +
            '<td><span style="color:' + (r.ceiScore < 60 ? '#e74c3c' : '#f39c12') + ';font-weight:600;">' + r.ceiScore + '</span></td>' +
            '<td>' + r.confidence + '%</td>' +
            '<td>' + r.duration + '</td>' +
            '<td><span class="' + statusCls + '">' + r.status + '</span></td>' +
            '<td style="font-size:11px;">' + r.lastDetectTime + '</td>' +
            '<td><a style="color:#2b7de9;cursor:pointer;margin-right:6px;" onclick="EnhancePages.showTagDetail(' + ((this._tagPage - 1) * 12 + p.data.indexOf(r)) + ')">详情</a><a style="color:#27ae60;cursor:pointer;" onclick="EnhancePages.autoCreateOrderFromTag(' + ((this._tagPage - 1) * 12 + p.data.indexOf(r)) + ')">派单</a></td>' +
            '</tr>';
    }.bind(this)).join('') || '<tr><td colspan="12" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

    var statusOpts = '<option value="">全部状态</option>';
    ['质差中', '已恢复', '待确认'].forEach(function(s) {
        statusOpts += '<option value="' + s + '"' + (s === EnhancePages._tagStatus ? ' selected' : '') + '>' + s + '</option>';
    });

    container.innerHTML =
        '<div class="page-content">' +
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + allData.length + '</div><div class="wo-stat-label">质差用户总数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + (statusStats['质差中'] || 0) + '</div><div class="wo-stat-label">当前质差中</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + (statusStats['已恢复'] || 0) + '</div><div class="wo-stat-label">已恢复</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">' + Object.keys(tagStats).length + '</div><div class="wo-stat-label">标签类型</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">' + QualityTagSystem.tagDefinitions.length + '</div><div class="wo-stat-label">标签定义数</div></div>' +
        '</div>' +
        '<div class="remote-panel"><div class="remote-panel-title">用户质差标签管理（标签判定基于配置中心阈值）</div>' +
        '<div class="remote-form">' +
            Pages.cityFilterHtml('tagCityFilter', 'EnhancePages._tagCity=this.value;EnhancePages.renderQualityTags(document.getElementById("page-quality-tags"),1)', this._tagCity) +
            '<div class="form-group"><label class="form-label">质差标签</label><select class="form-select" onchange="EnhancePages._tagFilter=this.value;EnhancePages.renderQualityTags(document.getElementById(\'page-quality-tags\'),1)">' + tagOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">状态</label><select class="form-select" onchange="EnhancePages._tagStatus=this.value;EnhancePages.renderQualityTags(document.getElementById(\'page-quality-tags\'),1)">' + statusOpts + '</select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                '<button class="btn btn-primary" onclick="EnhancePages.renderQualityTags(document.getElementById(\'page-quality-tags\'),1)">查询</button>' +
                '<button class="btn" onclick="EnhancePages._tagCity=\'\';EnhancePages._tagFilter=\'\';EnhancePages._tagStatus=\'\';EnhancePages.renderQualityTags(document.getElementById(\'page-quality-tags\'),1)">重置</button>' +
                '<button class="btn" onclick="EnhancePages.batchDispatchFromTags()">批量自动派单</button>' +
                '<button class="btn" onclick="EnhancePages.showTagDefinitions()">标签定义</button>' +
            '</div></div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
            '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">质差标签分布</span></div><div class="chart-container" id="tagDistChart"></div></div>' +
            '<div class="chart-card" style="min-height:280px;"><div class="chart-card-header"><span class="chart-title">标签分类汇总</span></div><div class="chart-container" id="tagCategoryChart"></div></div>' +
        '</div>' +
        '<div class="data-table-wrapper">' +
        '<table class="data-table"><thead><tr>' +
            '<th>用户账号</th><th>地市</th><th>区域</th><th>OLT</th><th>PON口</th><th>质差标签</th><th>CEI</th><th>置信度</th><th>持续</th><th>状态</th><th>最后检测</th><th>操作</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table>' +
        Pages.paginationHtml(p, 'EnhancePages.renderQualityTags.bind(EnhancePages,document.getElementById("page-quality-tags"))') + '</div></div>';

    // 渲染图表
    setTimeout(function() {
        var d1 = document.getElementById('tagDistChart');
        if (d1) {
            var c1 = echarts.init(d1);
            App.chartInstances['tagDistChart'] = c1;
            var pieData = [];
            for (var k in tagStats) pieData.push({ name: k, value: tagStats[k] });
            c1.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
                legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 10 } },
                series: [{ type: 'pie', radius: ['30%', '60%'], center: ['50%', '45%'], data: pieData, label: { fontSize: 10 } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('tagCategoryChart');
        if (d2) {
            var c2 = echarts.init(d2);
            App.chartInstances['tagCategoryChart'] = c2;
            var catStats = {};
            QualityTagSystem.tagDefinitions.forEach(function(def) {
                if (tagStats[def.name]) {
                    catStats[def.category] = (catStats[def.category] || 0) + tagStats[def.name];
                }
            });
            var cats = [], values = [];
            for (var k in catStats) { cats.push(k); values.push(catStats[k]); }
            c2.setOption({
                grid: { top: 20, right: 20, bottom: 30, left: 50 },
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: cats, axisLabel: { fontSize: 10 } },
                yAxis: { type: 'value', name: '用户数' },
                series: [{ type: 'bar', data: values.map(function(v, i) { return { value: v, itemStyle: { color: ['#5b8ff9', '#5ad8a6', '#f6bd16', '#e74c3c', '#9b59b6'][i % 5] } }; }), barWidth: '50%', label: { show: true, position: 'top', fontSize: 10 } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    }, 50);
};

EnhancePages.showTagDefinitions = function() {
    var rows = QualityTagSystem.tagDefinitions.map(function(def) {
        var threshold = QualityTagSystem.getThreshold(def.configKey, '-');
        return '<tr>' +
            '<td>' + def.id + '</td>' +
            '<td><strong>' + def.name + '</strong></td>' +
            '<td><span style="padding:1px 6px;background:#f0f5ff;color:#2b7de9;border-radius:8px;font-size:10px;">' + def.category + '</span></td>' +
            '<td>' + def.description + '</td>' +
            '<td>' + (def.configKey || '-') + '</td>' +
            '<td><span style="color:#e74c3c;font-weight:600;">' + threshold + (def.unit || '') + '</span></td>' +
            '<td>' + (def.direction === 'gt' ? '大于' : (def.direction === 'lt' ? '小于' : '-')) + '</td>' +
        '</tr>';
    }).join('');

    Modal.show('质差标签定义（共' + QualityTagSystem.tagDefinitions.length + '个）',
        '<div style="font-size:12px;color:#666;margin-bottom:8px;">所有标签判定阈值从【配置中心】实时读取，可在配置中心调整阈值。</div>' +
        '<div style="max-height:480px;overflow-y:auto;">' +
        '<table class="data-table" style="font-size:12px;"><thead><tr><th>标签ID</th><th>标签名称</th><th>分类</th><th>说明</th><th>配置键</th><th>当前阈值</th><th>判定方向</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '</div>',
        '<button class="btn" onclick="Modal.close()">关闭</button><button class="btn btn-primary" onclick="Modal.close();loadPageContent(\'config-center\')">前往配置中心</button>',
        '880px');
};

EnhancePages.showTagDetail = function(idx) {
    var data = QualityTagSystem.generateUserTags();
    if (this._tagCity) data = data.filter(function(d) { return d.city === EnhancePages._tagCity; });
    if (this._tagFilter) data = data.filter(function(d) { return d.tagNames.indexOf(EnhancePages._tagFilter) >= 0; });
    if (this._tagStatus) data = data.filter(function(d) { return d.status === EnhancePages._tagStatus; });
    var r = data[idx];
    if (!r) return;

    // 显示每个标签的详细判定信息
    var tagDetails = r.tagNames.map(function(tname) {
        var def = null;
        for (var i = 0; i < QualityTagSystem.tagDefinitions.length; i++) {
            if (QualityTagSystem.tagDefinitions[i].name === tname) { def = QualityTagSystem.tagDefinitions[i]; break; }
        }
        if (!def) return '';
        var threshold = QualityTagSystem.getThreshold(def.configKey, '-');
        return '<div style="padding:8px;background:#fef0f0;border:1px solid #f5c6c6;border-radius:4px;margin-bottom:6px;">' +
            '<div style="font-weight:600;color:#c0392b;margin-bottom:4px;">' + def.name + ' <span style="font-size:10px;font-weight:400;color:#666;padding-left:8px;">分类：' + def.category + '</span></div>' +
            '<div style="font-size:11px;color:#666;line-height:1.8;">' +
            '<div>判定规则：' + def.description + '</div>' +
            '<div>阈值：<strong>' + (def.direction === 'gt' ? '>' : '<') + ' ' + threshold + def.unit + '</strong> （来自配置项：' + (def.configKey || '内置规则') + '）</div>' +
            '</div></div>';
    }).join('');

    Modal.show('用户质差标签详情 - ' + r.userAccount,
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
        '<div><strong>用户账号：</strong>' + r.userAccount + '</div>' +
        '<div><strong>地市：</strong>' + r.city + '</div>' +
        '<div><strong>所属区域：</strong>' + r.area + '</div>' +
        '<div><strong>OLT设备：</strong>' + r.oltId + '</div>' +
        '<div><strong>PON端口：</strong>' + r.ponPort + '</div>' +
        '<div><strong>CEI评分：</strong><span style="color:' + (r.ceiScore < 60 ? '#e74c3c' : '#f39c12') + ';font-weight:600;">' + r.ceiScore + '</span></div>' +
        '<div><strong>首次检测：</strong>' + r.firstDetectTime + '</div>' +
        '<div><strong>最后检测：</strong>' + r.lastDetectTime + '</div>' +
        '<div><strong>持续时长：</strong>' + r.duration + '</div>' +
        '<div><strong>判定置信度：</strong>' + r.confidence + '%</div>' +
        '<div><strong>状态：</strong>' + r.status + '</div>' +
        '</div>' +
        '<div style="margin-top:12px;padding-top:8px;border-top:1px solid #e0e4e8;">' +
        '<div style="font-weight:600;font-size:12px;margin-bottom:8px;">质差标签明细（' + r.tagNames.length + '个）</div>' +
        tagDetails +
        '</div>',
        '<button class="btn" onclick="Modal.close()">关闭</button><button class="btn btn-primary" onclick="Modal.close();EnhancePages.autoCreateOrderFromTag(' + idx + ')">自动派单</button>',
        '680px');
};

EnhancePages.autoCreateOrderFromTag = function(idx) {
    var data = QualityTagSystem.generateUserTags();
    if (this._tagCity) data = data.filter(function(d) { return d.city === EnhancePages._tagCity; });
    if (this._tagFilter) data = data.filter(function(d) { return d.tagNames.indexOf(EnhancePages._tagFilter) >= 0; });
    if (this._tagStatus) data = data.filter(function(d) { return d.status === EnhancePages._tagStatus; });
    var r = data[idx];
    if (!r) return;

    var order = WorkOrderLoop.autoCreateFromTag(r);
    if (!order) {
        Modal.toast('该用户无匹配的自动派单规则', 'warning');
        return;
    }
    var orders = DataStore.load('workOrders', null) || JilinData.workOrderList;
    orders.unshift(order);
    DataStore.save('workOrders', orders);
    DataStore.addLog('自动派单', '质差标签', '基于质差标签 ' + r.tagNames.join('+') + ' 自动生成工单 ' + order.id);
    Modal.toast('工单 ' + order.id + ' 已自动创建' + (order.assignee !== '-' ? '，指派 ' + order.assignee : ''), 'success');
};

EnhancePages.batchDispatchFromTags = function() {
    Modal.show('批量自动派单',
        '<div style="font-size:13px;line-height:2;">' +
        '<div>系统将基于<strong>质差标签自动派单规则</strong>，从当前"质差中"的用户中批量生成工单。</div>' +
        '<div style="margin-top:8px;padding:8px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:12px;">' +
        '<strong>规则示例：</strong><br>' +
        '• 弱光 → 高优先级、8小时时限、派"光路"工程师<br>' +
        '• 频繁掉线 → 紧急优先级、4小时时限、派"设备"工程师<br>' +
        '• 视频卡顿 → 中优先级、24小时时限、派"故障排查"工程师' +
        '</div>' +
        '<div class="form-group" style="margin-top:8px;"><label class="form-label">批量数量</label><input class="form-input" id="batchTagCount" value="20" type="number" min="1" max="100"></div>' +
        '</div>',
        '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="EnhancePages.doBatchDispatch()">开始批量派单</button>',
        '500px');
};

EnhancePages.doBatchDispatch = function() {
    var count = parseInt(document.getElementById('batchTagCount').value) || 20;
    var orders = WorkOrderLoop.batchAutoCreate(count);
    var existing = DataStore.load('workOrders', null) || JilinData.workOrderList;
    orders.forEach(function(o) { existing.unshift(o); });
    DataStore.save('workOrders', existing);
    DataStore.addLog('批量派单', '质差标签', '基于质差标签批量生成 ' + orders.length + ' 张工单');
    Modal.close();
    Modal.toast('批量派单成功，共生成 ' + orders.length + ' 张工单', 'success');
};


// ============ 多维聚类告警页面 ============
EnhancePages._clusterDim = 'olt';

EnhancePages.renderClusterAlert = function(container) {
    var dim = this._clusterDim;
    var clusters = QualityClusterEngine.clusterBy(dim);
    var alerts = clusters.filter(function(c) { return c.isAlert; });

    var dimLabels = { 'olt': 'OLT维度', 'pon': 'PON口维度', 'city': '地市维度', 'area': '网格维度', 'tag': '标签维度', 'time': '时间段维度' };
    var dimOpts = '';
    Object.keys(dimLabels).forEach(function(k) {
        dimOpts += '<option value="' + k + '"' + (k === dim ? ' selected' : '') + '>' + dimLabels[k] + '</option>';
    });

    // 统计
    var totalUsers = 0;
    clusters.forEach(function(c) { totalUsers += c.count; });

    var rows = clusters.slice(0, 30).map(function(c, idx) {
        // 主要标签TOP3
        var topTags = '';
        if (c.tagMap) {
            var tagArr = [];
            for (var k in c.tagMap) tagArr.push({ name: k, count: c.tagMap[k] });
            tagArr.sort(function(a, b) { return b.count - a.count; });
            topTags = tagArr.slice(0, 3).map(function(t) {
                return '<span style="display:inline-block;padding:1px 6px;background:#fef0f0;color:#c0392b;border-radius:8px;font-size:10px;margin-right:3px;">' + t.name + '(' + t.count + ')</span>';
            }).join('');
        }
        var sevCls = c.severity === '紧急' ? 'status-error' : (c.severity === '高' ? 'status-error' : (c.severity === '中' ? 'status-warning' : 'status-normal'));
        return '<tr>' +
            '<td>CL-' + String(idx + 1).padStart(4, '0') + '</td>' +
            '<td>' + c.dimension + '</td>' +
            '<td><strong>' + c.id + '</strong></td>' +
            '<td>' + (c.city || '-') + '</td>' +
            '<td><strong style="color:#e74c3c;">' + c.count + '</strong>户</td>' +
            '<td>' + (topTags || '<span style="color:#ccc;">-</span>') + '</td>' +
            '<td>' + (c.primaryTag || '-') + '</td>' +
            '<td><span class="' + sevCls + '">' + c.severity + '</span></td>' +
            '<td>' + (c.isAlert ? '<span class="badge badge-danger" style="font-size:10px;">聚类告警</span>' : '<span style="color:#999;">正常</span>') + '</td>' +
            '<td><a style="color:#2b7de9;cursor:pointer;margin-right:6px;" onclick="EnhancePages.showClusterDetail(\'' + c.id + '\')">详情</a><a style="color:#27ae60;cursor:pointer;" onclick="EnhancePages.batchDispatchCluster(\'' + c.id + '\')">批量派单</a></td>' +
            '</tr>';
    }).join('') || '<tr><td colspan="10" style="text-align:center;color:#999;padding:20px;">暂无数据</td></tr>';

    container.innerHTML =
        '<div class="page-content">' +
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + clusters.length + '</div><div class="wo-stat-label">聚类组数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + alerts.length + '</div><div class="wo-stat-label">聚类告警数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">' + totalUsers + '</div><div class="wo-stat-label">关联用户总数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + alerts.filter(function(a) { return a.severity === '紧急' || a.severity === '高'; }).length + '</div><div class="wo-stat-label">紧急/高告警</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">' + (alerts.length > 0 ? alerts[0].count : 0) + '</div><div class="wo-stat-label">最大聚类用户数</div></div>' +
        '</div>' +
        '<div class="remote-panel"><div class="remote-panel-title">质差多维聚类告警（基于OLT/PON/网格/时间段/标签等维度自动聚类）</div>' +
        '<div class="remote-form">' +
            '<div class="form-group"><label class="form-label">聚类维度</label><select class="form-select" onchange="EnhancePages._clusterDim=this.value;EnhancePages.renderClusterAlert(document.getElementById(\'page-cluster-alert\'))">' + dimOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">告警阈值</label><input class="form-input" type="number" value="5" min="1"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;">' +
                '<button class="btn btn-primary" onclick="EnhancePages.renderClusterAlert(document.getElementById(\'page-cluster-alert\'))">重新分析</button>' +
                '<button class="btn" onclick="Modal.toast(\'聚类报告已导出\',\'success\')">导出报告</button>' +
            '</div></div></div>' +
        '<div style="margin-bottom:8px;padding:10px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;">' +
            '<strong>聚类告警说明：</strong>系统自动按OLT、PON端口、地市、网格区域、质差标签、时间段等维度聚合质差用户，发现共性故障。' +
            '当某一维度下质差用户超过阈值（默认5户）即判定为<strong>聚类告警</strong>，提示存在群体性问题。可基于聚类一键批量派单。' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">' + dimLabels[dim] + ' TOP10</span></div><div class="chart-container" id="clusterTopChart"></div></div>' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">质差标签全局分布</span></div><div class="chart-container" id="clusterTagChart"></div></div>' +
        '</div>' +
        '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">聚类详情列表（按聚类规模降序，仅显示TOP30）</div>' +
        '<table class="data-table"><thead><tr><th>聚类ID</th><th>维度</th><th>聚类对象</th><th>地市</th><th>用户数</th><th>主要标签TOP3</th><th>主要原因</th><th>严重度</th><th>告警状态</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';

    setTimeout(function() {
        var d1 = document.getElementById('clusterTopChart');
        if (d1) {
            var c1 = echarts.init(d1);
            App.chartInstances['clusterTopChart'] = c1;
            var top = clusters.slice(0, 10);
            c1.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 15, right: 60, bottom: 15, left: 110 },
                yAxis: { type: 'category', data: top.map(function(c) { return c.id.length > 18 ? c.id.substr(0, 16) + '..' : c.id; }).reverse(), axisLabel: { fontSize: 10 } },
                xAxis: { type: 'value' },
                series: [{ type: 'bar', data: top.map(function(c) { return { value: c.count, itemStyle: { color: c.severity === '紧急' || c.severity === '高' ? '#e74c3c' : (c.severity === '中' ? '#f39c12' : '#5b8ff9') } }; }).reverse(), barWidth: '50%', label: { show: true, position: 'right', fontSize: 9 } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('clusterTagChart');
        if (d2) {
            var c2 = echarts.init(d2);
            App.chartInstances['clusterTagChart'] = c2;
            // 全局标签分布
            var globalTagMap = {};
            clusters.forEach(function(c) {
                if (c.tagMap) {
                    for (var k in c.tagMap) globalTagMap[k] = (globalTagMap[k] || 0) + c.tagMap[k];
                } else if (c.cityMap) {
                    // tag维度 - 已经是标签
                    globalTagMap[c.id] = c.count;
                }
            });
            var pieData = [];
            for (var k in globalTagMap) pieData.push({ name: k, value: globalTagMap[k] });
            c2.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 10 } },
                series: [{ type: 'pie', radius: ['30%', '58%'], center: ['50%', '45%'], data: pieData, label: { fontSize: 10 } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    }, 50);
};

EnhancePages.showClusterDetail = function(clusterId) {
    var clusters = QualityClusterEngine.clusterBy(this._clusterDim);
    var c = null;
    for (var i = 0; i < clusters.length; i++) { if (clusters[i].id === clusterId) { c = clusters[i]; break; } }
    if (!c) return;

    var tagsHtml = '';
    if (c.tagMap) {
        var tagArr = [];
        for (var k in c.tagMap) tagArr.push({ name: k, count: c.tagMap[k] });
        tagArr.sort(function(a, b) { return b.count - a.count; });
        tagsHtml = tagArr.map(function(t) {
            return '<div style="display:flex;justify-content:space-between;padding:4px 8px;background:#fef0f0;border-left:3px solid #e74c3c;margin-bottom:4px;font-size:12px;"><span>' + t.name + '</span><span style="font-weight:600;color:#c0392b;">' + t.count + ' 户</span></div>';
        }).join('');
    }

    var usersHtml = c.users.slice(0, 30).map(function(u) {
        return '<span style="display:inline-block;padding:2px 8px;background:#f0f5ff;color:#2b7de9;border-radius:8px;font-size:11px;margin:2px;">' + u + '</span>';
    }).join('');

    Modal.show('聚类详情 - ' + c.id,
        '<div style="font-size:13px;line-height:2;">' +
        '<div><strong>聚类ID：</strong>' + c.id + '</div>' +
        '<div><strong>聚类维度：</strong>' + c.dimension + '</div>' +
        '<div><strong>地市：</strong>' + (c.city || '-') + '</div>' +
        '<div><strong>关联用户数：</strong><span style="color:#e74c3c;font-weight:600;">' + c.count + '</span> 户</div>' +
        '<div><strong>主要原因：</strong>' + (c.primaryTag || '-') + '</div>' +
        '<div><strong>严重程度：</strong>' + c.severity + '</div>' +
        '</div>' +
        (tagsHtml ? '<div style="margin-top:12px;padding-top:8px;border-top:1px solid #e0e4e8;"><div style="font-weight:600;font-size:12px;margin-bottom:8px;">质差标签分布</div>' + tagsHtml + '</div>' : '') +
        '<div style="margin-top:12px;padding-top:8px;border-top:1px solid #e0e4e8;"><div style="font-weight:600;font-size:12px;margin-bottom:8px;">关联用户（共 ' + c.users.length + ' 户，仅显示前30）</div>' +
        '<div style="max-height:140px;overflow-y:auto;">' + usersHtml + '</div></div>',
        '<button class="btn" onclick="Modal.close()">关闭</button><button class="btn btn-primary" onclick="Modal.close();EnhancePages.batchDispatchCluster(\'' + clusterId + '\')">批量派单</button>',
        '640px');
};

EnhancePages.batchDispatchCluster = function(clusterId) {
    var clusters = QualityClusterEngine.clusterBy(this._clusterDim);
    var c = null;
    for (var i = 0; i < clusters.length; i++) { if (clusters[i].id === clusterId) { c = clusters[i]; break; } }
    if (!c) return;

    Modal.confirm('批量派单确认', '将基于聚类 ' + c.id + ' 为 ' + c.count + ' 个用户批量生成工单（每用户1张）。确认继续？', function() {
        var orders = DataStore.load('workOrders', null) || JilinData.workOrderList;
        var userTags = QualityTagSystem.generateUserTags();
        var generated = 0;
        c.users.forEach(function(userAccount) {
            var userTag = null;
            for (var i = 0; i < userTags.length; i++) { if (userTags[i].userAccount === userAccount) { userTag = userTags[i]; break; } }
            if (userTag) {
                var order = WorkOrderLoop.autoCreateFromTag(userTag);
                if (order) { orders.unshift(order); generated++; }
            }
        });
        DataStore.save('workOrders', orders);
        DataStore.addLog('聚类批量派单', '聚类告警', '基于聚类 ' + clusterId + ' 批量生成 ' + generated + ' 张工单');
        Modal.toast('已基于聚类生成 ' + generated + ' 张工单', 'success');
    });
};


// ============ CEI改善对比/工单后评估增强页面 ============
EnhancePages.renderCeiComparison = function(container) {
    var stats = WorkOrderLoop.getLoopStats();
    var rows = stats.comparisons.slice(0, 30).map(function(c) {
        var arrow = c.isImproved ? '↑' : '↓';
        var arrowColor = c.isImproved ? '#27ae60' : '#e74c3c';
        return '<tr>' +
            '<td>' + c.orderId + '</td>' +
            '<td>' + c.userAccount + '</td>' +
            '<td>' + c.city + '</td>' +
            '<td>' + c.assignee + '</td>' +
            '<td><span style="padding:1px 6px;background:#fef0f0;color:#c0392b;border-radius:8px;font-size:10px;">' + c.qualityTag + '</span></td>' +
            '<td>' + c.repairAction + '</td>' +
            '<td><span style="color:#e74c3c;">' + c.ceiBefore + '</span></td>' +
            '<td><span style="color:#27ae60;font-weight:600;">' + c.ceiAfter + '</span></td>' +
            '<td><span style="color:' + arrowColor + ';font-weight:600;">' + arrow + ' ' + Math.abs(c.improvement) + ' 分 (' + Math.abs(c.improvementRate) + '%)</span></td>' +
            '<td>' + c.resolveTime + '</td>' +
            '</tr>';
    }).join('');

    // 各标签改善对比
    var tagRows = '';
    Object.keys(stats.tagStats).forEach(function(tag) {
        var ts = stats.tagStats[tag];
        var avgImp = (ts.totalImprovement / ts.count).toFixed(1);
        var rate = (ts.improved / ts.count * 100).toFixed(1);
        tagRows += '<tr><td>' + tag + '</td><td>' + ts.count + '</td><td>' + ts.improved + '</td><td><span style="color:#27ae60;">' + rate + '%</span></td><td><span style="color:#27ae60;font-weight:600;">+' + avgImp + ' 分</span></td></tr>';
    });

    container.innerHTML =
        '<div class="page-content">' +
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + stats.total + '</div><div class="wo-stat-label">已闭环工单</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + stats.improved + '</div><div class="wo-stat-label">CEI改善工单</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">' + stats.improvementRate + '%</div><div class="wo-stat-label">改善占比</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">+' + stats.avgImprovement + '</div><div class="wo-stat-label">平均CEI提升(分)</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">+' + stats.avgImprovementRate + '%</div><div class="wo-stat-label">平均提升率</div></div>' +
        '</div>' +
        '<div style="margin-bottom:8px;padding:10px 12px;background:#e8f8f0;border:1px solid #a3e4c1;border-radius:4px;font-size:12px;color:#1a7a4a;">' +
            '<strong>CEI改善前后对比说明：</strong>系统对每个已闭环工单记录处理前后的CEI评分，计算改善幅度，并按质差标签、地市、工程师等维度统计。这是衡量"工单驱动质量提升"的核心指标。' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">CEI改善前后对比（散点图）</span></div><div class="chart-container" id="ceiCompareScatter"></div></div>' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">各质差标签平均改善幅度</span></div><div class="chart-container" id="ceiTagImpChart"></div></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">质差标签改善统计</div>' +
            '<table class="data-table"><thead><tr><th>质差标签</th><th>工单数</th><th>改善数</th><th>改善率</th><th>平均提升</th></tr></thead><tbody>' + tagRows + '</tbody></table></div>' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">各地市CEI改善对比</span></div><div class="chart-container" id="ceiCityImpChart"></div></div>' +
        '</div>' +
        '<div class="data-table-wrapper" style="margin-top:8px;"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">CEI改善明细（按改善幅度排序，TOP30）</div>' +
        '<table class="data-table"><thead><tr><th>工单号</th><th>用户</th><th>地市</th><th>处理人</th><th>质差标签</th><th>处理动作</th><th>处理前CEI</th><th>处理后CEI</th><th>改善幅度</th><th>耗时</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';

    setTimeout(function() {
        var d1 = document.getElementById('ceiCompareScatter');
        if (d1) {
            var c1 = echarts.init(d1);
            App.chartInstances['ceiCompareScatter'] = c1;
            var scatterData = stats.comparisons.map(function(c) { return [c.ceiBefore, c.ceiAfter]; });
            c1.setOption({
                tooltip: { formatter: function(p) { return '处理前: ' + p.value[0] + '<br/>处理后: ' + p.value[1] + '<br/>提升: ' + (p.value[1] - p.value[0]).toFixed(1); } },
                grid: { top: 30, right: 30, bottom: 40, left: 50 },
                xAxis: { type: 'value', name: '处理前CEI', min: 40, max: 100, splitLine: { lineStyle: { color: '#f0f2f5' } } },
                yAxis: { type: 'value', name: '处理后CEI', min: 40, max: 100, splitLine: { lineStyle: { color: '#f0f2f5' } } },
                series: [
                    { type: 'scatter', data: scatterData, symbolSize: 8, itemStyle: { color: '#5b8ff9', opacity: 0.7 } },
                    { type: 'line', data: [[40, 40], [100, 100]], showSymbol: false, lineStyle: { type: 'dashed', color: '#999' } }
                ]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('ceiTagImpChart');
        if (d2) {
            var c2 = echarts.init(d2);
            App.chartInstances['ceiTagImpChart'] = c2;
            var tags = [], imps = [];
            for (var k in stats.tagStats) { tags.push(k); imps.push(parseFloat((stats.tagStats[k].totalImprovement / stats.tagStats[k].count).toFixed(1))); }
            c2.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 20, right: 30, bottom: 40, left: 80 },
                yAxis: { type: 'category', data: tags.reverse(), axisLabel: { fontSize: 10 } },
                xAxis: { type: 'value', name: '平均提升(分)' },
                series: [{ type: 'bar', data: imps.reverse(), barWidth: '50%', itemStyle: { color: '#27ae60' }, label: { show: true, position: 'right', fontSize: 10, formatter: '+{c}' } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
        var d3 = document.getElementById('ceiCityImpChart');
        if (d3) {
            var c3 = echarts.init(d3);
            App.chartInstances['ceiCityImpChart'] = c3;
            var cities = [], avgImps = [], rates = [];
            for (var k in stats.cityStats) {
                cities.push(k);
                avgImps.push(parseFloat((stats.cityStats[k].totalImprovement / stats.cityStats[k].count).toFixed(1)));
                rates.push(parseFloat((stats.cityStats[k].improved / stats.cityStats[k].count * 100).toFixed(1)));
            }
            c3.setOption({
                tooltip: { trigger: 'axis' },
                legend: { data: ['平均提升(分)', '改善率(%)'], top: 0, textStyle: { fontSize: 10 } },
                grid: { top: 35, right: 60, bottom: 30, left: 40 },
                xAxis: { type: 'category', data: cities, axisLabel: { fontSize: 9, rotate: 30 } },
                yAxis: [
                    { type: 'value', name: '提升(分)', splitLine: { lineStyle: { color: '#f0f2f5' } } },
                    { type: 'value', name: '改善率(%)', max: 100, splitLine: { show: false } }
                ],
                series: [
                    { name: '平均提升(分)', type: 'bar', data: avgImps, barWidth: '40%', itemStyle: { color: '#5b8ff9' } },
                    { name: '改善率(%)', type: 'line', yAxisIndex: 1, data: rates, smooth: true, itemStyle: { color: '#f39c12' } }
                ]
            });
            window.addEventListener('resize', function() { c3.resize(); });
        }
    }, 50);
};


// ============ 质差闭环全景页面（端到端流程可视化） ============
EnhancePages.renderQualityLoop = function(container) {
    var userTags = QualityTagSystem.generateUserTags();
    var orders = DataStore.load('workOrders', null) || JilinData.workOrderList;
    var stats = WorkOrderLoop.getLoopStats();
    var clusterAlerts = QualityClusterEngine.getAlerts(5);

    var step1Count = userTags.length;
    var step2Count = userTags.filter(function(u) { return u.tags.length > 0; }).length;
    var step3Count = clusterAlerts.length;
    var step4Count = orders.length;
    var step5Count = orders.filter(function(o) { return o.status === '处理中' || o.status === '已派单'; }).length;
    var step6Count = orders.filter(function(o) { return o.status === '已解决' || o.status === '已关闭'; }).length;
    var step7Count = stats.improved;

    container.innerHTML =
        '<div class="page-content">' +
        '<div style="margin-bottom:8px;padding:10px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;">' +
            '<strong>质差闭环全景：</strong>从"发现质差→打标签→聚类→定界定位→自动/手动派单→处理→CEI后评估"端到端串联，所有环节联动，形成质量提升闭环。' +
        '</div>' +
        // 流程图
        '<div class="loop-flow-container" style="background:#fff;border:1px solid #e0e4e8;border-radius:6px;padding:20px;margin-bottom:8px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">' +
            EnhancePages._loopStep('1', '发现质差', step1Count + ' 户', '#5b8ff9', 'user-quality') +
            EnhancePages._loopArrow() +
            EnhancePages._loopStep('2', '打标签', step2Count + ' 户', '#9b59b6', 'quality-tags') +
            EnhancePages._loopArrow() +
            EnhancePages._loopStep('3', '聚类告警', step3Count + ' 个', '#f39c12', 'cluster-alert') +
            EnhancePages._loopArrow() +
            EnhancePages._loopStep('4', '定界定位', '4 类', '#1abc9c', 'biz-cei-boundary') +
            EnhancePages._loopArrow() +
            EnhancePages._loopStep('5', '派单', step4Count + ' 张', '#e67e22', 'work-order') +
            EnhancePages._loopArrow() +
            EnhancePages._loopStep('6', '处理', step5Count + ' 处理中', '#16a085', 'work-order') +
            EnhancePages._loopArrow() +
            EnhancePages._loopStep('7', '后评估', step7Count + ' 改善', '#27ae60', 'cei-comparison') +
        '</div></div>' +
        // 关键指标
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">' + step1Count + '</div><div class="wo-stat-label">质差用户总数（发现）</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">' + step3Count + '</div><div class="wo-stat-label">聚类告警数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + step6Count + '</div><div class="wo-stat-label">已闭环工单</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e67e22;">+' + stats.avgImprovement + '</div><div class="wo-stat-label">平均CEI提升(分)</div></div>' +
        '</div>' +
        // 闭环效率
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">闭环漏斗分析</span></div><div class="chart-container" id="loopFunnelChart"></div></div>' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">闭环时长分布</span></div><div class="chart-container" id="loopDurationChart"></div></div>' +
        '</div>' +
        '<div class="data-table-wrapper" style="margin-top:8px;"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">质差驱动工单清单（最近10条）</div>' +
        '<table class="data-table"><thead><tr><th>工单号</th><th>来源类型</th><th>来源标签</th><th>用户</th><th>地市</th><th>状态</th><th>处理人</th><th>CEI改善</th><th>创建时间</th></tr></thead><tbody>' +
        orders.filter(function(o) { return o.sourceType === '质差标签自动' || o.sourceType === '质差模型' || o.sourceType === '质差定界' || o.sourceType === 'DPI-XDR'; }).slice(0, 10).map(function(o) {
            return '<tr><td>' + o.id + '</td><td><span class="badge badge-primary" style="font-size:10px;">' + (o.sourceType || '-') + '</span></td><td>' + (o.sourceTagName || '-') + '</td><td>' + o.userAccount + '</td><td>' + o.city + '</td><td>' + Pages.statusHtml(o.status) + '</td><td>' + o.assignee + '</td><td>' + (o.ceiAfterRepair ? '<span style="color:#27ae60;">+' + (o.ceiAfterRepair - (o.ceiBeforeRepair || 0)).toFixed(1) + '</span>' : '-') + '</td><td>' + o.createTime + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '</div>';

    setTimeout(function() {
        var d1 = document.getElementById('loopFunnelChart');
        if (d1) {
            var c1 = echarts.init(d1);
            App.chartInstances['loopFunnelChart'] = c1;
            c1.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c}' },
                series: [{
                    type: 'funnel', left: '10%', top: 20, bottom: 20, width: '80%',
                    sort: 'descending', gap: 2,
                    label: { show: true, position: 'inside', fontSize: 11 },
                    data: [
                        { value: step1Count, name: '发现质差' },
                        { value: step2Count, name: '打标签' },
                        { value: step4Count, name: '生成工单' },
                        { value: step6Count, name: '已闭环' },
                        { value: step7Count, name: 'CEI改善' }
                    ]
                }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('loopDurationChart');
        if (d2) {
            var c2 = echarts.init(d2);
            App.chartInstances['loopDurationChart'] = c2;
            // 闭环时长分布
            var durBins = { '<4h': 0, '4-8h': 0, '8-24h': 0, '24-48h': 0, '>48h': 0 };
            stats.comparisons.forEach(function(c) {
                var hours = parseFloat(c.resolveTime);
                if (isNaN(hours)) return;
                if (hours < 4) durBins['<4h']++;
                else if (hours < 8) durBins['4-8h']++;
                else if (hours < 24) durBins['8-24h']++;
                else if (hours < 48) durBins['24-48h']++;
                else durBins['>48h']++;
            });
            c2.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 20, right: 20, bottom: 30, left: 40 },
                xAxis: { type: 'category', data: Object.keys(durBins), axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value', name: '工单数' },
                series: [{
                    type: 'bar', data: Object.keys(durBins).map(function(k, i) { return { value: durBins[k], itemStyle: { color: ['#27ae60', '#5b8ff9', '#f6bd16', '#f39c12', '#e74c3c'][i] } }; }),
                    barWidth: '50%', label: { show: true, position: 'top', fontSize: 10 }
                }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    }, 50);
};

EnhancePages._loopStep = function(num, title, value, color, page) {
    return '<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;flex:1;min-width:90px;" onclick="loadPageContent(\'' + page + '\')">' +
        '<div style="width:60px;height:60px;border-radius:50%;background:' + color + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;box-shadow:0 2px 8px ' + color + '40;">' + num + '</div>' +
        '<div style="margin-top:8px;font-size:13px;font-weight:600;color:#1a1a2e;">' + title + '</div>' +
        '<div style="font-size:11px;color:' + color + ';font-weight:600;">' + value + '</div>' +
        '</div>';
};

EnhancePages._loopArrow = function() {
    return '<div style="color:#bbb;font-size:18px;flex-shrink:0;">→</div>';
};


// ============ CEI定界TOP5原因增强（覆盖家庭/网络/内容/光路/接入5侧） ============
EnhancePages.renderCeiBoundaryEnhanced = function(container, type) {
    type = type || 'business'; // business / connect
    var sides, top5BySide;
    if (type === 'business') {
        sides = [
            { name: '家庭侧', value: 32.8, color: '#5ad8a6', users: 1252 },
            { name: '网络侧', value: 45.2, color: '#5b8ff9', users: 1723 },
            { name: '内容侧', value: 15.5, color: '#f6bd16', users: 591 },
            { name: '光路侧', value: 4.5, color: '#9b59b6', users: 172 },
            { name: '接入侧', value: 2.0, color: '#e67e22', users: 76 }
        ];
        top5BySide = {
            '家庭侧': [{ name: 'WiFi信号弱', count: 412, pct: 32.9 }, { name: '网关CPU高', count: 298, pct: 23.8 }, { name: '终端兼容差', count: 215, pct: 17.2 }, { name: '组网不合理', count: 186, pct: 14.9 }, { name: '带宽不足', count: 141, pct: 11.3 }],
            '网络侧': [{ name: 'OLT上行拥塞', count: 523, pct: 30.4 }, { name: 'BRAS负载高', count: 412, pct: 23.9 }, { name: '传输链路抖动', count: 356, pct: 20.7 }, { name: '路由环路', count: 256, pct: 14.9 }, { name: 'DNS慢', count: 176, pct: 10.2 }],
            '内容侧': [{ name: 'CDN节点异常', count: 198, pct: 33.5 }, { name: '源站响应慢', count: 156, pct: 26.4 }, { name: 'DNS劫持', count: 102, pct: 17.3 }, { name: '内容限速', count: 78, pct: 13.2 }, { name: '证书过期', count: 57, pct: 9.6 }],
            '光路侧': [{ name: '光衰过大', count: 68, pct: 39.5 }, { name: '光纤老化', count: 42, pct: 24.4 }, { name: '接头氧化', count: 28, pct: 16.3 }, { name: '弯曲过度', count: 20, pct: 11.6 }, { name: '分光器异常', count: 14, pct: 8.1 }],
            '接入侧': [{ name: 'OLT端口故障', count: 28, pct: 36.8 }, { name: '板卡告警', count: 18, pct: 23.7 }, { name: 'ONT异常', count: 14, pct: 18.4 }, { name: 'PON拥塞', count: 10, pct: 13.2 }, { name: '认证失败', count: 6, pct: 7.9 }]
        };
    } else {
        sides = [
            { name: '家庭侧', value: 28.5, color: '#5ad8a6', users: 839 },
            { name: '光路侧', value: 38.2, color: '#5b8ff9', users: 1126 },
            { name: '接入侧', value: 25.8, color: '#f6bd16', users: 760 },
            { name: '网络侧', value: 5.5, color: '#9b59b6', users: 162 },
            { name: '内容侧', value: 2.0, color: '#e67e22', users: 58 }
        ];
        top5BySide = {
            '家庭侧': [{ name: '网关掉电', count: 286, pct: 34.1 }, { name: '网关死机', count: 198, pct: 23.6 }, { name: 'WiFi模块故障', count: 142, pct: 16.9 }, { name: '用户拔线', count: 128, pct: 15.3 }, { name: '电源不稳', count: 85, pct: 10.1 }],
            '光路侧': [{ name: '光衰过大(弱光)', count: 412, pct: 36.6 }, { name: '光纤断裂', count: 286, pct: 25.4 }, { name: '接头松动', count: 198, pct: 17.6 }, { name: '分光器故障', count: 142, pct: 12.6 }, { name: '弯曲过度', count: 88, pct: 7.8 }],
            '接入侧': [{ name: 'OLT端口故障', count: 256, pct: 33.7 }, { name: 'PON板卡异常', count: 186, pct: 24.5 }, { name: 'MAC认证失败', count: 142, pct: 18.7 }, { name: 'VLAN配置错误', count: 98, pct: 12.9 }, { name: '端口拉闸', count: 78, pct: 10.3 }],
            '网络侧': [{ name: '链路中断', count: 56, pct: 34.6 }, { name: 'BRAS异常', count: 42, pct: 25.9 }, { name: '路由黑洞', count: 28, pct: 17.3 }, { name: '环路', count: 22, pct: 13.6 }, { name: 'ARP风暴', count: 14, pct: 8.6 }],
            '内容侧': [{ name: '服务停止', count: 22, pct: 37.9 }, { name: '负载过载', count: 14, pct: 24.1 }, { name: '黑名单', count: 10, pct: 17.2 }, { name: '维护中', count: 8, pct: 13.8 }, { name: '其他', count: 4, pct: 6.9 }]
        };
    }

    // 5侧面板
    var sidesHtml = sides.map(function(s) {
        var top5Html = top5BySide[s.name].map(function(r, idx) {
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:11px;border-bottom:1px solid #f0f2f5;">' +
                '<span style="display:flex;align-items:center;gap:6px;"><span style="width:18px;height:18px;border-radius:50%;background:' + (idx === 0 ? '#e74c3c' : (idx === 1 ? '#f39c12' : (idx === 2 ? '#f6bd16' : '#bdc3c7'))) + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">' + (idx + 1) + '</span>' + r.name + '</span>' +
                '<span><strong style="color:' + s.color + ';">' + r.count + '</strong> <span style="color:#999;">(' + r.pct + '%)</span></span>' +
                '</div>';
        }).join('');
        return '<div class="chart-card" style="padding:0;">' +
            '<div style="background:' + s.color + ';color:#fff;padding:8px 12px;font-weight:600;font-size:13px;display:flex;justify-content:space-between;align-items:center;border-radius:4px 4px 0 0;">' +
            '<span>' + s.name + '</span>' +
            '<span style="font-size:11px;font-weight:400;opacity:0.9;">占比 ' + s.value + '% / ' + s.users + '户</span>' +
            '</div>' +
            '<div style="padding:10px 12px;">' +
            '<div style="font-size:11px;color:#999;margin-bottom:6px;font-weight:600;">TOP5 原因分布</div>' +
            top5Html +
            '</div></div>';
    }).join('');

    container.innerHTML =
        '<div class="page-content">' +
        '<div class="remote-panel"><div class="remote-panel-title">CEI定界TOP5原因分布（家庭侧/网络侧/内容侧/光路侧/接入侧）</div>' +
        '<div class="remote-form">' +
            Pages.cityFilterHtml('cebCity', '', '') +
            '<div class="form-group"><label class="form-label">定界类型</label><select class="form-select" id="cebType" onchange="EnhancePages.renderCeiBoundaryEnhanced(document.getElementById(\'page-cei-boundary-enhanced\'),this.value)"><option value="business"' + (type === 'business' ? ' selected' : '') + '>业务CEI定界</option><option value="connect"' + (type === 'connect' ? ' selected' : '') + '>通断CEI定界</option></select></div>' +
            '<div class="form-group"><label class="form-label">时间范围</label><input class="form-input" type="date" value="2025-12-02"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="EnhancePages.renderCeiBoundaryEnhanced(document.getElementById(\'page-cei-boundary-enhanced\'),\'' + type + '\')">查询</button></div>' +
        '</div></div>' +
        '<div style="margin-bottom:8px;padding:10px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;">' +
            '<strong>说明：</strong>' + (type === 'business' ? '业务CEI定界基于HTTP首包时延、视频卡顿率、DNS解析等业务体验指标，将质差归类到家庭/网络/内容/光路/接入5个区域。' : '通断CEI定界基于光功率、掉线次数、dying-gasp等连通性指标，定界到家庭/光路/接入/网络/内容5个区域。') + '阈值参数从配置中心实时读取。' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' + sidesHtml + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">5侧定界比例分布</span></div><div class="chart-container" id="cebPieChart"></div></div>' +
            '<div class="chart-card" style="min-height:300px;"><div class="chart-card-header"><span class="chart-title">5侧关联用户数</span></div><div class="chart-container" id="cebBarChart"></div></div>' +
        '</div></div>';

    setTimeout(function() {
        var d1 = document.getElementById('cebPieChart');
        if (d1) {
            var c1 = echarts.init(d1);
            App.chartInstances['cebPieChart'] = c1;
            c1.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
                legend: { bottom: 5, textStyle: { fontSize: 10 } },
                series: [{ type: 'pie', radius: ['35%', '60%'], center: ['50%', '45%'], data: sides.map(function(s) { return { name: s.name, value: s.value, itemStyle: { color: s.color } }; }), label: { fontSize: 10 } }]
            });
            window.addEventListener('resize', function() { c1.resize(); });
        }
        var d2 = document.getElementById('cebBarChart');
        if (d2) {
            var c2 = echarts.init(d2);
            App.chartInstances['cebBarChart'] = c2;
            c2.setOption({
                tooltip: { trigger: 'axis' },
                grid: { top: 20, right: 30, bottom: 30, left: 60 },
                xAxis: { type: 'category', data: sides.map(function(s) { return s.name; }) },
                yAxis: { type: 'value', name: '用户数' },
                series: [{ type: 'bar', data: sides.map(function(s) { return { value: s.users, itemStyle: { color: s.color } }; }), barWidth: '50%', label: { show: true, position: 'top', fontSize: 10 } }]
            });
            window.addEventListener('resize', function() { c2.resize(); });
        }
    }, 50);
};

// ============ API-backed DPI-XDR page override ============
// Keep the original local simulator as a fallback when the backend is offline.
EnhancePages._renderDpiXdrLocal = EnhancePages.renderDpiXdrDetail;
EnhancePages._xdrApiRows = [];

EnhancePages._xdrQueryParams = function(page) {
    return {
        page: page || this._xdrPage || 1,
        pageSize: 12,
        city_name: this._xdrCity || '',
        protocol: this._xdrProto || '',
        app_name: this._xdrApp || '',
        account: this._xdrAccount || '',
        quality_only: this._xdrIssueOnly ? '1' : '',
        tag: this._xdrTag || ''
    };
};

EnhancePages._tagList = function(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value).split(',').map(function(t) { return t.trim(); }).filter(Boolean);
};

EnhancePages._renderXdrPagination = function(p) {
    if (!p) return '';
    var page = p.page || 1;
    var totalPages = p.totalPages || 1;
    return '<div style="display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:10px 12px;font-size:12px;">' +
        '<span>共 ' + (p.total || 0) + ' 条，第 ' + page + '/' + totalPages + ' 页</span>' +
        '<button class="btn" ' + (page <= 1 ? 'disabled' : '') + ' onclick="EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),' + (page - 1) + ')">上一页</button>' +
        '<button class="btn" ' + (page >= totalPages ? 'disabled' : '') + ' onclick="EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),' + (page + 1) + ')">下一页</button>' +
    '</div>';
};

EnhancePages.renderDpiXdrDetail = async function(container, page) {
    this._xdrPage = page || 1;
    container.innerHTML = '<div class="page-content"><div class="empty-state" style="height:260px;"><div class="empty-text">正在读取DPI-XDR数据库...</div></div></div>';

    if (!window.API || !API.dpiXdr) {
        return this._renderDpiXdrLocal(container, page);
    }

    var resp = await API.dpiXdr(this._xdrQueryParams(this._xdrPage));
    var stats = await API.dpiXdrStats();
    if (!resp || !stats) {
        return this._renderDpiXdrLocal(container, page);
    }

    var rowsData = resp.data || [];
    this._xdrApiRows = rowsData;
    var pager = resp.pagination || { page: this._xdrPage, total: rowsData.length, totalPages: 1 };

    var protoOpts = '<option value="">全部协议</option>';
    (stats.protocol || []).forEach(function(item) {
        protoOpts += '<option value="' + item.name + '"' + (item.name === EnhancePages._xdrProto ? ' selected' : '') + '>' + item.name + ' (' + item.value + ')</option>';
    });
    if ((stats.protocol || []).length === 0) {
        ['HTTP','HTTPS','DNS','IPTV','GAMING'].forEach(function(name) {
            protoOpts += '<option value="' + name + '"' + (name === EnhancePages._xdrProto ? ' selected' : '') + '>' + name + '</option>';
        });
    }

    var appOpts = '<option value="">全部应用</option>';
    (stats.app || []).forEach(function(item) {
        appOpts += '<option value="' + item.name + '"' + (item.name === EnhancePages._xdrApp ? ' selected' : '') + '>' + item.name + '</option>';
    });

    var tagOpts = '<option value="">全部标签</option>';
    var tagSet = {};
    (stats.tag || []).forEach(function(item) {
        EnhancePages._tagList(item.name).forEach(function(t) { tagSet[t] = (tagSet[t] || 0) + item.value; });
    });
    Object.keys(tagSet).forEach(function(t) {
        tagOpts += '<option value="' + t + '"' + (t === EnhancePages._xdrTag ? ' selected' : '') + '>' + t + ' (' + tagSet[t] + ')</option>';
    });

    var rows = rowsData.map(function(r) {
        var tagsHtml = EnhancePages._tagList(r.quality_tags).map(function(t) {
            return '<span style="display:inline-block;padding:1px 6px;background:#fef0f0;color:#c0392b;border-radius:8px;font-size:10px;margin-right:3px;">' + t + '</span>';
        }).join('');
        var statusCls = r.is_quality_issue ? 'status-error' : 'status-normal';
        var statusText = r.is_quality_issue ? '质差' : '正常';
        return '<tr>' +
            '<td>' + r.record_id + '</td>' +
            '<td style="font-size:11px;">' + (r.capture_time || '-') + '</td>' +
            '<td>' + (r.user_account || '-') + '</td>' +
            '<td>' + (r.city_name || '-') + '</td>' +
            '<td><span style="padding:1px 6px;background:#f0f5ff;color:#2b7de9;border-radius:8px;font-size:10px;">' + r.protocol + '</span></td>' +
            '<td>' + (r.app_name || '-') + '</td>' +
            '<td style="font-size:11px;">' + (r.src_ip || '-') + ':' + (r.src_port || '-') + '</td>' +
            '<td style="font-size:11px;">' + (r.dst_ip || '-') + ':' + (r.dst_port || '-') + '</td>' +
            '<td>' + ((Number(r.down_bytes || 0) / 1024 / 1024).toFixed(2)) + ' MB</td>' +
            '<td>' + (r.tcp_rtt || '-') + ' ms</td>' +
            '<td><span class="' + statusCls + '">' + statusText + '</span></td>' +
            '<td>' + (tagsHtml || '<span style="color:#ccc;">-</span>') + '</td>' +
            '<td><a style="color:#2b7de9;cursor:pointer;" onclick="EnhancePages.showXdrDetail(\'' + r.record_id + '\')">查看xDR</a></td>' +
            '</tr>';
    }).join('') || '<tr><td colspan="13" style="text-align:center;color:#999;padding:20px;">暂无数据库数据，可点击“生成样例”或运行Excel导入脚本</td></tr>';

    var total = Number(stats.total || 0);
    var quality = Number(stats.quality || 0);
    var qualityRate = total ? (quality / total * 100).toFixed(1) : '0.0';

    container.innerHTML =
        '<div class="page-content">' +
        '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + total + '</div><div class="wo-stat-label">xDR总数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#5b8ff9;">' + (stats.protocol || []).length + '</div><div class="wo-stat-label">协议数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + (stats.app || []).length + '</div><div class="wo-stat-label">应用数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + quality + '</div><div class="wo-stat-label">质差会话</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + qualityRate + '%</div><div class="wo-stat-label">质差占比</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#9b59b6;">' + Object.keys(tagSet).length + '</div><div class="wo-stat-label">质差标签数</div></div>' +
        '</div>' +
        '<div class="remote-panel"><div class="remote-panel-title">DPI-XDR明细查询（数据库/API模式）</div>' +
        '<div class="remote-form">' +
            Pages.cityFilterHtml('xdrCityFilter', 'EnhancePages._xdrCity=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById("page-dpi-capture"),1)', this._xdrCity) +
            '<div class="form-group"><label class="form-label">用户账号/IP</label><input class="form-input" id="xdrAccountInput" value="' + (this._xdrAccount || '') + '" placeholder="账号/IP"></div>' +
            '<div class="form-group"><label class="form-label">协议</label><select class="form-select" onchange="EnhancePages._xdrProto=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">' + protoOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">应用</label><select class="form-select" onchange="EnhancePages._xdrApp=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">' + appOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">质差标签</label><select class="form-select" onchange="EnhancePages._xdrTag=this.value;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">' + tagOpts + '</select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;">' +
                '<label style="font-size:12px;color:#666;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" ' + (this._xdrIssueOnly ? 'checked' : '') + ' onchange="EnhancePages._xdrIssueOnly=this.checked;EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">仅显示质差</label>' +
                '<button class="btn btn-primary" onclick="EnhancePages._xdrAccount=document.getElementById(\'xdrAccountInput\').value.trim();EnhancePages.renderDpiXdrDetail(document.getElementById(\'page-dpi-capture\'),1)">查询</button>' +
                '<button class="btn" onclick="EnhancePages.resetXdrFilter()">重置</button>' +
                '<button class="btn" onclick="EnhancePages.seedXdrSample()">生成样例</button>' +
                '<button class="btn" onclick="EnhancePages.generateXdrTags()">生成标签</button>' +
                '<button class="btn" onclick="EnhancePages.exportXdr()">导出当前页</button>' +
            '</div></div></div>' +
        '<div style="margin-bottom:8px;padding:8px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;">' +
            '<strong>数据口径：</strong>优先读取后端SQLite中的dpi_xdr_common；Excel可通过 server/db/import_xdr_excel.py 导入。后端不可用时自动降级到本地模拟数据。' +
        '</div>' +
        '<div class="data-table-wrapper">' +
        '<table class="data-table"><thead><tr>' +
            '<th>记录ID</th><th>时间</th><th>用户</th><th>地市</th><th>协议</th><th>应用</th><th>源IP:端口</th><th>目的IP:端口</th><th>下行</th><th>RTT</th><th>状态</th><th>质差标签</th><th>操作</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table>' +
        this._renderXdrPagination(pager) + '</div></div>';
};

EnhancePages.seedXdrSample = async function() {
    if (!window.API || !API.seedDpiXdr) return Modal.toast('后端API不可用', 'warning');
    var result = await API.seedDpiXdr({ count: 200 });
    if (result) {
        Modal.toast('已生成 ' + result.inserted + ' 条DPI-XDR样例', 'success');
        this.renderDpiXdrDetail(document.getElementById('page-dpi-capture'), 1);
    }
};

EnhancePages.generateXdrTags = async function() {
    if (!window.API || !API.generateQualityTags) return Modal.toast('后端API不可用', 'warning');
    var result = await API.generateQualityTags({ limit: 500 });
    if (result) Modal.toast('已生成/更新 ' + result.created + ' 条质差标签', 'success');
};

EnhancePages.showXdrDetail = async function(recordId) {
    if (!window.API || !API.dpiXdrDetail) return this._showXdrDetailLocal(recordId);
    var r = await API.dpiXdrDetail(recordId);
    if (!r) return this._showXdrDetailLocal(recordId);
    var detail = r.detail || {};
    var fields = Object.keys(detail).slice(0, 80).map(function(k) {
        return '<div><strong>' + k + '：</strong><span style="word-break:break-all;">' + (detail[k] === null || detail[k] === undefined ? '-' : detail[k]) + '</span></div>';
    }).join('');
    Modal.show('DPI-XDR明细 - ' + r.record_id,
        '<div style="font-size:13px;line-height:2;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
        '<div><strong>记录ID：</strong>' + r.record_id + '</div>' +
        '<div><strong>协议：</strong>' + r.protocol + '</div>' +
        '<div><strong>时间：</strong>' + r.capture_time + '</div>' +
        '<div><strong>用户：</strong>' + (r.user_account || '-') + '</div>' +
        '<div><strong>地市：</strong>' + (r.city_name || '-') + '</div>' +
        '<div><strong>应用：</strong>' + (r.app_name || '-') + '</div>' +
        '<div><strong>源IP：</strong>' + (r.src_ip || '-') + ':' + (r.src_port || '-') + '</div>' +
        '<div><strong>目的IP：</strong>' + (r.dst_ip || '-') + ':' + (r.dst_port || '-') + '</div>' +
        '<div><strong>下行流量：</strong>' + ((Number(r.down_bytes || 0) / 1024 / 1024).toFixed(2)) + ' MB</div>' +
        '<div><strong>质差标签：</strong>' + (r.quality_tags || '-') + '</div>' +
        '</div>' +
        '<div style="font-weight:600;margin:12px 0 6px;color:#2b7de9;">原始/协议字段</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:360px;overflow:auto;border:1px solid #e0e4e8;padding:8px;border-radius:4px;">' + (fields || '无原始字段') + '</div>' +
        '</div>',
        '<button class="btn" onclick="Modal.close()">关闭</button>', '760px');
};

EnhancePages._showXdrDetailLocal = function(recordId) {
    var data = (window.DpiXdrData && DpiXdrData.generate) ? DpiXdrData.generate() : [];
    var r = null;
    for (var i = 0; i < data.length; i++) {
        if (data[i].record_id === recordId) { r = data[i]; break; }
    }
    if (!r) return Modal.toast('未找到xDR明细', 'warning');
    Modal.show('DPI-XDR明细 - ' + r.record_id,
        '<div style="font-size:13px;line-height:2;display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
        '<div><strong>记录ID：</strong>' + r.record_id + '</div>' +
        '<div><strong>协议：</strong>' + r.protocol + '</div>' +
        '<div><strong>时间：</strong>' + r.capture_time + '</div>' +
        '<div><strong>用户：</strong>' + r.user_account + '</div>' +
        '<div><strong>地市：</strong>' + r.city + '</div>' +
        '<div><strong>应用：</strong>' + r.app_name + '</div>' +
        '<div><strong>源IP：</strong>' + r.src_ip + ':' + r.src_port + '</div>' +
        '<div><strong>目的IP：</strong>' + r.dst_ip + ':' + r.dst_port + '</div>' +
        '<div><strong>RTT：</strong>' + r.tcp_rtt + ' ms</div>' +
        '<div><strong>质差标签：</strong>' + (r.quality_tags || []).join(',') + '</div>' +
        '</div>',
        '<button class="btn" onclick="Modal.close()">关闭</button>', '620px');
};

EnhancePages.exportXdr = function() {
    var rows = this._xdrApiRows || [];
    if (!rows.length) return Modal.toast('当前页没有可导出的数据', 'warning');
    var headers = ['record_id','capture_time','user_account','city_name','protocol','app_name','src_ip','src_port','dst_ip','dst_port','down_bytes','tcp_rtt','is_quality_issue','quality_tags'];
    var csv = headers.join(',') + '\n' + rows.map(function(r) {
        return headers.map(function(h) {
            return '"' + String(r[h] === undefined || r[h] === null ? '' : r[h]).replace(/"/g, '""') + '"';
        }).join(',');
    }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'dpi-xdr-page.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

// ============ API-backed PING test page override ============
(function() {
    if (!window.Pages) return;

    Pages._renderPingTestLocal = Pages.renderPingTest;
    Pages._pingPage = 1;
    Pages._pingRows = [];
    Pages._pingCity = '';
    Pages._pingTarget = '';
    Pages._pingOnt = '';
    Pages._pingStatus = '';
    Pages._pingLastStats = null;
    Pages._pingLastOutput = '';

    function pingWait(ms) {
        return new Promise(function(resolve) { setTimeout(resolve, ms); });
    }

    function pingNum(v) {
        var n = Number(v);
        return isFinite(n) ? n : 0;
    }

    function pingAppend(html) {
        var box = document.getElementById('pingResult');
        if (box) box.innerHTML += html;
        if (box) box.scrollTop = box.scrollHeight;
        Pages._pingLastOutput = box ? box.innerHTML : Pages._pingLastOutput;
    }

    function pingStatusText(s) {
        return s || '正常';
    }

    function pingRowsHtml(rows) {
        if (!rows || !rows.length) {
            return '<tr><td colspan="14" style="text-align:center;color:#999;padding:20px;">暂无历史测试记录</td></tr>';
        }
        return rows.map(function(r) {
            var interval = r.interval_ms ? (Number(r.interval_ms) / 1000) : 1;
            return '<tr>' +
                '<td style="font-size:11px;">' + (r.test_time || '-') + '</td>' +
                '<td>' + (r.ont_id || '-') + '</td>' +
                '<td>' + (r.rms_task_id || '-') + '</td>' +
                '<td>' + (r.target_ip || r.target_name || '-') + '</td>' +
                '<td>' + (r.packet_size || 64) + '</td>' +
                '<td>' + (r.packet_count || 10) + '</td>' +
                '<td>' + interval + 's</td>' +
                '<td>' + (r.city_name || '-') + '</td>' +
                '<td>' + pingNum(r.avg_delay).toFixed(1) + 'ms</td>' +
                '<td>' + pingNum(r.max_delay).toFixed(1) + 'ms</td>' +
                '<td>' + pingNum(r.min_delay).toFixed(1) + 'ms</td>' +
                '<td>' + pingNum(r.jitter).toFixed(1) + 'ms</td>' +
                '<td>' + pingNum(r.packet_loss).toFixed(1) + '%</td>' +
                '<td>' + Pages.statusHtml(pingStatusText(r.status)) + '</td>' +
            '</tr>';
        }).join('');
    }

    function pingPaginationHtml(p) {
        if (!p || (p.totalPages || 1) <= 1) return '';
        var page = p.page || 1;
        var totalPages = p.totalPages || 1;
        return '<div style="display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:10px 12px;font-size:12px;">' +
            '<span>共 ' + (p.total || 0) + ' 条，第 ' + page + '/' + totalPages + ' 页</span>' +
            '<button class="btn" ' + (page <= 1 ? 'disabled' : '') + ' onclick="Pages.renderPingTest(document.getElementById(\'page-ping-test\'),' + (page - 1) + ')">上一页</button>' +
            '<button class="btn" ' + (page >= totalPages ? 'disabled' : '') + ' onclick="Pages.renderPingTest(document.getElementById(\'page-ping-test\'),' + (page + 1) + ')">下一页</button>' +
        '</div>';
    }

    Pages.renderPingTest = async function(container, page) {
        this._pingPage = page || this._pingPage || 1;
        if (!window.API || !API.pingTests) return this._renderPingTestLocal(container, page);

        var resp = await API.pingTests({
            page: this._pingPage,
            pageSize: 12,
            city_name: this._pingCity || '',
            target: this._pingTarget || '',
            ont_id: this._pingOnt || '',
            status: this._pingStatus || ''
        });
        if (!resp) return this._renderPingTestLocal(container, page);

        var rows = resp.data || [];
        var pager = resp.pagination || { page: this._pingPage, total: rows.length, totalPages: 1 };
        this._pingRows = rows;

        var last = this._pingLastStats || (rows[0] ? {
            avg: rows[0].avg_delay,
            max: rows[0].max_delay,
            min: rows[0].min_delay,
            loss: rows[0].packet_loss,
            status: rows[0].status
        } : null);

        var statusOpts = ['正常', '告警', '异常'].map(function(s) {
            return '<option value="' + s + '"' + (s === Pages._pingStatus ? ' selected' : '') + '>' + s + '</option>';
        }).join('');

        container.innerHTML =
            '<div class="page-content">' +
            '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + (last ? pingNum(last.avg).toFixed(1) + 'ms' : '-') + '</div><div class="wo-stat-label">平均时延</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + (last ? pingNum(last.max).toFixed(1) + 'ms' : '-') + '</div><div class="wo-stat-label">最大时延</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#27ae60;">' + (last ? pingNum(last.min).toFixed(1) + 'ms' : '-') + '</div><div class="wo-stat-label">最小时延</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + (last ? pingNum(last.loss).toFixed(1) + '%' : '-') + '</div><div class="wo-stat-label">丢包率</div></div>' +
                '<div class="wo-stat-card"><div class="wo-stat-value">' + (pager.total || 0) + '</div><div class="wo-stat-label">历史记录</div></div>' +
            '</div>' +
            '<div class="remote-panel"><div class="remote-panel-title">PING测试工具（RMS/API模式）</div>' +
            '<div class="remote-form">' +
                Pages.cityFilterHtml('pingCityFilter', 'Pages._pingCity=this.value;Pages.renderPingTest(document.getElementById("page-ping-test"),1)', this._pingCity) +
                '<div class="form-group"><label class="form-label">ONT设备ID</label><input class="form-input" id="pingOntId" value="' + (this._pingOnt || '') + '" placeholder="请输入ONT设备ID"></div>' +
                '<div class="form-group"><label class="form-label">目标IP/域名</label><input class="form-input" id="pingTarget" value="' + (this._pingTarget || '') + '" placeholder="请输入目标IP或域名"></div>' +
                '<div class="form-group"><label class="form-label">ping包大小</label><input class="form-input" id="pingSize" type="number" min="32" max="1500" value="64"></div>' +
                '<div class="form-group"><label class="form-label">次数</label><input class="form-input" id="pingCount" type="number" min="1" max="100" value="10"></div>' +
                '<div class="form-group"><label class="form-label">间隔</label><input class="form-input" id="pingInterval" type="number" min="1" max="60" value="1" placeholder="秒"></div>' +
                '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;">' +
                    '<button class="btn btn-primary" id="pingStartBtn" onclick="Pages.executePing()">开始PING</button>' +
                    '<button class="btn" onclick="Pages.resetPingFilters()">重置</button>' +
                '</div>' +
            '</div>' +
            '<div class="ping-result" id="pingResult" style="min-height:220px;max-height:360px;overflow:auto;">' + (this._pingLastOutput || '<span style="color:#f39c12;">等待执行PING测试...</span>') + '</div></div>' +
            '<div class="data-table-wrapper" style="margin-top:8px;">' +
                '<div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
                    '<span>历史测试记录（共' + (pager.total || 0) + '条）</span>' +
                    '<input class="form-input" style="width:180px;height:30px;" id="pingTargetFilter" value="' + (this._pingTarget || '') + '" placeholder="目标IP/域名">' +
                    '<input class="form-input" style="width:160px;height:30px;" id="pingOntFilter" value="' + (this._pingOnt || '') + '" placeholder="ONT设备ID">' +
                    '<select class="form-select" style="width:110px;height:30px;" id="pingStatusFilter"><option value="">全部状态</option>' + statusOpts + '</select>' +
                    '<button class="btn" onclick="Pages.applyPingHistoryFilter()">查询</button>' +
                '</div>' +
                '<table class="data-table"><thead><tr><th>时间</th><th>ONT设备ID</th><th>RMS任务</th><th>目标IP/域名</th><th>包大小</th><th>次数</th><th>间隔</th><th>地市</th><th>平均时延</th><th>最大时延</th><th>最小时延</th><th>抖动</th><th>丢包率</th><th>状态</th></tr></thead><tbody>' + pingRowsHtml(rows) + '</tbody></table>' +
                pingPaginationHtml(pager) +
            '</div></div>';
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
        this._pingLastStats = null;
        this._pingLastOutput = '';
        this.renderPingTest(document.getElementById('page-ping-test'), 1);
    };

    Pages.executePing = async function() {
        if (this._pingRunning) { Modal.toast('PING测试正在执行中，请等待完成', 'warning'); return; }
        if (!window.API || !API.executePing) return this._renderPingTestLocal(document.getElementById('page-ping-test'), 1);

        var target = (document.getElementById('pingTarget') || {}).value || '';
        var ontId = (document.getElementById('pingOntId') || {}).value || '';
        var size = parseInt((document.getElementById('pingSize') || {}).value, 10) || 64;
        var count = parseInt((document.getElementById('pingCount') || {}).value, 10) || 10;
        var interval = parseInt((document.getElementById('pingInterval') || {}).value, 10) || 1;
        target = target.trim();
        ontId = ontId.trim();

        if (!target) return Modal.toast('请输入目标IP或域名', 'warning');
        if (size < 32 || size > 1500) return Modal.toast('ping包大小需在32-1500之间', 'warning');
        if (count < 1 || count > 100) return Modal.toast('次数需在1-100之间', 'warning');
        if (interval < 1 || interval > 60) return Modal.toast('间隔需在1-60秒之间', 'warning');

        this._pingRunning = true;
        this._pingTarget = target;
        this._pingOnt = ontId;
        var btn = document.getElementById('pingStartBtn');
        if (btn) { btn.disabled = true; btn.textContent = '执行中...'; }
        var result = document.getElementById('pingResult');
        if (result) {
            result.innerHTML = '<span style="color:#4cc9f0;">[1/5] 创建PING任务...</span>';
            this._pingLastOutput = result.innerHTML;
        }

        try {
            await pingWait(250);
            pingAppend('<br><span style="color:#f39c12;">[2/5] 发送给RMS：目标 ' + target + (ontId ? '，ONT ' + ontId : '，RMS自动选择源端') + '</span>');
            await pingWait(350);
            pingAppend('<br><span style="color:#999;">[3/5] RMS执行中，包大小 ' + size + 'B，次数 ' + count + '，间隔 ' + interval + 's...</span>');

            var data = await API.executePing({
                target: target,
                ontId: ontId,
                packetSize: size,
                count: count,
                interval: interval,
                city_name: this._pingCity || '',
                operator: (window.App && App.currentUser) ? App.currentUser : '系统'
            });
            if (!data) throw new Error('PING接口返回为空');

            await pingWait(250);
            pingAppend('<br><span style="color:#27ae60;font-weight:600;">[4/5] RMS返回ping结果：' + data.rmsTaskId + '</span>');
            (data.results || []).forEach(function(r) {
                if (r.timeout) {
                    pingAppend('<br><span style="color:#e74c3c;">seq=' + r.seq + ' timeout bytes=' + r.bytes + '</span>');
                } else {
                    pingAppend('<br><span style="color:#00ff88;">seq=' + r.seq + ' bytes=' + r.bytes + ' ttl=' + r.ttl + ' time=' + r.time + ' ms</span>');
                }
            });

            var s = data.stats || {};
            this._pingLastStats = s;
            pingAppend('<br><span style="color:#999;">[5/5] 已写入历史记录：' + data.testId + '</span>');
            pingAppend('<br><span style="color:#00ff88;">--- ' + target + ' ping统计 ---</span>');
            pingAppend('<br><span style="color:#00ff88;">' + s.sent + ' 个包已发送，' + s.received + ' 个已接收，丢包率 ' + pingNum(s.loss).toFixed(1) + '%</span>');
            pingAppend('<br><span style="color:#00ff88;">rtt 最小/平均/最大/抖动 = ' + pingNum(s.min).toFixed(1) + '/' + pingNum(s.avg).toFixed(1) + '/' + pingNum(s.max).toFixed(1) + '/' + pingNum(s.jitter).toFixed(1) + ' ms，状态：' + (s.status || '-') + '</span>');
            Modal.toast('PING测试完成，结果已入库', 'success');

            this._pingLastOutput = (document.getElementById('pingResult') || {}).innerHTML || this._pingLastOutput;
            await pingWait(400);
            this.renderPingTest(document.getElementById('page-ping-test'), 1);
        } catch (e) {
            pingAppend('<br><span style="color:#e74c3c;">执行失败：' + e.message + '</span>');
            Modal.toast('PING测试失败', 'error');
        } finally {
            this._pingRunning = false;
            if (btn) { btn.disabled = false; btn.textContent = '开始PING'; }
        }
    };
})();

// ============ API-backed CEI boundary query and correction loop ============
(function() {
    if (!window.Pages || !window.API) return;

    function esc(v) {
        return String(v === undefined || v === null ? '' : v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function badge(text) {
        var color = text === '家庭侧' ? '#27ae60' : text === '内容侧' ? '#f39c12' : text === '光路侧' ? '#8e44ad' : text === '接入侧' ? '#3498db' : '#e74c3c';
        return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:' + color + '22;color:' + color + ';font-size:11px;font-weight:600;">' + esc(text) + '</span>';
    }

    Pages._renderQualityLocationBackend = Pages.renderQualityLocation;
    Pages.renderQualityLocation = async function(container, page) {
        page = page || 1;
        if (!API.boundaryResults) return this._renderQualityLocationBackend(container);
        var type = this._qlTab || 'business';
        var account = this._qlAccount || '';
        var list = await API.boundaryResults({ boundary_type: type, account: account, page: page, pageSize: 12 });
        if (!list) return this._renderQualityLocationBackend(container);
        var rows = (list.data || []).map(function(r) {
            return '<tr>' +
                '<td>' + esc(r.boundary_id) + '</td>' +
                '<td>' + esc(r.user_account) + '</td>' +
                '<td>' + esc(r.city_name) + '</td>' +
                '<td>' + badge(r.boundary_side) + '</td>' +
                '<td>' + esc(r.root_cause) + '</td>' +
                '<td>' + esc(r.cei_score) + '</td>' +
                '<td>' + esc(r.confidence) + '%</td>' +
                '<td>' + esc(r.severity) + '</td>' +
                '<td>' + esc(r.analysis_time || '') + '</td>' +
                '<td><button class="btn" onclick="Pages.showBoundaryFeedback(\'' + esc(r.boundary_id) + '\',\'' + esc(r.boundary_side) + '\')">纠偏</button></td>' +
                '</tr>';
        }).join('') || '<tr><td colspan="10" style="text-align:center;color:#999;padding:18px;">暂无定界记录，可先点击生成模拟定界结果</td></tr>';
        var p = list.pagination || {};
        container.innerHTML = '<div class="page-content">' +
            '<div class="remote-panel"><div class="remote-panel-title">CEI定界定位查询（后端闭环）</div>' +
            '<div class="remote-form">' +
            '<div class="form-group"><label class="form-label">用户账号/IP</label><input class="form-input" id="qlAccount" value="' + esc(account) + '" placeholder="请输入用户账号或IP"></div>' +
            '<div class="form-group"><label class="form-label">定界类型</label><select class="form-select" id="qlType"><option value="business"' + (type === 'business' ? ' selected' : '') + '>业务CEI定界定位</option><option value="disconnect"' + (type === 'disconnect' ? ' selected' : '') + '>通断CEI定界定位</option></select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.executeQlQuery()">查询</button><button class="btn" onclick="Pages.generateBoundarySample()">生成模拟定界</button><button class="btn" onclick="Pages._qlAccount=\'\';Pages.renderQualityLocation(document.getElementById(\'page-ce-location\'),1)">重置</button></div>' +
            '</div></div>' +
            '<div style="margin-bottom:8px;padding:10px 12px;background:#f0f5ff;border:1px solid #b8d4fe;border-radius:4px;font-size:12px;color:#1a5bb8;">定界结果来自后端模拟表，可承接DPI、AAA、RMS、OMCI和网管证据；纠偏会写入模型反馈记录，并联动“定界准确率闭环”。</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>定界ID</th><th>用户账号</th><th>地市</th><th>定界侧</th><th>根因</th><th>CEI</th><th>置信度</th><th>严重度</th><th>分析时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            '<div style="padding:10px;text-align:right;font-size:12px;">共 ' + (p.total || 0) + ' 条，第 ' + (p.page || page) + '/' + (p.totalPages || 1) + ' 页</div></div></div>';
    };

    Pages.executeQlQuery = function() {
        var account = (document.getElementById('qlAccount') || {}).value || '';
        var type = (document.getElementById('qlType') || {}).value || 'business';
        this._qlAccount = account.trim();
        this._qlTab = type;
        this.renderQualityLocation(document.getElementById('page-ce-location'), 1);
    };

    Pages.generateBoundarySample = async function() {
        var type = (document.getElementById('qlType') || {}).value || this._qlTab || 'business';
        var r = await API.generateBoundary({ boundary_type: type, limit: 80 });
        if (r) Modal.toast('已生成 ' + r.created + ' 条模拟定界结果', 'success');
        this._qlTab = type;
        this.renderQualityLocation(document.getElementById('page-ce-location'), 1);
    };

    Pages.showBoundaryFeedback = function(boundaryId, predicted) {
        Modal.show('定界人工纠偏',
            '<div class="form-group"><label class="form-label">定界ID</label><input class="form-input" id="bdFbId" value="' + esc(boundaryId) + '" readonly></div>' +
            '<div class="form-group"><label class="form-label">模型预测</label><input class="form-input" id="bdFbPred" value="' + esc(predicted) + '" readonly></div>' +
            '<div class="form-group"><label class="form-label">纠偏结果</label><select class="form-select" id="bdFbCorrect"><option>' + esc(predicted) + '</option><option>家庭侧</option><option>网络侧</option><option>内容侧</option><option>光路侧</option><option>接入侧</option></select></div>' +
            '<div class="form-group"><label class="form-label">备注</label><input class="form-input" id="bdFbComment" placeholder="例如：现场核查为光衰过大"></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.submitBoundaryFeedback()">提交纠偏</button>',
            '460px');
    };

    Pages.submitBoundaryFeedback = async function() {
        var id = (document.getElementById('bdFbId') || {}).value || '';
        var pred = (document.getElementById('bdFbPred') || {}).value || '';
        var corrected = (document.getElementById('bdFbCorrect') || {}).value || pred;
        var comment = (document.getElementById('bdFbComment') || {}).value || '';
        var r = await API.submitModelFeedback({
            model_code: 'CEI_BOUNDARY',
            source_record_id: id,
            predicted_label: pred,
            corrected_label: corrected,
            is_correct: pred === corrected,
            confidence: 88,
            reviewer: 'admin',
            comment: comment
        });
        Modal.close();
        if (r) Modal.toast('纠偏已记录，当前模型准确率 ' + r.currentAccuracy + '%', 'success');
    };
})();

// ============ Backend CRUD overrides: users / configs / CEI ============
(function() {
    if (!window.Pages) return;
    function h(v) { return String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, function(c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
    function status(v) { return v === 1 || v === '1' || v === '启用' ? '启用' : '禁用'; }

    Pages._renderUserManagementLocal2 = Pages.renderUserManagement;
    Pages.renderUserManagement = async function(container) {
        if (!window.API || !API.systemUsers) return this._renderUserManagementLocal2(container);
        var users = await API.systemUsers();
        if (!users) return this._renderUserManagementLocal2(container);
        var rows = users.map(function(u) {
            return '<tr><td>' + u.id + '</td><td>' + h(u.username) + '</td><td>' + h(u.real_name) + '</td><td>' + h(u.role) + '</td><td>' + h(u.city_name || '-') + '</td><td>' + h(u.department || '-') + '</td><td>' + Pages.statusHtml(status(u.status)) + '</td><td>' + h(u.last_login_at || '-') + '</td><td><button class="btn" onclick="Pages.showBackendUserModal(' + u.id + ')">编辑</button><button class="btn" onclick="Pages.toggleBackendUser(' + u.id + ',' + (u.status ? 0 : 1) + ')">' + (u.status ? '禁用' : '启用') + '</button></td></tr>';
        }).join('');
        container.innerHTML = '<div class="page-content"><div class="system-panel"><div class="system-panel-header"><span class="system-panel-title">用户管理（后端权限数据）</span><div><button class="btn btn-primary" onclick="Pages.showBackendUserModal()">+ 新增用户</button></div></div><div class="system-panel-body"><table class="data-table"><thead><tr><th>ID</th><th>用户名</th><th>姓名</th><th>角色</th><th>地市</th><th>部门</th><th>状态</th><th>最后登录</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div></div></div>';
    };
    Pages.showBackendUserModal = async function(id) {
        var users = await API.systemUsers();
        var u = id ? (users || []).find(function(x) { return x.id === id; }) : {};
        Modal.show(id ? '编辑用户' : '新增用户',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div class="form-group"><label class="form-label">用户名</label><input class="form-input" id="beUserName" value="' + h(u.username || '') + '"></div>' +
            '<div class="form-group"><label class="form-label">姓名</label><input class="form-input" id="beRealName" value="' + h(u.real_name || '') + '"></div>' +
            '<div class="form-group"><label class="form-label">角色</label><select class="form-select" id="beRole"><option>admin</option><option>operator</option><option>dispatcher</option><option>viewer</option></select></div>' +
            '<div class="form-group"><label class="form-label">地市</label><input class="form-input" id="beCity" value="' + h(u.city_name || '') + '" placeholder="如 长春"></div>' +
            '<div class="form-group"><label class="form-label">部门</label><input class="form-input" id="beDept" value="' + h(u.department || '') + '"></div>' +
            '<div class="form-group"><label class="form-label">电话</label><input class="form-input" id="bePhone" value="' + h(u.phone || '') + '"></div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.saveBackendUser()">保存</button>', '620px');
        var role = document.getElementById('beRole'); if (role && u.role) role.value = u.role;
    };
    Pages.saveBackendUser = async function() {
        var p = {
            username: document.getElementById('beUserName').value.trim(),
            real_name: document.getElementById('beRealName').value.trim(),
            role: document.getElementById('beRole').value,
            city_name: document.getElementById('beCity').value.trim(),
            department: document.getElementById('beDept').value.trim(),
            phone: document.getElementById('bePhone').value.trim()
        };
        if (!p.username) return Modal.toast('用户名必填', 'warning');
        var r = await API.saveSystemUser(p);
        if (r) { Modal.close(); Modal.toast('用户已保存', 'success'); Pages.renderUserManagement(document.getElementById('page-user-management')); }
    };
    Pages.toggleBackendUser = async function(id, st) {
        var r = await API.setSystemUserStatus(id, { status: st });
        if (r) { Modal.toast('用户状态已更新', 'success'); Pages.renderUserManagement(document.getElementById('page-user-management')); }
    };

    Pages._renderConfigCenterLocal2 = Pages.renderConfigCenter;
    Pages.renderConfigCenter = async function(container) {
        if (!window.API || !API.configs) return this._renderConfigCenterLocal2(container);
        var cfgs = await API.configs({ category: this._cfgCategory || '' });
        if (!cfgs) return this._renderConfigCenterLocal2(container);
        var cats = {};
        cfgs.forEach(function(c) { cats[c.category || '未分类'] = 1; });
        var opts = '<option value="">全部分类</option>' + Object.keys(cats).map(function(c) { return '<option value="' + h(c) + '"' + (c === Pages._cfgCategory ? ' selected' : '') + '>' + h(c) + '</option>'; }).join('');
        var rows = cfgs.map(function(c) {
            return '<tr><td>' + h(c.category) + '</td><td>' + h(c.config_key) + '</td><td style="max-width:260px;word-break:break-all;">' + h(c.config_value) + '</td><td>' + h(c.description || '') + '</td><td>' + h(c.updated_by || '-') + '</td><td>' + h(c.updated_at || '-') + '</td><td><button class="btn" onclick="Pages.showBackendConfig(\'' + h(c.config_key) + '\')">编辑</button><button class="btn" onclick="Pages.deleteBackendConfig(\'' + h(c.config_key) + '\')">删除</button></td></tr>';
        }).join('');
        container.innerHTML = '<div class="page-content"><div class="system-panel"><div class="system-panel-header" style="align-items:flex-start;gap:12px;flex-wrap:wrap;"><span class="system-panel-title">配置中心（后端CRUD）</span><div style="margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap;"><select class="form-select" style="width:180px;" onchange="Pages._cfgCategory=this.value;Pages.renderConfigCenter(document.getElementById(\'page-config-center\'))">' + opts + '</select><button class="btn btn-primary" style="white-space:nowrap;" onclick="Pages.showBackendConfig()">+ 新增配置</button></div></div><div class="system-panel-body" style="overflow-x:auto;"><table class="data-table"><thead><tr><th>分类</th><th>配置键</th><th>配置值</th><th>说明</th><th>修改人</th><th>修改时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div></div></div>';
    };
    Pages.showBackendConfig = async function(key) {
        var cfgs = await API.configs({});
        var c = key ? (cfgs || []).find(function(x) { return x.config_key === key; }) : {};
        Modal.show(key ? '编辑配置' : '新增配置',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div class="form-group"><label class="form-label">配置键</label><input class="form-input" id="beCfgKey" value="' + h(c.config_key || '') + '"></div>' +
            '<div class="form-group"><label class="form-label">分类</label><input class="form-input" id="beCfgCat" value="' + h(c.category || '') + '"></div>' +
            '<div class="form-group" style="grid-column:span 2;"><label class="form-label">配置值</label><textarea class="form-input" id="beCfgVal" rows="3">' + h(c.config_value || '') + '</textarea></div>' +
            '<div class="form-group" style="grid-column:span 2;"><label class="form-label">说明</label><input class="form-input" id="beCfgDesc" value="' + h(c.description || '') + '"></div>' +
            '</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.saveBackendConfig()">保存</button>', '680px');
    };
    Pages.saveBackendConfig = async function() {
        var p = { config_key: document.getElementById('beCfgKey').value.trim(), category: document.getElementById('beCfgCat').value.trim(), config_value: document.getElementById('beCfgVal').value, description: document.getElementById('beCfgDesc').value, updated_by: 'admin' };
        if (!p.config_key) return Modal.toast('配置键必填', 'warning');
        var r = await API.saveConfig(p);
        if (r) { Modal.close(); Modal.toast('配置已保存', 'success'); Pages.renderConfigCenter(document.getElementById('page-config-center')); }
    };
    Pages.deleteBackendConfig = async function(key) {
        var r = await API.deleteConfig(key);
        if (r) { Modal.toast('配置已删除', 'success'); Pages.renderConfigCenter(document.getElementById('page-config-center')); }
    };

    Pages._renderCeiQueryLocal2 = Pages.renderCeiQuery;
    Pages.renderCeiQuery = async function(container, page) {
        page = page || 1;
        if (!window.API || !API.ceiUsers) return this._renderCeiQueryLocal2(container, page);
        var resp = await API.ceiUsers({ page: page, pageSize: 12, account: this._ceiAccount || '' });
        if (!resp) return this._renderCeiQueryLocal2(container, page);
        var rows = (resp.data || []).map(function(r) {
            return '<tr><td>' + h(r.user_account) + '</td><td>' + h(r.city_name) + '</td><td><span class="' + (r.overall_cei < 80 ? 'status-error' : 'status-normal') + '">' + r.overall_cei + '</span></td><td>' + r.business_cei + '</td><td>' + r.network_cei + '</td><td>' + r.download_speed + 'Mbps</td><td>' + r.latency + 'ms</td><td>' + r.packet_loss + '%</td><td>' + h(r.product_type) + '</td><td>' + r.bandwidth + 'M</td></tr>';
        }).join('');
        var p = resp.pagination || {};
        container.innerHTML = '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">用户和业务CEI查询（后端数据）</div><div class="remote-form"><div class="form-group"><label class="form-label">用户账号</label><input class="form-input" id="ceiAccountInput" value="' + h(this._ceiAccount || '') + '" placeholder="请输入用户账号"></div><div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages._ceiAccount=document.getElementById(\'ceiAccountInput\').value.trim();Pages.renderCeiQuery(document.getElementById(\'page-cei-query\'),1)">查询</button><button class="btn" onclick="Pages._ceiAccount=\'\';Pages.renderCeiQuery(document.getElementById(\'page-cei-query\'),1)">重置</button></div></div></div><div class="data-table-wrapper"><table class="data-table"><thead><tr><th>用户账号</th><th>地市</th><th>综合CEI</th><th>业务CEI</th><th>网络CEI</th><th>下载速率</th><th>时延</th><th>丢包率</th><th>业务类型</th><th>带宽</th></tr></thead><tbody>' + rows + '</tbody></table><div style="padding:10px;text-align:right;font-size:12px;">共 ' + (p.total || 0) + ' 条，第 ' + (p.page || 1) + '/' + (p.totalPages || 1) + ' 页</div></div></div>';
    };

    Pages._renderCeiClusterLocal2 = Pages.renderCeiCluster;
    Pages.renderCeiCluster = async function(container) {
        if (!window.API || !API.ceiClusterAnalysis) return this._renderCeiClusterLocal2(container);
        var dim = this._clusterDim || 'city';
        var r = await API.ceiClusterAnalysis({ dimension: dim });
        if (!r) return this._renderCeiClusterLocal2(container);
        var rows = (r.current || []).map(function(x) {
            return '<tr><td>' + h(x.name) + '</td><td>' + x.users + '</td><td>' + x.cei + '</td><td>' + x.quality_users + '</td><td>' + (x.users ? ((x.quality_users / x.users * 100).toFixed(1) + '%') : '0%') + '</td></tr>';
        }).join('');
        container.innerHTML = '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">CEI聚类分析（后端聚合）</div><div class="remote-form"><div class="form-group"><label class="form-label">分析维度</label><select class="form-select" onchange="Pages._clusterDim=this.value;Pages.renderCeiCluster(document.getElementById(\'page-cei-cluster\'))"><option value="city"' + (dim === 'city' ? ' selected' : '') + '>区域维度</option><option value="product"' + (dim === 'product' ? ' selected' : '') + '>业务类型</option><option value="olt"' + (dim === 'olt' ? ' selected' : '') + '>OLT维度</option></select></div></div></div><div class="data-table-wrapper"><table class="data-table"><thead><tr><th>聚类对象</th><th>用户数</th><th>平均CEI</th><th>质差用户</th><th>质差占比</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    };
})();

// ============ API-backed enhancements for partially completed modules ============
(function() {
    if (!window.Pages || !window.EnhancePages) return;

    function safe(v) { return String(v === undefined || v === null ? '' : v); }
    function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }

    Pages._renderKpiViewLocal = Pages.renderKpiView;
    Pages.renderKpiView = async function(container) {
        if (!window.API || !API.performanceKqi) return this._renderKpiViewLocal(container);
        var k = await API.performanceKqi();
        if (!k) return this._renderKpiViewLocal(container);
        var s = k.summary || {};
        var cityRows = (k.byCity || []).map(function(r) {
            return '<tr><td>' + safe(r.city_name) + '</td><td>' + num(r.download_speed).toFixed(1) + 'Mbps</td><td>' + num(r.latency).toFixed(1) + 'ms</td><td>' + num(r.packet_loss).toFixed(2) + '%</td><td>' + num(r.video_speed).toFixed(1) + 'Mbps</td><td>' + num(r.gaming_latency).toFixed(1) + 'ms</td></tr>';
        }).join('');
        var appRows = (k.byApp || []).map(function(r) {
            return '<tr><td>' + safe(r.app) + '</td><td>' + r.sessions + '</td><td>' + num(r.latency).toFixed(1) + 'ms</td><td>' + num(r.retransmit).toFixed(2) + '%</td><td>' + (r.quality_sessions || 0) + '</td></tr>';
        }).join('') || '<tr><td colspan="5" style="text-align:center;color:#999;padding:18px;">暂无DPI-XDR应用数据</td></tr>';
        container.innerHTML = '<div class="page-content">' +
            '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + num(s.videoSpeed).toFixed(1) + '</div><div class="wo-stat-label">TOP10视频速率(Mbps)</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + num(s.gamingLatency).toFixed(1) + '</div><div class="wo-stat-label">游戏平均时延(ms)</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + num(s.homeQuality).toFixed(1) + '</div><div class="wo-stat-label">家庭网络优良率</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + num(s.avgLatency).toFixed(1) + '</div><div class="wo-stat-label">中断/网络时延(ms)</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + num(s.packetLoss).toFixed(2) + '%</div><div class="wo-stat-label">平均丢包率</div></div>' +
            '</div><div class="remote-panel"><div class="remote-panel-title">性能/KQI分析（数据库聚合）</div><div style="font-size:12px;color:#666;margin-bottom:8px;">按需求补齐视频、游戏、家庭网络、区域和应用维度KQI统计，可接DPI/AAA数据后自动替换。</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div class="data-table-wrapper"><table class="data-table"><thead><tr><th>地市</th><th>下载速率</th><th>时延</th><th>丢包</th><th>视频速率</th><th>游戏时延</th></tr></thead><tbody>' + cityRows + '</tbody></table></div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>应用</th><th>会话数</th><th>RTT</th><th>重传率</th><th>质差会话</th></tr></thead><tbody>' + appRows + '</tbody></table></div></div></div></div>';
    };

    Pages._renderUserQualityLocal = Pages.renderUserQuality;
    Pages.renderUserQuality = async function(container, page) {
        if (!window.API || !API.qualityPortraitStats || !API.userQuality) return this._renderUserQualityLocal(container, page);
        var stats = await API.qualityPortraitStats();
        var list = await API.userQuality({ page: page || 1, pageSize: 12 });
        if (!stats || !list) return this._renderUserQualityLocal(container, page);
        var rows = (list.data || []).map(function(r) {
            return '<tr><td>' + safe(r.user_account) + '</td><td>' + safe(r.city_name) + '</td><td><span class="status-error">' + num(r.cei_score).toFixed(1) + '</span></td><td>' + safe(r.quality_type) + '</td><td>' + safe(r.duration_hours) + 'h</td><td>' + safe(r.affected_business) + '</td><td>' + Pages.statusHtml(r.status || '待处理') + '</td><td>' + safe(r.report_time) + '</td></tr>';
        }).join('') || '<tr><td colspan="8" style="text-align:center;color:#999;padding:18px;">暂无用户质差记录</td></tr>';
        var typeRows = (stats.userIssues || []).map(function(r) { return '<tr><td>' + safe(r.quality_type) + '</td><td>' + r.count + '</td><td>' + num(r.avg_cei).toFixed(1) + '</td></tr>'; }).join('');
        container.innerHTML = '<div class="page-content"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + stats.userTotal + '</div><div class="wo-stat-label">用户总数</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#e74c3c;">' + stats.qualityUsers + '</div><div class="wo-stat-label">质差用户</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + (stats.userIssues || []).length + '</div><div class="wo-stat-label">质差类型</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + (stats.cityIssues || []).length + '</div><div class="wo-stat-label">影响地市</div></div>' +
            '</div><div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;"><div class="data-table-wrapper"><table class="data-table"><thead><tr><th>用户</th><th>地市</th><th>CEI</th><th>质差类型</th><th>持续</th><th>业务</th><th>状态</th><th>上报时间</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>类型</th><th>数量</th><th>平均CEI</th></tr></thead><tbody>' + typeRows + '</tbody></table></div></div></div>';
    };

    EnhancePages.renderBoundaryAccuracy = async function(container) {
        var a = await API.boundaryAccuracy();
        if (!a) return;
        var modelRows = (a.models || []).map(function(m) {
            return '<tr><td>' + safe(m.model_code) + '</td><td>' + safe(m.model_name) + '</td><td>' + m.target_accuracy + '%</td><td>' + m.current_accuracy + '%</td></tr>';
        }).join('');
        var sideRows = (a.sides || []).map(function(s) { return '<tr><td>' + safe(s.boundary_side) + '</td><td>' + s.count + '</td><td>' + s.confidence + '%</td></tr>'; }).join('') || '<tr><td colspan="3" style="text-align:center;color:#999;padding:18px;">暂无定界结果</td></tr>';
        container.innerHTML = '<div class="page-content"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px;">' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + a.target + '%</div><div class="wo-stat-label">验收目标准确率</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value" style="color:#f39c12;">' + a.current + '%</div><div class="wo-stat-label">当前纠偏准确率</div></div>' +
            '<div class="wo-stat-card"><div class="wo-stat-value">' + ((a.feedback && a.feedback.total) || 0) + '</div><div class="wo-stat-label">人工纠偏样本</div></div>' +
            '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div class="data-table-wrapper"><table class="data-table"><thead><tr><th>模型</th><th>名称</th><th>目标</th><th>当前</th></tr></thead><tbody>' + modelRows + '</tbody></table></div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>定界侧</th><th>结果数</th><th>平均置信度</th></tr></thead><tbody>' + sideRows + '</tbody></table></div></div></div>';
    };

    Pages._renderOntPowerLocal = Pages.renderOntPower;
    Pages.realtimeOntQuery = async function() {
        var input = document.getElementById('ontSearchInput');
        var r = await API.queryOntPower({ ontId: input ? input.value.trim() : '', operator: 'admin' });
        if (r) Modal.toast('ONT实时读取完成：' + r.ontId + ' ' + r.rx_power + 'dBm', r.status === '正常' ? 'success' : 'warning');
        Pages.renderOntPower(document.getElementById('page-ont-power'), 1);
    };

    Pages._executeGatewayRestartLocal = Pages.executeGatewayRestart;
    Pages.executeGatewayRestart = async function() {
        var id = (document.getElementById('gwRestartId') || {}).value || '';
        var reason = (document.getElementById('gwRestartReason') || {}).value || '用户申报故障';
        id = id.trim();
        if (!id) return Modal.toast('请输入网关设备ID或用户账号', 'warning');
        var box = document.getElementById('gwRestartResult');
        if (box) {
            box.style.display = 'block';
            box.textContent = '正在通过RMS/网管接口下发重启指令...\n> 目标：' + id + '\n> 原因：' + reason;
        }
        var r = await API.executeRestart({ gatewayId: id, reason: reason, operator: 'admin' });
        if (!r) return this._executeGatewayRestartLocal();
        if (box) box.textContent += '\n> RMS返回：' + r.result + '\n> 耗时：' + r.duration + '\n> 已写入网关重启历史与统一审计';
        Modal.toast('网关重启完成，历史已入库', 'success');
        this.renderGatewayRestart(document.getElementById('page-gateway-restart'), 1);
    };
})();

// ============ Remote operation fixes from demo修改1-3: ONT/ONU field names and records ============
(function() {
    if (!window.Pages || !window.API) return;

    function esc(v) {
        return String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, function(ch) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
        });
    }
    function n(v) { var x = Number(v); return isFinite(x) ? x : 0; }
    function wait(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }
    function pager(p, cb) {
        if (!p || (p.totalPages || 1) <= 1) return '';
        return '<div style="display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:10px 12px;font-size:12px;">' +
            '<span>共 ' + (p.total || 0) + ' 条，第 ' + (p.page || 1) + '/' + (p.totalPages || 1) + ' 页</span>' +
            '<button class="btn" ' + ((p.page || 1) <= 1 ? 'disabled' : '') + ' onclick="' + cb + '(' + ((p.page || 1) - 1) + ')">上一页</button>' +
            '<button class="btn" ' + ((p.page || 1) >= (p.totalPages || 1) ? 'disabled' : '') + ' onclick="' + cb + '(' + ((p.page || 1) + 1) + ')">下一页</button>' +
        '</div>';
    }

    Pages.renderOntPower = async function(container, page) {
        this._ontPage = page || 1;
        var resp = await API.ontPower({ page: this._ontPage, pageSize: 12, city_name: this._ontCity || '', keyword: this._ontSearch || '' });
        if (!resp) return;
        var rows = (resp.data || []).map(function(r) {
            var rxCls = n(r.rx_power) < -25 ? 'status-error' : (n(r.rx_power) < -22 ? 'status-warning' : 'status-normal');
            var bias = n(r.bias_current);
            var biasCls = bias < 7 || bias > 30 ? 'status-error' : 'status-normal';
            return '<tr><td>' + esc(r.ont_id) + '</td><td>' + esc(r.user_account || '-') + '</td><td>' + esc(r.city_name) + '</td><td>' + esc(r.ont_model || '-') + '</td><td>' + n(r.tx_power).toFixed(1) + ' dBm</td><td><span class="' + rxCls + '">' + n(r.rx_power).toFixed(1) + ' dBm</span></td><td>' + n(r.temperature).toFixed(1) + '°C</td><td><span class="' + biasCls + '">' + bias.toFixed(1) + ' mA</span></td><td>' + Pages.statusHtml(r.status || '正常') + '</td><td>' + esc(r.query_time || '-') + '</td></tr>';
        }).join('') || '<tr><td colspan="10" style="text-align:center;color:#999;padding:18px;">暂无ONT光功率记录</td></tr>';
        container.innerHTML = '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">ONT光功率查询</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('ontCityFilter', 'Pages._ontCity=this.value;Pages.renderOntPower(document.getElementById("page-ont-power"),1)', this._ontCity) +
            '<div class="form-group"><label class="form-label">ONT设备ID/用户账号</label><input class="form-input" id="ontSearchInput" value="' + esc(this._ontSearch || '') + '" placeholder="请输入ONT设备ID或用户账号"></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages._ontSearch=document.getElementById(\'ontSearchInput\').value.trim();Pages.renderOntPower(document.getElementById(\'page-ont-power\'),1)">查询</button><button class="btn" onclick="Pages._ontCity=\'\';Pages._ontSearch=\'\';Pages.renderOntPower(document.getElementById(\'page-ont-power\'),1)">重置</button><button class="btn" id="ontReadBtn" onclick="Pages.realtimeOntQuery()">实时读取</button></div></div></div>' +
            '<div style="margin:0 0 8px 0;padding:8px 12px;background:#fff8e6;border:1px solid #f6bd16;border-radius:4px;font-size:12px;color:#666;"><strong>字段规则：</strong>ONT设备ID按16位模拟，如 HWTC123456789ABC；用户账号为11位数字且以211开头。偏置电流正常10-30mA，告警&lt;7或&gt;30mA。</div>' +
            '<div class="data-table-wrapper"><table class="data-table"><thead><tr><th>ONT设备ID</th><th>用户账号</th><th>地市</th><th>型号</th><th>发送光功率</th><th>接收光功率</th><th>温度</th><th>偏置电流</th><th>状态</th><th>读取时间</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            pager(resp.pagination, 'Pages.renderOntPower.bind(Pages,document.getElementById("page-ont-power"))') + '</div></div>';
    };

    Pages.realtimeOntQuery = async function() {
        var input = document.getElementById('ontSearchInput');
        var val = input ? input.value.trim() : '';
        if (!val) return Modal.toast('请输入ONT设备ID或用户账号', 'warning');
        var btn = document.getElementById('ontReadBtn');
        if (btn) { btn.disabled = true; btn.textContent = '查询中...'; }
        Modal.show('ONT实时读取', '<div style="padding:20px;text-align:center;color:#666;">查询中...<br><span style="font-size:12px;">正在通过OMCI/网管接口读取光功率</span></div>', '', '420px');
        await wait(1200);
        var r = await API.queryOntPower({ ontId: val, operator: 'admin' });
        Modal.close();
        if (btn) { btn.disabled = false; btn.textContent = '实时读取'; }
        if (r) Modal.toast('实时读取完成，已新增最新记录：' + r.ontId, r.status === '正常' ? 'success' : 'warning');
        this._ontSearch = val;
        this.renderOntPower(document.getElementById('page-ont-power'), 1);
    };

    Pages.renderGatewayRestart = async function(container, page) {
        this._gwPage = page || 1;
        var resp = await API.gatewayRestarts({ page: this._gwPage, pageSize: 12, city_name: this._gwCity || '', keyword: this._gwSearch || '' });
        if (!resp) return;
        var rows = (resp.data || []).map(function(r) {
            return '<tr><td>' + esc(r.restart_time || '-') + '</td><td>' + esc(r.gateway_id || '-') + '</td><td>' + esc(r.gateway_sn || '-') + '</td><td>' + esc(r.city_name || '-') + '</td><td>' + esc(r.restart_reason || '-') + '</td><td>' + esc(r.operator || '-') + '</td><td>' + Pages.statusHtml(r.result || '重启成功') + '</td><td>' + esc(r.duration_seconds || '-') + 's</td></tr>';
        }).join('') || '<tr><td colspan="8" style="text-align:center;color:#999;padding:18px;">暂无ONU重启记录</td></tr>';
        container.innerHTML = '<div class="page-content"><div class="remote-panel"><div class="remote-panel-title">网关远程重启</div>' +
            '<div class="remote-form">' + this.cityFilterHtml('gwCityFilter', 'Pages._gwCity=this.value;Pages.renderGatewayRestart(document.getElementById("page-gateway-restart"),1)', this._gwCity) +
            '<div class="form-group"><label class="form-label">ONU设备ID/用户账号</label><input class="form-input" id="gwRestartId" value="' + esc(this._gwSearch || '') + '" placeholder="请输入ONU设备ID或用户账号"></div>' +
            '<div class="form-group"><label class="form-label">重启原因</label><select class="form-select" id="gwRestartReason"><option>用户申报故障</option><option>CPU异常高</option><option>流量异常</option><option>定期维护</option><option>ONU离线</option></select></div>' +
            '<div class="form-group" style="display:flex;align-items:flex-end;gap:8px;"><button class="btn btn-primary" onclick="Pages.executeGatewayRestart()">执行重启</button><button class="btn" onclick="Pages._gwCity=\'\';Pages._gwSearch=\'\';Pages.renderGatewayRestart(document.getElementById(\'page-gateway-restart\'),1)">重置</button><button class="btn" onclick="Pages.batchRestart()">批量重启</button></div></div>' +
            '<div id="gwRestartResult" style="display:none;" class="ping-result"></div></div>' +
            '<div class="data-table-wrapper"><div style="padding:10px 16px;font-weight:600;font-size:13px;border-bottom:1px solid #e0e4e8;">重启记录（按时间倒序）</div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>ONU设备ID</th><th>用户账号</th><th>地市</th><th>重启原因</th><th>操作人</th><th>结果</th><th>耗时</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            pager(resp.pagination, 'Pages.renderGatewayRestart.bind(Pages,document.getElementById("page-gateway-restart"))') + '</div></div>';
    };

    Pages.executeGatewayRestart = async function() {
        var id = (document.getElementById('gwRestartId') || {}).value || '';
        var reason = (document.getElementById('gwRestartReason') || {}).value || '用户申报故障';
        id = id.trim();
        if (!id) return Modal.toast('请输入ONU设备ID或用户账号', 'warning');
        this._gwSearch = id;
        var box = document.getElementById('gwRestartResult');
        if (box) { box.style.display = 'block'; box.textContent = '正在通过RMS/网管接口下发重启指令...\n> 目标：' + id + '\n> 原因：' + reason; }
        var r = await API.executeRestart({ gatewayId: id, reason: reason, operator: 'admin' });
        if (box && r) box.textContent += '\n> 返回：' + r.result + '\n> ONU设备ID：' + (r.onu_id || r.gateway_id) + '\n> 用户账号：' + (r.user_account || '-') + '\n> 已写入重启历史';
        if (r) Modal.toast('重启完成，记录已按时间倒序写入', 'success');
        this.renderGatewayRestart(document.getElementById('page-gateway-restart'), 1);
    };

    Pages.batchRestart = function() {
        Modal.show('批量重启',
            '<div class="form-group"><label class="form-label">ONU设备ID列表（每行一个，16位）</label><textarea id="batchGwIds" style="width:100%;height:120px;border:1px solid #e0e4e8;border-radius:2px;padding:8px;font-size:12px;resize:vertical;" placeholder="请输入ONU设备ID，每行一个"></textarea></div>' +
            '<div class="form-group"><label class="form-label">重启原因</label><select class="form-select" id="batchReason"><option>定期维护</option><option>批量故障恢复</option><option>系统升级</option></select></div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Pages.doBatchRestart()">确认批量重启</button>',
            '520px');
    };

    Pages.doBatchRestart = async function() {
        var ids = ((document.getElementById('batchGwIds') || {}).value || '').split(/\r?\n/).map(function(s) { return s.trim(); }).filter(Boolean);
        if (!ids.length) return Modal.toast('请输入ONU设备ID', 'warning');
        var reason = (document.getElementById('batchReason') || {}).value || '批量故障恢复';
        var ok = 0;
        for (var i = 0; i < ids.length; i++) {
            var r = await API.executeRestart({ gatewayId: ids[i], reason: reason, restartType: '批量重启', operator: 'admin' });
            if (r) ok++;
        }
        Modal.close();
        Modal.toast('批量重启完成：' + ok + '/' + ids.length + ' 条已入库', ok === ids.length ? 'success' : 'warning');
        this._gwSearch = '';
        this.renderGatewayRestart(document.getElementById('page-gateway-restart'), 1);
    };
})();

// ============ Platform completion pages: connectors / AI / reports / permissions / audits ============
(function() {
    if (!window.EnhancePages) return;

    function esc(v) {
        return String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, function(ch) {
            return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
        });
    }
    function parseJson(v) {
        try { return v ? JSON.parse(v) : {}; } catch(e) { return {}; }
    }
    function pageWrap(title, body) {
        return '<div class="page-content"><div class="system-panel"><div class="system-panel-header"><span class="system-panel-title">' + title + '</span></div><div class="system-panel-body">' + body + '</div></div></div>';
    }
    function pager(p, cb) {
        if (!p || (p.totalPages || 1) <= 1) return '';
        return '<div style="display:flex;justify-content:flex-end;gap:8px;padding:10px;font-size:12px;">' +
            '<span>共 ' + (p.total || 0) + ' 条，第 ' + p.page + '/' + p.totalPages + ' 页</span>' +
            '<button class="btn" ' + (p.page <= 1 ? 'disabled' : '') + ' onclick="' + cb + '(' + (p.page - 1) + ')">上一页</button>' +
            '<button class="btn" ' + (p.page >= p.totalPages ? 'disabled' : '') + ' onclick="' + cb + '(' + (p.page + 1) + ')">下一页</button>' +
        '</div>';
    }

    EnhancePages.renderIntegrationCenter = async function(container) {
        var connectors = (window.API && API.externalConnectors) ? await API.externalConnectors() : [];
        var logs = (window.API && API.externalSyncLogs) ? await API.externalSyncLogs({ page: 1, pageSize: 8 }) : { data: [], pagination: {} };
        var rows = (connectors || []).map(function(c) {
            return '<tr><td>' + esc(c.connector_code) + '</td><td>' + esc(c.connector_name) + '</td><td>' + esc(c.connector_type) + '</td><td>' + esc(c.protocol) + '</td><td>' + esc(c.endpoint_url) + '</td><td>' + Pages.statusHtml(c.status || '模拟可用') + '</td><td>' + (c.last_sync_time || '-') + '</td><td>' + (c.success_count || 0) + '/' + (c.fail_count || 0) + '</td><td><button class="btn btn-primary" onclick="EnhancePages.syncConnector(\'' + esc(c.connector_code) + '\')">模拟同步</button></td></tr>';
        }).join('');
        var logRows = ((logs && logs.data) || []).map(function(l) {
            return '<tr><td>' + esc(l.sync_time) + '</td><td>' + esc(l.connector_code) + '</td><td>' + esc(l.data_type) + '</td><td>' + esc(l.source_file) + '</td><td>' + l.success_rows + '/' + l.total_rows + '</td><td>' + Pages.statusHtml(l.status === 'success' ? '正常' : '告警') + '</td><td>' + esc(l.message) + '</td></tr>';
        }).join('') || '<tr><td colspan="7" style="text-align:center;color:#999;padding:18px;">暂无同步记录</td></tr>';
        container.innerHTML = pageWrap('外部接口管理（模拟连接器）',
            '<div style="margin-bottom:10px;color:#666;font-size:12px;">DPI、AAA、RMS、OMCI、综合网管、SFTP/Result 文件接口已按模拟模式建档，后续拿到客户地址和账号后替换适配器即可。</div>' +
            '<table class="data-table"><thead><tr><th>编码</th><th>系统</th><th>类型</th><th>协议</th><th>地址</th><th>状态</th><th>最近同步</th><th>成功/失败</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            '<div style="height:12px;"></div><div style="font-weight:600;margin-bottom:8px;">Result/SFTP/API同步记录</div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>连接器</th><th>数据类型</th><th>来源文件</th><th>成功/总数</th><th>状态</th><th>说明</th></tr></thead><tbody>' + logRows + '</tbody></table>');
    };

    EnhancePages.syncConnector = async function(code) {
        var r = await API.syncConnector(code, { data_type: code + '-mock' });
        if (r) Modal.toast(code + ' 模拟同步完成：' + r.importedRows + ' 条', 'success');
        this.renderIntegrationCenter(document.getElementById('page-integration-center'));
    };

    EnhancePages.renderAiModelCenter = async function(container) {
        var models = (window.API && API.aiModels) ? await API.aiModels() : [];
        var fb = (window.API && API.modelFeedback) ? await API.modelFeedback({ page: 1, pageSize: 8 }) : { data: [] };
        var rows = (models || []).map(function(m) {
            var weights = parseJson(m.weight_json);
            var ws = Object.keys(weights).map(function(k) { return k + ':' + weights[k]; }).join(' / ');
            return '<tr><td>' + esc(m.model_code) + '</td><td>' + esc(m.model_name) + '</td><td>' + esc(m.model_type) + '</td><td>' + esc(m.version) + '</td><td>' + (m.target_accuracy || 85) + '%</td><td><span class="' + (Number(m.current_accuracy || 0) >= Number(m.target_accuracy || 85) ? 'status-normal' : 'status-warning') + '">' + (m.current_accuracy || 0) + '%</span></td><td style="font-size:11px;">' + esc(ws) + '</td><td><button class="btn" onclick="EnhancePages.submitMockFeedback(\'' + esc(m.model_code) + '\',true)">正确反馈</button><button class="btn" onclick="EnhancePages.submitMockFeedback(\'' + esc(m.model_code) + '\',false)">纠偏</button></td></tr>';
        }).join('');
        var fbRows = ((fb && fb.data) || []).map(function(f) {
            return '<tr><td>' + esc(f.created_at) + '</td><td>' + esc(f.model_code) + '</td><td>' + esc(f.predicted_label) + '</td><td>' + esc(f.corrected_label) + '</td><td>' + Pages.statusHtml(f.is_correct ? '正常' : '告警') + '</td><td>' + esc(f.reviewer) + '</td><td>' + esc(f.comment) + '</td></tr>';
        }).join('') || '<tr><td colspan="7" style="text-align:center;color:#999;padding:18px;">暂无人工纠偏记录</td></tr>';
        container.innerHTML = pageWrap('AI模型闭环（模拟训练与人工纠偏）',
            '<div style="margin-bottom:10px;color:#666;font-size:12px;">当前提供模型定义、权重、目标准确率、人工纠偏记录和准确率回写；真实训练服务可后续接入。</div>' +
            '<table class="data-table"><thead><tr><th>模型编码</th><th>名称</th><th>类型</th><th>版本</th><th>目标准确率</th><th>当前准确率</th><th>权重</th><th>反馈</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            '<div style="height:12px;"></div><div style="font-weight:600;margin-bottom:8px;">人工纠偏/自学习记录</div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>模型</th><th>预测</th><th>修正</th><th>结果</th><th>审核人</th><th>备注</th></tr></thead><tbody>' + fbRows + '</tbody></table>');
    };

    EnhancePages.submitMockFeedback = async function(modelCode, correct) {
        var r = await API.submitModelFeedback({ model_code: modelCode, source_record_id: 'SIM-' + Date.now(), predicted_label: correct ? '网络侧' : '网络侧', corrected_label: correct ? '网络侧' : '光路侧', is_correct: correct, confidence: 86, reviewer: 'admin', comment: correct ? '抽检正确' : '人工纠偏样本' });
        if (r) Modal.toast('反馈已保存，当前准确率 ' + r.currentAccuracy + '%', 'success');
        this.renderAiModelCenter(document.getElementById('page-ai-model-center'));
    };

    EnhancePages.renderReportCenter = async function(container, page) {
        page = page || 1;
        var reports = (window.API && API.reports) ? await API.reports({ page: page, pageSize: 10 }) : { data: [], pagination: {} };
        var rows = ((reports && reports.data) || []).map(function(r) {
            var s = parseJson(r.summary_json);
            var file = r.file_name ? '<a class="btn" href="/reports/' + esc(r.file_name) + '" download>下载文件</a>' : '<button class="btn" onclick="EnhancePages.exportReportCsv(\'' + esc(r.report_id) + '\')">导出CSV</button>';
            return '<tr><td>' + esc(r.generated_at) + '</td><td>' + esc(r.report_type) + '</td><td>' + esc(r.report_name) + '</td><td>' + esc(r.period_start) + ' ~ ' + esc(r.period_end) + '</td><td>' + (s.xdrTotal || 0) + '</td><td>' + (s.qualityTags || 0) + '</td><td>' + (s.workOrders || 0) + '</td><td>' + (s.boundaryAccuracy || 0) + '%</td><td>' + file + '</td></tr>';
        }).join('') || '<tr><td colspan="9" style="text-align:center;color:#999;padding:18px;">暂无报表，请先生成</td></tr>';
        container.innerHTML = pageWrap('报表中心（日/周/月报）',
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px;padding:10px 12px;background:#f8fafc;border:1px solid #e0e4e8;border-radius:4px;">' +
            '<div style="font-size:12px;color:#666;">生成后会在服务器 <code>reports/</code> 目录落 CSV 文件，列表中的“下载文件”会直接下载真实文件。</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-primary" onclick="EnhancePages.generateReport(\'daily\')">生成日报</button><button class="btn" onclick="EnhancePages.generateReport(\'weekly\')">生成周报</button><button class="btn" onclick="EnhancePages.generateReport(\'monthly\')">生成月报</button></div></div>' +
            '<div style="overflow-x:auto;"><table class="data-table"><thead><tr><th>生成时间</th><th>类型</th><th>名称</th><th>周期</th><th>xDR</th><th>质差标签</th><th>工单</th><th>模型准确率</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + pager(reports.pagination, 'EnhancePages.renderReportPage'));
    };
    EnhancePages.renderReportPage = function(page) { this.renderReportCenter(document.getElementById('page-report-center'), page); };
    EnhancePages.generateReport = async function(type) {
        var r = await API.generateReport({ report_type: type, generated_by: 'admin' });
        if (r) Modal.toast('报表已生成文件：' + (r.fileName || r.reportId), 'success');
        this.renderReportCenter(document.getElementById('page-report-center'), 1);
    };
    EnhancePages.exportReportCsv = function(reportId) {
        var csv = 'report_id,export_time\n' + reportId + ',' + new Date().toISOString() + '\n';
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = reportId + '.csv'; a.click(); URL.revokeObjectURL(a.href);
    };

    EnhancePages.renderPermissionCenter = async function(container) {
        var rows = (await API.permissions() || []).map(function(p) {
            return '<tr><td>' + esc(p.role) + '</td><td>' + esc(p.module) + '</td><td>' + esc(p.actions) + '</td><td>' + esc(p.data_scope) + '</td></tr>';
        }).join('');
        container.innerHTML = pageWrap('权限矩阵（角色/菜单/按钮/数据范围）',
            '<div style="margin-bottom:10px;color:#666;font-size:12px;">权限已落库，支持角色、模块动作和数据范围配置；后续可接登录态做前端按钮控制和后端鉴权。</div>' +
            '<div style="display:flex;gap:8px;margin-bottom:10px;"><input class="form-input" id="permRole" placeholder="角色，如 operator"><input class="form-input" id="permModule" placeholder="模块，如 quality-analysis"><input class="form-input" id="permActions" placeholder="动作，如 view,export"><select class="form-select" id="permScope"><option>city</option><option>province</option><option>grid</option><option>self</option></select><button class="btn btn-primary" onclick="EnhancePages.savePermission()">保存</button></div>' +
            '<table class="data-table"><thead><tr><th>角色</th><th>模块</th><th>动作</th><th>数据范围</th></tr></thead><tbody>' + rows + '</tbody></table>');
    };
    EnhancePages.savePermission = async function() {
        var p = { role: document.getElementById('permRole').value.trim(), module: document.getElementById('permModule').value.trim(), actions: document.getElementById('permActions').value.trim(), data_scope: document.getElementById('permScope').value };
        if (!p.role || !p.module) return Modal.toast('角色和模块必填', 'warning');
        var r = await API.savePermission(p);
        if (r) Modal.toast('权限已保存', 'success');
        this.renderPermissionCenter(document.getElementById('page-permission-center'));
    };

    EnhancePages.renderAuditCenter = async function(container, page) {
        page = page || 1;
        var resp = await API.unifiedAudits({ page: page, pageSize: 12, module: this._auditModule || '' });
        var rows = ((resp && resp.data) || []).map(function(a) {
            return '<tr><td>' + esc(a.event_time) + '</td><td>' + esc(a.module) + '</td><td>' + esc(a.entity_type) + '</td><td>' + esc(a.entity_id) + '</td><td>' + esc(a.action) + '</td><td>' + esc(a.operator) + '</td><td>' + Pages.statusHtml(a.result || '成功') + '</td></tr>';
        }).join('') || '<tr><td colspan="7" style="text-align:center;color:#999;padding:18px;">暂无统一审计记录</td></tr>';
        container.innerHTML = pageWrap('统一审计中心',
            '<div style="display:flex;gap:8px;margin-bottom:10px;"><select class="form-select" id="auditModuleFilter" onchange="EnhancePages._auditModule=this.value;EnhancePages.renderAuditCenter(document.getElementById(\'page-audit-center\'),1)"><option value="">全部模块</option><option>外部系统</option><option>AI模型</option><option>报表中心</option><option>权限体系</option></select></div>' +
            '<table class="data-table"><thead><tr><th>时间</th><th>模块</th><th>对象类型</th><th>对象ID</th><th>动作</th><th>操作人</th><th>结果</th></tr></thead><tbody>' + rows + '</tbody></table>' + pager(resp.pagination, 'EnhancePages.renderAuditPage'));
    };
    EnhancePages.renderAuditPage = function(page) { this.renderAuditCenter(document.getElementById('page-audit-center'), page); };
})();
