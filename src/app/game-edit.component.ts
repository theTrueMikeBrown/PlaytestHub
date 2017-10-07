import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';
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
        private dbService: DbService) { }
    
    saveGame(): void {
        this.dbService.updateGame(this.game);
    }

    ngOnInit(): void {
        this.route.paramMap
            .switchMap((params: ParamMap) => this.dbService.getGame(params.get('id')))
            .subscribe(g => g.subscribe(game => {
                this.game = game;
            }))
    }
}
