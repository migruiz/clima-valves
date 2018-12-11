var mqtt = require('./mqttCluster.js');
var sqliteRepository = require('./valvesRepository.js');
const HOURSTOKEEP=12
class ValveHistory {    
    constructor(valveCode) {
      this.history={}
      this.valveCode=valveCode;
    }
    async initAsync() {
        var currentHistory=await sqliteRepository.getHistoryAsync(this.valveCode);
        if (currentHistory){
            for (var index in currentHistory) {
                var record=currentHistory[index]
                this.history[record.timestamp]=record.state
            } 
        }
    }

    async onValveStateChange(state,timestamp){
        this.history[timestamp]=state
        await sqliteRepository.insertHistoryAsync(this.valveCode,state,timestamp);
        await this.removeOldHistory()
    }
    async removeOldHistory(){
        var keys=Object.keys(this.history)
        var now=Math.floor(Date.now() / 1000);
        var keepTimeStamp=now - 60 * 60 * HOURSTOKEEP
        var keysToDelete=keys.filter(k=>parseInt(k)<=keepTimeStamp)
        for (let index = 0; index < keysToDelete.length; index++) {
            const key = keysToDelete[index];
            delete this.history[key]
        }
        await sqliteRepository.deleteHistoryAsync(this.valveCode,keepTimeStamp);      
        
    }
}
module.exports = ValveHistory;
 