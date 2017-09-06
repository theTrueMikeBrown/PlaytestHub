import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { LoginInfo } from './loginInfo';
import { GameService } from './game.service';
import { Game } from './game';

@Component({
    selector: 'game-edit',
    templateUrl: './game-edit.component.html',
    styleUrls: ['./game-edit.styles.css']
})
export class GameEditComponent implements OnInit {
    game: Game;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private gameService: GameService) { }
    
    saveGame(): void {
        this.gameService.updateGame(this.game);
    }

    ngOnInit(): void {
        this.route.paramMap
            .switchMap((params: ParamMap) => this.gameService.getGame(params.get('id')))
            .subscribe(g => g.subscribe(game => {
                this.game = game;
            }))
    }
}
