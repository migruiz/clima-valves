const Valve = require('./valve.js');
var mqtt = require('./mqttCluster.js');
class TestValve extends Valve {
    constructor(valveConfig) {
        super(valveConfig);
    }
    

    async initAsync(zwave){
        this.zwave=zwave;
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData("testValve/turn", function(content) {
            self.setState(content)
        });
    }


    setState(state) {
        if (this.storedValveData.state==state)
            return;
        this.zwave.setValue(this.valveConfig.nodeId, this.zwaveOnOffCommandId, this.valveConfig.instanceId, 0, state);


        
    }
}
module.exports = TestValve;