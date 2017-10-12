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
            queryParams: { 'message': 'Feedback Approved!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }
        
    ngOnInit(): void {
        let loginInfo: LoginInfo = this.loginInfoService.getLoginInfo();

        this.route.paramMap
            .switchMap((params: ParamMap) => this.dbService.getFeedback(params.get('id')))
            .subscribe(f => f.subscribe(feedback => {
                this.feedback = feedback;
            }));        
    }
}
