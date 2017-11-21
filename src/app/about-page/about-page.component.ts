import { Component, OnInit } from '@angular/core';

import { LoginInfoService } from '../services/loginInfo.service';
import { User } from '../types/user';

@Component({
    selector: 'app-about-page',
    templateUrl: './about-page.component.html',
    styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {
    user: User;

    constructor(private loginInfoService: LoginInfoService) {
    }

    ngOnInit() {
        this.loginInfoService.getLoginInfo().then(user => {
            this.user = user;
        });
    }
}
