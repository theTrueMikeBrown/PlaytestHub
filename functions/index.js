const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp(functions.config().firebase);

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
                    console.log(JSON.stringify(game), JSON.stringify(oldGame));

                    cleanGame.priority = oldGame.priority;
                    if (game.inactive && !oldGame.inactive) {
                        cleanGame.priority -= bigNum;
                    }
                    else if (!game.inactive && oldGame.inactive && oldGame.priority < -(bigNum / 2)) {
                        cleanGame.priority += bigNum;
                    }

                    admin.database().ref('/games/' + game.id)
                        .update(cleanGame)
                        .then((f) => res.status(207).send("success"));
                }
            });
    });
});
