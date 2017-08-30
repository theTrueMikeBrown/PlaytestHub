import { Component, OnInit  } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { Game } from './game';
import { GameService } from './game.service';

@Component({
    selector: 'add-game',
    templateUrl: './add-game.component.html',
    styleUrls: ['./add-game.styles.css']
})
export class AddGameComponent implements OnInit {
    game: Game = new Game();
    constructor(private gameService: GameService, private router: Router, private loginInfoService: LoginInfoService) {
    }

    saveGame() {
        this.gameService.saveGame(this.game);

        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Game Saved Successfully!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }

    ngOnInit(): void {
        let loginInfo = this.loginInfoService.getLoginInfo();
        this.game.owner = loginInfo.uid;
        this.game.ownerName = loginInfo.displayName;
        this.game.priority = 0;
    }
}
