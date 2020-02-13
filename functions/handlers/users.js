
const express = require('express');
const router = express.Router();
const { db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { validateSignupData, validateLoginData } = require('../util/validators');
firebase.initializeApp(config);



const userSignup = (req, res) => {
    const { email, password, confirmPassword, handle } = req.body;
    const newUser = {
        email, password, confirmPassword, handle
    }

    const { errors, valid } = validateSignupData(newUser);

    if (!valid) {
        return res.status(400).json(errors);
    }
    let token, userId;
    db
        .doc(`/users/${newUser.handle}`)
        .get()
        .then(data => {
            if (data.exists) {
                return res.status(400).json({ handle: 'this handle is already taken' })
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
                    .then(data => {
                        userId = data.user.uid;
                        return data.user.getIdToken();
                    })
                    .then(idToken => {
                        token = idToken;
                        const userCredentials = {
                            handle: newUser.handle,
                            email: newUser.email,
                            createdAt: new Date().toISOString(),
                            userId
                        };

                        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
                    })
                    .then((() => {
                        return res.status(201).json({ token })
                    }))
                    .catch(err => {
                        console.log(`Error occured: ${err}`);
                        if (err.code === "auth/email-already-in-use") {
                            return res.status(400).json({ email: 'Email address already in use!' });
                        }
                        return res.status(500).json({ error: err.code });

                    });

            }
        });

};

const userLogin = (req, res) => {
    const { email, password } = req.body;
    const user = {
        email, password
    }
    const { errors, valid } = validateLoginData(user);
    if (!valid) {
        return res.status(400).json(errors);
    }


    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(idToken => {
            return res.json({ token: idToken });
        })
        .catch(err => {
            if (err.code === "auth/user-not-found") {
                return res.status(403).json({ general: 'No user with email address' });
            } else if (err.code === "auth/wrong-password") {
                return res.status(403).json({ general: 'Wrong credentials' });
            } else {
                return res.status(500).json({ error: err.code });
            }
        })


}
// Sign up route
router.post('/signup', userSignup);
// Log in route
router.post('/login', userLogin)
module.exports = router;