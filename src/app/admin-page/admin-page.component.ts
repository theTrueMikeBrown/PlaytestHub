import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { User } from '../types/user';
import { Message } from '../types/message';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
    user: User;
    messageRecipient: string;
    messageSubject: string;
    messageText: string;

    constructor(private router: Router,
        private business: BusinessService,
        private loginInfoService: LoginInfoService) { }

    ngOnInit() {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
            if (!this.user.isAdmin) {
                let navigationExtras: NavigationExtras = {
                    queryParams: { 'message': 'You are not an admin.' },
                };
                this.router.navigate(['/games'], navigationExtras);
            }
        });
    }

    runDailyCleanup() {
        this.business.dailyCleanup();
    }

    sendMessage() {
        let message: Message = {
            id: "",
            isRead: false,
            recipient: this.messageRecipient,
            sender: this.user.id,
            sentDate: new Date(),
            subject: this.messageSubject,
            text: this.messageText
        };
        this.business.sendMessage(message, this.user.uid, (r) => {
            this.messageRecipient = "";
            this.messageSubject = "";
            this.messageText = "";
        });
    }
}
