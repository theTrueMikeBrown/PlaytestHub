import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { Game } from '../types/game';
import { User } from '../types/user';

@Component({
    selector: 'games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.styles.css']
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
        private business: BusinessService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        if (!this.loginInfoService.getFunnelChoice()) {
            this.router.navigate(['/funnel']);
        }

        this.message = this.route
            .queryParamMap
            .map(params => params.get('message'))
        this.business.getGames().then(g => {
            this.games = g;
        })
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.business.getFeedbackReadyForApprovalByUser(this.user.id).then(f => {
                f.subscribe(feedbacks => {
                    if (feedbacks.length > 0) {
                        this.canModerate = true;
                        this.moderateId = feedbacks[0].id;
                    }
                });
            });
            this.business.getPlaytestByUserId(this.user.id).then(p => {
                p.subscribe(playtest => {
                    if (playtest) {
                        this.business.getUserFeedbackForGame(this.user.id, playtest.gameId).then(f => {
                            f.subscribe(feedback => {
                                if (feedback && !feedback.submitted) {
                                    this.playtesting = true;
                                    this.feedbackId = feedback.id;
                                }
                            });
                        });
                    }
                });
            });
            this.business.getMessages(this.user.uid).then(m => m.subscribe(messages => {
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

    logout(): void {
        this.loginInfoService.logout();
    }
}