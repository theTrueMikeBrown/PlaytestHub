import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { LoginInfoService } from './loginInfo.service';

import { Game } from './game';
import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';

@Component({
    selector: 'users-games',
    templateUrl: './users-games.component.html',
    styleUrls: ['./users-games.styles.css']
})
export class UsersGamesComponent implements OnInit {
    games: Observable<Game[]>;
    loginInfo: LoginInfo;

    constructor(private dbService: DbService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(loginInfo => {
            this.loginInfo = loginInfo;
        });

        this.route.paramMap
            .switchMap((params: ParamMap) => this.dbService.getGamesByUser(params.get('id')))
            .subscribe(g => this.games = g);
    }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }
}
