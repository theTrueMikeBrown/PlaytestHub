import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';

@Injectable()
export class LoginInfoService {
    loginInfoObs: Subject<LoginInfo> = new Subject<LoginInfo>();
    loginInfo: LoginInfo;

    constructor(private db: AngularFirestore,
        private dbService: DbService) {}

    getLoginInfo(): Promise<LoginInfo> {
        if (this.loginInfo) {
            return Promise.resolve(this.loginInfo);
        }
        return this.loginInfoObs.toPromise();
    }

    setLoginInfo(loginInfo: LoginInfo) {
        var userPromise = this.dbService.getUserBySecretId(loginInfo.uid);
        userPromise.then(u => {
            u.subscribe(user => {
                if (user) {
                    loginInfo.id = user.id;
                    loginInfo.isModerator = user.isModerator;
                }
                else {
                    var uuidv4 = (): string => {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    }

                    loginInfo.id = uuidv4();
                    this.dbService.saveUser(loginInfo);
                }
                this.loginInfo = loginInfo;
                this.loginInfoObs.next(loginInfo);
                this.loginInfoObs.complete();
            });
        });
    }
}
