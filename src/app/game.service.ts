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

    saveGame(game: Game) {
        let itemObservable = this.db.list('/games');
        itemObservable.push(game);
    }
}
