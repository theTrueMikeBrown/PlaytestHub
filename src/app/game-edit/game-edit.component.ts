import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { User } from '../types/user';
import { Game } from '../types/game';

@Component({
    selector: 'game-edit',
    templateUrl: './game-edit.component.html',
    styleUrls: ['./game-edit.styles.css']
})
export class GameEditComponent implements OnInit {
    game: Game;
    message: Subject<string>;
    messageActive: string;
    saving: boolean = false;
    user: User;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private business: BusinessService,
        private loginInfoService: LoginInfoService) { }
    
    saveGame(): void {
        this.saving = true;
        this.business.updateGame(this.game, this.user.uid, (response) => {
            this.saving = false;
            this.message.next("Saved!");
            this.messageActive = "message";
        });
    }

    onChange(): void {
        this.message.next("");
        this.messageActive = "";
    }

    ngOnInit(): void {
        this.route.paramMap
            .switchMap((params: ParamMap) => this.business.getGame(params.get('id')))
            .subscribe(g => g.subscribe(game => {
                this.game = game;
            }));
        this.message = new Subject<string>();
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
        });
    }
}
