var mqtt = require('./mqttCluster.js');
const EventEmitter = require( 'events' );
const ValveHistory=require('./ValveHistory')
class Valve extends EventEmitter {
    constructor(valveConfig) {
        super()
        this.valveConfig=valveConfig;
        this.zwave;
        this.history=new ValveHistory(valveConfig.code)
        this.zwaveOnOffCommandId = 37;
        this.storedValveData={};
      }
    
    async handleOnValveStateChangedEventAsync(valveReading) {
        if (this.valveConfig.nodeId == valveReading.nodeId && this.valveConfig.instanceId == valveReading.instanceId && this.zwaveOnOffCommandId == valveReading.commandType) {
            //console.log('handleOnValveStateChangedEventAsync '+ this.valveConfig.code +JSON.stringify(valveReading))
            if (this.storedValveData.state!==valveReading.value){
                await this.history.onValveStateChange(valveReading.value,valveReading.timestamp)
            }
            this.storedValveData.state=valveReading.value;
            this.emit('valveStateChanged',this);

            var mqttCluster=await mqtt.getClusterAsync() 
            mqttCluster.publishData('valves/'+this.valveConfig.code+'/changes',valveReading.value)
        }
    }

    async initAsync(zwave){
        this.zwave=zwave;
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData('automaticboilercontrol/'+this.valveConfig.code, function(content) {
            self.setState(content)
        });
    }
    setState(state) {
        var currentTimeStamp = Math.floor(new Date() / 1000);
        var deltaSecs = currentTimeStamp - this.storedValveData.stateTimestamp;
        if (this.storedValveData.state==state)
            return;
        this.zwave.setValue(this.valveConfig.nodeId, this.zwaveOnOffCommandId, this.valveConfig.instanceId, 0, state);
        
    }
}

module.exports = Valve;