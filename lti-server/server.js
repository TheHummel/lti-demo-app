require('dotenv').config();
const path = require('path');
const lti = require('ltijs').Provider;

// Setup provider
lti.setup(process.env.LTI_KEY, {
    url: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    // connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
}, {
    appRoute: '/',
    loginRoute: '/login',
    cookies: {
        secure: false,
        sameSite: ''
    },
    devMode: true
}, {
    encryptionKey: process.env.ENCRYPTION_KEY
});

// LTI launch callback
lti.onConnect((token, req, res) => {
    console.log(token);
    return res.send("It's alive!");
});

const setup = async () => {
    await lti.deploy({ port: process.env.PORT || 4000 });

    // Optional: Register platform if you're setting this up for the first time
    /* await lti.registerPlatform({
        url: 'https://platform.url',
        name: 'Platform Name',
        clientId: 'TOOLCLIENTID',
        authenticationEndpoint: 'https://platform.url/auth',
        accesstokenEndpoint: 'https://platform.url/token',
        authConfig: { method: 'JWK_SET', key: 'https://platform.url/keyset' }
    }); */
};

setup().catch((e) => console.error(e));
