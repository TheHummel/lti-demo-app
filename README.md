# Demo App with OLAT Integration Using LTI

This repository contains a demo app demonstrating integration with OLAT using LTI (Learning Tools Interoperability). The app allows users to authenticate via OLAT and exchange data such as points.


## Setup with Node.js and ngrok
### Requirements
- [Node.js](https://nodejs.org/en/download) for running the server-side logic of the LTI tool
- [ngrok](https://ngrok.com/download) to create a tunnel to your localhost environment so that a LTI launch request from OLAT can be redirected to the local server via a public URL


1. Add course element "LTI page" to OLAT course
2. run ```node server.js``` in lti-server/
3. run ```ngrok http [port]```
4. update (1) the "Initial login URL" in the LTI page settings and (2) ngrokUrl in app/index.js with the forwarding URL page provided by ngrok (like https://xxxx-xx-xxx-xx-xxx.ngrok-free.app/login)
