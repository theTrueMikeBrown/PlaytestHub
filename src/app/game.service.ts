import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import "rxjs/add/operator/map";
import { Http } from '@angular/http';

import { Game } from './game';

@Injectable()
export class GameService {
    readonly addGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/addGame";
    readonly updateGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/updateGame";

    constructor(private db: AngularFireDatabase,
                private http: Http) { }

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
        })
            .map((array) => array.filter(i=>!i.inactive).reverse()) as FirebaseListObservable<any[]>;
        return Promise.resolve(itemsList);
    }

    getGamesByUser(uid: string): Promise<FirebaseListObservable<any[]>> {
        var itemsList = this.db.list('/games', {
            query: {
                orderByChild: 'owner',
                equalTo: uid
            }
        }).map((array) => array.reverse()) as FirebaseListObservable<any[]>;
        return Promise.resolve(itemsList);
    }

    addGame(game: Game) {
        this.http.post(this.addGameUrl, game)
            .toPromise()
            .then(response => response)
            .catch((error) => {
                debugger;
            });
    }

    updateGame(game: Game) {
        this.http.post(this.updateGameUrl, game)
            .toPromise()
            .then(response => response)
            .catch((error) => {
                debugger;
            });
    }
}
