import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { LoginInfo } from './loginInfo';
import { GameService } from './game.service';

@Component({
    selector: 'users-profile',
    templateUrl: './users-profile.component.html',
    styleUrls: ['./users-profile.styles.css']
})
export class UsersProfileComponent implements OnInit {
    profile: any;
    Object: any;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private gameService: GameService) {

        this.Object = Object;
    }

    ngOnInit(): void {
        this.route.paramMap
            .switchMap((params: ParamMap) => this.gameService.getUser(params.get('id')))
            .subscribe(g => g.subscribe(profile => {
                this.profile = profile;
            }))
    }
}
