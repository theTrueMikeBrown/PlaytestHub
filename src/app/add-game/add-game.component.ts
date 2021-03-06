﻿import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';
import { Game } from '../types/game';
import { User } from '../types/user';

@Component({
    selector: 'add-game',
    templateUrl: './add-game.component.html',
    styleUrls: ['./add-game.styles.css']
})
export class AddGameComponent implements OnInit {
    game: Game = new Game();
    user: User;
    saving: boolean = false;

    constructor(private business: BusinessService, private router: Router, private loginInfoService: LoginInfoService) {
    }

    addGame(): void {
        this.saving = true;
        this.business.addGame(this.game, this.user.uid, (r) => {
            this.saving = false;
            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': 'Game Saved Successfully!' },
            };
            this.router.navigate(['/games'], navigationExtras);
        });
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.game.owner = user.id;
            this.game.priority = 0;
            this.game.active = true;
        });
    }
}
