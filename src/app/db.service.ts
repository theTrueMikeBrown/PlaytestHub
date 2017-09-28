import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import "rxjs/add/operator/map";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';

import { Game } from './game';
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
    readonly approveFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/approvesFeedback";

    constructor(private db: AngularFireDatabase,
        private http: Http) { }

    getGame(key: string): Promise<FirebaseObjectObservable<any>> {
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

    getPlaytestByUserId(id: string): Promise<Observable<any>> {
        let subject: Subject<any> = new Subject;
        var item = this.db.object('/playtests/' + id)
            .subscribe(item => {
                item.dateString = new Date(item.started).toDateString();                
                var gamePromise = this.getGame(item.gameId);
                gamePromise.then(g => {
                    g.subscribe(game => {
                        item.gameName = game.name;
                        subject.next(item);
                    });
                });
            });
        return Promise.resolve(subject);
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

    addPlaytest(playtest: Playtest) {
        this.http.post(this.addPlaytestUrl, playtest)
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


    getUser(key: string): Promise<FirebaseObjectObservable<any>> {
        let user: FirebaseObjectObservable<any> = this.db.object('/users/' + key);
        return Promise.resolve(user);
    }

    getUserBySecretId(key: string): Promise<Observable<any>> {
        let subject: Subject<any> = new Subject;
        let list = this.db
            .list("/users/", {
                query: {
                    orderByChild: "uid",
                    equalTo: key
                }
            })
            .subscribe(list => {
                if (list && list[0]) {
                    subject.next(list[0]);
                }
            });

        return Promise.resolve(subject);
    }

    saveUser(loginInfo: LoginInfo) {
        this.http.post(this.saveUserUrl, loginInfo)
            .toPromise()
            .then(response => response)
            .catch((error) => {
                debugger;
            });
    }

    saveFeedback(feedback: Feedback) {
        this.http.post(this.saveFeedbackUrl, feedback)
            .toPromise()
            .then(response => response)
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

    validate(feedback: Feedback): string[] {
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

    approveFeedback(feedback: Feedback, uid: string) {
        this.http.post(this.approveFeedbackUrl, { feedback: feedback, uid: uid })
            .toPromise()
            .then(response => response)
            .catch((error) => {
                debugger;
            });
    }
}
