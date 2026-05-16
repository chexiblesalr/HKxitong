-- ============================================================
-- 家宽网络质量分析平台 - 数据库Schema (SQLite)
-- 吉林省宽带网络质量监控与分析系统
-- 版本: v2.0.0
-- 创建日期: 2025-11-01
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ============ 基础数据表 ============

-- 地市/区域表
CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_code VARCHAR(10) NOT NULL UNIQUE,
    city_name VARCHAR(50) NOT NULL,
    province VARCHAR(50) DEFAULT '吉林省',
    longitude DECIMAL(10,6),
    latitude DECIMAL(10,6),
    population_wan DECIMAL(8,2) COMMENT '人口(万)',
    broadband_coverage DECIMAL(5,2) COMMENT '宽带覆盖率(%)',
    sort_order INTEGER DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 区县表
CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    district_code VARCHAR(10) NOT NULL,
    district_name VARCHAR(50) NOT NULL,
    longitude DECIMAL(10,6),
    latitude DECIMAL(10,6),
    status TINYINT DEFAULT 1,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- 系统用户表
CREATE TABLE IF NOT EXISTS system_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    real_name VARCHAR(50),
    role VARCHAR(30) NOT NULL DEFAULT 'viewer',
    city_id INTEGER,
    department VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    status TINYINT DEFAULT 1,
    last_login_at DATETIME,
    last_login_ip VARCHAR(50),
    login_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- ============ 设备管理表 ============

-- BRAS设备表
CREATE TABLE IF NOT EXISTS bras_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_name VARCHAR(50) NOT NULL UNIQUE,
    city_id INTEGER NOT NULL,
    district_id INTEGER,
    model VARCHAR(50),
    vendor VARCHAR(50),
    ip_address VARCHAR(50),
    loopback_ip VARCHAR(50),
    online_users INTEGER DEFAULT 0,
    max_users INTEGER DEFAULT 200000,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    uplink_bandwidth VARCHAR(20),
    uplink_utilization DECIMAL(5,2),
    cei_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT '正常',
    uptime_days INTEGER DEFAULT 0,
    firmware_version VARCHAR(50),
    location VARCHAR(200),
    installed_at DATE,
    last_inspect_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_bras_city ON bras_devices(city_id);
CREATE INDEX idx_bras_status ON bras_devices(status);

-- OLT设备表
CREATE TABLE IF NOT EXISTS olt_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(100),
    city_id INTEGER NOT NULL,
    district_id INTEGER,
    bras_id INTEGER,
    model VARCHAR(50),
    vendor VARCHAR(50),
    ip_address VARCHAR(50),
    pon_ports INTEGER DEFAULT 16,
    used_pon_ports INTEGER DEFAULT 0,
    online_ont_count INTEGER DEFAULT 0,
    total_ont_count INTEGER DEFAULT 0,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    temperature DECIMAL(5,1),
    uplink_bandwidth VARCHAR(20),
    uplink_utilization DECIMAL(5,2),
    cei_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT '正常',
    is_online TINYINT DEFAULT 1,
    uptime_days INTEGER DEFAULT 0,
    firmware_version VARCHAR(50),
    location VARCHAR(200),
    rack_info VARCHAR(100),
    installed_at DATE,
    last_inspect_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (bras_id) REFERENCES bras_devices(id)
);
CREATE INDEX idx_olt_city ON olt_devices(city_id);
CREATE INDEX idx_olt_status ON olt_devices(status);
CREATE INDEX idx_olt_bras ON olt_devices(bras_id);

-- 宽带用户/ONT设备表
CREATE TABLE IF NOT EXISTS broadband_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_account VARCHAR(30) NOT NULL UNIQUE,
    user_name VARCHAR(50),
    phone VARCHAR(20),
    city_id INTEGER NOT NULL,
    district_id INTEGER,
    address VARCHAR(200),
    olt_id INTEGER,
    pon_port VARCHAR(30),
    ont_id VARCHAR(50),
    ont_sn VARCHAR(50),
    ont_model VARCHAR(50),
    bandwidth INTEGER DEFAULT 100 COMMENT '签约带宽(Mbps)',
    product_type VARCHAR(30) COMMENT '宽带/电视/固话/融合',
    contract_start DATE,
    contract_end DATE,
    tx_power DECIMAL(6,2),
    rx_power DECIMAL(6,2),
    ont_temperature DECIMAL(5,1),
    ont_voltage DECIMAL(5,2),
    ont_status VARCHAR(20) DEFAULT '在线',
    gateway_id VARCHAR(50),
    gateway_model VARCHAR(50),
    gateway_sn VARCHAR(50),
    wifi_ssid VARCHAR(50),
    wifi_channel INTEGER,
    overall_cei DECIMAL(5,2),
    business_cei DECIMAL(5,2),
    network_cei DECIMAL(5,2),
    download_speed DECIMAL(8,2) COMMENT 'Mbps',
    upload_speed DECIMAL(8,2),
    latency DECIMAL(6,2) COMMENT 'ms',
    packet_loss DECIMAL(5,3) COMMENT '%',
    is_quality_issue TINYINT DEFAULT 0,
    quality_issue_type VARCHAR(50),
    last_online_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (olt_id) REFERENCES olt_devices(id)
);
CREATE INDEX idx_user_city ON broadband_users(city_id);
CREATE INDEX idx_user_olt ON broadband_users(olt_id);
CREATE INDEX idx_user_quality ON broadband_users(is_quality_issue);
CREATE INDEX idx_user_product ON broadband_users(product_type);
CREATE INDEX idx_user_account ON broadband_users(user_account);

-- ============ 质量监控表 ============

-- PON光功率异常记录表
CREATE TABLE IF NOT EXISTS pon_anomalies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anomaly_id VARCHAR(30) NOT NULL UNIQUE,
    olt_id INTEGER NOT NULL,
    pon_port VARCHAR(30),
    city_id INTEGER NOT NULL,
    district_id INTEGER,
    tx_power DECIMAL(6,2),
    rx_power DECIMAL(6,2),
    anomaly_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_users INTEGER DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT '待处理',
    handler VARCHAR(50),
    handle_time DATETIME,
    handle_result TEXT,
    discovery_time DATETIME NOT NULL,
    recovery_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (olt_id) REFERENCES olt_devices(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_pon_city ON pon_anomalies(city_id);
CREATE INDEX idx_pon_status ON pon_anomalies(status);
CREATE INDEX idx_pon_time ON pon_anomalies(discovery_time);

-- CEI评分记录表(用户维度)
CREATE TABLE IF NOT EXISTS cei_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    city_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    overall_cei DECIMAL(5,2),
    business_cei DECIMAL(5,2),
    network_cei DECIMAL(5,2),
    download_speed DECIMAL(8,2),
    upload_speed DECIMAL(8,2),
    latency DECIMAL(6,2),
    jitter DECIMAL(6,2),
    packet_loss DECIMAL(5,3),
    dns_delay DECIMAL(6,2),
    tcp_setup_delay DECIMAL(6,2),
    page_load_time DECIMAL(8,2),
    video_mos DECIMAL(4,2),
    game_latency DECIMAL(6,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES broadband_users(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_cei_user ON cei_records(user_id);
CREATE INDEX idx_cei_city ON cei_records(city_id);
CREATE INDEX idx_cei_date ON cei_records(record_date);

-- CEI每日地市汇总表
CREATE TABLE IF NOT EXISTS cei_daily_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    total_users INTEGER,
    active_users INTEGER,
    gateway_count DECIMAL(8,2),
    active_gateway_count DECIMAL(8,2),
    dpi_active_users DECIMAL(8,2),
    overall_cei DECIMAL(5,2),
    business_cei DECIMAL(5,2),
    network_cei DECIMAL(5,2),
    avg_download_speed DECIMAL(8,2),
    avg_upload_speed DECIMAL(8,2),
    avg_latency DECIMAL(6,2),
    avg_packet_loss DECIMAL(5,3),
    quality_issue_count INTEGER DEFAULT 0,
    quality_issue_rate DECIMAL(5,3),
    work_order_count INTEGER DEFAULT 0,
    top10_video_speed DECIMAL(8,2),
    home_network_quality DECIMAL(5,2),
    gaming_latency DECIMAL(6,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    UNIQUE(city_id, record_date)
);
CREATE INDEX idx_ceisummary_city ON cei_daily_summary(city_id);
CREATE INDEX idx_ceisummary_date ON cei_daily_summary(record_date);

-- 质差模型分析结果表
CREATE TABLE IF NOT EXISTS quality_model_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_id VARCHAR(30) NOT NULL UNIQUE,
    user_id INTEGER,
    city_id INTEGER NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    model_version VARCHAR(20),
    score DECIMAL(5,2),
    primary_factor VARCHAR(50),
    secondary_factors TEXT,
    severity VARCHAR(20),
    recommendation TEXT,
    auto_dispatch TINYINT DEFAULT 0,
    analysis_time DATETIME NOT NULL,
    quality_labels TEXT COMMENT 'JSON array of quality labels',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES broadband_users(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_qm_city ON quality_model_results(city_id);
CREATE INDEX idx_qm_model ON quality_model_results(model_name);

-- 用户质差记录表
CREATE TABLE IF NOT EXISTS user_quality_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    city_id INTEGER NOT NULL,
    cei_score DECIMAL(5,2),
    quality_type VARCHAR(50) NOT NULL,
    sub_type VARCHAR(50),
    duration_hours DECIMAL(8,2),
    affected_business VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT '质差中',
    auto_recovered TINYINT DEFAULT 0,
    report_time DATETIME NOT NULL,
    recovery_time DATETIME,
    work_order_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES broadband_users(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_uqi_city ON user_quality_issues(city_id);
CREATE INDEX idx_uqi_type ON user_quality_issues(quality_type);
CREATE INDEX idx_uqi_status ON user_quality_issues(status);

-- 业务质差记录表
CREATE TABLE IF NOT EXISTS biz_quality_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    biz_type VARCHAR(50) NOT NULL,
    city_id INTEGER NOT NULL,
    district_id INTEGER,
    affected_users INTEGER DEFAULT 0,
    avg_cei DECIMAL(5,2),
    avg_latency DECIMAL(6,2),
    avg_speed DECIMAL(8,2),
    packet_loss DECIMAL(5,3),
    quality_level VARCHAR(10),
    description TEXT,
    report_time DATETIME NOT NULL,
    recovery_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_bqi_city ON biz_quality_issues(city_id);
CREATE INDEX idx_bqi_biz ON biz_quality_issues(biz_type);

-- ============ 远程操作表 ============

-- PING测试记录表
CREATE TABLE IF NOT EXISTS ping_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id VARCHAR(30) NOT NULL UNIQUE,
    ont_id VARCHAR(50),
    rms_task_id VARCHAR(50),
    target_ip VARCHAR(50) NOT NULL,
    target_name VARCHAR(100),
    target_type VARCHAR(20),
    city_id INTEGER,
    source_ip VARCHAR(50),
    packet_size INTEGER DEFAULT 64,
    packet_count INTEGER DEFAULT 10,
    interval_ms INTEGER DEFAULT 1000,
    avg_delay DECIMAL(8,2),
    max_delay DECIMAL(8,2),
    min_delay DECIMAL(8,2),
    jitter DECIMAL(8,2),
    packet_loss DECIMAL(5,2),
    packets_sent INTEGER,
    packets_received INTEGER,
    status VARCHAR(20),
    operator VARCHAR(50),
    raw_result TEXT,
    error_message TEXT,
    test_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_ping_time ON ping_tests(test_time);

-- ONT光功率查询记录表
CREATE TABLE IF NOT EXISTS ont_power_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ont_id VARCHAR(50),
    city_id INTEGER NOT NULL,
    ont_model VARCHAR(50),
    tx_power DECIMAL(6,2),
    rx_power DECIMAL(6,2),
    temperature DECIMAL(5,1),
    voltage DECIMAL(5,2),
    bias_current DECIMAL(6,2),
    olt_rx_power DECIMAL(6,2),
    optical_distance DECIMAL(8,2) COMMENT '光纤距离(km)',
    status VARCHAR(20),
    query_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES broadband_users(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_ont_power_city ON ont_power_records(city_id);
CREATE INDEX idx_ont_power_time ON ont_power_records(query_time);

-- 网关远程重启记录表
CREATE TABLE IF NOT EXISTS gateway_restarts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gateway_id VARCHAR(50) NOT NULL,
    gateway_sn VARCHAR(50),
    user_id INTEGER,
    city_id INTEGER NOT NULL,
    restart_reason VARCHAR(100),
    restart_type VARCHAR(30) DEFAULT '远程重启',
    operator VARCHAR(50),
    result VARCHAR(20),
    error_message TEXT,
    duration_seconds INTEGER,
    pre_status TEXT COMMENT 'JSON: status before restart',
    post_status TEXT COMMENT 'JSON: status after restart',
    restart_time DATETIME NOT NULL,
    complete_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_gw_restart_city ON gateway_restarts(city_id);
CREATE INDEX idx_gw_restart_time ON gateway_restarts(restart_time);

-- DPI抓包记录表
CREATE TABLE IF NOT EXISTS dpi_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id VARCHAR(30) NOT NULL UNIQUE,
    user_id INTEGER,
    city_id INTEGER NOT NULL,
    src_ip VARCHAR(50),
    src_port INTEGER,
    dst_ip VARCHAR(50),
    dst_port INTEGER,
    protocol VARCHAR(20),
    app_name VARCHAR(50),
    app_category VARCHAR(50),
    up_traffic DECIMAL(10,2) COMMENT 'MB',
    down_traffic DECIMAL(10,2) COMMENT 'MB',
    up_packets INTEGER,
    down_packets INTEGER,
    latency DECIMAL(6,2),
    tcp_retransmit_rate DECIMAL(5,3),
    http_response_time DECIMAL(8,2),
    dns_resolve_time DECIMAL(6,2),
    status VARCHAR(20),
    capture_duration INTEGER COMMENT 'seconds',
    capture_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES broadband_users(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_dpi_city ON dpi_records(city_id);
CREATE INDEX idx_dpi_app ON dpi_records(app_name);
CREATE INDEX idx_dpi_time ON dpi_records(capture_time);

-- 光路测试上下线记录表
CREATE TABLE IF NOT EXISTS optical_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id VARCHAR(30) NOT NULL UNIQUE,
    olt_id INTEGER NOT NULL,
    ont_device_id VARCHAR(50),
    user_id INTEGER,
    city_id INTEGER NOT NULL,
    pon_port VARCHAR(30),
    event_type VARCHAR(20) NOT NULL COMMENT '上线/下线',
    reason VARCHAR(100),
    tx_power DECIMAL(6,2),
    rx_power DECIMAL(6,2),
    olt_rx_power DECIMAL(6,2),
    distance DECIMAL(8,2),
    duration_minutes INTEGER,
    previous_offline_count INTEGER COMMENT '近30天下线次数',
    event_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (olt_id) REFERENCES olt_devices(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_optical_city ON optical_tests(city_id);
CREATE INDEX idx_optical_event ON optical_tests(event_type);
CREATE INDEX idx_optical_time ON optical_tests(event_time);

-- CON网络分析记录表
CREATE TABLE IF NOT EXISTS con_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id VARCHAR(30) NOT NULL UNIQUE,
    city_id INTEGER NOT NULL,
    node_type VARCHAR(30) NOT NULL,
    node_id VARCHAR(50),
    node_name VARCHAR(100),
    bandwidth VARCHAR(20),
    utilization DECIMAL(5,2),
    peak_utilization DECIMAL(5,2),
    avg_latency DECIMAL(6,2),
    peak_latency DECIMAL(6,2),
    packet_loss DECIMAL(5,3),
    error_packets INTEGER DEFAULT 0,
    discard_packets INTEGER DEFAULT 0,
    in_traffic DECIMAL(12,2) COMMENT 'Mbps',
    out_traffic DECIMAL(12,2) COMMENT 'Mbps',
    status VARCHAR(20),
    analysis_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_con_city ON con_analysis(city_id);
CREATE INDEX idx_con_type ON con_analysis(node_type);

-- ============ 工单管理表 ============

-- 工单表
CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_type VARCHAR(30) NOT NULL COMMENT '用户申诉/主动发现/系统告警/AI预测/巡检发现',
    order_source VARCHAR(30) COMMENT '10086/APP/网厅/主动发现',
    city_id INTEGER NOT NULL,
    district_id INTEGER,
    user_id INTEGER,
    user_account VARCHAR(30),
    user_phone VARCHAR(20),
    user_address VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT '待派单',
    priority VARCHAR(10) NOT NULL DEFAULT '中',
    quality_type VARCHAR(50),
    assignee VARCHAR(50),
    assignee_phone VARCHAR(20),
    dispatch_time DATETIME,
    accept_time DATETIME,
    resolve_time DATETIME,
    close_time DATETIME,
    resolve_duration_hours DECIMAL(8,2),
    is_overdue TINYINT DEFAULT 0,
    overdue_hours DECIMAL(8,2),
    resolution TEXT,
    root_cause VARCHAR(100),
    satisfaction VARCHAR(20),
    feedback TEXT,
    revisit_result VARCHAR(50),
    pre_cei DECIMAL(5,2),
    post_cei DECIMAL(5,2),
    cei_improvement DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_wo_city ON work_orders(city_id);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_type ON work_orders(order_type);
CREATE INDEX idx_wo_priority ON work_orders(priority);
CREATE INDEX idx_wo_assignee ON work_orders(assignee);
CREATE INDEX idx_wo_time ON work_orders(created_at);

-- ============ 告警管理表 ============

-- 告警记录表
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id VARCHAR(30) NOT NULL UNIQUE,
    alert_type VARCHAR(50) NOT NULL,
    alert_level VARCHAR(20) NOT NULL COMMENT '紧急/重要/一般/提示',
    source VARCHAR(50),
    source_id VARCHAR(50),
    city_id INTEGER,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    affect_scope VARCHAR(200),
    affected_users INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT '未确认',
    handler VARCHAR(50),
    handle_time DATETIME,
    handle_result TEXT,
    auto_recovered TINYINT DEFAULT 0,
    alert_time DATETIME NOT NULL,
    recovery_time DATETIME,
    duration_minutes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX idx_alert_city ON alerts(city_id);
CREATE INDEX idx_alert_level ON alerts(alert_level);
CREATE INDEX idx_alert_status ON alerts(status);
CREATE INDEX idx_alert_time ON alerts(alert_time);

-- ============ 系统管理表 ============

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username VARCHAR(50),
    ip_address VARCHAR(50),
    module VARCHAR(50),
    action VARCHAR(50),
    description TEXT,
    request_url VARCHAR(200),
    request_method VARCHAR(10),
    request_params TEXT,
    response_status INTEGER,
    result VARCHAR(20) DEFAULT '成功',
    duration_ms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES system_users(id)
);
CREATE INDEX idx_log_user ON operation_logs(user_id);
CREATE INDEX idx_log_module ON operation_logs(module);
CREATE INDEX idx_log_time ON operation_logs(created_at);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(50) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string',
    category VARCHAR(50),
    description VARCHAR(200),
    is_editable TINYINT DEFAULT 1,
    updated_by VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 定时任务表
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50),
    cron_expression VARCHAR(30),
    status VARCHAR(20) DEFAULT '启用',
    last_run_at DATETIME,
    last_run_result VARCHAR(20),
    last_run_duration INTEGER,
    next_run_at DATETIME,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============ 视图 ============

-- 地市KPI汇总视图
CREATE VIEW IF NOT EXISTS v_city_kpi_latest AS
SELECT 
    c.city_name,
    c.city_code,
    c.longitude,
    c.latitude,
    s.record_date,
    s.total_users,
    s.active_users,
    s.gateway_count,
    s.active_gateway_count,
    s.overall_cei,
    s.business_cei,
    s.network_cei,
    s.avg_download_speed,
    s.avg_latency,
    s.quality_issue_count,
    s.work_order_count
FROM cities c
LEFT JOIN cei_daily_summary s ON c.id = s.city_id
    AND s.record_date = (SELECT MAX(record_date) FROM cei_daily_summary)
WHERE c.status = 1
ORDER BY c.sort_order;

-- 设备健康度视图
CREATE VIEW IF NOT EXISTS v_device_health AS
SELECT
    'BRAS' as device_type,
    device_name,
    c.city_name,
    status,
    cpu_usage,
    memory_usage,
    cei_score,
    uptime_days,
    online_users
FROM bras_devices b
JOIN cities c ON b.city_id = c.id
UNION ALL
SELECT
    'OLT' as device_type,
    device_id as device_name,
    c.city_name,
    o.status,
    o.cpu_usage,
    o.memory_usage,
    o.cei_score,
    o.uptime_days,
    o.online_ont_count as online_users
FROM olt_devices o
JOIN cities c ON o.city_id = c.id;

-- ============ DPI-XDR raw and derived analysis tables ============

CREATE TABLE IF NOT EXISTS dpi_xdr_common (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id VARCHAR(64) NOT NULL UNIQUE,
    protocol VARCHAR(32) NOT NULL,
    capture_time DATETIME NOT NULL,
    user_account VARCHAR(64),
    user_ip VARCHAR(64),
    city_id INTEGER,
    city_name VARCHAR(50),
    src_ip VARCHAR(64),
    src_port INTEGER,
    dst_ip VARCHAR(64),
    dst_port INTEGER,
    app_name VARCHAR(100),
    app_category VARCHAR(50),
    up_bytes INTEGER DEFAULT 0,
    down_bytes INTEGER DEFAULT 0,
    up_packets INTEGER DEFAULT 0,
    down_packets INTEGER DEFAULT 0,
    session_duration DECIMAL(10,2),
    tcp_rtt DECIMAL(10,2),
    tcp_retransmit_rate DECIMAL(8,3),
    http_first_packet_delay DECIMAL(10,2),
    dns_delay DECIMAL(10,2),
    sni_domain VARCHAR(255),
    domain_name VARCHAR(255),
    olt_id VARCHAR(64),
    pon_port VARCHAR(64),
    ont_id VARCHAR(64),
    bras_id VARCHAR(64),
    is_quality_issue TINYINT DEFAULT 0,
    quality_tags TEXT,
    raw_json TEXT,
    source_file VARCHAR(255),
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX IF NOT EXISTS idx_xdr_time ON dpi_xdr_common(capture_time);
CREATE INDEX IF NOT EXISTS idx_xdr_user ON dpi_xdr_common(user_account);
CREATE INDEX IF NOT EXISTS idx_xdr_protocol ON dpi_xdr_common(protocol);
CREATE INDEX IF NOT EXISTS idx_xdr_city ON dpi_xdr_common(city_id);
CREATE INDEX IF NOT EXISTS idx_xdr_quality ON dpi_xdr_common(is_quality_issue);

CREATE TABLE IF NOT EXISTS dpi_xdr_protocol_detail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id VARCHAR(64) NOT NULL,
    protocol VARCHAR(32) NOT NULL,
    detail_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES dpi_xdr_common(record_id)
);
CREATE INDEX IF NOT EXISTS idx_xdr_detail_record ON dpi_xdr_protocol_detail(record_id);

CREATE TABLE IF NOT EXISTS data_import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_id VARCHAR(64) NOT NULL UNIQUE,
    source_type VARCHAR(50) NOT NULL,
    source_file VARCHAR(255),
    total_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quality_tag_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_id VARCHAR(64) NOT NULL UNIQUE,
    tag_name VARCHAR(80) NOT NULL,
    category VARCHAR(50),
    config_key VARCHAR(80),
    operator VARCHAR(8),
    threshold_value VARCHAR(50),
    unit VARCHAR(20),
    severity VARCHAR(20),
    enabled TINYINT DEFAULT 1,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_quality_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_event_id VARCHAR(64) NOT NULL UNIQUE,
    user_account VARCHAR(64),
    city_id INTEGER,
    city_name VARCHAR(50),
    tag_id VARCHAR(64),
    tag_name VARCHAR(80),
    category VARCHAR(50),
    source_type VARCHAR(50),
    source_record_id VARCHAR(64),
    evidence_json TEXT,
    confidence DECIMAL(5,2),
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    first_detect_time DATETIME,
    last_detect_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX IF NOT EXISTS idx_uqt_user ON user_quality_tags(user_account);
CREATE INDEX IF NOT EXISTS idx_uqt_tag ON user_quality_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_uqt_city ON user_quality_tags(city_id);
CREATE INDEX IF NOT EXISTS idx_uqt_status ON user_quality_tags(status);

CREATE TABLE IF NOT EXISTS quality_cluster_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cluster_id VARCHAR(64) NOT NULL UNIQUE,
    dimension VARCHAR(30) NOT NULL,
    cluster_key VARCHAR(120) NOT NULL,
    city_id INTEGER,
    city_name VARCHAR(50),
    primary_tag VARCHAR(80),
    event_count INTEGER DEFAULT 0,
    affected_users INTEGER DEFAULT 0,
    severity VARCHAR(20),
    evidence_json TEXT,
    status VARCHAR(20) DEFAULT 'open',
    analysis_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX IF NOT EXISTS idx_cluster_dim ON quality_cluster_results(dimension);
CREATE INDEX IF NOT EXISTS idx_cluster_city ON quality_cluster_results(city_id);
CREATE INDEX IF NOT EXISTS idx_cluster_status ON quality_cluster_results(status);

CREATE TABLE IF NOT EXISTS cei_boundary_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    boundary_id VARCHAR(64) NOT NULL UNIQUE,
    boundary_type VARCHAR(30) NOT NULL,
    boundary_side VARCHAR(30) NOT NULL,
    user_account VARCHAR(64),
    city_id INTEGER,
    city_name VARCHAR(50),
    root_cause VARCHAR(100),
    related_device VARCHAR(120),
    cei_score DECIMAL(5,2),
    evidence_json TEXT,
    confidence DECIMAL(5,2),
    severity VARCHAR(20),
    suggestion TEXT,
    analysis_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
CREATE INDEX IF NOT EXISTS idx_boundary_type ON cei_boundary_results(boundary_type);
CREATE INDEX IF NOT EXISTS idx_boundary_user ON cei_boundary_results(user_account);
CREATE INDEX IF NOT EXISTS idx_boundary_city ON cei_boundary_results(city_id);

-- ============ 平台补齐能力：外部系统、模型闭环、报表、权限、统一审计 ============
CREATE TABLE IF NOT EXISTS external_system_connectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    connector_code VARCHAR(50) NOT NULL UNIQUE,
    connector_name VARCHAR(100) NOT NULL,
    connector_type VARCHAR(30) NOT NULL,
    endpoint_url VARCHAR(255),
    protocol VARCHAR(30),
    auth_type VARCHAR(30),
    status VARCHAR(20) DEFAULT '模拟可用',
    last_sync_time DATETIME,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    config_json TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_id VARCHAR(64) NOT NULL UNIQUE,
    connector_code VARCHAR(50) NOT NULL,
    data_type VARCHAR(50),
    source_file VARCHAR(255),
    total_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    status VARCHAR(20),
    message TEXT,
    result_json TEXT,
    sync_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sync_connector ON external_sync_logs(connector_code);
CREATE INDEX IF NOT EXISTS idx_sync_time ON external_sync_logs(sync_time);

CREATE TABLE IF NOT EXISTS ai_model_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_code VARCHAR(50) NOT NULL UNIQUE,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50),
    version VARCHAR(20),
    target_accuracy DECIMAL(5,2) DEFAULT 85,
    current_accuracy DECIMAL(5,2) DEFAULT 0,
    weight_json TEXT,
    feature_json TEXT,
    status VARCHAR(20) DEFAULT '模拟运行',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_feedback_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feedback_id VARCHAR(64) NOT NULL UNIQUE,
    model_code VARCHAR(50) NOT NULL,
    source_record_id VARCHAR(64),
    predicted_label VARCHAR(100),
    corrected_label VARCHAR(100),
    is_correct TINYINT DEFAULT 1,
    confidence DECIMAL(5,2),
    reviewer VARCHAR(50),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_feedback_model ON model_feedback_records(model_code);

CREATE TABLE IF NOT EXISTS report_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id VARCHAR(64) NOT NULL UNIQUE,
    report_type VARCHAR(20) NOT NULL,
    report_name VARCHAR(120) NOT NULL,
    period_start DATE,
    period_end DATE,
    status VARCHAR(20) DEFAULT '已生成',
    summary_json TEXT,
    file_name VARCHAR(255),
    generated_by VARCHAR(50),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_report_type ON report_jobs(report_type);

CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(30) NOT NULL,
    module VARCHAR(50) NOT NULL,
    actions TEXT NOT NULL,
    data_scope VARCHAR(30) DEFAULT 'province',
    UNIQUE(role, module)
);

CREATE TABLE IF NOT EXISTS unified_audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(64) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(80),
    action VARCHAR(50),
    operator VARCHAR(50),
    result VARCHAR(20),
    detail_json TEXT,
    event_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_module ON unified_audit_events(module);
CREATE INDEX IF NOT EXISTS idx_audit_time ON unified_audit_events(event_time);
