import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { User } from './user';
import { DbService } from './db.service';

@Injectable()
export class LoginInfoService {
    userObs: Subject<User> = new Subject<User>();
    user: User;

    constructor(private db: AngularFirestore,
        private dbService: DbService) {}

    getLoginInfo(): Promise<User> {
        if (this.user) {
            return Promise.resolve(this.user);
        }
        return this.userObs.toPromise();
    }

    setLoginInfo(user: User) {
        var userPromise = this.dbService.getUserBySecretId(user.uid);
        userPromise.then(u => {
            u.subscribe(user => {
                if (user) {
                    user.id = user.id;
                    user.isModerator = user.isModerator;
                    user.points = 0;
                }
                else {
                    var uuidv4 = (): string => {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    }

                    user.id = uuidv4();
                    this.dbService.saveUser(user);
                }
                this.user = user;
                this.userObs.next(user);
                this.userObs.complete();
            });
        });
    }
}
