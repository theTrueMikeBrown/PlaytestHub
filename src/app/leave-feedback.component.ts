import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { LoginInfoService } from './loginInfo.service';

import { User } from './user';
import { DbService } from './db.service';
import { Game } from './game';
import { Feedback } from './feedback';

@Component({
    selector: 'leave-feedback',
    templateUrl: './leave-feedback.component.html',
    styleUrls: ['./leave-feedback.styles.css']
})
export class LeaveFeedbackComponent implements OnInit {
    feedback: Feedback;
    gameName: string = '';
    reviewing: boolean = false;
    editing: boolean = false;
    user: User;

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
        //This will require adding in message sending and receiving.

        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Feedback Rejected!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.route.paramMap.subscribe(p => {
                if (p.has('id')) {
                    this.dbService.getFeedback(p.get('id')).then(f => f.subscribe(feedback => {
                        this.feedback = feedback;
                        this.reviewing = feedback.userId != this.user.id && feedback.submitted && this.user.isModerator;
                        this.editing = feedback.userId == this.user.id;
                }));
                }
            });
        });
    }
}
