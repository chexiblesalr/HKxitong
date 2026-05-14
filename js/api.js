/**
 * 前端API客户端 - 与后端REST API通信
 */
var API = {
    baseUrl: 'http://localhost:3000/api',

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
    systemUsers()      { return this.get('/system-users'); },
    logs(p)            { return this.get('/logs', p); },
    configs(p)         { return this.get('/configs', p); },
    tasks()            { return this.get('/tasks'); },
    login(u, p)        { return this.post('/login', {username:u, password:p}); },
};
