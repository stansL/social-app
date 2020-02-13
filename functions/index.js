const functions = require('firebase-functions');
const express = require('express');
const { getAllScreams, postScream } = require('./handlers/screams');
const { userSignup, userLogin } = require('./handlers/users');

const usersRouter = require('./handlers/users');
const screamsRouter = require('./handlers/screams');

const app = express();




//Screams router
app.use('/screams',screamsRouter);
// Users router
app.use('/users',usersRouter);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));





// exports.api = functions.region('europe-west1').https.onRequest(app); -used to change regions of deployment
exports.api = functions.https.onRequest(app);