require('dotenv').config();
const path = require('path');
const lti = require('ltijs').Provider;
const Database = require('ltijs-sequelize')

const db = new Database(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
});

// // Setup provider for mongodb
// lti.setup(process.env.LTI_KEY, {
//     url: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
//     // connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
// }, {
//     appRoute: '/',
//     loginRoute: '/login',
//     cookies: {
//         secure: true,
//         sameSite: 'None'
//     },
//     devMode: true,
//     logger: true,
//     debugging: true,
// }, {
//     encryptionKey: process.env.ENCRYPTION_KEY
// });

// Setup for postgres
lti.setup(process.env.LTI_KEY,
  { 
    plugin: db,
  },
  { // Options
    appRoute: '/', loginRoute: '/login',
    cookies: {
      secure: true,
      sameSite: 'None',
    },
    devMode: true,
  }
)

// LTI launch callback
lti.onConnect((token, req, res) => {
    // console.log(token);
    // return res.send("It's alive!");

    const nextAppUrl = 'https://lti-demo-app.vercel.app/';
    res.redirect(nextAppUrl);
});

const setup = async () => {
    await lti.deploy({ port: process.env.PORT || 4000 });

    // Optional: Register platform if you're setting this up for the first time
    await lti.registerPlatform({
        url: 'https://lms.uzh.ch',
        name: 'OLAT UZH',
        clientId: '8ea57ec8-1ca7-4ed3-830e-65741a4a35c2',
        authenticationEndpoint: 'https://lms.uzh.ch/lti/auth',
        accesstokenEndpoint: 'https://lms.uzh.ch/lti/token',
        authConfig: { method: 'JWK_SET', key: 'https://lms.uzh.ch/lti/keys' }
    });
};

setup().catch((e) => console.error(e));
