import { Component, OnInit, Input } from '@angular/core';
import { FirebaseUISignInSuccess } from 'firebaseui-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';

import { User } from 'firebase';
import { LoginInfoService } from '../services/loginInfo.service';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
    constructor(
        private afAuth: AngularFireAuth,
        private router: Router,
        private loginInfoService: LoginInfoService
    ) {
    }

    ngOnInit() {
    }

    successCallback(data: FirebaseUISignInSuccess) {
        this.loginInfoService.signIn(data.currentUser, () => {
            this.router.navigate(['/games']);
        });
    }
}
