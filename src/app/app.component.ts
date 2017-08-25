import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseUISignInSuccess } from 'firebaseui-angular';
import { User } from 'firebase';
import { Game } from './game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    displayName: string;
    uid: string;
    email: string;
    photoURL: string;
    loggedIn: boolean;

    constructor(private afAuth: AngularFireAuth) {
        this.loggedIn = false;
    }

    signIn(data: User) {
        if (data != null) {
            this.displayName = data.displayName;
            this.uid = data.uid;
            this.email = data.email;
            this.photoURL = data.photoURL;
            this.loggedIn = true;
        }
    }

    ngOnInit(): void {
        this.afAuth.authState.subscribe(d => this.signIn(d));
    }

    logout() {
        this.afAuth.auth.signOut();
    }

    successCallback(data: FirebaseUISignInSuccess) {
        console.log(data);
        this.signIn(data.currentUser);
    }
}
