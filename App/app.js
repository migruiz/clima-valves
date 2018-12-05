var mqtt = require('./mqttCluster.js');
const BoilerValve=require('./BoilerValve')
global.config = {
    zwaveDriverPath: '/dev/ttyACM0',
    valves: [
        new Valve({ nodeId: 5, instanceId: 1, code: 'upstairsValve' }),
        new Valve({ nodeId: 5, instanceId: 3, code: 'downstairsValve'}),
        new Valve({ nodeId: 4, instanceId: 1, code: 'testValve' }),
        new Valve({ nodeId: 4, instanceId: 3, code: 'hotWaterValve' })
    ]
};


global.mtqqLocalPath = "mqtt://localhost";


var ZWave = require('./node_modules/openzwave-shared/lib/openzwave-shared.js');
var os = require('os');




var zwave = new ZWave({ ConsoleOutput: false });


zwave.on('scan complete', async function () {
    for (let index = 0; index < this.modules.length; index++) {
        var valve=global.config.valves[index];
        await valve.initAsync(); 
    }
    zwave.on('value changed',async function (nodeid, comclass, value){
        var valveReading = {
            nodeId: nodeid,
            instanceId: value.instance,
            value: value.value,
            commandType: value.class_id,
            timestamp: Math.floor(new Date() / 1000)
        };
        for (let index = 0; index < this.modules.length; index++) {
            var valve=global.config.valves[index];
            await valve.handleValveStateChangeAsync(valveReading);    
        }

    });
});



zwave.on('driver failed', function () {
    console.log('failed to start driver');
    zwave.disconnect();
    process.exit();
});

zwave.connect(global.config.zwaveDriverPath);
process.on('SIGINT', function () {
    console.log('disconnecting...');
    zwave.disconnect(global.config.zwaveDriverPath);
    process.exit();
});
