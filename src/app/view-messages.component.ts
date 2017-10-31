import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { LoginInfoService } from './loginInfo.service';

import { Message } from './message';
import { User } from './user';
import { DbService } from './db.service';

@Component({
    selector: 'view-messages',
    templateUrl: './view-messages.component.html',
    styleUrls: ['./view-messages.styles.css']
})
export class ViewMessagesComponent implements OnInit {
    messages: Observable<Message[]>;
    message: Message;
    user: User;

    constructor(private dbService: DbService,
        private router: Router,
        private route: ActivatedRoute,
        private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            this.dbService.getMessages(user.uid).then(messages => this.messages = messages);
        });
    }

    openMessage(id: string): void {
        this.messages.subscribe((ms) => this.message = ms.find((m) => m.id == id));
    }
}
