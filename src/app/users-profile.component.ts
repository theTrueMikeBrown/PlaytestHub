import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';
import { Observable } from 'rxjs/Observable';

import { User } from './user';
import { Playtest } from './playtest';

@Component({
    selector: 'users-profile',
    templateUrl: './users-profile.component.html',
    styleUrls: ['./users-profile.styles.css']
})
export class UsersProfileComponent implements OnInit {
    loginInfo: LoginInfo;
    profile: User;
    playtest: Playtest;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private dbService: DbService,
        private loginInfoService: LoginInfoService) { }

    ngOnInit(): void {
        this.loginInfo = this.loginInfoService.getLoginInfo();

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
                            playtest.dateString = new Date(playtest.started).toDateString();
                            this.playtest = playtest;
                        });
                    });
                return result;
            }).subscribe(g => { });
    }
}
