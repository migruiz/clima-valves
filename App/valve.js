var mqtt = require('./mqttCluster.js');
class Valve {
    constructor(valveConfig) {
        this.valveConfig=valveConfig;
        this.zwave;
        this.zwaveOnOffCommandId = 37;
        this.storedValveData={};
      }
    
    async handleOnValveStateChangedEventAsync(valveReading) {
        if (this.valveConfig.nodeId == valveReading.nodeId && this.valveConfig.instanceId == valveReading.instanceId && this.zwaveOnOffCommandId == valveReading.commandType) {
            var valveChange = { code: this.valveConfig.code, value: valveReading.value, timestamp: valveReading.timestamp };

            var mqttCluster=await mqtt.getClusterAsync() 
            mqttCluster.publishData(`zwavevalves/${this.valveConfig.code}`,valveChange)


        }
    }

    async initAsync(zwave){
        this.zwave=zwave;
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData('automaticboilercontrol/'+this.valveConfig.code, function(content) {
            console.log(self.valveConfig.code)
            console.log(content)
            self.setState(content)
        });
    }
    setState(state) {
        var currentTimeStamp = Math.floor(new Date() / 1000);
        var deltaSecs = currentTimeStamp - this.storedValveData.stateTimestamp;
        if (deltaSecs > 5) {
            this.zwave.setValue(this.valveConfig.nodeId, this.zwaveOnOffCommandId, this.valveConfig.instanceId, 0, state);
            this.storedValveData.stateTimestamp=currentTimeStamp
        }
        else {
            console.log("valve locked");
            this.zwave.requestNodeState(this.valveConfig.nodeId);
            return;
        }
        
    }
}

module.exports = Valve;