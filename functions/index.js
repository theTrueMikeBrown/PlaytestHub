const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp(functions.config().firebase);

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
        const uid = req.body.uid;
        var db = admin.database();

        db.ref('/games/' + gameId)
            .once('value')
            .then((snap) => {
                var obj = snap.val();
                //make sure that the game's priority is high enough to do it
                if (obj.priority >= 0) {

                    //make sure that the old playtest (if one exists) is propery dealt with
                    db.ref('/playtests/' + uid)
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
                            db.ref('/playtests/' + uid).set({ gameId: gameId, uid: uid, started: date });
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
