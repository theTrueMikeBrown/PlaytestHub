import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, NavigationExtras } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';

import { LoginInfo } from './loginInfo';
import { Game } from './game';
import { User } from './user';
import { DbService } from './db.service';
import { Feedback } from './feedback';

@Component({
    selector: 'game-detail',
    templateUrl: './game-detail.component.html',
    styleUrls: ['./game-detail.styles.css']
})
export class GameDetailComponent implements OnInit {
    game: Game;
    owner: User;
    loginInfo: LoginInfo;
    alreadyPlaytesting: boolean = true;
    feedbackId: string;

    constructor(
        private dbService: DbService,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private loginInfoService: LoginInfoService) {
    }

    playTestGame(): void {
        this.dbService.addPlaytest(
            {
                gameId: this.game.id,
                id: this.loginInfo.id,
                started: 0,
                gameName: this.game.name,
                dateString: null
            }, () => {
                this.dbService.saveFeedback({
                    feelings: ['', '', ''], categorization: ['', '', ''], general: ['', ''], length: ['', '', ''],
                    art: ['', ''], rules: ['', '', ''], mechanics: ['', '', ''], final: ['', '', '', ''],
                    userId: this.loginInfo.id, gameId: this.game.id, id: '', approved: false, submitted: false
                }, () => {
                    let navigationExtras: NavigationExtras = {
                        queryParams: { 'message': 'You are now playtesting ' + this.game.name + '.' },
                    };
                    this.router.navigate(['/games'], navigationExtras);
                });
            });
    }

    deleteGame(): void {
        this.game.active = false;
        this.game.id = this.game.id;
        this.dbService.updateGame(this.game);
    }

    undeleteGame(): void {
        this.game.active = true;
        this.game.id = this.game.id;
        this.dbService.updateGame(this.game);
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(loginInfo => {
            this.loginInfo = loginInfo;
            this.route.paramMap
                .switchMap((params: ParamMap) => this.dbService.getGame(params.get('id')))
                .subscribe(g => g.subscribe(game => {
                    this.game = game;
                    this.dbService.getPlaytestByUserId(this.loginInfo.id).then(p => {
                        p.subscribe((playtest) => {
                            if (playtest && game.id === playtest.gameId) {
                                this.alreadyPlaytesting = true;
                                this.dbService.getUserFeedbackForGame(this.loginInfo.id, game.id).then(f => {
                                    f.subscribe(feedback => {
                                        this.feedbackId = feedback.id;
                                    });
                                });
                            }
                            else {
                                this.alreadyPlaytesting = false;
                            }
                        });
                    });
                }));
        });
    }
}