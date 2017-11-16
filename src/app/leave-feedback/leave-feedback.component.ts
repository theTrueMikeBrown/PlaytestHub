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
    game: Game;
    leaver: User;
    reviewing: boolean = false;
    editing: boolean = false;
    owner: boolean = false;
    pendingApproval: boolean = false;
    user: User;
    rejectReason: string;
    saving: boolean = false;
    approving: boolean = false;
    submitting: boolean = false;
    rejecting: boolean = false;
    redact: boolean = true;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private business: BusinessService,
        private loginInfoService: LoginInfoService) {
    }

    saveFeedback(): void {
        this.saving = true;
        this.business.saveFeedback(this.feedback, this.user.uid, (r) => {
            this.saving = false;
        });
    }

    submitFeedback(): void {
        this.submitting = true;
        let errors: string[] = this.business.submitFeedback(this.feedback, this.user.uid, (r) => {
            this.submitting = false;
            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': 'Feedback Submitted Successfully!' },
            };
            this.router.navigate(['/games'], navigationExtras);
        });
        if (errors.length !== 0) {
            this.submitting = false;
            alert("Errors: " + errors.join(", "));
        }
    }

    approveFeedback(): void {
        this.approving = true;
        this.feedback.approved = true;
        this.business.approveFeedback(this.feedback, this.user.uid, (r) => {
            this.approving = false;
            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': 'Feedback Approved!' },
            };
            this.router.navigate(['/games'], navigationExtras);
        });
    }

    rejectFeedback(): void {
        this.rejecting = true;
        this.business.rejectFeedback(this.feedback, this.rejectReason, this.user.uid, (r) => {
            this.rejecting = false;

            let navigationExtras: NavigationExtras = {
                queryParams: { 'message': 'Feedback Rejected!' },
            };
            this.router.navigate(['/games'], navigationExtras);
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(p => {
            if (p.has('id')) {
                this.business.getFeedback(p.get('id')).then(f => f.subscribe(feedback => {
                    if (feedback) {
                        this.feedback = feedback;
                        this.pendingApproval = feedback.submitted && !feedback.approved;
                        this.loginInfoService.getLoginInfo().then(user => {
                            this.user = user;
                            this.reviewing = feedback.userId !== this.user.id && this.pendingApproval && this.user.isModerator;
                            this.editing = feedback.userId === this.user.id && !feedback.submitted && !feedback.approved;
                            this.business.getGame(feedback.gameId).then(g => {
                                g.subscribe(game => {
                                    this.owner = game.owner === this.user.id;
                                    if (this.owner || feedback.userId === this.user.id || this.user.isModerator) {
                                        this.redact = false;
                                    }
                                });
                            });
                        });
                        this.business.getGame(feedback.gameId).then(g => {
                            g.subscribe(game => {
                                this.game = game;
                            });
                        });
                        this.business.getUser(feedback.userId).then(u => {
                            u.subscribe(user => {
                                this.leaver = user;
                            });
                        });
                    }
                }));
            }
        });
    }
}
