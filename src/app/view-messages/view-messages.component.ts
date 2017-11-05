import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { Message } from '../types/message';
import { User } from '../types/user';

@Component({
    selector: 'view-messages',
    templateUrl: './view-messages.component.html',
    styleUrls: ['./view-messages.styles.css']
})
export class ViewMessagesComponent implements OnInit {
    messages: Observable<Message[]>;
    message: Message;
    senderName: string;
    user: User;

    constructor(private business: BusinessService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.business.getMessages(user.uid).then(messages => this.messages = messages);
        });
    }

    openMessage(message: Message): void {
        this.message = message;
        this.senderName = "PlaytestHub";
        if (this.message.sender) {
            this.business.getUser(this.message.sender).then(u => u.subscribe(user => {
                if (user) {
                    this.senderName = user.displayName;
                }
            }));
        }
        this.business.markMessageRead(this.message.id, true);
    }

    delete(): void {
        let id = this.message.id;
        this.message = null;
        this.business.deleteMessage(id, (r) => { });
    }
}
