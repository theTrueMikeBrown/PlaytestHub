import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { Game } from './game';
import { GameService } from './game.service';

@Component({
    selector: 'add-game',
    templateUrl: './add-game.component.html',
    styleUrls: ['./add-game.styles.css']
})
export class AddGameComponent {
    game: Game = new Game();
    constructor(private gameService: GameService, private router: Router) { }

    saveGame() {
        //save the game before navigating away

        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Game Saved Successfully!' },
            fragment: 'anchor'
        };
        this.router.navigate(['/games'], navigationExtras);
    }
}