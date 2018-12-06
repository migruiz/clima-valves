var mqtt = require('./mqttCluster.js');
class Valve {
    constructor(valveConfig) {
        this.valveConfig=valveConfig;
        this.zwave;
        this.zwaveOnOffCommandId = 37;
        this.storedValveData={};
      }
    
    async handleOnValveStateChangedEventAsync(valveReading) {
        if (this.config.nodeId == valveReading.nodeId && this.config.instanceId == valveReading.instanceId && zwaveOnOffCommandId == valveReading.commandType) {
            var valveChange = { code: this.config.code, value: valveReading.value, timestamp: valveReading.timestamp };

            var mqttCluster=await mqtt.getClusterAsync() 
            mqttCluster.publishData(`zwavevalves/${this.config.code}`,valveChange)


        }
    }

    async initAsync(zwave){
        this.zwave=zwave;
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData('automaticboilercontrol/'+self.valveConfig.code, function(content) {
            setState(content)
        });
    }
    setState(state) {
        var currentTimeStamp = Math.floor(new Date() / 1000);
        var deltaSecs = currentTimeStamp - this.storedValveData.stateTimestamp;
        if (deltaSecs > 5) {
            zwave.setValue(valveConfig.nodeId, zwaveOnOffCommandId, valveConfig.instanceId, 0, state);
            storedValveData.stateTimestamp=currentTimeStamp
        }
        else {
            console.log("valve locked");
            zwave.requestNodeState(valveConfig.nodeId);
            return;
        }
        
    }
}

module.exports = Valve;