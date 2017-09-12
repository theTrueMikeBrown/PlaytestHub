import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { LoginInfo } from './loginInfo';
import { GameService } from './game.service';

@Injectable()
export class LoginInfoService {
    loginInfo: LoginInfo;

    constructor(private db: AngularFireDatabase,
                private gameService: GameService) { }

    getLoginInfo(): LoginInfo {
        return this.loginInfo;
    }

    setLoginInfo(loginInfo: LoginInfo) {
        //check to see if it exists
        // if it does - get the guid to use as a public key
        // if it doesn't - make a guid and store it
        this.loginInfo = loginInfo;

        var userPromise = this.gameService.getUserBySecretId(loginInfo.uid);
        userPromise.then((userList) => {

            userList.subscribe(user => {
                if (user[0]) {
                    this.loginInfo.id = user[0].id;
                }
                else {
                    var uuidv4 = (): string => {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                            return v.toString(16);
                        });
                    }

                    loginInfo.id = uuidv4();
                    this.gameService.saveUser(loginInfo);
                }
            });
        });
    }
}
