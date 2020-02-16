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
        userImage: req.user.imgUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
        // createdAt: admin.firestore.Timestamp.fromDate(new Date())
    }
    db
        .collection('screams')
        .add(newScream)
        .then(ref => {
            const resScream = newScream;
            resScream.screamId = ref.id;
            console.log(`Document written with ID of : ${ref.id}`);
            res.json(resScream);
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

};


// post comment to a scream
const screamComment = (req, res) => {
    let body = req.body.body.trim();
    if (!body) {
        return res.status(400).json({ error: "Comment body must be provided!" });
    }
    let commentData = {
        userHandle: req.user.handle,
        screamId: req.params.screamId,
        body,
        createdAt: new Date().toISOString(),
        userImage: req.user.imgUrl
    };

    db
        .doc(`screams/${req.params.screamId}`)
        .get()
        .then(scream => {
            if (!scream.exists) {
                return res.status(404).json({ error: "Scream does not exist" });
            }
            return db
                .collection('comments')
                .add(commentData);

        })
        .then(() => {
            res.json(commentData);
        })
        .catch(err => {
            console.error(`Error inserting the comment: ${err}`);
            res.status(500).json({ error: err });

        });

};
const likeScream = (req, res) => {
    let screamId = req.params.screamId;
    let likeData = {
        screamId,
        userHandle: req.user.handle
    }
    let screamData;
    db
        .doc(`/screams/${screamId}`)
        .get()
        .then(scream => {
            if (!scream.exists) {
                return res.status(404).json({ error: "Scream not found!" });
            }
            screamData = scream.data();
            screamData.screamId = scream.id;

            // Check if user already liked the same comment
            return db
                .collection('likes')
                .where("userHandle", "==", likeData.userHandle).where("screamId", "==", likeData.screamId)
                .limit(1)
                .get();

        })
        .then(like => {
            if (like.empty) {
                return db
                    .collection('likes')
                    .add(likeData)
                    .then(() => {
                        screamData.likeCount++;
                        return db
                            .doc(`/screams/${screamId}`)
                            .update({ likeCount: screamData.likeCount })
                    })
                    .then(() => {
                        return res.json(screamData);
                    })
            }
            else {
                // user already liked the comment
                return res.status(400).json({ msg: "User already liked the Scream" });
            }
        })
        .catch(err => {
            console.error(`Error inserting the like: ${err}`);
            res.status(500).json({ error: err })
        });
};




const deleteScream = (req, res) => {


};



router.get('/', getAllScreams);
router.post('/', FBAuth, postScream);
router.get('/:screamId', FBAuth, getScream);
// TODO
router.delete('/:screamId', FBAuth, deleteScream);
// TODO like a scream
router.post('/:screamId/like', FBAuth, likeScream);
// TODO unlike a scream
// router.post('/:screamId/unlike', FBAuth, unlikeScream);
// TODO comment on a scream
router.post('/:screamId/comment', FBAuth, screamComment);

module.exports = router;