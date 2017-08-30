import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import "rxjs/add/operator/map";

import { Game } from './game';

@Injectable()
export class GameService {
    constructor(private db: AngularFireDatabase) { }

    getGame(key: string): Promise<any> {
        let game = this.db.object('/games/' + key);
        return Promise.resolve(game);
    }

    getUser(key: string): Promise<any> {
        let user = this.db.object('/users/' + key);
        return Promise.resolve(user);
    }

    getGames(): Promise<FirebaseListObservable<any[]>> {
        var itemsList = this.db.list('/games', {
            query: {
                orderByChild: 'priority',
                limitToLast: 10
            }
        }).map((array) => array.reverse()) as FirebaseListObservable<any[]>;
        return Promise.resolve(itemsList);
    }

    saveGame(game: Game) {
        let itemObservable = this.db.list('/games');
        itemObservable.push(game);
    }
}
