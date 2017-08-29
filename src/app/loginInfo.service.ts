import { Injectable } from '@angular/core';
import { LoginInfo } from './loginInfo';

@Injectable()
export class LoginInfoService {
    loginInfo: LoginInfo;

    constructor() { }

    getLoginInfo(): LoginInfo {
        return this.loginInfo;
    }

    setLoginInfo(loginInfo: LoginInfo) {
        this.loginInfo = loginInfo;
    }
}
