import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import "rxjs/add/operator/map";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';

import { Game } from '../types/game';
import { User } from '../types/user';
import { Message } from '../types/message';
import { Playtest } from '../types/playtest';
import { Feedback } from '../types/feedback';

@Injectable()
export class DbService {
    readonly addGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/addGame";
    readonly updateGameUrl = "https://us-central1-playtesthub.cloudfunctions.net/updateGame";
    readonly addPlaytestUrl = "https://us-central1-playtesthub.cloudfunctions.net/addPlaytest";
    readonly saveUserUrl = "https://us-central1-playtesthub.cloudfunctions.net/saveUser";
    readonly updateUserUrl = "https://us-central1-playtesthub.cloudfunctions.net/updateUser";
    readonly saveFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/saveFeedback";
    readonly rejectFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/rejectFeedback";
    readonly submitFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/submitFeedback";
    readonly approveFeedbackUrl = "https://us-central1-playtesthub.cloudfunctions.net/approveFeedback";
    readonly applyPointUrl = "https://us-central1-playtesthub.cloudfunctions.net/applyPoints";
    readonly sendMessageUrl = "https://us-central1-playtesthub.cloudfunctions.net/sendMessage";
    readonly markMessageReadUrl = "https://us-central1-playtesthub.cloudfunctions.net/markMessageRead";
    readonly deleteMessageUrl = "https://us-central1-playtesthub.cloudfunctions.net/deleteMessage";
    readonly dailyCleanupUrl = "https://us-central1-playtesthub.cloudfunctions.net/dailyCleanup";

    readonly getUserByIdUrl = "https://us-central1-playtesthub.cloudfunctions.net/getUserById";
    readonly getUserBySecretIdUrl = "https://us-central1-playtesthub.cloudfunctions.net/getUserBySecretId";

    constructor(private db: AngularFirestore,
        private http: Http) { }

    dailyCleanup() {
        this.http.post(this.dailyCleanupUrl, {})
            .toPromise()
            .then(response => { })
            .catch((error) => { debugger });
    }

    getGame(id: string): Promise<Observable<Game>> {
        let game = this.db.doc<Game>('games/' + id);
        return Promise.resolve(game.valueChanges());
    }

    getFeedback(id: string): Promise<Observable<Feedback>> {
        let feedback = this.db.doc<Feedback>('feedback/' + id);
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
                .orderBy('createDate', 'asc')
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

    getUser(id: string): Promise<Observable<User>> {
        let subject: Subject<User> = new Subject;
        this.http.post(this.getUserByIdUrl, id)
            .toPromise()
            .then(response => {
                subject.next(response.json());
            })
            .catch((error) => { debugger });
        return Promise.resolve(subject);
    }

    getUserBySecretId(uid: string): Promise<Observable<User>> {
        let subject: Subject<User> = new Subject;
        this.http.post(this.getUserBySecretIdUrl, uid)
            .toPromise()
            .then(response => {
                let user: User = response.json();
                user.uid = uid;
                subject.next(user);
            })
            .catch((error) => {
                subject.next(null);
            });
        return Promise.resolve(subject);
    }

    getFeedbackReadyForApproval(): Promise<Observable<Feedback[]>> {
        let itemsList = this.db.collection<Feedback>('feedback', ref =>
            ref.where('submitted', '==', true)
                .where('approved', '==', false)
                .orderBy('submitDate', 'asc'));
        return Promise.resolve(itemsList.valueChanges());
    }

    getFeedbackForGame(gameId: string): Promise<Observable<Feedback[]>> {
        let itemsList = this.db.collection<Feedback>('feedback', ref =>
            ref.where('gameId', '==', gameId)
                .where('approved', '==', true).orderBy('submitDate', 'desc')
            //        .orderBy("approvalDate")
        );
        return Promise.resolve(itemsList.valueChanges());
    }

    getFeedbackReadyForApprovalByUser(userId: string): Promise<Observable<Feedback[]>> {
        let subject: Subject<Feedback[]> = new Subject;
        this.db.collection<Feedback>('feedback', ref =>
            ref.where('submitted', '==', true)
                .where('approved', '==', false)).valueChanges().subscribe(feedbacks => {
                    this.db.doc<User>('users/' + userId).valueChanges().subscribe(user => {
                        if (user.isModerator) {
                            let returnFeedbacks: Feedback[] = [];
                            for (let i: number = 0; i < feedbacks.length; i++) {
                                (feedback => {
                                    if (feedback.userId != userId) {
                                        returnFeedbacks.push(feedback);
                                    }
                                })(feedbacks[i]);
                            }
                            subject.next(returnFeedbacks);
                        } else {
                            this.db.collection<Game>('games', ref =>
                                ref.where('owner', '==', userId)).valueChanges().subscribe(games => {
                                    let returnFeedbacks: Feedback[] = [];
                                    for (let i: number = 0; i < feedbacks.length; i++) {
                                        (feedback => {
                                            let game: Game = games.find(game => feedback.gameId === game.id);
                                            if (game && game.owner == userId && feedback.userId != userId) {
                                                returnFeedbacks.push(feedback);
                                            }
                                        })(feedbacks[i]);
                                    }
                                    subject.next(returnFeedbacks);
                                });
                        }
                    });
                });
        return Promise.resolve(subject);
    }

    getMessages(uid: string): Promise<Observable<Message[]>> {
        let subject: Subject<Message[]> = new Subject;

        let list = this.db
            .collection<User>("users", ref =>
                ref.where('uid', '==', uid))
            .valueChanges()
            .subscribe(list => {
                if (list && list[0]) {
                    var id = list[0].id;

                    let itemsList = this.db.collection<Message>('messages', ref =>
                        ref.where('recipient', '==', id).orderBy('sentDate', "desc"));
                    itemsList.valueChanges().subscribe(m => {
                        subject.next(m);
                    });
                }
                else {
                    subject.next(null);
                }
            });

        return Promise.resolve(subject);
    }

    getSentMessages(uid: string): Promise<Observable<Message[]>> {
        let itemsList = this.db.collection<Message>('messages', ref =>
            ref.where('sender', '==', uid));
        return Promise.resolve(itemsList.valueChanges());
    }

    addPlaytest(playtest: Playtest, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.addPlaytestUrl, { playtest: playtest, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    updateGame(game: Game, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.updateGameUrl, { game: game, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    addGame(game: Game, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.addGameUrl, { game: game, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    saveUser(user: User, successCallback?: (r: Response) => void) {
        this.http.post(this.saveUserUrl, user)
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    updateUser(user: User, successCallback?: (r: Response) => void) {
        this.http.post(this.updateUserUrl, user)
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    saveFeedback(feedback: Feedback, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.saveFeedbackUrl, { feedback: feedback, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    submitFeedback(feedback: Feedback, uid: string, successCallback?: (r: Response) => void): void {
        this.http.post(this.submitFeedbackUrl, { feedback: feedback, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    rejectFeedback(feedback: Feedback, reason: string, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.rejectFeedbackUrl, { feedback: feedback, uid: uid, reason: reason })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    approveFeedback(feedback: Feedback, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.approveFeedbackUrl, { feedback: feedback, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    applyPoints(gameId: string, points: number, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.applyPointUrl, { gameId: gameId, points: points, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    sendMessage(message: Message, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.sendMessageUrl, { message: message, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    markMessageRead(id: string, isRead: boolean, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.markMessageReadUrl, { id: id, isRead: isRead, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }

    deleteMessage(id: string, uid: string, successCallback?: (r: Response) => void) {
        this.http.post(this.deleteMessageUrl, { id: id, uid: uid })
            .toPromise()
            .then(response => {
                if (successCallback) {
                    successCallback(response);
                }
            })
            .catch((error) => { debugger });
    }
}
