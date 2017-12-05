import { Component, OnInit } from '@angular/core';
import { FirebaseUISignInSuccess } from 'firebaseui-angular';

import { LoginInfoService } from './services/loginInfo.service';
import { User } from './types/user';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    user: User;

    constructor(private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.loginInfoService.init();
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
        });
    }
}
