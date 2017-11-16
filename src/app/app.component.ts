import { Component, OnInit } from '@angular/core';
import { FirebaseUISignInSuccess } from 'firebaseui-angular';
import { User } from 'firebase';

import { LoginInfoService } from './services/loginInfo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(private loginInfoService: LoginInfoService) {
    }

    ngOnInit(): void {
        this.loginInfoService.init();
    }
}
