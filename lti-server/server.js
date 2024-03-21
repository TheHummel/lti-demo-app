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
    appRoute: '/',
    loginRoute: '/login',
    cookies: {
      secure: true,
      sameSite: 'None',
    },
    devMode: true,
  }
)

// LTI launch callback
lti.onConnect((token, req, res) => {
    console.log(token);
    // return res.send("It's alive!");

    // try {
    //   const idToken = res.locals.token;
    //   const lineItemId = idToken.platformContext.endpoint.lineitem; // Beispiel-LineItem-ID
    //   const response = await lti.Grade.getScores(idToken, lineItemId, { userId: idToken.user });
    //   res.json(response);
    // } catch (error) {
    //   console.error("Error retrieving grades: ", error);
    //   res.status(500).send({ error: error.message });
    // }

    const lineItemUrl = encodeURIComponent(token.platformContext.endpoint.lineitem);
    const redirectUrl = `https://lti-demo-app.vercel.app/?lineItemUrl=${lineItemUrl}`;
    res.redirect(redirectUrl);
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

// sending grades - NOT WORKING YET
lti.app.post('/grade', async (req, res) => {
  try {
    const idtoken = res.locals.token // IdToken
    const score = req.body.grade // User numeric score sent in the body
    // Creating Grade object
    const gradeObj = {
      userId: idtoken.user,
      scoreGiven: score,
      scoreMaximum: 100,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded'
    }

    // Selecting linetItem ID
    let lineItemId = idtoken.platformContext.endpoint.lineitem // Attempting to retrieve it from idtoken
    if (!lineItemId) {
      const response = await lti.Grade.getLineItems(idtoken, { resourceLinkId: true })
      const lineItems = response.lineItems
      if (lineItems.length === 0) {
        // Creating line item if there is none
        console.log('Creating new line item')
        const newLineItem = {
          scoreMaximum: 100,
          label: 'Grade',
          tag: 'grade',
          resourceLinkId: idtoken.platformContext.resource.id
        }
        const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem)
        lineItemId = lineItem.id
      } else lineItemId = lineItems[0].id
    }

    // Sending Grade
    const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj)
    return res.send(responseGrade)
  } catch (err) {
    return res.status(500).send({ err: err.message })
  }
})

// retrieving grades - NOT WORKING YET
lti.app.get('/grade', async (req, res) => {
  // Retrieves grades from a platform, only for the current user
  const idtoken = res.locals.token // IdToken
  const response = await lti.Grade.getScores(idtoken, idtoken.platformContext.endpoint.lineitem, { userId: idtoken.user })
  return res.send(result)
})

setup().catch((e) => console.error(e));
