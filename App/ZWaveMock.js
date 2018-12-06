function ZWaveMock(){
    this.requestNodeState = function (nodeId) {
        broacastState(nodeId);
    }
    var valves = {
        4: {
            1: false,  //testValve
            3: false //hotwater
        },
        5: {
            1: false,  //upstaisvalve
            3: false  //downstairsvalve
        },
    };
    
    this.setValue = function (nodeId, commandId, instanceId, subId, state) {
        valves[nodeId][instanceId] = state;
        broacastState(nodeId);
    }
    var valueChangedHandler;
    var scanCompleteHandler;
    this.on = function (command, action) {
        console.log("registering mock on" + command);
        if (command.localeCompare('scan complete')==0) {
            scanCompleteHandler=action;            
        }
        else if (command.localeCompare('value changed')==0) {
            valueChangedHandler = action;
        }
    }
    this.disconnect = function () {
        console.log("mock disconnecting");
    }
    this.connect = function () {
        console.log("mock connect");        
        setTimeout(function(){
            scanCompleteHandler();
        },1000)
    }
    this.requestNodeState=function(nodeId){
        broacastState(nodeId)
    }

    function broacastState(nodeId) {
        var node = valves[nodeId];
        for (var instance in node) {
            (function(){
                var state = node[instance];
                var instanceId=instance
                setTimeout(() => {                
                    valueChangedHandler(nodeId, 37, { value: state, instance: instanceId, class_id: 37 });
                }, 200);
            })()
        }
    }
}


exports.ZWaveMock = ZWaveMock;