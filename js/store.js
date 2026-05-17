/**
 * 家宽网络质量分析平台 - 本地数据存储模块
 * 提供基于localStorage的增删改查能力，模拟真实数据交互
 */

var DataStore = {
    // ========== 通用存储方法 ==========
    _getKey: function(module) { return 'hk_' + module; },

    load: function(module, defaultData) {
        try {
            var raw = localStorage.getItem(this._getKey(module));
            if (raw) return JSON.parse(raw);
        } catch(e) { console.warn('DataStore load error:', e); }
        if (defaultData) { this.save(module, defaultData); return defaultData; }
        return [];
    },

    save: function(module, data) {
        try { localStorage.setItem(this._getKey(module), JSON.stringify(data)); }
        catch(e) { console.warn('DataStore save error:', e); }
    },

    // 新增记录
    add: function(module, record) {
        var data = this.load(module, []);
        record._id = 'R' + Date.now() + Math.random().toString(36).substr(2, 4);
        record._createTime = new Date().toLocaleString('zh-CN');
        data.unshift(record);
        this.save(module, data);
        this.addLog('新增', module, '新增记录: ' + (record.name || record.title || record.username || record._id));
        return record;
    },

    // 更新记录
    update: function(module, id, updates) {
        var data = this.load(module, []);
        for (var i = 0; i < data.length; i++) {
            if (data[i]._id === id || data[i].id === id) {
                for (var k in updates) { data[i][k] = updates[k]; }
                data[i]._updateTime = new Date().toLocaleString('zh-CN');
                this.save(module, data);
                this.addLog('修改', module, '修改记录: ' + id);
                return data[i];
            }
        }
        return null;
    },

    // 删除记录
    remove: function(module, id) {
        var data = this.load(module, []);
        var newData = data.filter(function(d) { return d._id !== id && d.id !== id; });
        if (newData.length < data.length) {
            this.save(module, newData);
            this.addLog('删除', module, '删除记录: ' + id);
            return true;
        }
        return false;
    },

    // 查询（支持筛选）
    query: function(module, filters) {
        var data = this.load(module, []);
        if (!filters) return data;
        return data.filter(function(item) {
            for (var key in filters) {
                if (!filters[key]) continue;
                if (key === '_keyword') {
                    var kw = filters[key].toLowerCase();
                    var found = false;
                    for (var f in item) {
                        if (String(item[f]).toLowerCase().indexOf(kw) >= 0) { found = true; break; }
                    }
                    if (!found) return false;
                } else {
                    if (String(item[key]) !== String(filters[key])) return false;
                }
            }
            return true;
        });
    },

    // ========== 操作日志 ==========
    addLog: function(action, module, content) {
        var logs = this.load('logs', []);
        logs.unshift({
            _id: 'LOG' + Date.now(),
            time: new Date().toLocaleString('zh-CN'),
            operator: DataStore._currentUser || 'admin',
            ip: '10.168.1.' + Math.floor(Math.random() * 200 + 1),
            module: module,
            action: action,
            content: content,
            result: '成功'
        });
        // 保留最近500条
        if (logs.length > 500) logs = logs.slice(0, 500);
        this.save('logs', logs);
    },

    _currentUser: 'admin',

    // ========== 初始化默认数据 ==========
    initDefaults: function() {
        // 系统用户
        if (!localStorage.getItem(this._getKey('users'))) {
            this.save('users', [
                { _id: 'U001', id: '001', username: 'admin', realName: '系统管理员', role: '系统管理员', city: '全省', department: '信息技术部', phone: '13800000001', email: 'admin@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-02 14:20:05', loginCount: 256 },
                { _id: 'U002', id: '002', username: 'cc_admin', realName: '长春管理员', role: '地市管理员', city: '长春', department: '网络运维部', phone: '13800000002', email: 'cc_admin@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-02 13:45:22', loginCount: 189 },
                { _id: 'U003', id: '003', username: 'jl_admin', realName: '吉林管理员', role: '地市管理员', city: '吉林', department: '网络运维部', phone: '13800000003', email: 'jl_admin@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-02 12:30:18', loginCount: 145 },
                { _id: 'U004', id: '004', username: 'sp_operator', realName: '四平运维', role: '运维人员', city: '四平', department: '装维中心', phone: '13800000004', email: 'sp_op@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-01 16:20:33', loginCount: 98 },
                { _id: 'U005', id: '005', username: 'ly_operator', realName: '辽源运维', role: '运维人员', city: '辽源', department: '装维中心', phone: '13800000005', email: 'ly_op@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-01 09:15:42', loginCount: 76 },
                { _id: 'U006', id: '006', username: 'th_operator', realName: '通化运维', role: '运维人员', city: '通化', department: '装维中心', phone: '13800000006', email: 'th_op@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-11-30 17:22:11', loginCount: 62 },
                { _id: 'U007', id: '007', username: 'viewer01', realName: '只读用户', role: '只读用户', city: '全省', department: '市场部', phone: '13800000007', email: 'viewer@jl.chinatelecom.cn', status: '禁用', lastLogin: '2025-11-28 09:15:00', loginCount: 23 },
                { _id: 'U008', id: '008', username: 'bs_admin', realName: '白山管理员', role: '地市管理员', city: '白山', department: '网络运维部', phone: '13800000008', email: 'bs_admin@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-02 10:05:33', loginCount: 112 },
                { _id: 'U009', id: '009', username: 'sy_operator', realName: '松原运维', role: '运维人员', city: '松原', department: '装维中心', phone: '13800000009', email: 'sy_op@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-02 08:30:15', loginCount: 88 },
                { _id: 'U010', id: '010', username: 'yb_admin', realName: '延边管理员', role: '地市管理员', city: '延边', department: '网络运维部', phone: '13800000010', email: 'yb_admin@jl.chinatelecom.cn', status: '启用', lastLogin: '2025-12-02 11:45:28', loginCount: 134 }
            ]);
        }

        // 系统配置
        if (!localStorage.getItem(this._getKey('configs'))) {
            this.save('configs', [
                { _id: 'C001', category: 'CEI评估', key: 'cei_business_weight', name: '业务CEI权重', value: '0.6', unit: '', desc: '业务CEI在综合评分中的权重系数', updatedBy: 'admin', updatedAt: '2025-11-20 10:00:00' },
                { _id: 'C002', category: 'CEI评估', key: 'cei_network_weight', name: '网络CEI权重', value: '0.4', unit: '', desc: '网络CEI在综合评分中的权重系数', updatedBy: 'admin', updatedAt: '2025-11-20 10:00:00' },
                { _id: 'C003', category: '质差阈值', key: 'quality_cei_threshold', name: '质差CEI阈值', value: '80', unit: '分', desc: '低于此CEI分数判定为质差用户', updatedBy: 'admin', updatedAt: '2025-11-15 14:30:00' },
                { _id: 'C004', category: '质差阈值', key: 'quality_latency_threshold', name: '时延质差阈值', value: '50', unit: 'ms', desc: '超过此时延判定为高时延质差', updatedBy: 'admin', updatedAt: '2025-11-15 14:30:00' },
                { _id: 'C005', category: '质差阈值', key: 'quality_loss_threshold', name: '丢包率质差阈值', value: '5', unit: '%', desc: '超过此丢包率判定为丢包质差', updatedBy: 'admin', updatedAt: '2025-11-15 14:30:00' },
                { _id: 'C006', category: '质差阈值', key: 'quality_rx_power_threshold', name: '光功率质差阈值', value: '-25', unit: 'dBm', desc: '接收光功率低于此值判定为弱光质差', updatedBy: 'admin', updatedAt: '2025-11-18 09:00:00' },
                { _id: 'C007', category: '工单规则', key: 'work_order_timeout', name: '工单超时时长', value: '24', unit: '小时', desc: '工单处理超过此时长触发超时告警', updatedBy: 'admin', updatedAt: '2025-11-22 16:00:00' },
                { _id: 'C008', category: '工单规则', key: 'work_order_dispatch_mode', name: '工单派发模式', value: '自动按区域', unit: '', desc: '根据用户所属地市自动派发至对应运维人员', updatedBy: 'admin', updatedAt: '2025-11-22 16:00:00' },
                { _id: 'C009', category: '工单规则', key: 'work_order_auto_close_days', name: '工单自动关闭天数', value: '7', unit: '天', desc: '已解决工单超过此天数自动关闭', updatedBy: 'admin', updatedAt: '2025-11-22 16:00:00' },
                { _id: 'C010', category: '系统参数', key: 'data_retention_days', name: '数据保留天数', value: '90', unit: '天', desc: '历史数据保留天数，超过自动清理', updatedBy: 'admin', updatedAt: '2025-11-10 08:00:00' },
                { _id: 'C011', category: '系统参数', key: 'alert_notification_enabled', name: '告警通知开关', value: '开启', unit: '', desc: '是否开启告警短信/邮件通知', updatedBy: 'admin', updatedAt: '2025-11-25 11:00:00' },
                { _id: 'C012', category: '系统参数', key: 'session_timeout', name: '会话超时时间', value: '30', unit: '分钟', desc: '用户无操作超过此时间自动退出', updatedBy: 'admin', updatedAt: '2025-11-10 08:00:00' },
                // DPI-XDR 阈值
                { _id: 'C013', category: 'DPI-XDR阈值', key: 'dpi_http_first_packet_threshold', name: 'HTTP首包时延阈值', value: '200', unit: 'ms', desc: 'HTTP首包响应时延超过此值判定为业务质差', updatedBy: 'admin', updatedAt: '2025-11-28 09:00:00' },
                { _id: 'C014', category: 'DPI-XDR阈值', key: 'dpi_dns_resolve_threshold', name: 'DNS解析时延阈值', value: '50', unit: 'ms', desc: 'DNS解析时延超过此值判定为DNS异常', updatedBy: 'admin', updatedAt: '2025-11-28 09:00:00' },
                { _id: 'C015', category: 'DPI-XDR阈值', key: 'dpi_tcp_retransmit_threshold', name: 'TCP重传率阈值', value: '2', unit: '%', desc: 'TCP重传率超过此值判定为网络质差', updatedBy: 'admin', updatedAt: '2025-11-28 09:00:00' },
                { _id: 'C016', category: 'DPI-XDR阈值', key: 'dpi_video_stall_threshold', name: '视频卡顿率阈值', value: '3', unit: '%', desc: 'IPTV/OTT视频卡顿率超过此值触发质差标记', updatedBy: 'admin', updatedAt: '2025-11-28 09:00:00' },
                // 质差标签规则
                { _id: 'C017', category: '质差标签', key: 'tag_weak_light_threshold', name: '弱光判定阈值', value: '-25', unit: 'dBm', desc: '接收光功率低于此值自动标记为"弱光"标签', updatedBy: 'admin', updatedAt: '2025-11-25 10:00:00' },
                { _id: 'C018', category: '质差标签', key: 'tag_high_ber_threshold', name: '高误码判定阈值', value: '1e-6', unit: '', desc: '误码率高于此值自动标记为"高误码"标签', updatedBy: 'admin', updatedAt: '2025-11-25 10:00:00' },
                { _id: 'C019', category: '质差标签', key: 'tag_frequent_disconnect_count', name: '频繁掉线次数阈值', value: '3', unit: '次/天', desc: '每日掉线超过此次数标记为"频繁掉线"', updatedBy: 'admin', updatedAt: '2025-11-25 10:00:00' },
                { _id: 'C020', category: '质差标签', key: 'tag_dying_gasp_window', name: 'dying-gasp判定窗口', value: '5', unit: '分钟', desc: '检测到dying-gasp后此时间窗口内判定掉电', updatedBy: 'admin', updatedAt: '2025-11-25 10:00:00' },
                // CEI定界参数
                { _id: 'C021', category: 'CEI定界', key: 'boundary_home_latency_threshold', name: '家庭侧时延阈值', value: '30', unit: 'ms', desc: '网关到用户终端时延超过此值定界为家庭侧', updatedBy: 'admin', updatedAt: '2025-11-26 14:00:00' },
                { _id: 'C022', category: 'CEI定界', key: 'boundary_network_loss_threshold', name: '网络侧丢包阈值', value: '1', unit: '%', desc: '骨干网丢包率超过此值定界为网络侧', updatedBy: 'admin', updatedAt: '2025-11-26 14:00:00' },
                { _id: 'C023', category: 'CEI定界', key: 'boundary_content_response_threshold', name: '内容侧响应阈值', value: '500', unit: 'ms', desc: '内容源响应时延超过此值定界为内容侧', updatedBy: 'admin', updatedAt: '2025-11-26 14:00:00' },
                { _id: 'C024', category: 'CEI定界', key: 'boundary_auto_dispatch_enabled', name: '定界自动派单', value: '开启', unit: '', desc: '定界完成后是否自动生成工单并派发', updatedBy: 'admin', updatedAt: '2025-11-26 14:00:00' }
            ]);
        }

        // 初始化日志
        if (!localStorage.getItem(this._getKey('logs'))) {
            this.save('logs', [
                { _id: 'LOG001', time: '2025-12-02 14:30:25', operator: 'admin', ip: '10.168.1.100', module: '远程操作', action: 'PING测试', content: '对10.168.1.1执行PING测试，包大小64B，次数10', result: '成功' },
                { _id: 'LOG002', time: '2025-12-02 14:28:10', operator: 'cc_admin', ip: '10.168.1.101', module: '质量画像', action: 'CEI查询', content: '查询用户JL20250001的CEI评分详情', result: '成功' },
                { _id: 'LOG003', time: '2025-12-02 14:25:33', operator: 'admin', ip: '10.168.1.100', module: '远程操作', action: '网关重启', content: '远程重启网关GW-SP-00128，原因：用户申报故障', result: '失败' },
                { _id: 'LOG004', time: '2025-12-02 14:22:18', operator: 'jl_admin', ip: '10.168.2.50', module: '工单管理', action: '工单派发', content: '派发工单WO-2025120200125至张工', result: '成功' },
                { _id: 'LOG005', time: '2025-12-02 14:20:05', operator: 'admin', ip: '10.168.1.100', module: '系统管理', action: '登录', content: '系统管理员admin登录系统', result: '成功' },
                { _id: 'LOG006', time: '2025-12-02 13:55:42', operator: 'sp_operator', ip: '10.168.3.25', module: '远程操作', action: 'ONT查询', content: '查询ONT-SP-00156光功率信息', result: '成功' },
                { _id: 'LOG007', time: '2025-12-02 13:48:15', operator: 'admin', ip: '10.168.1.100', module: '配置中心', action: '修改配置', content: '修改质差CEI阈值从75调整为80', result: '成功' },
                { _id: 'LOG008', time: '2025-12-02 13:30:08', operator: 'cc_admin', ip: '10.168.1.101', module: '工单管理', action: '工单处理', content: '处理工单WO-2025120100089，标记为已解决', result: '成功' },
                { _id: 'LOG009', time: '2025-12-02 12:15:33', operator: 'jl_admin', ip: '10.168.2.50', module: '质差识别', action: '质差分析', content: '执行吉林市用户质差聚类分析', result: '成功' },
                { _id: 'LOG010', time: '2025-12-02 11:45:20', operator: 'admin', ip: '10.168.1.100', module: '用户管理', action: '新增用户', content: '新增运维人员账号bc_operator', result: '成功' },
                { _id: 'LOG011', time: '2025-12-02 10:30:15', operator: 'admin', ip: '10.168.1.100', module: '系统管理', action: '密码重置', content: '重置用户viewer01的登录密码', result: '成功' },
                { _id: 'LOG012', time: '2025-12-02 09:20:08', operator: 'ly_operator', ip: '10.168.4.18', module: '远程操作', action: 'PING测试', content: '对10.172.55.1执行PING测试', result: '成功' },
                { _id: 'LOG013', time: '2025-12-01 17:45:33', operator: 'admin', ip: '10.168.1.100', module: '配置中心', action: '修改配置', content: '修改工单超时时长从48小时调整为24小时', result: '成功' },
                { _id: 'LOG014', time: '2025-12-01 16:20:18', operator: 'th_operator', ip: '10.168.5.30', module: '工单管理', action: '工单创建', content: '创建工单：用户JL20250088宽带无法上网', result: '成功' },
                { _id: 'LOG015', time: '2025-12-01 15:10:42', operator: 'admin', ip: '10.168.1.100', module: '用户管理', action: '禁用账号', content: '禁用用户viewer01的系统访问权限', result: '成功' }
            ]);
        }
    }
};

// 初始化
DataStore.initDefaults();

// ========== 弹窗管理器 ==========
var Modal = {
    _confirmHandlers: {},
    show: function(title, bodyHtml, footerHtml, width) {
        this.close(); // 关闭已有弹窗
        var w = width || '600px';
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.id = 'globalModal';
        overlay.innerHTML =
            '<div class="modal" style="width:' + w + ';">' +
                '<div class="modal-header"><span class="modal-title">' + title + '</span><span class="modal-close" onclick="Modal.close()">✕</span></div>' +
                '<div class="modal-body">' + bodyHtml + '</div>' +
                (footerHtml ? '<div class="modal-footer">' + footerHtml + '</div>' : '') +
            '</div>';
        document.body.appendChild(overlay);
        // 点击遮罩关闭
        overlay.addEventListener('click', function(e) { if (e.target === overlay) Modal.close(); });
    },

    close: function() {
        var el = document.getElementById('globalModal');
        if (el) el.remove();
    },

    confirm: function(title, message, onConfirm) {
        var handlerId = 'confirm_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        this._confirmHandlers[handlerId] = onConfirm;
        this.show(title,
            '<div style="padding:10px 0;font-size:13px;color:#333;">' + message + '</div>',
            '<button class="btn" onclick="Modal.close()">取消</button><button class="btn btn-primary" onclick="Modal.runConfirm(\'' + handlerId + '\')">确定</button>',
            '420px'
        );
    },

    runConfirm: function(handlerId) {
        var handler = this._confirmHandlers[handlerId];
        delete this._confirmHandlers[handlerId];
        this.close();
        if (typeof handler === 'function') handler();
    },

    alert: function(title, message) {
        this.show(title,
            '<div style="padding:10px 0;font-size:13px;color:#333;">' + message + '</div>',
            '<button class="btn btn-primary" onclick="Modal.close()">确定</button>',
            '380px'
        );
    },

    toast: function(message, type) {
        var existing = document.getElementById('globalToast');
        if (existing) existing.remove();
        var colors = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#2b7de9' };
        var color = colors[type || 'success'] || colors.success;
        var toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:' + color + ';color:#fff;padding:10px 24px;border-radius:4px;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 2500);
    }
};
