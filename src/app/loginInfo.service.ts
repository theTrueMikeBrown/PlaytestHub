import { Injectable } from '@angular/core';

@Injectable()
export class LoginInfoService {
    loginInfo: LoginInfo;

    constructor() { }

    getLoginInfo(): LoginInfo {
        return this.loginInfo;
    }

    setLoginInfo(loginInfo: LoginInfo) {
        this.LoginInfo = loginInfo;
    }
}