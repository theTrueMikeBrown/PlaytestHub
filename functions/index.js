const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp(functions.config().firebase);

exports.saveUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const user = req.body;
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
                            var playTest = s.data();

                            //if an old one exists
                            if (playTest && playTest.gameId) {
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
                                    return;
                                    res.status(406).send("Already playtesting that game.");
                                }
                            }

                            //record the playtest, and reduce the score.
                            var date = new Date().valueOf();
                            db.collection('games').doc(gameId).update({ priority: obj.priority - 1 });
                            db.collection('playtests').doc(id).set({ gameId: gameId, id: id, started: date });
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
            name: game.name,
            minPlayerCount: game.minPlayerCount,
            maxPlayerCount: game.maxPlayerCount,
            minTimeInMinutes: game.maxTimeInMinutes,
            maxTimeInMinutes: game.maxTimeInMinutes,
            components: game.components,
            description: game.description,
            rulesUrl: game.rulesUrl,
            pnpUrl: game.pnpUrl,
            inactive: game.inactive
        };

        admin.firestore()
            .collection('games').doc(game.id).get()
            .then((snap) => {
                var bigNum = 1000;

                var oldGame = snap.data();
                if (oldGame) {
                    cleanGame.priority = oldGame.priority;
                    if (game.inactive && !oldGame.inactive) {
                        cleanGame.priority -= bigNum;
                    }
                    else if (!game.inactive && oldGame.inactive && oldGame.priority < -(bigNum / 2)) {
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
            .collection('moderators').doc(uid).get()
            .then((snap) => {
                var mod = snap.data();
                if (mod) {
                    feedback.approved = true;
                    feedback.submitted = true;
                    doSave(feedback, res);
                }
            });
    });
}); 

/*

exports.saveUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const user = req.body;
        admin.database()
            .ref('/users')
            .child(user.id)
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
        admin.database()
            .ref('/games')
            .push(game)
            .then((snap) => {
                const key = snap.key;
                game.id = key;
                admin.database().ref('/games/' + key).update(game);
                res.status(200).send("success");
            });
    });
});

exports.addPlaytest = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const gameId = req.body.gameId;
        const id = req.body.id;
        var db = admin.database();

        db.ref('/games/' + gameId)
            .once('value')
            .then((snap) => {
                var obj = snap.val();
                //make sure that the game's priority is high enough to do it
                if (obj.priority >= 0) {

                    //make sure that the old playtest (if one exists) is propery dealt with
                    db.ref('/playtests/' + id)
                        .once('value')
                        .then((s) => {
                            var playTest = s.val();

                            //if an old one exists
                            if (playTest && playTest.gameId) {
                                //if the old one was for a different game
                                if (playTest.gameId != gameId) {
                                    //Fix the old game's priority
                                    db.ref('/games/' + playTest.gameId)
                                        .once('value')
                                        .then((oldSnap) => {
                                            var oldObj = oldSnap.val();
                                            db.ref('/games/' + playTest.gameId).update({ priority: oldObj.priority + 1 });
                                        });
                                }
                                else {
                                    //you can't reset your playtest duration this way
                                    return;
                                    res.status(406).send("Already playtesting that game.");
                                }
                            }

                            //record the playtest, and reduce the score.
                            var date = new Date().valueOf();
                            db.ref('/games/' + gameId).update({ priority: obj.priority - 1 });
                            db.ref('/playtests/' + id).set({ gameId: gameId, id: id, started: date });
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
            name: game.name,
            minPlayerCount: game.minPlayerCount,
            maxPlayerCount: game.maxPlayerCount,
            minTimeInMinutes: game.maxTimeInMinutes,
            maxTimeInMinutes: game.maxTimeInMinutes,
            components: game.components,
            description: game.description,
            rulesUrl: game.rulesUrl,
            pnpUrl: game.pnpUrl,
            inactive: game.inactive
        };

        admin.database()
            .ref('/games/' + game.id)
            .once('value')
            .then((snap) => {
                var bigNum = 1000;

                var oldGame = snap.val();
                if (oldGame) {
                    cleanGame.priority = oldGame.priority;
                    if (game.inactive && !oldGame.inactive) {
                        cleanGame.priority -= bigNum;
                    }
                    else if (!game.inactive && oldGame.inactive && oldGame.priority < -(bigNum / 2)) {
                        cleanGame.priority += bigNum;
                    }

                    admin.database().ref('/games/' + game.id)
                        .update(cleanGame)
                        .then((f) => res.status(200).send("success"));
                }
            });
    });
});

function doSave(feedback, res) {
    if (!feedback.id) {
        admin.database()
            .ref('/feedback')
            .push(feedback)
            .then((snap) => {
                const key = snap.key;
                feedback.id = key;
                admin.database().ref('/feedback/' + key).update(feedback);
                res.status(200).send("success");
            });
    }
    else {
        admin.database()
            .ref('/feedback')
            .child(feedback.id)
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
        admin.database()
            .ref('/moderators/' + uid)
            .once('value')
            .then((snap) => {
                var mod = snap.val();
                if (mod) {
                    feedback.approved = true;
                    feedback.submitted = true;
                    doSave(feedback, res);
                }
            });
    });
});

*/