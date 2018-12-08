const Valve = require('./valve.js');
var mqtt = require('./mqttCluster.js');
class HotWaterValve extends Valve {
    constructor(valveConfig) {
        super(valveConfig);
        this.hotWaterBoostTimeout;
    }
    

    async initAsync(zwave){
        this.zwave=zwave;
        var mqttCluster=await mqtt.getClusterAsync() 
        var self=this
        mqttCluster.subscribeData("HotWaterValve/turn", function(content) {
            self.setState(content)
        });
        mqttCluster.subscribeData('zwavevalves/'+this.valveConfig.code, function(content) {
            console.log(JSON.stringify(content))
        });
    }


    setState(state) {
        if (this.storedValveData.state==state)
            return;

        if (state){
            this.zwave.setValue(this.valveConfig.nodeId, this.zwaveOnOffCommandId, this.valveConfig.instanceId, 0, true);
            this.hotWaterBoostTimeout=setTimeout(() => {
                this.zwave.setValue(this.valveConfig.nodeId, this.zwaveOnOffCommandId, this.valveConfig.instanceId, 0, false);
            }, 1000 * 60 * 38);
        }
        else{
            this.zwave.setValue(this.valveConfig.nodeId, this.zwaveOnOffCommandId, this.valveConfig.instanceId, 0, false);
            clearTimeout(this.hotWaterBoostTimeout)
        }


        
    }
}
module.exports = HotWaterValve;