import { Component, Input, OnInit } from '@angular/core';
import { Feedback } from './feedback';
import { DbService } from './db.service';
import { User } from './user';

@Component({
    selector: 'feedback-stats',
    templateUrl: './feedback-stats.component.html',
    styleUrls: ['./feedback-stats.styles.css']
})
export class FeedbackStatsComponent implements OnInit {
    @Input() feedback: Feedback;
    leaverName: string;

    constructor(private dbService: DbService) { }

    ngOnInit(): void {
        this.dbService.getUser(this.feedback.userId).then(u => u.subscribe(user => {
            this.leaverName = user.displayName;
        }));
    }
}