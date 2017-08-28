import { Component } from '@angular/core';

import { Game } from './game';
import { GameService } from './game.service';

@Component({
    selector: 'add-game',
    templateUrl: './add-game.component.html',
    styleUrls: ['./add-game.styles.css']
})
export class AddGameComponent {
    game: Game = new Game();
    constructor(private gameService: GameService) { }
}