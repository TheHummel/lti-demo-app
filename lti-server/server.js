require('dotenv').config();
const path = require('path');
const lti = require('ltijs').Provider;
const Database = require('ltijs-sequelize')
// Initialize database connection
const db = new Database(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
});

// // Setup LTI provider (mongodb)
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

// Setup LTI provider (postgres)
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
      domain: 'https://b58a-89-206-81-34.ngrok-free.app',
    },
    devMode: true,
  }
)

// LTI launch callback
lti.onConnect((token, req, res) => {
    console.log(token);
    const ltik = res.locals.ltik;
    console.log('ltik: ', ltik);
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

    // res.cookie('ltiSession', token.platformContext.ltiVersion, { maxAge: 900000, httpOnly: true });

    // const lineItemUrl = encodeURIComponent(token.platformContext.endpoint.lineitem);
    // const redirectUrl = `https://lti-demo-app.vercel.app/?lineItemUrl=${lineItemUrl}&ltik=${token}`;

    const redirectUrl = `https://lti-demo-app.vercel.app/?ltik=${ltik}`;
    res.redirect(redirectUrl);
});

// setup function
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
  console.log('POST-request to /grade: ')
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
    console.log('Sending grade: ', gradeObj)
    console.log('lineItemId: ', lineItemId)
    const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj)
    return res.send(responseGrade)
  } catch (err) {
    return res.status(500).send({ err: err.message })
  }
})

// retrieving grades - NOT WORKING YET
lti.app.get('/grade', async (req, res) => {
  // Retrieves grades from a platform, only for the current user
  console.log('GET-request to /grade: ')
  const idtoken = res.locals.token // IdToken
  console.log('idtoken: ', idtoken)
  const response = await lti.Grade.getScores(idtoken, idtoken.platformContext.endpoint.lineitem, { userId: idtoken.user })
  return res.send(response)
})

// Get user and context information
lti.app.get('/info', async (req, res) => {
  // // Test:
  // res.json({ message: "Info Endpunkt wurde erreicht" });
  // console.log('request from client: ', req);
  console.log('GET-request to /info: ')

  const token = res.locals.token
  const context = res.locals.context

  const info = { }
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (context.roles) info.roles = context.roles
  if (context.context) info.context = context.context

  return res.send(info)
});

// Names and Roles route
lti.app.get('/members', async (req, res) => {
  try {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token)
    if (result) return res.send(result.members)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Retrieving lineitems
lti.app.get('/lineitem', async (req, res) => {
  // Retrieves lineitems from a platform
  try {
  const result  = await lti.Grade.getLineItems(res.locals.token)
  } catch (err) {
    console.log('ERROR MESSAGE: ' + err.message)
    return res.status(500).send(err.message)
  }
  console.log(result)
  const url = 'https://lti-demo-app.vercel.app'
  res.setHeader('Access-Control-Allow-Origin', 'https://lti-demo-app.vercel.app'); // You can specify specific origins instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  return res.send(result)
})

// Creating lineitem
lti.app.post('/lineitem', async (req, res) => {
  const lineItem = {
          scoreMaximum: 100,
          label: 'Grade',
          tag: 'grade'
        }
  // Sends lineitem to a platform
  await lti.Grade.createLineItem(res.locals.token, lineItem)
  return res.sendSatus(201)
})


setup().catch((e) => console.error(e));
