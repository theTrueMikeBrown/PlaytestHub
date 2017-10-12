import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

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
        id: '',
        approved: false,
        submitted: false
    };
    gameName: string = '';
    reviewing: boolean = false;
    editing: boolean = false;

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
        else {
            alert("Errors: " + errors.join(", "));
        }
    }

    approveFeedback(): void {
        this.feedback.approved = true;
        this.dbService.saveFeedback(this.feedback);

        //TODO: make it give points to the leaver, and make the leaver's playtest disappear.

        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Feedback Approved!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }

    rejectFeedback(): void {
        this.feedback.approved = true;
        this.feedback.submitted = false;
        this.dbService.saveFeedback(this.feedback);

        //todo: make it send a message to the feedback leaver telling them why it was rejected (this.rejectReason).

        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Feedback Rejected!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }

    ngOnInit(): void {
        let loginInfo: LoginInfo = this.loginInfoService.getLoginInfo();

        this.route.paramMap.subscribe(p => {
            if (p.has('id')) {
                this.dbService.getFeedback(p.get('id')).then(f => f.subscribe(feedback => {
                    this.feedback = feedback;
                }));
            }
            else {
                this.dbService.getUserBySecretId(loginInfo.uid).then(u => u.subscribe(user => {
                    if (user) {
                        this.feedback.userId = user.id;
                        this.dbService.getPlaytestByUserId(user.id).then(p => p.subscribe(playtest => {
                            if (playtest) {
                                this.feedback.gameId = playtest.gameId;
                                this.gameName = playtest.gameName;
                                this.editing = true;
                            }
                        }));
                    }
                }));
            }
        });
    }
}
