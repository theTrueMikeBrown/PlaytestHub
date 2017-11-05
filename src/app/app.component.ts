import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseUISignInSuccess } from 'firebaseui-angular';
import { User } from 'firebase';

import { LoginInfoService } from './services/loginInfo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    loggedIn: boolean = false;

    constructor(private afAuth: AngularFireAuth, private loginInfoService: LoginInfoService) {
    }

    signIn(data: User) {
        if (data != null) {
            this.loginInfoService.setLoginInfo({
                displayName: data.displayName,
                uid: data.uid,
                email: data.email,
                photoUrl: data.photoURL,
                id: null,
                isModerator: false,
                isAdmin: false,
                points: 0,
            });
            this.loggedIn = true;
        }
    }

    ngOnInit(): void {
        this.afAuth.authState.subscribe(d => this.signIn(d));
    }

    logout() {
        this.afAuth.auth.signOut();
        location.reload();
    }

    successCallback(data: FirebaseUISignInSuccess) {
        this.signIn(data.currentUser);
    }
}
