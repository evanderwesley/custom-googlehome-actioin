/**
 * Created by snake on 6/29/2017.
 */
let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    model = module.exports;

/**
 * Connecting to Mongo DB.
 * @type {string}
 */

let mongoUri = 'mongodb://localhost/test';
mongoose.connect(mongoUri, function (err, res) {
    if (err) {
        return console.error('Error connecting to "%s":', mongoUri, err);
    }
    console.log('Connected successfully to "%s"', mongoUri);
});


/**
 * Schema Definition for access Token, Username, Client, Users
 */


let OAuthTokensSchema = new Schema({
    uid: {type: String},
    accessToken: {type: String},
    refreshToken: {type: String},
});

let OAuthClientsSchema = new Schema({
    clientId: {type: String},
    clientSecret: {type: String}
});

let OAuthUsersSchema = new Schema({
    uid: {type: String},
    name: {type: String},
    password: {type: String},
    tokens: {type: Array}
});

let OAuthCodeSchema = new Schema({
    type: {type: String},
    authCode: {type: String},
    uid: {type: String},
    clientId: {type: String},
    expiresAt: {type: Date}
});

let DeviceIdsSchema = new Schema({
    uid: {type: String},
    device: {
        properties: {type: String,
            get: function (data) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            },
            set: function (data) {
                return JSON.stringify(data);
            }},
        states:{type: String,
            get: function (data) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            },
            set: function (data) {
                return JSON.stringify(data);
            }}
    }
});


let DevicesSchema = new Schema({
    uid: {type: String},
    deviceIds: [DeviceIdsSchema]
});

mongoose.model('tokens', OAuthTokensSchema);
mongoose.model('clients', OAuthClientsSchema);
mongoose.model('users', OAuthUsersSchema);
mongoose.model('authCode', OAuthCodeSchema);
mongoose.model('devices', DevicesSchema);

let OAuthAccessTokensModel = mongoose.model('tokens'),
    OAuthClientsModel = mongoose.model('clients'),
    OAuthUsersModel = mongoose.model('users'),
    OAuthCodeModel = mongoose.model('authCode'),
    DeviceModel = mongoose.model('devices');


/**
 * Callback for OAuth Server.
 * @param clientId
 * @param clientSecret
 * @param callback
 * @returns {*}
 */


////////////////////////////// Device Model ////////////////////////////////////
/**
 * Save Device Information
 */

model.saveDevices = function (uid, devInfo) {
    let devices = new DeviceModel({
        uid: uid,
        deviceIds: devInfo
    });

    devices.save(function (err, result) {
        if (err) {
            console.log('model.saveAccessToken: %s', err);
            return false
        }
        console.log("saved Device information successfully.");
        return true;
    });
};


//////////////////////////////// Client Model /////////////////////////////////
/**
 * Get client.
 */

model.findClient = function (clientId, callback) {
    OAuthClientsModel.findOne({clientId: clientId}, callback);
  };

/**
 * Grant type allowed.
 */

model.grantTypeAllowed = function (clientId, grantType, callback) {

    callback(false, grantType === "password");
};

//////////////////////////////////////////Token Model//////////////////////////
/**
 * Save token.
 */

model.isValidAuth =  function (uid, accessToken, callback){
    OAuthAccessTokensModel.findOne({uid: uid, accessToken: accessToken}, callback);
}

model.saveAccessToken = function (uid, accessToken) {

    let token = new OAuthAccessTokensModel({
        uid: uid,
        accessToken: accessToken,
        refreshToken: accessToken
    });

    token.save(function (err, result) {
        if (err) {
            console.log('model.saveAccessToken: %s', err);
            return false
        }

        return true;

    });
};

model.findToken = function (token, callback) {
    console.log('findToken starting');
    OAuthAccessTokensModel.findOne({accessToken: token}, callback);
};

///////////////////////////// User Model ///////////////////////////////
/**
 * Get user.
 */

model.getUser = function (uid, callback) {

    OAuthUsersModel.findOne({uid: uid},callback);
};

model.saveUser = function (uid, username, password, token) {
    let UserModel = new OAuthUsersModel({
        uid: uid,
        name: username,
        password: password,
        tokens: [token]
    });
    UserModel.save(function (err, result) {
        if (err) {
            console.log('model.saveUser: %s', err);
            return false
        }

        return true;
    })
};

model.findUser = function(uid, callback) {

    OAuthUsersModel.findOne({uid: uid}, callback)
};

model.findUserName = function(username, callback) {
    OAuthUsersModel.findOne({name: username}, callback)
};


///////////////////////////////////// AuthCode model ////////////////////////////////

model.saveAuthCode = function (uid, authCode, clientId) {
    let AuthModel = new OAuthCodeModel({
        authCode: authCode,
        type: 'AUTH_CODE',
        uid: uid,
        clientId: clientId,
        expiresAt: new Date(Date.now() + (60 * 10000))
    });
    AuthModel.save(function (err, result) {
        if (err) {
            console.log('model.saveAuthCode: %s', err);
            return false;
        }
        return true;
    })
};

model.findAuthCode = function (code, callback) {
    OAuthCodeModel.findOne({authCode: code}, callback)
};