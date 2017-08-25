import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { GameService } from './game.service';

import { Game } from './game';

@Component({
    selector: 'games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.styles.css'],
    providers: [GameService]
})
export class GamesListComponent {
    games: Observable<Game[]>;

    constructor(
        private gameService: GameService) { }

    ngOnInit(): void {
        this.gameService.getGames()
            .then(games => this.games = Observable.of<Game[]>(games));        
    }
}