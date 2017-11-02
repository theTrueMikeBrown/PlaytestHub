import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { LoginInfoService } from './loginInfo.service';
import { DbService } from './db.service';
import { Game } from './game';
import { User } from './user';

@Component({
    selector: 'games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.styles.css'],
    providers: [DbService]
})
export class GamesListComponent {
    games: Observable<Game[]>;
    message: Observable<string>;
    user: User;
    playtesting: boolean = false;
    feedbackId: string;
    canModerate: boolean = false;
    moderateId: string;
    unreadMessages: boolean;

    constructor(
        private dbService: DbService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.message = this.route
            .queryParamMap
            .map(params => params.get('message'))
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.dbService.getGames().then(g => {
                this.games = g;
            })
            this.dbService.getFeedbackReadyForApprovalByUser(this.user.id).then(f => {
                f.subscribe(feedbacks => {
                    if (feedbacks.length > 0) {
                        this.canModerate = true;
                        this.moderateId = feedbacks[0].id;
                    }
                });
            });
            this.dbService.getPlaytestByUserId(this.user.id).then(p => {
                p.subscribe(playtest => {
                    if (playtest) {
                        this.playtesting = true;
                        this.dbService.getUserFeedbackForGame(this.user.id, playtest.gameId).then(f => {
                            f.subscribe(feedback => {
                                if (feedback) {
                                    this.feedbackId = feedback.id;
                                }
                            });
                        });
                    }
                });
            });
            this.dbService.getMessages(this.user.uid).then(m => m.subscribe(messages => {
                if (messages && messages.length > 0 && messages.find(message => !message.isRead)) {
                    this.unreadMessages = true;
                }
            }));
        });
    }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }

    moderate(): void {
        this.router.navigate(['/feedback', this.moderateId]);
    }
}