import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';

import { LoginInfo } from './loginInfo';
import { Game } from './game';
import { GameService } from './game.service';

@Component({
    selector: 'game-detail',
    templateUrl: './game-detail.component.html',
    styleUrls: ['./game-detail.styles.css']
})
export class GameDetailComponent implements OnInit {
    game: any;
    owner: any;
    loginInfo: LoginInfo;

    constructor(
        private gameService: GameService,
        private route: ActivatedRoute,
        private location: Location,
        private loginInfoService: LoginInfoService) {
    }

    playTestGame(): void {

    }

    deleteGame(): void {
        this.game.inactive = true;
        this.game.id = this.game.$key;
        this.gameService.updateGame(this.game);
    }

    undeleteGame(): void {
        this.game.inactive = false;
        this.game.id = this.game.$key;
        this.gameService.updateGame(this.game);
    }

    ngOnInit(): void {
        this.loginInfo = this.loginInfoService.getLoginInfo();
        this.route.paramMap
            .switchMap((params: ParamMap) => this.gameService.getGame(params.get('id')))
            .subscribe(g => g.subscribe(game => {
                this.game = game;                
            }));
    }
}