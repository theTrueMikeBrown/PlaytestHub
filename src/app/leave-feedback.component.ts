import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';
import { FirebaseListObservable } from 'angularfire2/database';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';
import { Game } from './game';
import { Feedback } from './feedback';

@Component({
    selector: 'leave-feedback',
    templateUrl: './leave-feedback.component.html',
    styleUrls: ['./leave-feedback.styles.css']
})
export class LeaveFeedbackComponent implements OnInit {
    feedback: Feedback = {
        feelings: ['', '', ''],
        categorization: ['', '', ''],
        general: ['', ''],
        length: ['', '', ''],
        art: ['', ''],
        rules: ['', '', ''],
        mechanics: ['', '', ''],
        final: ['', '', '', ''],
        userId: '',
        gameId: '',
        id: ''
    };
    gameName: string = '';

    constructor(private router: Router,
        private route: ActivatedRoute,
        private dbService: DbService,
        private loginInfoService: LoginInfoService) {
    }

    saveFeedback(): void {
        this.dbService.saveFeedback(this.feedback);
    }

    submitFeedback(): void {
        let errors: string[] = this.dbService.submitFeedback(this.feedback);
        if (errors.length === 0) {
            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': 'Game Submitted Successfully!' },
            };
            this.router.navigate(['/games'], navigationExtras);
        }
        alert("Errors: " + errors.join(", "));
    }

    ngOnInit(): void {
        let loginInfo: LoginInfo = this.loginInfoService.getLoginInfo();

        this.dbService.getUserBySecretId(loginInfo.uid).then(u => {
            u.subscribe(user => {
                if (user) {
                    this.feedback.userId = user.id;

                    this.dbService.getPlaytestByUserId(user.id)
                        .then(playtest => {
                            playtest.subscribe(playtest => {
                                if (playtest) {
                                    this.feedback.gameId = playtest.gameId;
                                    this.gameName = playtest.gameName;
                                }
                            });
                        });
                }
            });
        });
    }
}
