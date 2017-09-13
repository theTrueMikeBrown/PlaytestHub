import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';

@Component({
    selector: 'users-profile',
    templateUrl: './users-profile.component.html',
    styleUrls: ['./users-profile.styles.css']
})
export class UsersProfileComponent implements OnInit {
    profile: any;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private dbService: DbService) {}

    ngOnInit(): void {
        this.route.paramMap
            .switchMap((params: ParamMap) => this.dbService.getUser(params.get('id')))
            .subscribe(g => g.subscribe(profile => {
                this.profile = profile;
            }))
    }
}
