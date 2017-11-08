import { Injectable } from '@angular/core';
import "rxjs/add/operator/map";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';

import { Game } from '../types/game';
import { User } from '../types/user';
import { Message } from '../types/message';
import { Playtest } from '../types/playtest';
import { Feedback } from '../types/feedback';
import { DbService } from './db.service';

@Injectable()
export class BusinessService {

    constructor(private db: DbService) { }

    dailyCleanup() {
        this.db.dailyCleanup();
    }

    getGame(id: string): Promise<Observable<Game>> {
        return this.db.getGame(id);
    }

    getFeedback(id: string): Promise<Observable<Feedback>> {
        return this.db.getFeedback(id);
    }

    getUserFeedbackForGame(userId: string, gameId: string): Promise<Observable<Feedback>> {
        return this.db.getUserFeedbackForGame(userId, gameId);
    }

    getGames(): Promise<Observable<Game[]>> {
        return this.db.getGames();
    }

    getPlaytestByUserId(id: string): Promise<Observable<Playtest>> {
        return this.db.getPlaytestByUserId(id);
    }

    getGamesByUser(id: string): Promise<Observable<Game[]>> {
        return this.db.getGamesByUser(id);
    }

    addPlaytest(playtest: Playtest, user: User, game: Game, successCallback?: (r: Response) => void) {
        this.db.addPlaytest(playtest,
            response => {
                this.saveFeedback({
                    feelings: ['', '', ''], categorization: ['', '', ''], general: ['', ''], length: ['', '', ''],
                    art: ['', ''], rules: ['', '', ''], mechanics: ['', '', ''], final: ['', '', '', ''],
                    userId: user.id, gameId: game.id, id: '', approved: false, submitted: false, submitDate: null
                }, () => {
                    if (successCallback) {
                        successCallback(response);
                    }
                    let message: Message = {
                        id: '',
                        subject: "Congrats!",
                        text: user.displayName + " just signed up to playtest " + game.name + "!\r\n\r\n-PlaytestHub",
                        sender: '',
                        recipient: game.owner,
                        isRead: false,
                        sentDate: new Date(),
                    };
                    this.sendMessage(message);
                });
            });
    }

    private appendHttp(url: string): string {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }
        return url;
    };

    addGame(game: Game, successCallback?: (r: Response) => void) {
        game.createDate = new Date();
        game.pnpUrl = this.appendHttp(game.pnpUrl);
        game.rulesUrl = this.appendHttp(game.rulesUrl);

        this.db.addGame(game, response => {
            if (successCallback) {
                successCallback(response);
            }
            let message: Message = {
                id: '',
                subject: "Hey!",
                text: "You just added a new game to PlaytestHub!\r\n\r\nIn order for it to get to the top of the list and be playtested, you should sign up to playtest other player's games. Select a game <a href=\"/games\">here</a>, and then click \"Playtest\" in the menu. Play the game then click Leave Feedback in the menu. Once your feedback is accepted you can get a point with which to make your game appear higher in the list of games to playtest.\r\n\r\n-PlaytestHub",
                sender: '',
                recipient: game.owner,
                isRead: false,
                sentDate: new Date(),
            };
            this.sendMessage(message);
        });
    }

    updateGame(game: Game, successCallback?: (r: Response) => void) {
        game.pnpUrl = this.appendHttp(game.pnpUrl);
        game.rulesUrl = this.appendHttp(game.rulesUrl);

        this.db.updateGame(game, successCallback);
    }

    getUser(id: string): Promise<Observable<User>> {
        return this.db.getUser(id);
    }

    getUserBySecretId(uid: string): Promise<Observable<User>> {
        return this.db.getUserBySecretId(uid);
    }

    saveUser(user: User, successCallback?: (r: Response) => void) {
        this.db.saveUser(user, successCallback);

        let message: Message = {
            id: '',
            subject: "Welcome to PlaytestHub!",
            text: "Thanks for trying out PlaytestHub!\r\n\r\nIn order to get your games playtested you will need to do 2 things: Add them to the database, and get them to the top of the list so that other users will select them to playtest.\r\n\r\nTo get your games to the top of the list, you need to apply points to them. The easiest way to do this is to earn points by playtesting other user's games.\r\n\r\nIf you have any questions, praise, or feedback, contact theTrueMikeBrown at BGG\r\n\r\n-PlaytestHub",
            sender: '',
            recipient: user.id,
            isRead: false,
            sentDate: new Date(),
        };
        this.sendMessage(message);
    }

    updateUser(user: User, successCallback?: (r: Response) => void) {
        this.db.updateUser(user, successCallback);
    }

    getFeedbackReadyForApproval(): Promise<Observable<Feedback[]>> {
        return this.db.getFeedbackReadyForApproval();
    }

    getFeedbackForGame(gameId: string): Promise<Observable<Feedback[]>> {
        return this.db.getFeedbackForGame(gameId);
    }

    getFeedbackReadyForApprovalByUser(userId: string): Promise<Observable<Feedback[]>> {
        return this.db.getFeedbackReadyForApprovalByUser(userId);
    }

    saveFeedback(feedback: Feedback, successCallback?: (r: Response) => void) {
        this.db.saveFeedback(feedback, successCallback);
    }

    rejectFeedback(feedback: Feedback, reason: string, uid: string, successCallback?: (r: Response) => void) {
        this.db.rejectFeedback(feedback, uid, (response: Response) => {
            if (successCallback) {
                successCallback(response);
            }
            this.getGame(feedback.gameId).then(g => g.subscribe(game => {
                let message: Message = {
                    id: '',
                    subject: "Oh Noes!",
                    text: "Your feedback for " + game.name + " was rejected!\r\n\r\nThe reason that the moderator gave was:\r\n\r\n" + reason + "\r\n\r\nDon't get discouraged! You can fix your feedback <a href=\"/feedback/" + feedback.id + "\">here</a> and resubmit it.\r\n\r\n-PlaytestHub",
                    sender: '',
                    recipient: feedback.userId,
                    isRead: false,
                    sentDate: new Date(),
                };
                this.sendMessage(message);
            }));
        });
    }

    submitFeedback(feedback: Feedback, successCallback?: (r: Response) => void): string[] {
        let errors: string[] = this.validate(feedback);
        if (errors.length === 0) {
            feedback.submitDate = new Date();
            this.db.submitFeedback(feedback, (response => {
                if (successCallback) {
                    successCallback(response);
                }
                this.getGame(feedback.gameId).then(g => g.subscribe(game => {
                    let message: Message = {
                        id: '',
                        subject: "Woot!",
                        text: "Someone left feedback on " + game.name + "!\r\n\r\nClick <a href=\"/feedback/" + feedback.id + "\">here</a> to view it.\r\n\r\n-PlaytestHub",
                        sender: '',
                        recipient: game.owner,
                        isRead: false,
                        sentDate: new Date(),
                    };
                    this.sendMessage(message);
                }));
            }));
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
        this.db.approveFeedback(feedback, uid, (response: Response) => {
            if (successCallback) {
                successCallback(response);
            }
            this.getGame(feedback.gameId).then(g => g.subscribe(game => {
                let message: Message = {
                    id: '',
                    subject: "Yes!",
                    text: "Your feedbaack for " + game.name + " was approved, and you have earned a point!\r\n\r\nClick <a href=\"/applyPoints\">here</a> to increase your game's priority in the list.\r\n\r\n-PlaytestHub",
                    sender: '',
                    recipient: feedback.userId,
                    isRead: false,
                    sentDate: new Date(),
                };
                this.sendMessage(message)

                let message2: Message = {
                    id: '',
                    subject: "Sweet!",
                    text: "Feedback for " + game.name + " was approved.\r\n\r\nClick <a href=\"/feedbackList/" + feedback.id + "\">here</a> to view it.\r\n\r\n-PlaytestHub",
                    sender: '',
                    recipient: game.owner,
                    isRead: false,
                    sentDate: new Date(),
                };
                this.sendMessage(message2)
            }));
        });
        
    }

    applyPoints(gameId: string, points: number, uid: string, successCallback?: (r: Response) => void) {
        this.db.applyPoints(gameId, points, uid, successCallback);
    }

    getMessages(uid: string): Promise<Observable<Message[]>> {
        return this.db.getMessages(uid);
    }

    getSentMessages(uid: string): Promise<Observable<Message[]>> {
        return this.db.getSentMessages(uid);
    }

    sendMessage(message: Message, successCallback?: (r: Response) => void) {
        this.db.sendMessage(message, successCallback);
    }

    markMessageRead(id: string, isRead: boolean, successCallback?: (r: Response) => void) {
        this.db.markMessageRead(id, isRead, successCallback);
    }

    deleteMessage(id: string, successCallback?: (r: Response) => void) {
        this.db.deleteMessage(id, successCallback);
    }
}