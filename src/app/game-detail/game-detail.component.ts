import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { User } from '../types/user';
import { Game } from '../types/game';
import { Playtest } from '../types/playtest';
import { Feedback } from '../types/feedback';

@Component({
    selector: 'game-detail',
    templateUrl: './game-detail.component.html',
    styleUrls: ['./game-detail.styles.css']
})
export class GameDetailComponent implements OnInit {
    game: Game;
    owner: User;
    user: User;
    alreadyPlaytesting: boolean = false;
    alreadyPlaytestingSomethingElse: boolean = false;
    alreadyPlaytestedVersion: boolean = false;
    feedbackId: string;
    feedbackExists: boolean;
    playtesting: boolean = false;
    deleting: boolean = false;
    undeleting: boolean = false;

    constructor(
        private business: BusinessService,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private loginInfoService: LoginInfoService) {
    }

    playTestGame(): void {
        //TODO: change this confirm into a styled thing.
        var r = !this.alreadyPlaytestingSomethingElse || confirm("You are already playtesting a different game! Playtest this game instead?");
        if (r == true) {
            this.playtesting = true;
            let playtest: Playtest = {
                gameId: this.game.id,
                id: this.user.id,
                gameName: this.game.name,
                startedDate: new Date()
            };
            this.business.addPlaytest(
                playtest, this.user, this.game, () => {
                    this.playtesting = false;
                    let navigationExtras: NavigationExtras = {
                        queryParams: { 'message': 'You are now playtesting ' + this.game.name + '.' },
                    };
                    this.router.navigate(['/games'], navigationExtras);
                });
        }
    }

    deleteGame(): void {
        this.deleting = true;
        this.game.active = false;
        this.business.updateGame(this.game, this.user.uid, (r) => {
            this.deleting = false;
        });
    }

    undeleteGame(): void {
        this.undeleting = true;
        this.game.active = true;
        this.business.updateGame(this.game, this.user.uid, (r) => {
            this.undeleting = false;
        });
    }

    ngOnInit(): void {
        this.route.paramMap
            .switchMap((params: ParamMap) => this.business.getGame(params.get('id')))
            .subscribe(g => g.subscribe(game => {
                this.game = game;
                this.loginInfoService.getLoginInfo().then(user => {
                    this.user = user;
                    this.business.getUserFeedbackForGame(this.user.id, game.id).then(f => {
                        f.subscribe(feedback => {
                            if (feedback) {
                                if (!feedback.submitted) {
                                    this.feedbackId = feedback.id;

                                    this.business.getPlaytestByUserId(this.user.id).then(p => {
                                        p.subscribe((playtest) => {
                                            if (playtest && game.id === playtest.gameId) {
                                                this.alreadyPlaytesting = true;
                                            }
                                            else {
                                                this.alreadyPlaytesting = false;
                                            }
                                        });
                                    });
                                } else if (feedback.version === this.game.version) {
                                    this.alreadyPlaytestedVersion = true;
                                }
                            }
                        });
                    });

                    this.business.getPlaytestByUserId(this.user.id).then(p => {
                        p.subscribe((playtest) => {
                            if (playtest && game.id !== playtest.gameId) {
                                this.alreadyPlaytestingSomethingElse = true;
                            }
                        });
                    });

                });
                this.business.getFeedbackForGame(game.id).then(f => f.subscribe(feedbacks => {
                    this.feedbackExists = feedbacks.length > 0;
                }));
                this.business.getUser(game.owner).then(o => o.subscribe(owner => {
                    this.owner = owner;
                }));
            }));
    }
}
