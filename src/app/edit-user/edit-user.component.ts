import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { LoginInfoService } from '../services/loginInfo.service';
import { BusinessService } from '../services/business.service';

import { User } from '../types/user';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
    profile: User;
    message: Subject<string>;
    messageActive: string;
    saving: boolean = false;

    constructor(
        private loginInfoService: LoginInfoService,
        private business: BusinessService) { }

    ngOnInit() {
        this.message = new Subject<string>();

        this.loginInfoService.getLoginInfo().then(user => {
            this.profile = user;
            this.business
                .getUser(user.id)
                .then(p => {
                    p.subscribe(profile => {
                        this.profile = profile;
                    });
                });
        });
    }

    saveUser(): void {
        this.saving = true;
        this.business.updateUser(this.profile, (response) => {
            this.saving = false;
            this.message.next("Saved!");
            this.messageActive = "message";
        });
    }

    onChange(): void {
        this.message.next("");
        this.messageActive = "";
    }
}
