import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Game } from './game';

@Injectable()
export class GameService {
    constructor(private db: AngularFireDatabase) { }

    getGame(id: number): Promise<any> {
        return Promise.resolve(this.db.list('/games', {
            query: {
                orderByChild: 'id',
                equalTo: id
            }
        }));
    }

    getGames(): Promise<FirebaseListObservable<any[]>> {
        return Promise.resolve(this.db.list('/games', {
            query: {
                orderByChild: 'priority',
                limitToLast: 10
            }
        }));
    }

    setGames() {
        debugger;
        let game1: Game =
            {
                id: 11,
                name: "Sorry",
                owner: "Milton Bradley",
                minPlayerCount: 2,
                maxPlayerCount: 4,
                minTimeInMinutes: 120,
                maxTimeInMinutes: 240,
                components: "board, 57 cards, 16 pawns in 4 colors",
                description: "this is parcheesi without the dice.",
                rulesUrl: "http://www.google.com?rules=sorry",
                pnpUrl: "http://www.google.com?pnp=sorry",
                priority: 0,
				inactive: false,
            }
        let game2: Game =
            {
                id: 12,
                name: "Risk",
                owner: "Milton Bradley",
                minPlayerCount: 2,
                maxPlayerCount: 6,
                minTimeInMinutes: 240,
                maxTimeInMinutes: 480,
                components: "board, 57 cards, a bunch of pieces, 4d6",
                description: "this is a strategy game with a lot of dice.",
                rulesUrl: "http://www.google.com?rules=risk",
                pnpUrl: "http://www.google.com?pnp=risk",
                priority: 0,
				inactive: false,
            };

        let itemObservable = this.db.list('/games');
        itemObservable.push(game1);
        itemObservable.push(game2);
    }
}