import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AngularFireAuth } from 'angularfire2/auth';
import { User as FBUser } from 'firebase';

import { User } from '../types/user';
import { BusinessService } from '../services/business.service';

@Injectable()
export class LoginInfoService {
    userObs: Subject<User> = new Subject<User>();
    user: User;
    saving: boolean = false;
    loggedIn: boolean = false;

    constructor(private afAuth: AngularFireAuth,
        private db: AngularFirestore,
        private business: BusinessService) { }

    getLoginInfo(): Promise<User> {
        if (this.user) {
            return Promise.resolve(this.user);
        }
        return this.userObs.toPromise();
    }

    init(): void {
        this.afAuth.authState.subscribe(d => this.signIn(d));
    }

    signIn(data: FBUser, successCallback?: () => void) {
        if (data != null) {
            this.setLoginInfo({
                displayName: data.displayName,
                uid: data.uid,
                email: data.email,
                photoUrl: data.photoURL,
                id: null,
                isModerator: false,
                isAdmin: false,
                points: 0,
                joinDate: null,
                personalInfo: "",
                allowsPrivateMessages: true,
                forwardMessages: false
            });
            this.loggedIn = true;
            if (successCallback) {
                successCallback();
            }
        }
    }

    logout() {
        this.user = null;
        this.afAuth.auth.signOut();
        location.reload();
    }

    setLoginInfo(loginUser: User) {
        var userPromise = this.business.getUserBySecretId(loginUser.uid);
        userPromise.then(u => {
            u.subscribe(user => {
                if (user) {
                    loginUser.id = user.id;
                    loginUser.isModerator = user.isModerator;
                    loginUser.isAdmin = user.isAdmin;
                    loginUser.points = user.points;
                    loginUser.displayName = user.displayName;
                    loginUser.photoUrl = user.photoUrl;
                    loginUser.personalInfo = user.personalInfo;
                    this.user = loginUser;
                    this.userObs.next(loginUser);
                    this.userObs.complete();
                }
                else if (!this.saving) {
                    this.saving = true;
                    var uuidv4 = (): string => {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    }

                    loginUser.id = uuidv4();
                    loginUser.joinDate = new Date();
                    this.business.saveUser(loginUser, (r) => {
                        this.saving = false;
                        this.user = loginUser;
                        this.userObs.next(loginUser);
                        this.userObs.complete();
                    });
                }
            });
        });
    }

    getFunnelChoice() : string {
        return localStorage.getItem('phFunnelChoice');
    }
    setFunnelChoice(choice: string) {
        return localStorage.setItem('phFunnelChoice', choice);
    }
}
