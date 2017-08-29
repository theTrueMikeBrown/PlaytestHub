﻿import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { Game } from './game';
import { GameService } from './game.service';

@Component({
    selector: 'add-game',
    templateUrl: './add-game.component.html',
    styleUrls: ['./add-game.styles.css'],
    providers: [LoginInfoService]
})
export class AddGameComponent {
    game: Game = new Game();
    constructor(private gameService: GameService, private router: Router, private loginInfoService: LoginInfoService) {
    }

    saveGame() {
        //set this
        this.game.id = 1;
        this.game.owner = this.loginInfoService.getLoginInfo().uid;

        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Game Saved Successfully!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }
}