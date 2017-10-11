import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { LoginInfo } from './loginInfo';
import { DbService } from './db.service';

@Injectable()
export class LoginInfoService {
    loginInfo: LoginInfo;

    constructor(private db: AngularFirestore,
        private dbService: DbService) { }

    getLoginInfo(): LoginInfo {
        return this.loginInfo;
    }

    setLoginInfo(loginInfo: LoginInfo) {
        this.loginInfo = loginInfo;

        var userPromise = this.dbService.getUserBySecretId(loginInfo.uid);
        userPromise.then(u => {
            u.subscribe(user => {
                if (user) {
                    this.loginInfo.id = user.id;
                    this.loginInfo.isModerator = user.isModerator;
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
            });
        });
    }
}
