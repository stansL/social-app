const express = require('express');
const router = express.Router();
const { db } = require('../util/admin');
const FBAuth = require('../util/fbAuth');

const getAllScreams = (req, res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(screams);
        })
        .catch(err => console.error(err));
};

const postScream = (req, res) => {
    const { body } = req.body;
    const newScream = {
        body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
        // createdAt: admin.firestore.Timestamp.fromDate(new Date())
    }
    db
        .collection('screams')
        .add(newScream)
        .then(ref => {
            console.log(`Document written with ID of : ${ref.id}`);
            res.json({ msg: `Document ${ref.id} created successfully!` });
        })
        .catch(err => {
            res.status(500).json({ error: `Error occured: ${err}` })
            console.error('Error adding document: ', err)
        });
}


router.get('/', getAllScreams);
router.post('/', FBAuth, postScream);

module.exports = router;