/**
 * Created by snake on 6/29/2017.
 */


let mongoose = require('mongoose');
let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let http = require('http');
let https = require('https');
let fs = require('fs');
const session = require('express-session');

const google_ha = require('./commandapi/actions-app');
const alexa_skill = require('./commandapi/alexa-skill');
const config = require('./oAuth/config-provider');
const auth = require('./oAuth/auth-provider');
const datastore = require('./model');
const mqtt_server = require('./mqtt-server/mqtt-server');


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    genid: function (req) {
        return auth.genRandomString()
    },
    secret: 'xyzsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

const appPort = config.devPortSmartHome;

let privateKey = fs.readFileSync('Certificate/private_key.txt', 'utf8');
let certificate = fs.readFileSync('Certificate/Certificate.txt', 'utf8');
let credentials = {key: privateKey, cert: certificate};

let https_server = https.createServer(credentials, app);

const server = https_server.listen(appPort, function () {
    console.log('Smart Home Cloud and App listening at %s', appPort);

    google_ha.registerAgent(app);
    alexa_skill.registerAlexa(app);
    auth.registerAuth(app);
});

