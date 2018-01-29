/**
 * Created by snake on 6/29/2017.
 */
const fetch = require('node-fetch');
const config = require('./../oAuth/config-provider');
const authProvider = require('./../oAuth/auth-provider');
const mqttserver = require('./../mqtt-server/mqtt-server');
const datastore = require('../model');

// create a custom timestamp format for log statements
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath: '../jib-prototype.log',
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
    }, log = SimpleNodeLogger.createSimpleLogger(opts);

log.setLevel('info');

let deviceData = {

    1: {
        id: "1",
        properties: {
            type: "action.devices.types.LIGHT",
            traits: ["action.devices.traits.OnOff",
                "action.devices.traits.Brightness",
                "action.devices.traits.ColorTemperature",
                "action.devices.traits.ColorSpectrum"],
            name: {
                defaultNames: ["Smart Light"],
                name: "Smart Light 1",
                nicknames: ["red lamp"]
            },
            willReportState: false,
            roomHint: "living room",
            deviceInfo: {
                manufacturer: "Smart Home Provider",
                model: "g1337",
                swVersion: "1.0.11",
                hwVersion: "1.0"
            },
            customData: {
                smartHomeProviderId: "FkldJVJCmDNSaoLkoq0txiz8Byf2Hr"
            }
        },
        states: {
            on: false,
            online: true,
            brightness: 80,
            color: {
                name: "cerulian",
                spectrumRGB: 31655
            }
        }
    },
    2: {
        id: "2",
        properties: {
            type: "action.devices.types.LIGHT",
            traits: ["action.devices.traits.OnOff",
                "action.devices.traits.Brightness",
                "action.devices.traits.ColorTemperature",
                "action.devices.traits.ColorSpectrum"],
            name: {
                defaultNames: ["Smart Light"],
                name: "Smart Light 2",
                nicknames: ["doorway"]
            },
            willReportState: false,
            roomHint: "living room",
            deviceInfo: {
                manufacturer: "Smart Home Provider",
                model: "g1337",
                swVersion: "1.0.11",
                hwVersion: "1.0"
            },
            customData: {
                smartHomeProviderId: "FkldJVJCmDNSaoLkoq0txiz8Byf2Hr"
            }
        },
        states: {
            on: false,
            online: false,
            brightness: 80,
            color: {
                name: "cerulian",
                spectrumRGB: 31655
            }
        }
    },
    3: {
        id: "3",
        properties: {
            type: "action.devices.types.LIGHT",
            traits: ["action.devices.traits.OnOff",
                "action.devices.traits.Brightness",
                "action.devices.traits.ColorTemperature",
                "action.devices.traits.ColorSpectrum"],
            name: {
                defaultNames: ["Smart Light"],
                name: "Smart Light 3",
                nicknames: ["stairway"]
            },
            willReportState: false,
            roomHint: "living room",
            deviceInfo: {
                manufacturer: "Smart Home Provider",
                model: "g1337",
                swVersion: "1.0.11",
                hwVersion: "1.0"
            },
            customData: {
                smartHomeProviderId: "FkldJVJCmDNSaoLkoq0txiz8Byf2Hr"
            }
        },
        states: {
            on: false,
            online: false,
            brightness: 80,
            color: {
                name: "cerulian",
                spectrumRGB: 31655
            }
        }
    },
    4: {
        id: "4",
        properties: {
            type: "action.devices.types.LIGHT",
            traits: ["action.devices.traits.OnOff",
                "action.devices.traits.Brightness",
                "action.devices.traits.ColorTemperature",
                "action.devices.traits.ColorSpectrum"],
            name: {
                defaultNames: ["Smart Light"],
                name: "Smart Light 4",
                nicknames: ["table lamp"]
            },
            willReportState: false,
            roomHint: "living room",
            deviceInfo: {
                manufacturer: "Smart Home Provider",
                model: "g1337",
                swVersion: "1.0.11",
                hwVersion: "1.0"
            },
            customData: {
                smartHomeProviderId: "FkldJVJCmDNSaoLkoq0txiz8Byf2Hr"
            }
        },
        states: {
            on: false,
            online: false,
            brightness: 80,
            color: {
                name: "cerulian",
                spectrumRGB: 31655
            }
        }
    },

};

function registerAgent(app) {
    console.log('smart-home-app registerAgent');
    log.info('smart-home-app registerAgent');

    /**
     *
     * action: {
   *   initialTrigger: {
   *     intent: [
   *       "action.devices.SYNC",
   *       "action.devices.QUERY",
   *       "action.devices.EXECUTE"
   *     ]
   *   },
   *   httpExecution: "https://example.org/device/agent",
   *   accountLinking: {
   *     authenticationUrl: "https://example.org/device/auth"
   *   }
   * }
     */
    app.post('/ha', function (request, response) {
        console.log('post /ha', request.headers);
        log.info('post /ha', request.headers);

        let reqdata = request.body;

        console.log('post /ha', reqdata);
        log.info('post /ha', reqdata);

        let authToken = authProvider.getAccessToken(request);

        console.log('authToken %s', authToken);
        log.info('authToken %s', authToken);

        datastore.findToken(authToken, function (err, AccessToken) {
            console.log('AccessToken %s', AccessToken);
            log.info('AccessToken %s', AccessToken);

            let uid = AccessToken.uid;

            if (!reqdata.inputs) {
                response.status(401).set({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }).json({error: "missing inputs"});
            }

            for (let i = 0; i < reqdata.inputs.length; i++) {
                let input = reqdata.inputs[i];
                let intent = input.intent;
                if (!intent) {
                    response.status(401).set({
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    }).json({error: "missing inputs"});
                    continue;
                }

                switch (intent) {
                    case "action.devices.SYNC":
                        console.log('post /ha SYNC');
                        log.info('post /ha SYNC');

                        /**
                         * request:
                         * {
                           *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
                           *  "inputs": [{
                           *      "intent": "action.devices.SYNC",
                           *  }]
                           * }
                         */
                        sync({
                            uid: uid,
                            auth: authToken,
                            requestId: reqdata.requestId
                        }, response);
                        break;
                    case "action.devices.QUERY":
                        console.log('post /ha QUERY');
                        log.info('post /ha QUERY');
                        /**
                         * request:
                         * {
                           *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
                           *   "inputs": [{
                           *       "intent": "action.devices.QUERY",
                           *       "payload": {
                           *          "devices": [{
                           *            "id": "123",
                           *            "customData": {
                           *              "fooValue": 12,
                           *              "barValue": true,
                           *              "bazValue": "alpaca sauce"
                           *            }
                           *          }, {
                           *            "id": "234",
                           *            "customData": {
                           *              "fooValue": 74,
                           *              "barValue": false,
                           *              "bazValue": "sheep dip"
                           *            }
                           *          }]
                           *       }
                           *   }]
                           * }
                         */
                        query({
                            uid: uid,
                            auth: authToken,
                            requestId: reqdata.requestId,
                            devices: reqdata.inputs[0].payload.devices
                        }, response);

                        break;
                    case "action.devices.EXECUTE":
                        console.log('post /ha EXECUTE');
                        log.info('post /ha EXECUTE');
                        /**
                         * request:
                         * {
                           *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
                           *   "inputs": [{
                           *     "intent": "action.devices.EXECUTE",
                           *     "payload": {
                           *       "commands": [{
                           *         "devices": [{
                           *           "id": "123",
                           *           "customData": {
                           *             "fooValue": 12,
                           *             "barValue": true,
                           *             "bazValue": "alpaca sauce"
                           *           }
                           *         }, {
                           *           "id": "234",
                           *           "customData": {
                           *              "fooValue": 74,
                           *              "barValue": false,
                           *              "bazValue": "sheep dip"
                           *           }
                           *         }],
                           *         "execution": [{
                           *           "command": "action.devices.commands.OnOff",
                           *           "params": {
                           *             "on": true
                           *           }
                           *         }]
                           *       }]
                           *     }
                           *   }]
                           * }
                         */
                        exec({
                            uid: uid,
                            auth: authToken,
                            requestId: reqdata.requestId,
                            commands: reqdata.inputs[0].payload.commands
                        }, response);

                        break;
                    default:
                        response.status(401).set({
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                        }).json({error: "missing intent"});
                        break;
                }
            }
        });
    });
    /**
     * Enables prelight (OPTIONS) requests made cross-domain.
     */
    app.options('/ha', function (request, response) {
        response.status(200).set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }).send('null');
    });

    /**
     *
     * @param data
     * {
   *   "uid": "213456",
   *   "auth": "bearer xxx",
   *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf"
   * }
     * @param response
     * @return {{}}
     * {
   *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *   "payload": {
   *     "devices": [{
   *         "id": "123",
   *         "type": "action.devices.types.Outlet",
   *         "traits": [
   *            "action.devices.traits.OnOff"
   *         ],
   *         "name": {
   *             "defaultNames": ["TP-Link Outlet C110"],
   *             "name": "Homer Simpson Light",
   *             "nicknames": ["wall plug"]
   *         },
   *         "willReportState: false,
   *         "attributes": {
   *         // None defined for these traits yet.
   *         },
   *         "roomHint": "living room",
   *         "config": {
   *           "manufacturer": "tplink",
   *           "model": "c110",
   *           "hwVersion": "3.2",
   *           "swVersion": "11.4"
   *         },
   *         "customData": {
   *           "fooValue": 74,
   *           "barValue": true,
   *           "bazValue": "sheepdip"
   *         }
   *       }, {
   *         "id": "456",
   *         "type": "action.devices.types.Light",
   *         "traits": [
   *           "action.devices.traits.OnOff",
   *           "action.devices.traits.Brightness",
   *           "action.devices.traits.ColorTemperature",
   *           "action.devices.traits.ColorSpectrum"
   *         ],
   *         "name": {
   *           "defaultNames": ["OSRAM bulb A19 color hyperglow"],
   *           "name": "lamp1",
   *           "nicknames": ["reading lamp"]
   *         },
   *         "willReportState: false,
   *         "attributes": {
   *           "TemperatureMinK": 2000,
   *           "TemperatureMaxK": 6500
   *         },
   *         "roomHint": "living room",
   *         "config": {
   *           "manufacturer": "osram",
   *           "model": "hg11",
   *           "hwVersion": "1.2",
   *           "swVersion": "5.4"
   *         },
   *         "customData": {
   *           "fooValue": 12,
   *           "barValue": false,
   *           "bazValue": "dancing alpaca"
   *         }
   *       }, {
   *         "id": "234"
   *         // ...
   *     }]
   *   }
   * }
     */
    function sync(data, response) {
        // console.log('sync', data);
        datastore.getUser(data.uid, function (err, userObj) {
            if (!userObj) {
                return response.status(500).set({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }).json({error: "failed"});
            }
            let packet = {
                topic: 'user/' + userObj.name + '/sync',
                payload: JSON.stringify({type: "sync", content: "syncing"}),
                qos: 1,
                retain: false,
            };

            mqttserver.transmitMsg(packet, function (devicesJson) {
                if (!devicesJson) {
                    return response.status(500).set({
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    }).json({error: "failed"});
                }
                let devices = devicesJson.res;
                let deviceList = [];
                Object.keys(devices).forEach(function (key) {
                    if (devices.hasOwnProperty(key) && devices[key]) {
                        let device = devices[key];
                        device.id = key;
                        deviceList.push(device);
                    }
                });
                // let deviceList = [];
                // console.log('device list: ', deviceList);
                let deviceProps = {
                    requestId: data.requestId,
                    payload: {
                        devices: deviceList
                    }
                };
                console.log('sync successful');

                response.status(200).json(deviceProps);
                log.info('sync successful');

                return deviceProps;
            });


            // let deviceList = [];
            // let devices = smartHomePropertiesSync();
            // Object.keys(devices).forEach(function (key) {
            //     if (devices.hasOwnProperty(key) && devices[key]) {
            //         let device = devices[key];
            //         device.id = key;
            //         deviceList.push(device);
            //     }
            // });


        })
    }

    function smartHomePropertiesSync() {
        // console.log('smartHomePropertiesSync');
        let properties = {};
        Object.keys(deviceData).forEach(function (deviceId) {
            if (deviceData.hasOwnProperty(deviceId)) {
                properties[deviceId] = deviceData[deviceId].properties;
            }
        });
        // console.log('smartHomePropertiesSync devices: ', devices);
        return properties;
    }

    /**
     *
     * @param data
     * {
   *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *   "uid": "213456",
   *   "auth": "bearer xxx",
   *   "devices": [{
   *     "id": "123",
   *       "customData": {
   *         "fooValue": 12,
   *         "barValue": true,
   *         "bazValue": "alpaca sauce"
   *       }
   *   }, {
   *     "id": "234"
   *   }]
   * }
     * @param response
     * @return {{}}
     * {
   *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *   "payload": {
   *     "devices": {
   *       "123": {
   *         "on": true ,
   *         "online": true
   *       },
   *       "456": {
   *         "on": true,
   *         "online": true,
   *         "brightness": 80,
   *         "color": {
   *           "name": "cerulian",
   *           "spectrumRGB": 31655
   *         }
   *       },
   *       ...
   *     }
   *   }
   * }
     */
    function query(data, response) {
        // console.log('query', data);
        datastore.getUser(data.uid, function (err, userObj) {
            if (!userObj) {
                response.status(500).set({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }).json({error: "failed"});
                return;
            }

            let deviceIds = getDeviceIds(data.devices);

            let packet = {
                topic: 'user/' + userObj.name + '/query',
                payload: JSON.stringify({type: "query", content: deviceIds}),
                qos: 1,
                retain: false,
            };
            mqttserver.transmitMsg(packet, function (devicesJson) {
                if (!devicesJson) {
                    response.status(500).set({
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    }).json({error: "failed"});
                    return;
                }
                let devices = devicesJson.res;
                let deviceStates = {
                    requestId: data.requestId,
                    payload: {
                        devices: devices
                    }
                };
                response.status(200).json(deviceStates);
                log.info('Query Successful');
                return deviceStates;

            });
        })
    }

    /**
     *
     * @param devices
     * [{
   *   "id": "123"
   * }, {
   *   "id": "234"
   * }]
     * @return {Array} ["123", "234"]
     */
    function getDeviceIds(devices) {
        let deviceIds = [];
        for (let i = 0; i < devices.length; i++) {
            if (devices[i] && devices[i].id)
                deviceIds.push(devices[i].id);
        }
        return deviceIds;
    }

    /**
     * @param data:
     * {
   *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *   "uid": "213456",
   *   "auth": "bearer xxx",
   *   "commands": [{
   *     "devices": [{
   *       "id": "123",
   *       "customData": {
   *          "fooValue": 74,
   *          "barValue": false
   *       }
   *     }, {
   *       "id": "456",
   *       "customData": {
   *          "fooValue": 12,
   *          "barValue": true
   *       }
   *     }, {
   *       "id": "987",
   *       "customData": {
   *          "fooValue": 35,
   *          "barValue": false,
   *          "bazValue": "sheep dip"
   *       }
   *     }],
   *     "execution": [{
   *       "command": "action.devices.commands.OnOff",
   *       "params": {
   *           "on": true
   *       }
   *     }]
   *  }
   *
     * @param response
     * @return {{}}
     * {
   *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *   "payload": {
   *     "commands": [{
   *       "ids": ["123"],
   *       "status": "SUCCESS"
   *       "states": {
   *         "on": true,
   *         "online": true
   *       }
   *     }, {
   *       "ids": ["456"],
   *       "status": "SUCCESS"
   *       "states": {
   *         "on": true,
   *         "online": true
   *       }
   *     }, {
   *       "ids": ["987"],
   *       "status": "OFFLINE",
   *       "states": {
   *         "online": false
   *       }
   *     }]
   *   }
   * }
     */
    function exec(data, response) {
        // console.log('exec', data);
        datastore.getUser(data.uid, function (err, userObj) {
            if (!userObj) {
                response.status(500).set({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }).json({error: "failed"});
                return;
            }
            let packet = {
                topic: 'user/' + userObj.name + '/exec',
                payload: JSON.stringify({type: "exec", content: {commands: data.commands}}),
                qos: 1,
                retain: false,
            };
            mqttserver.transmitMsg(packet, function (respCommandsJson) {

                let respCommands = respCommandsJson.res;

                let resBody = {
                    requestId: data.requestId,
                    payload: {
                        commands: respCommands
                    }
                };
                response.status(200).json(resBody);
                log.info('exec successful');
                return resBody;
            });
        });


    }
}

exports.registerAgent = registerAgent;