import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { Game } from './game';
import { DbService } from './db.service';

@Component({
    selector: 'add-game',
    templateUrl: './add-game.component.html',
    styleUrls: ['./add-game.styles.css']
})
export class AddGameComponent implements OnInit {
    game: Game = new Game();
    constructor(private dbService: DbService, private router: Router, private loginInfoService: LoginInfoService) {
    }

    addGame(): void {
        this.dbService.addGame(this.game);

        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Game Saved Successfully!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(loginInfo => {
            this.game.owner = loginInfo.id;
            this.game.ownerName = loginInfo.displayName;
            this.game.priority = 0;
            this.game.active = true;
        });
    }
}
