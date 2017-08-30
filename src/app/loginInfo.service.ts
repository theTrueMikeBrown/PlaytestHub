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
        this.loginInfo = loginInfo;
        let users = this.db.list('/users');
        users.set(loginInfo.uid, loginInfo);
    }
}
