/**
 * Created by Evander on 6/21/2017.
 */
let mqtt = require('mqtt');
let datastore = require('./datastore');
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'../jib-prototype-client.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    }, log = SimpleNodeLogger.createSimpleLogger( opts );

log.setLevel('info');


let options = {
    port: datastore.mqttPort,
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: datastore.username,
    password: datastore.password,
};

let client  = mqtt.connect('mqtt://' + datastore.mqttHost, options);

client.on('connect', function () {
    client.subscribe(datastore.topicSync);
    client.subscribe(datastore.topicSyncRes);
    client.subscribe(datastore.topicQuery);
    client.subscribe(datastore.topicQueryRes);
    client.subscribe(datastore.topicExec);
    client.subscribe(datastore.topicExecRes);
    client.subscribe(datastore.topicDiscover);
    client.subscribe(datastore.topicDiscoverRes);
    client.subscribe(datastore.topicControl);
    client.subscribe(datastore.topicControlRes);
    log.info('connected to MQTT server');
    // client.publish(datastore.topic_register, JSON.stringify(datastore.data))

});

client.on('message', function (topic, message) {
    console.log(topic);
    console.log(message);
    if (topic === datastore.topicSync) {
        console.log('Sync');
        console.log("At: %s, content: %s", topic, message.toString());
        log.info('Sync');
        log.info("At: %s, content: %s", topic, message.toString());
        smartHomePropertiesSync(function (devices) {
            console.log(devices);
            sendPacket(datastore.topicSyncRes, JSON.stringify({res:devices}));
        });

        log.info('Sync Successful');
        // client.end()
    }

    else if (topic === datastore.topicQuery){
        console.log('query');
        console.log("At: %s, content: %s", topic, JSON.parse(message.toString()).content);
        log.info('query');
        log.info("At: %s, content: %s", topic, JSON.parse(message.toString()).content);

        smartHomeQueryStates(JSON.parse(message.toString()).content, function (devices) {
            sendPacket(datastore.topicQueryRes, JSON.stringify({res: devices}));
            log.info('Query Successful');
        })
    }
    else if (topic === datastore.topicExec){
        console.log('Exec');
        console.log("At: %s, content: %s", topic, message.toString());
        log.info('Exec');
        log.info("At: %s, content: %s", topic, message.toString());
        smartHomeExecCommands(JSON.parse(message.toString()).content.commands, function (respCommands) {

            sendPacket(datastore.topicExecRes, JSON.stringify({res: respCommands}));
            log.info('Executed successful');
        })

    }

    else if (topic ===  datastore.topicDiscover){
        console.log('Alexa Discover');
        console.log("At: %s, content: %s", topic, message.toString());
        log.info('Alexa Discover');
        log.info("At: %s, content: %s", topic, message.toString());
        smartHomeAlexaDiscover(function (devices) {
            sendPacket(datastore.topicDiscoverRes, JSON.stringify({res: devices}));
            console.log('Alexa Discover is successful.');
            log.info('Alexa Discover is successful.');
        })

    }

    else if (topic === datastore.topicControl){
        console.log('Control');
        console.log("At: %s, content: %s", topic, message.toString());
        log.info('Control');
        log.info("At: %s, content: %s", topic, message.toString());
        smartHomeAlexaControl(JSON.parse(message.toString()).content.commands, function (confirmation) {
            sendPacket(datastore.topicControlRes, JSON.stringify({res: confirmation}));
            console.log('Alexa Discover is successful.');
            log.info('Alexa Discover is successful.');
        })

    }
});

function sendPacket (topic, packet) {
    console.log('sending packet %s to %s', packet, topic);
    client.publish(topic, packet)
}

/**
 * Alexa Devices Discover
 */

const smartHomeAlexaDiscover = function (callback) {
    let devices = [];
    Object.keys(datastore.alexaData).forEach(function (deviceId) {
        if (datastore.alexaData.hasOwnProperty(deviceId)) {
            devices.push(datastore.alexaData[deviceId]);
        }
    });
    callback(devices);
};

const smartHomeAlexaControl = function (data, callback) {
    let confirmation =  data.devices.confirmation;
    let funcName = data.devices.funcName;
    let state = data.devices.state;
    let devices = data.devices.devices;
    console.log('confirmation: %s, funcName: $s, state: %s, devices: %s', confirmation, funcName, state, devices);
    callback(confirmation)

};

/**
 * Query devices
 * @param deviceList
 * @param callback
 */

const smartHomePropertiesSync = function (callback) {
    // console.log('smartHomePropertiesSync');
    let devices = datastore.getProperties(null);
    // console.log('smartHomePropertiesSync devices: ', devices);
    callback(devices);
};


const smartHomeQueryStates = function (deviceList, callback) {

    if (!deviceList || deviceList == {}) {
        deviceList = null;
    }

    let devices = datastore.getStates(deviceList);
    console.log('smartHomeQueryStates devices: ', devices);
    log.info('smartHomeQueryStates devices: ', devices);
    callback(devices);
};

/**
 * Exec Devices
 * @param commands
 * @param callback
 */
const smartHomeExecCommands = function (commands, callback) {
    let respCommands = [];
    for (let i = 0; i < commands.length; i++) {
        let curCommand = commands[i];
        for (let j = 0; j < curCommand.execution.length; j++) {
            let curExec = curCommand.execution[j];
            respCommands.push(execDevices(curExec, curCommand.devices));
        }
    }
    log.info('RespCommands: %s', respCommands)
    callback(respCommands);

};

function execDevices(command, devices) {
    let payload = [];
    for (let i = 0; i < devices.length; i++) {
        payload.push(execDevice(command, devices[i]));
    }
    return payload;
}

function execDevice(command, device) {

    let curDevice = {
        id: device.id,
        states: {}
    };

    Object.keys(command.params).forEach(function (key) {
        if (command.params.hasOwnProperty(key)) {
            curDevice.states[key] = command.params[key];
        }
    });
    let payLoadDevice = {
        ids: [curDevice.id],
        status: "SUCCESS",
        states: {}
    };
    let execDevice = smartHomeExec(curDevice);
    if (!execDevice) {
        payLoadDevice.status = "OFFLINE";
        return execDevice;
    }
    let deviceCommand = {
        type: 'change',
        state: {}
    };
    // TODO - add error and debug to response

    deviceCommand.state[curDevice.id] = execDevice[curDevice.id].states;

    execDevice = execDevice[curDevice.id];
    payLoadDevice.states = execDevice.states;

    Object.keys(command.params).forEach(function (key) {
        if (command.params.hasOwnProperty(key)) {
            if (payLoadDevice.states[key] != command.params[key]) {
                payLoadDevice.status = "FAILURE";
            }
        }
    });
    return payLoadDevice;
}

function smartHomeExec(device) {
    // console.log('smartHomeExec', device);
    datastore.execDevice(device);
    let executedDevice = datastore.getStatus([device.id]);
    console.log('smartHomeExec executedDevice', executedDevice);
    return executedDevice;
}


