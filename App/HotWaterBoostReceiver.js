var amqp = require('amqplib');
var queueListener = require('./rabbitQueueListenerConnector.js')

function startMonitoring(hotWaterBoostControl) {
    var internetAMQPURI = global.config.internetAMQPURI;
    queueListener.listenToQueue(internetAMQPURI, 'hotWaterBoost', { durable: false, noAck: true }, function (ch, msg) {
        var content = msg.content.toString();
        console.log(" [x] Received '%s'", content);
        var boostConfig = JSON.parse(content);
        await HotWaterBoostControl.startBoostAsync(boostConfig.boostTime);
    });
}