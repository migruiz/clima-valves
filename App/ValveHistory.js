var mqtt = require('./mqttCluster.js');
var sqliteRepository = require('./valvesRepository.js');
const RESOLUTIONMINS=5
const HOURSTOKEEP=1
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
        var keysToDelete=keys.filter(k=>k<=keepTimeStamp)
        for (var key in keysToDelete) {
            delete this.history[key]
        } 
        await sqliteRepository.deleteHistoryAsync(this.valveCode,keepTimeStamp);      
        
    }
}
module.exports = ValveHistory;
 