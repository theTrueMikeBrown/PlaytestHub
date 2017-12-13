import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { Game } from '../types/game';
import { User } from '../types/user';
import { Playtest } from '../types/playtest';

@Component({
    selector: 'users-profile',
    templateUrl: './users-profile.component.html',
    styleUrls: ['./users-profile.styles.css']
})
export class UsersProfileComponent implements OnInit {
    user: User;
    profile: User;
    isUsersProfile: boolean;
    playtest: Playtest;
    feedbackId: string;
    games: Observable<Game[]>;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private business: BusinessService,
        private loginInfoService: LoginInfoService) { }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            let id: string = params.get('id');
            this.business
                .getUser(id)
                .then(p => {
                    p.subscribe(profile => {
                        this.profile = profile;
                    });
                });

            this.loginInfoService.getLoginInfo().then(user => {
                this.user = user;
                if (this.user) {
                    this.business
                        .getUser(id)
                        .then(p => {
                            p.subscribe(profile => {
                                this.isUsersProfile = this.profile && this.profile.id === this.user.id;
                            });
                        });
                    this.business.getGamesByUser(id, user.id).then(g => this.games = g);

                    this.business
                        .getPlaytestByUserId(id)
                        .then(p => {
                            p.subscribe(playtest => {
                                if (playtest) {
                                    this.playtest = playtest;
                                    this.business.getUserFeedbackForGame(this.user.id, playtest.gameId).then(f => {
                                        f.subscribe(feedback => {
                                            if (feedback) {
                                                this.feedbackId = feedback.id;
                                            }
                                        });
                                    });
                                }
                            });
                        });
                }
            });
        });
    }
}
