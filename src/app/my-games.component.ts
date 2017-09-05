import { Component, OnInit  } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { Game } from './game';
import { GameService } from './game.service';

@Component({
    selector: 'my-games',
    templateUrl: './my-games.component.html',
    styleUrls: ['./my-games.styles.css']
})
export class MyGamesComponent implements OnInit {
    games: FirebaseListObservable<any[]>;
    constructor(private gameService: GameService, private router: Router, private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        let loginInfo = this.loginInfoService.getLoginInfo();
        this.gameService.getGamesByUser(loginInfo.uid).then(g => {
            this.games = g;
        });
    }
}
