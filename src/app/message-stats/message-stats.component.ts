import { Component, Input, OnInit } from '@angular/core';

import { BusinessService } from '../services/business.service';

import { Message } from '../types/message';
import { User } from '../types/user';

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