import { Component, Input, OnInit } from '@angular/core';
import { BusinessService } from '../services/business.service';

import { Feedback } from '../types/feedback';
import { User } from '../types/user';

@Component({
    selector: 'feedback-stats',
    templateUrl: './feedback-stats.component.html',
    styleUrls: ['./feedback-stats.styles.css']
})
export class FeedbackStatsComponent implements OnInit {
    @Input() feedback: Feedback;
    leaverName: string;

    constructor(private business: BusinessService) { }

    ngOnInit(): void {
        this.business.getUser(this.feedback.userId).then(u => u.subscribe(user => {
            this.leaverName = user.displayName;
        }));
    }
}