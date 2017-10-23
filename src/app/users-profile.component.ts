import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { User } from './user';
import { DbService } from './db.service';
import { Observable } from 'rxjs/Observable';

import { Playtest } from './playtest';

@Component({
    selector: 'users-profile',
    templateUrl: './users-profile.component.html',
    styleUrls: ['./users-profile.styles.css']
})
export class UsersProfileComponent implements OnInit {
    user: User;
    profile: User;
    playtest: Playtest;
    feedbackId: string;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private dbService: DbService,
        private loginInfoService: LoginInfoService) { }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
        });

        this.route.paramMap
            .switchMap((params: ParamMap) => {
                let id: string = params.get('id');
                this.dbService
                    .getUser(id)
                    .then(p => {
                        p.subscribe(profile => {
                            this.profile = profile;
                        });
                    });

                let result = this.dbService
                    .getPlaytestByUserId(id)
                    .then(p => {
                        p.subscribe(playtest => {
                            if (playtest) {
                                playtest.dateString = new Date(playtest.started).toDateString();
                                this.playtest = playtest;
                                this.dbService.getUserFeedbackForGame(this.user.id, playtest.gameId).then(f => {
                                    f.subscribe(feedback => {
                                        this.feedbackId = feedback.id;
                                    });
                                });
                            }
                        });
                    });
                return result;
            }).subscribe(g => { });
    }
}
