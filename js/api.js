/**
 * 前端API客户端 - 与后端REST API通信
 */
var API = {
    baseUrl: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : window.location.origin + '/api',

    async get(url, params) {
        const qs = params ? '?' + Object.entries(params).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>k+'='+encodeURIComponent(v)).join('&') : '';
        try {
            const resp = await fetch(this.baseUrl + url + qs);
            const data = await resp.json();
            if (data.code === 200) return data.data;
            console.error('API Error:', data.message);
            return null;
        } catch(e) {
            console.error('Network Error:', e);
            return null;
        }
    },

    async post(url, body) {
        try {
            const resp = await fetch(this.baseUrl + url, {
                method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
            });
            return (await resp.json()).data;
        } catch(e) { console.error('Network Error:', e); return null; }
    },

    async put(url, body) {
        try {
            const resp = await fetch(this.baseUrl + url, {
                method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
            });
            return (await resp.json()).data;
        } catch(e) { console.error('Network Error:', e); return null; }
    },

    // ===== 各模块API =====
    async delete(url) {
        try {
            const resp = await fetch(this.baseUrl + url, { method: 'DELETE' });
            return (await resp.json()).data;
        } catch(e) { console.error('Network Error:', e); return null; }
    },

    dashboard()        { return this.get('/dashboard'); },
    cities()           { return this.get('/cities'); },
    ceiTrend(p)        { return this.get('/cei-trend', p); },
    userStatsTrend(p)  { return this.get('/user-stats-trend', p); },
    gis()              { return this.get('/gis'); },
    kpi()              { return this.get('/kpi'); },
    deviceStats()      { return this.get('/device-stats'); },
    bras(p)            { return this.get('/bras', p); },
    olt(p)             { return this.get('/olt', p); },
    broadbandUsers(p)  { return this.get('/broadband-users', p); },
    ponAnomalies(p)    { return this.get('/pon-anomalies', p); },
    qualityModels(p)   { return this.get('/quality-models', p); },
    userQuality(p)     { return this.get('/user-quality', p); },
    bizQuality(p)      { return this.get('/biz-quality', p); },
    qualityCluster()   { return this.get('/quality-cluster'); },
    bizCluster()       { return this.get('/biz-cluster'); },
    qualityLocation()  { return this.get('/quality-location'); },
    pingTests(p)       { return this.get('/ping-tests', p); },
    executePing(p)     { return this.post('/ping-test', p); },
    ontPower(p)        { return this.get('/ont-power', p); },
    gatewayRestarts(p) { return this.get('/gateway-restarts', p); },
    executeRestart(p)  { return this.post('/gateway-restart', p); },
    dpi(p)             { return this.get('/dpi', p); },
    dpiXdr(p)          { return this.get('/dpi-xdr', p); },
    dpiXdrDetail(id)   { return this.get('/dpi-xdr/' + encodeURIComponent(id)); },
    dpiXdrStats()      { return this.get('/dpi-xdr-stats'); },
    seedDpiXdr(p)      { return this.post('/dpi-xdr/seed-sample', p || {}); },
    qualityTagDefs()   { return this.get('/quality-tags/definitions'); },
    qualityTagEvents(p){ return this.get('/quality-tags/events', p); },
    generateQualityTags(p){ return this.post('/quality-tags/generate', p || {}); },
    generateClusters(p){ return this.post('/quality-clusters/generate', p || {}); },
    clusterResults(p)  { return this.get('/quality-clusters/results', p); },
    generateBoundary(p){ return this.post('/cei-boundary/generate', p || {}); },
    boundaryResults(p) { return this.get('/cei-boundary/results', p); },
    createQualityOrders(p){ return this.post('/work-orders/from-quality-tags', p || {}); },
    qualityLoopStats() { return this.get('/quality-loop-stats'); },
    opticalTests(p)    { return this.get('/optical-tests', p); },
    conAnalysis(p)     { return this.get('/con-analysis', p); },
    workOrders(p)      { return this.get('/work-orders', p); },
    createWorkOrder(p) { return this.post('/work-orders', p); },
    dispatchWorkOrder(id, p) { return this.put('/work-orders/' + id + '/dispatch', p); },
    resolveWorkOrder(id) { return this.put('/work-orders/' + id + '/resolve', {}); },
    closeWorkOrder(id) { return this.put('/work-orders/' + id + '/close', {}); },
    workOrderStats()   { return this.get('/work-order-stats'); },
    workOrderEval()    { return this.get('/work-order-eval'); },
    alerts(p)          { return this.get('/alerts', p); },
    externalConnectors(){ return this.get('/external-connectors'); },
    syncConnector(code, p){ return this.post('/external-connectors/' + encodeURIComponent(code) + '/sync', p || {}); },
    externalSyncLogs(p){ return this.get('/external-sync-logs', p); },
    aiModels()         { return this.get('/ai-models'); },
    modelFeedback(p)   { return this.get('/model-feedback', p); },
    submitModelFeedback(p){ return this.post('/ai-model-feedback', p || {}); },
    reports(p)         { return this.get('/reports', p); },
    generateReport(p)  { return this.post('/reports/generate', p || {}); },
    permissions()      { return this.get('/permissions'); },
    savePermission(p)  { return this.post('/permissions', p || {}); },
    unifiedAudits(p)   { return this.get('/unified-audits', p); },
    systemUsers()      { return this.get('/system-users'); },
    saveSystemUser(p)  { return this.post('/system-users', p || {}); },
    setSystemUserStatus(id, p){ return this.put('/system-users/' + id + '/status', p || {}); },
    lockSystemUser(id, p){ return this.put('/system-users/' + id + '/lock', p || {}); },
    resetSystemUserPassword(id){ return this.put('/system-users/' + id + '/reset-password', {}); },
    logs(p)            { return this.get('/logs', p); },
    configs(p)         { return this.get('/configs', p); },
    saveConfig(p)      { return this.post('/configs', p || {}); },
    deleteConfig(key)  { return this.delete('/configs/' + encodeURIComponent(key)); },
    ceiUsers(p)        { return this.get('/cei-users', p); },
    ceiClusterAnalysis(p){ return this.get('/cei-cluster-analysis', p); },
    performanceKqi()   { return this.get('/performance-kqi'); },
    qualityPortraitStats(){ return this.get('/quality-portrait-stats'); },
    boundaryAccuracy() { return this.get('/boundary-accuracy'); },
    queryOntPower(p)   { return this.post('/ont-power/query', p || {}); },
    tasks()            { return this.get('/tasks'); },
    login(u, p)        { return this.post('/login', {username:u, password:p}); },
};
