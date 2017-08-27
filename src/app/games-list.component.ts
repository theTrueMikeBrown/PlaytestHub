import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { FirebaseListObservable } from 'angularfire2/database';

import { GameService } from './game.service';
import { Game } from './game';

@Component({
    selector: 'games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.styles.css'],
    providers: [GameService]
})
export class GamesListComponent {
    games: FirebaseListObservable<any[]>;

    constructor(
        private gameService: GameService,
        private router: Router) { }

    ngOnInit(): void {
        this.gameService.getGames().then(g => this.games = g)
    }

    gotoDetail(id: number): void {
        this.router.navigate(['/detail', id]);
    }
}