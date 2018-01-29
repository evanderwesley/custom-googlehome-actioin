/**
 * Created by Evander on 6/30/2017.
 */

let request = require('request');

let particleServer = "https://shapi.touchpanelcontrol.com:8443/alexa";


exports.handler = function (event, context) {

    log('Input', event);

    switch (event.header.namespace) {

        case 'Alexa.ConnectedHome.Discovery':
            handleDiscovery(event, context);
            break;

        case 'Alexa.ConnectedHome.Control':
            handleControl(event, context);
            break;

        default:
            log('Err', 'No supported namespace: ' + event.header.namespace);
            context.fail('Something went wrong');
            break;
    }
};


function handleDiscovery(event, context) {

    console.log('event: ', event);
    let accessToken = event.payload.accessToken;
    /**
     * Crafting the response header
     */
    let headers = {
        authorization: "Bear " + accessToken,
        namespace: 'Alexa.ConnectedHome.Discovery',
        name: 'DiscoverAppliancesResponse',
        payloadVersion: '2'
    };


    let options = {
        method: 'POST',
        url: particleServer,
        headers: {
            'cache-control': 'no-cache',
            authorization: 'Bearer ' + accessToken,
            'content-type': 'application/json'
        },
        body: {inputs: [{intent: 'Alexa.ConnectedHome.Discovery'}]},
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let payloads = {
            discoveredAppliances: body.payload.devices
        };
        let result = {
            header: headers,
            payload: payloads
        };
        console.log(body);
        log('Discovery', result);

        context.succeed(result);
    });
}

/**
 * Control events are processed here.
 * This is called when Alexa requests an action (IE turn off appliance).
 */
function handleControl(event, context) {
    if (event.header.namespace === 'Alexa.ConnectedHome.Control') {

        /**
         * Retrieve the appliance id and accessToken from the incoming message.
         */
        let accessToken = event.payload.accessToken;
        let applianceId = event.payload.appliance.applianceId;
        let deviceid = event.payload.appliance.additionalApplianceDetails.deviceId;
        let message_id = event.header.messageId;
        let param = "";
        let index = "0";
        let state = 0;
        let confirmation;
        let funcName;

        log("Access Token: ", accessToken);
        log("DeviceID: ", deviceid);

        if (event.header.name == "TurnOnRequest") {
            state = 1;
            confirmation = "TurnOnConfirmation";
            funcName = "onoff";
        }
        else if (event.header.name == "TurnOffRequest") {
            state = 0;
            confirmation = "TurnOffConfirmation";
            funcName = "onoff";
        }
        else if (event.header.name == "SetPercentageRequest") {
            state = event.payload.percentageState.value;
            confirmation = "SetPercentageConfirmation";
            funcName = "setvalue";
        }
        else if (event.header.name == "IncrementPercentageRequest") {
            let increment = event.payload.deltaPercentage.value;

            state += increment;

            if (state > 100) {
                state = 100;
            }

            confirmation = "IncrementPercentageConfirmation";
            funcName = "setvalue";
        }
        else if (event.header.name == "DecrementPercentageRequest") {
            let decrement = event.payload.deltaPercentage.value;

            state -= decrement;

            if (state < 0) {
                state = 0;
            }

            confirmation = "DecrementPercentageConfirmation";
            funcName = "setvalue";
        }

        let options = {
            method: 'POST',
            url: particleServer,
            headers: {
                'cache-control': 'no-cache',
                authorization: 'Bearer ' + accessToken,
                'content-type': 'application/json'
            },
            body: {
                inputs: [{
                    intent: 'Alexa.ConnectedHome.Control',
                    payload: {
                        devices: deviceid,
                        confirmation: confirmation,
                        state: state,
                        funcName: funcName
                    }
                }]
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            let headers = {
                authorization: "Bear " + accessToken,
                namespace: 'Alexa.ConnectedHome.Control',
                name: body.payload.commands,
                payloadVersion: '2',
                messageId: message_id
            };
            let payloads = {};
            let result = {
                header: headers,
                payload: payloads
            };

            context.succeed(result);
        });
    }
}

/**
 * Utility functions.
 */
function log(title, msg) {
    console.log(title + ": " + msg);
}

