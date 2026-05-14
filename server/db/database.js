/**
 * 数据库连接模块 - 使用 sql.js (纯JS SQLite)
 */
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'platform.db');
let db = null;
let SQL = null;

async function initSql() {
    if (!SQL) SQL = await initSqlJs();
    return SQL;
}

async function getDb() {
    if (db) return db;
    const sql = await initSql();
    if (fs.existsSync(DB_PATH)) {
        const buf = fs.readFileSync(DB_PATH);
        db = new sql.Database(buf);
    } else {
        db = new sql.Database();
    }
    db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=ON');
    return db;
}

function getDbSync() {
    if (!db) throw new Error('DB not initialized. Call await getDb() first.');
    return db;
}

function saveDb() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

async function initSchema() {
    const database = await getDb();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
        try {
            let cleaned = stmt.replace(/COMMENT\s+'[^']*'/gi, '');
            database.run(cleaned);
        } catch (e) {
            if (!e.message.includes('already exists')) {
                // ignore
            }
        }
    }
    console.log('Database schema initialized');
    return database;
}

function closeDb() {
    if (db) { saveDb(); db.close(); db = null; }
}

// Helper: run query and return array of objects
function queryAll(sql, params) {
    const database = getDbSync();
    const stmt = database.prepare(sql);
    if (params && params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
}

// Helper: run query and return first row as object
function queryOne(sql, params) {
    const rows = queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// Helper: execute statement (INSERT/UPDATE/DELETE)
function execute(sql, params) {
    const database = getDbSync();
    database.run(sql, params || []);
}

// Pagination helper
function paginate(sql, countSql, params, page, pageSize) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 15));
    
    const totalRow = queryOne(countSql, params);
    const total = totalRow ? (totalRow.total || totalRow.count || Object.values(totalRow)[0] || 0) : 0;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    
    const rows = queryAll(sql + ` LIMIT ${pageSize} OFFSET ${offset}`, params);
    
    return {
        data: rows,
        pagination: { page, pageSize, total, totalPages }
    };
}

module.exports = { getDb, getDbSync, initSchema, closeDb, saveDb, queryAll, queryOne, execute, paginate, DB_PATH };
