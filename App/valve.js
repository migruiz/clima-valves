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
            console.log('handleOnValveStateChangedEventAsync '+ this.valveConfig.code)
            if (this.storedValveData.state!==valveReading.value){
                await this.history.onValveStateChange(valveReading.value,valveReading.timestamp)
            }
            this.storedValveData.state=valveReading.value;
            this.emit('valveStateChanged',this);

        }
    }

    async initAsync(zwave){
        this.zwave=zwave;
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData('automaticboilercontrol/'+this.valveConfig.code, function(content) {
            self.setState(content)
        });
        mqttCluster.subscribeData('zwavevalves/'+this.valveConfig.code, function(content) {
            console.log(JSON.stringify(content))
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