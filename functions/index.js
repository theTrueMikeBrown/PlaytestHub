var FieldValue = require("firebase-admin").FieldValue;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const nodemailer = require('nodemailer');
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword
    }
});

admin.initializeApp(functions.config().firebase);

function cleanUser(user) {
    user.uid = '';
    return user;
}

function internalSendMessage(message) {
    var db = admin.firestore();
    message.isRead = false;
    message.sentDate = new Date();
    db.collection('messages')
        .add(message)
        .then((snap) => {
            const key = snap.id;
            message.id = key;
            admin.firestore().collection('messages').doc(key).set(message);
        });

    db.collection('users').doc(message.recipient).get()
        .then(usnap => {
            if (usnap.exists) {
                var user = usnap.data();
                if (user.forwardMessages && user.email) {
                    var emailAddress = user.email;
                    var subject = `[PH] ${message.subject}`;
                    var sender = message.sender || "PlaytestHub";
                    var messageText = message.text;//.replace(/\r\n/g, "<br />");
                    var body = `Subject: ${subject}
From: ${sender}
----------------------------------------------
${messageText}

This message was forwarded to you from the PlaytestHub MessageCenter.
View the original message at:
https://playtesthub.firebaseapp.com/messages`;
                
                    sendEmail(emailAddress, subject, body);
                }
            }
        });
}

function sendEmail(to, subject, body) {
    const mailOptions = {
        from: "playtesthub <playtesthubnotifications@gmail.com>",
        to: to,
        subject: subject,
        text: body
    };

    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('email sent to:', to);
    });
}

function doSaveFeedback(feedback, uid, res) {
    var db = admin.firestore();
    db.collection('users')
        .where("uid", "==", uid)
        .get()
        .then((usnap) => {
            if (usnap.size === 1) {
                var user = usnap.docs[0].data();
                if (!feedback.id) {
                    feedback.userId = user.id;
                    db.collection('feedback')
                        .add(feedback)
                        .then((snap) => {
                            const key = snap.id;
                            feedback.id = key;
                            db.collection('feedback').doc(key).update(feedback).then(r => {
                                res.status(200).send("success");
                            });
                        });
                }
                else {
                    db.collection('feedback')
                        .doc(feedback.id)
                        .get().then((doc) => {
                            var oldFeedback = doc.data();
                            if (oldFeedback.userId !== user.id) {
                                res.status(401).send("You do not own that feedback!");
                                return;
                            }
                            if (oldFeedback.submitted || oldFeedback.approved) {
                                res.status(406).send("That feedback is already approved!");
                                return;
                            }

                            db.collection('feedback')
                                .doc(feedback.id)
                                .set(feedback)
                                .then((snap) => {
                                    res.status(200).send("success");
                                });
                        });
                }
            }
            else {
                res.status(406).send(usnap.size + " users with that uid!");
            }
        });
}

exports.getUserBySecretId = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var uid = req.body;
        var db = admin.firestore();
        db.collection('users')
            .where("uid", "==", uid)
            .get()
            .then((usnap) => {
                if (usnap.size > 1) {
                    //find the oldest one
                    var min = usnap.docs.reduce(function(a, b) {
                        return new Date(a.data().joinDate) < new Date(b.data().joinDate) ? a : b;
                    });
                    var user = min.data();
                    res.json(cleanUser(user));

                    //wipe out the other one
                    usnap.docs.forEach((d) => {
                        var doc = d.data();
                        if (doc.id !== user.id) {
                            db.collection("users").doc(doc.id).delete();
                        }
                    });
                } else if (usnap.size === 1) {
                    var user = usnap.docs[0].data();
                    res.json(cleanUser(user));
                } else {
                    res.status(406).send(usnap.size + " users with that uid!");
                }
            });
    });
});

exports.getUserById = functions.https.onRequest((req, res) => {
    cors(req,
        res,
        () => {
            var id = req.body;
            var db = admin.firestore();
            db.collection('users')
                .doc(id)
                .get()
                .then(usnap => {
                    if (usnap.exists) {
                        var user = usnap.data();
                        res.json(cleanUser(user));
                    }
                });
        });
});

//https://cron-job.org/en/members/jobs/details/?jobid=825596
exports.dailyCleanup = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        console.log("Running Cleanup...");

        var db = admin.firestore();
        db.collection('history').doc('0').get().then(doc => {
            var history = doc.data();
            var now = new Date();
            var anHourAgo = now.getTime() - 60 * 60 * 1000;

            if (history.lastDailyCleanup.getTime() < anHourAgo) {
                var aWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                db.collection('playtests')
                    .where("started", "<", aWeekAgo).get()
                    .then((s) => {
                        for (var i = 0; i < s.size; i++) {
                            var playTest = s.docs[i].data();
                            db.collection('games').doc(playTest.gameId).get()
                                .then((oldSnap) => {
                                    var oldObj = oldSnap.data();
                                    db.collection('games').doc(playTest.gameId).update({ priority: oldObj.priority + 1 });

                                    internalSendMessage({
                                        id: '',
                                        subject: "Hmm...",
                                        text: "Your playtest has been active for an entire week. We have removed it so that the game is not unfairly punished by someone not playtesting it for too long. If you still desire to playtest it, you can sign up again.\r\n\r\n-PlaytestHub",
                                        sender: '',
                                        recipient: playTest.id
                                    });
                                });
                            db.collection('playtests').doc(playTest.id).delete();

                            db.collection('feedback')
                                .where("userId", "==", playTest.id)
                                .where("gameId", "==", playTest.gameId)
                                .get()
                                .then((snap) => {
                                    for (var i = 0; i < snap.size; i++) {
                                        var feedback = snap.docs[i].data();
                                        db.collection('feedback').doc(feedback.id).delete();
                                    }
                                });

                        }
                    });

                admin.firestore()
                    .collection('history').doc('0').set({ lastDailyCleanup: now });
                console.log("Cleanup is complete.");
            }
            else {
                console.log("Skipping cleanup.");
            }
            res.status(200).send("success");
        });
    });
});

exports.updateUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var user = req.body;
        var updates = {};
        if (user.displayName) { updates.displayName = user.displayName; }
        if (user.photoURL) { updates.photoURL = user.photoURL; }
        if (user.personalInfo) { updates.personalInfo = user.personalInfo; }
        updates.allowsPrivateMessages = !!user.allowsPrivateMessages;
        updates.forwardMessages = !!user.forwardMessages;

        var db = admin.firestore();
        db.collection('users')
            .where("uid", "==", user.uid)
            .get()
            .then((usnap) => {
                if (usnap.size === 1) {
                    var oldUser = usnap.docs[0].data();
                    db.collection('users')
                        .doc(oldUser.id)
                        .update(updates)
                        .then((snap) => {
                            res.status(200).send("success");
                        });
                }
                else {
                    res.status(406).send(usnap.size + " users with that uid!");
                }
            });
    });
});

exports.saveUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var user = req.body;
        user.isModerator = false;
        user.isAdmin = false;
        user.points = 0;
        admin.firestore()
            .collection('users')
            .doc(user.id)
            .set(user)
            .then((snap) => {
                res.status(200).send("success");
                var message = {
                    id: '',
                    subject: "Welcome to PlaytestHub!",
                    text: "Thanks for trying out PlaytestHub!\r\n\r\nIn order to get your games playtested you will need to do 2 things: Add them to the database, and get them to the top of the list so that other users will select them to playtest.\r\n\r\nTo get your games to the top of the list, you need to apply points to them. The easiest way to do this is to earn points by playtesting other user's games.\r\n\r\nIf you have any questions, praise, or feedback, contact theTrueMikeBrown at BGG\r\n\r\n-PlaytestHub",
                    sender: '',
                    recipient: user.id,
                    isRead: false,
                    sentDate: new Date()
                };
                internalSendMessage(message);
            });
    });
});

exports.addGame = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const game = req.body.game;
        const uid = req.body.uid;
        game.priority = 0;
        var db = admin.firestore();

        db.collection('users')
            .where("uid", "==", uid)
            .get()
            .then((usnap) => {
                if (usnap.size === 1) {
                    var user = usnap.docs[0].data();
                    game.owner = user.id;
                    db.collection('games')
                        .add(game)
                        .then((snap) => {
                            const key = snap.id;
                            game.id = key;
                            admin.firestore().collection('games').doc(key).set(game);
                            res.status(200).send("success");

                            var message = {
                                id: '',
                                subject: "Hey!",
                                text: "You just added a new game to PlaytestHub!\r\n\r\nIn order for it to get to the top of the list and be playtested, you should sign up to playtest other player's games. Select a game <a href=\"/games\">here</a>, and then click \"Playtest\" in the menu. Play the game then click Leave Feedback in the menu. Once your feedback is accepted you can get a point with which to make your game appear higher in the list of games to playtest.\r\n\r\n-PlaytestHub",
                                sender: '',
                                recipient: game.owner,
                                isRead: false,
                                sentDate: new Date()
                            };
                            internalSendMessage(message);
                        });
                }
                else {
                    res.status(406).send(usnap.size + " users with that uid!");
                }
            });
    });
});

exports.addPlaytest = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const gameId = req.body.playtest.gameId;
        const uid = req.body.uid;
        var db = admin.firestore();

        Promise.all([
            db.collection('users').where("uid", "==", uid).get(),
            db.collection('games').doc(gameId).get()
        ]).then(values => {
            var usnap = values[0];
            var game = values[1].data();

            if (usnap.size !== 1) {
                console.log("addPlaytest = " + usnap.length + " users with that uid!");
                res.status(406).send(usnap.length + " users with that uid!");
                return;
            }
            if (game.priority < 0) {
                console.log("addPlaytest = " + JSON.stringify(game) + " not enough priority!");
                res.status(406).send("Not enough priority!");
                return;
            }
            var user = usnap.docs[0].data();
            const id = user.id;

            db.collection('playtests').doc(id).get()
                .then((s) => {
                    //make sure that the old playtest (if one exists) is propery dealt with
                    if (s.exists) {
                        var playTest = s.data();
                        if (playTest.gameId === gameId) {
                            console.log("addPlaytest = " + JSON.stringify(playTest) + " already playtesting!");
                            res.status(406).send("Already playtesting that game.");
                            return;
                        }

                        //Fix the old game's priority
                        db.collection('games').doc(playTest.gameId).get()
                            .then((oldSnap) => {
                                var oldGame = oldSnap.data();
                                db.collection('games').doc(playTest.gameId).update({ priority: oldGame.priority + 1 });
                            });

                        //Delete old feedback
                        db.collection('feedback')
                            .where("userId", "==", playTest.id)
                            .where("gameId", "==", playTest.gameId)
                            .get()
                            .then((snap) => {
                                for (var i = 0; i < snap.size; i++) {
                                    var feedback = snap.docs[i].data();
                                    db.collection('feedback').doc(feedback.id).delete();
                                }
                            });
                    }

                    //record the playtest, and reduce the score.
                    var date = new Date();
                    db.collection('games').doc(gameId).update({ priority: game.priority - 1 });

                    var pt = { gameId: gameId, id: id, started: date, gameName: game.name };
                    db.collection('playtests').doc(id).set(pt);
                    res.status(200).send("success");

                    var message = {
                        id: '',
                        subject: "Congrats!",
                        text: user.displayName + " just signed up to playtest " + game.name + "!\r\n\r\n-PlaytestHub",
                        sender: '',
                        recipient: game.owner,
                        isRead: false,
                        sentDate: new Date()
                    };
                    internalSendMessage(message);
                });

        });

        //    db.collection('playtests').doc(id).get(),
        //    db.collection('games').doc(playTest.gameId).get(),
        //    db.collection('feedback').where("userId", "==", playTest.id).where("gameId", "==", playTest.gameId).get()
    });
});

exports.updateGame = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const game = req.body.game;
        const uid = req.body.uid;
        var cleanGame = {};
        if (game.id) { cleanGame.id = game.id; }
        if (game.name) { cleanGame.name = game.name; }
        if (game.minPlayerCount) { cleanGame.minPlayerCount = game.minPlayerCount; }
        if (game.maxPlayerCount) { cleanGame.maxPlayerCount = game.maxPlayerCount; }
        if (game.minTimeInMinutes) { cleanGame.minTimeInMinutes = game.minTimeInMinutes; }
        if (game.maxTimeInMinutes) { cleanGame.maxTimeInMinutes = game.maxTimeInMinutes; }
        if (game.components) { cleanGame.components = game.components; }
        if (game.description) { cleanGame.description = game.description; }
        if (game.rulesUrl) { cleanGame.rulesUrl = game.rulesUrl; }
        if (game.pnpUrl) { cleanGame.pnpUrl = game.pnpUrl; }
        if (game.websiteUrl) { cleanGame.websiteUrl = game.websiteUrl; }
        if (game.version) { cleanGame.version = game.version; }
        cleanGame.priority = 0;
        cleanGame.active = !!game.active;
        var db = admin.firestore();

        db.collection('users')
            .where("uid", "==", uid)
            .get()
            .then((usnap) => {
                if (usnap.size === 1) {
                    var user = usnap.docs[0].data();
                    db.collection('games').doc(game.id).get()
                        .then((snap) => {
                            if (snap.exists) {
                                var oldGame = snap.data();
                                if (oldGame.owner === user.id) {
                                    cleanGame.priority = oldGame.priority;

                                    //console.log("saving = " + JSON.stringify(cleanGame));

                                    admin.firestore().collection('games').doc(game.id)
                                        .update(cleanGame)
                                        .then((f) => res.status(200).send("success"));
                                }
                                else {
                                    res.status(406).send("You don't own that game!");
                                }
                            }
                            else {
                                res.status(406).send("That game doesn't exist!");
                            }
                        });
                }
                else {
                    res.status(406).send(usnap.length + " users with that uid!");
                }
            });
    });
});

exports.saveFeedback = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const feedback = req.body.feedback;
        const uid = req.body.uid;

        feedback.approved = false;
        feedback.submitted = false;
        doSaveFeedback(feedback, uid, res);
    });
});

exports.rejectFeedback = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var db = admin.firestore();
        const feedback = req.body.feedback;
        const uid = req.body.uid;
        const reason = req.body.reason;
        db.collection('users')
            .where("uid", "==", uid)
            .get()
            .then((usnap) => {
                if (usnap.size === 1) {
                    var user = usnap.docs[0].data();
                    var mod = user.isModerator;
                    if (mod) {
                        var modifications = { approved: false, submitted: false };
                        db.collection('feedback')
                            .doc(feedback.id)
                            .update(modifications)
                            .then((snap) => {
                                res.status(200).send("success");

                                db.collection('games').doc(feedback.gameId).get()
                                    .then((gsnap) => {
                                        if (gsnap.exists) {
                                            var game = gsnap.data();
                                            var message = {
                                                id: '',
                                                subject: "Oh Noes!",
                                                text: "Your feedback for " + game.name + " was rejected!\r\n\r\nThe reason that the moderator gave was:\r\n\r\n" + reason + "\r\n\r\nDon't get discouraged! You can fix your feedback <a href=\"/feedback/" + feedback.id + "\">here</a> and resubmit it.\r\n\r\n-PlaytestHub",
                                                sender: '',
                                                recipient: feedback.userId,
                                                isRead: false,
                                                sentDate: new Date()
                                            };
                                            internalSendMessage(message);
                                        }
                                    });

                            });
                        return;
                    }
                    res.status(401).send("You are not authorized to reject this feedback.");
                }
                else {
                    res.status(404).send("user not found.");
                }
            });
    });
});

exports.submitFeedback = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const feedback = req.body.feedback;
        const uid = req.body.uid;
        feedback.approved = false;
        feedback.submitted = true;
        doSaveFeedback(feedback, uid, res);

        var db = admin.firestore();
        db.collection('games').doc(feedback.gameId).get()
            .then((gsnap) => {
                if (gsnap.exists) {
                    var game = gsnap.data();
                    var message = {
                        id: '',
                        subject: "Woot!",
                        text: "Someone left feedback on " + game.name + "!\r\n\r\nClick <a href=\"/feedback/" + feedback.id + "\">here</a> to view it.\r\n\r\n-PlaytestHub",
                        sender: '',
                        recipient: game.owner,
                        isRead: false,
                        sentDate: new Date()
                    };
                    internalSendMessage(message);
                }
            });
    });
});

exports.approveFeedback = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var db = admin.firestore();
        const feedback = req.body.feedback;
        const uid = req.body.uid;
        db.collection('users')
            .where("uid", "==", uid)
            .get()
            .then((usnap) => {
                if (usnap.size === 1) {
                    var user = usnap.docs[0].data();
                    var mod = user.isModerator;
                    db.collection('games').doc(feedback.gameId).get()
                        .then((gsnap) => {
                            if (gsnap.exists) {
                                var game = gsnap.data();
                                var isGameOwner = user.id === game.owner;
                                if (mod || isGameOwner) {
                                    var modifications = { approved: true, submitted: true };
                                    db.collection('feedback')
                                        .doc(feedback.id)
                                        .update(modifications)
                                        .then((snap) => {
                                            res.status(200).send("success");
                                        });

                                    db.collection('playtests').doc(feedback.userId).delete();
                                    db.collection('users').doc(feedback.userId).get()
                                        .then(lsnap => {
                                            if (lsnap.exists) {
                                                var leaver = lsnap.data();
                                                db.collection('users').doc(feedback.userId)
                                                    .update({ points: leaver.points + 1 });
                                            }
                                        });

                                    db.collection('games').doc(feedback.gameId).get()
                                        .then((gsnap) => {
                                            if (gsnap.exists) {
                                                var game = gsnap.data();
                                                var message = {
                                                    id: '',
                                                    subject: "Yes!",
                                                    text: "Your feedbaack for " + game.name + " was approved, and you have earned a point!\r\n\r\nClick <a href=\"/applyPoints\">here</a> to increase your game's priority in the list.\r\n\r\n-PlaytestHub",
                                                    sender: '',
                                                    recipient: feedback.userId,
                                                    isRead: false,
                                                    sentDate: new Date()
                                                };
                                                internalSendMessage(message);

                                                var message2 = {
                                                    id: '',
                                                    subject: "Sweet!",
                                                    text: "Feedback for " + game.name + " was approved.\r\n\r\nClick <a href=\"/feedback/" + feedback.id + "\">here</a> to view it.\r\n\r\n-PlaytestHub",
                                                    sender: '',
                                                    recipient: game.owner,
                                                    isRead: false,
                                                    sentDate: new Date()
                                                };
                                                internalSendMessage(message2);
                                            }
                                        });
                                }
                            }
                        });
                }
            });
    });
});

exports.applyPoints = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const gameId = req.body.gameId;
        const points = req.body.points;
        const uid = req.body.uid;
        //console.log("request = " + JSON.stringify(Object.getOwnPropertyNames(req)));

        var db = admin.firestore();
        db.collection('games').doc(gameId).get()
            .then((snap) => {
                if (snap.exists) {
                    var game = snap.data();

                    db.collection('users')
                        .where("uid", "==", uid).get()
                        .then((usnap) => {
                            if (usnap.size === 1) {
                                var user = usnap.docs[0].data();
                                var pointsApplied = 0;

                                if (points > 0 && user.points > 0) {
                                    //user cannot apply points that would make them negative
                                    pointsApplied = Math.min(points, user.points);
                                }
                                else if (points < 0 && game.priority > 0) {
                                    //game cannot apply points that would make it negative
                                    pointsApplied = Math.max(points, -game.priority);
                                }
                                game.priority += pointsApplied;
                                user.points -= pointsApplied;

                                db.collection('users').doc(user.id).update(user).then((u) => db.collection('games').doc(gameId)
                                    .update(game)
                                    .then((f) => res.status(200).send(pointsApplied === points ? "Points applied successfully." : "" + pointsApplied + " points applied.")));
                            }
                            else {
                                res.status(404).send("user not found.");
                            }
                        });
                }
                else {
                    res.status(404).send("game not found.");
                }
            });
    });
});

exports.sendMessage = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var message = req.body.message;
        var uid = req.body.uid;
        var db = admin.firestore();

        db.collection('users')
            .where("uid", "==", uid)
            .get()
            .then((usnap) => {
                if (usnap.size === 1) {
                    var user = usnap.docs[0].data();
                    message.sender = user.id;

                    internalSendMessage(message);
                    res.status(200).send("success");
                }
                else {
                    res.status(406).send(usnap.size + " users with that uid!");
                }
            });
    });
});

exports.markMessageRead = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        try {
            var id = req.body.id;
            var isRead = req.body.isRead;
            var uid = req.body.uid;
            var db = admin.firestore();

            db.collection('users')
                .where("uid", "==", uid)
                .get()
                .then((usnap) => {
                    if (usnap.size === 1) {
                        var user = usnap.docs[0].data();
                        db.collection('messages')
                            .doc(id)
                            .get().then((doc) => {
                                var oldMessage = doc.data();
                                if (oldMessage.recipient !== user.id) {
                                    res.status(401).send("You are not authorized to mark this message read.");
                                    return;
                                }
                                db.collection('messages')
                                    .doc(id)
                                    .update({ isRead: isRead })
                                    .then(() => {
                                        res.status(200).send("success");
                                    })
                                    .catch((error) => {
                                        res.status(500).send("error: " + error);
                                    });
                            });
                    }
                    else {
                        res.status(406).send(usnap.size + " users with that uid!");
                    }
                });
        } catch (e) {
            res.status(500).send("Exception was thrown: " + e);
        }
    });
});

exports.deleteMessage = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var id = req.body.id;
        var uid = req.body.uid;
        var db = admin.firestore();

        db.collection('users')
            .where("uid", "==", uid)
            .get()
            .then((usnap) => {
                if (usnap.size === 1) {
                    var user = usnap.docs[0].data();
                    db.collection('messages')
                        .doc(id)
                        .get().then((doc) => {
                            var oldMessage = doc.data();
                            if (oldMessage.recipient !== user.id) {
                                res.status(401).send("You are not authorized to mark this message read.");
                                return;
                            }
                            db.collection('messages')
                                .doc(id)
                                .delete()
                                .then(() => {
                                    res.status(200).send("success");
                                })
                                .catch((error) => {
                                    res.status(500).send("error: " + error);
                                });
                        });
                }
                else {
                    res.status(406).send(usnap.size + " users with that uid!");
                }
            });
    });
});
