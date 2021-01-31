
const express = require('express');
const router = express.Router();
const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const FBAuth = require('../util/fbAuth');
const mime = require('mime-types');



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
    const noImage = "blank.png";
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
                            imgUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImage}?alt=media`,
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


};

const uploadImage = (req, res) => {
    const busboy = new Busboy({ headers: req.headers });
    let saveTo, imageFileName;
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.info(fieldname);
        console.info(file);
        console.info(filename);
        console.info(encoding);
        console.info(mimetype);

        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: "Wrong File Type Submitted!" });
        }
        imageFileName = path.basename(filename);
        saveTo = path.join(os.tmpDir(), imageFileName);
        file.pipe(fs.createWriteStream(saveTo));
    });

    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(saveTo, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: mime.lookup(imageFileName)
                    }
                }
            })
            .then(() => {
                const imgUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db
                    .doc(`/users/${req.user.handle}`)
                    .update({
                        imgUrl
                    });
            })
            .then(() => {
                res.json({ message: 'Image uploaded successfully' });
            })
            .catch(err => {
                console.error(`Error occured while uploading file: ${err}`)
                return res.status(500).json({ error: `Error occured while uploading file: ${err}` });
            });

    });
    busboy.end(req.rawBody);

};

const addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);
    db
        .doc(`/users/${req.user.handle}`)
        .update(userDetails)
        .then(() => {
            return res.json({ message: "User details added successfuly" });
        })
        .catch(err => {
            console.error(`Error while adding user details: ${err}`);
            return res.status(500).json({ error: `Error while adding user details: ${err.code}` });
        })

};

const getAuthenticatedUserProfile = (req, res) => {
    let userData = {};
    let likes = [];
    db
        .doc(`/users/${req.user.handle}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db
                    .collection('likes')
                    .where("userHandle", "==", req.user.handle)
                    // .orderBy('createdAt', 'desc')
                    .get();
            }
        })
        .then(data => {
            data.forEach(like => {
                likes.push(like.data());
            });
            userData.likes = likes;
            return res.json(userData);
        })
        .catch(err => {
            console.error(`An error occured while fetching user details: ${err.code}`);
            res.status(500).json({ error: `An error occured while fetching user details: ${err.code}` });

        })
}

// Routes
// Sign up route
router.post('/signup', userSignup);
// Log in route
router.post('/login', userLogin);

// Image upload route
router.post('/image', FBAuth, uploadImage);

// Add user details
router.post('/', FBAuth, addUserDetails);

// Get authenticated user profile: details plus likes
router.get('/', FBAuth, getAuthenticatedUserProfile)







// Export the router module
module.exports = router;