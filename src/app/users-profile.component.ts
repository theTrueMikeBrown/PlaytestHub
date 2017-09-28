import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'users-profile',
    templateUrl: './users-profile.component.html',
    styleUrls: ['./users-profile.styles.css']
})
export class UsersProfileComponent implements OnInit {
    loginInfo: LoginInfo;
    profile: any;
    playtest: Observable<any>;
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
                    .then(p => this.playtest = p);
                return result;
            }).subscribe(g => { });
    }
}
