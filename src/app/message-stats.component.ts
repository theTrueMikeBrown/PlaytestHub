import { Component, Input, OnInit } from '@angular/core';
import { Message } from './message';
import { BusinessService } from './business.service';
import { User } from './user';

@Component({
    selector: '[message-stats]',
    templateUrl: './message-stats.component.html',
    styleUrls: ['./message-stats.styles.css']
})
export class MessageStatsComponent implements OnInit {
    @Input() message: Message;
    senderName: string;

    constructor(private business: BusinessService) { }

    ngOnInit(): void {
        this.senderName = "PlaytestHub";
        if (this.message.sender) {
            this.business.getUser(this.message.sender).then(u => u.subscribe(user => {
                if (user) {
                    this.senderName = user.displayName;
                }
            }));
        }
    }
}