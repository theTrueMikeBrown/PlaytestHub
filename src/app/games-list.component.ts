import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute  } from '@angular/router';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { LoginInfoService } from './loginInfo.service';
import { DbService } from './db.service';
import { Game } from './game';
import { LoginInfo } from './loginInfo';

@Component({
    selector: 'games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.styles.css'],
    providers: [DbService]
})
export class GamesListComponent {
    games: Observable<Game[]>;
    message: Observable<string>;
    loginInfo: LoginInfo;
    playtesting: boolean = false;

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
        this.loginInfo = this.loginInfoService.getLoginInfo();
        this.dbService.getGames().then(g => {
            this.games = g;
        })
        this.dbService.getPlaytestByUserId(this.loginInfo.id).then(p => {
            p.subscribe(playtest => {
                if (playtest) {
                    this.playtesting = true;
                }
            });
        });
    }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }

    moderate(): void {
        let id: string = "VVmmaaus3xceRiWgLZbT";
        this.router.navigate(['/feedback', id]);
    }
}