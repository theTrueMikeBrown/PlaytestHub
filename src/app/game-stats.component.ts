import { Component, Input } from '@angular/core';
import { Game } from './game';

@Component({
    selector: 'game-stats',
    templateUrl: './game-stats.component.html',
    styleUrls: ['./game-stats.styles.css']
})
export class GameStatsComponent {
    @Input() game: Game;
}