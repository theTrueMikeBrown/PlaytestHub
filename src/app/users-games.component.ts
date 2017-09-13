import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { Game } from './game';
import { DbService } from './db.service';

@Component({
    selector: 'users-games',
    templateUrl: './users-games.component.html',
    styleUrls: ['./users-games.styles.css']
})
export class UsersGamesComponent implements OnInit {
    games: FirebaseListObservable<any[]>;
    constructor(private dbService: DbService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        let loginInfo = this.loginInfoService.getLoginInfo();

        this.route.paramMap
            .switchMap((params: ParamMap) => this.dbService.getGamesByUser(params.get('id')))
            .subscribe(g => this.games = g);
    }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }
}
