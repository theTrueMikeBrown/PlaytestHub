import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';
import { Game } from './game';
import { Feedback } from './feedback';

@Component({
    selector: 'review-feedback',
    templateUrl: './review-feedback.component.html',
    styleUrls: ['./review-feedback.styles.css']
})
export class ReviewFeedbackComponent implements OnInit {
    feedback: Feedback;
    gameName: string = '';
    rejectReason: string = '';

    constructor(private router: Router,
        private route: ActivatedRoute,
        private dbService: DbService,
        private loginInfoService: LoginInfoService) {
    }

    approveFeedback(): void {
        //todo:
        this.dbService.saveFeedback(this.feedback);
    }

    rejectFeedback(): void {
        //todo:
        let errors: string[] = this.dbService.submitFeedback(this.feedback);
        if (errors.length === 0) {
            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': 'Game Submitted Successfully!' },
            };
            this.router.navigate(['/games'], navigationExtras);
        }
        else {
            alert("Errors: " + errors.join(", "));
        }
    }

    ngOnInit(): void {
        //todo: load feedback
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
