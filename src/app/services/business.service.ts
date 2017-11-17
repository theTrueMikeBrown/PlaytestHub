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

    getUserFeedbackForGameVersion(userId: string, gameId: string, version: number): Promise<Observable<Feedback>> {
        return this.db.getUserFeedbackForGameVersion(userId, gameId, version);
    }

    getGames(): Promise<Observable<Game[]>> {
        return this.db.getGames();
    }

    getPlaytestByUserId(id: string): Promise<Observable<Playtest>> {
        return this.db.getPlaytestByUserId(id);
    }

    getGamesByUser(id: string, userId: string = null): Promise<Observable<Game[]>> {
        if (id === userId) {
            return this.db.getGamesByUser(id);
        }
        return this.db.getActiveGamesByUser(id);
    }

    addPlaytest(playtest: Playtest, user: User, game: Game, successCallback?: (r: Response) => void) {
        this.db.addPlaytest(playtest, user.uid,
            response => {
                if (successCallback) {
                    successCallback(response);
                }
                this.saveFeedback({
                    feelings: ['', '', ''], categorization: ['', '', ''], general: ['', ''], length: ['', '', ''],
                    art: ['', ''], rules: ['', '', ''], mechanics: ['', '', ''], final: ['', '', '', ''],
                    userId: user.id, gameId: game.id, id: '', approved: false, submitted: false, submitDate: null,
                    version: game.version
                }, user.uid);
            });
    }

    private appendHttp(url: string): string {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url;
        }
        return url;
    };

    addGame(game: Game, uid: string, successCallback?: (r: Response) => void) {
        game.createDate = new Date();
        game.pnpUrl = this.appendHttp(game.pnpUrl);
        game.rulesUrl = this.appendHttp(game.rulesUrl);

        this.db.addGame(game, uid, response => {
            if (successCallback) {
                successCallback(response);
            }
        });
    }

    updateGame(game: Game, uid: string, successCallback?: (r: Response) => void) {
        game.pnpUrl = this.appendHttp(game.pnpUrl);
        game.rulesUrl = this.appendHttp(game.rulesUrl);

        this.db.updateGame(game, uid, successCallback);
    }

    getUser(id: string): Promise<Observable<User>> {
        return this.db.getUser(id);
    }

    getUserBySecretId(uid: string): Promise<Observable<User>> {
        return this.db.getUserBySecretId(uid);
    }

    saveUser(user: User, successCallback?: (r: Response) => void) {
        this.db.saveUser(user, successCallback);
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

    saveFeedback(feedback: Feedback, uid: string, successCallback?: (r: Response) => void) {
        this.db.saveFeedback(feedback, uid, successCallback);
    }

    rejectFeedback(feedback: Feedback, reason: string, uid: string, successCallback?: (r: Response) => void) {
        this.db.rejectFeedback(feedback, reason, uid, successCallback);
    }

    submitFeedback(feedback: Feedback, uid: string, successCallback?: (r: Response) => void): string[] {
        let errors: string[] = this.validate(feedback);
        if (errors.length === 0) {
            feedback.submitDate = new Date();
            this.db.submitFeedback(feedback, uid, successCallback);
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
        var results = [
            validateFeedback(feedback, 'feelings', 3),
            validateFeedback(feedback, 'categorization', 3),
            validateFeedback(feedback, 'general', 2),
            validateFeedback(feedback, 'length', 3),
            validateFeedback(feedback, 'art', 2),
            validateFeedback(feedback, 'rules', 3),
            validateFeedback(feedback, 'mechanics', 3),
            validateFeedback(feedback, 'final', 4)
        ].filter(n => n);

        if (results.length > 5) {
            return results;
        }
        return [];
    }

    approveFeedback(feedback: Feedback, uid: string, successCallback?: (r: Response) => void) {
        this.db.approveFeedback(feedback, uid, successCallback);
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

    sendMessage(message: Message, uid: string, successCallback?: (r: Response) => void) {
        this.db.sendMessage(message, uid, successCallback);
    }

    markMessageRead(id: string, uid: string, isRead: boolean, successCallback?: (r: Response) => void) {
        this.db.markMessageRead(id, isRead, uid, successCallback);
    }

    deleteMessage(id: string, uid: string, successCallback?: (r: Response) => void) {
        this.db.deleteMessage(id, uid, successCallback);
    }
}
