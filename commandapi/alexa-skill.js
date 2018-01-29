/**
 * Created by Evander on 6/30/2017.
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


function registerAlexa(app) {
    console.log('smart-home-alexa-app registerAlexa');


    app.post('/alexa', function (request, response) {
        console.log('post /alexa', request.headers);
        let reqdata = request.body;
        console.log('post /alexa', reqdata);

        let authToken = authProvider.getAccessToken(request);
        console.log('authToken %s', authToken);
        datastore.findToken(authToken, function (err, AccessToken) {
            console.log('AccessToken %s', AccessToken);
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
                    case "Alexa.ConnectedHome.Discovery":
                        console.log('post /alexa Discovery');
                        discover({
                            uid: uid,
                            auth: authToken,
                            requestId: reqdata.requestId
                        }, response);
                        break;
                    case "Alexa.ConnectedHome.Control":
                        console.log('post /alexa Control');
                        control({
                            uid: uid,
                            auth: authToken,
                            requestId: reqdata.requestId,
                            devices: reqdata.inputs[0].payload
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
    app.options('/alexa', function (request, response) {
        response.status(200).set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }).send('null');
    });

    function discover(data, response) {
        datastore.getUser(data.uid, function (err, userObj) {
            if (!userObj) {
                return response.status(500).set({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }).json({error: "failed"});
            }
            let packet = {
                topic: 'user/' + userObj.name + '/discover',
                payload: JSON.stringify({type: "discover", content: "discover"}),
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
                // let deviceList = [];
                // console.log('device list: ', deviceList);
                let deviceProps = {
                    requestId: data.requestId,
                    payload: {
                        devices: devices
                    }
                };
                console.log('sync successful');

                response.status(200).json(deviceProps);
                log.info('sync successful');

                return deviceProps;
            });
        })
    }

    function control(data, response){
        datastore.getUser(data.uid, function (err, userObj) {
            if (!userObj) {
                response.status(500).set({
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }).json({error: "failed"});
                return;
            }
            let packet = {
                topic: 'user/' + userObj.name + '/control',
                payload: JSON.stringify({type: "control", content: {commands: data}}),
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

exports.registerAlexa = registerAlexa;
