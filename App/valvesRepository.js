var db = require('./valvesDatabase');
exports.insertHistoryAsync = async function (valveCode,state,timestamp) {
    await db.instance().operate(db=>db.runAsync("REPLACE INTO ValvesHistory(valveCode,state,timestamp) values ($valveCode,$state,$timestamp)",
        {
            $valveCode: valveCode,
            $state: state,
            $timestamp: timestamp
        }));
}
exports.deleteHistoryAsync = async function (valveCode,timeStampLimit) {
    await db.instance().operate(db=>db.runAsync("delete from ValvesHistory where valveCode=$valveCode and timestamp<$timeStampLimit",
        {
            $zoneCode: zoneCode,
            $timeStampLimit: timeStampLimit
        }));
}


}
exports.getHistoryAsync =async  function (valveCode) {
    var valveData = await db.instance().operate(db=>db.allAsync("select state,timestamp from ValvesHistory where valveCode=$valveCode",
    {
        $valveCode: valveCode
    }));
    return valveData;

}