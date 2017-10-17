﻿import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import "rxjs/add/operator/map";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';

import { Game } from './game';
import { User } from './user';
import { Playtest } from './playtest';
import { LoginInfo } from './loginInfo';
import { Feedback } from './feedback';

@Injectable()
export class DbService {
    readonly addGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/addGame";
    readonly updateGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/updateGame";
    readonly addPlaytestUrl = "https://us-central1-playtesthub.cloudfunctions.net/addPlaytest";
    readonly saveUserUrl = "https://us-central1-playtesthub.cloudfunctions.net/saveUser";
    readonly saveFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/saveFeedback";
    readonly submitFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/submitFeedback";
    readonly approveFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/approveFeedback";

    constructor(private db: AngularFirestore,
        private http: Http) { }

    getGame(key: string): Promise<Observable<Game>> {
        let game = this.db.doc<Game>('games/' + key);
        return Promise.resolve(game.valueChanges());
    }

    getFeedback(key: string): Promise<Observable<Feedback>> {
        let feedback = this.db.doc<Feedback>('feedback/' + key);
        return Promise.resolve(feedback.valueChanges());
    }

    getUserFeedbackForGame(userId: string, gameId: string): Promise<Observable<Feedback>> {
        let subject: Subject<Feedback> = new Subject;
        let list = this.db
            .collection<Feedback>("feedback", ref =>
                ref.where('gameId', '==', gameId).where('userId', '==', userId))
            .valueChanges()
            .subscribe(list => {
                if (list && list[0]) {
                    subject.next(list[0]);
                }
                else {
                    subject.next(null);
                }
            });
        return Promise.resolve(subject);
    }

    getGames(): Promise<Observable<Game[]>> {
        let itemsList = this.db.collection<Game>('games', ref =>
            ref.where('active', '==', true)
                .orderBy('priority', 'desc')
                .limit(10));
        return Promise.resolve(itemsList.valueChanges());
    }

    getPlaytestByUserId(id: string): Promise<Observable<Playtest>> {
        let playtest = this.db.doc<Playtest>('playtests/' + id);
        return Promise.resolve(playtest.valueChanges());
    }

    getGamesByUser(id: string): Promise<Observable<Game[]>> {
        let itemsList = this.db.collection<Game>('games', ref =>
            ref.where('owner', '==', id));
        return Promise.resolve(itemsList.valueChanges());
    }

    addPlaytest(playtest: Playtest, successCallback?: (r: Response) => void) {
        this.http.post(this.addPlaytestUrl, playtest)
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => {
                debugger;
            });
    }

    private appendHttp(url: string): string {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }
        return url;
    };

    addGame(game: Game, successCallback?: (r: Response) => void) {
        game.pnpUrl = this.appendHttp(game.pnpUrl);
        game.rulesUrl = this.appendHttp(game.rulesUrl);

        this.http.post(this.addGameUrl, game)
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => {
                debugger;
            });
    }

    updateGame(game: Game, successCallback?: (r: Response) => void) {
        game.pnpUrl = this.appendHttp(game.pnpUrl);
        game.rulesUrl = this.appendHttp(game.rulesUrl);

        this.http.post(this.updateGameUrl, game)
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => {
                debugger;
            });
    }


    getUser(key: string): Promise<Observable<User>> {
        let user: Observable<User> = this.db.doc<User>('users/' + key).valueChanges();
        return Promise.resolve(user);
    }

    getUserBySecretId(key: string): Promise<Observable<User>> {
        let subject: Subject<User> = new Subject;
        let list = this.db
            .collection<User>("users", ref =>
                ref.where('uid', '==', key))
            .valueChanges()
            .subscribe(list => {
                if (list && list[0]) {
                    subject.next(list[0]);
                }
                else {
                    subject.next(null);
                }
            });
        return Promise.resolve(subject);
    }

    saveUser(loginInfo: LoginInfo, successCallback?: (r: Response) => void) {
        this.http.post(this.saveUserUrl, loginInfo)
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => {
                debugger;
            });
    }

    getFeedbackReadyForApproval(): Promise<Observable<Feedback[]>> {
        let itemsList = this.db.collection<Feedback>('feedback', ref =>
            ref.where('submitted', '==', true)
               .where('approved', '==', false));
        return Promise.resolve(itemsList.valueChanges());
    }

    saveFeedback(feedback: Feedback, successCallback?: (r: Response) => void) {
        this.http.post(this.saveFeedbackUrl, feedback)
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => {
                debugger;
            });
    }

    submitFeedback(feedback: Feedback): string[] {
        let errors: string[] = this.validate(feedback);
        if (errors.length === 0) {
            this.http.post(this.submitFeedbackUrl, feedback)
                .toPromise()
                .then(response => response)
                .catch((error) => {
                    debugger;
                });
            return [];
        }
        return errors;
    }

    private validate(feedback: Feedback): string[] {
        var validateFeedback = (f: Feedback, name: string, length: number) => {
            let array: string[] = f[name];
            if (!array) { return name + " doesn't exist."; }
            if (array.length !== length) { return name + " doesn't have enough data."; }
            for (var i = 0; i < length; i++) {
                if (!array[i]) {
                    return "Question " + (i + 1) + " of " + name + " is not filled out.";
                }
            }
            return null;
        };

        return [
            validateFeedback(feedback, 'feelings', 3),
            validateFeedback(feedback, 'categorization', 3),
            validateFeedback(feedback, 'general', 2),
            validateFeedback(feedback, 'length', 3),
            validateFeedback(feedback, 'art', 2),
            validateFeedback(feedback, 'rules', 3),
            validateFeedback(feedback, 'mechanics', 3),
            validateFeedback(feedback, 'final', 4)
        ].filter(n => n);
    }

    approveFeedback(feedback: Feedback, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.approveFeedbackUrl, { feedback: feedback, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => {
                debugger;
            });
    }
}
