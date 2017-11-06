import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { User } from '../types/user';
import { Game } from '../types/game';
import { Feedback } from '../types/feedback';

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
    owner: boolean = false;
    pendingApproval: boolean = false;
    user: User;
    rejectReason: string;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private business: BusinessService,
        private loginInfoService: LoginInfoService) {
    }

    saveFeedback(): void {
        this.business.saveFeedback(this.feedback);
    }

    submitFeedback(): void {
        let errors: string[] = this.business.submitFeedback(this.feedback);
        if (errors.length === 0) {
            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': 'Feedback Submitted Successfully!' },
            };
            this.router.navigate(['/games'], navigationExtras);
        }
        else {
            alert("Errors: " + errors.join(", "));
        }
    }

    approveFeedback(): void {
        this.feedback.approved = true;
        this.business.approveFeedback(this.feedback, this.user.uid);
        
        let navigationExtras: NavigationExtras = {
            queryParams: { 'message': 'Feedback Approved!' },
        };
        this.router.navigate(['/games'], navigationExtras);
    }

    rejectFeedback(): void {
        this.business.rejectFeedback(this.feedback, this.rejectReason, this.user.uid);

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
                    this.business.getFeedback(p.get('id')).then(f => f.subscribe(feedback => {
                        if (feedback) {
                            this.feedback = feedback;
                            this.reviewing = feedback.userId != this.user.id && feedback.submitted && !feedback.approved && this.user.isModerator;
                            this.editing = feedback.userId == this.user.id && !feedback.submitted && !feedback.approved;
                            this.pendingApproval = feedback.submitted && !feedback.approved;
                            this.business.getGame(feedback.gameId).then(g => {
                                g.subscribe(game => {
                                    this.gameName = game.name;
                                    this.owner = game.owner == this.user.id;
                                });
                            });
                        }
                    }));
                }
            });
        });
    }
}
