const Valve=require('./valve')
global.config = {
    zwaveDriverPath: '/dev/ttyACM0',
    valves: [
        new Valve({ nodeId: 5, instanceId: 1, code: 'upstairs' }),
        new Valve({ nodeId: 5, instanceId: 3, code: 'downstairs'}),
        new Valve({ nodeId: 4, instanceId: 1, code: 'test' }),
        new Valve({ nodeId: 4, instanceId: 3, code: 'hotwater' })
    ]
};

global.mtqqLocalPath = process.env.MQTTLOCAL;
//global.mtqqLocalPath = "mqtt://piscos.tk";



//var os = require('os');



var ZWaveMockMan = require('./ZWaveMock.js');
var mqtt = require('./mqttCluster.js');
var zwave = new ZWaveMockMan.ZWaveMock();
//var ZWave = require('./node_modules/openzwave-shared/lib/openzwave-shared.js');
//var zwave = new ZWave({ ConsoleOutput: false });


zwave.on('scan complete', async function () {
    for (let index = 0; index < global.config.valves.length; index++) {
        var valve=global.config.valves[index];
        await valve.initAsync(zwave);       
        valve.on('valveStateChanged',async function(updatedValve){           
            await reportValvesState()
            console.log('reportValvesState '+ updatedValve.valveConfig.code)
           })  
    }    
    var mqttCluster=await mqtt.getClusterAsync() 
    subscribeToEvents(mqttCluster)
    zwave.on('value changed',async function (nodeid, comclass, value){
        var valveReading = {
            nodeId: nodeid,
            instanceId: value.instance,
            value: value.value,
            commandType: value.class_id,
            timestamp: Math.floor(new Date() / 1000)
        };
        for (let index = 0; index < global.config.valves.length; index++) {
            var valve=global.config.valves[index];
            await valve.handleOnValveStateChangedEventAsync(valveReading);    
        }

    });
});

function subscribeToEvents(mqttCluster){
    mqttCluster.subscribeData("AllBoilerValvesStateRequest",async () =>{
        await reportValvesState()
    });
  }

  async function reportValvesState(){
    var valvesConfigList={}
    var valves=global.config.valves
    for (var key in valves) {
        var valve=valves[key]
        valvesConfigList[valve.valveConfig.code]=valve.storedValveData.state
    }
    var mqttCluster=await mqtt.getClusterAsync() 
    mqttCluster.publishData("AllBoilerValvesStateResponse",valvesConfigList)
  }
      


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
