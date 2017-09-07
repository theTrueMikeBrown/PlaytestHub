import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { LoginInfo } from './loginInfo';

@Injectable()
export class LoginInfoService {
    loginInfo: LoginInfo;

    constructor(private db: AngularFireDatabase) { }

    getLoginInfo(): LoginInfo {
        return this.loginInfo;
    }

    setLoginInfo(loginInfo: LoginInfo) {
        function uuidv4() : string {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        loginInfo.secretId = uuidv4();
        this.loginInfo = loginInfo;
        let users = this.db.list('/users');
        users.set(loginInfo.uid, loginInfo);
    }
}
