var sqlite = require('./db-sqlite.js');

var versionHistory = [];

versionHistory.push(`CREATE TABLE ValvesHistory (
    id integer primary key
    ,valveCode text not null collate nocase
    ,timestamp int
    ,state int
    );`);
versionHistory.push('CREATE UNIQUE INDEX IX_ValvesHistory ON ValvesHistory (valveCode ASC,timestamp ASC);');

var singleton;

exports.instance = function () {

    if (!singleton) {
        singleton = new sqlite.SQLDB(global.dbPath, versionHistory);
    }

    return singleton;
}