const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp(functions.config().firebase);

exports.saveUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var user = req.body;
        user.isModerator = false;
        admin.firestore()
            .collection('users')
            .doc(user.id)
            .set(user)
            .then((snap) => {
                res.status(200).send("success");
            });
    });
});

exports.addGame = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const game = req.body;
        game.priority = 0;
        admin.firestore()
            .collection('games')
            .add(game)
            .then((snap) => {
                const key = snap.id;
                game.id = key;
                admin.firestore().collection('games').doc(key).set(game);
                res.status(200).send("success");
            });
    });
});

exports.addPlaytest = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const gameId = req.body.gameId;
        const id = req.body.id;
        var db = admin.firestore();

        db.collection('games').doc(gameId).get()
            .then((doc) => {
                var obj = doc.data();
                //make sure that the game's priority is high enough to do it
                if (obj.priority >= 0) {

                    //make sure that the old playtest (if one exists) is propery dealt with
                    db.collection('playtests').doc(id).get()
                        .then((s) => {
                            //if an old one exists
                            if (s.exists) {
                                var playTest = s.data();
                                //if the old one was for a different game
                                if (playTest.gameId != gameId) {
                                    //Fix the old game's priority
                                    db.collection('games').doc(playTest.gameId).get()
                                        .then((oldSnap) => {
                                            var oldObj = oldSnap.data();
                                            db.collection('games').doc(playTest.gameId).update({ priority: oldObj.priority + 1 });
                                        });
                                }
                                else {
                                    //you can't reset your playtest duration this way
                                    res.status(406).send("Already playtesting that game.");
                                    return;
                                }
                            }

                            //record the playtest, and reduce the score.
                            var date = new Date().valueOf();
                            db.collection('games').doc(gameId).update({ priority: obj.priority - 1 });

                            var pt = { gameId: gameId, id: id, started: date, gameName: req.body.gameName };
                            db.collection('playtests').doc(id).set(pt);

                            res.status(200).send("success");
                        });
                }
                else {
                    res.status(406).send("Not enough priority!");
                }
            });
    });
});

exports.updateGame = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const game = req.body;
        var cleanGame = {
            id: game.id,
            name: game.name,
            minPlayerCount: game.minPlayerCount,
            maxPlayerCount: game.maxPlayerCount,
            minTimeInMinutes: game.minTimeInMinutes,
            maxTimeInMinutes: game.maxTimeInMinutes,
            components: game.components,
            description: game.description,
            rulesUrl: game.rulesUrl,
            pnpUrl: game.pnpUrl,
            priority: 0,
            active: game.active
        };

        admin.firestore()
            .collection('games').doc(game.id).get()
            .then((snap) => {
                var bigNum = 1000;
                if (snap.exists) {
                    var oldGame = snap.data();

                    cleanGame.priority = oldGame.priority;
                    if (!game.active && oldGame.active) {
                        cleanGame.priority -= bigNum;
                    }
                    else if (game.active && !oldGame.active && oldGame.priority < -(bigNum / 2)) {
                        cleanGame.priority += bigNum;
                    }

                    admin.firestore().collection('games').doc(game.id)
                        .update(cleanGame)
                        .then((f) => res.status(200).send("success"));
                }
            });
    });
});

function doSave(feedback, res) {
    if (!feedback.id) {
        admin.firestore()
            .collection('feedback')
            .add(feedback)
            .then((snap) => {
                const key = snap.id;
                feedback.id = key;
                admin.firestore().collection('feedback').doc(key).update(feedback);
                res.status(200).send("success");
            });
    }
    else {
        admin.firestore()
            .collection('feedback')
            .doc(feedback.id)
            .set(feedback)
            .then((snap) => {
                res.status(200).send("success");
            });
    }
}

exports.saveFeedback = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const feedback = req.body;
        feedback.approved = false;
        feedback.submitted = false;
        doSave(feedback, res);
    });
});

exports.submitFeedback = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const feedback = req.body;
        feedback.approved = false;
        feedback.submitted = true;
        doSave(feedback, res);
    });
});

exports.approveFeedback = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const feedback = req.body.feedback;
        const uid = req.body.uid
        admin.firestore()
            .collection('users')
            .where("uid", "==", uid)
            .get()
            .then((snap) => {
                if (snap.size == 1) {
                    var mod = snap.docs[0].isModerator;
                    if (mod) {
                        feedback.approved = true;
                        feedback.submitted = true;
                        doSave(feedback, res);
                    }
                }
            });
    });
}); 