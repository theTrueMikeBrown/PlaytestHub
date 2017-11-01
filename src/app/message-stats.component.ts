import { Component, Input, OnInit } from '@angular/core';
import { Message } from './message';
import { DbService } from './db.service';
import { User } from './user';

@Component({
    selector: '[message-stats]',
    templateUrl: './message-stats.component.html',
    styleUrls: ['./message-stats.styles.css']
})
export class MessageStatsComponent implements OnInit {
    @Input() message: Message;
    senderName: string;

    constructor(private dbService: DbService) { }

    ngOnInit(): void {
        this.senderName = "PlaytestHub";
        if (this.message.sender) {
            this.dbService.getUser(this.message.sender).then(u => u.subscribe(user => {
                if (user) {
                    this.senderName = user.displayName;
                }
            }));
        }
    }
}