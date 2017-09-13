﻿import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import "rxjs/add/operator/map";
import { Http } from '@angular/http';

import { Game } from './game';
import { LoginInfo } from './loginInfo';

@Injectable()
export class DbService {
    readonly addGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/addGame";
    readonly updateGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/updateGame";
    readonly addPlaytestUrl = "https://us-central1-playtesthub.cloudfunctions.net/addPlaytest";
    readonly saveUserUrl = "https://us-central1-playtesthub.cloudfunctions.net/saveUser";

    constructor(private db: AngularFireDatabase,
        private http: Http) { }

    getGame(key: string): Promise<any> {
        let game = this.db.object('/games/' + key);
        return Promise.resolve(game);
    }

    getGames(): Promise<FirebaseListObservable<any[]>> {
        var itemsList = this.db.list('/games', {
            query: {
                orderByChild: 'priority',
                limitToLast: 10
            }
        })
            .map((array) => array.filter(i => !i.inactive).reverse()) as FirebaseListObservable<any[]>;
        return Promise.resolve(itemsList);
    }

    getPlaytestsByUserId(id: string): Promise<FirebaseListObservable<any[]>> {
        var itemsList =
            this.db.list('/playtests', {
                query: {
                    orderByChild: 'id',
                    equalTo: id
                }
            })
            .map((array) => {
                return array.map((item) => {
                    item.dateString = new Date(item.started).toDateString();
                    item.gameName = "loading...";

                    var gamePromise = this.getGame(item.gameId);
                    gamePromise.then(g => {
                        g.subscribe(game => {
                            item.gameName = game.name;
                        });                        
                    });                    
                    return item;
                });
            }) as FirebaseListObservable<any[]>;
        return Promise.resolve(itemsList);
    }

    getGamesByUser(id: string): Promise<FirebaseListObservable<any[]>> {
        let itemsList = this.db.list('/games', {
            query: {
                orderByChild: 'owner',
                equalTo: id
            }
        }).map((array) => array.reverse()) as FirebaseListObservable<any[]>;
        return Promise.resolve(itemsList);
    }

    addPlaytest(gameId: string, id: string) {
        this.http.post(this.addPlaytestUrl, { gameId: gameId, id: id })
            .toPromise()
            .then(response => response)
            .catch((error) => {
                debugger;
            });
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


    getUser(key: string): Promise<any> {
        let user: FirebaseObjectObservable<any> = this.db.object('/users/' + key);
        return Promise.resolve(user);
    }

    getUserBySecretId(key: string): Promise<FirebaseListObservable<any>> {
        let list = this.db //.object('/users/' + key);
            .list("/users/", {
                query: {
                    orderByChild: "uid",
                    equalTo: key
                }
            });

        return Promise.resolve(list);
    }

    saveUser(loginInfo: LoginInfo) {
        this.http.post(this.saveUserUrl, loginInfo)
            .toPromise()
            .then(response => response)
            .catch((error) => {
                debugger;
            });
    }
}