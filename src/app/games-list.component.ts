import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute  } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { FirebaseListObservable } from 'angularfire2/database';

import { GameService } from './game.service';
import { Game } from './game';
import { LoginInfo } from './loginInfo';

@Component({
    selector: 'games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.styles.css'],
    providers: [GameService]
})
export class GamesListComponent {
    games: FirebaseListObservable<any[]>;
    message: Observable<string>;
    loginInfo: LoginInfo;

    constructor(
        private gameService: GameService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.message = this.route
            .queryParamMap
            .map(params => params.get('message'))
        this.loginInfo = this.loginInfoService.getLoginInfo();

        this.gameService.getGames().then(g => this.games = g)
    }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }
}