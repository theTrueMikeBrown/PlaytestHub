import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Game } from './game';

@Component({
    selector: 'games-list',
    templateUrl: './games-list.component.html'
})
export class GamesListComponent {
    games: Observable<Game[]>;
}