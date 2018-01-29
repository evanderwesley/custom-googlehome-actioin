/**
 * Created by Evander on 6/21/2017.
 */
let mosca = require('mosca');
let authstore = require('./../model');
let Regex = require("regex");
let regex = new Regex('/^user/(.*)/register');

const MQTT_SERVER = {};
let Packet = {};

let ascoltatore = {
    type: 'mongo',
    url: 'mongodb://localhost:27017/mqtt',
    pubsubCollection: 'testcollection',
    mongo: {}
};

let settings = {
    port: 1883,
    backend: ascoltatore,
    persistence: {
        factory: mosca.persistence.Mongo,
        url: "mongodb://localhost:27017/mqtt"
    }
};

let authenticate = function (client, username, password, callback) {
    authstore.findUserName(username, function (err, userObj) {
        if (err) {
            console.log(err);
            callback(null, false);
        }
        if (userObj.password === password.toString()) {
            client.user = username;
            callback(null, true);
        }
        else
            callback(null, false);
    });
};

let authorizePublish = function (client, topic, payload, callback) {
    callback(null, client.user === topic.split('/')[1]);
};

let authorizeSubscribe = function (client, topic, callback) {
    callback(null, client.user === topic.split('/')[1]);
};

/**
 * Start MQTT Server.
 * @type {Server}
 */
let server = new mosca.Server(settings);
server.on('ready', setup);

function setup() {
    server.authenticate = authenticate;
    server.authorizePublish = authorizePublish;
    server.authorizeSubscribe = authorizeSubscribe;
}


server.on('clientConnected', function (client) {
    console.log('client connected', client.id);
});

/**
 * Publish/Subscribe message
 */


server.on('published', function (packet, client) {
    console.log(Packet);
    console.log(packet.topic.toString());
    let match = packet.topic.toString().match(/user\/\w+\/(sync|exec|query|discover|control)\/res/);
    if (match !==null) {
        console.log('Published: %s at %s', packet.payload.toString(), packet.topic.toString());
        console.log('receive' + typeof Packet[packet.topic.toString()]);
            Packet[packet.topic.toString()](JSON.parse(packet.payload.toString()));
    }
});

/**
 * Send Message to client
 * var packet = {
 *      topic: 'our_custom_topic',
 *      payload: ourCustomPayload,
 *      qos: 1,
 *      retain: false,
 * };
 */

MQTT_SERVER.send = function (packetData, callback) {

    let topic = packetData.topic.toString() + '/res';
    Packet[topic] = callback;
    console.log(Packet);
    server.publish(packetData, function () {
        console.log('published done!');

        // if (Packet[topic]) {
        //     console.log(JSON.parse(Packet[topic]).res);
        //     callback(JSON.parse(Packet[topic]).res)
        // }
    });
};

exports.transmitMsg = MQTT_SERVER.send;

