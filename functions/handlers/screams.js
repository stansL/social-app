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

const getScream = (req, res) => {
    let screamData = {};
    db
        .doc(`/screams/${req.params.screamId}`)
        .get()
        .then(scream => {
            if (!scream.exists) {
                return res.status(404).json({ error: `Scream not found with id: ${req.params.screamId}` })
            }
            screamData = scream.data();
            screamData.screamId = scream.id;
            return db
                .collection('comments')
                .orderBy('createdAt', 'desc')
                .where('screamId', '==', scream.id)
                .get();
        })
        .then(comments => {
            screamData.comments = [];
            comments.forEach(comment => {
                screamData.comments.push(comment.data());
            })
            return res.json(screamData);
        })
        .catch(err => {
            console.error(`Error fetching scream data: ${err}`);
            return res.status(500).json({ error: `Error fetching scream data: ${err}` });
        });

}

const deleteScream = (req, res) => {

}


router.get('/', getAllScreams);
router.post('/', FBAuth, postScream);
router.get('/:screamId', FBAuth, getScream);
// TODO
router.delete('/:screamId', FBAuth, deleteScream);
// TODO like a scream
// TODO unlike a scream
// TODO comment on a scream

module.exports = router;