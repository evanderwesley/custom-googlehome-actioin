/**
 * Created by snake on 6/30/2017.
 */


/**
 * Set User Credentials and Topic for specific user.
 * @type {{}}
 */
const Auth = {};
const Data = {};

Auth.username = 'rick';
Auth.password = 'oldman';
Auth.topicSync = 'user/' + Auth.username + '/sync';
Auth.topicSyncRes = 'user/' + Auth.username + '/sync/res';
Auth.topicQuery = 'user/' + Auth.username + '/query';
Auth.topicQueryRes = 'user/' + Auth.username + '/query/res';
Auth.topicExec = 'user/' + Auth.username + '/exec';
Auth.topicExecRes = 'user/' + Auth.username + '/exec/res';
Auth.topicDiscover = 'user/' + Auth.username + '/discover';
Auth.topicDiscoverRes = 'user/' + Auth.username + '/discover/res';
Auth.topicControl = 'user/' + Auth.username + '/control';
Auth.topicControlRes = 'user/' + Auth.username + '/control/res';
Auth.mqtt_host = "jib.touchpanelcontrol.com";
Auth.mqtt_port = "1883";

/**
 * Set pre-defined devices for testing.
 * @type {string}
 */
let kitchenLightApplianceId = "A146-3456-b31d-7ec4c146c5ea";
let bedroomLightApplianceId = "A146-3456-b31d-7ec4c146c5eb";


let alexaDevices = {
    kitchenLight: {
        applianceId: kitchenLightApplianceId,
        manufacturerName: 'KRV',
        modelName: 'ParticleLight',
        version: 'VER01',
        friendlyName: 'Kitchen Light',
        friendlyDescription: 'Particle light in kitchen',
        isReachable: true,
        actions: [
            "incrementPercentage",
            "decrementPercentage",
            "setPercentage",
            "turnOn",
            "turnOff"
        ],
        additionalApplianceDetails: {
            /**
             * OPTIONAL:
             * We can use this to persist any appliance specific metadata.
             * This information will be returned back to the driver when user requests
             * action on this appliance.
             */
            fullApplianceId: '2cd6b650-c0h0-4062-b31d-7ec2c146c5ea',
            deviceId: "39003d000447343232363230"
        }
    },
    bedroomLight: {
        applianceId: bedroomLightApplianceId,
        manufacturerName: 'KRV',
        modelName: 'ParticleLight',
        version: 'VER01',
        friendlyName: 'Bedroom Light',
        friendlyDescription: 'Particle light in bedroom',
        isReachable: true,
        actions: [
            "incrementPercentage",
            "decrementPercentage",
            "setPercentage",
            "turnOn",
            "turnOff"
        ],
        additionalApplianceDetails: {
            /**
             * OPTIONAL:
             * We can use this to persist any appliance specific metadata.
             * This information will be returned back to the driver when user requests
             * action on this appliance.
             */
            fullApplianceId: '2cd6b650-c0h0-4062-b31d-7ec2c146c5eb',
            deviceId: "39003d000447343232363230"
        }
    }
}


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

Data.getStates = function (uid, deviceIds = undefined) {
    // console.log('getStates', uid);
    let states = {};

    if (!deviceIds) {
        Object.keys(deviceData).forEach(function (deviceId) {
            if (deviceData.hasOwnProperty(deviceId)) {
                states[deviceId] = deviceData[deviceId].states;
            }
        });
    } else {
        for (let i = 0; i < deviceIds.length; i++) {
            let deviceId = deviceIds[i];
            if (deviceData.hasOwnProperty(deviceId)) {
                states[deviceId] = deviceData[deviceId].states;
            }
        }
    }

    return states;
};


Data.getStatus = function (deviceIds = undefined) {
    // return Data.getUid(uid);
    if (!deviceData) {
        console.error("cannot getStatus of devices without first registering the user!");
        return;
    }

    // console.log('getStatus deviceIds', deviceIds);
    if (!deviceIds || deviceIds == {}
        || (Object.keys(deviceIds).length === 0 && deviceIds.constructor === Object))
        return deviceData;

    let devices = {};
    for (let i = 0; i < deviceIds.length; i++) {
        let curId = deviceIds[i];
        if (!deviceData[curId])
            continue;
        devices[curId] = deviceData[curId];
        // console.log('devices[curId]', devices[curId]);
    }
    // console.log('devices', devices);
    return devices;
};

Data.getProperties = function (deviceIds = undefined) {
    // console.log('getProperties', uid);
    let properties = {};

    if (!deviceIds) {
        Object.keys(deviceData).forEach(function (deviceId) {
            if (deviceData.hasOwnProperty(deviceId)) {
                properties[deviceId] = deviceData[deviceId].properties;
            }
        });
    } else {
        for (let i = 0; i < deviceIds.length; i++) {
            let deviceId = deviceIds[i];
            if (deviceData.hasOwnProperty(deviceId)) {
                properties[deviceId] = deviceData[deviceId].properties;
            }
        }
    }

    return properties;
};

Data.execDevice = function (device) {
    if (!deviceData) {
        console.error("cannot register a device without first registering the user!");
        return;
    }
    // console.log('execDevice', device);
    if (!deviceData[device.id])
        deviceData[device.id] = {
            states: {},
            properties: {}
        };
    if (device.hasOwnProperty('properties')) {
        // update properties
        Object.keys(device.properties).forEach(function (key) {
            if (device.properties.hasOwnProperty(key)) {
                // console.log('property ' + key, device.properties[key]);
                deviceData[device.id].properties[key] = device.properties[key];
            }
        });
    }
    if (device.hasOwnProperty('states')) {
        // update states
        Object.keys(device.states).forEach(function (key) {
            if (device.states.hasOwnProperty(key)) {
                // console.log('state ' + key, device.states[key]);
                deviceData[device.id].states[key] = device.states[key];
            }
        });
    }
};

module.exports.username = Auth.username;
module.exports.password = Auth.password;
module.exports.topicSync = Auth.topicSync;
module.exports.topicSyncRes = Auth.topicSyncRes;
module.exports.topicQuery = Auth.topicQuery;
module.exports.topicQueryRes = Auth.topicQueryRes;
module.exports.topicExec = Auth.topicExec;
module.exports.topicExecRes = Auth.topicExecRes;
module.exports.topicDiscover = Auth.topicDiscover;
module.exports.topicDiscoverRes = Auth.topicDiscoverRes;
module.exports.topicControl = Auth.topicControl;
module.exports.topicControlRes = Auth.topicControlRes;
module.exports.mqttHost = Auth.mqtt_host;
module.exports.mqttPort = Auth.mqtt_port;
module.exports.getStates = Data.getStates;
module.exports.execDevice = Data.execDevice;
module.exports.getStatus = Data.getStatus;
module.exports.getProperties = Data.getProperties;
module.exports.data = deviceData;
module.exports.alexaData = alexaDevices;