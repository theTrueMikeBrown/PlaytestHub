import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { User } from '../types/user';
import { BusinessService } from '../services/business.service';

@Injectable()
export class LoginInfoService {
    userObs: Subject<User> = new Subject<User>();
    user: User;

    constructor(private db: AngularFirestore,
        private business: BusinessService) {}

    getLoginInfo(): Promise<User> {
        if (this.user) {
            return Promise.resolve(this.user);
        }
        return this.userObs.toPromise();
    }

    setLoginInfo(loginUser: User) {
        var userPromise = this.business.getUserBySecretId(loginUser.uid);
        userPromise.then(u => {
            u.subscribe(user => {
                if (user) {
                    loginUser.id = user.id;
                    loginUser.isModerator = user.isModerator;
                    loginUser.points = user.points;
                }
                else {
                    var uuidv4 = (): string => {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    }

                    loginUser.id = uuidv4();
                    this.business.saveUser(loginUser);
                }
                this.user = loginUser;
                this.userObs.next(loginUser);
                this.userObs.complete();
            });
        });
    }
}
