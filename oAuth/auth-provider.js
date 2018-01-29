// Copyright 2017, Google, Inc.
/**
 * This auth is going to use the Authorization Code flow, described in the docs:
 * https://developers.google.com/actions/develop/identity/oauth2-code-flow
 */

const Auth = {};
const authstore = require('../model');
const util = require('util');
const session = require('express-session');


Auth.getAccessToken = function (request) {
    return request.headers.authorization ? request.headers.authorization.split(' ')[1] : null;
};

Auth.getUid = function (request) {
    return request.headers.uid;
};

const SmartHomeModel = {};
function genUid() {
    let uid = Math.floor(Math.random() * 1000).toString();
    authstore.getUser(uid, function (err, userObj) {
        if (!userObj)
            return uid;
        uid = genUid();
    });
}

function genRandomString() {
    return Math.floor(Math.random() * 10000000000000000000000000000000000000000).toString(36);
}

SmartHomeModel.genUser = function (username, password) {
    let uid = genUid();
    let token = genRandomString();

    if (authstore.saveUser(uid, username, password, token))
        console.log('User %s saved successfully.', username);

    if (authstore.saveAccessToken(uid, token))
        console.log('User %s Tokens saved successfully. ', username);
};

SmartHomeModel.generateAuthCode = function (uid, clientId) {
    let authCode = genRandomString();
    if (authstore.saveAuthCode(uid, authCode, clientId)) {
        console.log('User Id %s saved authCode successfully', uid);
    }
    return authCode;
};

SmartHomeModel.getAccessToken = function (code, callback) {
    authstore.findAuthCode(code, function (err, authCode) {
        if (!authCode) {
            console.error('invalid code');
            callback(false);
        }
        if (new Date(authCode.expiresAt) < Date.now()) {
            console.error('expired code');
            callback(false);
        }

        authstore.findUser(authCode.uid, function (err, user) {
            if (!user) {
                console.error('could not find user');
                callback(false);
            }
            authstore.findToken(user.tokens[0], function (err, accessToken) {
                console.log('getAccessToken = ', accessToken);
                if (!accessToken || !accessToken.uid) {
                    console.error('could not find accessToken');
                    callback(false);
                }

                let returnToken = {
                    token_type: "bearer",
                    access_token: accessToken.accessToken,
                    refresh_token: accessToken.refreshToken
                };

                console.log('return getAccessToken = ', returnToken);
                callback(returnToken);
            });
        });
    });
};

SmartHomeModel.getClient = function (clientId, clientSecret, callback) {

    authstore.findClient(clientId, function (err, client) {
        if (!client || (client.clientSecret !== clientSecret)) {
            console.log('clientSecret doesn\'t match %s, %s', client.clientSecret, clientSecret);
            callback(false);
        }
        console.log('return getClient', client);
        callback(client);
    });
};

SmartHomeModel.getUser = function (username, password, callback) {
    console.log('getUser', username);
    authstore.findUserName(username, function (err, userObj) {
        if (!userObj) {
            console.log('not a user', userObj);
            SmartHomeModel.genUser(username, password);
            authstore.findUserName(username, function (err, userObj) {
                if (!userObj) {
                    console.log('failed to genUser', userObj);
                    callback(false);
                }
            });
        }

        authstore.findUser(userObj.uid, function (err, user) {
            if (!user) {
                console.log('not a user', user);
                callback(false);
            }
            if (user.password !== password) {
                console.log('passwords do not match!', user);
                callback(false);
            }
            callback(user);
        });
    });
};

Auth.registerAuth = function (app) {
    /**
     * expecting something like the following:
     *
     * GET https://myservice.example.com/auth? \
     *   client_id=GOOGLE_CLIENT_ID - The Google client ID you registered with Google.
     *   &redirect_uri=REDIRECT_URI - The URL to which to send the response to this request
     *   &state=STATE_STRING - A bookkeeping value that is passed back to Google unchanged in the result
     *   &response_type=code - The string code
     */
    app.get('/oauth', function (req, res) {
        let client_id = req.query.client_id;
        let redirect_uri = req.query.redirect_uri;
        let state = req.query.state;
        let response_type = req.query.response_type;
        let authCode = req.query.code;
        console.log('req: ', req);
        if ('code' != response_type)
            return res.error('response_type ' + response_type + ' must equal "code"');

        authstore.findClient(client_id, function (err, clientObj) {
            if (err || !clientObj)
                return res.error('client_id ' + client_id + ' invalid');

            // if you have an authcode use that
            if (authCode) {
                return res.redirect(util.format('%s?code=%s&state=%s',
                    redirect_uri, authCode, state
                ));
            }

            let user = req.session.user;
            // Redirect anonymous users to login page.
            if (!user) {
                return res.redirect(util.format('/login?client_id=%s&redirect_uri=%s&redirect=%s&state=%s',
                    client_id, encodeURIComponent(redirect_uri), req.path, state));
            }

            console.log('login successful ', user.name);
            authCode = SmartHomeModel.generateAuthCode(user.uid, client_id);

            if (authCode) {
                console.log('authCode successful ', authCode);
                return res.redirect(util.format('%s?code=%s&state=%s',
                    redirect_uri, authCode, state));
            }

            return res.status(400).send('something went wrong');

        });
    });

    app.set('view engine', 'ejs');

    // Get login.
    app.get('/login', function (req, res) {
        return login(req, res);
    });

    // Post login.
    app.post('/login', function (req, res) {
        console.log('/login ', req.body);
        SmartHomeModel.getUser(req.body.username, req.body.password, function (user) {
            if (!user) {
                console.log('not a user', user);
                return login(req, res);
            }

            console.log('logging in ', user);
            req.session.user = user;

            // Successful logins should send the user back to /oauth/.
            let path = decodeURIComponent(req.body.redirect) || '/frontend';

            console.log('login successful ', user.name);
            let authCode = SmartHomeModel.generateAuthCode(user.uid, req.body.client_id);

            if (authCode) {
                console.log('authCode successful ', authCode);
                console.log(util.format('%s?code=%s&state=%s',
                    decodeURIComponent(req.body.redirect_uri), authCode, req.body.state));
                return res.redirect(util.format('%s?code=%s&state=%s',
                    decodeURIComponent(req.body.redirect_uri), authCode, req.body.state));
            } else {
                console.log('authCode failed');
                return res.redirect(util.format('%s?client_id=%s&redirect_uri=%s&state=%s&response_type=code',
                    path, req.body.client_id, req.body.redirect_uri, req.body.state));
            }
        });

    });

    /**
     * client_id=GOOGLE_CLIENT_ID
     * &client_secret=GOOGLE_CLIENT_SECRET
     * &response_type=token
     * &grant_type=authorization_code
     * &code=AUTHORIZATION_CODE
     *
     * OR
     *
     *
     * client_id=GOOGLE_CLIENT_ID
     * &client_secret=GOOGLE_CLIENT_SECRET
     * &response_type=token
     * &grant_type=refresh_token
     * &refresh_token=REFRESH_TOKEN
     */
    app.all('/token', function (req, res) {
        console.log('/token query', req.query);
        console.log('/token body', req.body);
        let client_id = req.query.client_id ? req.query.client_id : req.body.client_id;
        let client_secret = req.query.client_secret ? req.query.client_secret : req.body.client_secret;
        let grant_type = req.query.grant_type ? req.query.grant_type : req.body.grant_type;

        if (!client_id || !client_secret) {
            console.error('missing required parameter');
            return res.status(400).send('missing required parameter');
        }

        // if ('token' != req.query.response_type) {
        //     console.error('response_type ' + req.query.response_type + ' is not supported');
        //     return res.status(400).send('response_type ' + req.query.response_type + ' is not supported');
        // }

        SmartHomeModel.getClient(client_id, client_secret, function (client) {
            console.log('client', client);
            if (!client) {
                console.error('incorrect client data');
                return res.status(400).send('incorrect client data');
            }

            if ('authorization_code' === grant_type)
                return handleAuthCode(req, res);
            else if ('refresh_token' === grant_type)
                return handleRefreshToken(req, res);
            else {
                console.error('grant_type ' + grant_type + ' is not supported');
                return res.status(400).send('grant_type ' + grant_type + ' is not supported');
            }
        });

    });
};


// code=wk41krp1kz4s8cs00s04s8o4s
// &redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground
// &client_id=RKkWfsi0Z9
// &client_secret=eToBzeBT7OwrPQO8mZHsZtLp1qhQbe
// &scope=
// &grant_type=authorization_code


/**
 * @return {{}}
 * {
 *   token_type: "bearer",
 *   access_token: "ACCESS_TOKEN",
 *   refresh_token: "REFRESH_TOKEN"
 * }
 */
function handleAuthCode(req, res) {
    console.log('handleAuthCode', req.query);
    let client_id = req.query.client_id ? req.query.client_id : req.body.client_id;
    let client_secret = req.query.client_secret ? req.query.client_secret : req.body.client_secret;
    let code = req.query.code ? req.query.code : req.body.code;

    SmartHomeModel.getClient(client_id, client_secret, function (client) {
        if (!code) {
            console.error('missing required parameter');
            return res.status(400).send('missing required parameter');
        }
        if (!client) {
            console.error('invalid client id or secret %s, %s', client_id, client_secret);
            return res.status(400).send('invalid client id or secret');
        }

        authstore.findAuthCode(code, function (err, authCode) {
            if (!authCode) {
                console.error('invalid code');
                return res.status(400).send('invalid code');
            }
            if (new Date(authCode.expiresAt) < Date.now()) {
                console.error('expired code');
                return res.status(400).send('expired code');
            }
            if (authCode.clientId != client_id) {
                console.error('invalid code - wrong client', authCode);
                return res.status(400).send('invalid code - wrong client');
            }

            SmartHomeModel.getAccessToken(code, function (token) {
                if (!token) {
                    console.error('unable to generate a token', token);
                    return res.status(400).send('unable to generate a token');
                }

                console.log('respond success', token);
                return res.status(200).json(token);
            });
        });

    });



}

/**
 * @return {{}}
 * {
 *   token_type: "bearer",
 *   access_token: "ACCESS_TOKEN",
 * }
 */
function handleRefreshToken(req, res) {
    let client_id = req.query.client_id ? req.query.client_id : req.body.client_id;
    let client_secret = req.query.client_secret ? req.query.client_secret : req.body.client_secret;
    let refresh_token = req.query.refresh_token ? req.query.refresh_token : req.body.refresh_token;

    SmartHomeModel.getClient(client_id, client_secret, function (client) {
        if (!client) {
            console.error('invalid client id or secret %s, %s', client_id, client_secret);
            return res.error('invalid client id or secret');
        }

        if (!refresh_token) {
            console.error('missing required parameter');
            return res.error('missing required parameter');
        }

        res.status(200).json({
            token_type: "bearer",
            access_token: refresh_token
        });
    });

}

function login(req, res) {
    return res.render('login', {
        redirect: encodeURIComponent(req.query.redirect),
        client_id: req.query.client_id,
        state: req.query.state,
        redirect_uri: encodeURIComponent(req.query.redirect_uri)
    });
}

exports.genRandomString = genRandomString;
exports.registerAuth = Auth.registerAuth;
exports.getAccessToken = Auth.getAccessToken;
exports.getUid = Auth.getUid;
